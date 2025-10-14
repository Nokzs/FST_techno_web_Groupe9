import { Test, TestingModule } from '@nestjs/testing';
import { ChannelService } from './channel.service';
import { getModelToken } from '@nestjs/mongoose'; // si tu utilises Mongoose

describe('ChannelService', () => {
  let service: ChannelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChannelService,
        {
          provide: getModelToken('Channel'), // mock du model
          useValue: {}, // objet vide suffit pour les tests unitaires
        },
      ],
    }).compile();

    service = module.get<ChannelService>(ChannelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
