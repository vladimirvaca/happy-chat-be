import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Role, User } from '../../../src/modules/user/model/user.model';
import { UserDto } from '../../../src/modules/user/dto/user.dto';
import { UserModule } from '../../../src/modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../../../src/modules/database/database.module';
import { App } from 'supertest/types';
import { PostgresTestContainer } from '../../utils/PostgresTestContainer';
import { AllExceptionsFilter } from '../../../src/modules/filter/all-exceptions.filter';
import { getModelToken } from '@nestjs/sequelize';

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

const validUserDto: UserDto = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test',
  lastName: 'User',
  role: Role.USER
};

describe('UserController (e2e)', () => {
  let app: INestApplication<App>;
  let userModel: typeof User;
  const postgresContainer = new PostgresTestContainer();

  beforeAll(async () => {
    await postgresContainer.start();

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
    app.useGlobalFilters(new AllExceptionsFilter());
    // Global prefix
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true
      })
    );

    userModel = moduleFixture.get(getModelToken(User));

    await app.init();
  });

  afterEach(async () => {
    await userModel.destroy({
      where: {},
      truncate: true,
      cascade: true,
      force: true
    });
  });

  afterAll(async () => {
    await postgresContainer.stop();
    await app.close();
  });

  describe('/api/v1/user/create (POST)', () => {
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
        .expect((response) => {
          expect(response.body).toEqual({
            statusCode: 400,
            message: 'Validation error',
            errors: ['email must be an email', 'email should not be empty']
          });
        });
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
        .expect((response) => {
          expect(response.body).toEqual({
            statusCode: 400,
            message: 'Validation error',
            errors: ['password must be longer than or equal to 6 characters']
          });
        });
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
        .expect((response) => {
          expect(response.body).toEqual({
            statusCode: 400,
            message: 'Validation error',
            errors: ['email must be an email']
          });
        });
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
        .expect((response) => {
          expect(response.body).toEqual({
            statusCode: 400,
            message: 'Validation error',
            errors: ['Role must be either ADMIN or USER']
          });
        });
    });

    it('should fail when trying to create user with existing email', async () => {
      // Create a user
      await request(app.getHttpServer())
        .post('/api/v1/user/create')
        .send(validUserDto)
        .expect(201)
        .expect((response) => {
          expect(response.body).toEqual({
            statusCode: 201,
            message: 'User created successfully.'
          });
        });

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
