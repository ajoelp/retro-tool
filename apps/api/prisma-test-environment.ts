import path from 'path';
import NodeEnvironment from 'jest-environment-node';
import { prisma } from './src/prismaClient';
import {ensureDatabaseExists} from "@prisma/migrate/dist/utils/ensureDatabaseExists";
import {Migrate} from "@prisma/migrate";

const schemaPath = path.resolve(__dirname, '../../', 'prisma', 'schema.prisma');

class PrismaTestEnvironment extends NodeEnvironment {

  constructor(config) {
    super(config);
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
    this.global.process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
  }

  async push() {
    const migrate = new Migrate(schemaPath)

    await ensureDatabaseExists('push', true, schemaPath)

    try {
      await migrate.reset()
    } catch (e) {
      migrate.stop()
      throw e
    }

    try {
      await migrate.push({ force: true })
    } catch (e) {
      migrate.stop()
      throw e
    }
  }

  async setup() {
    await this.push()
    return super.setup();
  }

  async teardown() {
    try {
      await prisma.$disconnect();
    } catch (error) {
      // doesn't matter as the environment is torn down
    }
  }
}

module.exports = PrismaTestEnvironment;
