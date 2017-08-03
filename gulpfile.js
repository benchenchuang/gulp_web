var gulp = require('gulp'),//������
    htmlmin = require('gulp-htmlmin'),//htmlѹ��
    cssmin = require('gulp-minify-css'),//cssѹ��
    jshint = require('gulp-jshint'),//js���
    uglify = require('gulp-uglify'),//jsѹ��
    imagemin = require('gulp-imagemin'),//ͼƬѹ��
    pngquant = require('imagemin-pngquant'),//ͼƬ����ѹ��
    imageminOptipng = require('imagemin-optipng'),
    imageminSvgo = require('imagemin-svgo'),
    imageminGifsicle = require('imagemin-gifsicle'),
    imageminJpegtran = require('imagemin-jpegtran'),
    domSrc = require('gulp-dom-src'),
    cheerio = require('gulp-cheerio'),
    processhtml = require('gulp-processhtml'),
    Replace = require('gulp-replace'),
    cache = require('gulp-cache'),//ͼƬѹ������
    clean = require('gulp-clean'),//����ļ���
    conCat = require('gulp-concat'),//�ļ��ϲ�
    plumber=require('gulp-plumber'),//������
    gutil=require('gulp-util');//������Զ��巽�������õ�
     
 
var date = new Date().getTime();
 
gulp.task('clean',function(){
    return gulp.src('build/**',{read:false})
        .pipe(clean());
});
function errrHandler( e ){
    // ����̨����,����ʱbeepһ��
    gutil.beep();
    gutil.log(e);
    this.emit('end');
}
 
gulp.task('cleanCash', function (done) {//�������
    return cache.clearAll(done);
});
  
gulp.task('htmlmin', function () {
    var options = {
        removeComments: true,//���HTMLע��
        collapseWhitespace: true,//ѹ��HTML
        collapseBooleanAttributes: false,//ʡ�Բ������Ե�ֵ <input checked="true"/> ==> <input />
        removeEmptyAttributes: false,//ɾ�����пո�������ֵ <input id="" /> ==> <input />
        removeScriptTypeAttributes: true,//ɾ��<script>��type="text/javascript"
        removeStyleLinkTypeAttributes: true,//ɾ��<style>��<link>��type="text/css"
        minifyJS: true,//ѹ��ҳ��JS
        minifyCSS: true//ѹ��ҳ��CSS
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
        //.pipe(conCat('css/index.min.css')) //�ϲ�����css ����Ϊindex.min.css
        .pipe(plumber({errorHandler:errrHandler}))
        .pipe(cssmin({
            advanced: false,//���ͣ�Boolean Ĭ�ϣ�true [�Ƿ����߼��Ż����ϲ�ѡ�����ȣ�]
            compatibility: 'ie7',//����ie7�����¼���д�� ���ͣ�String Ĭ�ϣ�''or'*' [���ü���ģʽ�� 'ie7'��IE7����ģʽ��'ie8'��IE8����ģʽ��'*'��IE9+����ģʽ]
            keepBreaks: false,//���ͣ�Boolean Ĭ�ϣ�false [�Ƿ�������]
            keepSpecialComments: '*'
            //������������ǰ׺ ������autoprefixer���ɵ������ǰ׺�������������������п��ܽ���ɾ����Ĳ���ǰ׺
        }))    
        .pipe(gulp.dest('build/css'));
         
});
gulp.task('jsmin', function () {
    gulp.src('./fsms/js/*.js')
       // .pipe(conCat('js/index.min.js')) //�ϲ�����js ����Ϊindex.min.js
        .pipe(plumber({errorHandler:errrHandler}))
        .pipe(uglify({
            mangle: {except: ['require' ,'exports' ,'module' ,'$']},//���ͣ�Boolean Ĭ�ϣ�true �Ƿ��޸ı�����
            compress: true,//���ͣ�Boolean Ĭ�ϣ�true �Ƿ���ȫѹ��
            preserveComments: 'false' //��������ע��
        }))
        .pipe(gulp.dest('build/js'));
}); 
gulp.task('imagemin', function () {
    gulp.src(['./fsms/image/*.{png,jpg,gif,ico}','./fsms/image/**/*.{png,jpg,gif,ico}'])
        .pipe(plumber({errorHandler:errrHandler}))
        .pipe(cache(imagemin({     
            progressive: true, //���ͣ�Boolean Ĭ�ϣ�false ����ѹ��jpgͼƬ          
            svgoPlugins: [{removeViewBox: false}],//��Ҫ�Ƴ�svg��viewbox����
            use: [pngquant(),imageminJpegtran({progressive: true})
            , imageminGifsicle({interlaced: true}),imageminOptipng({optimizationLevel:3}), imageminSvgo()] //ʹ��pngquant���ѹ��pngͼƬ��imagemin���          
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