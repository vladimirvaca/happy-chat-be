import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table
} from 'sequelize-typescript';
import { User } from '../../user/model/user.model';
import { Channel } from './channel.model';

export enum Role {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  VISITOR = 'VISITOR'
}

@Table
export class ChannelMember extends Model {
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  declare userId: number;

  @ForeignKey(() => Channel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  declare channelId: number;

  @Column({
    type: DataType.ENUM,
    values: ['ADMIN', 'MEMBER', 'VISITOR'],
    defaultValue: Role.MEMBER,
    allowNull: false
  })
  declare role: Role;
}
