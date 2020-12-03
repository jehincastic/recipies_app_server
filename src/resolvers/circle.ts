import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql';
import { getConnection } from 'typeorm';

import { User } from '../entity/User';
import { Circle } from '../entity/Circle';
import { UserToCircle } from '../entity/UserToCircle';
import {
  FieldError,
  MyContext,
  BookmarkInput,
  SortingMethod,
} from '../types';
import { isAuth } from '../middlewares/isAuthenticated';

@ObjectType()
class CircleResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Circle, { nullable: true })
  circle?: Circle;
}

@InputType()
class CircleInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  image?: string;

  @Field({ nullable: true })
  description?: string;
}

@InputType()
class CircleFindInput extends BookmarkInput {
  @Field({ nullable: true })
  name?: string;
}

@Resolver(() => Circle)
export class CircleResolver {
  @Query(() => [Circle])
  @UseMiddleware(isAuth)
  circles(
    @Arg('option') option: CircleFindInput,
    @Ctx() { req }: MyContext,
  ) {
    const { userId } = req.session;
    const {
      sortMethod,
      name,
      bookmark,
      limit,
    } = option;
    const sortingMtd = sortMethod || SortingMethod.DESC;
    const qb = getConnection()
      .getRepository(Circle)
      .createQueryBuilder('circle')
      .innerJoin('circle.users', 'user_to_circle')
      .where('user_to_circle.userId = :userId', { userId });
    if (bookmark) {
      if (sortingMtd === SortingMethod.ASC) {
        qb.andWhere('circle."createdAt" > :cursor', { cursor: new Date(parseInt(bookmark, 10)) });
      } else if (sortingMtd === SortingMethod.DESC) {
        qb.andWhere('circle."createdAt" < :cursor', { cursor: new Date(parseInt(bookmark, 10)) });
      }
    }
    if (name) {
      qb.andWhere('LOWER(circle.name) like LOWER(:name)', { name: `%${name}%` });
    }
    return qb
      .orderBy('circle.createdAt', sortingMtd)
      .take(limit)
      .getMany();
  }

  @Mutation(() => CircleResponse)
  @UseMiddleware(isAuth)
  async createCircle(
    @Arg('input') input: CircleInput,
    @Ctx() { req }: MyContext,
  ): Promise<CircleResponse> {
    try {
      const { userId } = req.session;
      const circle = await Circle.create({
        ...input,
        creatorId: userId,
      }).save();
      await UserToCircle.create({
        userId,
        circleId: circle.id,
        userType: 'OWNER',
      }).save();
      return {
        circle,
      };
    } catch (err) {
      if (err.code === '23505') {
        return {
          errors: [{
            field: 'name',
            message: 'You have created a circle with the same name.',
          }],
        };
      }
      // eslint-disable-next-line no-console
      console.error(err);
      return {
        errors: [{
          field: '',
          message: 'Server Error.',
        }],
      };
    }
  }

  @FieldResolver()
  creator(
    @Root() cricle: Circle,
  ) {
    return User.findOne({ id: cricle.creatorId });
  }

  @FieldResolver()
  users(
    @Root() circle: Circle,
  ) {
    return UserToCircle.find({ circleId: circle.id });
  }
}
