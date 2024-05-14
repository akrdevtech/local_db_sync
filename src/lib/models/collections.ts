import { Schema, model, Document } from 'mongoose';
import { IConnectionPopulatedDatabase, IDatabase } from './databases';

/**
 * Mongoose model for a Collection.
 * @typedef {Document & ICollection} ICollection
 * @property {string} label - The label of the collection.
 * @property {string} [description] - The description of the collection (optional).
 * @property {string} collectionName - The name of the collection.
 * @property {IDatabase['_id']} database - The ID of the associated database.
 * @property {Date} lastSyncAt - The date and time of the last sync.
 * @property {Date} createdAt - The date and time when the collection was created.
 * @property {Date} [updatedAt] - The date and time when the collection was last updated (optional).
 */
export interface ICollection extends Document {
  label: string;
  description?: string;
  collectionName: string;
  database: IDatabase['_id'];
  lastSyncAt: Date;
  createdAt: Date;
  updatedAt?: Date;
}


export interface ICollectionDeepPopulated extends ICollection {
  database: IConnectionPopulatedDatabase;
}

/**
 * Mongoose schema for a Collection.
 * @type {Schema}
 */
const CollectionSchema = new Schema<ICollection>({
	label: { type: String, required: true, unique: true },
	description: { type: String, required: false },
	collectionName: { type: String, required: true },
	database: { type: Schema.Types.ObjectId, ref: 'Database', required: true },
	lastSyncAt: { type: Date, required: true },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

/**
 * Mongoose model for a Collection.
 * @type {Model<ICollection>}
 */
export const CollectionModel = model<ICollection>('Collection', CollectionSchema);



