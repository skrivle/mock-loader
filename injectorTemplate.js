module.exports = "ORIGINAL_DEFINE{ \
    var originalDeps = arguments; \
    return " + function (mocks) {

      // Create a custom define method which the original module will
      // use to resolve dependencies. If a mock is passed for a given path
      // the mock will be used, otherwise the original dependency will be
      // loaded.
      var __defined_module__;
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

          __defined_module__ = definition.apply(this, deps);
      }

      return (function () {
          SOURCE
          return __defined_module__;
      })();
  }.toString() + "; \
});";
