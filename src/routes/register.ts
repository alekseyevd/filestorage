import Route from '../Route'
import { IContext } from '../lib/http/interfaces'
import fs from 'fs'
import path from 'path'
import { STORAGE_DIR } from '../config'

export default new Route({
  path: '/register',
  method: 'post',
  handler: async (ctx: IContext) => {
    const password = ctx.body.password
    const name = ctx.body.name.toLowerCase()
    if (fs.existsSync(path.join('storage', name))) throw new Error(`User ${name} is already exist`)
  
    await fs.promises.mkdir(path.join(STORAGE_DIR, name))
    await fs.promises.writeFile(path.join(STORAGE_DIR, name, '.psw'), password)
    return { result: true }
  },
  validate: {
    body: {
      type: "object",
      properties: {
        name: {
          type: 'string',
          format: 'email',
        },
        password: {
          type: 'string',
          minLength: 5
        },
      },
      required: ['name', 'password'],
      additionalProperties: false
    }
  }
})