import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from './message.service';
import { getModelToken } from '@nestjs/mongoose';

describe('MessageService', () => {
  let service: MessageService;

  const mockMessageModel = {
    create: jest.fn(),
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: getModelToken('Message'),
          useValue: mockMessageModel,
        },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
