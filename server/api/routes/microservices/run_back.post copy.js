import { defineEventHandler } from "h3"

import { useRuntimeConfig } from "#imports"

import { executable_name } from "@geode/opengeodeweb-front/app/utils/local.js"

export default defineEventHandler(async (event) => {
  const viewerPath = executable_path(useRuntimeConfig().public.VIEWER_PATH)
  const viewerCommand = executable_name(
    useRuntimeConfig().public.VIEWER_COMMAND,
  )
})
