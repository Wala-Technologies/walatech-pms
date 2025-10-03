import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('SalesOrdersController (e2e)', () => {
  let app: INestApplication;
  let regularToken: string;
  let superAdminToken: string;
  let createdSalesOrderId: string;
  let testCustomerId: string;

  const passwordCandidates = ['admin123', 'password123', 'walatech-pass'];

  async function attemptLogin(
    email: string,
    password: string,
  ): Promise<{ access_token: string } | null> {
    const domain = email.split('@')[1] || '';
    const sub = domain.split('.')[0];
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .set('Host', `${sub}.localhost`)
      .send({ email, password, subdomain: sub });
    
    if (res.status === HttpStatus.CREATED && res.body?.access_token)
      return res.body;
    return null;
  }

  async function loginWithFallback(email: string): Promise<{ access_token: string }> {
    for (const pwd of passwordCandidates) {
      const result = await attemptLogin(email, pwd);
      if (result) return result;
    }
    throw new Error(
      `Failed to login user ${email} with provided password candidates`,
    );
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    // Login as regular user for walatech tenant
    const regularLoginRes = await loginWithFallback('admin@walatech.com');
    regularToken = regularLoginRes.access_token;

    // Login as super admin
    const superAdminLoginRes = await loginWithFallback('admin@walatech.com');
    superAdminToken = superAdminLoginRes.access_token;

    // Create a test customer for sales orders
    const customerData = {
      customer_name: 'Test Sales Customer',
      email: 'sales@customer.com',
      customer_code: 'SALES001',
      customer_type: 'Company',
      mobile_no: '1234567890',
      billing_address_line_1: '123 Sales St',
      billing_city: 'Sales City',
      billing_country: 'Sales Country'
    };

    const customerRes = await request(app.getHttpServer())
      .post('/api/customers')
      .set('Authorization', `Bearer ${regularToken}`)
      .set('Host', 'walatech.localhost')
      .send(customerData)
      .expect(HttpStatus.CREATED);

    testCustomerId = customerRes.body.id;
    
    if (!testCustomerId) {
      throw new Error('Failed to create test customer - no ID returned');
    }
  });

  afterAll(async () => {
    // Clean up test customer
    try {
      await request(app.getHttpServer())
        .delete(`/api/customers/${testCustomerId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost');
    } catch (e) {
      // Ignore cleanup errors
    }

    await app.close();
  });

  describe('Authentication and Authorization', () => {
    it('should require authentication for sales order endpoints', async () => {
      await request(app.getHttpServer())
        .get('/api/sales-orders')
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should allow authenticated users to access sales order endpoints', async () => {
      await request(app.getHttpServer())
        .get('/api/sales-orders')
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);
    });
  });

  describe('Sales Order CRUD Operations', () => {
    it('should create a new sales order', async () => {
      const salesOrderData = {
        customer_id: testCustomerId,
        customer_name: 'Test Customer',
        order_type: 'Sales',
        transaction_date: new Date().toISOString().split('T')[0],
        delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        currency: 'USD',
        conversion_rate: 1,
        selling_price_list: 'Standard Selling',
        price_list_currency: 'USD',
        plc_conversion_rate: 1,
        ignore_pricing_rule: false,
        items: [
          {
            item_code: 'ITEM001',
            item_name: 'Test Item 1',
            description: 'Test Item Description',
            qty: 10,
            uom: 'Nos',
            rate: 100,
            delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            amount: 1000
          },
          {
            item_code: 'ITEM002',
            item_name: 'Test Item 2',
            description: 'Test Item 2 Description',
            qty: 5,
            uom: 'Nos',
            rate: 200,
            delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            amount: 1000
          }
        ]
      };

      const res = await request(app.getHttpServer())
        .post('/api/sales-orders')
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .send(salesOrderData)
        .expect(HttpStatus.CREATED);

      expect(res.body).toHaveProperty('id');
      expect(res.body.customer_id).toBe(salesOrderData.customer_id);
      expect(res.body.order_type).toBe(salesOrderData.order_type);
      expect(res.body.status).toBe('Draft');
      expect(res.body.docstatus).toBe(0);
      expect(res.body.items).toHaveLength(2);
      expect(Number(res.body.total_qty)).toBe(15);
      expect(Number(res.body.base_total)).toBe(2000);
      
      createdSalesOrderId = res.body.id;
    });

    it('should retrieve all sales orders', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/sales-orders')
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(res.body).toHaveProperty('salesOrders');
      expect(res.body).toHaveProperty('total');
      expect(Array.isArray(res.body.salesOrders)).toBe(true);
      expect(res.body.total).toBeGreaterThan(0);
    });

    it('should retrieve a specific sales order by ID', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/sales-orders/${createdSalesOrderId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(res.body.id).toBe(createdSalesOrderId);
      expect(res.body.customer_id).toBe(testCustomerId);
      expect(res.body.status).toBe('Draft');
      expect(res.body.items).toHaveLength(2);
    });

    it('should update a sales order', async () => {
      const updateData = {
        currency: 'EUR',
        conversion_rate: 0.85,
        items: [
          {
            item_code: 'ITEM001',
            item_name: 'Updated Test Item 1',
            description: 'Updated Test Item Description',
            qty: 15,
            uom: 'Nos',
            rate: 120,
            delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            amount: 1800
          }
        ]
      };

      const res = await request(app.getHttpServer())
        .patch(`/api/sales-orders/${createdSalesOrderId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .send(updateData)
        .expect(HttpStatus.OK);

      expect(res.body.currency).toBe(updateData.currency);
      expect(res.body.conversion_rate).toBe(updateData.conversion_rate);
      expect(res.body.items).toHaveLength(1);
      expect(res.body.total_qty).toBe(15);
      expect(res.body.total).toBe(1800);
    });

    it('should delete a sales order', async () => {
      await request(app.getHttpServer())
        .delete(`/api/sales-orders/${createdSalesOrderId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.NO_CONTENT);

      // Verify sales order is deleted
      await request(app.getHttpServer())
        .get(`/api/sales-orders/${createdSalesOrderId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('Sales Order Search and Filtering', () => {
    let searchTestSalesOrderId: string;

    beforeAll(async () => {
      // Create a sales order for search tests
      const salesOrderData = {
        customer_id: testCustomerId,
        customer_name: 'Test Customer',
        order_type: 'Sales',
        transaction_date: new Date().toISOString().split('T')[0],
        delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        currency: 'USD',
        conversion_rate: 1,
        selling_price_list: 'Standard Selling',
        price_list_currency: 'USD',
        plc_conversion_rate: 1,
        ignore_pricing_rule: false,
        items: [
          {
            item_code: 'SEARCH001',
            item_name: 'Searchable Item',
            description: 'Searchable Item Description',
            qty: 1,
            uom: 'Nos',
            rate: 500,
            delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            amount: 500
          }
        ]
      };

      const res = await request(app.getHttpServer())
        .post('/api/sales-orders')
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .send(salesOrderData);

      searchTestSalesOrderId = res.body.id;
    });

    afterAll(async () => {
      // Clean up search test sales order
      try {
        await request(app.getHttpServer())
          .delete(`/api/sales-orders/${searchTestSalesOrderId}`)
          .set('Authorization', `Bearer ${regularToken}`)
          .set('Host', 'walatech.localhost');
      } catch (e) {
        // Ignore cleanup errors
      }
    });

    it('should filter sales orders by status', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/sales-orders?status=Draft')
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(res.body.salesOrders).toBeDefined();
      res.body.salesOrders.forEach(order => {
        expect(order.status).toBe('Draft');
      });
    });

    it('should filter sales orders by order type', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/sales-orders?order_type=Sales')
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(res.body.salesOrders).toBeDefined();
      res.body.salesOrders.forEach(order => {
        expect(order.order_type).toBe('Sales');
      });
    });

    it('should filter sales orders by customer', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/sales-orders?customer_id=${testCustomerId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(res.body.salesOrders).toBeDefined();
      res.body.salesOrders.forEach(order => {
        expect(order.customer_id).toBe(testCustomerId);
      });
    });

    it('should search sales orders with pagination', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/sales-orders?page=1&limit=10')
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(res.body).toHaveProperty('salesOrders');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('limit');
      expect(res.body.salesOrders.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Sales Order Statistics', () => {
    it('should retrieve sales order statistics', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/sales-orders/stats')
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('draft');
      expect(res.body).toHaveProperty('submitted');
      expect(res.body).toHaveProperty('cancelled');
      expect(res.body).toHaveProperty('closed');
      expect(res.body).toHaveProperty('onHold');
      expect(res.body).toHaveProperty('totalValue');
      expect(res.body).toHaveProperty('averageValue');
    });
  });

  describe('Tenant Isolation', () => {
    it('should only return sales orders for the current tenant', async () => {
      // Get sales orders for walatech tenant
      const walatechRes = await request(app.getHttpServer())
        .get('/api/sales-orders')
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      // All sales orders should belong to the same tenant (UUID format)
      walatechRes.body.salesOrders.forEach(order => {
        expect(order.tenant_id).toBe('550e8400-e29b-41d4-a716-446655440000');
      });
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent sales order', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer())
        .get(`/api/sales-orders/${nonExistentId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return 400 for invalid sales order data', async () => {
      const invalidData = {
        // Missing required fields like customer_id, customer_name, transaction_date, delivery_date, items
        order_type: 'Sales'
      };

      await request(app.getHttpServer())
        .post('/api/sales-orders')
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .send(invalidData)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 404 for invalid customer ID', async () => {
      const invalidCustomerData = {
        customer_id: 'invalid-customer-id',
        customer_name: 'Invalid Customer',
        order_type: 'Sales',
        transaction_date: new Date().toISOString().split('T')[0],
        delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        currency: 'USD',
        conversion_rate: 1,
        items: [
          {
            item_code: 'ITEM001',
            item_name: 'Test Item',
            qty: 1,
            rate: 100,
            delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }
        ]
      };

      await request(app.getHttpServer())
        .post('/api/sales-orders')
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .send(invalidCustomerData)
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});