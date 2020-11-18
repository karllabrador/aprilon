const merge = require('lodash.merge');

// Load config
const config = require('../aprilon-config.json');
const defaultConfig = config.development;
const environment = process.env.NODE_ENV || 'development';
const environmentConfig = config[environment];
const finalConfig = merge(defaultConfig, environmentConfig);

exports.get = function(key) {
    return (finalConfig[key] ? finalConfig[key] : null);
}

module.exports = finalConfig;

// Log to console
console.log(`Loaded config: ${JSON.stringify(finalConfig)}`);