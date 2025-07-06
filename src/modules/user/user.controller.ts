import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Logger,
  Post
} from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { UserService } from './user.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created successfully.'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request.'
  })
  @ApiOperation({ summary: 'Create a new user' })
  @Post('create')
  async create(@Body() userDto: UserDto): Promise<any> {
    try {
      Logger.log('Creating user');
      await this.userService.create(userDto);

      return {
        statusCode: HttpStatus.CREATED,
        message: 'User created succesfully'
      };
    } catch (e) {
      Logger.error('Error creating user: ', e);
      const error = e instanceof Error ? e : null;

      throw new BadRequestException(
        error?.message ?? 'Bad request creating user.'
      );
    }
  }
}
