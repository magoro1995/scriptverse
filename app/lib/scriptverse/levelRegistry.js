'use strict'

const { adaptLevelManifest } = require('./levelManifestAdapter')
const joshua01 = require('../../../scriptverse/content/worlds/the-promised-land/levels/joshua-01-commission.json')

const manifests = {
  [joshua01.slug]: joshua01
}

function normalizeLevelID (levelID) {
  if (typeof levelID !== 'string') return null
  return levelID.startsWith('scriptverse:') ? levelID.slice('scriptverse:'.length) : levelID
}

function hasLevel (levelID) {
  const slug = normalizeLevelID(levelID)
  return Boolean(slug && manifests[slug])
}

function getManifest (levelID) {
  const slug = normalizeLevelID(levelID)
  return slug ? manifests[slug] : undefined
}

function getLevelAttributes (levelID) {
  const manifest = getManifest(levelID)
  return manifest ? adaptLevelManifest(manifest) : undefined
}

module.exports = {
  normalizeLevelID,
  hasLevel,
  getManifest,
  getLevelAttributes
}
