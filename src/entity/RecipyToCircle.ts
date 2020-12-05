import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Field, ObjectType } from 'type-graphql';

import { Recipy } from './Recipy';
import { Circle } from './Circle';

@ObjectType()
@Entity()
@Unique(['recipyId', 'circleId'])
export class RecipyToCircle extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  recipyId!: number;

  @Column()
  circleId!: number;

  @Field(() => Recipy)
  @ManyToOne(() => Recipy, (recipy) => recipy.circles)
  recipy!: Recipy;

  @Field(() => Circle)
  @ManyToOne(() => Circle, (circle) => circle.recipies)
  circle!: Circle;
}
