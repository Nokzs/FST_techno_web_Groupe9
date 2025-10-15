import { Test, TestingModule } from '@nestjs/testing';
import { ServerService } from './server.service';
import { getModelToken } from '@nestjs/mongoose';

describe('ServerService', () => {
  let service: ServerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServerService,
        {
          provide: getModelToken('Server'),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ServerService>(ServerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
