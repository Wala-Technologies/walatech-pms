import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('CustomersController (e2e)', () => {
  let app: INestApplication;
  let regularToken: string;
  let superAdminToken: string;
  let createdCustomerId: string;

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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication and Authorization', () => {
    it('should require authentication for customer endpoints', async () => {
      await request(app.getHttpServer())
        .get('/api/customers')
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should allow authenticated users to access customer endpoints', async () => {
      await request(app.getHttpServer())
        .get('/api/customers')
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);
    });
  });

  describe('Customer CRUD Operations', () => {
    it('should create a new customer', async () => {
      const customerData = {
        customer_name: 'Test Customer',
        email: 'test@customer.com',
        customer_code: 'TEST001',
        customer_type: 'Company',
        mobile_no: '1234567890',
        billing_address_line_1: '123 Test St',
        billing_city: 'Test City',
        billing_country: 'Test Country'
      };

      const res = await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .send(customerData)
        .expect(HttpStatus.CREATED);

      expect(res.body).toHaveProperty('id');
      expect(res.body.customer_name).toBe(customerData.customer_name);
      expect(res.body.email).toBe(customerData.email);
      expect(res.body.customer_code).toBe(customerData.customer_code);
      
      createdCustomerId = res.body.id;
    });

    it('should retrieve all customers', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/customers')
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(res.body).toHaveProperty('customers');
      expect(res.body).toHaveProperty('total');
      expect(Array.isArray(res.body.customers)).toBe(true);
    });

    it('should retrieve a specific customer by ID', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/customers/${createdCustomerId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(res.body.id).toBe(createdCustomerId);
      expect(res.body.customer_name).toBe('Test Customer');
    });

    it('should update a customer', async () => {
      const updateData = {
        customer_name: 'Updated Test Customer',
        email: 'updated@customer.com'
      };

      const res = await request(app.getHttpServer())
        .patch(`/api/customers/${createdCustomerId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .send(updateData)
        .expect(HttpStatus.OK);

      expect(res.body.customer_name).toBe(updateData.customer_name);
      expect(res.body.email).toBe(updateData.email);
    });

    it('should delete a customer', async () => {
      await request(app.getHttpServer())
        .delete(`/api/customers/${createdCustomerId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.NO_CONTENT);

      // Verify customer is deleted
      await request(app.getHttpServer())
        .get(`/api/customers/${createdCustomerId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('Customer Search and Filtering', () => {
    let searchTestCustomerId: string;

    beforeAll(async () => {
      // Create a customer for search tests
      const customerData = {
        customer_name: 'Searchable Customer',
        email: 'searchable@test.com',
        customer_code: 'SEARCH001',
        customer_type: 'Individual'
      };

      const res = await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .send(customerData);

      searchTestCustomerId = res.body.id;
    });

    afterAll(async () => {
      // Clean up search test customer
      try {
        await request(app.getHttpServer())
          .delete(`/api/customers/${searchTestCustomerId}`)
          .set('Authorization', `Bearer ${regularToken}`)
          .set('Host', 'walatech.localhost');
      } catch (e) {
        // Ignore cleanup errors
      }
    });

    it('should search customers by name', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/customers/search?q=Searchable')
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].customer_name).toContain('Searchable');
    });

    it('should filter customers by type', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/customers/by-type/Individual')
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach(customer => {
        expect(customer.customer_type).toBe('Individual');
      });
    });
  });

  describe('Customer Statistics', () => {
    it('should retrieve customer statistics', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/customers/stats')
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('active');
      expect(res.body).toHaveProperty('frozen');
      expect(res.body).toHaveProperty('disabled');
      expect(res.body).toHaveProperty('byType');
      expect(res.body).toHaveProperty('byCountry');
    });
  });

  describe('Tenant Isolation', () => {
    it('should only return customers for the current tenant', async () => {
      // Get customers for walatech tenant
      const walatechRes = await request(app.getHttpServer())
        .get('/api/customers')
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      // All customers should belong to the same tenant (UUID format)
      walatechRes.body.customers.forEach(customer => {
        expect(customer.tenant_id).toBe('550e8400-e29b-41d4-a716-446655440000');
      });
    });
  });
});