import { Inject } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';

// Wrapper to avoid outdated decorator typings from @nestjs/mongoose v7
export const InjectModel = (model: string): ParameterDecorator => {
  return Inject(getModelToken(model));
};
