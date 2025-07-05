import { IsNotEmpty, MinLength, IsEmail, IsEnum } from 'class-validator';
import { Role, User } from '../model/user.model';

export class UserDto {
  @IsNotEmpty()
  readonly name: string = '';

  @IsNotEmpty()
  readonly lastName: string = '';

  @IsNotEmpty()
  @IsEmail()
  readonly email: string = '';

  @IsNotEmpty()
  @MinLength(6)
  readonly password: string = '';

  @IsNotEmpty()
  @IsEnum(Role, {
    message: 'Role must be either ADMIN or USER',
  })
  readonly role: Role = Role.USER;

  constructor(data: Partial<User> = {}) {
    Object.assign(this, data);
  }

  static fromEntity(user: User): UserDto {
    return new UserDto(user);
  }
}
