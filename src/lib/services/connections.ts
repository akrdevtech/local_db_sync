import { ConnectionModel, IConnection } from '../models/connections';
import { BaseService } from './base_service';


/**
 * Interface for a service that provides operations on connections.
 */
export interface IConnectionServiceApi {
	/**
	 * Retrieves all connections.
	 *
	 * @returns {Promise<Array<IConnection>>} A promise that resolves with an array of connections.
	 */
	getAllConnections(): Promise<Array<IConnection>>;

	/**
	 * Retrieves a single connection by its ID.
	 *
	 * @param {string} connectionId - The ID of the connection to retrieve.
	 * @returns {Promise<IConnection>} A promise that resolves with the retrieved connection.
	 */
	getOneConnection(connectionId: string): Promise<IConnection>;

	/**
	 * Creates a new connection.
	 *
	 * @param {IConnection} connection - The connection object to create.
	 * @returns {Promise<IConnection>} A promise that resolves with the created connection.
	 */
	createConnection(connection: IConnection): Promise<IConnection>;

	/**
	 * Retrieves a single connection by its label.
	 *
	 * @param {string} label - The label of the connection to retrieve.
	 * @returns {Promise<IConnection | null>} A promise that resolves with the retrieved connection, or null if not found.
	 */
	getOneConnectionByLabel(label: string): Promise<IConnection | null>;

	/**
	 * Deletes a connection by its ID.
	 *
	 * @param {string} connectionId - The ID of the connection to delete.
	 * @returns {Promise<IConnection>} A promise that resolves with the deleted connection.
	 */
	deleteConnection(connectionId: string): Promise<IConnection>;
}

export class ConnectionServiceApi extends BaseService implements IConnectionServiceApi {
	constructor() {
		super('Connection Service');
	}

	deleteConnection(connectionId: string): Promise<IConnection> {
		this.logInfo('Deleting one Connection');
		try {
			return ConnectionModel.findByIdAndDelete(connectionId)
				.lean()
				.exec()
				.then((connection) => {
					if (connection === null) {
						throw new Error('Connection not found');
					}
					return connection;
				});
		} catch (error) {
			this.logInfo('Error while deleting connection');
			throw error;
		}
	}
	/**
	 * Retrieves all connections.
	 *
	 * @return {Promise<Array<IConnection>>} An array of connections.
	 */
	public async getAllConnections(): Promise<Array<IConnection>> {
		this.logInfo('Getting all Connections');
		try {
			return ConnectionModel.find().lean().exec();
		} catch (error) {
			this.logInfo('Error while getting connections');
			throw error;
		}
	}

	/**
	 * Retrieves a single connection by its ID.
	 *
	 * @param {string} connectionId - The ID of the connection to retrieve.
	 * @return {Promise<IConnection>} A promise that resolves with the retrieved connection.
	 */
	getOneConnection(connectionId: string): Promise<IConnection> {
		this.logInfo('Getting one Connection');
		try {
			return ConnectionModel.findById(connectionId)
				.lean()
				.exec()
				.then((connection) => {
					if (connection === null) {
						throw new Error('Connection not found');
					}
					return connection;
				});
		} catch (error) {
			this.logInfo('Error while getting connection : ');
			throw error;
		}
	}

	/**
	 * Creates a new connection.
	 *
	 * @param {IConnection} connection - The connection object to create.
	 * @return {Promise<IConnection>} A promise that resolves with the created connection.
	 */
	createConnection(connection: IConnection): Promise<IConnection> {
		this.logInfo('Creating a new Connection');
		try {
			return ConnectionModel.create(connection);
		} catch (error) {
			this.logInfo('Error while creating connection : ');
			throw error;
		}
	}


	/**
	 * Retrieves a single connection by its label.
	 *
	 * @param {string} label - The label of the connection to retrieve.
	 * @return {Promise<IConnection|null>} A promise that resolves with the retrieved connection, or null if not found.
	 */
	getOneConnectionByLabel(label: string): Promise<IConnection|null> {
		return ConnectionModel.findOne({ label: label })
			.lean()
			.exec()
			.then((connection) => {
				return connection || null;
			});
	}



}