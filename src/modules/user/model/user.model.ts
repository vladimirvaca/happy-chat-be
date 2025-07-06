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
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  lastName: string;

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  password: string;

  @Column({
    type: DataType.ENUM,
    values: ['ADMIN', 'USER'],
    defaultValue: 'USER',
    allowNull: false
  })
  role: Role;
}
