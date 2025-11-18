import { Test, TestingModule } from '@nestjs/testing';
import { FilmsService } from './films.service';
import { IFilmsRepository } from '../repository/films.repository.interface';
import {
  FilmDto,
  SessionDto,
  FilmsDataDto,
  ScheduleDataDto,
} from './dto/films.dto';

// Мок данных
const mockFilmDto: FilmDto = {
  id: 'test-film-id',
  rating: 8.0,
  director: 'Test Director',
  tags: ['Test'],
  title: 'Test Film',
  about: 'About test film',
  description: 'Description of test film',
  image: '/test.jpg',
  cover: '/test_cover.jpg',
};

const mockSessionDto: SessionDto = {
  id: 'test-session-id',
  daytime: '2025-01-01T10:00:00Z',
  hall: 1,
  rows: 10,
  seats: 10,
  price: 300,
  taken: [],
};

const mockFilmsData: FilmsDataDto = {
  total: 1,
  items: [mockFilmDto],
};

const mockScheduleData: ScheduleDataDto = {
  total: 1,
  items: [mockSessionDto],
};

// Мок репозитория
const mockFilmsRepository = {
  getAllFilms: jest.fn(),
  getFilmSchedule: jest.fn(),
  findSessionById: jest.fn(),
  updateSessionTaken: jest.fn(),
};
// Тестовый блок для FilmsService
describe('FilmsService', () => {
  let service: FilmsService;
  let repository: IFilmsRepository;
  // Перед каждым тестом создаем тестовый модуль
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilmsService,
        {
          provide: 'IFilmsRepository',
          useValue: mockFilmsRepository,
        },
      ],
    }).compile();

    service = module.get<FilmsService>(FilmsService);
    repository = module.get<IFilmsRepository>('IFilmsRepository');
  });
  // Проверяем, что сервис создан корректно
  it('Сервис должен быть определен', () => {
    expect(service).toBeDefined();
  });
  // Тестируем метод getFilms
  describe('getFilms', () => {
    it('должен вызвать repository.getAllFilms и возвратить результат', async () => {
      mockFilmsRepository.getAllFilms.mockResolvedValue(mockFilmsData);

      const result = await service.getFilms();

      expect(repository.getAllFilms).toHaveBeenCalled();
      expect(result).toEqual(mockFilmsData);
    });
  });
  // Тестируем метод getFilmSchedule
  describe('getFilmSchedule', () => {
    it('должен вызвать repository.getFilmSchedule с id фильма и возвратить результат', async () => {
      const filmId = 'test-film-id';
      mockFilmsRepository.getFilmSchedule.mockResolvedValue(mockScheduleData);

      const result = await service.getFilmSchedule(filmId);

      expect(repository.getFilmSchedule).toHaveBeenCalledWith(filmId);
      expect(result).toEqual(mockScheduleData);
    });
  });
});
