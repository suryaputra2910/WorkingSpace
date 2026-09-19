// Lightweight, dependency-free validation helpers mirroring backend DTO rules.
// Backend validation remains the final source of truth; these only give
// early, friendly feedback in the UI.

export function required(value, label = 'Field ini') {
  if (value === undefined || value === null || String(value).trim() === '') {
    return `${label} wajib diisi`
  }
  return null
}

export function minLength(value, length, label = 'Field ini') {
  if (value && value.length < length) {
    return `${label} minimal ${length} karakter`
  }
  return null
}

export function isNumber(value, label = 'Field ini') {
  if (value === '' || value === undefined || value === null) return null
  if (isNaN(Number(value))) return `${label} harus berupa angka`
  return null
}

export function inRange(value, min, max, label = 'Nilai') {
  const num = Number(value)
  if (isNaN(num)) return null
  if (num < min || num > max) return `${label} harus antara ${min} dan ${max}`
  return null
}

export function isUppercaseNoSpace(value, label = 'Field ini') {
  if (!value) return null
  if (value !== value.toUpperCase()) return `${label} harus huruf kapital`
  if (/\s/.test(value)) return `${label} tidak boleh mengandung spasi`
  return null
}

export function validateDateFormat(value, label = 'Tanggal') {
  if (!value) return null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return `${label} harus berformat YYYY-MM-DD`
  return null
}

export function validateTimeFormat(value, label = 'Jam') {
  if (!value) return null
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return `${label} harus berformat HH:mm`
  return null
}

// Runs a list of [field, validators[]] pairs against a form object and
// returns an { field: message } error map (only for fields that failed).
export function runValidation(form, rules) {
  const errors = {}
  for (const [field, validators] of Object.entries(rules)) {
    for (const validator of validators) {
      const message = validator(form[field])
      if (message) {
        errors[field] = message
        break
      }
    }
  }
  return errors
}
