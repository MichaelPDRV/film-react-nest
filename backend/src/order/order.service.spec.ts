import { Test } from '@nestjs/testing';
import { OrderService } from '../../src/order/order.service';
import { IFilmsRepository } from '../../src/repository/films.repository.interface';
import {
  CreateOrderDto,
  OrderResponseDto,
} from '../../src/order/dto/order.dto';

describe('OrderService', () => {
  let orderService: OrderService;
  let filmsRepository: IFilmsRepository;

  // Создаем мок репозитория
  const mockFilmsRepository = {
    getAllFilms: jest.fn(),
    getFilmSchedule: jest.fn(),
    findSessionById: jest.fn(),
    updateSessionTaken: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: 'IFilmsRepository',
          useValue: mockFilmsRepository,
        },
      ],
    }).compile();

    orderService = moduleRef.get<OrderService>(OrderService);
    filmsRepository = moduleRef.get('IFilmsRepository');
  });

  describe('createOrder', () => {
    it('должен успешно создавать заказ с одним билетом', async () => {
      const orders: CreateOrderDto[] = [
        {
          film: 'film1',
          session: 'session1',
          row: 1,
          seat: 2,
        },
      ];

      const mockSession = {
        id: 'session1',
        daytime: '2025-10-10T18:00:00',
        hall: 1,
        rows: 10,
        seats: 20,
        price: 350,
        taken: ['1:1', '2:3'],
      };

      // Настраиваем моки
      mockFilmsRepository.findSessionById.mockResolvedValue(mockSession);
      mockFilmsRepository.updateSessionTaken.mockResolvedValue(true);

      const result = await orderService.createOrder(orders);

      // Проверяем успешный результат
      expect(result).toHaveProperty('total', 1);
      expect(result).toHaveProperty('items');
      expect((result as OrderResponseDto).items[0]).toMatchObject({
        film: 'film1',
        session: 'session1',
        row: 1,
        seat: 2,
        price: 350,
      });
      expect((result as OrderResponseDto).items[0].id).toContain('order-');

      // Проверяем вызовы репозитория
      expect(filmsRepository.findSessionById).toHaveBeenCalledWith('session1');
      expect(filmsRepository.updateSessionTaken).toHaveBeenCalledWith(
        'session1',
        ['1:1', '2:3', '1:2'],
      );
      // ОШИБКА: если не обновляется список занятых мест, возможны двойные бронирования
    });

    it('должен возвращать ошибку при пустом списке заказов', async () => {
      const orders: CreateOrderDto[] = [];

      const result = await orderService.createOrder(orders);

      expect(result).toEqual({
        error: 'Список заказов не может быть пустым',
      });
      // ОШИБКА: если не проверять пустой список, создадутся пустые заказы
    });

    it('должен возвращать ошибку если сеанс не найден', async () => {
      const orders: CreateOrderDto[] = [
        {
          film: 'film1',
          session: 'non-existent-session',
          row: 1,
          seat: 2,
        },
      ];

      mockFilmsRepository.findSessionById.mockResolvedValue(null);

      const result = await orderService.createOrder(orders);

      expect(result).toEqual({
        error: 'Сеанс не найден',
      });
      expect(filmsRepository.findSessionById).toHaveBeenCalledWith(
        'non-existent-session',
      );
      // ОШИБКА: если не проверять существование сеанса, пользователь получит билет на несуществующий сеанс
    });

    it('должен возвращать ошибку если место уже занято', async () => {
      const orders: CreateOrderDto[] = [
        {
          film: 'film1',
          session: 'session1',
          row: 1,
          seat: 2,
        },
      ];

      const mockSession = {
        id: 'session1',
        daytime: '2025-10-10T18:00:00',
        hall: 1,
        rows: 10,
        seats: 20,
        price: 350,
        taken: ['1:2', '2:3'], // Место 1:2 уже занято
      };

      mockFilmsRepository.findSessionById.mockResolvedValue(mockSession);

      const result = await orderService.createOrder(orders);

      expect(result).toEqual({
        error: 'Место 1:2 уже занято',
      });
      // ОШИБКА: если не проверять занятость мест, возможны конфликты бронирования
    });

    it('должен возвращать ошибку если место не существует в зале', async () => {
      const orders: CreateOrderDto[] = [
        {
          film: 'film1',
          session: 'session1',
          row: 15, // Несуществующий ряд
          seat: 2,
        },
      ];

      const mockSession = {
        id: 'session1',
        daytime: '2025-10-10T18:00:00',
        hall: 1,
        rows: 10, // Максимум 10 рядов
        seats: 20,
        price: 350,
        taken: [],
      };

      mockFilmsRepository.findSessionById.mockResolvedValue(mockSession);

      const result = await orderService.createOrder(orders);

      expect(result).toEqual({
        error: 'Место 15:2 не существует. Зал имеет 10 рядов и 20 мест в ряду',
      });
      // ОШИБКА: если не проверять границы зала, пользователь сможет забронировать несуществующее место
    });

    it('должен предотвращать дублирование мест в одном запросе', async () => {
      const orders: CreateOrderDto[] = [
        {
          film: 'film1',
          session: 'session1',
          row: 1,
          seat: 2,
        },
        {
          film: 'film1',
          session: 'session1',
          row: 1,
          seat: 2, // Дублирующееся место
        },
      ];

      const mockSession = {
        id: 'session1',
        daytime: '2025-10-10T18:00:00',
        hall: 1,
        rows: 10,
        seats: 20,
        price: 350,
        taken: [],
      };

      mockFilmsRepository.findSessionById.mockResolvedValue(mockSession);

      const result = await orderService.createOrder(orders);

      expect(result).toEqual({
        error: 'Место 1:2 уже обрабатывается в этом запросе',
      });
      // ОШИБКА: если не проверять дубли в одном запросе, одно место будет забронировано дважды
    });

    it('должен успешно обрабатывать несколько разных билетов', async () => {
      const orders: CreateOrderDto[] = [
        {
          film: 'film1',
          session: 'session1',
          row: 1,
          seat: 2,
        },
        {
          film: 'film1',
          session: 'session1',
          row: 1,
          seat: 3,
        },
      ];

      const mockSession = {
        id: 'session1',
        daytime: '2025-10-10T18:00:00',
        hall: 1,
        rows: 10,
        seats: 20,
        price: 350,
        taken: [],
      };

      mockFilmsRepository.findSessionById
        .mockResolvedValueOnce(mockSession) // Первый вызов
        .mockResolvedValueOnce({ ...mockSession, taken: ['1:2'] }); // Второй вызов - место уже забронировано

      mockFilmsRepository.updateSessionTaken.mockResolvedValue(true);

      const result = await orderService.createOrder(orders);

      expect((result as OrderResponseDto).total).toBe(2);
      expect((result as OrderResponseDto).items).toHaveLength(2);

      // Проверяем что updateSessionTaken вызывался дважды с правильными параметрами
      expect(filmsRepository.updateSessionTaken).toHaveBeenCalledTimes(2);
      expect(filmsRepository.updateSessionTaken).toHaveBeenNthCalledWith(
        1,
        'session1',
        ['1:2'],
      );
      expect(filmsRepository.updateSessionTaken).toHaveBeenNthCalledWith(
        2,
        'session1',
        ['1:2', '1:3'], // Второй вызов включает оба места
      );
      // ОШИБКА: если неправильно обновлять занятые места, могут потеряться предыдущие брони
    });

    it('должен возвращать ошибку при проблемах с базой данных', async () => {
      const orders: CreateOrderDto[] = [
        {
          film: 'film1',
          session: 'session1',
          row: 1,
          seat: 2,
        },
      ];

      const mockSession = {
        id: 'session1',
        daytime: '2025-10-10T18:00:00',
        hall: 1,
        rows: 10,
        seats: 20,
        price: 350,
        taken: [],
      };

      mockFilmsRepository.findSessionById.mockResolvedValue(mockSession);
      mockFilmsRepository.updateSessionTaken.mockResolvedValue(false); // Симулируем ошибку БД

      const result = await orderService.createOrder(orders);

      expect(result).toEqual({
        error: 'Ошибка при бронировании места',
      });
      // ОШИБКА: если не обрабатывать ошибки БД, пользователь получит билет без реального бронирования
    });

    it('должен проверять обязательные поля заказа', async () => {
      const invalidOrders = [
        {
          // Отсутствует film
          session: 'session1',
          row: 1,
          seat: 2,
        },
      ] as CreateOrderDto[];

      const result = await orderService.createOrder(invalidOrders);

      expect(result).toEqual({
        error: 'Недостаточно данных для создания заказа',
      });
      // ОШИБКА: если не валидировать входные данные, в базе появятся некорректные заказы
    });

    it('должен проверять корректность номеров ряда и места', async () => {
      const invalidOrders = [
        {
          film: 'film1',
          session: 'session1',
          row: 0, // Некорректный ряд
          seat: 2,
        },
      ];

      const result = await orderService.createOrder(invalidOrders);

      expect(result).toEqual({
        error: 'Номер ряда и места должны быть положительными целыми числами',
      });
      // ОШИБКА: если не проверять валидность данных, возможны ошибки в логике бронирования
    });

    it('должен корректно обрабатывать частичный успех при нескольких билетах', async () => {
      const orders: CreateOrderDto[] = [
        {
          film: 'film1',
          session: 'session1',
          row: 1,
          seat: 2,
        },
        {
          film: 'film1',
          session: 'session1',
          row: 1,
          seat: 3,
        },
        {
          film: 'film1',
          session: 'session1',
          row: 1,
          seat: 4,
        },
      ];

      const mockSession = {
        id: 'session1',
        daytime: '2025-10-10T18:00:00',
        hall: 1,
        rows: 10,
        seats: 20,
        price: 350,
        taken: [],
      };

      // Первые два вызова успешны, третий возвращает ошибку
      mockFilmsRepository.findSessionById
        .mockResolvedValueOnce(mockSession)
        .mockResolvedValueOnce({ ...mockSession, taken: ['1:2'] })
        .mockResolvedValueOnce({ ...mockSession, taken: ['1:2', '1:3'] });

      mockFilmsRepository.updateSessionTaken
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false); // Третий вызов неуспешен

      const result = await orderService.createOrder(orders);

      // Ожидаем ошибку, так как один из билетов не прошел
      expect(result).toHaveProperty('error');
      // ОШИБКА: если не обрабатывать частичные неудачи, пользователь получит некорректный заказ
    });
  });

  describe('Обработка исключений', () => {
    it('должен обрабатывать непредвиденные ошибки', async () => {
      const orders: CreateOrderDto[] = [
        {
          film: 'film1',
          session: 'session1',
          row: 1,
          seat: 2,
        },
      ];

      // Симулируем непредвиденную ошибку
      mockFilmsRepository.findSessionById.mockRejectedValue(new Error('Error'));

      const result = await orderService.createOrder(orders);

      expect(result).toEqual({
        error: 'Внутренняя ошибка сервера при обработке заказа',
      });
      // ОШИБКА: если не обрабатывать непредвиденные ошибки, приложение упадет
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
