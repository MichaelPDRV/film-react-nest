import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Session } from './session.entity';

@Entity('films')
export class Film {
  @PrimaryColumn('uuid')
  id: string;

  @Column('float')
  rating: number;

  @Column()
  director: string;

  @Column('simple-array')
  tags: string[];

  @Column()
  title: string;

  @Column()
  image: string;

  @Column()
  cover: string;

  @Column()
  about: string;

  @Column()
  description: string;

  @OneToMany(() => Session, (session) => session.film, { cascade: true })
  schedule: Session[];
}
