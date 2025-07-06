import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { UserDto } from '../dto/user.dto';
import { Role } from '../model/user.model';
import { BadRequestException, HttpStatus } from '@nestjs/common';

describe('UserController', () => {
  let userController: UserController;
  let createUserMock: jest.Mock;

  const userDto: UserDto = {
    email: 'test@example.com',
    password: 'password123',
    name: 'userTest',
    lastName: 'lastNameTest',
    role: Role.ADMIN
  };

  beforeEach(async () => {
    createUserMock = jest.fn().mockResolvedValue(undefined);

    const app: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            create: createUserMock
          }
        }
      ]
    }).compile();

    userController = app.get<UserController>(UserController);
  });

  describe('Create new user', () => {
    it('should return statusCode and message when user is created', async () => {
      const result = await userController.create(userDto);

      expect(result).toEqual({
        statusCode: HttpStatus.CREATED,
        message: 'User created successfully.'
      });
      expect(createUserMock).toHaveBeenCalledWith(userDto);
      expect(createUserMock).toHaveBeenCalledTimes(1);
    });
  });

  it('should throw BadRequestException when userService.create fails', async () => {
    const errorMessage = 'Bad request creating user.';
    createUserMock.mockRejectedValue(new BadRequestException(errorMessage));

    await expect(userController.create(userDto)).rejects.toThrow(errorMessage);
    expect(createUserMock).toHaveBeenCalledWith(userDto);
    expect(createUserMock).toHaveBeenCalledTimes(1);
  });
});
