import { Request, Response } from 'express';
import { CollectionServiceApi, ICollectionServiceApi } from '../services/collections';
import { ICollection } from '../models/collections';
import { BaseController } from './base_controller';
import { createConnectionValidation } from '../validators/connections/create_connection';

export class Collections extends BaseController {
	private collectionService: ICollectionServiceApi;

	constructor() {
		super('Collection Controller');
		this.collectionService = new CollectionServiceApi();
		this.initializeRoutes();
	}

	/**
	 * Initializes the routes for the CollectionController.
	 */
	public initializeRoutes(): void {
		this.router.get('/', this.asyncHandler(this.getAllCollections.bind(this), 'Get All Collections'));
		this.router.route('/')
			.post(this.validateAll(createConnectionValidation), this.asyncHandler(this.createCollection.bind(this), 'Create a new Collection'))
			.get(this.asyncHandler(this.getAllCollections.bind(this), 'Get All Collections'));
		this.router.get('/database/:databaseId', this.asyncHandler(this.getCollectionsByDatabaseId.bind(this), 'Get Collections By Database Id'));
		this.router.get('/:id', this.asyncHandler(this.getOneCollection.bind(this), 'Get One Collection By Name'));
		this.router.post('/:id/records/sync', this.asyncHandler(this.syncAllRecords.bind(this), 'Get One Collection By Name'));
	}

	private async getCollectionsByDatabaseId(req: Request, res: Response): Promise<void> {
		const databaseId: string = req.params.databaseId;
		const result: Array<ICollection> = await this.collectionService.getCollectionsByDatabaseId(databaseId);
		res.sendResponse(200, result);
	}

	private async syncAllRecords(req: Request, res: Response): Promise<void> {
		const collectionId: string = req.params.id;
		const records = await this.collectionService.syncAllRecords(collectionId);
		res.json({ success: true, records });
	}
	/**
	 * Retrieves all collections.
	 *
	 * @param {Request} req - The request object.
	 * @param {Response} res - The response object.
	 * @returns {Promise<void>} - A promise that resolves when the response is sent.
	 */
	private async getAllCollections(req: Request, res: Response): Promise<void> {
		try {
			const collections: Array<ICollection> = await this.collectionService.getAllCollections();
			res.status(200).json(collections);
		} catch (error) {
			res.status(500).json({ error: 'An error occurred while retrieving collections.' });
		}
	}

	/**
	 * Retrieves a single collection by its ID.
	 *
	 * @param {Request} req - The request object.
	 * @param {Response} res - The response object.
	 * @returns {Promise<void>} - A promise that resolves when the response is sent.
	 */
	private async getOneCollection(req: Request, res: Response): Promise<void> {
		const collectionId: string = req.params.id;
		try {
			const collection: ICollection = await this.collectionService.getOneCollection(collectionId);
			if (collection) {
				res.status(200).json(collection);
			} else {
				res.status(404).json({ error: 'Collection not found.' });
			}
		} catch (error) {
			res.status(500).json({ error: 'An error occurred while retrieving the collection.' });
		}
	}

	/**
	 * Retrieves a single collection by its name.
	 *
	 * @param {Request} req - The request object.
	 * @param {Response} res - The response object.
	 * @returns {Promise<void>} - A promise that resolves when the response is sent.
	 */
	private async getOneCollectionByName(req: Request, res: Response): Promise<void> {
		const name: string = req.params.name;
		try {
			const collection: ICollection | null = await this.collectionService.getOneCollectionByName(name);
			if (collection) {
				res.status(200).json(collection);
			} else {
				res.status(404).json({ error: 'Collection not found.' });
			}
		} catch (error) {
			res.status(500).json({ error: 'An error occurred while retrieving the collection.' });
		}
	}

	/**
	 * Creates a new collection.
	 *
	 * @param {Request} req - The request object.
	 * @param {Response} res - The response object.
	 * @returns {Promise<void>} - A promise that resolves when the response is sent.
	 */
	private async createCollection(req: Request, res: Response): Promise<void> {
		const collection: ICollection = req.body;
		try {
			const createdCollection: ICollection = await this.collectionService.createCollection(collection);
			res.status(201).json(createdCollection);
		} catch (error) {
			res.status(500).json({ error: 'An error occurred while creating the collection.' });
		}
	}

	private async updateLastSyncAt(req: Request, res: Response): Promise<void> {
		const collectionId: string = req.params.id;
		try {
			const updateResult = await this.collectionService.updateLastSync(collectionId);
			res.status(200).json({ updateResult });
		} catch (error) {
			res.status(500).json({ error: 'An error occurred while updating the last sync at.' });
		}
	}
}

