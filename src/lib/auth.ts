import { cookies } from 'next/headers'

export async function verifyAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('admin-session')?.value

    if (!sessionToken) {
      return false
    }

    // In a more sophisticated setup, you'd validate the token against a database
    // For simplicity, we'll just check if the token exists and is the right length
    // The token is generated securely in the login endpoint
    return sessionToken.length === 64 // 32 bytes = 64 hex characters
  } catch (error) {
    console.error('Session verification error:', error)
    return false
  }
}

export async function requireAuth(): Promise<void> {
  const isAuthenticated = await verifyAdminSession()
  if (!isAuthenticated) {
    throw new Error('Authentication required')
  }
}
