import { defineStore } from "pinia"

export const useImportQueueStore = defineStore("importQueue", () => {
  const queue = ref([])

  function addToQueue(name) {
    const id = Date.now() + Math.random().toString(36).substr(2, 9)
    queue.value.push({
      id,
      name,
      status: "pending",
      progress: 0,
      error: null,
    })
    return id
  }

  function updateStatus(id, status, progress = 0, error = null) {
    const item = queue.value.find((i) => i.id === id)
    if (item) {
      item.status = status
      item.progress = progress
      item.error = error
    }
  }

  function removeFromQueue(id) {
    const index = queue.value.findIndex((i) => i.id === id)
    if (index !== -1) {
      queue.value.splice(index, 1)
    }
  }

  function clearCompleted() {
    queue.value = queue.value.filter(
      (i) => i.status !== "success" && i.status !== "error",
    )
  }

  const activeImportsCount = computed(
    () =>
      queue.value.filter(
        (i) => i.status === "pending" || i.status === "importing",
      ).length,
  )

  return {
    queue,
    addToQueue,
    updateStatus,
    removeFromQueue,
    clearCompleted,
    activeImportsCount,
  }
})
