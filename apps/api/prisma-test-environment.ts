import path from 'path';
import NodeEnvironment from 'jest-environment-node';
import { prisma } from './src/prismaClient';
import {nanoid} from "nanoid";
import childProcess from 'child_process'
import * as util from "util";
import { Client } from 'pg'

const exec = util.promisify(childProcess.exec)

const schemaPath = path.resolve(__dirname, '../../', 'prisma', 'schema.prisma');

const prismaBinary = path.join(
  __dirname,
  '../../',
  'node_modules',
  '.bin',
  'prisma',
)


class PrismaTestEnvironment extends NodeEnvironment {
  private schemaName: string;
  private connection: any;

  constructor(config) {
    super(config);
    this.schemaName = `test_${nanoid()}`;
    this.connection = process.env.TEST_DATABASE_URL.replace('schema=public', `schema=${this.schemaName}` )
    process.env.DATABASE_URL = this.connection;
    this.global.process.env.DATABASE_URL = this.connection;
  }


  async setup() {
    await exec(`${prismaBinary} db push --schema=${schemaPath}`)
    return super.setup();
  }

  async teardown() {
    const client = new Client({
      connectionString: this.connection
    })

    try {
      await client.connect()
      await client.query(`DROP SCHEMA IF EXISTS "${this.schemaName}" CASCADE`);
      await client.end();
      await prisma.$disconnect();
    } catch (error) {
      // doesn't matter as the environment is torn down
    }
  }
}

module.exports = PrismaTestEnvironment;
