'use strict';

const getShrinkwrapDependencies = function (shrinkwrap, cb) {

  const results = {};

  const _parseModule = function (module, path, name) {

    const moduleName = `${name || module.name}@${module.version}`;
    if (results[moduleName]) {
      results[moduleName].paths.push(path.concat([moduleName]));
    }
    else {
      results[moduleName] = {
        name: name || module.name,
        version: module.version,
        paths: [path.concat([moduleName])]
      };
    }

    const children = Object.keys(module.dependencies || {});
    for (let i = 0, il = children.length; i < il; ++i) {
      const child = children[i];
      _parseModule(module.dependencies[child], path.concat([moduleName]), child);
    }
  };

  _parseModule(shrinkwrap, []);

  return cb(null, results);
};

module.exports = {
  getShrinkwrapDependencies: getShrinkwrapDependencies
};
