import { DatabaseModel, IDatabase } from '../models/databases';
import { BaseService } from './base_service';


/**
 * Interface for a service that provides operations on databases.
 */
export interface IDatabaseServiceApi {
	/**
	 * Retrieves all databases.
	 *
	 * @returns {Promise<Array<IDatabase>>} A promise that resolves with an array of databases.
	 */
	getAllDatabases(): Promise<Array<IDatabase>>;
	
	/**
	 * Retrieves a single database by its ID.
	 *
	 * @param {string} databaseId - The ID of the database to retrieve.
	 * @returns {Promise<IDatabase>} A promise that resolves with the retrieved database.
	 */
	getOneDatabase(databaseId: string): Promise<IDatabase>;
	
	/**
	 * Creates a new database.
	 *
	 * @param {IDatabase} database - The database object to create.
	 * @returns {Promise<IDatabase>} A promise that resolves with the created database.
	 */
	createDatabase(database: IDatabase): Promise<IDatabase>;
	
	/**
	 * Retrieves a single database by its name.
	 *
	 * @param {string} name - The name of the database to retrieve.
	 * @returns {Promise<IDatabase | null>} A promise that resolves with the retrieved database, or null if not found.
	 */
	getOneDatabaseByName(name: string): Promise<IDatabase | null>;
}


/**
 * Service that provides operations on databases.
 * Implements the IDatabaseServiceApi interface.
 */
export class DatabaseServiceApi extends BaseService implements IDatabaseServiceApi {
	/**
	 * Creates a new DatabaseServiceApi.
	 */
	constructor() {
		super('Database Service');
	}

	/**
	 * Retrieves all databases.
	 *
	 * @returns {Promise<Array<IDatabase>>} A promise that resolves with an array of databases.
	 */
	public async getAllDatabases(): Promise<Array<IDatabase>> {
		this.logInfo('Getting all databases');
		try {
			return DatabaseModel.find().lean().exec();
		} catch (error) {
			this.logInfo('Error while getting databases');
			throw error;
		}
	}

	/**
	 * Retrieves a single database by its ID.
	 *
	 * @param {string} databaseId - The ID of the database to retrieve.
	 * @returns {Promise<IDatabase>} A promise that resolves with the retrieved database.
	 */
	public async getOneDatabase(databaseId: string): Promise<IDatabase> {
		this.logInfo('Getting one database');
		try {
			const database = await DatabaseModel.findById(databaseId)
				.lean()
				.exec();
			if (!database) {
				throw new Error('Database not found');
			}
			return database;
		} catch (error) {
			this.logInfo('Error while getting database');
			throw error;
		}
	}

	/**
	 * Creates a new database.
	 *
	 * @param {IDatabase} database - The database object to create.
	 * @returns {Promise<IDatabase>} A promise that resolves with the created database.
	 */
	public async createDatabase(database: IDatabase): Promise<IDatabase> {
		this.logInfo('Creating a new database');
		try {
			return DatabaseModel.create(database);
		} catch (error) {
			this.logInfo('Error while creating database');
			throw error;
		}
	}

	/**
	 * Retrieves a single database by its name.
	 *
	 * @param {string} name - The name of the database to retrieve.
	 * @returns {Promise<IDatabase|null>} A promise that resolves with the retrieved database, or null if not found.
	 */
	public async getOneDatabaseByName(name: string): Promise<IDatabase|null> {
		this.logInfo('Getting one database by name');
		try {
			const database = await DatabaseModel.findOne({ name: name })
				.lean()
				.exec();
			return database || null;
		} catch (error) {
			this.logInfo('Error while getting database by name');
			throw error;
		}
	}
}
