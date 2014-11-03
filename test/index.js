var rsnpm = require('../');

exports['returns the right dependencies'] = function(test){
    var module = {
        name: 'helmet',
        version: '0.5.0'
    };

    rsnpm.getAllDependencies(module, function (err, results) {
        test.strictEqual(24, results.length, 'Should have 24 dependencies');
        test.done()
    });
};
