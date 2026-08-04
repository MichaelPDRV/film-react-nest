//TODO реализовать DTO для /orders
export class CreateOrderDto {
  film: string;
  session: string;
  row: number;
  seat: number;
  daytime?: string;
  price?: number;
}

export class OrderItemDto {
  film: string;
  session: string;
  daytime: string;
  row: number;
  seat: number;
  price: number;
  id: string;
}

export class OrderResponseDto {
  total: number;
  items: OrderItemDto[];
}

export class OrderErrorDto {
  error: string;
}

export class OrderRequestDto {
  tickets: CreateOrderDto[];
}
