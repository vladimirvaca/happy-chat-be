import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let jwtServiceSignMock: jest.Mock;

  beforeEach(async () => {
    jwtServiceSignMock = jest.fn().mockReturnValue('mockedJwtToken');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jwtServiceSignMock
          }
        },
        {
          provide: ConfigService,
          useValue: {}
        }
      ]
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isPasswordMatching', () => {
    it('should return true if passwords match', async () => {
      const password = 'password123';
      const hashedPassword = 'hashedPassword123';
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.isPasswordMatching(
        password,
        hashedPassword
      );

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });

    it('should return false if passwords do not match', async () => {
      const password = 'wrongPassword';
      const hashedPassword = 'hashedPassword123';
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await authService.isPasswordMatching(
        password,
        hashedPassword
      );

      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });
  });

  describe('generateJwtToken', () => {
    it('should return a JWT token', () => {
      const email = 'test@example.com';
      const token = 'mockedJwtToken';

      const result = authService.generateJwtToken(email);

      expect(result).toBe(token);
      expect(jwtServiceSignMock).toHaveBeenCalledWith({ email });
    });
  });
});
