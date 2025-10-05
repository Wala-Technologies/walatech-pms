import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('SuppliersController (e2e)', () => {
  let app: INestApplication;
  let regularToken: string;
  let superAdminToken: string;
  let createdSupplierId: string;
  let createdgroupId: string;
  let createdQuotationId: string;
  let createdScorecardId: string;

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
    it('should require authentication for supplier endpoints', async () => {
      await request(app.getHttpServer())
        .get('/api/suppliers')
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should allow authenticated users to access supplier endpoints', async () => {
      await request(app.getHttpServer())
        .get('/api/suppliers')
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);
    });
  });

  describe('Supplier Group CRUD Operations', () => {
    it('should create a new supplier group', async () => {
      const groupData = {
        supplier_group_name: 'Test Supplier Group',
        description: 'Test group for suppliers',
        is_group: true,
        default_payment_terms_template: 'Net 30',
        default_price_list: 'Standard Buying'
      };

      const res = await request(app.getHttpServer())
        .post('/api/supplier-groups')
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .send(groupData)
        .expect(HttpStatus.CREATED);

      expect(res.body).toHaveProperty('id');
      expect(res.body.supplier_group_name).toBe(groupData.supplier_group_name);
      expect(res.body.description).toBe(groupData.description);
      
      createdgroupId = res.body.id;
    });

    it('should retrieve all supplier groups', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/supplier-groups')
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should retrieve supplier group tree structure', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/supplier-groups/tree')
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should retrieve a specific supplier group by ID', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/supplier-groups/${createdgroupId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(res.body.id).toBe(createdgroupId);
      expect(res.body.supplier_group_name).toBe('Test Supplier Group');
    });

    it('should update a supplier group', async () => {
      const updateData = {
        supplier_group_name: 'Updated Test Supplier Group',
        description: 'Updated description'
      };

      const res = await request(app.getHttpServer())
        .patch(`/api/supplier-groups/${createdgroupId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .send(updateData)
        .expect(HttpStatus.OK);

      expect(res.body.supplier_group_name).toBe(updateData.supplier_group_name);
      expect(res.body.description).toBe(updateData.description);
    });
  });

  describe('Supplier CRUD Operations', () => {
    it('should create a new supplier', async () => {
      const supplierData = {
        supplier_name: 'Test Supplier',
        email: 'test@supplier.com',
        supplier_code: 'SUP001',
        supplier_type: 'Company',
        supplier_group: createdgroupId,
        mobile_no: '1234567890',
        gst_category: 'Registered Regular',
        gstin: '29ABCDE1234F1Z5',
        pan: 'ABCDE1234F',
        default_currency: 'ETB',
        payment_terms: 'Net 30',
        credit_limit: 100000,
        address_line1: '123 Supplier St',
        city: 'Supplier City',
        country: 'Ethiopia'
      };

      const res = await request(app.getHttpServer())
        .post('/api/suppliers')
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .send(supplierData)
        .expect(HttpStatus.CREATED);

      expect(res.body).toHaveProperty('id');
      expect(res.body.supplier_name).toBe(supplierData.supplier_name);
      expect(res.body.email).toBe(supplierData.email);
      expect(res.body.supplier_code).toBe(supplierData.supplier_code);
      expect(res.body.supplier_group).toBe(supplierData.supplier_group);
      
      createdSupplierId = res.body.id;
    });

    it('should retrieve all suppliers with pagination', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/suppliers?page=1&limit=10')
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(res.body).toHaveProperty('suppliers');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('limit');
      expect(Array.isArray(res.body.suppliers)).toBe(true);
    });

    it('should retrieve supplier statistics', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/suppliers/stats')
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('active');
      expect(res.body).toHaveProperty('disabled');
      expect(res.body).toHaveProperty('onHold');
      expect(res.body).toHaveProperty('byType');
      expect(res.body).toHaveProperty('byCountry');
      expect(res.body).toHaveProperty('byGstCategory');
      expect(res.body).toHaveProperty('bySupplierGroup');
    });

    it('should search suppliers', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/suppliers/search?q=Test')
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(res.body).toHaveProperty('suppliers');
      expect(Array.isArray(res.body.suppliers)).toBe(true);
    });

    it('should filter suppliers by type', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/suppliers/by-type/Company')
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(res.body).toHaveProperty('suppliers');
      expect(Array.isArray(res.body.suppliers)).toBe(true);
      
      // Verify department filtering is applied
      res.body.suppliers.forEach(supplier => {
        expect(supplier).toHaveProperty('department_id');
        expect(supplier.supplier_type).toBe('Company');
      });
    });

    it('should filter suppliers by country', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/suppliers/by-country/Ethiopia')
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(res.body).toHaveProperty('suppliers');
      expect(Array.isArray(res.body.suppliers)).toBe(true);
      
      // Verify department filtering is applied
      res.body.suppliers.forEach(supplier => {
        expect(supplier).toHaveProperty('department_id');
        expect(supplier.country).toBe('Ethiopia');
      });
    });

    it('should filter suppliers by GST category', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/suppliers/by-gst-category/Registered Regular')
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(res.body).toHaveProperty('suppliers');
      expect(Array.isArray(res.body.suppliers)).toBe(true);
      
      // Verify department filtering is applied
      res.body.suppliers.forEach(supplier => {
        expect(supplier).toHaveProperty('department_id');
        expect(supplier.gst_category).toBe('Registered Regular');
      });
    });

    it('should filter suppliers by group', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/suppliers/by-group/${createdgroupId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(res.body).toHaveProperty('suppliers');
      expect(Array.isArray(res.body.suppliers)).toBe(true);
    });

    it('should retrieve a specific supplier by ID', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/suppliers/${createdSupplierId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(res.body.id).toBe(createdSupplierId);
      expect(res.body.supplier_name).toBe('Test Supplier');
    });

    it('should update a supplier', async () => {
      const updateData = {
        supplier_name: 'Updated Test Supplier',
        email: 'updated@supplier.com',
        credit_limit: 150000
      };

      const res = await request(app.getHttpServer())
        .patch(`/api/suppliers/${createdSupplierId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .send(updateData)
        .expect(HttpStatus.OK);

      expect(res.body.supplier_name).toBe(updateData.supplier_name);
      expect(res.body.email).toBe(updateData.email);
      expect(res.body.credit_limit).toBe(updateData.credit_limit);
    });

    it('should toggle supplier status', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/suppliers/${createdSupplierId}/toggle-status`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(res.body).toHaveProperty('disabled');
    });

    it('should update supplier hold status', async () => {
      const holdData = {
        hold_type: 'All',
        release_date: '2024-12-31'
      };

      const res = await request(app.getHttpServer())
        .patch(`/api/suppliers/${createdSupplierId}/hold-status`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .send(holdData)
        .expect(HttpStatus.OK);

      expect(res.body.hold_type).toBe(holdData.hold_type);
    });
  });

  describe('Supplier Quotation CRUD Operations', () => {
    it('should create a new supplier quotation', async () => {
      const quotationData = {
        supplier: createdSupplierId,
        quotation_date: '2024-01-15',
        valid_till: '2024-02-15',
        currency: 'ETB',
        status: 'Draft',
        terms_and_conditions: 'Standard terms apply',
        items: [
          {
            item_code: 'ITEM001',
            item_name: 'Test Item',
            description: 'Test item description',
            qty: 10,
            uom: 'Nos',
            rate: 100,
            delivery_date: '2024-02-01'
          }
        ]
      };

      const res = await request(app.getHttpServer())
        .post('/api/supplier-quotations')
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .send(quotationData)
        .expect(HttpStatus.CREATED);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('quotation_number');
      expect(res.body.supplier).toBe(quotationData.supplier);
      expect(res.body.status).toBe(quotationData.status);
      
      createdQuotationId = res.body.id;
    });

    it('should retrieve all supplier quotations', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/supplier-quotations')
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(res.body).toHaveProperty('quotations');
      expect(res.body).toHaveProperty('total');
      expect(Array.isArray(res.body.quotations)).toBe(true);
    });

    it('should retrieve quotation statistics', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/supplier-quotations/stats')
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('byStatus');
      expect(res.body).toHaveProperty('bySupplier');
      expect(res.body).toHaveProperty('valueStats');
    });

    it('should retrieve a specific quotation by ID', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/supplier-quotations/${createdQuotationId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(res.body.id).toBe(createdQuotationId);
      expect(res.body.supplier).toBe(createdSupplierId);
    });

    it('should update quotation status', async () => {
      const statusData = { status: 'Submitted' };

      const res = await request(app.getHttpServer())
        .patch(`/api/supplier-quotations/${createdQuotationId}/status`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .send(statusData)
        .expect(HttpStatus.OK);

      expect(res.body.status).toBe(statusData.status);
    });

    it('should compare quotations', async () => {
      const compareData = {
        quotation_ids: [createdQuotationId]
      };

      const res = await request(app.getHttpServer())
        .post('/api/supplier-quotations/compare')
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .send(compareData)
        .expect(HttpStatus.OK);

      expect(res.body).toHaveProperty('comparison');
      expect(Array.isArray(res.body.comparison)).toBe(true);
    });
  });

  describe('Supplier Scorecard CRUD Operations', () => {
    it('should create a new supplier scorecard', async () => {
      const scorecardData = {
        scorecard_name: 'Q1 2024 Scorecard',
        supplier: createdSupplierId,
        period_from: '2024-01-01',
        period_to: '2024-03-31',
        criteria: [
          {
            criteria_name: 'Quality',
            weight: 40,
            max_score: 10
          },
          {
            criteria_name: 'Delivery',
            weight: 30,
            max_score: 10
          },
          {
            criteria_name: 'Cost',
            weight: 30,
            max_score: 10
          }
        ],
        periods: [
          {
            criteria: 'Quality',
            score: 8.5
          },
          {
            criteria: 'Delivery',
            score: 9.0
          },
          {
            criteria: 'Cost',
            score: 7.5
          }
        ]
      };

      const res = await request(app.getHttpServer())
        .post('/api/supplier-scorecards')
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .send(scorecardData)
        .expect(HttpStatus.CREATED);

      expect(res.body).toHaveProperty('id');
      expect(res.body.scorecard_name).toBe(scorecardData.scorecard_name);
      expect(res.body.supplier).toBe(scorecardData.supplier);
      expect(res.body).toHaveProperty('total_score');
      expect(res.body).toHaveProperty('percentage_score');
      expect(res.body).toHaveProperty('standing');
      
      createdScorecardId = res.body.id;
    });

    it('should retrieve all supplier scorecards', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/supplier-scorecards')
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(res.body).toHaveProperty('scorecards');
      expect(res.body).toHaveProperty('total');
      expect(Array.isArray(res.body.scorecards)).toBe(true);
    });

    it('should retrieve scorecard statistics', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/supplier-scorecards/stats')
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('byStanding');
      expect(res.body).toHaveProperty('byPeriod');
      expect(res.body).toHaveProperty('averageScore');
      expect(res.body).toHaveProperty('topPerformers');
      expect(res.body).toHaveProperty('poorPerformers');
    });

    it('should retrieve scorecards by supplier', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/supplier-scorecards/by-supplier/${createdSupplierId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(res.body).toHaveProperty('scorecards');
      expect(Array.isArray(res.body.scorecards)).toBe(true);
    });

    it('should calculate scorecard score', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/supplier-scorecards/${createdScorecardId}/calculate`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(res.body).toHaveProperty('total_score');
      expect(res.body).toHaveProperty('percentage_score');
      expect(res.body).toHaveProperty('standing');
    });

    it('should retrieve performance trend', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/supplier-scorecards/performance-trend/${createdSupplierId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(res.body).toHaveProperty('trend');
      expect(Array.isArray(res.body.trend)).toBe(true);
    });
  });

  describe('Validation and Error Handling', () => {
    it('should validate required fields when creating supplier', async () => {
      const invalidData = {
        email: 'invalid-email'
      };

      await request(app.getHttpServer())
        .post('/api/suppliers')
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .send(invalidData)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should prevent duplicate supplier names', async () => {
      const duplicateData = {
        supplier_name: 'Updated Test Supplier', // This name already exists
        email: 'duplicate@supplier.com',
        supplier_code: 'DUP001'
      };

      await request(app.getHttpServer())
        .post('/api/suppliers')
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .send(duplicateData)
        .expect(HttpStatus.CONFLICT);
    });

    it('should return 404 for non-existent supplier', async () => {
      await request(app.getHttpServer())
        .get('/api/suppliers/non-existent-id')
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should validate GSTIN format', async () => {
      const invalidGstinData = {
        supplier_name: 'Invalid GSTIN Supplier',
        email: 'invalid@gstin.com',
        supplier_code: 'INV001',
        gst_category: 'Registered Regular',
        gstin: 'INVALID_GSTIN'
      };

      await request(app.getHttpServer())
        .post('/api/suppliers')
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .send(invalidGstinData)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('Cleanup', () => {
    it('should delete the test scorecard', async () => {
      await request(app.getHttpServer())
        .delete(`/api/supplier-scorecards/${createdScorecardId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.NO_CONTENT);
    });

    it('should delete the test quotation', async () => {
      await request(app.getHttpServer())
        .delete(`/api/supplier-quotations/${createdQuotationId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.NO_CONTENT);
    });

    it('should delete the test supplier', async () => {
      await request(app.getHttpServer())
        .delete(`/api/suppliers/${createdSupplierId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.NO_CONTENT);

      // Verify supplier is deleted
      await request(app.getHttpServer())
        .get(`/api/suppliers/${createdSupplierId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should delete the test supplier group', async () => {
      await request(app.getHttpServer())
        .delete(`/api/supplier-groups/${createdgroupId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.NO_CONTENT);

      // Verify supplier group is deleted
      await request(app.getHttpServer())
        .get(`/api/supplier-groups/${createdgroupId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});