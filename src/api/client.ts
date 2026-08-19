/**
 * API layer — the only place network concerns live.
 *
 * Every module exports an interface (the contract components depend on)
 * plus a concrete implementation. The default export is the mock
 * implementation. When the real backend lands, swap the implementation
 * behind the same interface — component code never changes.
 *
 * @example
 *   // auth.api.ts
 *   export const authApi: AuthApi = mockAuthApi
 *   // becomes:
 *   export const authApi: AuthApi = realAuthApi // axios/fetch based
 */

export const SIMULATED_LATENCY = { min: 250, max: 900 }

export function simulateLatency(ms?: number): Promise<void> {
  const { min, max } = SIMULATED_LATENCY
  const delay = ms ?? min + Math.random() * (max - min)
  return new Promise((resolve) => setTimeout(resolve, delay))
}

export function mockResult<T>(data: T, ms?: number): Promise<T> {
  return simulateLatency(ms).then(() => data)
}

export function mockError(message: string, ms?: number): Promise<never> {
  return simulateLatency(ms).then(() => {
    throw new Error(message)
  })
}

export function randomId(prefix: string): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'
  const nums = '0123456789'
  const block = () =>
    Array.from({ length: 4 }, () =>
      Math.random() < 0.6
        ? alphabet[Math.floor(Math.random() * alphabet.length)]
        : nums[Math.floor(Math.random() * nums.length)],
    ).join('')
  return `${prefix}-${block()}-${block()}`
}

export function randomRoomCode(): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'
  const nums = '0123456789'
  const block = () =>
    Array.from({ length: 4 }, () =>
      Math.random() < 0.6
        ? alphabet[Math.floor(Math.random() * alphabet.length)]
        : nums[Math.floor(Math.random() * nums.length)],
    ).join('')
  return `${block()}-${block()}-${block()}`
}