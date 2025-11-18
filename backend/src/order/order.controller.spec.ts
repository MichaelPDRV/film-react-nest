import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import {
  CreateOrderDto,
  OrderRequestDto,
  OrderResponseDto,
  OrderItemDto,
  OrderErrorDto,
} from './dto/order.dto';

// Мок данных
const mockCreateOrderDto: CreateOrderDto = {
  film: '92b8a2a7-ab6b-4fa9-915b-d27945865e39',
  session: 'f2e429b0-685d-41f8-a8cd-1d8cb63b99ce',
  row: 2,
  seat: 3,
};

const mockOrderRequestDto: OrderRequestDto = {
  tickets: [mockCreateOrderDto],
};

const mockOrderItem: OrderItemDto = {
  film: '92b8a2a7-ab6b-4fa9-915b-d27945865e39',
  session: 'f2e429b0-685d-41f8-a8cd-1d8cb63b99ce',
  daytime: '2024-06-28T10:00:53+03:00',
  row: 2,
  seat: 3,
  price: 350,
  id: 'order-12345abc',
};

const mockOrderResponse: OrderResponseDto = {
  total: 1,
  items: [mockOrderItem],
};

const mockOrderError: OrderErrorDto = {
  error: 'Место 2:3 уже занято',
};

// Создаём мок для OrderService
const mockOrderService = {
  createOrder: jest.fn(),
};

describe('OrderController', () => {
  let controller: OrderController;
  let service: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService, // Используем мок
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    service = module.get<OrderService>(OrderService);
  });

  it('Сервис должен быть определен', () => {
    expect(controller).toBeDefined();
  });

  describe('createOrder', () => {
    it('должен вызвать orderService.createOrder с запросом на заказ и вернуть успешный ответ', async () => {
      mockOrderService.createOrder.mockResolvedValue(mockOrderResponse);

      const result = await controller.createOrder(mockOrderRequestDto);

      expect(service.createOrder).toHaveBeenCalledWith(
        mockOrderRequestDto.tickets,
      );
      expect(result).toEqual(mockOrderResponse);
    });

    it('должен вызвать orderService.createOrder с запросом на заказ и вернуть ответ с ошибкой', async () => {
      mockOrderService.createOrder.mockResolvedValue(mockOrderError);

      const result = await controller.createOrder(mockOrderRequestDto);

      expect(service.createOrder).toHaveBeenCalledWith(
        mockOrderRequestDto.tickets,
      );
      expect(result).toEqual(mockOrderError);
    });
  });
});
