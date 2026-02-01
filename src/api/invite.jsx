export const verifyInviteToken = async (token) => {
  try {
    const response = await fetch('/api/v1/sessions/verify-invite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    })

    if (!response.ok) {
      throw new Error('Invalid or expired token')
    }

    return await response.json()
  } catch (error) {
    throw error
  }
}