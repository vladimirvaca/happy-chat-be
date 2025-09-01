import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table
} from 'sequelize-typescript';
import { User } from '../../user/model/user.model';
import { Channel } from '../../channel/model/channel.model';
import { Chat } from '../../chat/model/chat.model';

export enum MessageType {
  DIRECT = 'DIRECT',
  GROUP = 'GROUP',
  CHANNEL = 'CHANNEL'
}

@Table({
  indexes: [
    { fields: ['chatId'] },
    { fields: ['channelId'] },
    { fields: ['senderId'] },
    { fields: ['type'] },
    { fields: ['chatId', 'createdAt'] },
    { fields: ['channelId', 'createdAt'] }
  ]
})
export class Message extends Model {
  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  declare content: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  declare senderId: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  declare recipientId: number | null;

  @ForeignKey(() => Chat)
  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  declare chatId: number | null;

  @ForeignKey(() => Channel)
  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  declare channelId: number | null;

  @Column({
    type: DataType.ENUM,
    values: ['DIRECT', 'GROUP', 'CHANNEL'],
    allowNull: false
  })
  declare type: MessageType;
}
