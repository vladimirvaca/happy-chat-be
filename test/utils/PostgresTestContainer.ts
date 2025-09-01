import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer
} from '@testcontainers/postgresql';

export class PostgresTestContainer {
  private container: StartedPostgreSqlContainer;

  async start(): Promise<StartedPostgreSqlContainer> {
    this.container = await new PostgreSqlContainer(
      'ghcr.io/dbsystel/postgresql-partman:17'
    )
      .withUsername('testUser')
      .withPassword('testPassword')
      .withDatabase('testDb')
      .withExposedPorts(5432)
      .start();

    // Set environment variables for database connection
    process.env.DB_HOST = this.container.getHost();
    process.env.DB_PORT = this.container.getMappedPort(5432).toString();
    process.env.DB_USER = this.container.getUsername();
    process.env.DB_PASS = this.container.getPassword();
    process.env.DB_NAME = this.container.getDatabase();

    return this.container;
  }

  async stop(): Promise<void> {
    if (this.container) {
      await this.container.stop();
    }
  }
}
