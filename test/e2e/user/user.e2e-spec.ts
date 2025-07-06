import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Role } from '../../../src/modules/user/model/user.model';
import { UserDto } from '../../../src/modules/user/dto/user.dto';
import { UserModule } from '../../../src/modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../../../src/modules/database/database.module';
import { App } from 'supertest/types';

interface ValidationError {
  statusCode: 400;
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

describe('UserController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        await ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test'
        }),
        UserModule,
        DatabaseModule
      ]
    }).compile();

    app = moduleFixture.createNestApplication();
    // Global prefix
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true
      })
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/v1/user/create (POST)', () => {
    const validUserDto: UserDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test',
      lastName: 'User',
      role: Role.USER
    };

    it('should create a new user successfully', () => {
      return request(app.getHttpServer())
        .post('/api/v1/user/create')
        .send(validUserDto)
        .expect(201)
        .expect((response) => {
          expect(response.body).toEqual({
            statusCode: 201,
            message: 'User created successfully.'
          });
        });
    });

    it('should fail when email is missing', () => {
      const invalidUserDto = {
        password: validUserDto.password,
        name: validUserDto.name,
        lastName: validUserDto.lastName,
        role: validUserDto.role
      };

      return request(app.getHttpServer())
        .post('/api/v1/user/create')
        .send(invalidUserDto)
        .expect(400)
        .expect((response: request.Response) =>
          expectValidationError(response, 'email should not be empty')
        );
    });

    it('should fail when password is too short', () => {
      const invalidUserDto = {
        ...validUserDto,
        password: '12345' // Less than 6 characters
      };

      return request(app.getHttpServer())
        .post('/api/v1/user/create')
        .send(invalidUserDto)
        .expect(400)
        .expect((response: request.Response) =>
          expectValidationError(
            response,
            'password must be longer than or equal to 6 characters'
          )
        );
    });

    it('should fail when email is invalid', () => {
      const invalidUserDto = {
        ...validUserDto,
        email: 'invalid-email'
      };

      return request(app.getHttpServer())
        .post('/api/v1/user/create')
        .send(invalidUserDto)
        .expect(400)
        .expect((response: request.Response) =>
          expectValidationError(response, 'email must be an email')
        );
    });

    it('should fail when role is invalid', () => {
      const invalidUserDto = {
        ...validUserDto,
        role: 'INVALID_ROLE'
      };

      return request(app.getHttpServer())
        .post('/api/v1/user/create')
        .send(invalidUserDto)
        .expect(400)
        .expect((response: request.Response) =>
          expectValidationError(response, 'Role must be either ADMIN or USER')
        );
    });

    it('should fail when trying to create user with existing email', async () => {
      // First create a user
      await request(app.getHttpServer())
        .post('/api/v1/user/create')
        .send(validUserDto);

      // Try to create another user with the same email
      return request(app.getHttpServer())
        .post('/api/v1/user/create')
        .send(validUserDto)
        .expect(400)
        .expect((response: request.Response) =>
          expectValidationError(response, 'Validation error')
        );
    });
  });
});
