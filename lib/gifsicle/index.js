'use strict';

//var gifsicle = require('gifsicle').path;
var isGif = require('is-gif');
var spawn = require('child_process').spawn;
var through = require('through2');
var path = require('path');
var gifsicle = path.join(__dirname, 'vendor', process.platform === 'win32' ? 'gifsicle.exe' : 'gifsicle');
/**
 * gifsicle imagemin plugin
 *
 * @param {Object} opts
 * @api public
 */

module.exports = function (opts) {
	opts = opts || {};

	return through.ctor({ objectMode: true }, function (file, enc, cb) {
		if (file.isNull()) {
			cb(null, file);
			return;
		}

		if (file.isStream()) {
			cb(new Error('Streaming is not supported'));
			return;
		}

		if (!isGif(file.contents)) {
			cb(null, file);
			return;
		}

		var args = ["-O3", "--careful", "--no-comments", "--no-names", "--same-delay", "--same-loopcount", "--no-warnings"];
		var ret = [];
		var len = 0;

		if (opts.interlaced) {
			args.push('--interlace');
		}else{
			args.push('--no-interlace');
		}

		var cp = spawn(gifsicle, args);

		cp.on('error', function (err) {
			cb(err);
			return;
		});

		cp.stderr.setEncoding('utf8');
		cp.stderr.on('data', function (data) {
			cb(new Error(data));
			return;
		});

		cp.stdout.on('data', function (data) {
			ret.push(data);
			len += data.length;
		});

		cp.on('close', function () {
			file.contents = Buffer.concat(ret, len);
			cb(null, file);
		});

		cp.stdin.end(file.contents);
	});
};
