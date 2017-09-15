'use strict';

const lab = exports.lab = require('lab').script();
const expect = require('code').expect;

const describe = lab.describe;
const it = lab.it;

const NpmUtils = require('../');
const Fixtures = require('./fixtures');

describe('getShrinkwrapDependencies', () => {

  it('gets dependencies', () => {

    return NpmUtils.getShrinkwrapDependencies(Fixtures.shrinkwrap).then((results) => {

      expect(results).to.only.include(['testmodule@1.0.0', 'submodule-a@2.0.0', 'submodule-b@3.0.0']);

      expect(results['testmodule@1.0.0']).to.equal({
        name: 'testmodule', version: '1.0.0',
        paths: [['testmodule@1.0.0']]
      });

      expect(results['submodule-a@2.0.0']).to.equal({
        name: 'submodule-a', version: '2.0.0',
        paths: [['testmodule@1.0.0', 'submodule-a@2.0.0']]
      });

      expect(results['submodule-b@3.0.0']).to.equal({
        name: 'submodule-b', version: '3.0.0',
        paths: [['testmodule@1.0.0', 'submodule-a@2.0.0', 'submodule-b@3.0.0']]
      });
    });
  });

  it('shrinkwrap with multiple dependencies of same module', () => {

    return NpmUtils.getShrinkwrapDependencies(Fixtures.multiversionShrinkwrap).then((results) => {

      expect(results).to.only.include(['multiversion@1.0.0', 'marked@0.3.4', 'marked@0.3.0', 'meta-marked@0.2.1']);

      expect(results['multiversion@1.0.0']).to.equal({
        name: 'multiversion',version: '1.0.0',
        paths: [['multiversion@1.0.0']]
      });

      expect(results['marked@0.3.4']).to.equal({
        name: 'marked', version: '0.3.4',
        paths: [['multiversion@1.0.0','marked@0.3.4']]
      });

      expect(results['marked@0.3.0']).to.equal({
        name: 'marked', version: '0.3.0',
        paths: [['multiversion@1.0.0', 'meta-marked@0.2.1', 'marked@0.3.0']]
      });

      expect(results['meta-marked@0.2.1']).to.equal({
        name: 'meta-marked', version: '0.2.1',
        paths: [['multiversion@1.0.0', 'meta-marked@0.2.1']]
      });
    });
  });

  it('shrinkwrap with a dependency in multiple places', () => {

    return NpmUtils.getShrinkwrapDependencies(Fixtures.multidependencyShrinkwrap).then((results) => {

      expect(results).to.only.include(['multidependency@1.0.0', 'marked@0.3.4', 'meta-marked@0.2.1']);

      expect(results['multidependency@1.0.0']).to.equal({
        name: 'multidependency',version: '1.0.0',
        paths: [['multidependency@1.0.0']]
      });

      expect(results['marked@0.3.4']).to.equal({
        name: 'marked', version: '0.3.4',
        paths: [['multidependency@1.0.0', 'marked@0.3.4'], ['multidependency@1.0.0', 'meta-marked@0.2.1', 'marked@0.3.4']]
      });

      expect(results['meta-marked@0.2.1']).to.equal({
        name: 'meta-marked', version: '0.2.1',
        paths: [['multidependency@1.0.0', 'meta-marked@0.2.1']]
      });
    });
  });
});
