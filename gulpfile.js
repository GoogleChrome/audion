/**
 * Gulp file for project audion.
 */

// Let gulp plugins use ES6.
// The gulp-closure-compiler module uses ES6.
require('harmonize')();
var browserSync = require('browser-sync').create();
var fs = require('fs');
var gulp = require('gulp');
var change = require('gulp-change');
var closureCompiler = require('gulp-closure-compiler');
var closureCssRenamer = require('gulp-closure-css-renamer');
var closureDeps = require('gulp-closure-deps');
var concat = require('gulp-concat');
var glob = require("glob")
var htmlmin = require('gulp-htmlmin');
var less = require('gulp-less');
var util = require('gulp-util');
var watch = require('gulp-watch');
var webserver = require('gulp-webserver');
var mkdirp = require('mkdirp');
var argv = require('yargs').argv;

// This directory will contain temporary artifacts generated during building.
// Some of those artifacts (like deps.js) are used by tests.
TEMPORARY_DIRECTORY = 'temporary_build_artifacts';

// The sources of all raw JS. Passed to the JS compiler.
SOURCES_OF_JAVASCRIPT = [
    'js/**/*.js',
    TEMPORARY_DIRECTORY + '/**/*.js',
    'node_modules/google-closure-library/closure/goog/**/*.js',
    'tests/**/*.js',
  ];

// The name of the directory within the repo directory that contains tests.
TEST_DIRECTORY = 'tests';

// Compile and build the extension. The outputted extension is placed within the
// build/ directory.
gulp.task('default', build);

// Start a web server that hosts tests.
gulp.task('test', serveTests);


function build() {
  // We must compile javascript after generating the CSS renaming map.
  compileCss(function() {
    // The tracing code is actually embedded as a string within the compiled JS.
    compileTracingEntryPoint().on('end', function() {
      compileTracingInjectorEntryPoint();
    });
    // The panel UI JS relies on the CSS rename mapping.
    compileDevToolsEntryPoint();
    compilePanelEntryPoint();
  });
  // The background script coordinates the other scripts and does not concern
  // CSS since it does not directly interact with the DOM.
  compileBackgroundScript();
  compileTabPageChangedEntryPoint();
  minifyHtml();
  copyThirdPartyJs();
  copyThirdPartyCss();
  copyExtensionFiles();
  copyMediaFiles();
}


/**
 * Copies files necessary for the extension such as manifest.json.
 */
function copyExtensionFiles() {
  return gulp.src('chrome/**/*')
    .pipe(gulp.dest('build'));
}


/**
 * Copies media (images, etc) from the root directory to the build directory.
 */
function copyMediaFiles() {
  return gulp.src('media/**/*')
    .pipe(gulp.dest('build/media'));
}


/**
 * Minifies HTML.
 * @return {!Object} The gulp result from minification.
 */
function minifyHtml() {
  return gulp.src('html/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('build'));
}


/**
 * Copies third party scripts to the build JS directory.
 * @return {!Object} The gulp result from piping the data.
 */
function copyThirdPartyJs() {
  return gulp.src([
      'node_modules/jquery/dist/jquery.min.js',
      'node_modules/lodash/index.js',
      'node_modules/backbone/backbone-min.js',
      'node_modules/graphlib/dist/graphlib.min.js',
      'node_modules/dagre/dist/dagre.core.min.js',
      'node_modules/jointjs/dist/joint.js',
      'node_modules/jointjs/dist/joint.min.js',
      'third_party/js/**/*.js'
    ])
    .pipe(gulp.dest('build/js'));
}


/**
 * Copies third party CSS to the build css directory.
 * @return {!Object} The gulp result from piping the data.
 */
function copyThirdPartyCss() {
  return gulp.src(['node_modules/jointjs/dist/joint.min.css'])
      .pipe(gulp.dest('build/css'));
}


/**
 * Compiles JS for the background script entry point.
 * @return {!Object} The gulp result from compilation.
 */
function compileBackgroundScript() {
  return compileJs(
      'audion.entryPoints.background', 'build/js', 'background.js', false);
}


/**
 * Compiles JS for the entry point for reporting a page update.
 * @return {!Object} The gulp result from compilation.
 */
function compileTabPageChangedEntryPoint() {
  return compileJs(
      'audion.entryPoints.tabPageChanged',
      'build/js',
      'tab-page-changed.js',
      false);
}


/**
 * Compiles JS for the entry point for the content script that actually injects
 * the code for tracing into the page.
 * @return {!Object} The gulp result from compilation.
 */
function compileTracingInjectorEntryPoint() {
  return compileJs(
      'audion.entryPoints.injectTracing',
      'build/js',
      'inject-tracing.js',
      false);
}


/**
 * Compiles JS for the entry point into managing dev tools.
 * @return {!Object} The gulp result from compilation.
 */
function compileDevToolsEntryPoint() {
  return compileJs(
      'audion.entryPoints.devTools',
      'build/js',
      'dev-tools.js',
      false);
}


/**
 * Compiles JS for the entry point into the dev panel.
 * @return {!Object} The gulp result from compilation.
 */
function compilePanelEntryPoint() {
  return compileJs('audion.entryPoints.panel', 'build/js', 'panel.js', true);
}


/**
 * Compiles JS for entry point for tracing web audio calls. This script is
 * injected into the web page and run in its name space. It's used in a second
 * compilation step to generate more JS.
 * @return {!Object} The gulp result from compilation.
 */
function compileTracingEntryPoint() {
  return compileJs(
      'audion.entryPoints.tracing',
      TEMPORARY_DIRECTORY,
      'instrument-web-audio-code.js',
      false)
           .pipe(change(function(content) {
             // Wrap the generated code to inject for tracing with a closure.
             // Directly call the closure within this string.
             return "goog.provide('audion.autoGenerated.tracingCode');" +
                 '\n/** @type {string} */\n' +
                 'audion.autoGenerated.tracingCode = ' +
                 '\'(function(){' +
                 content
                     .replace(/\\/g, '\\\\')
                     .replace(/\n/g, "\\n")
                     .replace(/'/g, "\\'") +
                 '})();\';';
           }))
           .pipe(gulp.dest(TEMPORARY_DIRECTORY));
}


/**
 * Compiles JS.
 * @param {string} entryPoint The entry point. Must be provided somewhere.
 * @param {string} destDirectory The destination directory of compilation.
 * @param {string} compiledFileName The file name of the compiled script.
 * @param {boolean} requireCssVocabulary If true, the compilation requires
 *     the CSS vocabulary from CSS compilation to already exist.
 * @return {!Object} The gulp result from compilation.
 */
function compileJs(
    entryPoint,
    destDirectory,
    compiledFileName,
    requireCssVocabulary) {
  var entryPoints = [entryPoint];
  if (requireCssVocabulary) {
    entryPoints.push('cssVocabulary');
  }

  // Determine whether to compile in whitespace mode for debugging.
  var closureCompilerFlags = {
    // The entry point for JS to run.
    closure_entry_point: entryPoints,

    externs: ['externs/**/*.js', 'third_party/closure-externs/**/*.js'],
    // Do not include any un-needed JS in our app.
    only_closure_dependencies: true,
    warning_level: 'VERBOSE'
  };

  if (argv.whitespace) {
    // Compile in whitespcae mode, which basically just concats the JS.
    closureCompilerFlags['compilation_level'] = 'WHITESPACE_ONLY';
    closureCompilerFlags['formatting'] = 'PRETTY_PRINT';
  } else {
    // Compile in advanced mode. Apply optimizations. Be more strict.
    closureCompilerFlags['compilation_level'] = 'ADVANCED_OPTIMIZATIONS';
  }

  // Compile and minify JS.
  return gulp.src(SOURCES_OF_JAVASCRIPT)
      .pipe(closureCompiler({
        compilerPath: 'node_modules/google-closure-compiler/compiler.jar',
        // The name of the compiled JS.
        fileName: compiledFileName,
        compilerFlags: closureCompilerFlags
      }))
      .on('error', logError)
      .pipe(gulp.dest(destDirectory));
}


/**
 * Compiles CSS.
 * @param {!Function} callback Runs when compileCss completes.
 */
function compileCss(callback) {
  return mkdirp(TEMPORARY_DIRECTORY, function(err) {
    if (err) {
      // Failed to create the directory. It does not exist now.
      logError(err);
      return;
    }

    // Minify CSS and create a rename mapping to be used during JS compilation.
    var renameMappingLocation = TEMPORARY_DIRECTORY + '/rename-mapping.js';
    if (fs.existsSync(renameMappingLocation)) {
      // Remove a potentially outdated version.
      fs.unlinkSync(renameMappingLocation)
    }
    return gulp.src('js/**/*.css')
      .pipe(less())
      .on('error', logError)
      .pipe(concat('c.css'))
      .pipe(closureCssRenamer({
        compress: true,
        renameFile: renameMappingLocation
      }))
      .on('error', logError)
      .pipe(gulp.dest('build/css'))
      .on('end', function() {
        // Wait til the vocabulary file is actually written.
        while (!fs.existsSync(renameMappingLocation)) {}
        callback.apply(arguments);
      });
  });
}


/**
 * Generates a Closure deps.js file. Useful for instance for running tests.
 * The generated file is placed in the temporary directory. It maps each
 * namespace (foo.bar.Baz) to the file that provides it.
 * @return {!Object} The gulp result from compilation.
 */
function generateDepsJs() {
  return gulp.src(SOURCES_OF_JAVASCRIPT)
    .pipe(closureDeps({
      fileName: 'deps.js',
      prefix: '../../../..' // The path from base.js to repo root.
    }))
    .pipe(gulp.dest(TEMPORARY_DIRECTORY));
}


/**
 * Generates a list of all test HTML files. This allows us to run all tests at
 * once in a single web page.
 * @param {!Function} callback A callback that is run when the list has been
 *     written to disk.
 */
function generateListOfAllTests(callback) {
  // Make the temporary directory if it does not already exist.
  mkdirp(TEMPORARY_DIRECTORY, function(err) {
    if (err) {
      // Failed to create the directory. It does not exist now.
      logError(err);
      return;
    }

    glob(TEST_DIRECTORY + '/**/*_test.html', {}, function(er, file_names) {
      fs.writeFile(
          TEMPORARY_DIRECTORY + '/all_tests.js',
          'var _allTests = ' + JSON.stringify(file_names) + ';',
          callback);
    });
  });
}


/**
 * Starts a static web server to run tests. To actually run the tests, the user
 * visits HTML files in the browser. The pages with tests update automatically
 * when files change.
 */
function serveTests() {
  // Generate a list of all the tests (_test.html files) so that we can use the
  // Closure test runner to run all tests at once.
  generateListOfAllTests(function() {
    // Before starting the server to host tests, generate a deps file that maps
    // each JS namespace to the file that provides it. The tests use uncompiled
    // source JS.
    generateDepsJs().on('end', function() {
      // Also copy any required JS.
      copyThirdPartyJs().on('end', function() {
        gulp.src('.')
          .pipe(webserver({
            directoryListing: true,
            livereload: true,
            // Open this page automatically.
            open: "/tests/all_tests.html"
          }));
      });
    });
  });
}


/**
 * Logs an error message to the console.
 * @param {!Object|string} err The error object or string.
 */
function logError(err) {
  util.log(util.colors.red(err));
}