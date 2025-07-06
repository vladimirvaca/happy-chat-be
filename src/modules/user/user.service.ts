import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './model/user.model';
import { UserDto } from './dto/user.dto';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User) private readonly userRepository: typeof User,
    private readonly configService: ConfigService
  ) {}

  async create(userDto: UserDto): Promise<UserDto> {
    const hashedPassword = await this.hashPassword(userDto.password);
    const userDtoWithHashedPassword = {
      ...userDto,
      password: hashedPassword
    };

    const user = await this.userRepository.create({
      ...userDtoWithHashedPassword
    });

    return UserDto.fromEntity(user);
  }

  async hashPassword(password: string): Promise<string> {
    try {
      const saltOrRounds = Number(
        this.configService.getOrThrow<number>('SALT_OR_ROUNDS')
      );

      return await bcrypt.hash(password, saltOrRounds);
    } catch (e) {
      Logger.error('Error hashing password: ', e);
      const error = e instanceof Error ? e : null;

      throw new BadRequestException(
        error?.message ?? 'Bad request hashing password.'
      );
    }
  }
}
