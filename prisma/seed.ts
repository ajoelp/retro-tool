import { User } from '@prisma/client';
import { prisma } from './../apps/api/src/prismaClient';
import faker from 'faker'
import { v4 } from 'uuid'
import { generateJwtSecret } from './../apps/api/src/utils/JwtService'
import path from 'path'
import fs from 'fs/promises'

async function findOrCreateUser(email: string) {
  let user = await prisma.user.findFirst({ where: { email }, include: { boards: true } })
  if (!user) {
    user = await prisma.user.create({ data: { email, githubNickname: `user${v4()}`, avatar: faker.image.avatar() }, include: { boards: true } })
  }
  return user;
}


type PromiseArg<T> = T extends PromiseLike<infer U> ? U : T
type UserResult = PromiseArg<ReturnType<typeof findOrCreateUser>>

async function createOrGetBoardForUser({ id, boards }: UserResult) {
  let board = boards?.[0]

  if (!board) {
    board = await prisma.board.create({
      data: {
        ownerId: id,
        title: 'Random new board title',
        columns: {
          createMany: {
            data: [
              { title: 'Column 1', order: 0 },
              { title: 'Column 2', order: 1 },
              { title: 'Column 3', order: 2 }
            ]
          }
        }
      }
    })
  }
  return board
}

async function generateFixture(data: any) {
  await fs.writeFile(
    path.resolve(__dirname, '../apps/client-e2e/src/fixtures/userData.json'),
    JSON.stringify(data, null, 2)
  )
}

async function seed() {
  const user1 = await findOrCreateUser('test-user-1@example.com')
  const user2 = await findOrCreateUser('test-user-2@example.com')
  const board1 = await createOrGetBoardForUser(user1)

  await generateFixture({
    user1,
    user1Token: generateJwtSecret(user1),
    user2,
    user2Token: generateJwtSecret(user1),
    board1
  })

}

seed()
