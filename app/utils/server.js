// Node imports
import fs from "node:fs"
import path from "node:path"

// Third party imports
import JSZip from "jszip"

async function unzipFile(
  zipFilePath,
  outputDir = zipFilePath.replace(/\.[^/.]+$/, ""), // Remove the file extension
) {
  console.log("Unzipping file...", zipFilePath, outputDir)
  try {
    const data = await fs.promises.readFile(zipFilePath)
    const zip = await JSZip.loadAsync(data)
    await fs.promises.mkdir(outputDir, { recursive: true })
    const promises = []

    zip.forEach((relativePath, zipEntry) => {
      const outputPath = path.join(outputDir, relativePath)

      if (zipEntry.dir) {
        promises.push(fs.promises.mkdir(outputPath, { recursive: true }))
      } else {
        promises.push(
          zipEntry.async("nodebuffer").then(async (content) => {
            await fs.promises.mkdir(path.dirname(outputPath), {
              recursive: true,
            })
            await fs.promises.writeFile(outputPath, content)
          }),
        )
      }
    })

    await Promise.all(promises)
    console.log("Extraction complete!")
    return outputDir
  } catch (error) {
    console.error("Error unzipping file:", error)
    throw error
  }
}

export { unzipFile }
