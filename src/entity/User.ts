import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { Circle } from "./Circle";
import { UserToCircle } from "./UserToCircle";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ unique: true })
  email!: string;

  @Field()
  @Column()
  name!: string;

  @Field(() => [Circle])
  @OneToMany(() => Circle, circle => circle.creator)
  circles: Circle[];

  @Field(() => [UserToCircle])
  @OneToMany(() => UserToCircle, userToCircle => userToCircle.user)
  myCircles: UserToCircle[];

  @Field({ nullable: true })
  @Column("varchar", { length: 150, nullable: true })
  picture?: string;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
