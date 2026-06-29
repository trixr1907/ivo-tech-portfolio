import { useEffect, useRef, useState, useCallback } from 'react'
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Zap,
  ShieldCheck,
  BarChart2,
  Layers,
  Eye,
  Mail,
  Clock,
  Target,
  AlertTriangle,
} from 'lucide-react'
import './market-data-showcase.css'

// ── Types ────────────────────────────────────────────────────
interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
}

interface MarketData {
  symbol: string
  price: number
  change24h: number
  high24h: number
  low24h: number
  volume24h: number
  candles: Candle[]
}

interface SignalMetrics {
  bullScore: number
  bearScore: number
  trend: 'bullish' | 'bearish' | 'neutral'
  adx: number
  rsi: number
  volatility: number
  atr: number
  lastSignal: 'long' | 'short' | 'none'
  confidence: number
  macdBull: boolean
  obv: number
  ema21: number
  ema55: number
  ema89: number
  wt1: number[]
  wt2: number[]
}

// ── Coin Config ──────────────────────────────────────────────
interface CoinConfig {
  symbol: string
  label: string
  base: string
  decimals: number
}

const COINS: CoinConfig[] = [
  { symbol: 'BTCUSDT', label: 'BTC', base: 'Bitcoin',  decimals: 0 },
  { symbol: 'ETHUSDT', label: 'ETH', base: 'Ethereum', decimals: 2 },
  { symbol: 'SOLUSDT', label: 'SOL', base: 'Solana',   decimals: 2 },
  { symbol: 'BNBUSDT', label: 'BNB', base: 'BNB Chain',decimals: 2 },
  { symbol: 'XRPUSDT', label: 'XRP', base: 'XRP',      decimals: 4 },
]

// ── Constants ────────────────────────────────────────────────
const BINANCE_BASE = 'https://api.binance.com'
const CANDLE_LIMIT = 80
const REFRESH_MS = 15000
const CANDLE_REFRESH_MS = 60000

// ── Math helpers ─────────────────────────────────────────────
function calcEma(data: number[], period: number): number {
  if (data.length < period) return data[data.length - 1] ?? 0
  const k = 2 / (period + 1)
  let result = data.slice(0, period).reduce((a, b) => a + b, 0) / period
  for (let i = period; i < data.length; i++) result = data[i] * k + result * (1 - k)
  return result
}

function calcEmaArr(data: number[], period: number): number[] {
  const out: number[] = new Array(data.length).fill(0)
  if (data.length < period) return out
  const k = 2 / (period + 1)
  out[period - 1] = data.slice(0, period).reduce((a, b) => a + b, 0) / period
  for (let i = period; i < data.length; i++) out[i] = data[i] * k + out[i - 1] * (1 - k)
  return out
}

function calcSma(data: number[], period: number): number[] {
  const out: number[] = new Array(data.length).fill(0)
  for (let i = period - 1; i < data.length; i++) {
    out[i] = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period
  }
  return out
}

// WaveTrend — klassische WT1/WT2 Implementierung
function calcWaveTrend(candles: Candle[], n1 = 10, n2 = 21): { wt1: number[]; wt2: number[] } {
  const hlc3 = candles.map((c) => (c.high + c.low + c.close) / 3)
  const esa = calcEmaArr(hlc3, n1)
  const dArr = hlc3.map((v, i) => Math.abs(v - esa[i]))
  const de = calcEmaArr(dArr, n1)
  const ci = hlc3.map((v, i) => (de[i] !== 0 ? (v - esa[i]) / (0.015 * de[i]) : 0))
  const wt1 = calcEmaArr(ci, n2)
  const wt2 = calcSma(wt1, 4)
  return { wt1, wt2 }
}

// ── Main metrics calculation ─────────────────────────────────
function calculateMetrics(candles: Candle[], price: number): SignalMetrics {
  const empty: SignalMetrics = {
    bullScore: 0, bearScore: 0, trend: 'neutral', adx: 0, rsi: 50,
    volatility: 0, atr: 0, lastSignal: 'none', confidence: 0,
    macdBull: false, obv: 0, ema21: price, ema55: price, ema89: price,
    wt1: [], wt2: [],
  }
  if (candles.length < 30) return empty

  const closes = candles.map((c) => c.close)
  const ema21 = calcEma(closes, 21)
  const ema55 = calcEma(closes, 55)
  const ema89 = calcEma(closes, 89)
  const trend: SignalMetrics['trend'] =
    price > ema21 && ema21 > ema55 ? 'bullish'
    : price < ema21 && ema21 < ema55 ? 'bearish'
    : 'neutral'

  // RSI 14
  let gains = 0, losses = 0
  for (let i = closes.length - 14; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1]
    if (d > 0) gains += d; else losses -= d
  }
  const rs = losses === 0 ? 100 : gains / losses
  const rsi = 100 - 100 / (1 + rs)

  // ATR 14
  let trSum = 0
  for (let i = candles.length - 14; i < candles.length; i++) {
    const c = candles[i], p = candles[i - 1]
    trSum += Math.max(c.high - c.low, Math.abs(c.high - p.close), Math.abs(c.low - p.close))
  }
  const atr = trSum / 14

  // Volatility
  const returns = closes.slice(-30).map((v, i, a) => i > 0 ? (v - a[i - 1]) / a[i - 1] : 0).slice(1)
  const meanR = returns.reduce((a, b) => a + b, 0) / returns.length
  const volatility = Math.sqrt(returns.reduce((a, b) => a + (b - meanR) ** 2, 0) / returns.length) * 100

  // ADX
  let plusDM = 0, minusDM = 0, tr14 = 0
  for (let i = candles.length - 14; i < candles.length; i++) {
    const c = candles[i], p = candles[i - 1]
    const up = c.high - p.high, dn = p.low - c.low
    if (up > dn && up > 0) plusDM += up
    if (dn > up && dn > 0) minusDM += dn
    tr14 += Math.max(c.high - c.low, Math.abs(c.high - p.close), Math.abs(c.low - p.close))
  }
  const pDI = tr14 > 0 ? (plusDM / tr14) * 100 : 0
  const mDI = tr14 > 0 ? (minusDM / tr14) * 100 : 0
  const adx = Math.min(100, pDI + mDI > 0 ? (Math.abs(pDI - mDI) / (pDI + mDI)) * 100 : 0)

  // MACD
  const ema12 = calcEma(closes, 12)
  const ema26 = calcEma(closes, 26)
  const macdBull = ema12 > ema26

  // OBV direction (simplified)
  let obv = 0
  for (let i = 1; i < candles.length; i++) {
    const c = candles[i], p = candles[i - 1]
    const vol = c.close - c.open
    if (c.close > p.close) obv += Math.abs(vol)
    else if (c.close < p.close) obv -= Math.abs(vol)
  }

  // WaveTrend
  const { wt1, wt2 } = calcWaveTrend(candles)

  // Scoring — angelehnt an Master-Logik
  let bull = 50, bear = 50

  // Trend (40 pts)
  if (trend === 'bullish') { bull += 25; bear -= 25 }
  else if (trend === 'bearish') { bear += 25; bull -= 25 }
  if (adx > 25) { if (trend === 'bullish') bull += 10; else if (trend === 'bearish') bear += 10 }

  // RSI (15 pts)
  if (rsi < 30) { bull += 15; bear -= 10 }
  else if (rsi > 70) { bear += 15; bull -= 10 }
  else if (rsi > 55) { bull += 5; bear -= 5 }
  else if (rsi < 45) { bear += 5; bull -= 5 }

  // MACD (10 pts)
  if (macdBull) { bull += 8; bear -= 8 }
  else { bear += 8; bull -= 8 }

  // WaveTrend (10 pts)
  const wtLast = wt1.length - 1
  if (wt1[wtLast] < -60) { bull += 10; bear -= 5 }
  else if (wt1[wtLast] > 60) { bear += 10; bull -= 5 }

  // OBV (5 pts)
  if (obv > 0 && trend === 'bullish') bull += 5
  else if (obv < 0 && trend === 'bearish') bear += 5

  bull = Math.max(0, Math.min(100, Math.round(bull)))
  bear = Math.max(0, Math.min(100, Math.round(bear)))
  const lastSignal: SignalMetrics['lastSignal'] = bull > 75 ? 'long' : bear > 75 ? 'short' : 'none'
  const confidence = Math.max(bull, bear)

  return {
    bullScore: bull, bearScore: bear, trend, adx: Math.round(adx),
    rsi: Math.round(rsi), volatility: Math.round(volatility * 100) / 100,
    atr: Math.round(atr * 100) / 100, lastSignal, confidence,
    macdBull, obv: Math.round(obv), ema21, ema55, ema89,
    wt1: wt1.slice(-48), wt2: wt2.slice(-48),
  }
}

// ── Radial Score Gauge (SVG Arc) ─────────────────────────────
function RadialGauge({ value, label, color }: { value: number; label: string; color: string }) {
  const r = 46
  const cx = 60, cy = 60
  const strokeW = 7
  // Arc: 220° sweep, starting from -200deg (bottom-left)
  const startAngle = -220
  const sweepDeg = 260
  const pct = value / 100
  const fillDeg = sweepDeg * pct

  function polarToXY(angleDeg: number, radius: number) {
    const rad = (angleDeg - 90) * (Math.PI / 180)
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) }
  }

  function arc(startDeg: number, endDeg: number) {
    const s = polarToXY(startDeg, r)
    const e = polarToXY(endDeg, r)
    const large = endDeg - startDeg > 180 ? 1 : 0
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`
  }

  const trackPath = arc(startAngle, startAngle + sweepDeg)
  const fillPath = value > 0 ? arc(startAngle, startAngle + fillDeg) : ''

  const statusText = value >= 75 ? 'Aktiv' : value >= 55 ? 'Aufbau' : 'Schwach'
  const statusColor = value >= 75 ? '#00C88C' : value >= 55 ? '#FFC828' : 'rgba(220,230,242,0.35)'

  return (
    <div className="cis-gauge-wrap">
      <svg viewBox="0 0 120 110" width="120" height="110" aria-label={`${label}: ${value} von 100`}>
        {/* Track */}
        <path d={trackPath} fill="none" stroke="rgba(220,230,242,0.07)" strokeWidth={strokeW} strokeLinecap="round" />
        {/* Fill */}
        {fillPath && (
          <path d={fillPath} fill="none" stroke={color} strokeWidth={strokeW} strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color}88)` }} />
        )}
        {/* Center value */}
        <text x={cx} y={cy - 4} textAnchor="middle" fill="rgba(220,230,242,0.92)"
          fontSize={22} fontWeight={700} fontFamily="var(--font-display)">{value}</text>
        <text x={cx} y={cy + 13} textAnchor="middle" fill="rgba(220,230,242,0.35)"
          fontSize={9} fontFamily="var(--font-body)">/100</text>
      </svg>
      <div className="cis-gauge-label">{label}</div>
      <div className="cis-gauge-status" style={{ color: statusColor }}>{statusText}</div>
    </div>
  )
}

// ── Candlestick Chart with Hover Tooltip ─────────────────────
function CandlestickChart({ candles, ema21, ema55, ema89, coin }: {
  candles: Candle[]
  ema21: number
  ema55: number
  ema89: number
  coin: CoinConfig
}) {
  const [hover, setHover] = useState<{ candle: Candle; x: number; y: number } | null>(null)

  if (candles.length < 2) {
    return (
      <div style={{ height: 340, display: 'grid', placeItems: 'center', color: 'rgba(220,230,242,0.35)', fontSize: '0.85rem' }}>
        Verbinde mit Binance API…
      </div>
    )
  }
  const display = candles.slice(-60)
  const w = 800, h = 340
  const pad = { top: 16, right: 64, bottom: 28, left: 8 }
  const chartW = w - pad.left - pad.right
  const chartH = h - pad.top - pad.bottom

  const allPrices = display.flatMap((c) => [c.high, c.low])
  const min = Math.min(...allPrices)
  const max = Math.max(...allPrices)
  const range = max - min || 1
  const pad5 = range * 0.05

  const scaleY = (v: number) => pad.top + chartH - ((v - (min - pad5)) / (range + pad5 * 2)) * chartH
  const barW = Math.max(2, (chartW / display.length) * 0.65)
  const gap = chartW / display.length

  const gridLines = 5
  const gridYs = Array.from({ length: gridLines }, (_, i) => {
    const pct = i / (gridLines - 1)
    const price = min - pad5 + (range + pad5 * 2) * (1 - pct)
    return { y: pad.top + chartH * pct, price }
  })

  const lastClose = display[display.length - 1]?.close ?? 0
  const priceChange = display.length > 1 ? lastClose - display[display.length - 2].close : 0
  const priceColor = priceChange >= 0 ? '#00C88C' : '#FF4141'

  const emaY21 = scaleY(ema21)
  const emaY55 = scaleY(ema55)
  const emaY89 = scaleY(ema89)

  const lastTime = display[display.length - 1]?.time
  const timeLabel = lastTime ? new Date(lastTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : ''
  const dateLabel = lastTime ? new Date(lastTime).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }) : ''

  const fmt = (v: number) => v >= 1000
    ? `$${v.toLocaleString('en-US', { minimumFractionDigits: coin.decimals, maximumFractionDigits: coin.decimals })}`
    : `$${v.toFixed(coin.decimals)}`

  return (
    <div style={{ position: 'relative' }}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width="100%"
        height={h}
        style={{ display: 'block', cursor: 'crosshair' }}
        aria-label={`${coin.label}/USDT Candlestick Chart`}
        onMouseLeave={() => setHover(null)}
      >
        {/* Background grid */}
        {gridYs.map((g, i) => (
          <g key={i}>
            <line x1={pad.left} y1={g.y} x2={w - pad.right} y2={g.y}
              stroke="rgba(220,230,242,0.05)" strokeWidth={0.5} />
            <text x={w - pad.right + 4} y={g.y + 4}
              fill="rgba(220,230,242,0.28)" fontSize={9} fontFamily="var(--font-body)" textAnchor="start">
              {fmt(g.price)}
            </text>
          </g>
        ))}

        {/* EMA lines */}
        <line x1={pad.left} y1={emaY21} x2={w - pad.right} y2={emaY21}
          stroke="rgba(0,200,140,0.35)" strokeWidth={1} strokeDasharray="4 3" />
        <line x1={pad.left} y1={emaY55} x2={w - pad.right} y2={emaY55}
          stroke="rgba(255,200,40,0.3)" strokeWidth={1} strokeDasharray="4 3" />
        <line x1={pad.left} y1={emaY89} x2={w - pad.right} y2={emaY89}
          stroke="rgba(255,65,65,0.25)" strokeWidth={1} strokeDasharray="4 3" />

        {/* EMA labels */}
        <text x={pad.left + 4} y={emaY21 - 4} fill="rgba(0,200,140,0.6)" fontSize={8} fontFamily="var(--font-body)">EMA 21</text>
        <text x={pad.left + 4} y={emaY55 - 4} fill="rgba(255,200,40,0.55)" fontSize={8} fontFamily="var(--font-body)">EMA 55</text>
        <text x={pad.left + 4} y={emaY89 - 4} fill="rgba(255,65,65,0.5)" fontSize={8} fontFamily="var(--font-body)">EMA 89</text>

        {/* Candles + hover zones */}
        {display.map((c, i) => {
          const x = pad.left + i * gap + gap / 2
          const isUp = c.close >= c.open
          const color = isUp ? '#00C88C' : '#FF4141'
          const bodyH = Math.max(1, Math.abs(scaleY(c.open) - scaleY(c.close)))
          const bodyY = isUp ? scaleY(c.close) : scaleY(c.open)
          const isHovered = hover?.candle.time === c.time
          return (
            <g key={c.time}
              onMouseEnter={(e) => {
                const svgEl = (e.currentTarget as SVGGElement).closest('svg') as SVGSVGElement | null
                const rect = svgEl?.getBoundingClientRect()
                if (rect) setHover({ candle: c, x: rect.left + (x / w) * rect.width, y: rect.top })
              }}
              style={{ cursor: 'crosshair' }}
            >
              {/* Hover highlight zone */}
              <rect x={x - gap / 2} y={pad.top} width={gap} height={chartH}
                fill={isHovered ? 'rgba(0,183,255,0.04)' : 'transparent'} />
              <line x1={x} y1={scaleY(c.high)} x2={x} y2={scaleY(c.low)}
                stroke={color} strokeWidth={isHovered ? 1.2 : 0.8} opacity={isHovered ? 0.9 : 0.65} />
              <rect x={x - barW / 2} y={bodyY} width={barW} height={bodyH}
                fill={color} rx={0.5} opacity={isUp ? (isHovered ? 0.95 : 0.82) : (isHovered ? 0.9 : 0.75)} />
            </g>
          )
        })}

        {/* Current price line */}
        <line x1={pad.left} y1={scaleY(lastClose)} x2={w - pad.right} y2={scaleY(lastClose)}
          stroke={priceColor} strokeWidth={0.6} strokeDasharray="3 3" opacity={0.55} />
        <rect x={w - pad.right + 2} y={scaleY(lastClose) - 9} width={58} height={14}
          fill={priceColor} opacity={0.15} rx={2} />
        <text x={w - pad.right + 6} y={scaleY(lastClose) + 3}
          fill={priceColor} fontSize={9} fontFamily="var(--font-body)" fontWeight={700}>
          {fmt(lastClose)}
        </text>

        {/* Timestamp */}
        <text x={pad.left + 4} y={h - 6} fill="rgba(220,230,242,0.22)" fontSize={9} fontFamily="var(--font-body)">
          {coin.label}/USDT · 1H · {dateLabel} {timeLabel} · Binance
        </text>
      </svg>

      {/* Hover Tooltip */}
      {hover && (
        <div className="cis-candle-tooltip" style={{ left: Math.min(hover.x + 12, window.innerWidth - 180) }}>
          <div className="cis-tooltip-time">
            {new Date(hover.candle.time).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="cis-tooltip-row"><span>O</span><span>{fmt(hover.candle.open)}</span></div>
          <div className="cis-tooltip-row"><span>H</span><span style={{ color: '#00C88C' }}>{fmt(hover.candle.high)}</span></div>
          <div className="cis-tooltip-row"><span>L</span><span style={{ color: '#FF4141' }}>{fmt(hover.candle.low)}</span></div>
          <div className="cis-tooltip-row"><span>C</span><span style={{ color: hover.candle.close >= hover.candle.open ? '#00C88C' : '#FF4141' }}>{fmt(hover.candle.close)}</span></div>
        </div>
      )}
    </div>
  )
}

// ── WaveTrend Mini Chart ─────────────────────────────────────
function WaveTrendChart({ wt1, wt2 }: { wt1: number[]; wt2: number[] }) {
  if (wt1.length < 4) return null
  const w = 800, h = 110
  const pad = { top: 12, right: 56, bottom: 20, left: 8 }
  const chartW = w - pad.left - pad.right
  const chartH = h - pad.top - pad.bottom

  const allVals = [...wt1, ...wt2]
  const minV = Math.min(-100, ...allVals)
  const maxV = Math.max(100, ...allVals)
  const range = maxV - minV || 1
  const scaleY = (v: number) => pad.top + chartH - ((v - minV) / range) * chartH
  const gap = chartW / (wt1.length - 1)

  const zeroY = scaleY(0)
  const ob60Y = scaleY(60)
  const os60Y = scaleY(-60)

  const wt1Path = wt1.map((v, i) => `${i === 0 ? 'M' : 'L'}${pad.left + i * gap},${scaleY(v)}`).join(' ')
  const wt2Path = wt2.map((v, i) => `${i === 0 ? 'M' : 'L'}${pad.left + i * gap},${scaleY(v)}`).join(' ')

  const lastWT1 = wt1[wt1.length - 1]
  const lastWT2 = wt2[wt2.length - 1]

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} style={{ display: 'block' }} aria-label="WaveTrend Oszillator">
      {/* OB/OS Zonen */}
      <rect x={pad.left} y={pad.top} width={chartW} height={ob60Y - pad.top}
        fill="rgba(255,65,65,0.04)" />
      <rect x={pad.left} y={os60Y} width={chartW} height={pad.top + chartH - os60Y}
        fill="rgba(0,200,140,0.04)" />

      {/* Referenzlinien */}
      <line x1={pad.left} y1={zeroY} x2={w - pad.right} y2={zeroY}
        stroke="rgba(220,230,242,0.1)" strokeWidth={0.5} />
      <line x1={pad.left} y1={ob60Y} x2={w - pad.right} y2={ob60Y}
        stroke="rgba(255,65,65,0.2)" strokeWidth={0.5} strokeDasharray="3 3" />
      <line x1={pad.left} y1={os60Y} x2={w - pad.right} y2={os60Y}
        stroke="rgba(0,200,140,0.2)" strokeWidth={0.5} strokeDasharray="3 3" />

      {/* Labels */}
      <text x={w - pad.right + 4} y={ob60Y + 4} fill="rgba(255,65,65,0.45)" fontSize={8} fontFamily="var(--font-body)">OB</text>
      <text x={w - pad.right + 4} y={os60Y + 4} fill="rgba(0,200,140,0.45)" fontSize={8} fontFamily="var(--font-body)">OS</text>
      <text x={w - pad.right + 4} y={zeroY + 4} fill="rgba(220,230,242,0.25)" fontSize={8} fontFamily="var(--font-body)">0</text>

      {/* WT1 */}
      <path d={wt1Path} fill="none" stroke="rgba(0,183,255,0.7)" strokeWidth={1.2} />
      {/* WT2 */}
      <path d={wt2Path} fill="none" stroke="rgba(123,231,255,0.4)" strokeWidth={0.8} />

      {/* Current values */}
      <text x={pad.left + 4} y={h - 6} fill="rgba(220,230,242,0.22)" fontSize={9} fontFamily="var(--font-body)">
        WaveTrend Oszillator · WT1: {lastWT1.toFixed(1)} · WT2: {lastWT2.toFixed(1)}
      </text>
      <circle cx={w - pad.right - 2} cy={scaleY(lastWT1)} r={3}
        fill={lastWT1 > 0 ? '#00C88C' : '#FF4141'} opacity={0.8} />
    </svg>
  )
}

// ── Metric Card ──────────────────────────────────────────────
function MetricCard({ label, value, unit, color, sub }: {
  label: string; value: string | number; unit?: string; color?: string; sub?: string
}) {
  return (
    <div className="cis-metric" style={color ? { borderColor: `${color}28` } : undefined}>
      <span className="cis-metric-label">{label}</span>
      <span className="cis-metric-value" style={color ? { color } : undefined}>
        {value}{unit ? <span className="cis-metric-unit">{unit}</span> : null}
      </span>
      {sub ? <span className="cis-metric-sub">{sub}</span> : null}
    </div>
  )
}

// ── Signal Components data ───────────────────────────────────
const SIGNAL_COMPONENTS = [
  { icon: TrendingUp,  label: 'Trend-Engine',          weight: '40 Pkt',    desc: 'EMA-Cluster (21/55/89) + ADX-Stärke — bestimmt Trendrichtung und -qualität', color: '#00B7FF' },
  { icon: BarChart2,   label: 'Technische Indikatoren', weight: '30 Pkt',    desc: 'RSI (14), MACD und Bollinger Bands als Bestätigungsschicht', color: '#7BE7FF' },
  { icon: Layers,      label: 'Orderblocks & S/R',      weight: '30 Pkt',    desc: 'Automatische Erkennung von Unterstützungs-/Widerstandszonen und institutionellen Orderblöcken', color: '#00C88C' },
  { icon: Activity,    label: 'WaveTrend Momentum',     weight: '35%',       desc: 'Kernoszillator im Synergy Indicator — erkennt Überkauft/Überverkauft-Zustände', color: '#00B7FF' },
  { icon: Eye,         label: 'Chartmuster',            weight: '10 Pkt',    desc: 'Engulfing, Hammer, Shooting Star, Doji — Kerzenformationen als Signalverstärker', color: '#FFC828' },
  { icon: Target,      label: 'Divergenz-Detektor',     weight: '20%',       desc: 'Bullische/bärische Divergenzen zwischen Preis und Oszillator, confirmed-bar, kein Repaint', color: '#7BE7FF' },
  { icon: Zap,         label: 'Multi-Timeframe',        weight: '20 Pkt',    desc: 'HTF-Ausrichtung mit lookahead=off — höherer Timeframe bestätigt oder widerlegt das Signal', color: '#FFC828' },
  { icon: ShieldCheck, label: 'Risk-Engine',            weight: 'ATR-basiert', desc: 'ATR-basierte Stop-Loss/Take-Profit-Berechnung, Position Sizing und Live P&L-Tracking', color: '#00C88C' },
]

// ── Fallback Candles ─────────────────────────────────────────
function generateFallbackCandles(basePrice: number): Candle[] {
  const now = Date.now()
  const candles: Candle[] = []
  let price = basePrice * 0.95
  for (let i = 0; i < CANDLE_LIMIT; i++) {
    const vol = basePrice * 0.007
    const open = price
    const close = open + (Math.random() - 0.46) * vol
    const high = Math.max(open, close) + Math.random() * vol * 0.4
    const low  = Math.min(open, close) - Math.random() * vol * 0.4
    candles.push({ time: now - (CANDLE_LIMIT - i) * 3600000, open, high, low, close })
    price = close
  }
  return candles
}

// ── Main Component ───────────────────────────────────────────
export function MarketDataShowcase() {
  const [activeCoin, setActiveCoin] = useState<CoinConfig>(COINS[0])
  const [data, setData]             = useState<MarketData | null>(null)
  const [metrics, setMetrics]       = useState<SignalMetrics | null>(null)
  const [error, setError]           = useState<string | null>(null)
  const [loading, setLoading]       = useState(true)
  const [activeTab, setActiveTab]   = useState<'chart' | 'wavetrend'>('chart')
  const [switching, setSwitching]   = useState(false)
  const priceRef = useRef<number>(0)
  const t1Ref    = useRef<ReturnType<typeof setInterval> | null>(null)
  const t2Ref    = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchTicker = useCallback(async (coin: CoinConfig) => {
    try {
      const res = await fetch(`${BINANCE_BASE}/api/v3/ticker/24hr?symbol=${coin.symbol}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const ticker = await res.json() as {
        lastPrice: string; priceChangePercent: string
        highPrice: string; lowPrice: string; volume: string
      }
      const price = parseFloat(ticker.lastPrice)
      priceRef.current = price
      setData((prev) => ({
        symbol: coin.symbol, price,
        change24h:  parseFloat(ticker.priceChangePercent),
        high24h:    parseFloat(ticker.highPrice),
        low24h:     parseFloat(ticker.lowPrice),
        volume24h:  parseFloat(ticker.volume),
        candles: prev?.symbol === coin.symbol ? (prev?.candles ?? []) : [],
      }))
    } catch (e) { console.warn('Ticker fetch failed:', e) }
  }, [])

  const fetchCandles = useCallback(async (coin: CoinConfig) => {
    try {
      const res = await fetch(`${BINANCE_BASE}/api/v3/klines?symbol=${coin.symbol}&interval=1h&limit=${CANDLE_LIMIT}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const raw = await res.json() as (string | number)[][]
      const candles: Candle[] = raw.map((k) => ({
        time:  Number(k[0]),
        open:  parseFloat(k[1] as string),
        high:  parseFloat(k[2] as string),
        low:   parseFloat(k[3] as string),
        close: parseFloat(k[4] as string),
      }))
      const price = priceRef.current || candles[candles.length - 1]?.close || 0
      const m = calculateMetrics(candles, price)
      setData((prev) => ({
        symbol: coin.symbol, price,
        change24h: prev?.symbol === coin.symbol ? (prev?.change24h ?? 0) : 0,
        high24h:   prev?.symbol === coin.symbol ? (prev?.high24h ?? 0)   : 0,
        low24h:    prev?.symbol === coin.symbol ? (prev?.low24h ?? 0)    : 0,
        volume24h: prev?.symbol === coin.symbol ? (prev?.volume24h ?? 0) : 0,
        candles,
      }))
      setMetrics(m)
      setLoading(false)
      setSwitching(false)
      setError(null)
    } catch (e) {
      console.warn('Candle fetch failed:', e)
      setError('Binance API nicht erreichbar — Simulationsdaten.')
      setLoading(false)
      setSwitching(false)
    }
  }, [])

  // Start/restart polling when coin changes
  useEffect(() => {
    if (t1Ref.current) clearInterval(t1Ref.current)
    if (t2Ref.current) clearInterval(t2Ref.current)
    priceRef.current = 0
    queueMicrotask(() => {
      void fetchCandles(activeCoin)
      void fetchTicker(activeCoin)
    })
    t1Ref.current = setInterval(() => void fetchTicker(activeCoin), REFRESH_MS)
    t2Ref.current = setInterval(() => void fetchCandles(activeCoin), CANDLE_REFRESH_MS)
    return () => {
      if (t1Ref.current) clearInterval(t1Ref.current)
      if (t2Ref.current) clearInterval(t2Ref.current)
    }
  }, [activeCoin, fetchCandles, fetchTicker])

  function switchCoin(coin: CoinConfig) {
    if (coin.symbol === activeCoin.symbol) return
    setSwitching(true)
    setData(null)
    setMetrics(null)
    setError(null)
    setLoading(true)
    setActiveCoin(coin)
  }

  const isMock = !!error

  // Fallback
  const fallbackMetrics: SignalMetrics = {
    bullScore: 62, bearScore: 38, trend: 'bullish', adx: 28,
    rsi: 54, volatility: 1.82, atr: 845.32, lastSignal: 'none', confidence: 62,
    macdBull: true, obv: 4200, ema21: 87200, ema55: 85800, ema89: 84200,
    wt1: Array.from({ length: 48 }, (_, i) => Math.sin(i * 0.3) * 40),
    wt2: Array.from({ length: 48 }, (_, i) => Math.sin(i * 0.3 - 0.5) * 35),
  }
  const dm = metrics ?? fallbackMetrics
  const dd = data ?? {
    symbol: activeCoin.symbol, price: 87650.25, change24h: 2.34,
    high24h: 88900, low24h: 86100, volume24h: 28450,
    candles: generateFallbackCandles(87650),
  }

  const trendColor = dm.trend === 'bullish' ? '#00C88C' : dm.trend === 'bearish' ? '#FF4141' : 'rgba(220,230,242,0.45)'
  const scoreColor = (s: number) => s >= 70 ? '#00C88C' : s >= 50 ? '#FFC828' : 'rgba(220,230,242,0.45)'
  const displayCandles = dd.candles.length > 0 ? dd.candles : generateFallbackCandles(dd.price)

  return (
    <section id="crypto-indicators" className="section cis-section" aria-labelledby="cis-h">
      <div className="section-inner">

        {/* ── Header ── */}
        <div className="cis-head">
          <div>
            <span className="sec-label">Eigenes Projekt</span>
            <span className="sec-num">— 04</span>
          </div>
          <h2 id="cis-h">
            Realtime Market<br /><em>Data Interface</em>
          </h2>
          <p>
            Technische Case Study für Echtzeitdaten, Chart-UI und gewichtete Signallogik:
            Binance-Marktdaten werden geladen, normalisiert und als interaktives Dashboard
            visualisiert. Kein Finanzprodukt.
          </p>
        </div>

        {/* ── Origin Story ── */}
        <div className="cis-origin">
          <div className="cis-origin-text">
            <span className="cis-origin-label">Warum diese Case Study relevant ist</span>
            <h3>Viele Datenpunkte werden erst nützlich, wenn das Interface sie erklärt.</h3>
            <p>
              Das Projekt zeigt, wie ein Frontend rohe Marktdaten in eine lesbare Produktoberfläche übersetzt:
              Live-Fetching, Fallback-Daten, SVG-Charts, Score-Berechnung, responsive Tabs und klare Zustände
              für Loading, Simulation und aktive Signale.
            </p>
            <p>
              Die fachliche Domäne ist Marktanalyse, der eigentliche Showcase ist aber die UI-Architektur:
              mehrere technische Indikatoren laufen in einen gewichteten Score, ohne dass die Oberfläche
              Nutzer mit Rohdaten allein lässt.
            </p>
            <p>
              Wichtig war, die Demo nicht als Trading-Versprechen zu bauen, sondern als robuste Datenvisualisierung
              mit verständlicher Risiko-/Disclaimer-Schicht.
            </p>
          </div>
          <div className="cis-origin-meta">
            <div className="cis-origin-stat">
              <span className="cis-origin-stat-val">2</span>
              <span className="cis-origin-stat-label">Daten- und Signal-Layer</span>
            </div>
            <div className="cis-origin-stat">
              <span className="cis-origin-stat-val">8</span>
              <span className="cis-origin-stat-label">Signal-Komponenten</span>
            </div>
            <div className="cis-origin-stat">
              <span className="cis-origin-stat-val">0</span>
              <span className="cis-origin-stat-label">Future-Lookahead in der Demo-Logik</span>
            </div>
            <div className="cis-origin-stat">
              <span className="cis-origin-stat-val">∞</span>
              <span className="cis-origin-stat-label">Responsive UI-Zustände</span>
            </div>
          </div>
        </div>

        {/* ── Coin Switcher ── */}
        <div className="cis-coin-switcher">
          <span className="cis-coin-switcher-label">Datensatz wählen:</span>
          <div className="cis-coin-pills">
            {COINS.map((coin) => (
              <button
                key={coin.symbol}
                className={`cis-coin-pill ${activeCoin.symbol === coin.symbol ? 'active' : ''}`}
                onClick={() => switchCoin(coin)}
                aria-description={`${coin.label} ${coin.base} wählen`}
                disabled={switching}
              >
                <span className="cis-coin-pill-label">{coin.label}</span>
                <span className="cis-coin-pill-base">{coin.base}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Live Ticker ── */}
        <div className={`cis-ticker ${switching ? 'cis-ticker-switching' : ''}`}>
          <span className="cis-ticker-symbol">
            <Activity size={14} style={{ color: 'var(--cyan)' }} />
            {activeCoin.label}/USDT
          </span>
          {switching ? (
            <span className="cis-ticker-loading">Lade {activeCoin.base} Daten…</span>
          ) : (
            <>
              <span className="cis-ticker-price">
                {dd.price >= 1
                  ? `$${dd.price.toLocaleString('en-US', { minimumFractionDigits: activeCoin.decimals, maximumFractionDigits: activeCoin.decimals })}`
                  : `$${dd.price.toFixed(activeCoin.decimals)}`}
              </span>
              <span className={`cis-ticker-change ${dd.change24h >= 0 ? 'cis-up' : 'cis-down'}`}>
                {dd.change24h >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                {dd.change24h >= 0 ? '+' : ''}{dd.change24h.toFixed(2)}%
              </span>
              <span className="cis-ticker-meta">
                24h H: {dd.high24h >= 1 ? `$${dd.high24h.toLocaleString('en-US', { maximumFractionDigits: activeCoin.decimals })}` : `$${dd.high24h.toFixed(activeCoin.decimals)}`}
                &nbsp;·&nbsp;
                L: {dd.low24h >= 1 ? `$${dd.low24h.toLocaleString('en-US', { maximumFractionDigits: activeCoin.decimals })}` : `$${dd.low24h.toFixed(activeCoin.decimals)}`}
              </span>
              <span className="cis-ticker-vol">
                Vol: {dd.volume24h >= 1000 ? `${(dd.volume24h / 1000).toFixed(1)}K` : dd.volume24h.toFixed(0)} {activeCoin.label}
              </span>
            </>
          )}
          <div className="cis-ticker-right">
            <Clock size={11} style={{ color: 'rgba(220,230,242,0.3)' }} />
            <span className="cis-ticker-refresh">Live · 15s Refresh</span>
            {isMock && <span className="cis-mock-badge">Simulation</span>}
          </div>
        </div>

        {/* ── Chart Tabs ── */}
        <div className="cis-tabs">
          <button
            className={`cis-tab ${activeTab === 'chart' ? 'active' : ''}`}
            onClick={() => setActiveTab('chart')}
          >
            <BarChart2 size={13} /> Preischart &amp; EMAs
          </button>
          <button
            className={`cis-tab ${activeTab === 'wavetrend' ? 'active' : ''}`}
            onClick={() => setActiveTab('wavetrend')}
          >
            <Activity size={13} /> WaveTrend Oszillator
          </button>
        </div>

        {/* ── Chart Area ── */}
        <div className={`cis-chart-wrap ${switching ? 'cis-chart-switching' : ''}`}>
          {(loading && !data?.candles.length) || switching ? (
            <div className="cis-chart-loading">
              <div className="cis-chart-pulse" />
              <span>{switching ? `Lade ${activeCoin.base} Daten…` : 'Verbinde mit Binance API…'}</span>
            </div>
          ) : activeTab === 'chart' ? (
            <CandlestickChart
              candles={displayCandles}
              ema21={dm.ema21}
              ema55={dm.ema55}
              ema89={dm.ema89}
              coin={activeCoin}
            />
          ) : (
            <WaveTrendChart wt1={dm.wt1} wt2={dm.wt2} />
          )}
        </div>

        {/* ── Signal Dashboard ── */}
        <div className="cis-dashboard">
          {/* Radiale Score Gauges */}
          <div className="cis-scores">
            <RadialGauge
              value={dm.bullScore}
              label="Bull Score"
              color={scoreColor(dm.bullScore)}
            />
            <div className="cis-score-divider" />
            <RadialGauge
              value={dm.bearScore}
              label="Bear Score"
              color={dm.bearScore >= 70 ? '#FF4141' : dm.bearScore >= 50 ? '#FFC828' : 'rgba(220,230,242,0.35)'}
            />
          </div>

          {/* Metrics Grid */}
          <div className="cis-metrics">
            <MetricCard
              label="Trend"
              value={dm.trend === 'bullish' ? 'BULLISH' : dm.trend === 'bearish' ? 'BEARISH' : 'NEUTRAL'}
              color={trendColor}
              sub={`EMA 21 ${dm.trend === 'bullish' ? '>' : dm.trend === 'bearish' ? '<' : '≈'} EMA 55`}
            />
            <MetricCard label="ADX" value={dm.adx}
              color={dm.adx >= 25 ? 'var(--cyan)' : 'rgba(220,230,242,0.45)'}
              sub={dm.adx >= 40 ? 'Starker Trend' : dm.adx >= 25 ? 'Trend aktiv' : 'Seitwärts'} />
            <MetricCard label="RSI (14)" value={dm.rsi}
              color={dm.rsi > 70 ? '#FF4141' : dm.rsi < 30 ? '#00C88C' : 'rgba(220,230,242,0.7)'}
              sub={dm.rsi > 70 ? 'Überkauft' : dm.rsi < 30 ? 'Überverkauft' : 'Neutral'} />
            <MetricCard label="MACD" value={dm.macdBull ? 'BULLISH' : 'BEARISH'}
              color={dm.macdBull ? '#00C88C' : '#FF4141'}
              sub="EMA 12 vs EMA 26" />
            <MetricCard label="Volatilität" value={dm.volatility} unit="%"
              color="rgba(123,231,255,0.8)" sub={`ATR: ${dm.atr.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} />
            <MetricCard label="OBV Trend" value={dm.obv >= 0 ? '↑ Positiv' : '↓ Negativ'}
              color={dm.obv >= 0 ? '#00C88C' : '#FF4141'}
              sub="On-Balance Volume" />
          </div>

          {/* Signal Status */}
          <div className={`cis-signal-status ${dm.lastSignal !== 'none' ? 'cis-signal-active' : ''}`}>
            <div className="cis-signal-dot" style={{
              background: dm.lastSignal === 'long' ? '#00C88C' : dm.lastSignal === 'short' ? '#FF4141' : 'rgba(220,230,242,0.25)',
              boxShadow: dm.lastSignal !== 'none' ? `0 0 20px ${dm.lastSignal === 'long' ? '#00C88C88' : '#FF414188'}` : 'none',
            }} />
            <div className="cis-signal-info">
              <strong>
                {dm.lastSignal === 'long' ? '⚡ LONG SIGNAL AKTIV'
                  : dm.lastSignal === 'short' ? '⚡ SHORT SIGNAL AKTIV'
                  : 'KEIN AKTIVES SIGNAL'}
              </strong>
              <span>
                Confidence {dm.confidence}/100
                {dm.lastSignal !== 'none'
                  ? ' · Master + Synergy bestätigen — beide Komponenten prüfen'
                  : ' · Warte auf Score-Schwelle (75) in beiden Komponenten'}
              </span>
            </div>
            <ShieldCheck size={18} style={{ color: 'rgba(220,230,242,0.3)', flexShrink: 0 }} />
          </div>
        </div>

        {/* ── Architektur Breakdown ── */}
        <div className="cis-arch">
          <div className="cis-arch-head">
            <span className="cis-arch-label">Wie es funktioniert</span>
            <h3>8 Signal-Schichten. Ein gewichteter Score.</h3>
            <p>
              Jede Komponente liefert Punkte — das System gibt erst dann ein Signal,
              wenn mehrere Schichten gleichzeitig ausschlagen.
            </p>
          </div>
          <div className="cis-arch-grid">
            {SIGNAL_COMPONENTS.map((comp) => {
              const Icon = comp.icon
              return (
                <div key={comp.label} className="cis-arch-card">
                  <div className="cis-arch-icon" style={{ color: comp.color }}>
                    <Icon size={16} strokeWidth={1.6} />
                  </div>
                  <div className="cis-arch-body">
                    <div className="cis-arch-top">
                      <strong>{comp.label}</strong>
                      <span className="cis-arch-weight" style={{ color: comp.color }}>{comp.weight}</span>
                    </div>
                    <p>{comp.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="cis-cta">
          <div className="cis-cta-glow" aria-hidden="true" />
          <div className="cis-cta-content">
            <AlertTriangle size={18} style={{ color: 'var(--cyan)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <h3>Realtime-Dashboard oder Daten-UI geplant?</h3>
              <p>
                Wenn ein Produkt Live-Daten, komplexe Zustände oder erklärende Dashboards braucht,
                kann ich Datenlogik, UI und Betriebsschicht sauber zusammenbringen.
              </p>
              <p className="cis-cta-disclaimer">
                Diese Sektion ist eine technische Research-Demo — kein Finanzprodukt und keine Anlageberatung.
              </p>
            </div>
          </div>
          <a
            href="mailto:contact@ivo-tech.com?subject=Realtime%20Data%20UI%20Anfrage&body=Hallo%20Ivo%2C%0A%0AIch%20habe%20ein%20Projekt%20mit%20Live-Daten%20oder%20Dashboard-UI%3A%0A%0AKurzbeschreibung%3A%20%0AStack%2FAPI%3A%20%0A%0ADanke!"
            className="cis-cta-btn"
          >
            <Mail size={15} />
            Mail schicken — Daten-UI anfragen
          </a>
        </div>

        {/* ── Disclaimer ── */}
        <p className="cis-disclaimer">
          <strong>Technische Research-Demo.</strong> Dieses Dashboard simuliert die Scoring-Logik
          des Ivo Crypto Indicator Suite mit echten Binance-Marktdaten zu Demonstrationszwecken.
          Keine Anlageberatung. Vergangene Signale garantieren keine zukünftigen Ergebnisse.
          TradingView® ist ein eingetragenes Warenzeichen von TradingView, Inc.
        </p>
      </div>
    </section>
  )
}
