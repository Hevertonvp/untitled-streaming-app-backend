const mongoose = require('mongoose');
require('dotenv').config();

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('uncaught exception, sutting down');
});
const app = require('./app');

const port = process.env.LOCALHOST_PORT;

const server = app.listen(
  port,
  () => console.log(`app listening on http://localhost:${port}`),
);
// mongoose.set('runValidators', true); // here is your global setting
mongoose.connect(
  process.env.DATABASE_STRING,
  {
    useNewUrlParser: true,
  },
).then(() => {
  console.log('Db connected');
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('unhandled rejection, sutting down');
  server.close(() => {
    process.exit(1);
  });
});

module.exports = mongoose;
