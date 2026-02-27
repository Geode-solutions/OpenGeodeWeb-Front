import { on, once } from "node:events"
import child_process from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import { setTimeout } from "timers/promises"
import { rimraf } from "rimraf"

// Third party imports

import { WebSocket } from "ws"
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json" with { type: "json" }
import { getPort } from "get-port-please"
import isElectron from "is-electron"
import pTimeout from "p-timeout"
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json" with { type: "json" }

const MAX_DELETE_FOLDER_RETRIES = 5
const DEFAULT_TIMEOUT_SECONDS = 30
const MILLISECONDS_PER_SECOND = 1000

function venv_script_path(microservice_path) {
  const venv_path = path.join(microservice_path, "venv")
  let script_path = ""
  if (process.platform === "win32") {
    script_path = path.join(venv_path, "Scripts")
  } else {
    script_path = path.join(venv_path, "bin")
  }
  return script_path
}

async function executable_path(microservice_path) {
  if (isElectron()) {
    const electron = await import("electron")
    if (electron.app.isPackaged) {
      return process.resourcesPath
    } else {
      return venv_script_path(microservice_path)
    }
  } else {
    return venv_script_path(microservice_path)
  }
}

function executable_name(name) {
  if (process.platform === "win32") {
    return `${name}.exe`
  }
  return name
}

function create_path(path) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true })
    console.log(`${path} directory created successfully!`)
  }
  return path
}

function get_available_port() {
  return getPort({
    host: "localhost",
    random: true,
  })
}

function commandExistsSync(executable_name) {
  const envPath = process.env.PATH || ""
  return envPath.split(path.delimiter).some((dir) => {
    const filePath = path.join(dir, executable_name)
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile()
  })
}

async function wait_for_ready(child, expected_response) {
  for await (const [data] of on(child.stdout, "data")) {
    if (data.toString().includes(expected_response)) {
      return child
    }
  }
  throw new Error("Process closed before signal")
}

async function run_script(
  executable_name,
  executable_path,
  args,
  expected_response,
  timeout_seconds = DEFAULT_TIMEOUT_SECONDS,
) {
  const command = commandExistsSync(executable_name)
    ? executable_name
    : path.join(executable_path, executable_name)
  console.log("run_script", command, args)
  const child = child_process.spawn(command, args, {
    encoding: "utf8",
    shell: true,
  })

  child.stdout.on("data", (data) => console.log(data.toString()))

  child.on("error", async (error) => {
    const electron = await import("electron")
    electron.dialog.showMessageBox({
      title: "Title",
      type: "warning",
      message: `Error occured.\r\n${error}`,
    })
  })

  child.on("close", (code) =>
    console.log(`Child Process exited with code ${code}`),
  )
  child.on("kill", () => {
    console.log("Child Process killed")
  })
  child.name = command.replace(/^.*[\\/]/, "")

  try {
    return await pTimeout(wait_for_ready(child, expected_response), {
      milliseconds: timeout_seconds * MILLISECONDS_PER_SECOND,
      message: `Timed out after ${timeout_seconds} seconds`,
    })
  } catch (error) {
    child.kill()
    throw error
  }
}

async function run_back(executableName, executablePath, args = {}) {
  let { projectFolderPath, uploadFolderPath } = args
  if (!projectFolderPath) {
    throw new Error("projectFolderPath is required")
  }
  if (!uploadFolderPath) {
    uploadFolderPath = path.join(projectFolderPath, "uploads")
  }
  const port = await get_available_port()
  const back_args = [
    `--port ${port}`,
    `--data_folder_path ${projectFolderPath}`,
    `--upload_folder_path ${uploadFolderPath}`,
    `--allowed_origin http://localhost:*`,
    `--timeout ${0}`,
  ]
  if (process.env.NODE_ENV === "development" || !process.env.NODE_ENV) {
    back_args.push("--debug")
  }
  console.log("run_back", executableName, executablePath, back_args)
  await run_script(
    executableName,
    executablePath,
    back_args,
    "Serving Flask app",
  )
  return port
}

async function run_viewer(executableName, executablePath, args = {}) {
  if (!args.projectFolderPath) {
    throw new Error("projectFolderPath is required")
  }
  const port = await get_available_port()
  const viewerArgs = [
    `--port ${port}`,
    `--data_folder_path ${args.projectFolderPath}`,
    `--timeout ${0}`,
  ]
  console.log("run_viewer", executableName, executablePath, viewerArgs)
  await run_script(
    executableName,
    executablePath,
    viewerArgs,
    "Starting factory",
  )
  return port
}

async function delete_folder_recursive(data_folder_path) {
  if (!fs.existsSync(data_folder_path)) {
    console.log(`Folder ${data_folder_path} does not exist.`)
    return
  }
  for (let i = 0; i <= MAX_DELETE_FOLDER_RETRIES; i += 1) {
    try {
      console.log(`Deleting folder: ${data_folder_path}`)
      await rimraf(data_folder_path)
      console.log(`Deleted folder: ${data_folder_path}`)
      return
    } catch (error) {
      console.error(`Error deleting folder ${data_folder_path}:`, error)
      // Wait before retrying
      const DELAY = 1000 * (i + 1)
      await setTimeout(DELAY)
      console.log("Retrying delete folder")
    }
  }
}

function kill_back(back_port) {
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

function kill_viewer(viewer_port) {
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

//   process.env.BROWSER = true
//   process.on("SIGINT", async () => {
//     console.log("Shutting down microservices")
//     await Promise.all([kill_back(back_port), kill_viewer(viewer_port)])
//     console.log("Quitting App...")
//     process.exit(0)
//   })

export {
  create_path,
  delete_folder_recursive,
  executable_name,
  executable_path,
  get_available_port,
  kill_back,
  kill_viewer,
  run_script,
  run_back,
  run_viewer,
}
