import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../service/user.service';
import { UserAuthService } from '../../auth/service/auth.service';

const userServiceMock: Record<string, jest.Mock> = {
  findByEmail: jest.fn(),
  create: jest.fn(),
  comparePassword: jest.fn(),
  setLastConnection: jest.fn(),
};

const userAuthServiceMock: Record<string, jest.Mock> = {
  sanitizeUser: jest.fn(),
  createAuthToken: jest.fn(),
  attachAuthCookie: jest.fn(),
  getUserId: jest.fn(),
};

describe('UserAuthController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: userServiceMock,
        },
        {
          provide: UserAuthService,
          useValue: userAuthServiceMock,
        },
      ],
    }).compile();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    controller = module.get(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
