// Node imports
import fs from "node:fs"
import path from "node:path"
import { setTimeout } from "node:timers/promises"

// Third party imports
import { WebSocket } from "ws"
import pTimeout from "p-timeout"
import { rimraf } from "rimraf"

const MAX_DELETE_FOLDER_RETRIES = 5

async function deleteFolderRecursive(folderPath) {
  if (!fs.existsSync(folderPath)) {
    console.log(`Folder ${folderPath} does not exist.`)
    return
  }
  for (let i = 0; i <= MAX_DELETE_FOLDER_RETRIES; i += 1) {
    try {
      console.log(`Deleting folder: ${folderPath}`)
      // oxlint-disable-next-line no-await-in-loop
      await rimraf(folderPath)
      console.log(`Deleted folder: ${folderPath}`)
      return
    } catch (error) {
      console.error(`Error deleting folder ${folderPath}:`, error)
      // Wait before retrying
      const MILLISECONDS_PER_RETRY = 1000
      const DELAY = MILLISECONDS_PER_RETRY * (i + 1)
      // oxlint-disable-next-line no-await-in-loop
      await setTimeout(DELAY)
      console.log("Retrying delete folder")
    }
  }
}

function killHttpMicroservice(microservice) {
  console.log("killHttpMicroservice", { ...microservice })
  const failMessage = `Failed to kill ${microservice.name}`
  async function do_kill() {
    try {
      await fetch(microservice.url, {
        method: microservice.method,
      })
      throw new Error(failMessage)
    } catch (error) {
      console.log(`${microservice.name} closed`, error)
    }
  }
  return pTimeout(do_kill(), {
    milliseconds: 5000,
    message: failMessage,
  })
}

function killWebsocketMicroservice(microservice) {
  console.log("killWebsocketMicroservice", { ...microservice })
  const failMessage = `Failed to kill ${microservice.name}`
  const successMessage = `Disconnected from ${microservice.name} WebSocket server`
  function do_kill() {
    // oxlint-disable-next-line promise/avoid-new
    return new Promise((resolve) => {
      const socket = new WebSocket(microservice.url)
      socket.on("open", () => {
        console.log("Connected to WebSocket server")
        socket.send(
          JSON.stringify({
            id: "system:hello",
            method: "wslink.hello",
            args: [{ secret: "wslink-secret" }],
          }),
        )
      })
      socket.on("message", (data) => {
        const message = data.toString()
        console.log("Received from server:", message)
        if (message.includes("hello")) {
          socket.send(
            JSON.stringify({
              id: "application.exit",
              method: "application.exit",
            }),
          )
          console.log(successMessage)
          socket.close()
          resolve()
        }
      })
      socket.on("close", () => {
        console.log(successMessage)
        resolve()
      })
      socket.on("error", (error) => {
        console.error("WebSocket error:", error)
        socket.close()
        resolve()
      })
    })
  }
  return pTimeout(do_kill(), {
    milliseconds: 5000,
    message: failMessage,
  })
}

function killMicroservice(microservice) {
  if (microservice.type === "back") {
    return killHttpMicroservice(microservice)
  }
  if (microservice.type === "viewer") {
    return killWebsocketMicroservice(microservice)
  }
  throw new Error(`Unknown microservice type: ${microservice.type}`)
}

function killMicroservices(microservices) {
  console.log("killMicroservices", { microservices })
  return Promise.all(
    microservices.map(
      async (microservice) => await killMicroservice(microservice),
    ),
  )
}

function projectMicroservices(projectFolderPath) {
  console.log("projectMicroservices", { projectFolderPath })
  const filePath = microservicesMetadatasPath(projectFolderPath)

  if (!fs.existsSync(filePath)) {
    const microservicesMetadatas = { microservices: [] }
    fs.writeFileSync(
      filePath,
      JSON.stringify(microservicesMetadatas, undefined, 2),
      "utf8",
    )
  }
  const content = JSON.parse(fs.readFileSync(filePath, "utf8"))
  return content.microservices
}

async function cleanupBackend(projectFolderPath) {
  const microservices = projectMicroservices(projectFolderPath)
  await killMicroservices(microservices)
  await deleteFolderRecursive(projectFolderPath)
}

function microservicesMetadatasPath(projectFolderPath) {
  return path.join(projectFolderPath, "microservices.json")
}

export { cleanupBackend, microservicesMetadatasPath }
