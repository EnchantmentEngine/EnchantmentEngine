import { API } from '@ir-engine/common'

/**
 * Recursively checks a boolean state with logarithmic backoff.
 * @param checkFunction A function that returns a boolean indicating if the desired state is reached.
 * @param maxAttempts Maximum number of attempts before giving up.
 * @param initialDelay Initial delay in milliseconds.
 * @param maxDelay Maximum delay in milliseconds.
 * @returns A promise that resolves to true if the desired state is reached, false otherwise.
 */
async function logarithmicStateCheck(
  checkFunction: () => boolean,
  maxAttempts: number = 5,
  initialDelay: number = 1000,
  maxDelay: number = 30000
): Promise<boolean> {
  let attempts = 0
  let delay = initialDelay

  async function attemptCheck(): Promise<boolean> {
    if (checkFunction()) {
      console.log(`Succeeded to reach desired state after ${attempts} attempts.`)
      return true
    }

    attempts++
    if (attempts >= maxAttempts) {
      console.log(`Failed to reach desired state after ${maxAttempts} attempts.`)
      return false
    }

    console.log(`Attempt ${attempts} failed. Retrying in ${delay}ms...`)
    await new Promise((resolve) => setTimeout(resolve, delay))

    // Increase delay logarithmically, but cap it at maxDelay
    delay = Math.min(delay * 2, maxDelay)

    return attemptCheck()
  }

  return attemptCheck()
}

async function waitForClientAuthenticated(): Promise<void> {
  const api = API.instance // as FeathersClient
  console.log('Client authenticated?', api.authentication?.authenticated)
  const result = await logarithmicStateCheck(
    () => api.authentication?.authenticated === true,
    Infinity,
    1000,
    16 * 1000
  )
  console.log('Client authenticated?', api.authentication?.authenticated)
}

export default waitForClientAuthenticated
