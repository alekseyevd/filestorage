import Route from '../Route'
import { IContext } from '../lib/http/interfaces'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import zlib from 'zlib'
import { iv, STORAGE_DIR } from '../config'

export default new Route({
  path: '/storage/{id}',
  method: 'get',
  auth: true,
  handler: async (ctx: IContext) => {
    const id = ctx.params.id
    const user = ctx.get('user')
    const secret = ctx.headers['x-secret']?.toString()
    if (!secret) throw new Error('request headers do not contain x-secret')
    
    const pathname = path.join(STORAGE_DIR, user)
    const filename = fs.readdirSync(pathname).filter(f => f.startsWith(`${id}_`))[0];

    const gz = zlib.createUnzip()
    const encrypt = crypto.createDecipheriv('aes-256-ctr', secret, iv);

    const original = filename.replace(`${id}_`, '').slice(0, -3)
    ctx.res.setHeader('Content-Disposition', `attachment; filename=${original}`)
    const stream = fs.createReadStream(path.join(pathname, filename))
      .on('error', () => {
        ctx.res.writeHead(404)
      })
      .pipe(gz)
      .pipe(encrypt)
    return stream
  }
})
