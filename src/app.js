const express = require('express');
const sellerRoutes = require('./routes/sellerRoutes');
const costumerRoutes = require('./routes/costumerRoutes');
const typeProductRoutes = require('./routes/typeProductRoutes');
const orderRoutes = require('./routes/orderRoutes');
const itemProductRoutes = require('./routes/itemProductRoutes');
const globalErrorHandler = require('./controller/errorController');
const AppError = require('./utils/appError');

// const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => console.log(res.send('youre in home')));
app.use('/api/v1/sellers', sellerRoutes);
app.use('/api/v1/costumers', costumerRoutes);
app.use('/api/v1/products', typeProductRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/items', itemProductRoutes);
app.all('*', (req, res, next) => {
  next(new Error('não foi possível encotrar a página requisitada. Verifique a grafia e tente novamente', 404));
});

app.use(globalErrorHandler);

module.exports = app;
