import path from 'path';
import util from 'util';
import NodeEnvironment from 'jest-environment-node';
import childProcess from 'child_process';
import mysql, { Connection } from 'mysql';
import { prisma } from './src/prismaClient';

const schemaPath = path.resolve(__dirname, '../../', 'prisma', 'schema.prisma');

const exec = util.promisify(childProcess.exec);

const databaseUser = 'root';
const databasePassword = 'password';
const databasePort = 3308;

const prismaBinary = path.join(
  __dirname,
  '../../',
  'node_modules',
  '.bin',
  'prisma',
);

class PrismaTestEnvironment extends NodeEnvironment {
  private connection: Connection;
  private databaseName: string;

  constructor(config) {
    super(config);

    this.connection = mysql.createConnection({
      host: 'localhost',
      user: databaseUser,
      password: databasePassword,
      port: databasePort,
    });

    this.databaseName = `test_db_${(Math.random() + 1)
      .toString(36)
      .substring(7)}`;

    process.env.DATABASE_URL = `mysql://${databaseUser}:${databasePassword}@localhost:${databasePort}/${this.databaseName}?connection_limit=5`;
    this.global.process.env.DATABASE_URL = `mysql://${databaseUser}:${databasePassword}@localhost:${databasePort}/${this.databaseName}?connection_limit=5`;
  }

  connect() {
    return new Promise((resolve, reject) => {
      const connection = this.connection;
      connection.connect(function (error) {
        if (error) return reject(error);
        resolve(connection.threadId);
      });
    });
  }

  disconnect() {
    return new Promise((resolve, reject) => {
      const connection = this.connection;
      connection.end(function (error) {
        if (error) return reject(error);
        resolve(connection.threadId);
      });
    });
  }

  createDatabase() {
    return new Promise((resolve, reject) => {
      const connection = this.connection;
      connection.query(
        `CREATE DATABASE ${this.databaseName};`,
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
    });
  }

  dropDatabase() {
    return new Promise((resolve, reject) => {
      const connection = this.connection;
      connection.query(
        `DROP DATABASE IF EXISTS ${this.databaseName};`,
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
    });
  }

  async setup() {
    // Run the migrations to ensure our schema has the required structure
    await this.connect();
    await this.createDatabase();
    await exec(`${prismaBinary} db push --schema=${schemaPath}`);
    return super.setup();
  }

  async teardown() {
    try {
      await this.dropDatabase();
      await this.disconnect();
      await prisma.$disconnect();
    } catch (error) {
      // doesn't matter as the environment is torn down
    }
  }
}

module.exports = PrismaTestEnvironment;
