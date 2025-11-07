import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Film } from './entity/film.entity';
import { Session } from './entity/session.entity';
import { FilmDto, SessionDto } from '../films/dto/films.dto';
import { IFilmsRepository } from './films.repository.interface';

@Injectable()
export class FilmsRepositoryPostgres implements IFilmsRepository {
  constructor(
    @InjectRepository(Film)
    private filmRepository: Repository<Film>,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
  ) {}

  async getAllFilms(): Promise<{ total: number; items: FilmDto[] }> {
    try {
      const films = await this.filmRepository.find({
        relations: ['schedule'],
        order: { rating: 'DESC' },
      });
      return {
        total: films.length,
        items: films.map((film) => this.getFilmFromData(film)),
      };
    } catch (error) {
      console.error('Ошибка при получении списка фильмов:', error);
      return { total: 0, items: [] };
    }
  }

  async getFilmSchedule(
    filmId: string,
  ): Promise<{ total: number; items: SessionDto[] }> {
    try {
      //   const film = await this.filmRepository.findOne({
      //     where: { id: filmId },
      //     relations: ['schedule'],
      //   });

      //   if (!film) {
      //     return { total: 0, items: [] };
      //   }

      const session = await this.sessionRepository
        .createQueryBuilder('session')
        .where('session.filmId = :filmId', { filmId })
        .orderBy('session.daytime', 'ASC')
        .getMany();

      return {
        total: session.length,
        items: session.map((session) => this.getSessionDto(session)),
      };
    } catch (error) {
      console.error('Ошибка при получении расписания фильма:', error);
      return { total: 0, items: [] };
    }
  }

  async findSessionById(sessionId: string): Promise<SessionDto | null> {
    try {
      const session = await this.sessionRepository.findOne({
        where: { id: sessionId },
        relations: ['film'],
      });

      return session ? this.getSessionDto(session) : null;
    } catch (error) {
      console.error('Ошибка при поиске сеанса:', error);
      return null;
    }
  }

  async updateSessionTaken(
    sessionId: string,
    taken: string[],
  ): Promise<boolean> {
    try {
      const result = await this.sessionRepository.update(sessionId, { taken });
      return result.affected > 0;
    } catch (error) {
      console.error('Ошибка при обновлении списка занятых мест:', error);
      return false;
    }
  }

  private getFilmFromData(film: Film): FilmDto {
    return {
      id: film.id,
      rating: film.rating,
      director: film.director,
      tags: film.tags,
      title: film.title,
      about: film.about,
      description: film.description,
      image: film.image,
      cover: film.cover,
    };
  }

  private getSessionDto(session: Session): SessionDto {
    return {
      id: session.id,
      daytime: session.daytime,
      hall: session.hall,
      rows: session.rows,
      seats: session.seats,
      price: session.price,
      taken: session.taken || [],
    };
  }
}
