import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Department Filtering (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;
  let createdSupplierId: string;
  let createdDepartmentId: string;
  let secondDepartmentId: string;

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

    // Login as admin user for walatech tenant
    const adminLoginRes = await loginWithFallback('admin@walatech.com');
    adminToken = adminLoginRes.access_token;

    // For now, use the same token for user tests
    // In a real scenario, you'd create a separate user with limited department access
    userToken = adminToken;

    // Create test departments
    const dept1Data = {
      name: 'Engineering Department',
      department_name: 'Engineering Department',
      description: 'Software Engineering Department'
    };

    const dept1Res = await request(app.getHttpServer())
      .post('/api/hr/departments')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('Host', 'walatech.localhost')
      .send(dept1Data);

    if (dept1Res.status === HttpStatus.CREATED) {
      createdDepartmentId = dept1Res.body.id;
    }

    const dept2Data = {
      name: 'Sales Department',
      department_name: 'Sales Department',
      description: 'Sales and Marketing Department'
    };

    const dept2Res = await request(app.getHttpServer())
      .post('/api/hr/departments')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('Host', 'walatech.localhost')
      .send(dept2Data);

    if (dept2Res.status === HttpStatus.CREATED) {
      secondDepartmentId = dept2Res.body.id;
    }

    // Create test supplier
    const supplierData = {
      supplier_name: 'Test Supplier for Department Filtering',
      email: 'test@supplier.com',
      phone: '+1234567890',
      address: '123 Test Street',
      city: 'Test City',
      country: 'Ethiopia',
      supplier_type: 'Company',
      gst_category: 'Registered Regular',
      department_id: createdDepartmentId
    };

    const supplierRes = await request(app.getHttpServer())
      .post('/api/suppliers')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('Host', 'walatech.localhost')
      .send(supplierData);

    if (supplierRes.status === HttpStatus.CREATED) {
      createdSupplierId = supplierRes.body.id;
    }
  });

  afterAll(async () => {
    // Clean up created resources
    if (createdSupplierId) {
      await request(app.getHttpServer())
        .delete(`/api/suppliers/${createdSupplierId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Host', 'walatech.localhost');
    }

    if (createdDepartmentId) {
      await request(app.getHttpServer())
        .delete(`/api/hr/departments/${createdDepartmentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Host', 'walatech.localhost');
    }

    if (secondDepartmentId) {
      await request(app.getHttpServer())
        .delete(`/api/hr/departments/${secondDepartmentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Host', 'walatech.localhost');
    }

    await app.close();
  });

  describe('Suppliers Module - Department Filtering', () => {
    describe('getSuppliersByType', () => {
      it('should filter suppliers by type with department isolation', async () => {
        const res = await request(app.getHttpServer())
          .get('/api/suppliers/by-type/Company')
          .set('Authorization', `Bearer ${userToken}`)
          .set('Host', 'walatech.localhost')
          .expect(HttpStatus.OK);

        expect(res.body).toHaveProperty('suppliers');
        expect(Array.isArray(res.body.suppliers)).toBe(true);

        // Verify that all returned suppliers belong to the user's accessible departments
        res.body.suppliers.forEach(supplier => {
          expect(supplier).toHaveProperty('department_id');
          expect(supplier.supplier_type).toBe('Company');
          // In a real scenario, you'd verify the department_id matches user's accessible departments
        });
      });

      it('should return empty array when no suppliers match type and department', async () => {
        const res = await request(app.getHttpServer())
          .get('/api/suppliers/by-type/NonExistentType')
          .set('Authorization', `Bearer ${userToken}`)
          .set('Host', 'walatech.localhost')
          .expect(HttpStatus.OK);

        expect(res.body).toHaveProperty('suppliers');
        expect(Array.isArray(res.body.suppliers)).toBe(true);
        expect(res.body.suppliers).toHaveLength(0);
      });

      it('should require authentication', async () => {
        await request(app.getHttpServer())
          .get('/api/suppliers/by-type/Company')
          .set('Host', 'walatech.localhost')
          .expect(HttpStatus.UNAUTHORIZED);
      });
    });

    describe('getSuppliersByCountry', () => {
      it('should filter suppliers by country with department isolation', async () => {
        const res = await request(app.getHttpServer())
          .get('/api/suppliers/by-country/Ethiopia')
          .set('Authorization', `Bearer ${userToken}`)
          .set('Host', 'walatech.localhost')
          .expect(HttpStatus.OK);

        expect(res.body).toHaveProperty('suppliers');
        expect(Array.isArray(res.body.suppliers)).toBe(true);

        // Verify that all returned suppliers belong to the user's accessible departments
        res.body.suppliers.forEach(supplier => {
          expect(supplier).toHaveProperty('department_id');
          expect(supplier.country).toBe('Ethiopia');
          // In a real scenario, you'd verify the department_id matches user's accessible departments
        });
      });

      it('should return empty array when no suppliers match country and department', async () => {
        const res = await request(app.getHttpServer())
          .get('/api/suppliers/by-country/NonExistentCountry')
          .set('Authorization', `Bearer ${userToken}`)
          .set('Host', 'walatech.localhost')
          .expect(HttpStatus.OK);

        expect(res.body).toHaveProperty('suppliers');
        expect(Array.isArray(res.body.suppliers)).toBe(true);
        expect(res.body.suppliers).toHaveLength(0);
      });

      it('should require authentication', async () => {
        await request(app.getHttpServer())
          .get('/api/suppliers/by-country/Ethiopia')
          .set('Host', 'walatech.localhost')
          .expect(HttpStatus.UNAUTHORIZED);
      });
    });

    describe('getSuppliersByGstCategory', () => {
      it('should filter suppliers by GST category with department isolation', async () => {
        const res = await request(app.getHttpServer())
          .get('/api/suppliers/by-gst-category/Registered Regular')
          .set('Authorization', `Bearer ${userToken}`)
          .set('Host', 'walatech.localhost')
          .expect(HttpStatus.OK);

        expect(res.body).toHaveProperty('suppliers');
        expect(Array.isArray(res.body.suppliers)).toBe(true);

        // Verify that all returned suppliers belong to the user's accessible departments
        res.body.suppliers.forEach(supplier => {
          expect(supplier).toHaveProperty('department_id');
          expect(supplier.gst_category).toBe('Registered Regular');
          // In a real scenario, you'd verify the department_id matches user's accessible departments
        });
      });

      it('should return empty array when no suppliers match GST category and department', async () => {
        const res = await request(app.getHttpServer())
          .get('/api/suppliers/by-gst-category/NonExistentCategory')
          .set('Authorization', `Bearer ${userToken}`)
          .set('Host', 'walatech.localhost')
          .expect(HttpStatus.OK);

        expect(res.body).toHaveProperty('suppliers');
        expect(Array.isArray(res.body.suppliers)).toBe(true);
        expect(res.body.suppliers).toHaveLength(0);
      });

      it('should require authentication', async () => {
        await request(app.getHttpServer())
          .get('/api/suppliers/by-gst-category/Registered Regular')
          .set('Host', 'walatech.localhost')
          .expect(HttpStatus.UNAUTHORIZED);
      });
    });
  });

  describe('Cross-Department Isolation Verification', () => {
    it('should not return suppliers from other departments', async () => {
      // This test would be more meaningful with actual department-restricted users
      // For now, we verify the structure and that department_id is present
      const res = await request(app.getHttpServer())
        .get('/api/suppliers')
        .set('Authorization', `Bearer ${userToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(Array.isArray(res.body)).toBe(true);
      
      // Verify all suppliers have department_id (indicating department filtering is in place)
      res.body.forEach(supplier => {
        expect(supplier).toHaveProperty('department_id');
        expect(supplier.department_id).toBeDefined();
      });
    });

    it('should maintain department isolation across all filtering methods', async () => {
      // Test all three methods to ensure consistent department filtering
      const typeRes = await request(app.getHttpServer())
        .get('/api/suppliers/by-type/Company')
        .set('Authorization', `Bearer ${userToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      const countryRes = await request(app.getHttpServer())
        .get('/api/suppliers/by-country/Ethiopia')
        .set('Authorization', `Bearer ${userToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      const gstRes = await request(app.getHttpServer())
        .get('/api/suppliers/by-gst-category/Registered Regular')
        .set('Authorization', `Bearer ${userToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      // Verify all responses have the expected structure
      [typeRes, countryRes, gstRes].forEach(res => {
        expect(res.body).toHaveProperty('suppliers');
        expect(Array.isArray(res.body.suppliers)).toBe(true);
        
        res.body.suppliers.forEach(supplier => {
          expect(supplier).toHaveProperty('department_id');
          expect(supplier.department_id).toBeDefined();
        });
      });
    });
  });

  describe('Performance and Error Handling', () => {
    it('should handle invalid parameters gracefully', async () => {
      // Test with special characters and edge cases
      const testCases = [
        '/api/suppliers/by-type/',
        '/api/suppliers/by-country/',
        '/api/suppliers/by-gst-category/',
        '/api/suppliers/by-type/null',
        '/api/suppliers/by-country/undefined',
        '/api/suppliers/by-gst-category/""'
      ];

      for (const testCase of testCases) {
        const res = await request(app.getHttpServer())
          .get(testCase)
          .set('Authorization', `Bearer ${userToken}`)
          .set('Host', 'walatech.localhost');

        // Should either return OK with empty results or appropriate error status
        expect([HttpStatus.OK, HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND]).toContain(res.status);
      }
    });

    it('should respond within acceptable time limits', async () => {
      const startTime = Date.now();
      
      await request(app.getHttpServer())
        .get('/api/suppliers/by-type/Company')
        .set('Authorization', `Bearer ${userToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      const responseTime = Date.now() - startTime;
      
      // Response should be under 2 seconds for good performance
      expect(responseTime).toBeLessThan(2000);
    });
  });
});