var rsnpm = require('../');

exports['returns the right dependencies'] = function(test){
    var module = {
        name: 'helmet',
        version: '0.2.0'
    };

    rsnpm.getAllDependencies(module, function (err, results) {
        test.strictEqual(3, results.length, 'Should have 3 dependencies');
        test.done();
    });
};

exports['properly error on unknown module'] = function (test) {
    var module = {
        name: 'helmet8675309',
        version: '0.2.0'
    };

    rsnpm.getAllDependencies(module, function (err, results) {
        test.equals(0, results.length, 'should have 0 results');
        test.done();
    });
};

exports['properly error on unknown module of known module'] = function (test) {
    var module = {
        name: 'herpmcderp',
        version: '0.0.6'
    };

    rsnpm.getAllDependencies(module, function (err, results) {
        test.equals(1, results.length, 'should have 1 results');
        test.done();
    });
};


exports['module exists but version doesn\'t'] = function (test) {
    var module = {
        name: 'herpmcderp',
        version: '0.7.6'
    };

    rsnpm.getAllDependencies(module, function (err, results) {
        test.equals(1, results.length, 'should have 1 results');
        test.done();
    });
};

/*
exports['properly error on unknown module of known module'] = function (test) {
    var module = {
        name: 'herpmcderp',
        version: '0.0.6'
    };

    rsnpm.getAllDependencies(module, function (err, results) {
        console.log(results)
        test.equals(3, results.length, 'should have 0 results');
        test.done();
    });
};
*/
