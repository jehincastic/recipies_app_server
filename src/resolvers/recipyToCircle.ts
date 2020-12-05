import {
  FieldResolver,
  Resolver,
  Root,
} from 'type-graphql';

import { RecipyToCircle } from '../entity/RecipyToCircle';
import { Recipy } from '../entity/Recipy';
import { Circle } from '../entity/Circle';

@Resolver(() => RecipyToCircle)
export class RecipyToCircleResolver {
  @FieldResolver()
  recipy(
    @Root() recipyToCircle: RecipyToCircle,
  ) {
    return Recipy.findOneOrFail({ id: recipyToCircle.recipyId });
  }

  @FieldResolver()
  circle(
    @Root() recipyToCircle: RecipyToCircle,
  ) {
    return Circle.findOneOrFail({ id: recipyToCircle.circleId });
  }
}
