import {
  IsNotEmpty,
  MinLength,
  IsEmail,
  IsEnum,
  validate,
} from 'class-validator';
import { Role, User } from '../model/user.model';
import { BadRequestException } from '@nestjs/common';

export class UserDto {
  @IsNotEmpty()
  readonly name: string;

  @IsNotEmpty()
  readonly lastName: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @MinLength(6)
  readonly password: string;

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

  async isValid(): Promise<boolean> {
    const errors = await validate(this);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }
    return true;
  }
}
