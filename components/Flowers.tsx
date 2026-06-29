export function Daisy({ cx = 0, cy = 0, r = 22, rotate = 0, opacity = 1 }: {
  cx?: number; cy?: number; r?: number; rotate?: number; opacity?: number
}) {
  const petals = [
    "M0,-1 C3,-8 8,-14 0,-18 C-8,-14 -3,-8 0,-1",
    "M1,-1 C8,-5 14,-8 12,-16 C5,-12 3,-6 1,-1",
    "M1,0 C8,3 14,6 16,0 C12,-6 6,-4 1,0",
    "M1,1 C8,5 12,12 6,16 C0,12 0,6 1,1",
    "M0,1 C3,8 2,15 -4,16 C-8,10 -4,5 0,1",
    "M-1,1 C-8,5 -14,8 -14,2 C-10,-4 -5,-1 -1,1",
    "M-1,0 C-8,-3 -14,-6 -12,-14 C-5,-10 -3,-4 -1,0",
    "M-1,-1 C-8,-5 -10,-12 -4,-16 C0,-12 0,-5 -1,-1",
  ]
  return (
    <g transform={`translate(${cx},${cy}) rotate(${rotate}) scale(${r / 22})`} opacity={opacity}>
      {petals.map((d, i) => (
        <path key={i} d={d} fill="#e8e4da" stroke="#d4cfc4" strokeWidth="0.3" />
      ))}
      <circle r="4" fill="#d4cfc4" />
    </g>
  )
}

export function Rose({ cx = 0, cy = 0, r = 20, rotate = 0, opacity = 1 }: {
  cx?: number; cy?: number; r?: number; rotate?: number; opacity?: number
}) {
  return (
    <g transform={`translate(${cx},${cy}) rotate(${rotate}) scale(${r / 20})`} opacity={opacity}>
      <path d="M0,-18 C6,-12 12,-8 10,0 C8,8 2,10 0,10 C-2,10 -8,8 -10,0 C-12,-8 -6,-12 0,-18" fill="#e8e4da" stroke="#d4cfc4" strokeWidth="0.4" />
      <path d="M0,-10 C4,-6 7,-2 5,4 C3,8 0,9 0,9 C0,9 -3,8 -5,4 C-7,-2 -4,-6 0,-10" fill="#d4cfc4" />
      <circle r="3" fill="#c8c3b8" />
    </g>
  )
}

export function Tulip({ cx = 0, cy = 0, r = 18, rotate = 0, opacity = 1 }: {
  cx?: number; cy?: number; r?: number; rotate?: number; opacity?: number
}) {
  return (
    <g transform={`translate(${cx},${cy}) rotate(${rotate}) scale(${r / 18})`} opacity={opacity}>
      <path d="M-8,0 C-10,-8 -6,-16 0,-18 C6,-16 10,-8 8,0 Z" fill="#e8e4da" stroke="#d4cfc4" strokeWidth="0.4" />
      <path d="M-4,2 C-2,-6 2,-6 4,2 Z" fill="#d4cfc4" />
      <path d="M0,0 C0,6 -2,14 -2,18" stroke="#c8c3b8" strokeWidth="1.5" fill="none" />
    </g>
  )
}

export function Wildflower({ cx = 0, cy = 0, r = 16, rotate = 0, opacity = 1 }: {
  cx?: number; cy?: number; r?: number; rotate?: number; opacity?: number
}) {
  const angles = [0, 72, 144, 216, 288]
  return (
    <g transform={`translate(${cx},${cy}) rotate(${rotate}) scale(${r / 16})`} opacity={opacity}>
      {angles.map((a, i) => {
        const rad = (a * Math.PI) / 180
        const x = Math.sin(rad) * 14
        const y = -Math.cos(rad) * 14
        const cx1 = Math.sin(rad - 0.3) * 8
        const cy1 = -Math.cos(rad - 0.3) * 8
        const cx2 = Math.sin(rad + 0.3) * 8
        const cy2 = -Math.cos(rad + 0.3) * 8
        return <path key={i} d={`M0,0 C${cx1},${cy1} ${cx2},${cy2} ${x},${y}`} fill="none" stroke="#d4cfc4" strokeWidth="1.5" />
      })}
      <circle r="3.5" fill="#e8e4da" stroke="#d4cfc4" strokeWidth="0.5" />
    </g>
  )
}

export function Bud({ cx = 0, cy = 0, r = 10, rotate = 0, opacity = 1 }: {
  cx?: number; cy?: number; r?: number; rotate?: number; opacity?: number
}) {
  return (
    <g transform={`translate(${cx},${cy}) rotate(${rotate}) scale(${r / 10})`} opacity={opacity}>
      <path d="M0,-10 C4,-6 4,0 0,2 C-4,0 -4,-6 0,-10" fill="#e8e4da" stroke="#d4cfc4" strokeWidth="0.4" />
      <path d="M0,2 C0,6 -1,10 -1,10" stroke="#c8c3b8" strokeWidth="1.2" fill="none" />
    </g>
  )
}

export function Leaf({ x1 = 0, y1 = 0, x2 = 0, y2 = 0, flip = false, opacity = 0.3 }: {
  x1?: number; y1?: number; x2?: number; y2?: number; flip?: boolean; opacity?: number
}) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2
  const dx = x2 - x1, dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy)
  const nx = -dy / len * 18 * (flip ? -1 : 1)
  const ny = dx / len * 18 * (flip ? -1 : 1)
  return (
    <path
      d={`M${x1},${y1} Q${mx + nx},${my + ny} ${x2},${y2}`}
      fill="none" stroke="#c8c3b8" strokeWidth="1.5" opacity={opacity}
    />
  )
}
