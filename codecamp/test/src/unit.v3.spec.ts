import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

class MockAppService {
  getHello() {
    return 'Hello World!';
  }
}

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const appModule: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useClass: MockAppService,
        },
      ],
    }).compile();

    appController = appModule.get<AppController>(AppController);
  });

  describe('getHello', () => {
    it('hello world', () => {
      const result = appController.getHello();
      expect(result).toBe('Hello World!');
    });
  });
});
