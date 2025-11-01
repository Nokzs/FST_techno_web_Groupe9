import { Inject } from '@nestjs/common';

// Ensures constructor parameter injection works with older Nest typings
export const InjectToken = (token: string | symbol): ParameterDecorator => {
  return Inject(token) as unknown as ParameterDecorator;
};
