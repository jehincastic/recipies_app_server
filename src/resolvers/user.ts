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
} from 'type-graphql';
import { getConnection } from 'typeorm';

import { UserToCircle } from '../entity/UserToCircle';
import { Circle } from '../entity/Circle';
import { User } from '../entity/User';
import {
  BookmarkInput,
  FieldError,
  MyContext,
  SortingMethod,
} from '../types';

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@InputType()
class UserInput extends BookmarkInput {
  @Field()
  name: string;
}

@InputType()
class LoginInput {
  @Field()
  email: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  picture?: string;
}

@Resolver(() => User)
export class UserResolver {
  @Query(() => [User])
  users(
    @Arg('option') option: UserInput,
  ) {
    const {
      sortMethod,
      name,
      bookmark,
      limit,
    } = option;
    const sortingMtd = sortMethod || SortingMethod.DESC;
    const qb = getConnection()
      .getRepository(User)
      .createQueryBuilder('user')
      .where('LOWER(user.name) like LOWER(:name)', { name: `%${name}%` });
    if (bookmark) {
      if (sortingMtd === SortingMethod.ASC) {
        qb.andWhere('"user"."createdAt" > :cursor', { cursor: new Date(parseInt(bookmark, 10)) });
      } else if (sortingMtd === SortingMethod.DESC) {
        qb.andWhere('"user"."createdAt" < :cursor', { cursor: new Date(parseInt(bookmark, 10)) });
      }
    }
    return qb
      .orderBy('"user"."createdAt"', sortingMtd)
      .take(limit)
      .getMany();
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('options') options: LoginInput,
    @Ctx() { req }: MyContext,
  ): Promise<UserResponse> {
    try {
      let user = await User.findOne({ email: options.email });
      if (!user) {
        const tempOptions = { ...options };
        tempOptions.picture = options.picture || `https://robohash.org/${options.name}`;
        user = await User.create({
          ...tempOptions,
        }).save();
      }
      req.session.userId = user.id;
      return {
        user,
      };
    } catch (err) {
      if (err.code === '23505') {
        return {
          errors: [{
            field: 'email',
            message: 'Email Already taken.',
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
  circles(
    @Root() user: User,
  ) {
    return Circle.find({ creatorId: user.id });
  }

  @FieldResolver()
  myCircles(
    @Root() user: User,
  ) {
    return UserToCircle.find({ userId: user.id });
  }
}
