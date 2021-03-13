const Coin = require('node-vkcoinapi');

/* Import config */
const config = require('./config');

const coin = new Coin({
    key: config.key,
    userId: config.user_id,
    token: config.token
});

module.exports = coin;