// Node imports
import fs from "node:fs"
import path from "node:path"
import { Readable } from "node:stream"

// Third party imports
import busboy from "busboy"
import {
  createError,
  defineEventHandler,
  getRequestHeaders,
  getRequestWebStream,
} from "h3"

import sanitize from "sanitize-filename"

// Local imports
import {
  confFolderPath,
  addExtensionToConf,
} from "../../../app/utils/config.js"
// import { useRuntimeConfig } from "#imports"

const CODE_201 = 201

export default defineEventHandler(async (event) => {
  // const config = useRuntimeConfig(event).public
  // const { APP_NAME } = config
  // console.log("defineEventHandler", { APP_NAME })
  const projectName = "vease"
  const writePromises = []
  const savedFiles = []

  const configFolderPath = confFolderPath(projectName)

  await new Promise((resolve, reject) => {
    const bb = busboy({
      headers: getRequestHeaders(event),
      limits: {
        fileSize: 1024 * 1024 * 1024 * 0.1, // 100 MB
        files: 1,
      },
    })

    bb.on("file", (fieldname, fileStream, info) => {
      if (fieldname !== "file") {
        fileStream.resume() // drain & ignore unwanted fields
        return
      }

      const safeFilename = sanitize(info.filename)
      const targetPath = path.join(configFolderPath, safeFilename)

      const writePromise = new Promise((res, rej) => {
        const writeStream = fs.createWriteStream(targetPath)

        fileStream
          .pipe(writeStream)
          .on("finish", () => {
            savedFiles.push(targetPath)
            console.log("File written:", targetPath)
            res()
          })
          .on("error", rej)
      })

      writePromises.push(writePromise)
      fileStream.on("limit", () => reject(new Error("File too large")))
    })

    bb.on("field", (name, value) => {
      console.log(`Field ${name}: ${value}`)
    })

    bb.on("close", resolve)
    bb.on("error", reject)
    bb.on("filesLimit", () => reject(new Error("Too many files")))
    bb.on("partsLimit", () => reject(new Error("Too many parts")))

    const webStream = getRequestWebStream(event)
    Readable.fromWeb(webStream).pipe(bb)
  })

  if (writePromises.length > 0) {
    await Promise.all(writePromises)
    console.log("All disk writes completed")
  }

  if (savedFiles.length === 0) {
    throw createError({ statusCode: 400, message: "No file received" })
  }

  for (const file of savedFiles) {
    await addExtensionToConf(projectName, file)
  }

  return { statusCode: CODE_201 }
})
