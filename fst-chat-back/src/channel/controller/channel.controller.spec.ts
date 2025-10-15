import { Test, TestingModule } from '@nestjs/testing';
import { ChannelController } from './channel.controller';
import { ChannelService } from '../service/channel.service';
import { AuthGuard } from '../../guards/authGuard';

describe('ChannelController', () => {
  let controller: ChannelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChannelController],
      providers: [
        {
          provide: ChannelService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard) // ✅ remplace le vrai guard par un mock
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ChannelController>(ChannelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
