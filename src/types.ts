import { Request, Response } from 'express';
import { Redis } from "ioredis";
import { ObjectType, Field } from 'type-graphql';

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