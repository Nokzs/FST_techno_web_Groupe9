import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from './message.service';
import { getModelToken } from '@nestjs/mongoose';
import { MessageTranslationService } from './message-translation.service';

describe('MessageService', () => {
  let service: MessageService;

  const mockModel = {};
  const translationServiceMock = {
    normalizeLanguage: jest.fn((value) => value ?? null),
    translateContent: jest.fn().mockResolvedValue({
      detectedLanguage: null,
      translations: {},
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        { provide: getModelToken('Message'), useValue: mockModel },
        { provide: getModelToken('MessageFile'), useValue: mockModel },
        { provide: getModelToken('Reaction'), useValue: mockModel },
        { provide: getModelToken('User'), useValue: mockModel },
        { provide: getModelToken('Channel'), useValue: mockModel },
        { provide: getModelToken('Server'), useValue: mockModel },
        {
          provide: MessageTranslationService,
          useValue: translationServiceMock,
        },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
