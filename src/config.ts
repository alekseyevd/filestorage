import path from 'path'

export const PORT = process.env.NODE_ENV === 'production' ? 80 : 5000
export const STORAGE_DIR = path.join(__dirname, '../storage')
export const iv = Buffer.from('0a9b8d1da137092a6c2f210227022396', 'hex')
