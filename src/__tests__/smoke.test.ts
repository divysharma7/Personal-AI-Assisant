import { describe, it, expect } from 'vitest'

describe('application entry point', () => {
  it('env config loads without errors', async () => {
    const { env } = await import('@/config/env')
    expect(env).toBeDefined()
    expect(typeof env.VITE_API_URL).toBe('string')
  })

  it('providers module loads without errors', async () => {
    const mod = await import('@/app/providers')
    expect(mod.default).toBeDefined()
    expect(typeof mod.default).toBe('function')
  })

  it('login page component loads without errors', async () => {
    const mod = await import('@/app/login/page')
    expect(mod.default).toBeDefined()
    expect(typeof mod.default).toBe('function')
  })

  it('RequireAuth component loads without errors', async () => {
    const mod = await import('@/router/RequireAuth')
    expect(mod.default).toBeDefined()
    expect(typeof mod.default).toBe('function')
  })

  it('AppLayout component loads without errors', async () => {
    const mod = await import('@/router/AppLayout')
    expect(mod.default).toBeDefined()
    expect(typeof mod.default).toBe('function')
  })

  it('FocusContext loads without useNavigate error', async () => {
    const mod = await import('@/contexts/FocusContext')
    expect(mod.default).toBeDefined()
    expect(typeof mod.default).toBe('function')
    expect(mod.useFocusState).toBeDefined()
  })

})
