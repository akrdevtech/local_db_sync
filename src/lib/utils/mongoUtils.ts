import { MongoClient, Db } from 'mongodb';
import { LOCAL_DB_URI } from '../../config';
/**
 * Connects to a MongoDB database given the connection string and db name as parameters and returns the db connection.
 *
 * @param {string} connectionString - The MongoDB connection string.
 * @param {string} dbName - The name of the database to connect to.
 * @returns {Promise<Db>} A promise that resolves with the MongoDB database connection.
 */
export function connectToMongoDB(connectionString: string, dbName: string): Promise<Db> {
	return MongoClient.connect(connectionString)
		.then((client) => client.db(dbName));
}


/**
 * Returns a list of names of collections in a MongoDB database.
 *
 * @param {Db} db - The MongoDB database connection.
 * @returns {Promise<string[]>} A promise that resolves with an array of collection names.
 */
export async function getCollectionNames(db: Db): Promise<string[]> {
	const collections = await db.listCollections().toArray();
	return collections.map((collection) => collection.name);
}


/**
 * Creates a new collection in the given MongoDB database.
 *
 * @param {Db} db - The MongoDB database connection.
 * @param {string} collectionName - The name of the collection to create.
 * @return {Promise<void>} A promise that resolves when the collection is created.
 */
export async function createCollection(db: Db, collectionName: string): Promise<void> {
	await db.createCollection(collectionName);
}


/**
 * Creates a new collection in the local database with the specified name.
 *
 * @param {string} dbName - The name of the local database.
 * @param {string} collectionName - The name of the collection to create.
 * @return {Promise<void>} A promise that resolves when the collection is created.
 */
export async function createCollectionInLocalDatabase(dbName: string, collectionName: string): Promise<void> {
	const client = await connectToMongoDB(LOCAL_DB_URI, dbName);
	await createCollection(client, collectionName);
}

/**
 * Syncs data from a remote database to a local database.
 *
 * @param {ISyncParams} syncParams - The parameters for syncing the data.
 * @return {Promise<number>} The total count of documents synced.
 */
export async function syncDataToLocalDatabase(syncParams: ISyncParams): Promise<number> {
	console.time('syncDataToLocalDatabase');
	const collectionName = syncParams.collectionName;
	const { localDb, remoteDb } = await getSourceAndTargetDbConnections(syncParams);

	const cursor = remoteDb.collection(collectionName).find({});
	const totalCount = await remoteDb.collection(collectionName).countDocuments({});

	let bulkOperations = localDb.collection(collectionName).initializeUnorderedBulkOp();
	const batchSize = 1000; // adjust as needed

	let thisCount = 0;
	for await (const doc of cursor) {
		bulkOperations.find({ _id: doc._id }).upsert().updateOne({ $set: doc });
		if (bulkOperations.batches.length >= batchSize) {
			await bulkOperations.execute();
			bulkOperations = localDb.collection(collectionName).initializeUnorderedBulkOp();
		}

		const percent = Number((thisCount / Number(totalCount)) * 100).toFixed(2);
		console.log(`Upserting -> ${collectionName}: ${++thisCount}/${totalCount} ~ ${percent}%`);
	}
	if (bulkOperations.batches.length > 0) {
		await bulkOperations.execute();
	}
	console.timeEnd('syncDataToLocalDatabase');
	return totalCount;
}

/**
 * Syncs the schema of a collection from a remote database to a local database.
 *
 * @param {ISyncParams} syncParams - The parameters for syncing the schema.
 * @return {Promise<void>} A promise that resolves when the schema is synced.
 */
export async function syncSchemaToLocalDatabase(syncParams: ISyncParams): Promise<void> {
	console.time('syncSchemaToLocalDatabase');
	const collectionName = syncParams.collectionName;
	const { localDb, remoteDb } = await getSourceAndTargetDbConnections(syncParams);

	const stats = await remoteDb.collection(collectionName).options();
	const validationInfo = stats?.validator;

	if (validationInfo) {
		await localDb.command({
			collMod: collectionName,
			validator: validationInfo,
		});
	}
	console.timeEnd('syncSchemaToLocalDatabase');
}

/**
 * Syncs the indexes of a collection from a remote database to a local database.
 *
 * @param {ISyncParams} syncParams - The parameters for syncing the indexes.
 * @return {Promise<void>} A promise that resolves when the indexes are synced.
 */
export async function syncIndexesToLocalDatabase(syncParams: ISyncParams): Promise<void> {
	console.time('syncIndexesToLocalDatabase');
	const collectionName = syncParams.collectionName;
	const { localDb, remoteDb } = await getSourceAndTargetDbConnections(syncParams);
	const indexes = await remoteDb.collection(collectionName).listIndexes().toArray();
	await localDb.collection(collectionName).createIndexes(indexes);
	console.timeEnd('syncIndexesToLocalDatabase');
}

/**
 * Retrieves the connections to the source and target databases based on the provided sync parameters.
 *
 * @param {ISyncParams} syncParams - The parameters used to determine the source and target databases.
 * @return {Promise<{ localDb: Db; remoteDb: Db }>} A promise that resolves to an object containing the local and remote database connections.
 */
export const getSourceAndTargetDbConnections = async (syncParams: ISyncParams): Promise<{ localDb: Db; remoteDb: Db }> => {
	let localDb: Db;
	let remoteDb: Db;
	const coreParams = syncParams as ICoreSyncParams;
	if (coreParams.remoteDbUrl) {
		localDb = await connectToMongoDB(LOCAL_DB_URI, coreParams.localDbName);
		remoteDb = await connectToMongoDB(coreParams.remoteDbUrl, coreParams.remoteDbName);
	} else {
		const populatedParams = syncParams as IPopulatedSyncParams;
		localDb = populatedParams.localDb;
		remoteDb = populatedParams.remoteDb;
	}
	return {
		localDb,
		remoteDb
	};
};

/**
 * Syncs a collection's data, schema, and indexes from a remote database to a local database.
 *
 * @param {ISyncParams} syncParams - The parameters for syncing the collection.
 * @return {Promise<number>} The total count of documents synced.
 */
export async function syncCollectionData(syncParams: ISyncParams): Promise<number> {
	const collectionName = syncParams.collectionName;
	const { localDb, remoteDb } = await getSourceAndTargetDbConnections(syncParams);
	const records = await syncDataToLocalDatabase({ collectionName, localDb, remoteDb });
	await syncSchemaToLocalDatabase({ collectionName, localDb, remoteDb });
	await syncIndexesToLocalDatabase({ collectionName, localDb, remoteDb });
	return records;
}

export interface ICoreSyncParams {
	collectionName: string;
	localDbName: string;
	remoteDbName: string;
	remoteDbUrl: string;
}
export interface IPopulatedSyncParams {
	collectionName: string;
	localDb: Db;
	remoteDb: Db;
}

export type ISyncParams = ICoreSyncParams | IPopulatedSyncParams;