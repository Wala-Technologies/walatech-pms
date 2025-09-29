import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('SalesOrdersWorkflow (e2e)', () => {
  let app: INestApplication;
  let regularToken: string;
  let superAdminToken: string;
  let testCustomerId: string;
  let workflowTestSalesOrderId: string;

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

  async function createTestSalesOrder(): Promise<string> {
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
          item_code: 'WORKFLOW001',
          item_name: 'Workflow Test Item',
          description: 'Workflow Test Item Description',
          qty: 5,
          uom: 'Nos',
          rate: 100,
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

    return res.body.id;
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
      customer_name: 'Workflow Test Customer',
      email: 'workflow@customer.com',
      customer_code: 'WORKFLOW001',
      customer_type: 'Company',
      mobile_no: '1234567890',
      billing_address_line_1: '123 Workflow St',
      billing_city: 'Workflow City',
      billing_country: 'Workflow Country'
    };

    const customerRes = await request(app.getHttpServer())
      .post('/api/customers')
      .set('Authorization', `Bearer ${regularToken}`)
      .set('Host', 'walatech.localhost')
      .send(customerData);

    testCustomerId = customerRes.body.id;
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

  describe('Sales Order Workflow - Submit', () => {
    beforeEach(async () => {
      workflowTestSalesOrderId = await createTestSalesOrder();
    });

    afterEach(async () => {
      // Clean up test sales order
      try {
        await request(app.getHttpServer())
          .delete(`/api/sales-orders/${workflowTestSalesOrderId}`)
          .set('Authorization', `Bearer ${regularToken}`)
          .set('Host', 'walatech.localhost');
      } catch (e) {
        // Ignore cleanup errors
      }
    });

    it('should submit a draft sales order', async () => {
      // Verify initial status is Draft
      const initialRes = await request(app.getHttpServer())
        .get(`/api/sales-orders/${workflowTestSalesOrderId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(initialRes.body.status).toBe('Draft');
      expect(initialRes.body.docstatus).toBe(0);

      // Submit the sales order
      const submitRes = await request(app.getHttpServer())
        .post(`/api/sales-orders/${workflowTestSalesOrderId}/submit`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(submitRes.body.status).toBe('To Deliver and Bill');
      expect(submitRes.body.docstatus).toBe(1);
    });

    it('should not allow submitting an already submitted sales order', async () => {
      // Submit the sales order first
      await request(app.getHttpServer())
        .post(`/api/sales-orders/${workflowTestSalesOrderId}/submit`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      // Try to submit again
      await request(app.getHttpServer())
        .post(`/api/sales-orders/${workflowTestSalesOrderId}/submit`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should not allow editing a submitted sales order', async () => {
      // Submit the sales order
      await request(app.getHttpServer())
        .post(`/api/sales-orders/${workflowTestSalesOrderId}/submit`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      // Try to update the submitted sales order
      const updateData = {
        currency: 'EUR',
        conversion_rate: 0.85
      };

      await request(app.getHttpServer())
        .patch(`/api/sales-orders/${workflowTestSalesOrderId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .send(updateData)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('Sales Order Workflow - Cancel', () => {
    beforeEach(async () => {
      workflowTestSalesOrderId = await createTestSalesOrder();
    });

    afterEach(async () => {
      // Clean up test sales order
      try {
        await request(app.getHttpServer())
          .delete(`/api/sales-orders/${workflowTestSalesOrderId}`)
          .set('Authorization', `Bearer ${regularToken}`)
          .set('Host', 'walatech.localhost');
      } catch (e) {
        // Ignore cleanup errors
      }
    });

    it('should cancel a draft sales order', async () => {
      const cancelRes = await request(app.getHttpServer())
        .post(`/api/sales-orders/${workflowTestSalesOrderId}/cancel`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(cancelRes.body.status).toBe('Cancelled');
      expect(cancelRes.body.docstatus).toBe(2);
    });

    it('should cancel a submitted sales order', async () => {
      // Submit the sales order first
      await request(app.getHttpServer())
        .post(`/api/sales-orders/${workflowTestSalesOrderId}/submit`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      // Cancel the submitted sales order
      const cancelRes = await request(app.getHttpServer())
        .post(`/api/sales-orders/${workflowTestSalesOrderId}/cancel`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(cancelRes.body.status).toBe('Cancelled');
      expect(cancelRes.body.docstatus).toBe(2);
    });

    it('should not allow cancelling an already cancelled sales order', async () => {
      // Cancel the sales order first
      await request(app.getHttpServer())
        .post(`/api/sales-orders/${workflowTestSalesOrderId}/cancel`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      // Try to cancel again
      await request(app.getHttpServer())
        .post(`/api/sales-orders/${workflowTestSalesOrderId}/cancel`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('Sales Order Workflow - Hold and Resume', () => {
    beforeEach(async () => {
      workflowTestSalesOrderId = await createTestSalesOrder();
      // Submit the sales order to enable hold/resume
      await request(app.getHttpServer())
        .post(`/api/sales-orders/${workflowTestSalesOrderId}/submit`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);
    });

    afterEach(async () => {
      // Clean up test sales order
      try {
        await request(app.getHttpServer())
          .delete(`/api/sales-orders/${workflowTestSalesOrderId}`)
          .set('Authorization', `Bearer ${regularToken}`)
          .set('Host', 'walatech.localhost');
      } catch (e) {
        // Ignore cleanup errors
      }
    });

    it('should put a submitted sales order on hold', async () => {
      const holdRes = await request(app.getHttpServer())
        .post(`/api/sales-orders/${workflowTestSalesOrderId}/hold`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(holdRes.body.status).toBe('On Hold');
      expect(holdRes.body.docstatus).toBe(1);
    });

    it('should resume a sales order from hold', async () => {
      // Put on hold first
      await request(app.getHttpServer())
        .post(`/api/sales-orders/${workflowTestSalesOrderId}/hold`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      // Resume from hold
      const resumeRes = await request(app.getHttpServer())
        .post(`/api/sales-orders/${workflowTestSalesOrderId}/resume`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(resumeRes.body.status).toBe('To Deliver and Bill');
      expect(resumeRes.body.docstatus).toBe(1);
    });

    it('should not allow holding a draft sales order', async () => {
      // Create a new draft sales order
      const draftOrderId = await createTestSalesOrder();

      await request(app.getHttpServer())
        .post(`/api/sales-orders/${draftOrderId}/hold`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.BAD_REQUEST);

      // Clean up
      try {
        await request(app.getHttpServer())
          .delete(`/api/sales-orders/${draftOrderId}`)
          .set('Authorization', `Bearer ${regularToken}`)
          .set('Host', 'walatech.localhost');
      } catch (e) {
        // Ignore cleanup errors
      }
    });

    it('should not allow resuming a sales order that is not on hold', async () => {
      await request(app.getHttpServer())
        .post(`/api/sales-orders/${workflowTestSalesOrderId}/resume`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should not allow holding an already held sales order', async () => {
      // Put on hold first
      await request(app.getHttpServer())
        .post(`/api/sales-orders/${workflowTestSalesOrderId}/hold`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      // Try to hold again
      await request(app.getHttpServer())
        .post(`/api/sales-orders/${workflowTestSalesOrderId}/hold`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('Sales Order Workflow - Close', () => {
    beforeEach(async () => {
      workflowTestSalesOrderId = await createTestSalesOrder();
      // Submit the sales order to enable close
      await request(app.getHttpServer())
        .post(`/api/sales-orders/${workflowTestSalesOrderId}/submit`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);
    });

    afterEach(async () => {
      // Clean up test sales order
      try {
        await request(app.getHttpServer())
          .delete(`/api/sales-orders/${workflowTestSalesOrderId}`)
          .set('Authorization', `Bearer ${regularToken}`)
          .set('Host', 'walatech.localhost');
      } catch (e) {
        // Ignore cleanup errors
      }
    });

    it('should close a submitted sales order', async () => {
      const closeRes = await request(app.getHttpServer())
        .post(`/api/sales-orders/${workflowTestSalesOrderId}/close`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(closeRes.body.status).toBe('Closed');
      expect(closeRes.body.docstatus).toBe(1);
    });

    it('should not allow closing a draft sales order', async () => {
      // Create a new draft sales order
      const draftOrderId = await createTestSalesOrder();

      await request(app.getHttpServer())
        .post(`/api/sales-orders/${draftOrderId}/close`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.BAD_REQUEST);

      // Clean up
      try {
        await request(app.getHttpServer())
          .delete(`/api/sales-orders/${draftOrderId}`)
          .set('Authorization', `Bearer ${regularToken}`)
          .set('Host', 'walatech.localhost');
      } catch (e) {
        // Ignore cleanup errors
      }
    });

    it('should not allow closing an already closed sales order', async () => {
      // Close the sales order first
      await request(app.getHttpServer())
        .post(`/api/sales-orders/${workflowTestSalesOrderId}/close`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      // Try to close again
      await request(app.getHttpServer())
        .post(`/api/sales-orders/${workflowTestSalesOrderId}/close`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should not allow closing a cancelled sales order', async () => {
      // Cancel the sales order first
      await request(app.getHttpServer())
        .post(`/api/sales-orders/${workflowTestSalesOrderId}/cancel`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      // Try to close the cancelled sales order
      await request(app.getHttpServer())
        .post(`/api/sales-orders/${workflowTestSalesOrderId}/close`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('Sales Order Workflow - Complex Scenarios', () => {
    beforeEach(async () => {
      workflowTestSalesOrderId = await createTestSalesOrder();
    });

    afterEach(async () => {
      // Clean up test sales order
      try {
        await request(app.getHttpServer())
          .delete(`/api/sales-orders/${workflowTestSalesOrderId}`)
          .set('Authorization', `Bearer ${regularToken}`)
          .set('Host', 'walatech.localhost');
      } catch (e) {
        // Ignore cleanup errors
      }
    });

    it('should handle complete workflow: Draft -> Submit -> Hold -> Resume -> Close', async () => {
      // 1. Verify initial Draft status
      let res = await request(app.getHttpServer())
        .get(`/api/sales-orders/${workflowTestSalesOrderId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);
      expect(res.body.status).toBe('Draft');

      // 2. Submit
      res = await request(app.getHttpServer())
        .post(`/api/sales-orders/${workflowTestSalesOrderId}/submit`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);
      expect(res.body.status).toBe('To Deliver and Bill');

      // 3. Hold
      res = await request(app.getHttpServer())
        .post(`/api/sales-orders/${workflowTestSalesOrderId}/hold`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);
      expect(res.body.status).toBe('On Hold');

      // 4. Resume
      res = await request(app.getHttpServer())
        .post(`/api/sales-orders/${workflowTestSalesOrderId}/resume`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);
      expect(res.body.status).toBe('To Deliver and Bill');

      // 5. Close
      res = await request(app.getHttpServer())
        .post(`/api/sales-orders/${workflowTestSalesOrderId}/close`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);
      expect(res.body.status).toBe('Closed');
    });

    it('should handle workflow: Draft -> Submit -> Cancel', async () => {
      // 1. Submit
      let res = await request(app.getHttpServer())
        .post(`/api/sales-orders/${workflowTestSalesOrderId}/submit`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);
      expect(res.body.status).toBe('To Deliver and Bill');

      // 2. Cancel
      res = await request(app.getHttpServer())
        .post(`/api/sales-orders/${workflowTestSalesOrderId}/cancel`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);
      expect(res.body.status).toBe('Cancelled');
    });

    it('should handle workflow: Draft -> Cancel (direct cancellation)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/sales-orders/${workflowTestSalesOrderId}/cancel`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);
      expect(res.body.status).toBe('Cancelled');
    });
  });

  describe('Sales Order Workflow - Error Handling', () => {
    it('should return 404 for workflow operations on non-existent sales order', async () => {
      const nonExistentId = '999999';

      await request(app.getHttpServer())
        .post(`/api/sales-orders/${nonExistentId}/submit`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.NOT_FOUND);

      await request(app.getHttpServer())
        .post(`/api/sales-orders/${nonExistentId}/cancel`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.NOT_FOUND);

      await request(app.getHttpServer())
        .post(`/api/sales-orders/${nonExistentId}/hold`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.NOT_FOUND);

      await request(app.getHttpServer())
        .post(`/api/sales-orders/${nonExistentId}/resume`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.NOT_FOUND);

      await request(app.getHttpServer())
        .post(`/api/sales-orders/${nonExistentId}/close`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});