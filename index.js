'use strict';

var combine = require('stream-combiner');
var concat = require('concat-stream');
var File = require('vinyl');
var fs = require('vinyl-fs');
var through = require('through2');

/**
 * Initialize ImgMinify
 *
 * @api public
 */

function ImgMinify() {
	if (!(this instanceof ImgMinify)) {
		return new ImgMinify();
	}

	this.streams = [];
}

/**
 * Get or set the source files
 *
 * @param {Array|Buffer|String} file
 * @api public
 */

ImgMinify.prototype.src = function (file) {
	if (!arguments.length) {
		return this._src;
	}

	this._src = file;
	return this;
};

/**
 * Get or set the destination folder
 *
 * @param {String} dir
 * @api public
 */

ImgMinify.prototype.dest = function (dir) {
	if (!arguments.length) {
		return this._dest;
	}

	this._dest = dir;
	return this;
};

/**
 * Add a plugin to the middleware stack
 *
 * @param {Function} plugin
 * @api public
 */

ImgMinify.prototype.use = function (plugin) {
	this.streams.push(typeof plugin === 'function' ? plugin() : plugin);
	return this;
};

/**
 * Optimize files
 *
 * @param {Function} cb
 * @api public
 */

ImgMinify.prototype.run = function (cb) {
	cb = cb || function () {};

	if (!this.streams.length) {
		this.use(ImgMinify.gifsicle());
		this.use(ImgMinify.jpegtran());
		this.use(ImgMinify.pngquant());
		this.use(ImgMinify.optipng());
		this.use(ImgMinify.svgo());
	}

	this.streams.unshift(this.read(this.src()));

	if (this.dest()) {
		this.streams.push(fs.dest(this.dest()));
	}

	var pipe = combine(this.streams);
	var end = concat(function (files) {
		cb(null, files, pipe);
	});

	pipe.on('error', cb);
	pipe.pipe(end);
};

/**
 * Read the source file
 *
 * @param {Array|Buffer|String} src
 * @api private
 */

ImgMinify.prototype.read = function (src) {
	if (Buffer.isBuffer(src)) {
		var stream = through.obj();

		stream.end(new File({
			contents: src
		}));

		return stream;
	}

	return fs.src(src);
};

/**
 * Module exports
 */

module.exports = ImgMinify;

[
	'gifsicle',
	'jpegtran',
	'jpegoptim',
	'optipng',
	'pngquant',
	'svgo'
].forEach(function (plugin) {
	module.exports[plugin] = require('./lib/'+ plugin);
});
