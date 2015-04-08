修改自[https://github.com/imagemin/imagemin](https://github.com/imagemin/imagemin)

## Install

```
$ npm install --save imgminify
```

## Usage

```
var ImgMinify = require('imgminify');

var imgminify = new ImgMinify()
    .src('images/*')
    .dest('build/')
    .use(ImgMinify.gifsicle({interlaced: true}))
    .use(ImgMinify.jpegoptim({progressive: true, max:60}))
    .use(ImgMinify.jpegtran({progressive: true}))
	.use(ImgMinify.optipng({optimizationLevel: 3}))
	.use(ImgMinify.pngquant({speed:1}))
	.use(ImgMinify.svgo());

imgminify.run(function (err, files) {
    if (err) {
        throw err;
    }
    console.log('Files optimized successfully!');
});
```

## CLI

```
$ npm install --global imgminify
```

```
$ imgminify --help

Usage,
  imgminify [options] <file> <directory>
  imgminify [options] <file> > <output>
  cat <file> | imgminify > <output>

Example
  imgminify [options] images/* build
  imgminify [options] foo.png > foo-optimized.png
  cat foo.png | imgminify > foo-optimized.png

GIF Options
  -i, --interlaced     Interlace gif for progressive rendering

PNG Options
  -o<number>, --optimizationLevel=<number>
                       Optimization level between 0 and 7, default 2
  -s<number>, --speed=<number>
                       speed/quality trade-off. 1=slow, 3=default, 11=fast

JPEG Options
  -p, --progressive    Lossless conversion to progressive
  -m<quality>, --max=<quality>
                       Try to optimize file to given size (disables lossless
                       optimizaiont mode).Target size is specified either in
                       kilo bytes (1 - n) or as percentage (1% - 99%)
```