/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

// NOTE: This test assumes that two tenants exist: super admin (walatech) and another tenant (arfasa)
// and that each has an admin user with known email+password from seeding.
// Adjust emails/passwords if seeding changes.

describe('Cross-Tenant Login Enforcement (e2e)', () => {
  let app: INestApplication;

  const superAdminEmail = 'admin@walatech.com';
  const tenantAdminEmail = 'admin@arfasa.com';
  const candidatePasswords = ['password123', 'admin123', 'walatech-pass'];

  async function loginAtHost(host: string, email: string) {
    for (const pwd of candidatePasswords) {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .set('Host', host)
        .send({ email, password: pwd });
      if (res.status === HttpStatus.CREATED && res.body?.access_token) {
        return { ok: true, token: res.body.access_token };
      }
    }
    return { ok: false };
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('allows login on correct tenant subdomain (arfasa)', async () => {
    const result = await loginAtHost('arfasa.localhost', tenantAdminEmail);
    expect(result.ok).toBe(true);
  });

  it('denies logging into arfasa account from super admin subdomain (walatech)', async () => {
    const result = await loginAtHost('walatech.localhost', tenantAdminEmail);
    expect(result.ok).toBe(false);
  });

  it('denies login when tenant context missing (no subdomain host)', async () => {
    // Simulate direct host without subdomain => should fail fast with Unauthorized
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .set('Host', 'localhost')
      .send({ email: tenantAdminEmail, password: 'password123' });
    expect([HttpStatus.UNAUTHORIZED, HttpStatus.BAD_REQUEST]).toContain(
      res.status,
    );
  });

  it('allows super admin to login on super admin subdomain', async () => {
    const result = await loginAtHost('walatech.localhost', superAdminEmail);
    expect(result.ok).toBe(true);
  });
});
