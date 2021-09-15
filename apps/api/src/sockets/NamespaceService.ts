import { User } from '.prisma/client';
import { Namespace, Server, Socket } from 'socket.io';
import { v4 as uuid } from 'uuid';
import { SocketEvents } from '../../../../libs/api-interfaces/src/lib/socket-events';
import { tokenToUser } from '../utils/JwtService';

interface NamespaceWithData extends Socket {
  boardId: string;
  user: User
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

  async onConnection(socket: Socket) {
    const boardId = this.path.exec(socket.nsp.name)?.[1];

    if (!boardId) {
      socket.disconnect();
      return;
    }

    const token = (socket.handshake.auth.token ?? "").split(" ")?.[1]

    if (!token) {
      socket.disconnect()
      return;
    }

    const user = await tokenToUser(token)

    if (!user) {
      socket.disconnect()
      return;
    }


    const id = uuid();
    const namespace = socket as NamespaceWithData;
    namespace.boardId = boardId;
    namespace.user = user;

    this.clients.set(id, namespace);

    this.emitUserRoom()

    socket.on('disconnect', () => {
      this.clients.delete(id);
    });
  }

  emitUserRoom() {
    const boardUsers = [...this.clients.values()]
      .reduce<User[]>((carry, client) => {
        const index = carry.findIndex(user => user.id === client.user.id)
        if (index < 0) {
          return [...carry, client.user]
        }
        return carry;
      }, [])

    this.namespace.emit('users', boardUsers)
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
