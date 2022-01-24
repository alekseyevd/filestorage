import Route from '../Route'
import { IContext } from '../lib/http/interfaces'
import fs from 'fs'
import path from 'path'
import { STORAGE_DIR } from '../config'

export default new Route({
  path: '/storage/{id}',
  method: 'delete',
  auth: true,
  handler: async (ctx: IContext) => {
    const id = ctx.params.id
    const user = ctx.get('user')
    
    const pathname = path.join(STORAGE_DIR, user)
    const filename = fs.readdirSync(pathname).filter(f => f.startsWith(`${id}_`))[0];
    if (!filename) throw new Error('file not found')
    await fs.promises.unlink(path.join(pathname, filename))
    return { result: 'done' }
  }
})
