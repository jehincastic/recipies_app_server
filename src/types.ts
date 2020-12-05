/* eslint-disable no-shadow */
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

export enum SortingMethod {
  ASC='ASC',
  DESC='DESC',
}

registerEnumType(SortingMethod, {
  name: 'SortMethod',
  description: 'The basic sorting methods',
});

@InputType()
export class BookmarkInput {
  @Field(() => SortingMethod, { nullable: true })
  sortMethod?: SortingMethod;

  @Field(() => Int)
  limit: number;

  @Field({ nullable: true })
  bookmark?: string;
}

export enum ResponseStatus {
  success='Success',
  failed='Failed',
}

registerEnumType(ResponseStatus, {
  name: 'ResponseStatus',
});

export enum RecipyFindType {
  ALL='ALL',
  SELF='SELF',
  CIRCLE='CIRCLE',
}

registerEnumType(RecipyFindType, {
  name: 'RecipyFindType',
});

@ObjectType()
export class ResponseType {
  @Field()
  status: ResponseStatus;

  @Field()
  message: string;
}

@ObjectType()
export class Ingredient {
  @Field({ nullable: true })
  amount: number;

  @Field({ nullable: true })
  units: string;

  @Field()
  name: string;
}

@InputType()
export class IngredientInput {
  @Field({ nullable: true })
  amount: number;

  @Field({ nullable: true })
  units: string;

  @Field()
  name: string;
}

@ObjectType()
export class Timing {
  @Field()
  title: string;

  @Field(() => Int, { nullable: true })
  minutes: number;

  @Field(() => Int, { nullable: true })
  hours: number;
}

@InputType()
export class TimingInput {
  @Field()
  title: string;

  @Field(() => Int, { nullable: true })
  minutes: number;

  @Field(() => Int, { nullable: true })
  hours: number;
}

@ObjectType()
export class Step {
  @Field(() => Int)
  stepNo: number;

  @Field()
  step: string;
}

@InputType()
export class StepInput {
  @Field(() => Int)
  stepNo: number;

  @Field()
  step: string;
}
