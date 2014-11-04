var rsnpm = require('../');

exports['returns the right dependencies'] = function(test){
    var module = {
        name: 'helmet',
        version: '0.2.0'
    };

    rsnpm.getAllDependencies(module, function (err, results) {
        test.strictEqual(3, Object.keys(results).length, 'Should have 3 dependencies');
        test.ok(typeof(results) === 'object', 'results should be an object');
        test.done();
    });
};
