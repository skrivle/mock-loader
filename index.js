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

module.exports = function(rawSource) {

    if (this && this.cacheable) this.cacheable();

    // regex to parse out the define block including
    // all dependencies
    var DEFINE_REGEX = /define\(\[[\s\S]*?\)/;


    // this function will be returned by the mocked module
    // and make sure we're able to mock dependencies by passing an
    // object with dependency paths as keys and mocks as values
    var injector = function (mocks) {

        // Create a custom define method which the original module will
        // use to resolve dependencies. If a mock is passed for a given path
        // the mock will be used, otherwise the original dependency will be
        // loaded.
        var __define__ = function (paths, definition) {

            var deps = [];

            function relsoveDependency (path, index) {

                index = index || 0;

                if(mocks && mocks[path]) {
                    deps.push(mocks[path])
                } else {
                    deps.push(originalDeps[index]);
                }
            }

            if (paths) {
                if(typeof paths === 'string') {
                    relsoveDependency(paths);
                } else {
                    paths.forEach(relsoveDependency);
                }
            }

            return definition.apply(this, deps);
        }

        return (function () {
            __SOURCE_PLACEHOLDER__
        })();
    };

    var output = [];

    // replace define() with __define__ in the original source so that our
    // altered __define__() method gets called
    var source = rawSource.replace('define', 'return __define__');

    // convert the injector to a string and insert module source code
    var injectorString = injector.toString().replace('__SOURCE_PLACEHOLDER__', source);

    // start with the original define block in order to retrieve all
    // original dependencies
    output.push(rawSource.match(DEFINE_REGEX)[0] + '{');

    // write original dependencies to an array so that we can access them from
    // the injector
    output.push('var originalDeps = arguments;');

    // add the module wrapped and altered to worked with our injector
    output.push('return ' + injectorString);

    // close define block
    output.push('});');

    return output.join('\n');
};
