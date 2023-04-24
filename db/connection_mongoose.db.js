const mongoose = require('mongoose');
const Config = require('../config/config.json');

const dbConfig = Config.mongoose;

mongoose.connect(dbConfig.url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  user: dbConfig.user,
  pass: dbConfig.password
});

const initializeDB = mongoose.connection;

initializeDB.on('error', console.error.bind(console, 'MongoDB connection error:'));
initializeDB.once('open', () => {
  console.log('Connected to database');
});

mongoose.set('debug', false);
// require('../models');

module.exports = initializeDB;
