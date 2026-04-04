/** @param {string} email */
export function isValidEmailFormat(email) {
  if (!email || typeof email !== 'string') return false
  const trimmed = email.trim()
  // Practical HTML5-style check (not full RFC)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
}

/** @param {string} password */
export function getPasswordStrength(password) {
  if (!password) {
    return { label: '', level: 'none', score: 0, segments: 0 }
  }
  let score = 0
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1

  if (score <= 2) {
    return { label: 'Weak', level: 'weak', score, segments: 1 }
  }
  if (score <= 4) {
    return { label: 'Medium', level: 'medium', score, segments: 2 }
  }
  return { label: 'Strong', level: 'strong', score, segments: 3 }
}

/**
 * Optional role hint from email (heuristic).
 * @param {string} email
 * @returns {'student' | 'instructor' | 'parent' | null}
 */
export function suggestRoleFromEmail(email) {
  const e = (email || '').toLowerCase()
  if (!e.includes('@')) return null
  const local = e.split('@')[0] || ''
  if (
    local.includes('teacher') ||
    local.includes('prof') ||
    local.includes('faculty') ||
    local.includes('instructor')
  ) {
    return 'instructor'
  }
  if (local.includes('parent') || local.includes('guardian')) {
    return 'parent'
  }
  if (local.includes('student') || e.endsWith('.edu') || e.endsWith('.edu.al')) {
    return 'student'
  }
  return null
}
