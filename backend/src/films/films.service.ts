import { Injectable, Inject } from '@nestjs/common';
import { FilmsDataDto, ScheduleDataDto } from './dto/films.dto';
import { IFilmsRepository } from '../repository/films.repository.interface';

@Injectable()
export class FilmsService {
  constructor(
    @Inject('IFilmsRepository')
    private readonly filmsRepository: IFilmsRepository,
  ) {}

  async getFilms(): Promise<FilmsDataDto> {
    return this.filmsRepository.getAllFilms();
  }

  async getFilmSchedule(id: string): Promise<ScheduleDataDto> {
    return this.filmsRepository.getFilmSchedule(id);
  }
}
