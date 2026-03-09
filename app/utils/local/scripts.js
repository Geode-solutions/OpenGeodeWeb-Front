// Node imports
import { on } from "node:events"
import child_process from "node:child_process"
import fs from "node:fs"
import path from "node:path"

// Third party imports
import pTimeout from "p-timeout"

// Local imports
import { executablePath, executableName } from "./path.js"

const DEFAULT_TIMEOUT_SECONDS = 30
const MILLISECONDS_PER_SECOND = 1000

function commandExistsSync(executableName) {
  const envPath = process.env.PATH || ""
  return envPath.split(path.delimiter).some((dir) => {
    const filePath = path.join(dir, executableName)
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile()
  })
}

async function waitForReady(child, expectedResponse) {
  for await (const [data] of on(child.stdout, "data")) {
    if (data.toString().includes(expectedResponse)) {
      return child
    }
  }
  throw new Error("Process closed before signal")
}

async function runScript(
  _executableName,
  _executablePath,
  args,
  expectedResponse,
  timeoutSeconds = DEFAULT_TIMEOUT_SECONDS,
) {
  const command = commandExistsSync(_executableName)
    ? _executableName
    : path.join(
        await executablePath(_executablePath),
        executableName(_executableName),
      )
  console.log("runScript", command, args)
  const child = child_process.spawn(command, args, {
    encoding: "utf8",
    shell: true,
  })

  child.stdout.on("data", (data) =>
    console.log(`[${_executableName}] ${data.toString()}`),
  )
  child.stderr.on("data", (data) =>
    console.log(`[${_executableName}] ${data.toString()}`),
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
    console.log(`[${_executableName}] exited with code ${code}`),
  )
  child.on("kill", () => {
    console.log(`[${_executableName}] process killed`)
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

async function waitNuxt(nuxt_process) {
  for await (const [data] of on(nuxt_process.stdout, "data")) {
    const output = data.toString()
    console.log("Nuxt:", output)
    const portMatch = output.match(/Listening on http:\/\/\[::\]:(\d+)/)
    if (portMatch) {
      const [, nuxt_port] = portMatch

      console.log("Nuxt listening on port", nuxt_port)
      return nuxt_port
    }
  }
  throw new Error("Nuxt process closed without accepting connections")
}

async function runBrowser(script_name) {
  process.env.BROWSER = true

  const nuxtProcess = child_process.spawn("npm", ["run", script_name], {
    shell: true,
    FORCE_COLOR: true,
  })
  const nuxtPort = await waitNuxt(nuxtProcess)
  return nuxtPort
}

export { runBrowser, runScript }
