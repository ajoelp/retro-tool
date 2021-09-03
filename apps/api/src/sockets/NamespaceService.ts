import { Namespace, Server, Socket } from 'socket.io';
import { v4 as uuid } from 'uuid';
import { SocketEvents } from '../../../../libs/api-interfaces/src/lib/socket-events';

interface NamespaceWithData extends Socket {
  boardId: string;
}

export class NamespaceService {
  private io: Server;
  private namespace: Namespace;
  private path: RegExp;
  public clients: Map<string, NamespaceWithData>;

  constructor() {
    this.path = /\/boards\/(.*)/;
    this.clients = new Map<string, NamespaceWithData>();
  }

  setIO(io: Server) {
    this.io = io;
    this.namespace = this.io.of(this.path);
    return this;
  }

  onConnection(socket: Socket) {
    const boardId = this.path.exec(socket.nsp.name)?.[1];

    if (!boardId) {
      socket.disconnect();
      return;
    }

    const id = uuid();
    const namespace = socket as NamespaceWithData;
    namespace.boardId = boardId;

    this.clients.set(id, namespace);
    socket.on('disconnect', () => {
      this.clients.delete(id);
    });
  }

  sendEventToBoard(boardId: string, event: SocketEvents) {
    const boardClients = [...this.clients.values()].filter(
      (namespace) => namespace.boardId === boardId,
    );
    boardClients.forEach((client) => {
      client.emit('event', event);
    });
  }

  start() {
    this.namespace.on('connection', this.onConnection.bind(this));
  }

  reset() {
    this.clients.clear();
  }
}
