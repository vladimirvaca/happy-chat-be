import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table
} from 'sequelize-typescript';
import { User } from '../../user/model/user.model';

@Table
export class Chat extends Model {
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  declare createdBy: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true
  })
  declare isActive: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  declare lastMessageAt: Date | null;
}
