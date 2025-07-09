import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { UserService } from '../../user/user.service';
import { UnauthorizedException } from '@nestjs/common';
import { LoginDto } from '../dto/login.dto';
import { UserDto } from '../../user/dto/user.dto';
import { Role } from '../../user/model/user.model';

describe('AuthController', () => {
  let authController: AuthController;
  let findOneByEmailMock: jest.Mock;
  let isPasswordMatchingMock: jest.Mock;
  let generateJwtTokenMock: jest.Mock;

  const loginDto: LoginDto = {
    email: 'test@example.com',
    password: 'password123'
  };

  const userDto: UserDto = {
    email: 'test@example.com',
    password: 'hashedPassword123',
    name: 'userTest',
    lastName: 'lastNameTest',
    role: Role.ADMIN
  };

  beforeEach(async () => {
    findOneByEmailMock = jest.fn();
    isPasswordMatchingMock = jest.fn();
    generateJwtTokenMock = jest.fn().mockReturnValue('mockAccessToken');

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: UserService,
          useValue: {
            findOneByEmail: findOneByEmailMock
          }
        },
        {
          provide: AuthService,
          useValue: {
            isPasswordMatching: isPasswordMatchingMock,
            generateJwtToken: generateJwtTokenMock
          }
        }
      ]
    }).compile();

    authController = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return an access token on successful login', async () => {
      findOneByEmailMock.mockResolvedValue(userDto);
      isPasswordMatchingMock.mockResolvedValue(true);

      const result = await authController.login(loginDto);

      expect(result).toEqual({ accessToken: 'mockAccessToken' });
      expect(findOneByEmailMock).toHaveBeenCalledWith(loginDto.email);
      expect(isPasswordMatchingMock).toHaveBeenCalledWith(
        loginDto.password,
        userDto.password
      );
      expect(generateJwtTokenMock).toHaveBeenCalledWith(loginDto.email);
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      findOneByEmailMock.mockResolvedValue(null);

      await expect(authController.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
      expect(findOneByEmailMock).toHaveBeenCalledWith(loginDto.email);
      expect(isPasswordMatchingMock).not.toHaveBeenCalled();
      expect(generateJwtTokenMock).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      findOneByEmailMock.mockResolvedValue(userDto);
      isPasswordMatchingMock.mockResolvedValue(false);

      await expect(authController.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
      expect(findOneByEmailMock).toHaveBeenCalledWith(loginDto.email);
      expect(isPasswordMatchingMock).toHaveBeenCalledWith(
        loginDto.password,
        userDto.password
      );
      expect(generateJwtTokenMock).not.toHaveBeenCalled();
    });
  });
});
