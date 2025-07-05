import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';

@Module({
  imports: [],
  controllers: [],
  providers: [WebsocketGateway],
  exports: [],
})
export class WebsocketModule {}
