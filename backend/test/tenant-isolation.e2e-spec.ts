/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request, { Response as SupertestResponse } from 'supertest';
import { AppModule } from '../src/app.module';

describe('Tenant Isolation (e2e)', () => {
  let app: INestApplication;
  let superAdminToken = '';
  let regularToken = '';

  const passwordCandidates = ['admin123', 'password123', 'walatech-pass'];
  const superAdminEmail = 'admin@walatech.com';
  const regularEmail = 'admin@arfasa.com';

  interface LoginResponseShape {
    access_token: string;
    user?: { email?: string };
  }

  async function attemptLogin(
    email: string,
    password: string,
  ): Promise<LoginResponseShape | null> {
    const domain = email.split('@')[1] || '';
    const sub = domain.split('.')[0];
    // Use subdomain parameter and Host header in login body for reliable tenant resolution in tests
    const res: SupertestResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .set('Host', `${sub}.localhost`)
      .send({ email, password, subdomain: sub });
    if (res.status !== HttpStatus.CREATED) {
      console.error('LOGIN_FAIL', {
        email,
        candidate: password,
        status: res.status,
        body: res.body,
      });
    }
    if (res.status === HttpStatus.CREATED && res.body?.access_token)
      return res.body as LoginResponseShape;
    return null;
  }

  async function loginWithFallback(email: string): Promise<LoginResponseShape> {
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
    // Match production global prefix for route paths
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('logs in super admin', async () => {
    const body = await loginWithFallback(superAdminEmail);
    expect(body.access_token).toBeDefined();
    superAdminToken = body.access_token;
  });

  it('logs in regular tenant admin', async () => {
    const body = await loginWithFallback(regularEmail);
    expect(body.access_token).toBeDefined();
    regularToken = body.access_token;
  });

  describe('Tenant listing enforcement', () => {
    it('allows super admin to fetch all tenants', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/tenants')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(HttpStatus.OK);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('blocks regular tenant from fetching all tenants', async () => {
      await request(app.getHttpServer())
        .get('/api/tenants')
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('allows regular tenant to fetch own tenants via user endpoint', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/tenants/user/tenants')
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(HttpStatus.OK);
      expect(Array.isArray(res.body)).toBe(true);
      const body = res.body as Array<{ subdomain?: string }>;
      const distinct = Array.from(new Set(body.map((t) => t.subdomain)));
      expect(distinct).toEqual(['arfasa']);
    });
  });

  describe('Provisioning restrictions', () => {
    const base = {
      name: 'TestCorp QA',
      subdomain: 'testcorpqa',
      plan: 'basic',
    };

    it('prevents regular tenant from creating a tenant', async () => {
      await request(app.getHttpServer())
        .post('/api/tenants')
        .set('Authorization', `Bearer ${regularToken}`)
        .send(base)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('allows super admin to create a tenant', async () => {
      const payload = {
        ...base,
        subdomain: base.subdomain + Date.now().toString(36).slice(-4),
      };
      const res = await request(app.getHttpServer())
        .post('/api/tenants')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(payload)
        .expect(HttpStatus.CREATED);
      expect(res.body).toHaveProperty('id');
      expect(res.body.subdomain.startsWith('testcorpqa')).toBe(true);
    });
  });
});
