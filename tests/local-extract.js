'use strict'

const fs = require('fs')
const { build } = require('./schema/results')
const { file } = require('./lib/fixtures')
const run = require('./lib/runner')
const { once } = require('stream-iterators-utils')

async function localExtract (node, name, warmup, fileSet, version) {
  const filePath = await file(fileSet)
  const fileStream = fs.createReadStream(filePath)
  const peer = node[0]
  const inserted = await peer.add(fileStream)
  const start = process.hrtime()
  let stream = peer.catReadableStream(inserted[0].hash)
  // endof steam
  stream.resume()

  // we cannot use end-of-stream/pump for some reason here
  // investigate.
  // https://github.com/ipfs/js-ipfs/issues/1774
  await once(stream, 'end')

  const end = process.hrtime(start)
  return build({
    name: 'localExtract',
    warmup: warmup,
    file: filePath,
    meta: { version: version },
    description: 'Cat file (local)',
    file_set: fileSet,
    duration: { s: end[0],
      ms: end[1] / 1000000 }
  })
}
run(localExtract)
