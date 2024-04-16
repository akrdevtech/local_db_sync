import { ErrorRequestHandler } from 'express';

export const GlobalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {   
	if (res.headersSent) {
		return next(err);
	}
	const body = {
		message: err.message ? err.message : err.errorMessage ? err.errorMessage : 'Internal',
		stack: err.stack ? err.stack : '',
		errors: err.errors ? err.errors : [],
		source: err.source ? err.source : 'ErrorSource.INTERNAL',
		transactionId: req.txId,
	};
	const status = err.status || err.statusCode || 500;  
	res.status(status).send(body);
  
	next();
};