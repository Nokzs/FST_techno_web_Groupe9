import {
	registerDecorator,
	ValidationOptions,
	ValidationArguments,
} from 'class-validator';

export function IsInList(
	property: string[],
	ValidationOptions: ValidationOptions
) {
	return function (object: Object, propertyName: string) {
		registerDecorator({

			name: 'IsInList',
			target: object.constructor,
			propertyName: propertyName,
			constraints: property,
			options: ValidationOptions,
			validator: {
				validate(value: any,args: ValidationArguments) {
					const list = args.constraints;
					return list.some((el)=>el === value)
				},
			},
		});
	};
	
}
