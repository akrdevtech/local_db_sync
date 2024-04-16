import { Document, Model, Schema, model } from 'mongoose';


export interface IConnection extends Document {
	label: string;
	description?: string;
	connectionUri: string;
	lastSyncAt: Date;
	createdAt: Date;
	updatedAt?: Date;
}

/**
 * The schema for a connection.
 *
 * @property {string} label - The label of the connection.
 * @property {string} [description] - The description of the connection (optional).
 * @property {string} connectionUri - The URI of the connection.
 * @property {Date} lastSyncAt - The date of the last synchronization.
 * @property {Date} createdAt - The date the connection was created.
 * @property {Date|undefined} [updatedAt] - The date the connection was last updated (optional).
 */
const ConnectionSchema = new Schema<IConnection>({
	label: { type: String, required: true, unique: true },
	description: { type: String, required: false },
	connectionUri: String,
	lastSyncAt: Date,
	createdAt: Date,
	updatedAt: { type: Date, required: false }
});

type ConnectionModelType = Model<IConnection>;


/**
 * Mongoose model for a Connection.
 *
 * @type {Model<IConnection, ConnectionModelType>}
 */
export const ConnectionModel = model<IConnection, ConnectionModelType>(
	'Connection',
	ConnectionSchema
);
