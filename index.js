var RegClient = require('silent-npm-registry-client');
var os = require('os');

var client = new RegClient({
  registry: 'http://registry.npmjs.org/',
  cache: os.tmpDir() + '/requiresafe'
});


var getAllDependencies = function (module, callback) {
    var allDependencies = {};

    var _getAllDependencies = function (module, callback) {

        client.get('/' + module.name, function (err, pkg) {
            if (err) {
                return callback(err);
            }

            allDependencies[module.name] = pkg['dist-tags'].latest;
            // grab latest
            var version = module.version;
            if (!module.version) {
                version = pkg['dist-tags'].latest;
            }
            var doc = pkg.versions[version];
            var modules = {};

            var deps = [];
            if (doc && doc.dependencies) {
                modules = doc.dependencies;
                deps = Object.keys(modules);
            }
            // Ignore devDependencies for now

            var depcnt = 0;
            if (deps.length === 0) {
                callback(null, allDependencies);
            }
            deps.forEach(function (dep) {
                _getAllDependencies({name: dep}, function () {
                    depcnt++;
                    if (depcnt === deps.length) {
                        callback(err, allDependencies);
                    }
                });
            });
        });
    };

    _getAllDependencies(module, function (err, results) {
        var deps = [];
        if (!err && results) {
            // Clean up the data for Tom
            Object.keys(results).forEach(function (key) {
                deps.push({name: key, version: results[key]});
            });
        }
        callback(null, deps);
    });
};

module.exports.getAllDependencies = getAllDependencies;

/*
    var derp = {
        name: 'herpmcderp',
        version: '0.7.6'
    };

    getAllDependencies(derp, function (err, results) {
        console.log(results)
    });
*/
