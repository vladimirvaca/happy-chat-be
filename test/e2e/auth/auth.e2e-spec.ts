import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../../../src/modules/database/database.module';
import { AuthModule } from '../../../src/modules/auth/auth.module';
import { UserModule } from '../../../src/modules/user/user.module';
import { PostgresTestContainer } from '../../utils/PostgresTestContainer';
import { Role } from '../../../src/modules/user/model/user.model';
import { LoginDto } from '../../../src/modules/auth/dto/login.dto';
import { CLOSE_APP_TIMEOUT, WAIT_FOR_APP_TIMEOUT } from '../constants';

interface ValidationError {
  statusCode: number;
  message: string[];
  error: string;
}

const expectValidationError = (
  res: request.Response,
  expectedMessage: string
) => {
  const error = res.body as ValidationError;
  expect(
    Array.isArray(error.message) ? error.message : [error.message]
  ).toContain(expectedMessage);
};

const testUser = {
  email: 'auth-test@example.com',
  password: 'password123',
  name: 'Auth',
  lastName: 'Tester',
  role: Role.USER
};

const loginDto: LoginDto = {
  email: testUser.email,
  password: testUser.password
};

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  const postgresContainer = new PostgresTestContainer();

  beforeAll(async () => {
    await postgresContainer.start();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        await ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test'
        }),
        AuthModule,
        UserModule,
        DatabaseModule
      ]
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true
      })
    );

    await app.init();
  });

  afterAll(async () => {
    await postgresContainer.stop();
    await app.close();
  }, CLOSE_APP_TIMEOUT);

  describe('/api/v1/auth/login (POST)', () => {
    // Create the user before running login tests
    beforeAll(async () => {
      await request(app.getHttpServer())
        .post('/api/v1/user/create')
        .send(testUser)
        .expect(201);
    }, WAIT_FOR_APP_TIMEOUT);

    it(
      'should login successfully and return an access token',
      () => {
        return request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send(loginDto)
          .expect(201)
          .expect((res) => {
            expect(res.body).toHaveProperty('accessToken');
          });
      },
      WAIT_FOR_APP_TIMEOUT
    );

    it(
      'should fail when user does not exist',
      () => {
        const nonExistentUser: LoginDto = {
          email: 'nouser@example.com',
          password: 'password123'
        };
        return request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send(nonExistentUser)
          .expect(401);
      },
      WAIT_FOR_APP_TIMEOUT
    );

    it(
      'should fail with incorrect password',
      () => {
        const wrongPasswordDto: LoginDto = {
          ...loginDto,
          password: 'wrong-password'
        };
        return request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send(wrongPasswordDto)
          .expect(401);
      },
      WAIT_FOR_APP_TIMEOUT
    );

    it('should fail with missing email (validation)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({})
        .expect(400)
        .expect((res) =>
          expectValidationError(res, 'email should not be empty')
        );
    });

    it(
      'should fail with missing password (validation)',
      () => {
        return request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send({})
          .expect(400)
          .expect((res) =>
            expectValidationError(res, 'password should not be empty')
          );
      },
      WAIT_FOR_APP_TIMEOUT
    );
  });
});
