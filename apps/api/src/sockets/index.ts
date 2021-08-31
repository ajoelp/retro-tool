import {Server} from "socket.io";
import {NamespaceService} from "./NamespaceService";

export let namespaceInstance: NamespaceService

export function buildSockets(io: Server){
  namespaceInstance = new NamespaceService(io)
  namespaceInstance.start()
}
