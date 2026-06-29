import { Daisy, Rose, Tulip, Wildflower, Bud, Leaf } from './Flowers'

export function BotanicalLeft() {
  return (
    <svg width="220" height="420" viewBox="0 0 220 420" fill="none"
      className="absolute left-0 top-0 pointer-events-none select-none opacity-60">
      <Leaf x1={60} y1={380} x2={20} y2={260} opacity={0.25} />
      <Leaf x1={80} y1={340} x2={30} y2={200} flip opacity={0.2} />
      <Daisy  cx={50}  cy={300} r={28} rotate={15}  opacity={0.7} />
      <Rose   cx={90}  cy={240} r={24} rotate={-20} opacity={0.65} />
      <Tulip  cx={40}  cy={180} r={20} rotate={10}  opacity={0.6} />
      <Wildflower cx={100} cy={160} r={18} rotate={30} opacity={0.5} />
      <Bud    cx={70}  cy={120} r={12} rotate={-10} opacity={0.55} />
      <Daisy  cx={30}  cy={80}  r={16} rotate={45}  opacity={0.4} />
    </svg>
  )
}

export function BotanicalRight() {
  return (
    <svg width="220" height="420" viewBox="0 0 220 420" fill="none"
      className="absolute right-0 top-0 pointer-events-none select-none opacity-60">
      <Leaf x1={160} y1={380} x2={200} y2={260} flip opacity={0.25} />
      <Leaf x1={140} y1={340} x2={190} y2={200} opacity={0.2} />
      <Daisy  cx={170} cy={300} r={28} rotate={-15} opacity={0.7} />
      <Rose   cx={130} cy={240} r={24} rotate={20}  opacity={0.65} />
      <Tulip  cx={180} cy={180} r={20} rotate={-10} opacity={0.6} />
      <Wildflower cx={120} cy={160} r={18} rotate={-30} opacity={0.5} />
      <Bud    cx={150} cy={120} r={12} rotate={10}  opacity={0.55} />
      <Daisy  cx={190} cy={80}  r={16} rotate={-45} opacity={0.4} />
    </svg>
  )
}

export function GardenDivider() {
  return (
    <div className="flex items-center justify-center gap-4 py-8 opacity-40">
      <div className="h-px flex-1 max-w-32 bg-[#d4cfc4]" />
      <svg width="80" height="30" viewBox="0 0 80 30">
        <Daisy cx={15} cy={15} r={12} rotate={20} opacity={0.8} />
        <Wildflower cx={40} cy={15} r={10} rotate={0} opacity={0.8} />
        <Daisy cx={65} cy={15} r={12} rotate={-20} opacity={0.8} />
      </svg>
      <div className="h-px flex-1 max-w-32 bg-[#d4cfc4]" />
    </div>
  )
}

export function CornerSprig({ flip = false }: { flip?: boolean }) {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none"
      className="opacity-30 pointer-events-none select-none"
      style={{ transform: flip ? 'scaleX(-1)' : undefined }}>
      <Leaf x1={10} y1={70} x2={40} y2={20} opacity={0.5} />
      <Bud cx={40} cy={20} r={8} opacity={0.7} />
      <Daisy cx={20} cy={50} r={10} rotate={30} opacity={0.6} />
    </svg>
  )
}

// ── Petal rain ──────────────────────────────────────────────────────
const PETALS = [
  [8,  'petal-1',  7, 0,    10,  20],
  [15, 'petal-2',  9, 1.5,   8, -30],
  [22, 'petal-3', 11, 0.5,  12,  45],
  [30, 'petal-1',  8, 3,     9, -15],
  [38, 'petal-2', 10, 0.8,   7,  60],
  [47, 'petal-3',  7, 2.2,  11, -45],
  [55, 'petal-1',  9, 1,     8,  30],
  [63, 'petal-2', 12, 3.5,  10, -20],
  [70, 'petal-3',  8, 0.3,   9,  50],
  [78, 'petal-1', 10, 2,     7, -60],
  [85, 'petal-2',  7, 1.2,  12,  15],
  [92, 'petal-3',  9, 4,     8, -35],
] as const

export function PetalRain() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {PETALS.map(([left, cls, dur, delay, size, rot], i) => (
        <div
          key={i}
          className={cls}
          style={{
            position: 'absolute',
            left: `${left}%`,
            top: '-20px',
            width: size,
            height: size,
            '--dur': `${dur}s`,
            '--delay': `${delay}s`,
          } as React.CSSProperties}
        >
          <svg width={size} height={size} viewBox="0 0 10 10">
            <ellipse cx="5" cy="5" rx="4" ry="2.5"
              fill="#d4cfc4" opacity="0.7"
              transform={`rotate(${rot} 5 5)`} />
          </svg>
        </div>
      ))}
    </div>
  )
}
