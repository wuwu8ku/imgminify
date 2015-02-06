'use strict';

var isJpg = require('is-jpg');
var execFile = require('child_process').execFile;
var through = require('through2');
var tempfile = require('tempfile');
var fs = require('fs');
var rm = require('rimraf');
var path = require('path');
var jpegoptim = path.join(__dirname, '..', 'vendor', process.platform === 'win32' ? 'jpegoptim.exe' : 'jpegoptim');

/**
 * jpegoptim imagemin plugin
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

		if (!isJpg(file.contents)) {
			cb(null, file);
			return;
		}

		var args = ['--strip-all', '--strip-iptc', '--strip-icc'];

		if (opts.progressive) {
			args.push('--all-progressive');
		}

		if (opts.max !== undefined) {
			args.push('--max=' + opts.max);
		}

		if (opts.size) {
			args.push('--size=' + opts.size);
		}

		var src = tempfile('.jpg');
		args.push(src);

		fs.writeFile(src, file.contents, function (err) {
			if (err) {
				cb(err);
				return;
			}
			execFile(jpegoptim, args, function (error, stdout, stderr) {
				if (err) {
					cb(err);
					return;
				}

				if (stderr) {
					cb(stderr);
					return;
				}

				fs.readFile(src, function (err, data) {
					if (err) {
						cb(err);
						return;
					}

					rm(src, function (err) {
						if (err) {
							cb(err);
							return;
						}

						file.contents = data;
						cb(null, file);
					});
				});
			});
		})
	});
};
