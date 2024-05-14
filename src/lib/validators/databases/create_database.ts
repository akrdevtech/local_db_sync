import { IValidateAllSchema } from '@akrdevtech/lib-express-joi-validation-middleware';
import Joi from 'joi';

export const createDatabaseSchema: IValidateAllSchema = {
	body: Joi.object({
		label: Joi.string().required(),
		description: Joi.string().optional(),
		dbName: Joi.string().required(),
		targetDbName: Joi.string().optional(),
		connection: Joi.string().required(),
	})
};