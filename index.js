const _ = require('lodash')
const fg = require('fast-glob')
const fsPromises = require('fs').promises
const imageType = require('image-type')
const path = require('path')
const readChunk = require('read-chunk')

async function renameImage (from) {
  let cnt = 0
  from = _.trimEnd(from, '/')
  const files = await fg(`${from}/**/*`, { dot: true })
  await fsPromises.mkdir('to')
  for (const chunk of _.chunk(files, 1000)) {
    await Promise.all(_.map(chunk, async file => {
      const type = imageType(await readChunk(file, 0, 12))
      if (!type) return
      let newName = `to/${file.slice(from.length + 1).replace(/\//g, '-')}`
      if (_.get(/\.(\w+)$/.exec(file), 1) !== type.ext) newName = `${newName}.${type.ext}`
      // console.log(`${file} => ${newName}`)
      // process.exit(0)
      await fsPromises.rename(file, newName)
    }))
    cnt += chunk.length
    console.log(`Progress: ${cnt} / ${files.length}`)
  }
}

renameImage('from')