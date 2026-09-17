const { ENGINE, adaptLevelManifest, validateManifest } = require('lib/scriptverse/levelManifestAdapter')
const manifest = require('../../../../scriptverse/content/worlds/the-promised-land/levels/joshua-01-commission.json')

describe('ScriptVerse levelManifestAdapter', function () {
  it('validates the Joshua 1 manifest', function () {
    expect(validateManifest(manifest)).to.equal(manifest)
  })

  it('creates a hero level with original ScriptVerse goals', function () {
    const level = adaptLevelManifest(manifest)

    expect(level.slug).to.equal('joshua-01-commission')
    expect(level.type).to.equal('hero')
    expect(level.defaultLanguage).to.equal('python')
    expect(level.version.major).to.equal(0)
    expect(level.goals).to.have.length(1)
    expect(level.goals[0].getToLocations.who).to.deep.equal(['Hero Placeholder'])
    expect(level.goals[0].getToLocations.targets).to.deep.equal(['Israelite Officers Goal'])
  })

  it('materializes the hero with a real ThangType and engine component references', function () {
    const level = adaptLevelManifest(manifest)
    const hero = level.thangs.find(thang => thang.scriptverseRole === 'hero')
    const physical = hero.components.find(component => component.original === ENGINE.physicalComponent)
    const programmable = hero.components.find(component => component.original === ENGINE.programmableComponent)

    expect(hero.id).to.equal('Hero Placeholder')
    expect(hero.thangType).to.equal(ENGINE.knightHeroThangType)
    expect(physical.config.pos).to.deep.equal({ x: 18, y: 18, z: 0 })
    expect(programmable.config.programmableMethods).to.include('moveRight')
  })

  it('materializes the officer destination as an engine-loadable marker', function () {
    const level = adaptLevelManifest(manifest)
    const goal = level.thangs.find(thang => thang.scriptverseRole === 'goal-marker')
    const physical = goal.components.find(component => component.original === ENGINE.physicalComponent)

    expect(goal.id).to.equal('Israelite Officers Goal')
    expect(goal.thangType).to.equal(ENGINE.placeholderFlagThangType)
    expect(physical.config.pos).to.deep.equal({ x: 42, y: 30, z: 0 })
  })

  it('rejects unsupported content formats', function () {
    expect(() => validateManifest({ format: 'unknown' })).to.throw(/Unsupported level manifest format/)
  })
})
