import { Column, DataType, Model, Table } from 'sequelize-typescript';

export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

@Table
export class User extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare lastName: string;

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare password: string;

  @Column({
    type: DataType.ENUM,
    values: ['ADMIN', 'USER'],
    defaultValue: Role.USER,
    allowNull: false
  })
  declare role: Role;
}
