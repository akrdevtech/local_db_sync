import express, { json, urlencoded } from 'express';
import * as httpContext from 'express-http-context';
import * as methodOverride from 'method-override';
import { Connections } from './src/lib/controllers/connections';
import { expressRequestId } from '@akrdevtech/lib-express-request-id';
import { GlobalErrorHandler } from './src/lib/middlewares/error_handler';
import { ResponseHandler } from './src/lib/middlewares/response_handler';
import mongoose from 'mongoose';

const app = express();
const port = 3000;



app.use(httpContext.middleware);
app.use(expressRequestId());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(methodOverride.default());
app.use(ResponseHandler);


app.use('/connections', new Connections().getRouter());

app.use(GlobalErrorHandler);

process.on('unhandledRejection', (reason, promise) => {
	console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

mongoose.connect('mongodb://localhost/db_sync_tool', {}).then(() => {
	console.log('Connected to MongoDB');
	app.listen(port, () => {
		console.log(`Server is running at http://localhost:${port}`);
	});
}).catch((err) => {
	console.error(err);
});

