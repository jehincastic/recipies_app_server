import {
  Arg,
  Field,
  FieldResolver,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
} from "type-graphql";

import { User } from "../entity/User";
import { Circle } from "../entity/Circle";
import { UserToCircle } from "../entity/UserToCircle";
import { FieldError } from "../types";

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

@Resolver(() => Circle)
export class CircleResolver {
  @Query(() => [Circle])
  circles() {
    return Circle.find({});
  }

  @Mutation(() => CircleResponse)
  async createCircle(
    @Arg('input') input: CircleInput,
  ): Promise<CircleResponse> {
    try {
      const circle = await Circle.create({
        ...input,
        createdBy: 1,
      }).save();
      return {
        circle,
      }
    } catch (err) {
      if (err.code === '23505') {
        return {
          errors: [{
            field: 'name',
            message: 'You have created a circle with the same name.'
          }]
        };
      } else {
        console.log(err);
        return {
          errors: [{
            field: '',
            message: 'Server Error.'
          }]
        };
      }
    }
  }

  @FieldResolver()
  creator(
    @Root() cricle: Circle,
  ) {
    return User.findOne({ id: cricle.createdBy });
  }

  @FieldResolver()
  users(
    @Root() circle: Circle
  ) {
    return UserToCircle.find({circleId: circle.id});
  }
}