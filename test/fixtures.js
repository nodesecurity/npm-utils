'use strict';

const internals = {};

internals.shrinkwrap = {
  name: 'testmodule',
  version: '1.0.0',
  dependencies: {
    'submodule-a': {
      version: '2.0.0',
      dependencies: {
        'submodule-b': {
          version: '3.0.0'
        }
      }
    }
  }
};

internals.multiversionShrinkwrap = {
  name: 'multiversion',
  version: '1.0.0',
  dependencies: {
    marked: {
      version: '0.3.4'
    },
    'meta-marked': {
      version: '0.2.1',
      dependencies: {
        marked: {
          version: '0.3.0'
        }
      }
    }
  }
};

internals.multidependencyShrinkwrap = {
  name: 'multidependency',
  version: '1.0.0',
  dependencies: {
    marked: {
      version: '0.3.4'
    },
    'meta-marked': {
      version: '0.2.1',
      dependencies: {
        marked: {
          version: '0.3.4'
        }
      }
    }
  }
};

module.exports = internals;
