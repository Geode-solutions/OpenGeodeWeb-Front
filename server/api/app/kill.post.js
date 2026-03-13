// Node imports

// Third party imports
import { defineEventHandler } from "h3"

// Local imports

export default defineEventHandler(() => {
  console.log("Killing node server process")
  process.exit()
})
