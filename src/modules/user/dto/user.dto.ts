import { IsNotEmpty, MinLength, IsEmail, IsEnum } from 'class-validator';
import { Role, User } from '../model/user.model';
import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ example: 'Tony' })
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty({ example: 'Stark' })
  @IsNotEmpty()
  readonly lastName: string;

  @ApiProperty({ example: 'tonystark91@gmail.com' })
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @ApiProperty({ example: 'secretpassword' })
  @IsNotEmpty()
  @MinLength(6)
  readonly password: string;

  @ApiProperty({ example: Role.USER, enum: Role })
  @IsNotEmpty()
  @IsEnum(Role, {
    message: 'Role must be either ADMIN or USER'
  })
  readonly role: Role = Role.USER;

  constructor(data: Partial<User> = {}) {
    Object.assign(this, data);
  }

  static fromEntity(user: User): UserDto {
    return new UserDto(user);
  }
}
