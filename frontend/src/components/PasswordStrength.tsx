interface Props { password: string }

function getStrength(p: string): { score: number; label: string; key: string } {
  if (!p) return { score: 0, label: '', key: '' }
  let score = 0
  if (p.length >= 8) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  const map = ['', 'weak', 'fair', 'good', 'strong'] as const
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  return { score, label: labels[score], key: map[score] }
}

export default function PasswordStrength({ password }: Props) {
  const { score, label, key } = getStrength(password)
  if (!password) return null

  return (
    <div>
      <div className="strength-bar-wrap">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className={`strength-bar-seg${i <= score ? ` ${key}` : ''}`}
          />
        ))}
      </div>
      <span className={`strength-label ${key}`}>{label} password</span>
    </div>
  )
}
