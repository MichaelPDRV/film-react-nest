//TODO описать DTO для запросов к /films
export class FilmDto {
  id: string;
  rating: number;
  director: string;
  tags: string[];
  title: string;
  about: string;
  description: string;
  image: string;
  cover: string;
}

export class SessionDto {
  id: string;
  daytime: string;
  hall: number;
  rows: number;
  seats: number;
  price: number;
  taken: string[];
}

export class FilmsDataDto {
  total: number;
  items: FilmDto[];
}

export class ScheduleDataDto {
  total: number;
  items: SessionDto[];
}
