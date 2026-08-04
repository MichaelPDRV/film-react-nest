import { Test, TestingModule } from '@nestjs/testing';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';
import { FilmsDataDto } from './dto/films.dto';

describe('FilmsController', () => {
  let controller: FilmsController;
  // Создаём мок-объект сервиса
  const filmsMock = {
    getFilms: jest
      .fn()
      .mockResolvedValue({ total: 0, items: [] } as FilmsDataDto),
    getFilmSchedule: jest.fn().mockResolvedValue({ total: 0, items: [] }),
  };
  // Перед каждым тестом создаём тестовый модуль
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilmsController],
      providers: [
        {
          provide: 'IFilmsRepository',
          useValue: {},
        },
        {
          provide: FilmsService,
          useValue: filmsMock,
        },
      ],
    }).compile();

    controller = module.get<FilmsController>(FilmsController);
  });

  // Тест для метода getFilms
  it('getFilms возвращает данные из сервиса', async () => {
    await expect(controller.getFilms()).resolves.toEqual({
      total: 0,
      items: [],
    });
    expect(filmsMock.getFilms).toHaveBeenCalled();
  });
  // Тест для метода getFilmSchedule
  it('getFilmSchedule вызывает сервис с переданным UUID', async () => {
    const uuid = '11111111-1111-1111-1111-111111111111';
    await expect(controller.getFilmSchedule(uuid)).resolves.toBeDefined();
    expect(filmsMock.getFilmSchedule).toHaveBeenCalledWith(uuid);
  });
});
