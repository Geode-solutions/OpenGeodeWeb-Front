import { createPage, setup } from '@nuxt/test-utils/e2e'
import { test } from 'vitest'

await setup()

test('should run without error', async () => {
    await createPage('/')
}, 5000)