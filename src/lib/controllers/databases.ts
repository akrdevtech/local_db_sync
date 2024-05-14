import { Request, Response } from 'express';
import { BaseController } from './base_controller';
import { DatabaseServiceApi, IDatabaseServiceApi } from '../services/databases';
import { IDatabase } from '../models/databases';
import { createDatabaseSchema } from '../validators/databases/create_database';
import { CollectionServiceApi, ICollectionServiceApi } from '../services/collections';
import { ICollection } from '../models/collections';
import { createCollectionInLocalDatabase } from '../utils/mongoUtils';

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
	private collectionServices: ICollectionServiceApi;

	/**
	 * Creates an instance of the DatabasesController class.
	 */
	constructor() {
		super('Database Controller');
		this.databaseServices = new DatabaseServiceApi();
		this.collectionServices = new CollectionServiceApi();
		this.initializeRoutes();
	}

	/**
	 * Initializes the routes for the DatabasesController.
	 */
	private initializeRoutes(): void {
		this.router.get('/', this.asyncHandler(this.getAllDatabases.bind(this), 'Get All Databases'));
		this.router.post('/', this.validateAll(createDatabaseSchema), this.asyncHandler(this.createDatabase.bind(this), 'Create a new Database'));
		this.router.get('/:databaseId', this.asyncHandler(this.getOneDatabase.bind(this), 'Get One Database'));
		this.router.post('/:databaseId/collections/initialize', this.asyncHandler(this.initializeDatabaseCollections.bind(this), 'Initialize Database Collections'));
		this.router.get('/connection/:connectionId', this.asyncHandler(this.getDatabasesByConnectionId.bind(this), 'Get Databases By Connection Id'));
	}

	private async getDatabasesByConnectionId(req: Request, res: Response): Promise<void> {
		const connectionId = req.params.connectionId;
		const result = await this.databaseServices.getDatabasesByConnectionId(connectionId);
		res.sendResponse(200, result);
	}	
	/**
	 * Initializes database collections.
	 *
	 * @param {Request} req - The request object.
	 * @param {Response} res - The response object.
	 * @return {Promise<void>} A promise that resolves when the operation is complete.
	 */
	private async initializeDatabaseCollections(req: Request, res: Response): Promise<void> {
		const databaseId = req.params.databaseId;
		const database = await this.databaseServices.getDatabaseWithConnection(databaseId);
		if (!database) {
			throw new Error('Database not found');
		}
		const { connection: { connectionUri, label }, dbName, targetDbName, } = database;
		const collectionsToCreate = await this.databaseServices.getCollectionsToCreate(connectionUri, dbName, targetDbName || dbName);
		await this.databaseServices.updateLastSync(databaseId);

		const lastSyncAt = new Date();
		const createdAt = lastSyncAt;
		await Promise.allSettled(collectionsToCreate.map(async (collectionName) => {
			await createCollectionInLocalDatabase(targetDbName || dbName, collectionName);
			await this.collectionServices.createCollection({
				label: `${label}_${collectionName}`,
				collectionName: collectionName,
				database: databaseId,
				lastSyncAt,
				createdAt
			} as ICollection);
		}));
		res.json({ connectionUri, dbName, targetDbName, collectionsToCreate });
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
		const database = req.body;
		const databaseCreateParams: IDatabase = {
			...database,
			targetDbName: database.targetDbName || database.dbName,
			createdAt: new Date(),
		};
		const createdDatabase: IDatabase = await this.databaseServices.createDatabase(databaseCreateParams);
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
