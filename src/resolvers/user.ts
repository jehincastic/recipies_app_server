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

import { UserToCircle } from '../entity/UserToCircle';
import { Circle } from '../entity/Circle';
import { User } from '../entity/User';
import { FieldError, MyContext } from '../types';

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@InputType()
export class RegisterInput {
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
  users() {
    return User.find({});
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: RegisterInput,
    @Ctx() { req }: MyContext,
  ): Promise<UserResponse> {
    try {
      const tempOptions = { ...options };
      tempOptions.picture = options.picture || `https://robohash.org/${options.name}`;
      const user = await User.create({
        ...tempOptions,
      }).save();
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
