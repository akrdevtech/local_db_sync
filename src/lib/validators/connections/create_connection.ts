import { IValidateAllSchema } from '@akrdevtech/lib-express-joi-validation-middleware';
import Joi from 'joi';

export const createConnectionValidation: IValidateAllSchema = {
	body: Joi.object({
		label: Joi.string().required(),
		description: Joi.string().optional(),
		connectionUri: Joi.string().required(),
	})
};
