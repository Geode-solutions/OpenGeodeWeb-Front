import { defineEventHandler } from "h3"

import { useRuntimeConfig } from "#imports"

import { executable_name } from "@geode/opengeodeweb-front/app/utils/local.js"

export default defineEventHandler(async (event) => {
  const backPath = executable_path(useRuntimeConfig().public.BACK_PATH)
  const backCommand = executable_name(useRuntimeConfig().public.BACK_COMMAND)
})
