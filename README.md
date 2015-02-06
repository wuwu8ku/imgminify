修改自[https://github.com/imagemin/imagemin](https://github.com/imagemin/imagemin)

```
var ImgMinify = require('imgminify');

var imgminify = new ImgMinify()
    .src('images/*')
    .dest('build/')
    .use(ImgMinify.gifsicle())
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