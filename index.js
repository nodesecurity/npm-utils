var RegClient = require('silent-npm-registry-client');
var os = require('os');

var client = new RegClient({
  registry: 'http://registry.npmjs.org/',
  cache: os.tmpDir() + '/requiresafe'
});

var allDependencies = {};

var getAllDependencies = function (module, callback) {

    client.get('/' + module.name, function (err, pkg) {
        if (err) {
            throw err;
        }

        allDependencies[module.name] = pkg['dist-tags'].latest;
        // grab latest
        var version = module.version;
        if (!module.version) {
            version = pkg['dist-tags'].latest;
        }
        var doc = pkg.versions[version];
        var modules = {};

        if (doc.dependencies) {
            modules = doc.dependencies;
        }
        // Ignore devDependencies for now

        var deps = Object.keys(modules);

        var depcnt = 0;
        if (deps.length === 0) {
            callback();
        }
        deps.forEach(function (dep) {
            getAllDependencies({name: dep}, function () {
                depcnt++;
                if (depcnt === deps.length) {
                    callback(err, allDependencies);
                }
            });
        });
    });
};

module.exports.getAllDependencies = getAllDependencies;

//getAllDependencies({name: 'helmet', version: '0.5.0'}, function (err, results) {
//    console.log(results)
//});
