// Node imports
import child_process from "node:child_process"
import fs from "node:fs"
import path from "node:path"

// Third party imports
import { WebSocket } from "ws"
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json" with { type: "json" }
import { getPort } from "get-port-please"
import pTimeout from "p-timeout"

// Local imports
import { commandExistsSync, waitForReady } from "./scripts.js"
import {
  deleteFolderRecursive,
  executableName,
  executablePath,
} from "./path.js"

const DEFAULT_TIMEOUT_SECONDS = 30
const MILLISECONDS_PER_SECOND = 1000

function getAvailablePort() {
  return getPort({
    host: "localhost",
    random: true,
  })
}

async function runScript(
  execName,
  execPath,
  args,
  expectedResponse,
  timeoutSeconds = DEFAULT_TIMEOUT_SECONDS,
) {
  const command = commandExistsSync(execName)
    ? execName
    : path.join(await executablePath(execPath), executableName(execName))
  console.log("runScript", command, args)
  fs.chmodSync(command, "755")
  const child = child_process.spawn(command, args, {
    encoding: "utf8",
    shell: true,
  })

  child.stdout.on("data", (data) =>
    console.log(`[${execName}] ${data.toString()}`),
  )
  child.stderr.on("data", (data) =>
    console.log(`[${execName}] ${data.toString()}`),
  )

  child.on("error", async (error) => {
    const electron = await import("electron")
    electron.dialog.showMessageBox({
      title: "Title",
      type: "warning",
      message: `Error occured.\r\n${error}`,
    })
  })

  child.on("close", (code) =>
    console.log(`[${execName}] exited with code ${code}`),
  )
  child.on("kill", () => {
    console.log(`[${execName}] process killed`)
  })
  child.name = command.replace(/^.*[\\/]/, "")

  try {
    return await pTimeout(waitForReady(child, expectedResponse), {
      milliseconds: timeoutSeconds * MILLISECONDS_PER_SECOND,
      message: `Timed out after ${timeoutSeconds} seconds`,
    })
  } catch (error) {
    child.kill()
    throw error
  }
}

async function runBack(execName, execPath, args = {}) {
  const { projectFolderPath } = args
  if (!projectFolderPath) {
    throw new Error("projectFolderPath is required")
  }
  let { uploadFolderPath } = args
  if (!uploadFolderPath) {
    uploadFolderPath = path.join(projectFolderPath, "uploads")
  }
  const port = await getAvailablePort()
  const backArgs = [
    `--port ${port}`,
    `--data_folder_path ${projectFolderPath}`,
    `--upload_folder_path ${uploadFolderPath}`,
    `--allowed_origin http://localhost:*`,
    `--timeout ${0}`,
  ]
  if (process.env.NODE_ENV === "development" || !process.env.NODE_ENV) {
    backArgs.push("--debug")
  }
  console.log("runBack", execName, execPath, backArgs)
  await runScript(execName, execPath, backArgs, "Serving Flask app")
  return port
}

async function runViewer(execName, execPath, args = {}) {
  const { projectFolderPath } = args
  if (!projectFolderPath) {
    throw new Error("projectFolderPath is required")
  }
  const port = await getAvailablePort()
  const viewerArgs = [
    `--port ${port}`,
    `--data_folder_path ${projectFolderPath}`,
    `--timeout ${0}`,
  ]
  console.log("runViewer", execName, execPath, viewerArgs)
  await runScript(execName, execPath, viewerArgs, "Starting factory")
  return port
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
  } else if (microservice.type === "viewer") {
    return killWebsocketMicroservice(microservice)
  } else {
    throw new Error(`Unknown microservice type: ${microservice.type}`)
  }
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

function addMicroserviceMetadatas(projectFolderPath, serviceObj) {
  const microservices = projectMicroservices(projectFolderPath)
  if (serviceObj.type === "back") {
    const schema = back_schemas.opengeodeweb_back.kill
    serviceObj.url = `http://localhost:${serviceObj.port}/${schema.$id}`
    const [method] = schema.methods
    serviceObj.method = method
  } else if (serviceObj.type === "viewer") {
    serviceObj.url = `ws://localhost:${serviceObj.port}/ws`
  }

  microservices.push(serviceObj)
  fs.writeFileSync(
    microservicesMetadatasPath(projectFolderPath),
    JSON.stringify({ microservices }, undefined, 2),
  )
}

export {
  addMicroserviceMetadatas,
  cleanupBackend,
  getAvailablePort,
  killMicroservices,
  projectMicroservices,
  runBack,
  runViewer,
}
