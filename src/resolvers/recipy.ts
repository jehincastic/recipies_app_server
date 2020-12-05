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
import { getConnection } from 'typeorm';

import {
  BookmarkInput,
  FieldError,
  Ingredient,
  IngredientInput,
  MyContext,
  SortingMethod,
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

@InputType()
class RecipyFindInput extends BookmarkInput {
  @Field({ nullable: true })
  title?: string;
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
      if (finalInput.circleIds.length > 0 && !recipy.public) {
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
    @Arg('input') input: RecipyFindInput,
    @Ctx() { req }: MyContext,
  ) {
    const { userId } = req.session;
    const {
      sortMethod,
      title,
      bookmark,
      limit,
    } = input;
    const sortingMtd = sortMethod || SortingMethod.DESC;
    const qb = getConnection()
      .getRepository(Recipy)
      .createQueryBuilder('recipy')
      .innerJoin('recipy.circles', 'recipy_to_circle')
      .innerJoin('recipy_to_circle.circle', 'circle')
      .innerJoin('circle.users', 'user_to_circle')
      .where('user_to_circle.userId = :userId', { userId });
    if (bookmark) {
      if (sortingMtd === SortingMethod.ASC) {
        qb.andWhere('recipy."createdAt" > :cursor', { cursor: new Date(parseInt(bookmark, 10)) });
      } else if (sortingMtd === SortingMethod.DESC) {
        qb.andWhere('recipy."createdAt" < :cursor', { cursor: new Date(parseInt(bookmark, 10)) });
      }
    }
    if (title) {
      qb.andWhere('LOWER(recipy.title) like LOWER(:title)', { title: `%${title}%` });
    }
    return qb
      .orderBy('recipy.createdAt', sortingMtd)
      .take(limit)
      .getMany();
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
