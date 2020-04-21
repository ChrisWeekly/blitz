/* eslint-disable import/first */

const nextUtilsMock = {
  nextStartDev: jest.fn().mockReturnValue(Promise.resolve()),
  nextBuild: jest.fn().mockReturnValue(Promise.resolve()),
}
// Quieten reporter
jest.doMock('../src/reporter', () => ({
  reporter: {copy: jest.fn(), remove: jest.fn()},
}))

// Assume next works
jest.doMock('../src/next-utils', () => nextUtilsMock)

// Import with mocks applied
import {build} from '../src/build'
import {resolve} from 'path'

import {remove, pathExists} from 'fs-extra'
import directoryTree from 'directory-tree'

describe('Build command ZEIT', () => {
  const rootFolder = resolve(__dirname, './fixtures/zeit-now')
  const buildFolder = resolve(rootFolder, '.blitz-build')
  const devFolder = resolve(rootFolder, '.blitz-dev')

  beforeEach(async () => {
    process.env.NOW_BUILDER = '1'
    jest.clearAllMocks()
    await build({rootFolder, buildFolder, devFolder, writeManifestFile: false})
  })

  afterEach(async () => {
    delete process.env.NOW_BUILDER
    if (await pathExists(buildFolder)) {
      await remove(buildFolder)
    }
  })

  it('should copy the correct files to the build folder', async () => {
    const tree = directoryTree(buildFolder)
    expect(tree).toEqual({
      path: `${buildFolder}`,
      name: '.blitz-build',
      children: [
        {
          extension: '.js',
          name: 'blitz.config.js',
          path: `${buildFolder}/blitz.config.js`,
          size: 20,
          type: 'file',
        },
        {
          extension: '.js',
          name: 'next-zeit.config.js',
          path: `${buildFolder}/next-zeit.config.js`,
          size: 59,
          type: 'file',
        },
        {
          extension: '.js',
          name: 'next.config.js',
          path: `${buildFolder}/next.config.js`,
          size: 209,
          type: 'file',
        },
        {
          path: `${buildFolder}/pages`,
          name: 'pages',
          children: [
            {
              path: `${buildFolder}/pages/bar.tsx`,
              name: 'bar.tsx',
              size: 60,
              extension: '.tsx',
              type: 'file',
            },
            {
              path: `${buildFolder}/pages/foo.tsx`,
              name: 'foo.tsx',
              size: 60,
              extension: '.tsx',
              type: 'file',
            },
          ],
          size: 120,
          type: 'directory',
        },
      ],
      size: 408,
      type: 'directory',
    })
  })
})
