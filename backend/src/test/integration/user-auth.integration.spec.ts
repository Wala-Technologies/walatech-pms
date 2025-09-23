import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getTestDatabaseConfig } from '../test-utils';

describe('User Authentication Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(getTestDatabaseConfig()),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('User Registration and Login Flow', () => {
    it('should register a new user and login successfully', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User',
        role_profile_name: 'user',
        tenant_id: 'test-tenant',
      };

      // Register user
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      expect(registerResponse.body).toHaveProperty('user');
      expect(registerResponse.body).toHaveProperty('access_token');
      expect(registerResponse.body.user.email).toBe(registerDto.email);
      expect(registerResponse.body.user).not.toHaveProperty('password');

      // Login with registered user
      const loginDto = {
        email: registerDto.email,
        password: registerDto.password,
      };

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(201);

      expect(loginResponse.body).toHaveProperty('user');
      expect(loginResponse.body).toHaveProperty('access_token');
      expect(loginResponse.body.user.email).toBe(registerDto.email);
    });

    it('should prevent duplicate user registration', async () => {
      const registerDto = {
        email: 'duplicate@example.com',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User',
        role_profile_name: 'user',
        tenant_id: 'test-tenant',
      };

      // First registration should succeed
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      // Second registration should fail
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(409);
    });

    it('should reject login with invalid credentials', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(401);
    });
  });

  describe('Protected Routes', () => {
    let authToken: string;
    let userId: string;

    beforeEach(async () => {
      const registerDto = {
        email: 'protected@example.com',
        password: 'password123',
        first_name: 'Protected',
        last_name: 'User',
        role_profile_name: 'user',
        tenant_id: 'test-tenant',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto);

      authToken = response.body.access_token;
      userId = response.body.user.id;
    });

    it('should access profile with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('protected@example.com');
    });

    it('should reject access without token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });

    it('should reject access with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should access user endpoints with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('users');
      expect(response.body).toHaveProperty('total');
    });

    it('should update user profile', async () => {
      const updateDto = {
        first_name: 'Updated',
        last_name: 'Name',
      };

      const response = await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.first_name).toBe('Updated');
      expect(response.body.last_name).toBe('Name');
    });
  });
});