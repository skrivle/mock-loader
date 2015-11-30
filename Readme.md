# Mock loader (WIP)

Webpack mock loader for AMD modules only.

Inspired by [proxy-loader](https://github.com/c-dante/proxy-loader) and 
[inject-loader](https://github.com/plasticine/inject-loader) but since they 
both lack descent support for AMD modules, this module was created.

## Usage

Once a module is loaded with the mock loader an injector function will be 
returned instead of the original module. This function can be used to mock the
original dependencies of the loaded module. The injector accepts an object with 
dependency paths as keys and mock objects as values. If a given dependency is omitted
the original dependency will be loaded automatically.

```javascript
define(
[
    'mock!./myModule'
],
function (
    myModuleInjector
) {

    var myMock = {
        method: function () {
            return true;
        }
    };

    var myModule = myModuleInjector({
        'path/to/original/dep': myMock
    });
});
```

