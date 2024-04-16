import { Request, Response } from 'express';
import { BaseController } from './base_controller';
import { ConnectionServiceApi, IConnectionServiceApi } from '../services/connections';
import { createConnectionValidation } from '../validators/connections/create_connection';
import { IConnection } from '../models/connections';

/**
 * Represents a controller for managing connections.
 *
 * @class
 * @extends {BaseController}
 */
export class Connections extends BaseController {
	/**
	 * The connection services API.
	 *
	 * @private
	 * @type {ConnectionServiceApi}
	 */
	private connectionServices: IConnectionServiceApi;

	/**
	 * Creates an instance of the Connections class.
	 *
	 * @constructor
	 */
	constructor() {
		super('Connection Controller');
		this.connectionServices = new ConnectionServiceApi();
		this.initializeRoutes();
	}

	/**
	 * Initializes the routes for the Connections controller.
	 * @return {void}
	 */
	public initializeRoutes(): void {
		this.router.get('/', this.asyncHandler(this.getAllConnections.bind(this), 'Get All Connections'));
		this.router.post('/', this.validateAll(createConnectionValidation), this.asyncHandler(this.createConnection.bind(this), 'Create a new Connection'));
		this.router.get('/:connectionId', this.asyncHandler(this.getOneConnection.bind(this), 'Get One Connection'));
	}

	/**
	 * Retrieves all connections.
	 *
	 * @param {Request} req - The request object.
	 * @param {Response} res - The response object.
	 * @return {Promise<void>} A promise that resolves when the operation is complete.
	 */
	async getAllConnections(req: Request, res: Response): Promise<void> {
		const result = await this.connectionServices.getAllConnections();
		res.sendResponse(200, result);
	}

	/**
	 * Retrieves a single connection by its ID.
	 *
	 * @param {Request} req - The request object.
	 * @param {Response} res - The response object.
	 * @return {Promise<void>} A promise that resolves when the operation is complete.
	 */
	async getOneConnection(req: Request, res: Response): Promise<void> {
		const connectionId = req.params.connectionId;
		const connection = await this.connectionServices.getOneConnection(connectionId);
		res.sendResponse(200, connection);
	}

	/**
	 * Creates a new connection based on the request body.
	 *
	 * @param {Request} req - The request object containing connection details.
	 * @param {Response} res - The response object used to send the result.
	 * @return {Promise<void>} This function does not return anything directly.
	 * @throws {Error} If a connection with the same label already exists.
	 */
	async createConnection(req: Request, res: Response): Promise<void> {
		const connection = req.body;
		const existingConnection = await this.connectionServices.getOneConnectionByLabel(connection.label);
		if (existingConnection) {
			throw new Error(`Connection with label ${connection.label} already exists`);
		}
		const connectionPayload: IConnection = {
			...connection,
			createdAt: new Date(),
		};
		const createdConnection = await this.connectionServices.createConnection(connectionPayload);
		res.sendResponse(200, { id: createdConnection.id });
	}
}
