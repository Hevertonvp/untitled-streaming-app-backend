const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanatize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const typeProductRoutes = require('./routes/typeProductRoutes');
const orderRoutes = require('./routes/orderRoutes');
const itemProductRoutes = require('./routes/itemProductRoutes');
const globalErrorHandler = require('./controller/errorController');
const AppError = require('./utils/appError');

const app = express();

const corsConfig = {
  credentials: true,
  origin: true,
};
app.use(cors(corsConfig));

app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 4000000, // change
  windowMs: 60 * 60 * 1000,
  message:
    'Limite de requisições para mesmo usuário atingido, tente novamente em uma hora',
});

app.use('/api', limiter);
app.use(express.json({ limit: '15kb' }));

// data sanitization to prevent NoSQL injection

app.use(mongoSanatize());
app.use(xss());

// preventing parameter polution

app.use(hpp({
  whitelist: ['price'],
}));

app.use(express.static('public'));
app.use(cookieParser());

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
