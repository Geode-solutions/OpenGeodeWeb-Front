// Node imports
import child_process from "node:child_process"
import fs from "node:fs"
import { on } from "node:events"
import path from "node:path"

import { appMode } from "./app_mode.js"

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
  process.env.MODE = appMode.BROWSER

  const nuxtProcess = child_process.spawn("npm", ["run", scriptName], {
    shell: true,
    FORCE_COLOR: true,
  })
  return await waitNuxt(nuxtProcess)
}

export { runBrowser, waitForReady, commandExistsSync }
