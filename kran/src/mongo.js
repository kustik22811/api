const mongoose = require('mongoose');
const config = require('./config');

/* Create a schema */
const userSchema = new mongoose.Schema({
    user_id: Number,
    viewed: Number,
    next: Number,
    refferer: Number,
    refEarned: Number
});

/* Create a model */
const User = mongoose.model('User', userSchema);

/* Connect to database */
mongoose.connect(config.db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: true
});

/* Connection variable */
const Connection = mongoose.connection;

/* If error on connection - kill server (restart) */
Connection.on('error', () => process.exit(1));

module.exports = {
    Connection,
    User
};