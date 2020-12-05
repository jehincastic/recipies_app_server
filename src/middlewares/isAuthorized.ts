import { MiddlewareFn } from 'type-graphql';
import { getConnection } from 'typeorm';

import { MyContext } from '../types';
import { Circle } from '../entity/Circle';

export const isAuthoriedForCircle: MiddlewareFn<MyContext> = async ({ context, args }, next) => {
  if (!context.req.session.userId) {
    throw new Error('Not Authenticated');
  }
  const circle = await Circle.findOne({
    creatorId: context.req.session.userId,
    id: args.input.circleId,
  });
  if (!circle) {
    throw new Error('Not Authorized to perform this operation.');
  }
  return next();
};

export const isMemberForMultipleCircles: MiddlewareFn<MyContext> = async ({
  context,
  args,
}, next) => {
  if (args.input.circleIds.length > 0) {
    const qb = getConnection()
      .getRepository(Circle)
      .createQueryBuilder('circle')
      .innerJoin('circle.users', 'user_to_circle')
      .where('user_to_circle.userId = :userId', { userId: context.req.session.userId })
      .andWhere('circle.id in (:...circles)', { circles: args.input.circleIds });
    const count = await qb.getCount();
    if (count < args.input.circleIds.length) {
      throw new Error('You Don\'t have permission to add in all circles.');
    }
  }
  return next();
};
