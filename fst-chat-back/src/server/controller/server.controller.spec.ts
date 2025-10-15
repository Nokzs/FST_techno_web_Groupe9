import { Test, TestingModule } from '@nestjs/testing';
import { ServerController } from './server.controller';
import { ServerService } from '../service/server.service';
import { AuthGuard } from '../../guards/authGuard';

// Mock du service
const serverServiceMock: Record<string, jest.Mock> = {
  create: jest.fn(),
  findAll: jest.fn(),
};

describe('ServerController', () => {
  let controller: ServerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServerController],
      providers: [
        {
          provide: ServerService,
          useValue: serverServiceMock,
        },
      ],
    })
      // 👇 Remplace uniquement le guard AuthGuard dans ce test
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ServerController>(ServerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
