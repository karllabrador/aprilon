const merge = require('lodash.merge');
const path = require('path');

// Load config
const config = require(path.join(__dirname, '..', '/aprilon-config.json'));
const defaultConfig = config.production;
const environment = process.env.NODE_ENV || 'production';
const environmentConfig = config[environment];
const finalConfig = merge(defaultConfig, environmentConfig);

module.exports = finalConfig;

// Log to console
console.log(`Loaded config: ${JSON.stringify(finalConfig)}`);
