import express, { json, urlencoded } from 'express';
import * as httpContext from 'express-http-context';
import * as methodOverride from 'method-override';
import { Connections } from './src/lib/controllers/connections';
import { expressRequestId } from '@akrdevtech/lib-express-request-id';
import { GlobalErrorHandler } from './src/lib/middlewares/error_handler';
import { ResponseHandler } from './src/lib/middlewares/response_handler';
import mongoose from 'mongoose';
import { Databases } from './src/lib/controllers/databases';
import { Collections } from './src/lib/controllers/collections';
import cors from 'cors';

/**
 * The main Express app
 */
const app = express();

/**
 * The port to listen on
 */
const port = 3000;

/**
 * Apply the HttpContext middleware to add request context to logs
 */
app.use(httpContext.middleware);

/**
 * Add a unique request ID to each request
 */
app.use(expressRequestId());

/**
 * Parse JSON requests
 */
app.use(json());

/**
 * Parse URL encoded requests
 */
app.use(urlencoded({ extended: true }));

/**
 * Allow for method override, e.g. put/patch via post request
 */
app.use(methodOverride.default());

/**
 * Apply the ResponseHandler middleware to send a standardized response
 */
app.use(ResponseHandler);

/**
 * Apply the CORS middleware
 */
app.use(cors());


/**
 * Mounts the Connections router to the app.
 *
 * @see {@link Connections.getRouter}
 */
app.use('/connections', new Connections().getRouter());

/**
 * Mounts the Databases router to the app.
 *
 * @see {@link Databases.getRouter}
 */
app.use('/databases', new Databases().getRouter());

app.use('/collections', new Collections().getRouter());

/**
 * Apply the GlobalErrorHandler middleware to handle uncaught errors
 */
app.use(GlobalErrorHandler);

/**
 * Listen for unhandled promise rejections
 */
process.on('unhandledRejection', (reason, promise) => {
	console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

/**
 * Connect to MongoDB and start the server
 */
mongoose.connect('mongodb://localhost/db_sync_tool', {}).then(() => {
	console.log('Connected to MongoDB');
	app.listen(port, () => {
		console.log(`Server is running at http://localhost:${port}`);
	});
}).catch((err) => {
	console.error(err);
});

