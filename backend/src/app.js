const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const env = require('./config/env');
const { errorHandler } = require('./middlewares/error');

const app = express();

app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// monta /api
app.use('/api', require('./routes'));

// 404 y errores
app.use((_req, res) => res.status(404).json({ error: 'No encontrado' }));
app.use(errorHandler);

module.exports = app;
