import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { User } from "./User";
import { Circle } from "./Circle";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
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
  @ManyToOne(() => User, user => user.myCircles)
  user!: User;

  @Field(() => Circle)
  @ManyToOne(() => Circle, circle => circle.users)
  circle!: Circle;
}
