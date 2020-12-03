import {
  Arg,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql';

import { UserToCircle } from '../entity/UserToCircle';
import { User } from '../entity/User';
import { Circle } from '../entity/Circle';
import { isAuthoriedForCircle } from '../middlewares/isAuthorized';
import { isAuth } from '../middlewares/isAuthenticated';
import { ResponseStatus, ResponseType } from '../types';

@InputType()
class AddUserToCircle {
  @Field(() => Int)
  circleId: number;

  @Field(() => Int)
  userId: number;
}

@Resolver(() => UserToCircle)
export class UserToCircleResolver {
  @Mutation(() => ResponseType)
  @UseMiddleware(isAuth, isAuthoriedForCircle)
  async addUserToCircle(
    @Arg('input') input: AddUserToCircle,
  ): Promise<ResponseType> {
    try {
      const {
        circleId,
        userId,
      } = input;

      await UserToCircle.create({
        userId,
        circleId,
        userType: 'MEMBER',
      }).save();
      return {
        status: ResponseStatus.success,
        message: 'User Added Sucessfully',
      };
    } catch (err) {
      if (err.code === '23505') {
        return {
          status: ResponseStatus.failed,
          message: 'User Already a member.',
        };
      }
      return {
        status: ResponseStatus.failed,
        message: 'Server Error.',
      };
    }
  }

  @FieldResolver()
  user(
    @Root() userToCircle: UserToCircle,
  ) {
    return User.findOneOrFail({ id: userToCircle.userId });
  }

  @FieldResolver()
  circle(
    @Root() userToCircle: UserToCircle,
  ) {
    return Circle.findOneOrFail({ id: userToCircle.circleId });
  }
}
