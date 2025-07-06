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
import { Response } from '../../types/Response';

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
  async create(@Body() userDto: UserDto): Promise<Response> {
    try {
      Logger.log(`Creating user:  ${userDto.email}`);
      await this.userService.create(userDto);

      return {
        statusCode: HttpStatus.CREATED,
        message: 'User created successfully.'
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
