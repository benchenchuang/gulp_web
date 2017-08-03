var gulp = require('gulp'),//基础库
    htmlmin = require('gulp-htmlmin'),//html压缩
    cssmin = require('gulp-minify-css'),//css压缩
    jshint = require('gulp-jshint'),//js检查
    uglify = require('gulp-uglify'),//js压缩
    imagemin = require('gulp-imagemin'),//图片压缩
    pngquant = require('imagemin-pngquant'),//图片深入压缩
    imageminOptipng = require('imagemin-optipng'),
    imageminSvgo = require('imagemin-svgo'),
    imageminGifsicle = require('imagemin-gifsicle'),
    imageminJpegtran = require('imagemin-jpegtran'),
    domSrc = require('gulp-dom-src'),
    cheerio = require('gulp-cheerio'),
    processhtml = require('gulp-processhtml'),
    Replace = require('gulp-replace'),
    cache = require('gulp-cache'),//图片压缩缓存
    clean = require('gulp-clean'),//清空文件夹
    conCat = require('gulp-concat'),//文件合并
    plumber=require('gulp-plumber'),//检测错误
    gutil=require('gulp-util');//如果有自定义方法，会用到
     
 
var date = new Date().getTime();
 
gulp.task('clean',function(){
    return gulp.src('build/**',{read:false})
        .pipe(clean());
});
function errrHandler( e ){
    // 控制台发声,错误时beep一下
    gutil.beep();
    gutil.log(e);
    this.emit('end');
}
 
gulp.task('cleanCash', function (done) {//清除缓存
    return cache.clearAll(done);
});
  
gulp.task('htmlmin', function () {
    var options = {
        removeComments: true,//清除HTML注释
        collapseWhitespace: true,//压缩HTML
        collapseBooleanAttributes: false,//省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: false,//删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
        minifyJS: true,//压缩页面JS
        minifyCSS: true//压缩页面CSS
    };
    gulp.src(['./fsms/*.htm','./fsms/*.html'])       
        .pipe(plumber({errorHandler:errrHandler}))     
        //.pipe(Replace(/_VERSION_/gi, date))
        .pipe(processhtml())
        .pipe(htmlmin(options))
        .pipe(gulp.dest('build/'));
});
gulp.task('cssmin', function(){
    gulp.src('./fsms/css/*.css')
        //.pipe(conCat('css/index.min.css')) //合并所有css 名称为index.min.css
        .pipe(plumber({errorHandler:errrHandler}))
        .pipe(cssmin({
            advanced: false,//类型：Boolean 默认：true [是否开启高级优化（合并选择器等）]
            compatibility: 'ie7',//保留ie7及以下兼容写法 类型：String 默认：''or'*' [启用兼容模式； 'ie7'：IE7兼容模式，'ie8'：IE8兼容模式，'*'：IE9+兼容模式]
            keepBreaks: false,//类型：Boolean 默认：false [是否保留换行]
            keepSpecialComments: '*'
            //保留所有特殊前缀 当你用autoprefixer生成的浏览器前缀，如果不加这个参数，有可能将会删除你的部分前缀
        }))    
        .pipe(gulp.dest('build/css'));
         
});
gulp.task('jsmin', function () {
    gulp.src('./fsms/js/*.js')
       // .pipe(conCat('js/index.min.js')) //合并所有js 名称为index.min.js
        .pipe(plumber({errorHandler:errrHandler}))
        .pipe(uglify({
            mangle: {except: ['require' ,'exports' ,'module' ,'$']},//类型：Boolean 默认：true 是否修改变量名
            compress: true,//类型：Boolean 默认：true 是否完全压缩
            preserveComments: 'false' //保留所有注释
        }))
        .pipe(gulp.dest('build/js'));
}); 
gulp.task('imagemin', function () {
    gulp.src(['./fsms/image/*.{png,jpg,gif,ico}','./fsms/image/**/*.{png,jpg,gif,ico}'])
        .pipe(plumber({errorHandler:errrHandler}))
        .pipe(cache(imagemin({     
            progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片          
            svgoPlugins: [{removeViewBox: false}],//不要移除svg的viewbox属性
            use: [pngquant(),imageminJpegtran({progressive: true})
            , imageminGifsicle({interlaced: true}),imageminOptipng({optimizationLevel:3}), imageminSvgo()] //使用pngquant深度压缩png图片的imagemin插件          
        })))
        .pipe(gulp.dest('build/image'));
});
gulp.task('default',['clean'],function(){  
    gulp.start('cssmin','htmlmin','jsmin','imagemin');

	// watch for JS changes
	gulp.watch('./fsms/js/*.js', function() {
		gulp.run('jshint', 'jsmin');
	  });
	// watch for CSS changes
	gulp.watch('./fsms/css/*.css', function() {
			gulp.run('cssmin');
	  });

	// watch for Html changes
	gulp.watch(['./fsms/*.htm','./fsms/*.html'], function() {
			gulp.run('htmlmin');
	  });
	// watch for image changes
	gulp.watch('./fsms/image/*.{png,jpg,gif,ico}', function() {
			gulp.run('imagemin');
	  });

});