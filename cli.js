#!/usr/bin/env node
'use strict';

var fs = require('fs');
var meow = require('meow');
var stdin = require('get-stdin');
var ImgMinify = require('./');

/**
 * Initialize CLI
 */

var cli = meow({
	help: [
		'Usage',
		'  imgminify [options] <file> <directory>',
		'  imgminify [options] <file> > <output>',
		'  cat <file> | imgminify > <output>',
		'',
		'Example',
		'  imgminify [options] images/* build',
		'  imgminify [options] foo.png > foo-optimized.png',
		'  cat foo.png | imgminify > foo-optimized.png',
		'',
		'GIF Options',
		'  -i, --interlaced     Interlace gif for progressive rendering',
		'',
		'PNG Options',
		'  -o<number>, --optimizationLevel=<number>',
		'                       Optimization level between 0 and 7, default 2',
		'  -s<number>, --speed=<number>',
		'                       speed/quality trade-off. 1=slow, 3=default, 11=fast',
		'',
		'JPEG Options',
		'  -p, --progressive    Lossless conversion to progressive',
		'  -m<quality>, --max=<quality>',
		'                       Try to optimize file to given size (disables lossless',
		'                       optimizaiont mode).Target size is specified either in',
		'                       kilo bytes (1 - n) or as percentage (1% - 99%)'
	].join('\n')
}, {
	boolean: [
		'interlaced',
		'progressive'
	],
	string: [
		'optimizationLevel',
		'max',
		'speed'
	],
	alias: {
		i: 'interlaced',
		o: 'optimizationLevel',
		p: 'progressive',
		m: 'max',
		s: 'speed',
		h: 'help'
	}
});

/**
 * Check if path is a file
 *
 * @param {String} path
 * @api private
 */

function isFile(path) {
	if (/^[^\s]+\.\w*$/g.test(path)) {
		return true;
	}

	try {
		return fs.statSync(path).isFile();
	} catch (err) {
		return false;
	}
}

/**
 * Run
 *
 * @param {Array|Buffer|String} src
 * @param {String} dest
 * @api private
 */

function run(src, dest) {
	var imgminify = new ImgMinify()
		.src(src)
		.use(ImgMinify.gifsicle(cli.flags));
	if(cli.flags){
		imgminify.use(ImgMinify.jpegoptim(cli.flags));
	}
	imgminify.use(ImgMinify.jpegtran(cli.flags))
		.use(ImgMinify.optipng(cli.flags))
		.use(ImgMinify.pngquant(cli.flags))
		.use(ImgMinify.svgo());

	if (process.stdout.isTTY) {
		imgminify.dest(dest ? dest : 'build');
	}

	imgminify.run(function (err, files) {
		if (err) {
			console.error(err.message);
			process.exit(1);
		}

		if (!process.stdout.isTTY) {
			files.forEach(function (file) {
				process.stdout.write(file.contents);
			});
		}
	});
}

/**
 * Apply arguments
 */

if (process.stdin.isTTY) {
	var src = cli.input;
	var dest;

	if (!cli.input.length) {
		console.error([
			'Provide at least one file to optimize',
			'',
			'Example',
			'  imgminify [options] images/* build',
			'  imgminify [options] foo.png > foo-optimized.png',
			'  cat foo.png | imgminify > foo-optimized.png',
			'',
			'The help text used with -h or --help'
		].join('\n'));

		process.exit(1);
	}

	if (!isFile(src[src.length - 1])) {
		dest = src[src.length - 1];
		src.pop();
	}

	run(src, dest);
} else {
	stdin.buffer(run);
}
