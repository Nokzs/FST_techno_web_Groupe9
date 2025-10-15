import { Test, TestingModule } from '@nestjs/testing';
import { ServerController } from './server.controller';
import { ServerService } from '../service/server.service';
import { AuthGuard } from '../../guards/authGuard';
import { UserAuthService } from '../../auth/service/auth.service';

describe('ServerController', () => {
  let controller: ServerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServerController],
      providers: [
        {
          provide: ServerService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
          },
        },
        {
          provide: AuthGuard,
          useValue: { canActivate: jest.fn(() => true) }, // mock du guard
        },
        {
          provide: UserAuthService, // 👈 mock du service utilisé par le guard
          useValue: {}, // objet vide suffit pour le test unitaire
        },
      ],
    }).compile();

    controller = module.get<ServerController>(ServerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
