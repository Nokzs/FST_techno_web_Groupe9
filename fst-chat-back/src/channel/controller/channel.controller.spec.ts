import { Test, TestingModule } from '@nestjs/testing';
import { ChannelController } from './channel.controller';
import { ChannelService } from '../service/channel.service';
import { AuthGuard } from '../../auth/guards/authGuard';
import { UserAuthService } from '../../auth/service/auth.service';

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
        {
          // Mock explicite du guard utilisé dans le controller
          provide: AuthGuard,
          useValue: { canActivate: jest.fn(() => true) },
        },
        {
          // Mock du UserAuthService avec la bonne référence de classe
          provide: UserAuthService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<ChannelController>(ChannelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
