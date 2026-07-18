/** Lightweight confetti burst for achievement unlocks — no external deps. */
export function celebrateAchievement(label: string) {
  if (typeof document === 'undefined') return
  const root = document.createElement('div')
  root.setAttribute('aria-hidden', 'true')
  root.style.cssText =
    'pointer-events:none;position:fixed;inset:0;z-index:9999;overflow:hidden;'
  document.body.appendChild(root)

  const colors = ['#4F46E5', '#7C3AED', '#06B6D4', '#10B981', '#F59E0B']
  for (let i = 0; i < 36; i++) {
    const bit = document.createElement('span')
    const x = Math.random() * 100
    const delay = Math.random() * 0.3
    const dur = 0.9 + Math.random() * 0.8
    bit.style.cssText = `
      position:absolute;left:${x}%;top:-10px;width:8px;height:8px;border-radius:2px;
      background:${colors[i % colors.length]};
      animation:cgps-confetti ${dur}s ease-out ${delay}s forwards;
    `
    root.appendChild(bit)
  }

  if (!document.getElementById('cgps-confetti-style')) {
    const style = document.createElement('style')
    style.id = 'cgps-confetti-style'
    style.textContent = `
      @keyframes cgps-confetti {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
      }
    `
    document.head.appendChild(style)
  }

  // Toast-like label
  const badge = document.createElement('div')
  badge.textContent = `Achievement unlocked: ${label}`
  badge.style.cssText = `
    position:fixed;left:50%;top:24px;transform:translateX(-50%);
    background:rgba(14,14,22,0.92);color:#fff;padding:10px 16px;border-radius:12px;
    border:1px solid rgba(79,70,229,0.5);font:600 13px Inter,system-ui;z-index:10000;
  `
  document.body.appendChild(badge)

  setTimeout(() => {
    root.remove()
    badge.remove()
  }, 2200)
}
