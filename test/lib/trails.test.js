'use strict'

const assert = require('assert')
const lib = require('../../lib')

describe('lib.Trails', () => {

  describe('#buildConfig', () => {
    const NODE_ENV = process.env.NODE_ENV
    let testConfig

    beforeEach(() => {
      testConfig = {
        env: {
          mergetest1: {
            merged: 'yes',
            extraneous: 'assigned'
          },
          mergetest2: {
            nested: {
              merged: 'yes',
              extraneous: 'assigned'
            },
            merged: 'yes',
            extraneous: 'assigned'
          },
          mergetest3: {
            nested: {
              merged: 'yes',
              extraneous: 'assigned',
              deeplyNested: {
                merged: 'yes',
                extraneous: 'assigned'
              }
            },
            merged: 'yes',
            extraneous: 'assigned'
          }
        },
        merged: 'no',
        nested: {
          merged: 'no',
          deeplyNested: {
            merged: 'no'
          }
        },
        normal: 'yes'
      }
    })

    afterEach(() => {
      process.env.NODE_ENV = NODE_ENV
    })

    it('should merge basic env config', () => {
      process.env.NODE_ENV = 'mergetest1'
      const config = lib.Trails.buildConfig(testConfig)

      assert(config)
      assert.equal(config.merged, 'yes')
      assert.equal(config.extraneous, 'assigned')
      assert.equal(config.normal, 'yes')
      assert.equal(config.nested.merged, 'no')

      assert.equal(config.main.maxListeners, 128)
    })

    it('should merge nested env config', () => {
      process.env.NODE_ENV = 'mergetest2'
      const config = lib.Trails.buildConfig(testConfig)

      assert(config)
      assert.equal(config.merged, 'yes')
      assert.equal(config.nested.merged, 'yes')

      assert.equal(config.extraneous, 'assigned')
      assert.equal(config.nested.extraneous, 'assigned')
      assert.equal(config.normal, 'yes')
      assert.equal(config.extraneous, 'assigned')
      assert.equal(config.normal, 'yes')

      assert.equal(config.main.maxListeners, 128)
    })

    it('should merge deeply nested env config', () => {
      process.env.NODE_ENV = 'mergetest3'
      const config = lib.Trails.buildConfig(testConfig)

      assert(config)
      assert.equal(config.merged, 'yes')
      assert.equal(config.nested.merged, 'yes')
      assert.equal(config.nested.deeplyNested.merged, 'yes')

      assert.equal(config.extraneous, 'assigned')
      assert.equal(config.nested.extraneous, 'assigned')
      assert.equal(config.nested.deeplyNested.extraneous, 'assigned')

      assert.equal(config.normal, 'yes')
      assert.equal(config.extraneous, 'assigned')
      assert.equal(config.normal, 'yes')

      assert.equal(config.main.maxListeners, 128)
    })

    it('should not override any configs if NODE_ENV matches no env', () => {
      process.env.NODE_ENV = 'notconfigured'
      const config = lib.Trails.buildConfig(testConfig)

      assert(config)
      assert.equal(config.merged, 'no')
      assert.equal(config.normal, 'yes')
      assert(!config.extraneous)
      assert(!config.env)

      assert.equal(config.main.maxListeners, 128)
    })

    it('should remove "env" property from config', () => {
      process.env.NODE_ENV = 'mergetest2'
      const config = lib.Trails.buildConfig(testConfig)
      assert(!config.env)
    })
  })

})

