import { NextFunction, Request, RequestHandler, Response, Router } from 'express';
import * as httpContext from 'express-http-context';
import { logInfo } from '../utils/logger';
import { RequestValidator } from '@akrdevtech/lib-express-joi-validation-middleware';

/**
 * Abstract base class for controllers.
 */
export abstract class BaseController {
	/** The router for the controller. */
	protected router: Router;
	/** The name of the module. */
	protected moduleName: string;
	/** Validates all request properties. */
	public validateAll: RequestValidator['validateAll'];
	/** Validates the request body. */
	public validateBody: RequestValidator['validateBody'];
	/** Validates the cookies in the request. */
	public validateCookies: RequestValidator['validateCookies'];
	/** Validates the headers in the request. */
	public validateHeaders: RequestValidator['validateHeaders'];
	/** Validates the parameters in the request. */
	public validateParams: RequestValidator['validateParams'];
	/** Validates the query parameters in the request. */
	public validateQuery: RequestValidator['validateQuery'];

	/**
	 * Constructs a new BaseController.
	 * @param moduleName The name of the module.
	 */
	constructor(moduleName: string) {
		this.moduleName = moduleName;
		this.router = Router();
		const { validateAll, validateBody, validateCookies, validateHeaders, validateParams, validateQuery } = new RequestValidator({ abortEarly: false });
		this.validateAll = validateAll;
		this.validateBody = validateBody;
		this.validateCookies = validateCookies;
		this.validateHeaders = validateHeaders;
		this.validateParams = validateParams;
		this.validateQuery = validateQuery;
	}
	
	/**
	 * Creates an async handler for a request.
	 * @param fn The request handler function.
	 * @param transactionMessage The message to log for the transaction.
	 * @returns The async handler function.
	 */
	protected asyncHandler =
		(fn: RequestHandler, transactionMessage?: string) =>
			(req: Request, res: Response, next: NextFunction): Promise<void> => {
				const data = { url: `${req.method} ${req.originalUrl}`, body: req.body, params: req.params, query: req.query };
				logInfo(`[${new Date().toISOString()}] → [TXID]: ${req.txId} → [MODULE]: ${this.moduleName.toUpperCase()} - ${transactionMessage ? transactionMessage : ''} → [METADATA]: ${JSON.stringify(data)} `);
				httpContext.set('txId', req.txId);
				return Promise.resolve(fn(req, res, next)).catch(next);
			};

	/**
	 * Gets the router for the controller.
	 * @returns The router.
	 */
	public getRouter = (): Router => {
		return this.router;
	};
	
	/**
	 * Gets the name of the module.
	 * @returns The module name.
	 */
	getModuleName = (): string => {
		return this.moduleName;
	};
}
