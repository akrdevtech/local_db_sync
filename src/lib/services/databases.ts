import { LOCAL_DB_URI } from '../../config';
import { DatabaseModel, IConnectionPopulatedDatabase, IDatabase } from '../models/databases';
import { connectToMongoDB, getCollectionNames } from '../utils/mongoUtils';
import { BaseService } from './base_service';


/**
 * Interface for a service that provides operations on databases.
 */
/**
 * Interface for a service that provides operations on databases.
 */
export interface IDatabaseServiceApi {
	/**
	 * Retrieves all databases.
	 *
	 * @returns {Promise<Array<IDatabase>>} A promise that resolves with an array of databases.
	 */
	getAllDatabases(): Promise<IDatabase[]>;

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
	
	/**
	 * Retrieves a database with its associated connection by its ID.
	 *
	 * @param {string} databaseId - The ID of the database.
	 * @return {Promise<IConnectionPopulatedDatabase | null>} A promise that resolves with the populated database object, or null if not found.
	 */
	getDatabaseWithConnection(databaseId: string): Promise<IConnectionPopulatedDatabase | null>;

	/**
	 * Retrieves collections to create in the local database, based on the remote database.
	 *
	 * @param {string} connectionUri - The connection URI for the remote database.
	 * @param {string} dbName - The name of the remote database.
	 * @param {string} targetDbName - The name of the local database. If not provided, dbName is used.
	 * @returns {Promise<string[]>} A promise that resolves with an array of collections to create.
	 * @throws {Error} If there is an error while connecting to the databases.
	 */
	getCollectionsToCreate(connectionUri: string, dbName: string, targetDbName: string): Promise<string[]>;

	/**
	 * Updates the last sync timestamp for a database.
	 *
	 * @param {string} databaseId - The ID of the database.
	 * @returns {Promise<boolean>} A promise that resolves with true if the update was successful, false otherwise.
	 */
	updateLastSync(databaseId: string): Promise<boolean>;

	/**
	 * Retrieves databases by connection ID.
	 *
	 * @param {string} connectionId - The ID of the connection.
	 * @returns {Promise<Array<IDatabase>>} A promise that resolves with an array of databases.
	 */
	getDatabasesByConnectionId(connectionId: string): Promise<IDatabase[]>;
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
	 * Retrieves databases by connection ID.
	 *
	 * @param {string} connectionId - The ID of the connection.
	 * @returns {Promise<Array<IDatabase>>} A promise that resolves with an array of databases.
	 */
	getDatabasesByConnectionId(connectionId: string): Promise<Array<IDatabase>> {
		return DatabaseModel.find({ connection: connectionId }).lean().exec();
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
	public async getOneDatabaseByName(name: string): Promise<IDatabase | null> {
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

	/**
	 * Retrieves a database with its associated connection by its ID.
	 *
	 * @param {string} databaseId - The ID of the database.
	 * @return {Promise<IConnectionPopulatedDatabase | null>} A promise that resolves with the populated database object, or null if not found.
	 */
	getDatabaseWithConnection(databaseId: string): Promise<IConnectionPopulatedDatabase | null> {
		return DatabaseModel.findById(databaseId)
			.lean()
			.populate('connection')
			.exec();
	}

	/**
	 * Retrieves collections to create in the local database, based on the remote database.
	 *
	 * @param {string} connectionUri - The connection URI for the remote database.
	 * @param {string} dbName - The name of the remote database.
	 * @param {string} targetDbName - The name of the local database. If not provided, dbName is used.
	 * @returns {Promise<string[]>} A promise that resolves with an array of collections to create.
	 * @throws {Error} If there is an error while connecting to the databases.
	 */
	async getCollectionsToCreate(connectionUri: string, dbName: string, targetDbName: string = dbName): Promise<string[]> {
		const remoteClient = await connectToMongoDB(connectionUri, dbName);
		const localClient = await connectToMongoDB(LOCAL_DB_URI, targetDbName);
		const remoteCollections = await getCollectionNames(remoteClient);
		const localCollections = await getCollectionNames(localClient);
		return remoteCollections.filter(remoteCollection => !localCollections.includes(remoteCollection));
	}

	async updateLastSync(databaseId: string): Promise<boolean> {
		const updateResult = await DatabaseModel.updateOne({ _id: databaseId }, { $set: { lastSync: new Date() } });
		return updateResult.acknowledged;
	}
}
