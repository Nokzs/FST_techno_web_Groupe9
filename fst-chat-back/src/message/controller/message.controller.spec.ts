import { Test, TestingModule } from '@nestjs/testing';
import { MessageController } from './message.controller';
import { MessageService } from '../service/message.service';
import { AuthGuard } from '../../guards/authGuard';

// Mock du service
const messageServiceMock: Record<string, jest.Mock> = {
  create: jest.fn(),
  findAll: jest.fn(),
};

describe('MessageController', () => {
  let controller: MessageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageController],
      providers: [
        {
          provide: MessageService,
          useValue: messageServiceMock,
        },
      ],
    })
      .overrideGuard(AuthGuard) // 🔐 on mocke le guard ici
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<MessageController>(MessageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserId', () => {
    it('should return userId from request.user', () => {
      const mockRequest = {
        user: { sub: 'user-id-123' },
      } as any;

      const result = controller.getUserId(mockRequest);
      expect(result).toEqual({ userId: 'user-id-123' });
    });
  });
});
