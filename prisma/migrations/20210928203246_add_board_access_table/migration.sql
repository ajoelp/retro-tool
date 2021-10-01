-- CreateTable
CREATE TABLE "BoardAccess" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "BoardAccess_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BoardAccess" ADD CONSTRAINT "BoardAccess_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardAccess" ADD CONSTRAINT "BoardAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
