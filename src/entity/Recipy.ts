import {
  Field,
  Int,
  ObjectType,
} from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import {
  Ingredient,
  Timing,
  Step,
} from '../types';
import { User } from './User';

@ObjectType()
@Entity()
@Unique(['title', 'creatorId'])
export class Recipy extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ length: 200 })
  title!: string;

  @Field(() => Boolean, { nullable: true })
  @Column({ default: false })
  public: boolean;

  @Field(() => [Ingredient])
  @Column({ type: 'jsonb' })
  ingredients: Ingredient[]

  @Field(() => [Timing])
  @Column({ type: 'jsonb', nullable: true })
  timings: Timing[]

  @Field(() => [Step])
  @Column({ type: 'jsonb' })
  steps: Step[]

  @Field({ nullable: true })
  @Column({ length: 50, nullable: true })
  image: string;

  @Column()
  creatorId: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.recipies)
  creator: User;

  @Field()
  @Column({ length: 5000 })
  description!: string;

  @Field(() => Boolean, { nullable: true })
  @Column({ default: false })
  private: boolean;

  @Field(() => Boolean)
  @Column()
  veg: boolean;

  @Field(() => String)
  @CreateDateColumn({ precision: 3 })
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn({ precision: 3 })
  updatedAt: Date;
}
