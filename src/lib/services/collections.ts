import { CollectionModel, ICollection, ICollectionDeepPopulated } from '../models/collections';
import { syncCollectionData } from '../utils/mongoUtils';
import { BaseService } from './base_service';

/**
 * Interface for a service that provides operations on collections.
 */
export interface ICollectionServiceApi {
   /**
    * Retrieves all collections.
    *
    * @returns {Promise<Array<ICollection>>} A promise that resolves with an array of collections.
    */
   getAllCollections(): Promise<Array<ICollection>>;

   /**
    * Retrieves a single collection by its ID.
    *
    * @param {string} collectionId - The ID of the collection to retrieve.
    * @returns {Promise<ICollection>} A promise that resolves with the retrieved collection.
    */
   getOneCollection(collectionId: string): Promise<ICollection>;

   /**
    * Creates a new collection.
    *
    * @param {ICollection} collection - The collection object to create.
    * @returns {Promise<ICollection>} A promise that resolves with the created collection.
    */
   createCollection(collection: ICollection): Promise<ICollection>;

   /**
    * Retrieves a single collection by its name.
    *
    * @param {string} name - The name of the collection to retrieve.
    * @returns {Promise<ICollection|null>} A promise that resolves with the retrieved collection, or null if not found.
    */
   getOneCollectionByName(name: string): Promise<ICollection | null>;
   
   /**
    * Updates the last sync timestamp of a collection.
    *
    * @param {string} collectionId - The ID of the collection to update.
    * @returns {Promise<boolean>} A promise that resolves with a boolean indicating whether the update was successful.
    */
   updateLastSync(collectionId: string): Promise<boolean>;

   /**
    * Syncs all records in a collection.
    *
    * @param {string} collectionId - The ID of the collection to sync.
    * @returns {Promise<number>} A promise that resolves with the number of records synced.
    */
   syncAllRecords(collectionId: string): Promise<number>;

   /**
    * Retrieves collections by their database ID.
    *
    * @param {string} databaseId - The ID of the database to retrieve collections from.
    * @returns {Promise<Array<ICollection>>} A promise that resolves with an array of collections.
    */
   getCollectionsByDatabaseId(databaseId: string): Promise<Array<ICollection>>;
}

/**
 * Service that provides operations on collections.
 * Implements the ICollectionServiceApi interface.
 */
export class CollectionServiceApi extends BaseService implements ICollectionServiceApi {
	/**
   * Creates a new CollectionServiceApi.
   */
	constructor() {
		super('Collection Service');
	}

	/**
   * Retrieves all collections.
   *
   * @returns {Promise<Array<ICollection>>} A promise that resolves with an array of collections.
   */
	async getAllCollections(): Promise<Array<ICollection>> {
		return CollectionModel.find().exec();
	}

	/**
   * Retrieves a single collection by its ID.
   *
   * @param {string} collectionId - The ID of the collection to retrieve.
   * @returns {Promise<ICollection>} A promise that resolves with the retrieved collection.
   * @throws {Error} Throws an error if the collection is not found.
   */
	async getOneCollection(collectionId: string): Promise<ICollection> {
		const foundCollection = await CollectionModel.findById(collectionId).exec();
		if (!foundCollection) {
			throw new Error(`Collection with ID '${collectionId}' was not found.`);
		}
		return foundCollection;
	}

	/**
   * Creates a new collection.
   *
   * @param {ICollection} collection - The collection object to create.
   * @returns {Promise<ICollection>} A promise that resolves with the created collection.
   */
	async createCollection(collection: ICollection): Promise<ICollection> {
		const createdCollection = new CollectionModel(collection);
		return createdCollection.save();
	}

	/**
   * Retrieves a single collection by its name.
   *
   * @param {string} name - The name of the collection to retrieve.
   * @returns {Promise<ICollection|null>} A promise that resolves with the retrieved collection, or null if not found.
   */
	async getOneCollectionByName(name: string): Promise<ICollection | null> {
		return CollectionModel.findOne({ name }).exec();
	}

	async updateLastSync(collectionId: string): Promise<boolean> {
		const collection = await CollectionModel.findById(collectionId);
		if (collection) {
			collection.lastSyncAt = new Date();
			await collection.save();
			return true;
		}
		return false;
	}

	async syncAllRecords(collectionId: string): Promise<number> {
		const collection = await CollectionModel.findById(collectionId).lean().populate({ path: 'database', populate: { path: 'connection' } }).exec();
		const { collectionName, database: { dbName, targetDbName, connection: { connectionUri } } } = collection as ICollectionDeepPopulated;
		this.logInfo(JSON.stringify({ collectionName, dbName, targetDbName, connectionUri }));
		const records = await syncCollectionData({ collectionName, localDbName: targetDbName || dbName, remoteDbName: dbName, remoteDbUrl: connectionUri });
		this.updateLastSync(collectionId);
		return records;
	}

	async getCollectionsByDatabaseId(databaseId: string): Promise<Array<ICollection>> {
		return CollectionModel.find({ database: databaseId }).exec();
	}
}