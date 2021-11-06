"use strict";
exports.__esModule = true;
exports.createConfig = void 0;
var config_1 = require("@pallad/config");
var secret_1 = require("@pallad/secret");
function createConfig() {
    return {
        database: {
            hostname: (0, config_1.env)('DATABASE_HOSTNAME'),
            port: 5432,
            username: (0, config_1.env)('DATABASE_USERNAME', { transformer: secret_1.secret }),
            password: (0, config_1.env)('DATABASE_PASSWORD', { transformer: secret_1.secret })
        }
    };
}
exports.createConfig = createConfig;
