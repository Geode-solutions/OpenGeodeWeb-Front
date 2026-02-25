// Node imports
import fs from "node:fs"
import path from "node:path"
import { Readable } from "node:stream"

// Third party imports
import busboy from "busboy"
import { defineEventHandler, getRequestHeaders, getRequestWebStream } from "h3"

// Local imports
import {
  confFolderPath,
  addExtensionToConf,
} from "../../../app/utils/config.js"
// import { useRuntimeConfig } from "#imports"

const CODE_201 = 201

export default defineEventHandler(async (event) => {
  console.log("[TIME] defineEventHandler", Date.now())
  // const config = useRuntimeConfig(event).public
  // const { APP_NAME } = config
  // console.log("defineEventHandler", { APP_NAME })
  const projectName = "vease"

  const configFolderPath = confFolderPath(projectName)
  // const params = await readMultipartFormData(event)
  console.log("[TIME] readMultipartFormData", Date.now())

  const headers = getRequestHeaders(event)

  await new Promise((resolve, reject) => {
    const bb = busboy({ headers })

    bb.on("file", (name, stream, info) => {
      const outputPath = path.join(confFolderPath("vease"), info.filename)
      stream.pipe(fs.createWriteStream(outputPath))
    })

    bb.on("close", resolve)
    bb.on("error", reject)

    const rawStream = getRequestWebStream(event)
    // pipe web stream to busboy
    Readable.fromWeb(rawStream).pipe(bb)
  })

  // const fileData = params.find((item) => item.name === "fileContent")
  // const nameData = params.find((item) => item.name === "filename")

  // const fileContent = fileData?.data
  // const filename = nameData?.data.toString() // Convert Buffer to string

  // const fileContent = params.find((item) => {
  //   if (item.name === "fileContent") {
  //     return item.data
  //   }
  // })
  // const filename = params.find((item) => {
  //   if (item.name === "filename") {
  //     return item.data.toString()
  //   }
  // })
  // console.log("filename", { filename })
  // console.log("defineEventHandler", {
  //   projectName,
  //   fileContent,
  //   filename,
  // })
  const outputPath = path.join(configFolderPath, filename)
  console.log("[TIME] fs.promises.writeFile", Date.now())

  await fs.promises.writeFile(outputPath, fileContent)
  console.log("[TIME] fs.awaitpromises.writeFile", Date.now())

  await addExtensionToConf(projectName, outputPath)
  console.log("[TIME] addExtensionToConf", Date.now())

  return { statusCode: CODE_201 }
})
