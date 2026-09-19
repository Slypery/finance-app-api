import { Hono } from 'hono'

export const accountRoutes = new Hono()

accountRoutes.post('/', async (c) => c.json({}))
