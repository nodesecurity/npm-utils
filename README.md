# requireSafe (+) npm utilities

[![Build Status](https://magnum.travis-ci.com/requiresafe/npm-utils.svg?token=y6kXcG28kZTEjJL8fnHQ)](https://magnum.travis-ci.com/requiresafe/npm-utils)

## Methods:

### getModuleDependencies = function (module, callback)

Get a [depTree](#deptree-format) for the given module. `module` is an object that must contain a name and may optionally contain a version.

```js
getModuleDependencies({
    name: 'helmet',
    version: '0.2.0' //may also be a semver string, a la "^1.1.0"
}, function (err, depTree) {
    console.log(depTree);
});
```

### getPackageDependencies = function (packageJson, callback)

Get a [depTree](#deptree-format) for the module from a full package.json. `packageJson` should be an object from a parsed package.json file (or look like one): required keys: `name`, `version`, `dependencies`.

```js
var fs = require('fs');

getPackageDependencies(JSON.parse(fs.readFileSync('./package.json')), function (err, depTree) {
    console.log(depTree);
});
```

### getModuleMaintainers = function (module, callback)

Get an array of maintainers from a specifc module / version.

## depTree format

Many of the functions return a `depTree` representing the full dependency tree. This is in a format that's easier to traverse than a full tree. Each module in the full heirarchy has a key in the object of `module@version`. It's value is an object with `parents`, `children` and `source`.

Note that the root module has a key too.

e.g.:

```js
//depTree for some-module version 1.1.0
{
    //root module
    "some-module@1.1.0": {
        parents: [],
        children: ["depA@0.1.0", "depB@1.0.1", "depC@0.2.0"],
    },

    //root's dependencies
    "depA@0.1.0": {
        parents: ["some-module@1.1.0"],
        children: ["underscore@1.6.0"],
        source: "npm"
    },
    "depB@1.0.1": {
        parents: ["some-module@1.1.0"],
        children: ["underscore@1.6.0", "backbone@1.0.0"],
        source: "npm"
    },
    "depC@0.2.0": {
        parents: ["some-module@1.1.0"],
        children: [],
        source: "unknown" //not on npm, maybe it's private/local?
    }

    //deeper dependencies
    "underscore@1.6.0": {
        parents: ["depA@0.1.0", "depB@1.0.1", "backbone@1.6.0"], //modules can be required multiple places in the tree
        children: [],
        source: "npm"
    },
    "backbone@1.6.0": {
        parents: ["depB@1.0.1"], //modules can be required multiple places in the tree
        children: ["underscore@1.6.0"],
        source: "npm"
    }
}
```
