import { AuthService } from './auth.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  Body,
  Controller,
  HttpStatus,
  Post,
  UnauthorizedException
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UserService } from '../user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {}

  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Jwt token generated successfully.'
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Unauthorized. Bad credentials.'
  })
  @ApiOperation({ summary: 'Generate a Jwt token for a user.' })
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<{ accessToken: string }> {
    const existingUser = await this.userService.findOneByEmail(loginDto.email);

    if (!existingUser) {
      throw new UnauthorizedException('User does not exist.');
    } else {
      const isPasswordMatching = await this.authService.isPasswordMatching(
        loginDto.password,
        existingUser.password
      );

      if (isPasswordMatching) {
        return {
          accessToken: this.authService.generateJwtToken(loginDto.email)
        };
      } else {
        throw new UnauthorizedException('Password is incorrect.');
      }
    }
  }
}
