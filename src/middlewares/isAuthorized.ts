import { MiddlewareFn } from 'type-graphql';

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
