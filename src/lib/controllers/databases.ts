import { Request, Response } from 'express';
import { BaseController } from './base_controller';
import { DatabaseServiceApi, IDatabaseServiceApi } from '../services/databases';
import { IDatabase } from '../models/databases';
import { createDatabaseSchema } from '../validators/databases/create_database';

/**
 * Represents a controller for managing databases.
 *
 * @class
 * @extends {BaseController}
 */
export class Databases extends BaseController {
	/**
	 * The database services API.
	 *
	 * @private
	 * @type {IDatabaseServiceApi}
	 */
	private databaseServices: IDatabaseServiceApi;

	/**
	 * Creates an instance of the DatabasesController class.
	 */
	constructor() {
		super('Database Controller');
		this.databaseServices = new DatabaseServiceApi();
		this.initializeRoutes();
	}

	/**
	 * Initializes the routes for the DatabasesController.
	 */
	private initializeRoutes(): void {
		this.router.get('/', this.asyncHandler(this.getAllDatabases, 'Get All Databases'));
		this.router.post('/', this.validateAll(createDatabaseSchema), this.asyncHandler(this.createDatabase, 'Create a new Database'));
		this.router.get('/:databaseId', this.asyncHandler(this.getOneDatabase, 'Get One Database'));
	}

	/**
	 * Retrieves all databases.
	 *
	 * @param {Request} req - The request object.
	 * @param {Response} res - The response object.
	 * @returns {Promise<void>} A promise that resolves when the operation is complete.
	 */
	private async getAllDatabases(req: Request, res: Response): Promise<void> {
		const databases: Array<IDatabase> = await this.databaseServices.getAllDatabases();
		res.json(databases);
	}

	/**
	 * Creates a new database based on the request body.
	 *
	 * @param {Request} req - The request object containing database details.
	 * @param {Response} res - The response object used to send the result.
	 * @returns {Promise<void>} This function does not return anything directly.
	 * @throws {Error} If a database with the same name already exists.
	 */
	private async createDatabase(req: Request, res: Response): Promise<void> {
		const database: IDatabase = req.body;
		const createdDatabase: IDatabase = await this.databaseServices.createDatabase(database);
		res.status(201).json(createdDatabase);
	}

	/**
	 * Retrieves a single database by its ID.
	 *
	 * @param {Request} req - The request object.
	 * @param {Response} res - The response object.
	 * @returns {Promise<void>} A promise that resolves when the operation is complete.
	 */
	private async getOneDatabase(req: Request, res: Response): Promise<void> {
		const databaseId: string = req.params.databaseId;
		const database: IDatabase | null = await this.databaseServices.getOneDatabase(databaseId);
		if (!database) {
			res.status(404).send(`Database with ID ${databaseId} not found`);
			return;
		}
		res.json(database);
	}
}
