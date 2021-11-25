import EventEmitter from 'eventemitter3';
import { NamespaceService } from './NamespaceService';
import { Server } from 'socket.io';
import { Board, User } from '.prisma/client';
import { prisma } from '../prismaClient';
import { generateJwtSecret } from '../utils/JwtService';
import { BOARD_USERS_EVENT_NAME } from '@retro-tool/api-interfaces';

class MockIO extends EventEmitter {
  of() {
    return this;
  }
  disconnect() {
    return this;
  }
}

describe('NamespaceService', () => {
  const mockIO = new MockIO();
  const service = new NamespaceService().setIO(mockIO as unknown as Server);
  let user: User;

  beforeAll(async () => {
    user = await prisma.user.create({
      data: { email: 'test@user.com', githubNickname: 'test', avatar: '' },
    });
    service.start();
  });

  beforeEach(() => {
    service.reset();
  });

  it('will disconnect if there is no token', async () => {
    const boardId = 'boardId';
    const socket = new MockIO() as any;
    const disconnectSpy = jest.spyOn(socket, 'disconnect');

    socket.nsp = {
      name: `/boards/${boardId}`,
    };

    await service.onConnection(socket);
    expect(disconnectSpy).toHaveBeenCalled();
  });

  it('will disconnect if there is no valid token', async () => {
    const boardId = 'boardId';
    const socket = new MockIO() as any;
    const disconnectSpy = jest.spyOn(socket, 'disconnect');

    socket.handshake = {
      auth: {
        token: `Bearer random-token`,
      },
    };

    socket.nsp = {
      name: `/boards/${boardId}`,
    };

    await service.onConnection(socket);
    expect(disconnectSpy).toHaveBeenCalled();
  });

  it('will add new client when a connection is made', async () => {
    const boardId = 'boardId';
    const socket = new MockIO() as any;

    socket.handshake = {
      auth: {
        token: `Bearer ${generateJwtSecret(user)}`,
      },
    };

    socket.nsp = {
      name: `/boards/${boardId}`,
    };

    await service.onConnection(socket);

    expect([...service.clients.values()]).toEqual(
      expect.arrayContaining([expect.objectContaining({ boardId })]),
    );
  });

  it('will disconnect the client if the url is wrong', async () => {
    const boardId = 'boardId';
    const socket = new MockIO() as any;
    socket.disconnect = jest.fn();

    socket.handshake = {
      auth: {
        token: `Bearer ${generateJwtSecret(user)}`,
      },
    };

    socket.nsp = {
      name: `/wrong-url/${boardId}`,
    };

    await service.onConnection(socket);

    expect(socket.disconnect).toHaveBeenCalledTimes(1);
  });

  it('will remove a client when a connection terminated', async () => {
    const boardId = 'boardId';
    const socket = new MockIO() as any;

    socket.handshake = {
      auth: {
        token: `Bearer ${generateJwtSecret(user)}`,
      },
    };

    socket.nsp = {
      name: `/boards/${boardId}`,
    };

    await service.onConnection(socket);

    expect([...service.clients.values()]).toEqual(
      expect.arrayContaining([expect.objectContaining({ boardId })]),
    );

    socket.emit('disconnect');
    expect([...service.clients.values()]).toEqual([]);
  });

  it('will emit an event to a client', () => {
    const boardId = 'sampleBoardId';
    const client = {
      boardId: boardId,
      emit: jest.fn(),
    };
    service.clients.set('random-id', client as any);
    const payload = { test: true } as unknown as Board;
    service.sendEventToBoard(boardId, {
      type: 'events/BOARD_UPDATED',
      payload,
    });

    expect(client.emit).toHaveBeenCalledWith('event', {
      type: 'events/BOARD_UPDATED',
      payload,
    });
  });

  it('will emit an event to a specific client', () => {
    const boardId = 'sampleBoardId';
    const client = {
      user: { id: '1' },
      boardId: boardId,
      emit: jest.fn(),
    };
    const notOurClient = {
      user: { id: '2' },
      boardId: boardId,
      emit: jest.fn(),
    };

    service.clients.set('random-id', client as any);
    service.clients.set('random-id2', notOurClient as any);
    const payload = { test: true } as unknown as Board;
    service.sendEventToUser(client.user.id, boardId, {
      type: 'events/BOARD_UPDATED',
      payload,
    });

    expect(client.emit).toHaveBeenCalledWith('event', {
      type: 'events/BOARD_UPDATED',
      payload,
    });
    expect(notOurClient.emit).not.toHaveBeenCalled();
  });

  it('will emit all users in a room', async () => {
    const boardId = 'sampleBoardId';

    const emit = jest.fn();
    const notCalledEmit = jest.fn();
    service.namespace = { emit } as any;

    service.clients.set('id-1', { boardId, user: { id: '1' }, emit } as any);
    service.clients.set('id-2', { boardId, user: { id: '1' }, emit } as any);
    service.clients.set('id-3', { boardId, user: { id: '2' }, emit } as any);
    service.clients.set('id-4', {
      boardId: 'different-board-id',
      user: { id: '3' },
      emit: notCalledEmit,
    } as any);

    await service.emitUserRoom(boardId);

    expect(emit).toHaveBeenCalledTimes(3);
    expect(emit).toHaveBeenCalledWith(
      'event',
      expect.objectContaining({
        payload: [{ id: '1' }, { id: '2' }],
        type: BOARD_USERS_EVENT_NAME,
      }),
    );
    expect(notCalledEmit).not.toHaveBeenCalled();
  });
});
