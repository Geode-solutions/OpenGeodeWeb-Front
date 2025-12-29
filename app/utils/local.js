// Node.js imports
import fs from "fs"
import path from "path"
import child_process from "child_process"
import WebSocket from "ws"

// Third party imports
import pkg from "electron"
const { app, dialog } = pkg
import { getPort } from "get-port-please"
import isElectron from "is-electron"
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json" with { type: "json" }
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json" with { type: "json" }

function venv_script_path(root_path, microservice_path) {
  const venv_path = path.join(root_path, microservice_path, "venv")
  var script_path
  if (process.platform === "win32") {
    script_path = path.join(venv_path, "Scripts")
  } else {
    script_path = path.join(venv_path, "bin")
  }
  return script_path
}

function executable_path(microservice_path) {
  if (isElectron()) {
    if (app.isPackaged) {
      return process.resourcesPath
    } else {
      return venv_script_path(app.getAppPath(), microservice_path)
    }
  } else {
    return venv_script_path(process.cwd(), microservice_path)
  }
}

function executable_name(name) {
  if (process.platform === "win32") {
    return name + ".exe"
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

async function run_script(
  executable_name,
  executable_path,
  args,
  expected_response,
  timeout_seconds = 30,
) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject("Timed out after " + timeout_seconds + " seconds")
    }, timeout_seconds * 1000)

    const local_command = path.join(executable_path, executable_name)
    const command = fs.existsSync(local_command)
      ? local_command
      : executable_name
    console.log("run_script", command, args)
    const child = child_process.spawn(command, args, {
      encoding: "utf8",
      shell: true,
    })

    child.stderr.setEncoding("utf8")
    child.on("error", (error) => {
      dialog.showMessageBox({
        title: "Title",
        type: "warning",
        message: "Error occured.\r\n" + error,
      })
    })
    child.stdout.setEncoding("utf8")
    child.stdout.on("data", (data) => {
      data = data.toString()
      if (data.includes(expected_response)) {
        resolve(child)
      }
      console.log(data)
    })

    child.stderr.on("data", (data) => {
      console.log(data)
    })

    child.on("close", (_code) => {
      console.log("Child Process exited with code " + _code)
    })
    child.on("kill", () => {
      console.log("Child Process killed")
    })
    child.name = command.replace(/^.*[\\/]/, "")
    return child
  })
}

async function run_back(
  executable_name,
  executable_path,
  args = {
    project_folder_path,
    upload_folder_path: undefined,
  },
) {
  return new Promise(async (resolve, reject) => {
    let upload_folder_path = args.upload_folder_path
    if (!args.upload_folder_path) {
      upload_folder_path = path.join(args.project_folder_path, "uploads")
    }
    const port = await get_available_port()
    const back_args = [
      "--port " + port,
      "--data_folder_path " + args.project_folder_path,
      "--upload_folder_path " + upload_folder_path,
      "--allowed_origin http://localhost:*",
      "--timeout " + 0,
    ]
    if (process.env.NODE_ENV === "development") {
      back_args.push("--debug")
    }
    console.log("run_back", executable_name, executable_path, back_args)
    await run_script(
      executable_name,
      executable_path,
      back_args,
      "Serving Flask app",
    )
    resolve(port)
  })
}

async function run_viewer(
  executable_name,
  executable_path,
  args = { project_folder_path },
) {
  return new Promise(async (resolve, reject) => {
    const port = await get_available_port()
    const viewer_args = [
      "--port " + port,
      "--data_folder_path " + args.project_folder_path,
      "--timeout " + 0,
    ]
    console.log("run_viewer", executable_name, executable_path, viewer_args)
    await run_script(
      executable_name,
      executable_path,
      viewer_args,
      "Starting factory",
    )
    resolve(port)
  })
}

function delete_folder_recursive(data_folder_path) {
  if (!fs.existsSync(data_folder_path)) {
    console.log(`Folder ${data_folder_path} does not exist.`)
    return
  }
  try {
    fs.rmSync(data_folder_path, { recursive: true, force: true })
    console.log(`Deleted folder: ${data_folder_path}`)
  } catch (err) {
    console.error(`Error deleting folder ${data_folder_path}:`, err)
  }
}

function kill_back(back_port) {
  return new Promise((resolve, reject) => {
    fetch(
      "http://localhost:" +
      back_port +
      "/" +
      back_schemas.opengeodeweb_back.kill.$id,
      {
        method: back_schemas.opengeodeweb_back.kill.methods[0],
      },
    )
      .then(() => {
        console.log("Back not killed")
        reject()
      })
      .catch(() => {
        console.log("Back closed")
        resolve()
      })
  })
}

function kill_viewer(viewer_port) {
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
            id: viewer_schemas.opengeodeweb_viewer.kill.$id,
            method: viewer_schemas.opengeodeweb_viewer.kill.$id,
          }),
        )
        resolve()
      }
    })
    socket.on("close", () => {
      console.log("Disconnected from WebSocket server")
      resolve()
    })
    socket.on("error", (error) => {
      console.error("WebSocket error:", error)
      resolve()
    })
  })
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
    {
      ...microservices_options.back.args,
    },
  )
  console.log("back_promise", back_promise)

  const viewer_promise = run_viewer(
    microservices_options.viewer.executable_name,
    microservices_options.viewer.executable_path,
    {
      ...microservices_options.viewer.args,
    },
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

  return new Promise((resolve) => {
    nuxt_process.stdout.on("data", function (data) {
      const output = data.toString()
      const portMatch = output.match(
        /Accepting\ connections\ at\ http:\/\/localhost:(\d+)/,
      )
      console.log("Nuxt: ", output)
      if (portMatch) {
        const nuxt_port = portMatch[1]
        process.env.NUXT_PORT = nuxt_port
        resolve({ geode_port: back_port, viewer_port, nuxt_port })
        return
      }
    })
  })
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
