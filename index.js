var Wreck = require('wreck');
var Async = require('async');

var internals = {};

internals.getDependents = function (module, callback) {

    var handleResponse = function (err, response, payload) {

        if (err || response.statusCode !== 200) {
            return callback(new Error('Could not find module in npm'), null, null);
        }

        try {
            payload = JSON.parse(payload);

        } catch (e) {
            return callback(new Error('There was an error parsing the JSON response from npm'), null, null);
        }

        if (typeof payload.name !== 'string' || typeof payload.version !== 'string') {
            return callback(new Error('Malformed JSON response from npm'), null, null);
        }

        var dependencies = [];

        if (payload.dependencies) {
            var dependencyKeys = Object.keys(payload.dependencies);
            for (var i = 0; i < dependencyKeys.length; i++) {
                dependencies.push({
                    name: dependencyKeys[i],
                    version: payload.dependencies[dependencyKeys[i]]
                });
            }
        }

        if (payload.devDependencies) {
            var devDependencyKeys = Object.keys(payload.devDependencies);
            for (var j = 0; j < payload.devDependencies.length; j++) {
                dependencies.push({
                    name: devDependencyKeys[j],
                    version: payload.devDependencies[devDependencyKeys[j]]
                });
            }
        }

        return callback(null, {
            name: payload.name,
            version: payload.version
        }, dependencies);
    };

    Wreck.get('https://registry.npmjs.org/' + module.name + '/' + module.version, handleResponse);
};


exports.getAllDependencies = function (module, callback) {

    if (typeof module !== 'object') {
        return callback(new Error('module is not of type object'), null);
    }

    if (typeof module.name !== 'string') {
        return callback(new Error('module.name is not type string'), null);
    }

    if (typeof module.version !== 'string') {
        return callback(new Error('module.version is not type string'), null);
    }

    var checked = {};
    var modules = [];
    var q = {};
    var qError = null;

    var processModules = function (inProgress, cb) {

        internals.getDependents(inProgress, function (err, resolved, dependencies) {

            if (err) {
                qError = err;
                q.kill();
                return cb();
            }

            var setKey = resolved.name + '!' + resolved.version;
            if (checked.hasOwnProperty(setKey)) {
                return cb();
            }

            checked[setKey] = true;
            q.push(dependencies);
            modules.push(resolved);
            return cb();
        });
    };

    var end = function () {

        if (q.running() === 0 && q.length() === 0) {
            return callback(qError, modules);
        }
    };

    q = Async.queue(processModules, 10);
    q.push(module);
    q.drain = end;
};

