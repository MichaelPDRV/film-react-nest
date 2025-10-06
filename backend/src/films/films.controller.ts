import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { FilmsService } from './films.service';
import { FilmsDataDto, ScheduleDataDto } from './dto/films.dto';

@Controller('films')
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  @Get()
  async getFilms(): Promise<FilmsDataDto> {
    return this.filmsService.getFilms();
  }

  @Get(':id/schedule')
  async getFilmSchedule(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ScheduleDataDto> {
    return this.filmsService.getFilmSchedule(id);
  }
}
