import { FieldResolver, Resolver, Root } from 'type-graphql';

import { UserToCircle } from '../entity/UserToCircle';
import { User } from '../entity/User';
import { Circle } from '../entity/Circle';

@Resolver(() => UserToCircle)
export class UserToCircleResolver {
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
