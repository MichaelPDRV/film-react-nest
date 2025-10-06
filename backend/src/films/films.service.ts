import { Injectable } from '@nestjs/common';
import { FilmsDataDto, ScheduleDataDto } from './dto/films.dto';
import { FilmsRepository } from '../repository/films.repository';

@Injectable()
export class FilmsService {
  constructor(private readonly filmsRepository: FilmsRepository) {}

  async getFilms(): Promise<FilmsDataDto> {
    return this.filmsRepository.getAllFilms();
  }

  async getFilmSchedule(id: string): Promise<ScheduleDataDto> {
    return this.filmsRepository.getFilmSchedule(id);
  }
}
