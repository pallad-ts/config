import {join} from 'path';
module.exports = function () {
    require('dotenv').config({
        path: join(__dirname, '.env')
    });
};