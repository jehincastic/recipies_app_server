import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Field, ObjectType } from 'type-graphql';

import { User } from './User';
import { Circle } from './Circle';

@ObjectType()
@Entity()
@Unique(['userId', 'circleId'])
export class UserToCircle extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column()
  circleId!: number;

  @Field()
  @Column()
  userType!: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.myCircles)
  user!: User;

  @Field(() => Circle)
  @ManyToOne(() => Circle, (circle) => circle.users)
  circle!: Circle;
}
