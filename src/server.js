const mongoose = require('mongoose');
require('dotenv').config();
const app = require('./app');

const port = process.env.LOCALHOST_PORT;

app.listen(
  port,
  () => console.log(`app listening on http://localhost:${port}`),
);

mongoose.connect(
  process.env.DATABASE_STRING,
  {
    useNewUrlParser: true,
  },
).then(() => {
  console.log('Db connected');
});

module.exports = mongoose;
