import { FilmDto, SessionDto } from '../films/dto/films.dto';

export interface IFilmsRepository {
  getAllFilms(): Promise<{ total: number; items: FilmDto[] }>;
  getFilmSchedule(
    filmId: string,
  ): Promise<{ total: number; items: SessionDto[] }>;
  findSessionById(sessionId: string): Promise<SessionDto | null>;
  updateSessionTaken(sessionId: string, taken: string[]): Promise<boolean>;
}
