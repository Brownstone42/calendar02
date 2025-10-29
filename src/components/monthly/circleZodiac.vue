<template>
    <div class="zodiac-container">
        <div class="arrow" v-if="phase == 'idle'">
            <img src="/images/arrow.png" alt="" />
        </div>
        <div class="zodiac-wrap" :class="wrapperClass" :style="wrapperStyle">
            <img class="layer background" src="/images/circle-5b.png" alt="background" />
            <img
                class="layer wheel"
                src="/images/circle-1b.png"
                alt="wheel"
                :style="{ transform: rotations.minute }"
            />
            <img class="layer inner" src="/images/circle-2b.png" alt="inner" />
            <img
                class="layer highlight"
                src="/images/circle-3b.png"
                alt="highlight year"
                :style="{ transform: rotations.year }"
            />
            <img
                class="layer highlight"
                src="/images/circle-3b.png"
                alt="highlight month"
                :style="{ transform: rotations.month }"
            />
            <img
                class="layer highlight"
                src="/images/circle-3b.png"
                alt="highlight day"
                :style="{ transform: rotations.day }"
            />
        </div>
    </div>
</template>

<script>
export default {
    name: 'circleZodiac',
    props: {
        pillar: {
            type: Object,
            required: true,
        },
        active: { type: Boolean, default: true },
    },
    data() {
        return {
            // phase: 'idle' | 'folding' | 'fading' | 'hidden'
            phase: this.active ? 'idle' : 'hidden',
            fadeMs: 420,
            rotateMs: 500,
            _firstRun: true,
            month: null,
            rotate: 0,
        }
    },
    watch: {
        active: {
            immediate: true,
            async handler(v) {
                // ✅ ครั้งแรก: ตั้งค่าทันที ไม่เล่นแอนิเมชัน
                if (this._firstRun) {
                    this._firstRun = false
                    this.phase = v ? 'idle' : 'hidden'
                    return
                }

                if (v) {
                    // กลับมาแสดง: เฟดเข้า (คงเดิม)
                    this.phase = 'faded'
                    await this.$nextTick()
                    requestAnimationFrame(() => {
                        this.phase = 'idle'
                    })
                } else {
                    // พับเก็บ: หมุนกลับ 0° → ค้างที่ opacity 0.2
                    this.phase = 'folding'
                    await new Promise((r) => setTimeout(r, this.rotateMs + 20))
                    this.phase = 'faded' // 👈 เปลี่ยนจาก fading/hidden เป็น faded
                    // ไม่ต้อง hidden แล้ว
                }
            },
        },
    },
    computed: {
        rotations() {
            const z2deg = {
                Rat: 0,
                Ox: 30,
                Tiger: 60,
                Rabbit: 90,
                Dragon: 120,
                Snake: 150,
                Horse: 180,
                Goat: 210,
                Monkey: 240,
                Rooster: 270,
                Dog: 300,
                Pig: 330,
            }
            const deg = (name) => (name && z2deg[name]) ?? 0

            // 🔧 คงมุม 0° ระหว่าง folding + fading (+ hidden)
            const forceZero =
                this.phase === 'folding' ||
                this.phase === 'fading' ||
                this.phase === 'hidden' ||
                this.phase === 'faded'

            if (this.month) {
                const degA = deg(this.month)
                const degB = deg(this.pillar?.cmz)
                let diff = degB - degA

                if (diff > 180) diff -= 360
                if (diff < -180) diff += 360

                this.rotate = this.rotate + diff
                this.month = this.pillar?.cmz

                return {
                    year: `rotate(${deg(this.pillar?.yz) - deg(this.pillar?.cmz)}deg)`,
                    month: `rotate(${deg(this.pillar?.mz) - deg(this.pillar?.cmz)}deg)`,
                    day: `rotate(${deg(this.pillar?.dz) - deg(this.pillar?.cmz)}deg)`,
                    minute: `rotate(${-this.rotate}deg)`,
                }
            } else {
                this.month = this.pillar?.cmz
                this.rotate = deg(this.pillar?.cmz)

                return {
                    year: `rotate(${deg(this.pillar?.yz) - deg(this.pillar?.cmz)}deg)`,
                    month: `rotate(${deg(this.pillar?.mz) - deg(this.pillar?.cmz)}deg)`,
                    day: `rotate(${deg(this.pillar?.dz) - deg(this.pillar?.cmz)}deg)`,
                    minute: `rotate(${forceZero ? 0 : -deg(this.pillar?.cmz)}deg)`,
                }
            }

            /*return {
                year: `rotate(${deg(this.pillar?.yz) - deg(this.pillar?.cmz)}deg)`,
                month: `rotate(${deg(this.pillar?.mz) - deg(this.pillar?.cmz)}deg)`,
                day: `rotate(${deg(this.pillar?.dz) - deg(this.pillar?.cmz)}deg)`,
                minute: `rotate(${forceZero ? 0 : -deg(this.pillar?.cmz)}deg)`,
            }*/
        },
        type() {
            let type = ''
            const year = this.pillar?.yz
            const month = this.pillar?.mz
            const day = this.pillar?.dz

            if ((year == month) == day) type = 'ymd'
            else if (year == month) type = 'ym'
            else if (year == day) type = 'yd'
            else if (month == day) type = 'md'
            else type = 'normal'

            return type
        },
        wrapperClass() {
            return {
                'phase-idle': this.phase === 'idle',
                'phase-folding': this.phase === 'folding',
                'phase-fading': this.phase === 'fading',
                'phase-hidden': this.phase === 'hidden',
            }
        },
        wrapperStyle() {
            switch (this.phase) {
                case 'faded':
                    return { opacity: 0.2, transition: `opacity ${this.fadeMs}ms ease` }
                case 'folding':
                case 'idle':
                    return { opacity: 1, transition: `opacity ${this.fadeMs}ms ease` }
                case 'hidden':
                    return { opacity: 0, pointerEvents: 'none', transition: 'none' }
                default:
                    return {}
            }
        },
    },
    mounted() {
        console.log(this.pillar)
    },
}
</script>

<style scoped>
.zodiac-wrap .layer,
.zodiac-wrap img,
.zodiac-wrap svg {
    pointer-events: none;
}
.zodiac-container {
    width: 100%;
}
.zodiac-wrap {
    position: relative;
    width: min(73vmin, 520px);
    aspect-ratio: 1 / 1;
    margin: auto;
}

/* z-index เหมือนเดิม */
img.inner {
    z-index: 5;
}
img.wheel {
    z-index: 3;
}
img.highlight {
    z-index: 2;
}
img.background {
    z-index: 4;
    transform: translateY(20%);
}

/* ทรานซิชันการหมุน */
.zodiac-wrap .layer {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    image-rendering: auto;
    transform-origin: 50% 50%;
    transition: transform 500ms ease; /* ให้ตรงกับ rotateMs */
}

/* ขณะ folding เราเปลี่ยนเฉพาะ highlight ให้หมุนกลับ 0° (ผ่าน computed แล้ว จึงไม่ต้อง !important) */

/* ขณะ fading/hidden ใช้ opacity จาก wrapperStyle แทน เพื่อให้เฟดทั้งวง */

.arrow {
    display: flex;
    width: 100%;
    justify-content: center;
    margin-top: -10px;
}
.arrow img {
    width: 40px;
}
</style>
