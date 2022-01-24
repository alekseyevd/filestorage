import Route from '../Route'
import { IContext } from '../lib/http/interfaces'
import fs from 'fs'
import path from 'path'
import stream from 'stream'
import crypto from 'crypto'
import zlib from 'zlib'
import { iv, STORAGE_DIR } from '../config'

export default new Route({
  path: '/storage',
  method: 'put',
  auth: true,
  handler: async (ctx: IContext) => {
    const secret = ctx.headers['x-secret']
    const filename = ctx.headers['file-name']
    if (!secret) throw new Error('request headers do not contain x-secret value')
    return await ctx.saveToFile({
      dir: ctx.get('user'),
      filename,
      secret 
    }).then(ctx => ctx.files)
  },
  options: {
    fileHandler: async (file: stream, params: any) => {
      return new Promise((resolve, reject) => {
        const encrypt = crypto.createCipheriv('aes-256-ctr', params.secret, iv);
    
        const filename = `${Date.now()}_${params.filename}.gz`
        const pathname = path.join(STORAGE_DIR, params.dir, filename) 
        
        const stream = fs.createWriteStream(pathname)
        const gz = zlib.createGzip();
        file
          .pipe(encrypt)
          .pipe(gz)
          .pipe(stream)
          .on('finish', () => resolve({
            filename,
            pathname
          }))
          .on('error', (error: Error) => reject(error))
      })
    }
  },
})