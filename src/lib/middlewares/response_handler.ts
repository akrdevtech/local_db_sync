import { RequestHandler } from 'express';
import { logInfo } from '../utils/logger';

export const ResponseHandler: RequestHandler = (req, res, next) => {
	const start = Date.now();
	res.sendResponse = function (code = 200, result?: unknown) {
		const latency = Date.now() - start;
		logInfo(`[${new Date().toISOString()}] → [TXID]: ${req.txId} → Request to ${req.method} ${req.originalUrl} completed in ${latency}ms`);
		return this.status(code).json({ result, transactionId: req.txId });
	};
	next();
};