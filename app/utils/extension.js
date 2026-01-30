// Node.js imports
import fs from "fs"
import path from "path"
import unzipper from "unzipper"

// Third party imports
import Conf from "conf"

const projectConfigSchema = {
  name: {
    type: "string",
    minLength: 1,
    required: true,
  },
  path: {
    type: "string",
    format: "url",
    required: true,
  },
  additionalProperties: false,
  required: ["name", "path"],
}

function createProjectConfig(projectName) {
  console.log(createProjectConfig.name, { config })

  const config = new Conf({ projectName, schema: projectConfigSchema })
  console.log(createProjectConfig.name, { config })
  return config
}

function getProjectConfig(projectName) {
  console.log(getProjectConfig.name, { projectName })

  const config = config.get(projectName)
  console.log(getProjectConfig.name, { config })

  return config
}

// async function importExtension(vextFilePath, extensionsFolder) {
//   // Validate file exists
//   if (!fs.existsSync(vextFilePath)) {
//     throw new Error("File does not exist")
//   }

//   // Get and sanitize filename
//   const filename = path.basename(vextFilePath)

//   if (!filename.toLowerCase().endsWith(".vext")) {
//     throw new Error("File must be a .vext")
//   }

//   // Create extensions directory
//   await fs.promises.mkdir(extensionsFolder, { recursive: true })

//   // Extract extension name
//   const extensionName = filename.includes("-")
//     ? filename.substring(0, filename.lastIndexOf("-"))
//     : filename.replace(".vext", "")

//   const extensionPath = path.join(extensionsFolder, extensionName)

//   // Remove existing extension if present
//   if (fs.existsSync(extensionPath)) {
//     await fs.promises.rm(extensionPath, { recursive: true, force: true })
//   }

//   await fs.promises.mkdir(extensionPath, { recursive: true })

//   // Extract the .vext file (which is a zip archive)
//   await new Promise((resolve, reject) => {
//     fs.createReadStream(vextFilePath)
//       .pipe(unzipper.Extract({ path: extensionPath }))
//       .on("close", resolve)
//       .on("error", reject)
//   })

//   // Look for the backend executable and frontend JS
//   let backendExecutable = null
//   let frontendFile = null

//   const files = await fs.promises.readdir(extensionPath)

//   for (const file of files) {
//     const filePath = path.join(extensionPath, file)
//     const stats = await fs.promises.stat(filePath)

//     if (stats.isFile()) {
//       if (file.endsWith(".es.js")) {
//         frontendFile = filePath
//       } else if (!file.endsWith(".js") && !file.endsWith(".css")) {
//         backendExecutable = filePath
//         // Make executable (chmod 755)
//         await fs.promises.chmod(backendExecutable, 0o755)
//       }
//     }
//   }

//   if (!frontendFile) {
//     throw new Error("Invalid .vext file: missing frontend JavaScript")
//   }

//   if (!backendExecutable) {
//     throw new Error("Invalid .vext file: missing backend executable")
//   }

//   // Read frontend content
//   const frontendContent = await fs.promises.readFile(frontendFile, "utf-8")

//   return {
//     extension_name: extensionName,
//     frontend_content: frontendContent,
//     backend_path: backendExecutable,
//   }
// }

export {
  createProjectConfig,
  // importExtension,
  getProjectConfig,
}
