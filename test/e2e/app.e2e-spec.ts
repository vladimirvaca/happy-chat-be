import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { PostgresTestContainer } from '../utils/PostgresTestContainer';
import { WAIT_FOR_APP_TO_LOAD_TIMEOUT } from './constants';

describe('AppController (e2e)', () => {
  const postgresContainer = new PostgresTestContainer();
  let app: INestApplication<App>;

  beforeAll(async () => {
    await postgresContainer.start();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    // Global prefix
    app.setGlobalPrefix('api/v1');
    await app.init();
  }, WAIT_FOR_APP_TO_LOAD_TIMEOUT);

  afterAll(async () => {
    await app.close();
    await postgresContainer.stop();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/app')
      .expect(200)
      .expect('App running!!');
  });
});
