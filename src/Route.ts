import { IContext } from './lib/http/interfaces'
import validator from './lib/validate'
import fs from 'fs'
import path from 'path'
import { IRoute } from './lib/http/interfaces'
import { STORAGE_DIR } from './config'

export default class Route implements IRoute {
  private _method: string
  private _path: string
  private _validate: any
  private _options: any
  private _auth: boolean
  private _handler: (ctx: IContext) => Promise<any>

  constructor(params: any) {
    this._method = params.method
    this._path = params.path
    this._validate = params.validate
    this._auth = params.auth || false
    this._options = params.options
    this._handler = params.handler
  }

  private authenticate(ctx: IContext): any {
    const token = ctx.headers?.authorization?.split('Basic ')[1]
    
    if (!token) return undefined

    const [ name, password ] = Buffer.from(token, 'base64').toString().split(':')
    try {
      const psw = fs.readFileSync(path.join(STORAGE_DIR, name, '.psw')).toString()

      if (psw !== password) return undefined
      
      return name
    } catch (error) {
      return undefined
    }
  }

  private authorize(user: any): boolean {
    return !!user
  }

  private async validate(ctx: IContext): Promise<Array<string>> {
    const bodySchema = this._validate?.body
    const querySchema = this._validate?.query
    const paramsSchema = this._validate?.params

    if (bodySchema) {
      const { body } = await ctx.parseBody()
      
      const { errors } = validator(bodySchema, body)
      if (errors) return errors
    }

    if (querySchema) {
      const query = ctx.query
      const { errors } = validator(querySchema, query)
      if (errors) return errors
    }

    if (paramsSchema) {
      const params = ctx.params
      const { errors } = validator(paramsSchema, params)
      if (errors) return errors
    }
    return []
  }

  private async handleRequest(ctx: IContext) {
    if (this._method && this._method !== ctx.method) throw new Error('method not allowed')

    let user
    if (this._auth) {
      user = this.authenticate(ctx)
      ctx.set('user', user)
      
      const hasAccess = this.authorize(user)
      if (!hasAccess) throw new Error('forbidden')
    }

    const errors = await this.validate(ctx)
    if (errors.length) throw new Error(errors.join(', '))
  
    return this._handler(ctx)
  }

  get method() {
    return this._method
  }

  get path() {
    return this._path
  }

  get options() {
    return this._options
  }

  get action() {
    return this.handleRequest.bind(this)
  }
}
