import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway()
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('message')
  handleMessage(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    console.log('Message received => ', data);
    this.server.emit('message', data);
  }

  handleConnection(client: Socket) {
    Logger.log(`Client connected => ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    Logger.log(`Client disconnected => ${client.id}`);
  }
}
