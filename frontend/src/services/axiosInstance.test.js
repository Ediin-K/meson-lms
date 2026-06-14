// Verifies the 401 → refresh → retry interceptor and the session-expired event.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'
// vitest runs in a node environment; give the interceptor a window to talk to
if (typeof globalThis.window === 'undefined') {
    globalThis.window = new EventTarget()
}

const { default: axiosInstance, SESSION_EXPIRED_EVENT } = await import('./axiosInstance')

function unauthorized(config) {
    const err = new Error('Request failed with status code 401')
    err.config = config
    err.response = { status: 401 }
    return err
}

describe('axiosInstance 401 refresh interceptor', () => {
    let refreshSpy

    beforeEach(() => {
        refreshSpy = vi.spyOn(axios, 'post')
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('refreshes the token and transparently retries the original request', async () => {
        let calls = 0
        axiosInstance.defaults.adapter = (config) => {
            calls += 1
            if (calls === 1) return Promise.reject(unauthorized(config))
            return Promise.resolve({
                data: { ok: true }, status: 200, statusText: 'OK', headers: {}, config,
            })
        }
        refreshSpy.mockResolvedValue({ data: {} })

        const res = await axiosInstance.get('/protected')

        expect(res.data).toEqual({ ok: true })
        expect(calls).toBe(2) // original + retry after refresh
        expect(refreshSpy).toHaveBeenCalledTimes(1)
        expect(refreshSpy.mock.calls[0][0]).toMatch(/\/auth\/refresh$/)
    })

    it('dispatches the session-expired event when refresh also fails', async () => {
        axiosInstance.defaults.adapter = (config) => Promise.reject(unauthorized(config))
        refreshSpy.mockRejectedValue(new Error('refresh failed'))

        const expired = vi.fn()
        window.addEventListener(SESSION_EXPIRED_EVENT, expired)

        await expect(axiosInstance.get('/protected')).rejects.toThrow()
        expect(refreshSpy).toHaveBeenCalledTimes(1)
        expect(expired).toHaveBeenCalledTimes(1)

        window.removeEventListener(SESSION_EXPIRED_EVENT, expired)
    })

    it('does not loop: a 401 on the retried request is not refreshed again', async () => {
        let calls = 0
        axiosInstance.defaults.adapter = (config) => {
            calls += 1
            return Promise.reject(unauthorized(config))
        }
        refreshSpy.mockResolvedValue({ data: {} })

        await expect(axiosInstance.get('/protected')).rejects.toThrow()
        expect(calls).toBe(2)
        expect(refreshSpy).toHaveBeenCalledTimes(1)
    })
})
