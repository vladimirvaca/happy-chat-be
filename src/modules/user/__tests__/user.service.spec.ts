import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { UserDto } from '../dto/user.dto';
import { Role, User } from '../model/user.model';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/sequelize';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UserService', () => {
  let userService: UserService;
  let configServiceGetOrThrowMock: jest.Mock;
  let createUserMock: jest.Mock;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword123',
    name: 'userTest',
    lastName: 'lastNameTest',
    role: Role.ADMIN,
    createdAt: new Date(),
    updatedAt: new Date()
  } as User;

  const userDto: UserDto = {
    email: 'test@example.com',
    password: 'password123',
    name: 'userTest',
    lastName: 'lastNameTest',
    role: Role.ADMIN
  };

  beforeEach(async () => {
    createUserMock = jest.fn().mockResolvedValue(mockUser);
    configServiceGetOrThrowMock = jest.fn().mockReturnValue('12');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User),
          useValue: {
            create: createUserMock
          }
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: configServiceGetOrThrowMock
          }
        }
      ]
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Create new user', () => {
    it('should successfully create a user', async () => {
      const hashedPassword = 'hashedPassword123';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await userService.create(userDto);

      expect(result).toEqual(UserDto.fromEntity(mockUser));
      expect(createUserMock).toHaveBeenCalledWith({
        ...userDto,
        password: hashedPassword
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(userDto.password, 12);
    });

    it('should throw BadRequestException when user creation fails', async () => {
      const badRequestException = new BadRequestException(
        'Bad request hashing password.'
      );
      createUserMock.mockRejectedValue(badRequestException);

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');

      await expect(userService.create(userDto)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('Create new user with hashed password', () => {
    it('should successfully hash password', async () => {
      const password = 'password123';
      const hashedPassword = 'hashedPassword123';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await userService.hashPassword(password);

      expect(result).toBe(hashedPassword);
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 12);
      expect(configServiceGetOrThrowMock).toHaveBeenCalledWith(
        'SALT_OR_ROUNDS'
      );
    });

    it('should throw BadRequestException when hashing fails', async () => {
      const password = 'password123';
      (bcrypt.hash as jest.Mock).mockRejectedValue(
        new BadRequestException('Hashing failed.')
      );

      await expect(userService.hashPassword(password)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw BadRequestException when config is invalid', async () => {
      const password = 'password123';
      configServiceGetOrThrowMock.mockImplementation(() => {
        throw new Error('Config not found');
      });

      await expect(userService.hashPassword(password)).rejects.toThrow(
        BadRequestException
      );
    });
  });
});
