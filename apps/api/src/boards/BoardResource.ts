import { BoardRepository } from './BoardRepository';
import { ReturnTypeOfPromise } from '../types/helpers';
import { User } from '@prisma/client';
import { Resource } from '../utils/Resource';

export class BoardResource extends Resource {
  buildResponse(
    board: ReturnTypeOfPromise<BoardRepository['findById']>,
    currentUser: User,
  ) {
    return {
      ...board,
      isOwner: board.ownerId === currentUser.id,
    };
  }
}
