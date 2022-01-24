
import fs from 'fs'
import { STORAGE_DIR, PORT } from './config'
import HttpServer from './lib/http'
import { routes } from './routes/index'

const server = new HttpServer({
  routes,
  port: PORT,
});

(async () => {
  try {
    if (!fs.existsSync(STORAGE_DIR)) await fs.promises.mkdir('storage')

    server.listen(() => {
      console.log(`Server listening on port ${PORT}`)
    })
  } catch (error) {
    console.log(error)
    process.exit()
  }
})()