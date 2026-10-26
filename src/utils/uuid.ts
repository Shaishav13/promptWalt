/**
 * Generates a valid UUID v4 string safely across all environments:
 * - Secure browser contexts (crypto.randomUUID)
 * - Non-secure HTTP / IP-based browser contexts (fallback via getRandomValues or Math.random)
 * - Node.js server environments
 */
export function safeRandomUUID(): string {
  if (typeof crypto !== 'undefined') {
    if (typeof crypto.randomUUID === 'function') {
      try {
        return crypto.randomUUID()
      } catch {}
    }
    if (typeof crypto.getRandomValues === 'function') {
      try {
        const bytes = new Uint8Array(16)
        crypto.getRandomValues(bytes)
        bytes[6] = (bytes[6] & 0x0f) | 0x40 // RFC4122 version 4
        bytes[8] = (bytes[8] & 0x3f) | 0x80 // RFC4122 variant 10xx
        const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
      } catch {}
    }
  }

  // Guaranteed fallback for any environment
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
