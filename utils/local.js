// Node.js imports
import fs from "fs"
import path from "path"
import child_process from "child_process"

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

async function get_available_port(port) {
  const available_port = await getPort({ port, host: "localhost" })
  console.log("available_port", available_port)
  return available_port
}

async function run_script(
  command,
  args,
  expected_response,
  timeout_seconds = 30,
) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject("Timed out after " + timeout_seconds + " seconds")
    }, timeout_seconds * 1000)
    const child = child_process.spawn(command, args, {
      encoding: "utf8",
      shell: true,
    })

    // You can also use a variable to save the output for when the script closes later
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
      //Here is the output
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
      //Here you can get the exit code of the script
      console.log("Child Process exited with code " + _code)
    })
    child.on("kill", () => {
      console.log("Child Process killed")
    })
    child.name = command.replace(/^.*[\\/]/, "")
    return child
  })
}

async function run_back(port, data_folder_path) {
  return new Promise(async (resolve, reject) => {
    const back_command = path.join(
      executable_path(path.join("microservices", "back")),
      executable_name("vease-back"),
    )
    const back_port = await get_available_port(port)
    const back_args = [
      "--port " + back_port,
      "--data_folder_path " + data_folder_path,
      "--allowed_origin http://localhost:*",
      "--timeout " + 0,
    ]
    await run_script(command, back_args, "Serving Flask app")
    resolve(back_port)
  })
}

async function run_viewer(command, args = { port, data_folder_path }) {
  return new Promise(async (resolve, reject) => {
    const viewer_port = await get_available_port(args.port)
    const viewer_args = [
      "--port " + viewer_port,
      "--data_folder_path " + args.data_folder_path,
      "--timeout " + 0,
    ]
    await run_script(command, viewer_args, "Starting factory")
    resolve(viewer_port)
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
