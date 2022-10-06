const express = require('express');
const sellerRoutes = require('./routes/sellerRoutes');
const costumerRoutes = require('./routes/costumerRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => console.log(res.send('youre in home')));
app.use('/api/v1/sellers', sellerRoutes);
app.use('/api/v1/costumers', costumerRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/admins', adminRoutes);

module.exports = app;
