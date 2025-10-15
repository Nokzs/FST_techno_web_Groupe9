import { Test, TestingModule } from '@nestjs/testing';
import { MessageController } from './message.controller';
import { MessageService } from '../service/message.service';
import { getModelToken } from '@nestjs/mongoose';
import { AuthGuard } from '../../guards/authGuard';
import { UserAuthService } from '../../auth/service/auth.service';

describe('MessageController', () => {
  let controller: MessageController;

  const mockMessageModel = {
    create: jest.fn(),
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageController],
      providers: [
        MessageService,
        {
          provide: getModelToken('Message'),
          useValue: mockMessageModel,
        },
        {
          provide: AuthGuard,
          useValue: { canActivate: jest.fn(() => true) },
        },
        {
          provide: UserAuthService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<MessageController>(MessageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
