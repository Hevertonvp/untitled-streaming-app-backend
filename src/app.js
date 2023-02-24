const express = require('express');
const morgan = require('morgan');
const userRoutes = require('./routes/userRoutes');
const typeProductRoutes = require('./routes/typeProductRoutes');
const orderRoutes = require('./routes/orderRoutes');
const itemProductRoutes = require('./routes/itemProductRoutes');
const globalErrorHandler = require('./controller/errorController');
const AppError = require('./utils/appError');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => console.log(res.send('youre in home')));
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/products', typeProductRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/items', itemProductRoutes);
app.all('*', (req, res, next) => next(
  new AppError('não foi possível encotrar a página requisitada. Verifique a grafia e tente novamente', 404),
));

app.use(globalErrorHandler);

module.exports = app;
