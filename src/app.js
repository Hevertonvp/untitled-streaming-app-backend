const express = require('express');
const sellerRoutes = require('./routes/sellerRoutes');
const costumerRoutes = require('./routes/costumerRoutes');

const app = express();

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => console.log(res.send('youre in home')));
app.use('/api/v1/sellers', sellerRoutes);
app.use('/api/v1/costumers', costumerRoutes);

module.exports = app;
