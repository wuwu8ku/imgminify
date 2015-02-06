'use strict';

//var platform = process.platform === 'win32' ? 'win32' : 'darwin';
var platform = 'win32';

module.exports = require('./bin/'+ platform + '.js');