<template>
    <div class="wrap">
        <div class="card" ref="cardEl">
            <div class="north-dot" />
            <div class="hud">
                <div class="chip">Compass</div>
                <div class="heading">{{ Math.round(heading) }}°</div>
            </div>

            <svg viewBox="-100 -100 200 200" aria-label="Compass">
                <g :style="dialStyle">
                    <circle
                        r="98"
                        fill="rgba(255,255,255,0.02)"
                        stroke="rgba(255,255,255,0.12)"
                        stroke-width="2"
                    />

                    <g ref="ticksEl"></g>

                    <g
                        font-size="12"
                        text-anchor="middle"
                        dominant-baseline="middle"
                        fill="rgba(255,255,255,0.8)"
                    >
                        <text
                            x="0"
                            y="-74"
                            transform="rotate(0 0 -74)"
                            font-size="16"
                            fill="#ff4858"
                            font-weight="700"
                        >
                            N
                        </text>
                        <text
                            x="74"
                            y="0"
                            transform="rotate(90 74 0)"
                            font-size="16"
                            font-weight="700"
                        >
                            E
                        </text>
                        <text
                            x="0"
                            y="74"
                            transform="rotate(180 0 74)"
                            font-size="16"
                            font-weight="700"
                        >
                            S
                        </text>
                        <text
                            x="-74"
                            y="0"
                            transform="rotate(270 -74 0)"
                            font-size="16"
                            font-weight="700"
                        >
                            W
                        </text>
                    </g>
                </g>

                <g class="needle-fixed">
                    <path d="M 0 -64 L 8 0 L 0 10 L -8 0 Z" fill="#ff4858" />
                    <path d="M 0 64 L 8 0 L 0 -10 L -8 0 Z" fill="#e8eef6" opacity="0.9" />
                    <circle r="4" fill="#e8eef6" />
                </g>

                <circle r="4" fill="#101722" stroke="#c6d0dc" />
            </svg>
        </div>

        <button v-if="!enabled" class="btn" @click="enable">Enable compass</button>

        <div :class="['slider-wrap', { visible: showFallback }]">
            <span>Desktop demo</span>
            <input v-model.number="sim" type="range" min="0" max="360" step="1" />
            <span>{{ sim }}°</span>
        </div>
    </div>
</template>

<script>
import { mapStores } from 'pinia'
import { useSessionStore } from '@/stores/session'
import calculator from '@/utils/calculator'

export default {
    name: 'Compass',

    data() {
        return {
            heading: 0,
            enabled: false,
            sim: 0,
            showFallback: true,

            lastSm: null,
            lastRaw: null,
            dialAngle: 0,
            onOrient: null,
            rafId: 0,
            _lastLoggedDeg: null,

            score: {},
            favorite: [],
        }
    },
    computed: {
        ...mapStores(useSessionStore),
        dialStyle() {
            return {
                transition: 'transform 80ms linear',
                transformBox: 'fill-box',
                transformOrigin: '50% 50%',
                transform: `rotate(${this.dialAngle}deg)`,
            }
        },
    },
    mounted() {
        this.buildTicks()
        const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)

        if (!isMobile) this.showFallback = true

        this.startFallbackLoop()

        if (screen.orientation) {
            screen.orientation.addEventListener('change', this.onScreenRotate)
        }
    },
    beforeUnmount() {
        window.removeEventListener('deviceorientation', this.onOrient, true)
        window.removeEventListener('deviceorientationabsolute', this.onOrient, true)
        if (screen.orientation) {
            screen.orientation.removeEventListener('change', this.onScreenRotate)
        }
        if (this.rafId) cancelAnimationFrame(this.rafId)
    },
    methods: {
        getDirection(deg) {
            if (!this.sessionStore.birthday) return

            let direction = ''

            if (deg >= 337.5 || deg < 22.5) direction = 'North'
            if (deg >= 22.5 && deg < 67.5) direction = 'Northeast'
            if (deg >= 67.5 && deg < 112.5) direction = 'East'
            if (deg >= 112.5 && deg < 157.5) direction = 'Southeast'
            if (deg >= 157.5 && deg < 202.5) direction = 'South'
            if (deg >= 202.5 && deg < 247.5) direction = 'Southwest'
            if (deg >= 247.5 && deg < 292.5) direction = 'West'
            if (deg >= 292.5 && deg < 337.5) direction = 'Northwest'

            const result = calculator.getDirectionSuggest(this.score, this.favorite, direction)

            console.log(result)
        },
        fetchData() {
            const birthday = this.sessionStore.birthday
            const pillars = calculator.getPillars(birthday, false, 'male')
            const score = calculator.getScore(pillars)
            const dayMaster = calculator.getDayMaster(pillars)
            const dayMasterStrength = calculator.getDayMasterStrength(dayMaster, score)
            const favorite = calculator.getFavoriteElement(dayMaster, score, dayMasterStrength)

            this.score = score
            this.favorite = favorite
            this.getDirection(this._lastLoggedDeg)
        },
        buildTicks() {
            const g = this.$refs.ticksEl
            if (!g) return
            const NS = 'http://www.w3.org/2000/svg'
            for (let d = 0; d < 360; d += 5) {
                const len = d % 30 === 0 ? 8 : d % 10 === 0 ? 5 : 2.5
                const w = d % 30 === 0 ? 1.6 : 1.2
                const a = (d * Math.PI) / 180
                const x1 = Math.sin(a) * (90 - len)
                const y1 = -Math.cos(a) * (90 - len)
                const x2 = Math.sin(a) * 90
                const y2 = -Math.cos(a) * 90
                const tick = document.createElementNS(NS, 'line')
                tick.setAttribute('x1', x1.toFixed(2))
                tick.setAttribute('y1', y1.toFixed(2))
                tick.setAttribute('x2', x2.toFixed(2))
                tick.setAttribute('y2', y2.toFixed(2))
                tick.setAttribute('stroke', 'rgba(255,255,255,0.55)')
                tick.setAttribute('stroke-width', w)
                g.appendChild(tick)
            }
        },

        onScreenRotate() {
            if (this.lastSm != null)
                this.lastSm = this.normalize(this.lastSm + this.getScreenAngle())
        },
        normalize(deg) {
            deg = deg % 360
            if (deg < 0) deg += 360
            return deg
        },
        shortestDelta(a, b) {
            return ((b - a + 540) % 360) - 180
        },
        smooth(to) {
            if (this.lastSm === null) {
                this.lastSm = to
                return to
            }
            const d = this.shortestDelta(this.lastSm, to)
            const alpha = 0.12
            this.lastSm = this.normalize(this.lastSm + d * alpha)
            return this.lastSm
        },
        setHeading(deg) {
            const raw = this.normalize(deg)
            const sm = this.smooth(raw)
            this.heading = sm

            const rounded = Math.round(sm)
            if (rounded !== this._lastLoggedDeg) {
                this._lastLoggedDeg = rounded
            }

            if (this.lastRaw === null) {
                this.lastRaw = raw
                this.dialAngle = -sm
                return
            }
            const delta = this.shortestDelta(this.lastRaw, raw)
            this.lastRaw = raw
            this.dialAngle -= delta
        },
        getScreenAngle() {
            const o =
                screen.orientation && typeof screen.orientation.angle === 'number'
                    ? screen.orientation.angle
                    : window.orientation || 0
            return o || 0
        },
        startCompass() {
            this.onOrient = (e) => {
                let h
                if (typeof e.webkitCompassHeading === 'number' && !isNaN(e.webkitCompassHeading)) {
                    h = e.webkitCompassHeading
                } else if (e.absolute === true || typeof e.absolute === 'undefined') {
                    if (typeof e.alpha === 'number') h = 360 - e.alpha
                }
                if (typeof h === 'number') {
                    h = this.normalize(h + this.getScreenAngle())
                    this.setHeading(h)
                }
            }

            window.addEventListener('deviceorientation', this.onOrient, true)
            window.addEventListener('deviceorientationabsolute', this.onOrient, true)
            this.showFallback = false
        },
        async enable() {
            console.log(location)

            const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)

            if (!isMobile) {
                alert('Please use mobile')
                this.showFallback = true
                return
            }

            const DOE = window.DeviceOrientationEvent
            if (DOE && typeof DOE.requestPermission === 'function') {
                try {
                    const state = await DOE.requestPermission()
                    if (state === 'granted') {
                        this.startCompass()
                        this.enabled = true
                    } else {
                        alert('ไม่ได้รับสิทธิ์การเข้าถึงเซนเซอร์')
                    }
                } catch (err) {
                    console.error(err)
                    alert('ไม่สามารถขอสิทธิ์การเข้าถึงเซนเซอร์')
                }
            } else {
                this.startCompass()
                this.enabled = true
            }
        },
        startFallbackLoop() {
            if (!(this.showFallback && !this.enabled && !this.rafId)) return
            const loop = () => {
                this.setHeading(this.sim)
                this.rafId = requestAnimationFrame(loop)
            }
            this.rafId = requestAnimationFrame(loop)
        },
    },
    watch: {
        showFallback() {
            if (this.rafId) cancelAnimationFrame(this.rafId)
            this.rafId = 0
            this.startFallbackLoop()
        },
        enabled() {
            if (this.rafId) cancelAnimationFrame(this.rafId)
            this.rafId = 0
            this.startFallbackLoop()
        },
        'sessionStore.birthday': {
            immediate: true,
            handler(v) {
                if (!v || !this.sessionStore.birthday) return
                this.$nextTick(() => {
                    this.fetchData()
                })
            },
        },
        _lastLoggedDeg(newVal, oldVal) {
            if (newVal !== oldVal) {
                this.getDirection(newVal)
            }
        },
    },
}
</script>

<style scoped>
:root {
    --bg: #0b0f14;
    --fg: #e8eef6;
    --muted: #93a1b3;
}
* {
    box-sizing: border-box;
}
html,
body,
:host {
    height: 100%;
}
.wrap {
    width: min(520px, 92vw);
    margin: 24px auto;
    display: grid;
    gap: 16px;
    justify-items: center;
}
.title {
    margin: 0;
    font-weight: 700;
    letter-spacing: 0.2px;
}
.card {
    width: 100%;
    aspect-ratio: 1/1;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 24px;
    box-shadow:
        0 20px 60px rgba(0, 0, 0, 0.35),
        inset 0 0 40px rgba(255, 255, 255, 0.03);
    display: grid;
    place-items: center;
    position: relative;
    overflow: hidden;
    background-image: radial-gradient(1200px 800px at 50% 10%, #121a22, #0b0f14);
    color: var(--fg);
}
.hud {
    position: absolute;
    inset: 14px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    pointer-events: none;
}
.chip {
    font-size: 12px;
    color: var(--muted);
    opacity: 0.9;
}
.heading {
    font-variant-numeric: tabular-nums;
    font-size: 20px;
    color: var(--fg);
}
.north-dot {
    position: absolute;
    top: 10px;
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: #ff4858;
    box-shadow: 0 0 16px rgba(255, 72, 88, 0.7);
}
svg {
    width: 82%;
    height: auto;
    overflow: visible;
}
.needle-fixed {
    filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.3));
}
.btn {
    appearance: none;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: linear-gradient(#1a2330, #101722);
    color: white;
    padding: 12px 16px;
    border-radius: 12px;
    cursor: pointer;
    font-weight: 600;
}
.btn:active {
    transform: translateY(1px);
}
.slider-wrap {
    display: none;
    gap: 8px;
    align-items: center;
    color: var(--muted);
}
.slider-wrap.visible {
    display: flex;
}
input[type='range'] {
    width: 240px;
}
.note {
    color: var(--muted);
    font-size: 12px;
    text-align: center;
    max-width: 520px;
}
</style>
