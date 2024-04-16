import { IValidateAllSchema } from '@akrdevtech/lib-express-joi-validation-middleware';
import Joi from 'joi';

export const createDatabaseSchema: IValidateAllSchema = {
	body: Joi.object({
		name: Joi.string().required(),
		description: Joi.string().optional(),
	})
};