import path from 'path'
import fs from 'fs'
import util from 'util'
import NodeEnvironment from 'jest-environment-node'
import {nanoid} from 'nanoid'
import childProcess from 'child_process'

const exec = util.promisify(childProcess.exec)

const prismaBinary = path.join(
    __dirname,
    '../../',
    'node_modules',
    '.bin',
    'prisma',
)

class PrismaTestEnvironment extends NodeEnvironment {
    dbName: string
    dbPath: string
    constructor(config) {
        super(config)
        // Generate a unique sqlite identifier for this test context
        this.dbName = `test_${nanoid()}.db`
        this.dbPath = path.join(
          __dirname,
          '../../',
          'prisma',
          this.dbName
        )
        process.env.DATABASE_URL = `file:${this.dbPath}`
        this.global.process.env.DATABASE_URL = `file:${this.dbPath}`
    }

    async setup() {
        // Run the migrations to ensure our schema has the required structure
        await exec(`${prismaBinary} db push --preview-feature`)
        return super.setup()
    }

    async teardown() {
        try {
            await fs.promises.unlink(this.dbPath)
        } catch (error) {
            // doesn't matter as the environment is torn down
        }
    }
}

module.exports = PrismaTestEnvironment
