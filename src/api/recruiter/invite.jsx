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

export const startInviteSession = async (token) => {
  const response = await fetch('/api/v1/sessions/start-invite', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.detail || 'Failed to start assessment')
  }

  return await response.json()
}