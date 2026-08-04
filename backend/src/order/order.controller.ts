import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { OrderService } from './order.service';
import {
  OrderResponseDto,
  OrderErrorDto,
  OrderRequestDto,
} from './dto/order.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrder(
    @Body() orderRequest: OrderRequestDto,
  ): Promise<OrderResponseDto | OrderErrorDto> {
    const orders = orderRequest.tickets;
    return this.orderService.createOrder(orders);
  }
}
