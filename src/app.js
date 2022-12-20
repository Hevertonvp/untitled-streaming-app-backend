const express = require('express');
const sellerRoutes = require('./routes/sellerRoutes');
const costumerRoutes = require('./routes/costumerRoutes');
const typeProductRoutes = require('./routes/typeProductRoutes');
const orderRoutes = require('./routes/orderRoutes');
const itemProductRoutes = require('./routes/itemProductRoutes');
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

// app.use('/api/v1/admins', adminRoutes);

module.exports = app;
