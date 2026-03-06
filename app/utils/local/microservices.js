// Node imports
import fs from "node:fs"
import path from "node:path"

// Third party imports
import { WebSocket } from "ws"
import { getPort } from "get-port-please"
import pTimeout from "p-timeout"

import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json" with { type: "json" }

// Local imports
import { runScript } from "./scripts.js"

function getAvailablePort() {
  return getPort({
    host: "localhost",
    random: true,
  })
}

async function runBack(executableName, executablePath, args = {}) {
  let { projectFolderPath, uploadFolderPath } = args
  if (!projectFolderPath) {
    throw new Error("projectFolderPath is required")
  }
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
  console.log("runBack", executableName, executablePath, backArgs)
  await runScript(executableName, executablePath, backArgs, "Serving Flask app")
  return port
}

async function runViewer(executableName, executablePath, args = {}) {
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
  console.log("runViewer", executableName, executablePath, viewerArgs)
  await runScript(
    executableName,
    executablePath,
    viewerArgs,
    "Starting factory",
  )
  return port
}

function killBack(back_port) {
  async function do_kill() {
    try {
      await fetch(
        `http://localhost:${back_port}/${back_schemas.opengeodeweb_back.kill.$id}`,
        {
          method: back_schemas.opengeodeweb_back.kill.methods[0],
        },
      )
      throw new Error("Failed to kill back")
    } catch (error) {
      console.log("Back closed", error)
    }
  }
  return pTimeout(do_kill(), {
    milliseconds: 5000,
    message: "Failed to kill back",
  })
}

function killViewer(viewer_port) {
  function do_kill() {
    return new Promise((resolve) => {
      const socket = new WebSocket("ws://localhost:" + viewer_port + "/ws")
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
          socket.close()
          resolve()
        }
      })
      socket.on("close", () => {
        console.log("Disconnected from WebSocket server")
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
    message: "Failed to kill viewer",
  })
}

function killHttpMicroservice(microservice) {
  const failMessage = `Failed to kill ${microservice}`
  async function do_kill() {
    try {
      await fetch({
        url: microservice.url,
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
  const failMessage = `Failed to kill ${microservice.name}`
  const successMessage = `Disconnected from ${microservice.name} WebSocket server`
  function do_kill() {
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
  if ("http://" in microservice.url) {
    killHttpMicroservice(microservice.url)
  } else if ("ws://" in microservice.url) {
    killWebsocketMicroservice(microservice)
  }
}

function killMicroservices(microservices) {
  return Promise.all(
    microservices.map((microservice) => killMicroservice(microservice)),
  )
}

function projectMicroservices(projectFolderPath) {
  return JSON.parse(
    fs.readFileSync(path.join(projectFolderPath, "microservices.json")),
  )
}

async function cleanupBackend(projectFolderPath) {
  console.log("cleanupBackend", { projectFolderPath })
  const microservices = projectMicroservices(projectFolderPath)
  await killMicroservices(microservices)
  deleteFolderRecursive(projectFolderPath)
}

function initMicroservicesMetadatas(filePath) {
  const microservicesMetadatas = {
    microservices: [],
  }
  fs.writeFileSync(filePath, JSON.stringify(microservicesMetadatas, null, 2))
}

function addMicroserviceMetadatas(filePath, serviceObj) {
  const config = JSON.parse(fs.readFileSync(filePath, "utf-8"))
  config.microservices.push(serviceObj)
  fs.writeFileSync(filePath, JSON.stringify(config, null, 2))
}

export {
  getAvailablePort,
  killMicroservices,
  killBack,
  killViewer,
  initMicroservicesMetadatas,
  addMicroserviceMetadatas,
  cleanupBackend,
  runBack,
  runViewer,
}
