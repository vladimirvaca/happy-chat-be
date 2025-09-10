import { Body, Controller, HttpStatus, Logger, Post } from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { UserService } from './user.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from '../../types/Response';
import { ErrorResponseDto } from '../filter/errorResponse.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created successfully.'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request.',
    type: ErrorResponseDto
  })
  @ApiOperation({ summary: 'Create a new user.' })
  @Post('create')
  async create(@Body() userDto: UserDto): Promise<Response> {
    Logger.log(`Creating user:  ${userDto.email}`);
    await this.userService.create(userDto);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'User created successfully.'
    };
  }
}
