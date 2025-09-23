import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user/schema/user.schema';

@ValidatorConstraint({ async: true }) // important pour Mongo !
export class IsUserAlreadyExistConstraint
  implements ValidatorConstraintInterface
{
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async validate(value: string, args: ValidationArguments): Promise<boolean> {
    const user = await this.userModel
      .findOne({ [args.property]: value })
      .exec();
    return !user; // valide seulement si aucun utilisateur trouvé
  }

  defaultMessage(args: ValidationArguments) {
    return `User with email "${args.value}" already exists`;
  }
}

// décorateur pour usage simple
export function IsUserAlreadyExist(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsUserAlreadyExistConstraint,
    });
  };
}
