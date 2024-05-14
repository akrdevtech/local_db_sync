
import { Schema, Document, model } from 'mongoose';
import {  IConnection } from './connections';


/**
 * Mongoose model for a Database.
 *
 * @interface IDatabase
 * @extends {Document}
 * @property {string} label - The label of the database.
 * @property {string} [description] - The description of the database (optional).
 * @property {string} dbName - The name of the database.
 * @property {IConnection['_id']} connection - The ID of the associated connection.
 * @property {Date} lastSyncAt - The date and time of the last sync.
 * @property {Date} createdAt - The date and time when the database was created.
 * @property {Date|undefined} [updatedAt] - The date and time when the database was last updated (optional).
 */
export interface IDatabase extends Document {
	label: string;
	description?: string;
	dbName: string;
	targetDbName?: string;
	connection: IConnection['_id']; // refers to ConnectionModel
	lastSyncAt?: Date;
	createdAt: Date;
	updatedAt?: Date;
}


/**
 * Interface for a populated Database.
 *
 * @interface IConnectionPopulatedDatabase
 * @extends {IDatabase}
 * @property {IConnection} connection - The associated connection.
 */
export interface IConnectionPopulatedDatabase extends IDatabase {
	connection: IConnection;
}


/**
 * Mongoose model for a Database.
 *
 * @typedef {Document & IDatabase} IDatabase
 * @property {string} label - The label of the database.
 * @property {string} [description] - The description of the database (optional).
 * @property {string} dbName - The name of the database.
 * @property {IConnection['_id']} connection - The ID of the associated connection.
 * @property {Date} lastSyncAt - The date and time of the last sync.
 * @property {Date} createdAt - The date and time when the database was created.
 * @property {Date} [updatedAt] - The date and time when the database was last updated (optional).
 */

/**
 * Mongoose schema for a Database.
 *
 * @type {Schema}
 */
export const DatabaseSchema: Schema = new Schema({
	label: { type: String, required: true, unique: true },
	description: { type: String, required: false },
	dbName: { type: String, required: true },
	targetDbName: { type: String, required: false },
	connection: { type: Schema.Types.ObjectId, ref: 'Connection', required: true },
	lastSyncAt: { type: Date, required: false },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

/**
 * Mongoose model for a Database.
 *
 * @type {Model<IDatabase>}
 */
export const DatabaseModel = model<IDatabase>('Database', DatabaseSchema);
