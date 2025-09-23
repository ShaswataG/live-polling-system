const express = require('express');
const cors = require('cors');
require('dotenv').config();
const router = require('./routes/index');
const requestLogger = require('./middlewares/requestLogger');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(requestLogger);
app.use('/api', router);

app.get('/', (req: any, res: any) => {
    res.json({ message: 'Welcome to the Chat App API' });
});

app.use((req: any, res: any) => {
  res.status(404).json({ message: 'Not Found' });
});

app.use(errorHandler);

module.exports = app;