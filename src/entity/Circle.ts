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

import { RecipyToCircle } from './RecipyToCircle';
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

  @Field(() => [RecipyToCircle])
  @OneToMany(() => RecipyToCircle, (recipyToCircle) => recipyToCircle.circle)
  recipies: RecipyToCircle[];

  @Column()
  creatorId: number;

  @Field(() => String)
  @CreateDateColumn({ precision: 3 })
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn({ precision: 3 })
  updatedAt: Date;
}
