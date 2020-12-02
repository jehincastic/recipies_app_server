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
import {
  FindConditions,
  LessThan,
  Like,
  MoreThan,
  ObjectLiteral,
} from 'typeorm';

import { UserToCircle } from '../entity/UserToCircle';
import { Circle } from '../entity/Circle';
import { User } from '../entity/User';
import {
  BookmarInput,
  FieldError,
  MyContext,
  SortingMethod,
} from '../types';
import { formatDate } from '../utils/dateFormat';

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@InputType()
class UserInput extends BookmarInput {
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
    const whereClause:string | ObjectLiteral | FindConditions<User>
    | FindConditions<User>[] | undefined = {
      name: Like(`%${name}%`),
    };
    if (bookmark) {
      if (sortingMtd === SortingMethod.ASC) {
        whereClause.createdAt = MoreThan(formatDate(
          new Date(parseInt(bookmark, 10)).toISOString(),
        ));
      } else if (sortingMtd === SortingMethod.DESC) {
        whereClause.createdAt = LessThan(formatDate(
          new Date(parseInt(bookmark, 10)).toISOString(),
        ));
      }
    }
    return User.find({
      where: whereClause,
      take: limit,
      order: {
        createdAt: sortingMtd,
      },
    });
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
      console.log(err);
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
