/**
 * Webpack Mock Loader
 *
 * This loader transforms the source code of a module so that is gets wrapped
 * with an injector function. This injector will provide us with the possiblity
 * to mock the dependencies of the original module.
 *
 * Only works for AMD modules.
 *
 * usage:
 *
 * define([
 *     'mock!./myModule'
 * ],
 * function (
 *     myModuleInjector
 * ) {
 *
 *     var myMock = {
 *          method: function () {
 *               return true;
 *          }
 *     };
 *
 *     var myModule = myModuleInjector({
 *          'path/to/original/dep': myMock
 *     });
 * });
 *
 */

var babel = require('babel-core');
var transform = babel.transform;
var traverse = babel.traverse;
var types = babel.types;
var transformFromAst = babel.transformFromAst;
var template = babel.template;
var injectorTemplate = require('./injectorTemplate');

module.exports = function(rawSource, inputSourceMap) {

    if (this && this.cacheable) this.cacheable();

    // regex to parse out the define block including
    // all dependencies
    var DEFINE_REGEX = /define\(\[[\s\S]*?\)/;

    // replace define() with __define__ in the original source so that our
    // altered __define__() method gets called
    var source = rawSource.replace('define', '__define__');
    // get the original dependencies so that we can access them from the injector
    var originalDefine = rawSource.match(DEFINE_REGEX)[0];

    // the file should be a valid javascript before babel template can read it,
    // so we replace original define directly on the string
    var injector = injectorTemplate.replace('ORIGINAL_DEFINE', originalDefine);

    var ast = transform(source, {
      babelrc: false,
      code: false,
      compact: false,
      filename: this.resourcePath,
    }).ast;

    var wrapperModuleAst = types.file(types.program([
      template(injector)({
        SOURCE: ast
      }),
    ]));

    var transformed = transformFromAst(wrapperModuleAst, source, {
      sourceMaps: this.sourceMap,
      sourceFileName: this.resourcePath,
      inputSourceMap,
      babelrc: false,
      compact: false,
      filename: this.resourcePath,
    });

    this.callback(null, transformed.code, transformed.map);
};
