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

function commandExistsSync(execName) {
  const envPath = process.env.PATH || ""
  return envPath.split(path.delimiter).some((dir) => {
    const filePath = path.join(dir, execName)
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

async function waitNuxt(nuxtProcess) {
  for await (const [data] of on(nuxtProcess.stdout, "data")) {
    const output = data.toString()
    console.log("Nuxt:", output)
    const portMatch = output.match(/Listening on http:\/\/\[::\]:(\d+)/)
    if (portMatch) {
      const [, nuxtPort] = portMatch

      console.log("Nuxt listening on port", nuxtPort)
      return nuxtPort
    }
  }
  throw new Error("Nuxt process closed without accepting connections")
}

async function runBrowser(scriptName) {
  process.env.BROWSER = true

  const nuxtProcess = child_process.spawn("npm", ["run", scriptName], {
    shell: true,
    FORCE_COLOR: true,
  })
  return await waitNuxt(nuxtProcess)
}

export { runBrowser, runScript }
