/* eslint-disable no-unused-vars */
import { Request, Response } from 'express';
import { Redis } from 'ioredis';
import {
  ObjectType,
  Field,
  InputType,
  registerEnumType,
  Int,
} from 'type-graphql';

export type MyContext = {
  req: Request & { session: { userId: number } };
  res: Response;
  redis: Redis;
};

@ObjectType()
export class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

// eslint-disable-next-line no-shadow
export enum SortingMethod {
  ASC='ASC',
  DESC='DESC',
}

registerEnumType(SortingMethod, {
  name: 'SortMethod',
  description: 'The basic sorting methods',
});

@InputType()
export class BookmarInput {
  @Field(() => SortingMethod, { nullable: true })
  sortMethod?: SortingMethod;

  @Field(() => Int)
  limit: number;

  @Field({ nullable: true })
  bookmark?: string;
}
