import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../service/user.service';
import { UserAuthService } from '../../auth/service/auth.service';
import { AuthGuard } from '../../guards/authGuard';

// Mock des services
const userServiceMock: Record<string, jest.Mock> = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
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

// Mock du STORAGE_PROVIDER
const storageProviderMock = {
  upload: jest.fn(),
  getPublicUrl: jest.fn(),
  delete: jest.fn(),
};

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: UserAuthService, useValue: userAuthServiceMock },
        { provide: 'STORAGE_PROVIDER', useValue: storageProviderMock }, // 🔹 obligatoire
      ],
    })
    // Mock le guard pour que les tests passent
    .overrideGuard(AuthGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
