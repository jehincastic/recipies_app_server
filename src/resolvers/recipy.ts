import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql';

import {
  FieldError,
  Ingredient,
  IngredientInput,
  MyContext,
  Step,
  StepInput,
  Timing,
  TimingInput,
} from '../types';
import { Recipy } from '../entity/Recipy';
import { isAuth } from '../middlewares/isAuthenticated';
import { User } from '../entity/User';
import { RecipyToCircle } from '../entity/RecipyToCircle';
import { isMemberForMultipleCircles } from '../middlewares/isAuthorized';

@ObjectType()
class RecipyResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Recipy, { nullable: true })
  recipy?: Recipy;
}

@InputType()
class RecipyInput {
  @Field()
  title!: string;

  @Field(() => Boolean, { nullable: true })
  public: boolean;

  @Field(() => [IngredientInput])
  ingredients: Ingredient[]

  @Field(() => [TimingInput])
  timings: Timing[]

  @Field(() => [StepInput])
  steps: Step[]

  @Field({ nullable: true })
  image: string;

  @Field()
  description!: string;

  @Field(() => Boolean, { nullable: true })
  private: boolean;

  @Field(() => Boolean)
  veg: boolean;

  @Field(() => [Int])
  circleIds: number[]
}

@Resolver(() => Recipy)
export class RecipyResolver {
  @Mutation(() => RecipyResponse)
  @UseMiddleware(isAuth, isMemberForMultipleCircles)
  async createRecipy(
    @Arg('input') input: RecipyInput,
    @Ctx() { req }: MyContext,
  ): Promise<RecipyResponse> {
    try {
      const { userId } = req.session;
      const finalInput = { ...input };
      if (finalInput.circleIds.length === 0) {
        finalInput.private = true;
      }
      const recipy = await Recipy.create({
        ...finalInput,
        creatorId: userId,
      }).save();
      if (finalInput.circleIds.length > 0) {
        const recipeCircleData: RecipyToCircle[] = finalInput.circleIds.map((circleId) => {
          const recipyData = new RecipyToCircle();
          recipyData.circleId = circleId;
          recipyData.recipyId = recipy.id;
          return recipyData;
        });
        await RecipyToCircle.save(recipeCircleData);
      }
      return {
        recipy,
      };
    } catch (err) {
      if (err.code === '23505') {
        return {
          errors: [{
            field: 'title',
            message: 'You have created a recipy with the same name.',
          }],
        };
      }
      // eslint-disable-next-line no-console
      console.error(err);
      return {
        errors: [{
          field: '',
          message: 'Server Error',
        }],
      };
    }
  }

  @Query(() => [Recipy])
  @UseMiddleware(isAuth)
  getRecipies(
    @Ctx() { req }: MyContext,
  ) {
    const {
      userId,
    } = req.session;
    return Recipy.find({ creatorId: userId });
  }

  @FieldResolver()
  creator(
    @Root() recipy: Recipy,
  ) {
    return User.findOne({ id: recipy.creatorId });
  }

  @FieldResolver()
  circles(
    @Root() recipy: Recipy,
  ) {
    return RecipyToCircle.find({ recipyId: recipy.id });
  }
}
