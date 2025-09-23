import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { IsUserAlreadyExist } from 'src/CustomValidators/IsAlreadyExistedUserValidation';
import { IsInList } from 'src/CustomValidators/IsInListValidator';
export class CreateUserDTO {
	@IsNotEmpty()
	pseudo: string;

	@IsEmail()
	@IsUserAlreadyExist()
	email: string;

	@MinLength(6)
	password: string;
	@IsInList(['fr, us, de'], { message: "ceci n'est une langue valide" })
	language?: string;
}
