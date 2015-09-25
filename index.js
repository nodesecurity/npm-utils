var RegClient = require('silent-npm-registry-client');
var os = require('os');
var semver = require('semver');
var keys = require('lodash').keys;
var async = require('async');

var ASNYC_PARALLELISM = 20;

var options = {
  registry: 'https://registry.npmjs.org/',
  cache: os.tmpDir() + '/requiresafe'
}; 

var client = new RegClient(options);

function toModuleString(module) {
    return module.name + '@' + module.version;
}

function getPackageJson (module, cb) {
    client.get(options.registry + module.name, {}, function (err, pkg) {
        var doc, error, version;

        if (err) {
            return cb(err);
        }

        if (pkg.time && pkg.time.unpublished) {
            error = new Error('404 - Unpublished module');
            error.code = 'E404';
            error.pkgid = module.name;

            return cb(error);
        }

        // try to get a version
        version = semver.maxSatisfying(keys(pkg.versions), module.version);

        // check dist tags if none found
        if (!version) {
            version = pkg['dist-tags'] && pkg['dist-tags'].latest;
        }

        if (pkg.versions) {
            doc = pkg.versions[version];
        }

        if (!doc) {
            error = new Error('404 - Unknown module');
            error.code = 'E404';
            error.pkgid = module.name;

            return cb(error);
        }

        cb(null, doc);
    });
}

function _savePackageDependencies(packageJson, targetObject, parent, cb) {
    var moduleString = toModuleString(packageJson);
    var alreadyChecked;

    if (!targetObject[moduleString]) {
        targetObject[moduleString] = {
            name: packageJson.name,
            version: packageJson.version,
            parents: [],
            children: [],
            source: 'npm'
        };
    } else {
        alreadyChecked = true;
    }

    if (parent) {
        targetObject[moduleString].parents.push(parent);
        targetObject[parent].children.push(moduleString);
    }

    var deps = packageJson.dependencies || {};

    if (alreadyChecked) {
        cb();
    } else {
        async.eachLimit(Object.keys(deps), ASNYC_PARALLELISM, function(dep, next) {
            getPackageJson({ name: dep, version: deps[dep] }, function (err, pkg) {
                if (err) {
                    if (err.message.match(/404/)) {
                        var vString = dep + '@' + deps[dep];
                        if (!targetObject[vString]) {
                            targetObject[vString] = {
                                name: dep,
                                version: deps[dep],
                                parents: [],
                                children: [],
                                source: 'unknown'
                            };
                        }
                        targetObject[vString].parents.push(moduleString);
                        return next();
                    } else {
                        return next(err);
                    }
                }

                _savePackageDependencies(pkg, targetObject, moduleString, next);
            });
        }, cb);
    }
}

function getModuleDependencies(module, cb) {
    var results = {};

    getPackageJson(module, function (err, doc) {
        if (err) {
            return cb(err);
        }

        _savePackageDependencies(doc, results, undefined, function (err) {
            if (err) {
                return cb(err);
            }
            cb(null, results);
        });
    });
}

function getShrinkwrapDependencies(shrinkwrap, cb) {
    var results = {};

    var _parseModule = function (module, parents, name) {

        var moduleName = (name || module.name) + '@' + module.version;
        var children = Object.keys(module.dependencies || {}).concat(Object.keys(module.devDependencies || {}));

        if (results[moduleName]) {
            results[moduleName].parents = results[moduleName].parents.concat(parents);
        }
        else {
            results[moduleName] = {
                name: name || module.name,
                version: module.version,
                parents: parents,
                children: children,
                source: 'npm'
            };
        }

        for (var i = 0, il = children.length; i < il; ++i) {
            var child = children[i];
            _parseModule(module.dependencies[child], [moduleName], child);
        }
    };

    _parseModule(shrinkwrap, []);

    return cb(null, results);
}

function getPackageDependencies(package, cb) {
    var result = {};
    _savePackageDependencies(package, result, undefined, function (err) {
        if (err) {
            return cb(err);
        }
        return cb(null, result);
    });
}


function getModuleMaintainers(module, cb) {
    getPackageJson(module, function (err, pkg) {
        if (err) {
            return cb(err);
        }

        cb(err, pkg.maintainers || []);
    });
}

function getTarballURL(module, cb) {
    getPackageJson(module, function (err, pkg) {
        if (err) {
            return cb(err);
        }
        
        cb(err, pkg.dist);
    });
}

module.exports = {
    getModuleDependencies: getModuleDependencies,
    getModuleMaintainers: getModuleMaintainers,
    getPackageDependencies: getPackageDependencies,
    getPackageJson: getPackageJson,
    getShrinkwrapDependencies: getShrinkwrapDependencies,
    getTarballURL: getTarballURL
};


