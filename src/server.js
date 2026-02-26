const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

app.use(express.json());

app.use((req, res, next) => {
	const userId = req.header('x-user-id');
	const role = req.header('x-user-role');

	if (userId && role) {
		req.user = { id: userId, role };
	}

	return next();
});

app.use('/', routes);

app.use((req, res, next) => next(new AppError('Route not found', 404)));

app.use(errorHandler);

const mongoUri =
	process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGODB_URL;

if (!mongoUri) {
	throw new Error('MongoDB connection string is missing in environment variables.');
}

const port = process.env.PORT || 5000;

const startServer = async () => {
	await mongoose.connect(mongoUri);

	app.listen(port, () => {
		console.log(`Server listening on port ${port}`);
	});
};

startServer().catch((error) => {
	console.error('Failed to start server:', error);
	process.exit(1);
});

process.on('unhandledRejection', (error) => {
	console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
	console.error('Uncaught exception:', error);
});
