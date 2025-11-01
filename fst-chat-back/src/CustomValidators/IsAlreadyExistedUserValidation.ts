import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Model } from 'mongoose';
import { InjectModel } from 'src/common/mongoose/inject-model.decorator';
import { User, UserDocument } from '../user/schema/user.schema';

@ValidatorConstraint({ async: true })
export class IsUserAlreadyExistConstraint
  implements ValidatorConstraintInterface
{
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async validate(value: string, args: ValidationArguments): Promise<boolean> {
    const user = await this.userModel
      .findOne({ [args.property]: value })
      .lean<User | null>()
      .exec();
    return !user;
  }

  defaultMessage(args: ValidationArguments) {
    return `User with ${args.property} "${args.value}" already exists`;
  }
}

export function IsUserAlreadyExist(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsUserAlreadyExistConstraint,
    });
  };
}
