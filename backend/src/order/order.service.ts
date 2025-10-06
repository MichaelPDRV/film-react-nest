import { Injectable } from '@nestjs/common';
import {
  CreateOrderDto,
  OrderResponseDto,
  OrderItemDto,
  OrderErrorDto,
} from './dto/order.dto';
import { FilmsRepository } from '../repository/films.repository';

interface OrderProcessingResult {
  success: boolean;
  data?: OrderItemDto;
  error?: OrderErrorDto;
}

@Injectable()
export class OrderService {
  constructor(private readonly filmsRepository: FilmsRepository) {}

  async createOrder(
    orders: CreateOrderDto[],
  ): Promise<OrderResponseDto | OrderErrorDto> {
    if (!this.isValidOrderRequest(orders)) {
      return { error: 'Список заказов не может быть пустым' };
    }

    const processingResults = await this.processOrders(orders);

    if (processingResults.some((result) => !result.success)) {
      const errorResult = processingResults.find((result) => !result.success);
      return errorResult.error!;
    }

    const successfulOrders = processingResults
      .filter((result) => result.success)
      .map((result) => result.data!);

    return {
      total: successfulOrders.length,
      items: successfulOrders,
    };
  }

  private async processOrders(
    orders: CreateOrderDto[],
  ): Promise<OrderProcessingResult[]> {
    const processedSeats = new Set<string>();
    const results: OrderProcessingResult[] = [];

    for (const order of orders) {
      const result = await this.processSingleOrder(order, processedSeats);
      results.push(result);

      if (result.success) {
        processedSeats.add(
          this.createSeatKey(
            order.session,
            result.data!.row,
            result.data!.seat,
          ),
        );
      }
    }

    return results;
  }

  private async processSingleOrder(
    order: CreateOrderDto,
    processedSeats: Set<string>,
  ): Promise<OrderProcessingResult> {
    try {
      // Валидация данных заказа
      const validationError = this.validateOrderData(order);
      if (validationError) {
        return { success: false, error: validationError };
      }

      // Проверка дублирования в текущем запросе
      const seatKey = this.createSeatKey(order.session, order.row, order.seat);
      if (processedSeats.has(seatKey)) {
        return {
          success: false,
          error: {
            error: `Место ${order.row}:${order.seat} уже обрабатывается в этом запросе`,
          },
        };
      }

      // Получение и проверка сеанса
      const session = await this.filmsRepository.findSessionById(order.session);
      const sessionValidationError = await this.validateSession(session, order);
      if (sessionValidationError) {
        return { success: false, error: sessionValidationError };
      }

      // Бронирование места
      const reservationResult = await this.reserveSeat(
        order.session,
        session!.taken,
        order.row,
        order.seat,
      );
      if (!reservationResult.success) {
        return { success: false, error: reservationResult.error };
      }

      // Создание заказа
      const orderItem = this.createOrderItem(order, session!);

      return { success: true, data: orderItem };
    } catch (error) {
      return {
        success: false,
        error: { error: 'Внутренняя ошибка сервера при обработке заказа' },
      };
    }
  }

  private isValidOrderRequest(orders: any): orders is CreateOrderDto[] {
    return Array.isArray(orders) && orders.length > 0;
  }

  private validateOrderData(order: CreateOrderDto): OrderErrorDto | null {
    const { film, session, row, seat } = order;

    if (!film || !session || row == null || seat == null) {
      return { error: 'Недостаточно данных для создания заказа' };
    }

    if (
      !Number.isInteger(row) ||
      !Number.isInteger(seat) ||
      row <= 0 ||
      seat <= 0
    ) {
      return {
        error: 'Номер ряда и места должны быть положительными целыми числами',
      };
    }

    return null;
  }

  private async validateSession(
    session: any,
    order: CreateOrderDto,
  ): Promise<OrderErrorDto | null> {
    if (!session) {
      return { error: 'Сеанс не найден' };
    }

    if (order.row > session.rows || order.seat > session.seats) {
      return {
        error: `Место ${order.row}:${order.seat} не существует. Зал имеет ${session.rows} рядов и ${session.seats} мест в ряду`,
      };
    }

    const seatKey = `${order.row}:${order.seat}`;
    if (session.taken.includes(seatKey)) {
      return { error: `Место ${seatKey} уже занято` };
    }

    return null;
  }

  private async reserveSeat(
    sessionId: string,
    currentTaken: string[],
    row: number,
    seat: number,
  ): Promise<{ success: boolean; error?: OrderErrorDto }> {
    const seatKey = `${row}:${seat}`;
    const updatedTaken = [...currentTaken, seatKey];

    const updateSuccess = await this.filmsRepository.updateSessionTaken(
      sessionId,
      updatedTaken,
    );

    if (!updateSuccess) {
      return {
        success: false,
        error: { error: 'Ошибка при бронировании места' },
      };
    }

    return { success: true };
  }

  private createOrderItem(order: CreateOrderDto, session: any): OrderItemDto {
    return {
      film: order.film,
      session: order.session,
      daytime: session.daytime,
      row: order.row,
      seat: order.seat,
      price: session.price,
      id: this.generateOrderId(),
    };
  }

  private createSeatKey(sessionId: string, row: number, seat: number): string {
    return `${sessionId}:${row}:${seat}`;
  }

  private generateOrderId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `order-${timestamp}-${random}`;
  }
}
