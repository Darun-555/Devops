const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/authRoutes');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');
const protect = require('./middleware/authMiddleware');

const app = express();
app.use(helmet());

app.use(cors());
app.use(express.json());

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts, please try again later.' }
});

app.use(globalLimiter);

if (process.env.NODE_ENV === 'production') {
  app.use('/api/auth/login', authLimiter);
}

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'OK',
    service: 'hospital-system-app',
    version: process.env.npm_package_version || '1.0.0',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    data: {}
  });
});

app.use('/api/auth', authRoutes);
app.use('/api', protect, routes);

app.use((req, res, next) => next(new AppError('Route not found', 404)));
app.use(errorHandler);

module.exports = app;
