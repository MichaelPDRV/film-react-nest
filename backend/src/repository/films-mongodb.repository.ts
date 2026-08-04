import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Film as FilmMongo } from './film.schema';
import { FilmDto, SessionDto } from '../films/dto/films.dto';
import { IFilmsRepository } from './films.repository.interface';

@Injectable()
export class FilmsRepositoryMongo implements IFilmsRepository {
  constructor(
    @InjectModel(FilmMongo.name) private filmModel: Model<FilmMongo>,
  ) {}

  async getAllFilms(): Promise<{ total: number; items: FilmDto[] }> {
    const films = await this.filmModel
      .find()
      .sort({ rating: -1 })
      .lean()
      .exec();

    return {
      total: films.length,
      items: films.map((film) => this.getFilmFromData(film)),
    };
  }

  async getFilmSchedule(
    filmId: string,
  ): Promise<{ total: number; items: SessionDto[] }> {
    const film = await this.filmModel.findOne({ id: filmId }).lean().exec();

    if (!film) {
      return { total: 0, items: [] };
    }

    return {
      total: film.schedule.length,
      items: film.schedule.map((session) => this.getSessionDto(session)),
    };
  }

  async findSessionById(sessionId: string): Promise<SessionDto | null> {
    const film = await this.filmModel
      .findOne({ 'schedule.id': sessionId })
      .lean()
      .exec();

    if (!film) {
      return null;
    }

    const session = film.schedule.find((s) => s.id === sessionId);
    return session ? this.getSessionDto(session) : null;
  }

  async updateSessionTaken(
    sessionId: string,
    taken: string[],
  ): Promise<boolean> {
    const result = await this.filmModel
      .updateOne(
        { 'schedule.id': sessionId },
        { $set: { 'schedule.$.taken': taken } },
      )
      .exec();

    return result.modifiedCount > 0;
  }

  private getFilmFromData(film: any): FilmDto {
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

  private getSessionDto(session: any): SessionDto {
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
