import { Field, Int, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { User } from './User';
import { UserToCircle } from './UserToCircle';

@ObjectType()
@Entity()
@Unique(['name', 'creatorId'])
export class Circle extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  name!: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  image?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.circles)
  creator: User;

  @Field(() => [UserToCircle])
  @OneToMany(() => UserToCircle, (userToCircle) => userToCircle.circle)
  users: UserToCircle[];

  @Column()
  creatorId: number;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
