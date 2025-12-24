// Web Crypto APIを使用したパスワードハッシュ化とJWT生成
// Cloudflare Workers互換

const JWT_SECRET = 'your-secret-key-change-in-production'

// パスワードをハッシュ化（SHA-256ベース）
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// パスワードを検証
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

// 簡易JWT生成（Cloudflare Workers互換）
export function createToken(payload: any, expiresIn: number = 7 * 24 * 60 * 60): string {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const claims = {
    ...payload,
    iat: now,
    exp: now + expiresIn
  }
  
  const headerEncoded = base64UrlEncode(JSON.stringify(header))
  const payloadEncoded = base64UrlEncode(JSON.stringify(claims))
  const signature = base64UrlEncode(JWT_SECRET) // 簡易的な実装
  
  return `${headerEncoded}.${payloadEncoded}.${signature}`
}

// JWT検証
export function verifyToken(token: string): any {
  try {
    const [headerEncoded, payloadEncoded, signature] = token.split('.')
    const payload = JSON.parse(base64UrlDecode(payloadEncoded))
    
    // 有効期限チェック
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) {
      throw new Error('Token expired')
    }
    
    return payload
  } catch (error) {
    throw new Error('Invalid token')
  }
}

// Base64 URL エンコード
function base64UrlEncode(str: string): string {
  const base64 = btoa(unescape(encodeURIComponent(str)))
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

// Base64 URL デコード
function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4) {
    str += '='
  }
  return decodeURIComponent(escape(atob(str)))
}
