const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');
const protect = require('./middleware/authMiddleware');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'OK',
    data: {}
  });
});

app.use('/api/auth', authRoutes);
app.use('/api', protect, routes);

app.use((req, res, next) => next(new AppError('Route not found', 404)));
app.use(errorHandler);

module.exports = app;
