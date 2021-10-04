import { BaseScript } from "./BaseScript";

export class AssignUsersToExistingBoards extends BaseScript {
  static functionName = "Assign users to an existing board."

  async run() {

    const boards = await this.prismaClient.board.findMany({ include: { owner: true } })

    for (const board of boards) {
      const boardAccess = await this.prismaClient.boardAccess.findFirst({ where: { boardId: board.id, userId: board.owner.id } })

      if (!boardAccess) {
        console.log(`Creating board access for user ${board.owner.githubNickname}`)
        try {
          await this.prismaClient.boardAccess.create({ data: { boardId: board.id, userId: board.owner.id } })
        } catch (e) {
          console.error(e)
        }
      }
    }
  }

}
