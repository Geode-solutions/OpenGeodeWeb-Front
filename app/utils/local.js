import { on, once } from "node:events"
import child_process from "node:child_process"
import fs from "node:fs"
import path from "node:path"

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

function venv_script_path(root_path, microservice_path) {
  const venv_path = path.join(root_path, microservice_path, "venv")
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
      return venv_script_path(electron.app.getAppPath(), microservice_path)
    }
  } else {
    return venv_script_path(process.cwd(), microservice_path)
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
  child.stderr.on("data", (data) => console.log(data.toString()))

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

async function run_back(
  executable_name,
  executable_path,
  args = {
    project_folder_path,
    upload_folder_path: undefined,
  },
) {
  let { project_folder_path, upload_folder_path } = args
  if (!upload_folder_path) {
    upload_folder_path = path.join(project_folder_path, "uploads")
  }
  const port = await get_available_port()
  const back_args = [
    `--port ${port}`,
    `--data_folder_path ${project_folder_path}`,
    `--upload_folder_path ${upload_folder_path}`,
    `--allowed_origin http://localhost:*`,
    `--timeout ${0}`,
  ]
  if (process.env.NODE_ENV === "development" || !process.env.NODE_ENV) {
    back_args.push("--debug")
  }
  console.log("run_back", executable_name, executable_path, back_args)
  await run_script(
    executable_name,
    executable_path,
    back_args,
    "Serving Flask app",
  )
  return port
}

async function run_viewer(
  executable_name,
  executable_path,
  args = { project_folder_path },
) {
  const port = await get_available_port()
  const viewer_args = [
    `--port ${port}`,
    `--data_folder_path ${args.project_folder_path}`,
    `--timeout ${0}`,
  ]
  console.log("run_viewer", executable_name, executable_path, viewer_args)
  await run_script(
    executable_name,
    executable_path,
    viewer_args,
    "Starting factory",
  )
  return port
}

function delete_folder_recursive(data_folder_path) {
  if (!fs.existsSync(data_folder_path)) {
    console.log(`Folder ${data_folder_path} does not exist.`)
    return
  }
  try {
    for (let i = 0; i <= MAX_DELETE_FOLDER_RETRIES; i += 1) {
      console.log(`Deleting folder: ${data_folder_path}`)
      fs.rmSync(data_folder_path, { recursive: true, force: true })
      console.log(`Deleted folder: ${data_folder_path}`)
      return
    }
  } catch (error) {
    console.error(`Error deleting folder ${data_folder_path}:`, error)
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
    } catch {
      console.log("Back closed")
    }
  }
  return pTimeout(do_kill, {
    milliseconds: 500,
    message: "Failed to kill back",
  })
}

function kill_viewer(viewer_port) {
  async function do_kill() {
    const socket = new WebSocket(`ws://localhost:${viewer_port}/ws`)
    try {
      await once(socket, "open")
      console.log("Connected to WebSocket server")
      socket.send(
        JSON.stringify({
          id: "system:hello",
          method: "wslink.hello",
          args: [{ secret: "wslink-secret" }],
        }),
      )

      for await (const [data] of on(socket, "message")) {
        const message = data.toString()
        console.log("Received from server:", message)

        if (message.includes("hello")) {
          socket.send(
            JSON.stringify({
              id: viewer_schemas.opengeodeweb_viewer.kill.$id,
              method: viewer_schemas.opengeodeweb_viewer.kill.$id,
            }),
          )
          break
        }
      }
      await once(socket, "close")
      console.log("Disconnected from WebSocket server")
    } catch (error) {
      console.error("WebSocket error:", error)
    } finally {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close()
      }
    }
  }

  return pTimeout(do_kill, {
    milliseconds: 500,
    message: "Failed to kill viewer",
  })
}

async function wait_nuxt(nuxt_process, back_port, viewer_port) {
  for await (const [data] of on(nuxt_process.stdout, "data")) {
    const output = data.toString()
    const portMatch = output.match(
      /Accepting connections at http:\/\/localhost:(\d+)/,
    )
    console.log("Nuxt:", output)
    if (portMatch) {
      const [, nuxt_port] = portMatch
      process.env.NUXT_PORT = nuxt_port
      return { geode_port: back_port, viewer_port, nuxt_port }
    }
  }
  throw new Error("Nuxt process closed without accepting connections")
}

async function run_browser(
  script_name,
  microservices_options = {
    back: { executable_name, executable_path, args: { project_folder_path } },
    viewer: { executable_name, executable_path, args: { project_folder_path } },
  },
) {
  console.log("microservices_options", microservices_options)
  const back_promise = run_back(
    microservices_options.back.executable_name,
    microservices_options.back.executable_path,
    { ...microservices_options.back.args },
  )
  console.log("back_promise", back_promise)

  const viewer_promise = run_viewer(
    microservices_options.viewer.executable_name,
    microservices_options.viewer.executable_path,
    { ...microservices_options.viewer.args },
  )
  console.log("viewer_promise", viewer_promise)

  const [back_port, viewer_port] = await Promise.all([
    back_promise,
    viewer_promise,
  ])
  process.env.GEODE_PORT = back_port
  process.env.VIEWER_PORT = viewer_port
  console.log("back_port", back_port)
  console.log("viewer_port", viewer_port)

  process.env.BROWSER = true
  process.on("SIGINT", async () => {
    console.log("Shutting down microservices")
    await Promise.all([kill_back(back_port), kill_viewer(viewer_port)])
    console.log("Quitting App...")
    process.exit(0)
  })

  const nuxt_process = child_process.spawn("npm", ["run", script_name], {
    shell: true,
    FORCE_COLOR: true,
  })
  return wait_nuxt(nuxt_process, back_port, viewer_port)
}

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
  run_browser,
}
