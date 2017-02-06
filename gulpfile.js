var gulp = require('gulp');
var sass = require('gulp-sass');
var watch = require('gulp-watch');
var cleancss = require('gulp-clean-css');
var rename = require('gulp-rename');
var gzip = require('gulp-gzip');
var livereload = require('gulp-livereload');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');

var gzip_options = {
    threshold: '1kb',
    gzipOptions: {
        level: 9
    }
};

function onError(err) {
    console.log(err);
    this.emit('end');
}

var publicdir = "client/";

/* Compile Our Sass */
gulp.task('sass', function() {
    return gulp.src('source/style/scss/*.scss')
        .pipe(sass())
        .on('error', onError)
        .pipe(gulp.dest(publicdir + 'css'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(cleancss())
        .pipe(gulp.dest(publicdir + 'css'))
        .pipe(gzip(gzip_options))
        .pipe(gulp.dest(publicdir + 'css'))
        .pipe(livereload());
});


var angular_material = [
    'bower_components/angular-material/angular-material.scss',
    'bower_components/angular-material/modules/scss/angular-material.scss',
    'bower_components/textAngular/dist/textAngular.css'
]

/* Compile Our Sass */
gulp.task('sass-material', function() {
    return gulp.src(angular_material)
        .pipe(concat('angular-material.scss'))
        .pipe(sass())
        .pipe(gulp.dest(publicdir + 'css'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(cleancss())
        .pipe(gulp.dest(publicdir + 'css'))
        .pipe(gzip(gzip_options))
        .pipe(gulp.dest(publicdir + 'css'))
        .pipe(livereload());
});

/* Angular JS */
var scripts_angular = [
    'bower_components/angular/angular.min.js',
    'bower_components/angular-resource/angular-resource.min.js',
    'bower_components/angular-ui-router/release/angular-ui-router.min.js',
    'bower_components/angular-sanitize/angular-sanitize.min.js',
    'bower_components/angular-animate/angular-animate.min.js',
    'bower_components/angular-aria/angular-aria.min.js',
    'bower_components/angular-material/angular-material.min.js',
    'bower_components/angular-material-icons/angular-material-icons.min.js',
    'bower_components/angular-datetime/dist/datetime.js',
    'bower_components/angular-local-storage/dist/angular-local-storage.js',
    'bower_components/angular-websocket/dist/angular-websocket.min.js',
    'bower_components/angular-uuids/angular-uuid.js'
];

gulp.task('angular', function() {
    return gulp.src(scripts_angular)
        .pipe(concat('scripts.angular.js'))
        .pipe(gulp.dest(publicdir + 'js'))
        .pipe(uglify({
            mangle: false
        })) //Breaks angular apps with mangle
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(publicdir + 'js'))
        .pipe(livereload());
});

var source_maps = [
    'bower_components/angular-sanitize/angular-sanitize.min.js.map',
    'bower_components/angular-aria/angular-aria.min.js.map',
    'bower_components/angular-local-storage/dist/angular-local-storage.js.map'
];

gulp.task('source-maps', function() {
    return gulp.src(source_maps)
        .pipe(gulp.dest(publicdir + 'js'))
        .pipe(livereload());
});

/* App modules JS */
var app_scripts = [
    'source/modules/**/*.js'
];

gulp.task('app-scripts', function() {
    return gulp.src(app_scripts)
        .pipe(concat('app-scripts.js'))
        .pipe(gulp.dest(publicdir + 'js'))
        .pipe(uglify({
            mangle: false
        })) //Breaks angular apps with mangle
        .on('error', onError)
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(publicdir + 'js'))
        .pipe(livereload());

});

var vendor_css = [];

/* Compile Our css */
gulp.task('css-vendor', function() {
    return gulp.src(vendor_css)
        .pipe(concat('vendor.css'))
        .pipe(gulp.dest(publicdir + 'css'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(cleancss())
        .pipe(gulp.dest(publicdir + 'css'))
        .pipe(gzip(gzip_options))
        .pipe(gulp.dest(publicdir + 'css'))
        .pipe(livereload());
});

/* Watch Files For Changes */
gulp.task('watch', function() {
    livereload.listen();
    gulp.watch('source/style/scss/*.scss', ['sass']);
    gulp.watch('source/modules/**/*.js', ['app-scripts']);
});

gulp.task('default', ['sass-material', 'sass', 'source-maps', 'css-vendor', 'angular', 'app-scripts', 'watch']);
