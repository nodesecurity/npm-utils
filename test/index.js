var rsnpm = require('../');
var _ = require('underscore');
var suite = require('tape-suite');

var matches = function (regex) {
    return function (str) {
        return str.match(regex);
    };
};

suite('getModuleDependencies', function (s) {
    s.test('returns the right dependencies', function (t) {
        var module = {
            name: 'helmet',
            version: '0.2.0'
        };

        rsnpm.getModuleDependencies(module, function (err, depTree) {
            var deps = Object.keys(depTree);
            t.strictEqual(3, deps.length, 'Should have 3 dependencies');
            t.equal(deps[0], 'helmet@0.2.0');
            t.ok(_.find(deps, matches(/^underscore@1\.6\./)));
            t.ok(_.find(deps, matches(/^platform@1\.0\./)));

            t.end();
        });
    });

    s.test('properly error on unknown module', function (t) {
        var module = {
            name: 'helmet8675309',
            version: '0.2.0'
        };

        rsnpm.getModuleDependencies(module, function (err, depTree) {
            t.ok(err, 'should have an error');
            t.ok(!depTree, 'should have no results');
            return t.end();
        });
    });

    s.test('mark unknown dependencies as unknown', function (t) {
        var module = {
            name: 'herpmcderp',
            version: '0.0.6'
        };
        var unknownVersion = 'totallyunknownmodule@1.0.0';

        rsnpm.getModuleDependencies(module, function (err, depTree) {
            var deps = Object.keys(depTree);

            t.error(err);
            t.equal(2, deps.length, 'should have 2 results');

            t.ok(depTree[unknownVersion], 'should list the unknown module');
            t.equal(depTree[unknownVersion].source, 'unknown', 'should mark it as unknown');
            t.end();
        });
    });

    s.test('handle modules that have been published an unpublished', function (t) {
        var module = {
            name: 'requiresafe-data',
            version: '0.1.0'
        };

        rsnpm.getModuleDependencies(module, function (err) {
            t.ok(err, 'should throw error for unpublished');
            t.end();
        });
    });


    s.test('module exists but version does not', function (t) {
        var module = {
            name: 'herpmcderp',
            version: '0.7.6'
        };

        rsnpm.getModuleDependencies(module, function () {
            
            //What should happen here?
            t.end();
        });
    });


    s.test('test request', function (t) {
        var module = {
            name: 'request',
            version: '2.47.0'
        };

        rsnpm.getModuleDependencies(module, function (err, depTree) {
            var deps = Object.keys(depTree);
            t.error(err, 'should not error');
            t.ok(deps.indexOf('hawk@1.1.1') >= 0, 'has hawk');
            t.ok(deps.length > 10, 'should have some results');
            t.end();
        });
    });


    s.test('recursive packages', function (t) {
        var module = {
            name: 'yeoman-generator'
        };

        rsnpm.getModuleDependencies(module, function (err, depTree) {
            var deps = Object.keys(depTree);
            t.error(err, 'should not error');
            t.ok(deps.length > 100, 'should have lots of results');
            t.ok(_.find(deps, matches(/glob@3\./)));
            t.end();
        });
    });
});


suite('getPackageDependencies', function (s) {

    s.test('should get deps of this package', function (t) {
        var pkg = require('../package.json');

        rsnpm.getPackageDependencies(pkg, function (err, depTree) {
            var deps = Object.keys(depTree);
            t.error(err, 'should not error');

            t.ok(_.find(deps, matches(/async@1\.4\.2/)));
            t.ok(_.find(deps, matches(/semver@4\./)));
            t.ok(_.find(deps, matches(/silent-npm-registry-client@1\.0\.0/)));

            t.end();
        });
    });
});

suite('getPackageJson', function (s) {

    s.test('it gets the latest if no version defined', function (t) {

        rsnpm.getPackageJson({ name: 'herpmcderp' }, function (err, pkg) {
            t.error(err);
            t.equal(pkg.name, 'herpmcderp', 'returns the correct module');
            t.equal(pkg.version, '0.1.1', 'returns the latest one');
            t.ok(pkg.dependencies, 'looks like a package');
            t.end();
        });
    });

    s.test('it gets the exact version if defined', function (t) {

        rsnpm.getPackageJson({ name: 'herpmcderp', version: '0.0.6' }, function (err, pkg) {
            t.error(err);
            t.equal(pkg.name, 'herpmcderp', 'returns the correct module');
            t.equal(pkg.version, '0.0.6', 'returns the correct version');
            t.ok(pkg.dependencies, 'looks like a package');
            t.end();
        });
    });


    s.test('it matches semver range if given one', function (t) {

        rsnpm.getPackageJson({ name: 'herpmcderp', version: '0.0.x' }, function (err, pkg) {
            t.error(err);
            t.equal(pkg.name, 'herpmcderp', 'returns the correct module');
            t.equal(pkg.version, '0.0.9', 'returns the correct version');
            t.ok(pkg.dependencies, 'looks like a package');
            t.end();
        });
    });

});
