import EventEmitter from 'eventemitter3';
import { NamespaceService } from './NamespaceService';
import { Server } from 'socket.io';
import { Board } from '@prisma/client';

class MockIO extends EventEmitter {
  of() {
    return this;
  }
}

describe.skip('NamespaceService', () => {
  const mockIO = new MockIO();
  const service = new NamespaceService().setIO(mockIO as unknown as Server);

  beforeAll(() => {
    service.start();
  });

  beforeEach(() => {
    service.reset();
  });

  it('will add new client when a connection is made', () => {
    const boardId = 'boardId';
    const socket = new MockIO() as any;

    socket.nsp = {
      name: `/boards/${boardId}`,
    };

    mockIO.emit('connection', socket);

    expect([...service.clients.values()]).toEqual(
      expect.arrayContaining([expect.objectContaining({ boardId })]),
    );
  });

  it('will disconnect the client if the url is wrong', () => {
    const boardId = 'boardId';
    const socket = new MockIO() as any;
    socket.disconnect = jest.fn();
    socket.nsp = {
      name: `/wrong-url/${boardId}`,
    };
    mockIO.emit('connection', socket);
    expect(socket.disconnect).toHaveBeenCalledTimes(1);
  });

  it('will remove a client when a connection terminated', () => {
    const boardId = 'boardId';
    const socket = new MockIO() as any;

    socket.nsp = {
      name: `/boards/${boardId}`,
    };

    mockIO.emit('connection', socket);

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
});
