import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './model/user.model';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User) private readonly userRepository: typeof User,
  ) {}

  async create(userDto: UserDto): Promise<UserDto> {
    const user = await this.userRepository.create({ ...userDto });
    return UserDto.fromEntity(user);
  }
}
