const { adaptLevelManifest, validateManifest } = require('lib/scriptverse/levelManifestAdapter')
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
    expect(level.goals).to.have.length(1)
    expect(level.goals[0].getToLocations.who).to.deep.equal(['Hero Placeholder'])
    expect(level.goals[0].getToLocations.targets).to.deep.equal(['Israelite Officers Goal'])
  })

  it('creates the hero and officer goal marker from the manifest map', function () {
    const level = adaptLevelManifest(manifest)
    const hero = level.thangs.find(thang => thang.scriptverseRole === 'hero')
    const goal = level.thangs.find(thang => thang.scriptverseRole === 'goal-marker')

    expect(hero.id).to.equal('Hero Placeholder')
    expect(hero.scriptverseConfig.position).to.deep.equal({ x: 18, y: 18 })
    expect(hero.scriptverseConfig.availableMethods).to.include('moveRight')
    expect(goal.id).to.equal('Israelite Officers Goal')
    expect(goal.scriptverseConfig.position).to.deep.equal({ x: 42, y: 30 })
  })

  it('rejects unsupported content formats', function () {
    expect(() => validateManifest({ format: 'unknown' })).to.throw(/Unsupported level manifest format/)
  })
})
