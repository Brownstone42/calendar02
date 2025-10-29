<template>
    <div class="monthly-wrap">
        <div class="sub-header" ref="scroller">
            <span
                v-for="(m, i) in months"
                :key="m.key"
                :ref="(el) => (monthRefs[i] = el)"
                class="month"
                :class="{ current: m.isCurrent }"
                @click="onMonthClick(i)"
                role="button"
                tabindex="0"
                v-if="sessionStore.birthday"
            >
                <span class="label">{{ m.label }}</span>
            </span>
        </div>

        <div class="my-content">
            <circle-zodiac :pillar="pillar" :active="!!sessionStore.birthday"></circle-zodiac>

            <div class="status mt-8" v-if="sessionStore.birthday">
                <img src="/images/status-1a.png" alt="status 1a" class="status-1" />

                <span class="mb-4">เบื้องลึกตัวตน</span>

                <span class="mb-4">{{ score }}</span>

                <span class="mb-4">{{ tranformedScore }}</span>

                <div v-for="(val, key) in tranformedScore" :key="key">
                    <div>
                        <span>
                            {{ key }}
                            <span v-if="currentTransformedScore[key] == 1">เพิ่มเล็กน้อย ></span>
                            <span v-if="currentTransformedScore[key] == 2">เพิ่มปานกลาง >></span>
                            <span v-if="currentTransformedScore[key] == 3">เพิ่มเยอะ >>></span>
                            <span v-if="currentTransformedScore[key] == 4">เพิ่มเยอะมาก >>>></span>
                        </span>
                        <progress-bar
                            :percent="(val / 7) * 100"
                            :duration="900"
                            :threshold="0.35"
                            class="progress-bar"
                        />
                    </div>
                </div>

                <div class="mt-4">
                    <balance-bar></balance-bar>
                </div>
                <div class="mt-4">
                    <balance-bar2></balance-bar2>
                </div>
            </div>

            <div
                class="status mt-4 reveal"
                ref="status2"
                :class="{ 'is-visible': reveal.status2 }"
                v-if="sessionStore.birthday"
            >
                <span>ความมีเสน่ห์ / ความเจ้าชู้</span>
                <div class="blossom mt-2">
                    <img
                        v-for="(blossom, i) in 6"
                        :key="i"
                        :src="
                            i < yearBlossomCount + dayBlossomCount
                                ? '/images/blossom-on.svg'
                                : '/images/blossom-off.svg'
                        "
                    />
                </div>
            </div>

            <div
                class="status mt-4 reveal"
                ref="status3"
                :class="{ 'is-visible': reveal.status3 }"
                v-if="sessionStore.birthday"
            >
                <span class="mb-4">ปีชง และ เดือนชง ของคุณ</span>
                <span class="mb-4"> {{ `ปี ${clashYears.join(', ')}` }} </span>
                <span> {{ `เดือน ${clashMonths.join(', ')} ของทุกปี` }} </span>
            </div>

            <div
                class="status my-4 reveal"
                ref="status4"
                :class="{ 'is-visible': reveal.status4 }"
                v-if="sessionStore.birthday"
            >
                <span class="mb-4">เดือนแปรปรวนในรอบ 12 ปี</span>
                <span class="mb-4"> {{ `อดีต ${dangerPast.join(', ')}` }} </span>
                <span> {{ `อนาคต ${dangerFuture.join(', ')}` }} </span>
            </div>
        </div>
    </div>
</template>

<script>
import { addMonths, subMonths, format, isSameMonth } from 'date-fns'
import calculator from '@/utils/calculator'
import { mapStores } from 'pinia'
import { useSessionStore } from '@/stores/session'
import progressBar from '@/components/common/progressBar.vue'
import circleZodiac from '@/components/monthly/circleZodiac.vue'
import balanceBar from '@/components/common/balanceBar.vue'
import balanceBar2 from '@/components/common/ิbalanceBar2.vue'

export default {
    name: 'Monthly',
    components: {
        progressBar,
        circleZodiac,
        balanceBar,
        balanceBar2,
    },
    data() {
        return {
            reveal: { status2: false, status3: false, status4: false },

            months: [],
            monthRefs: [],

            tranformedScore: {},
            currentTransformedScore: {},

            blossomMap: {
                Tiger: ['Rabbit'],
                Horse: ['Rabbit'],
                Dog: ['Rabbit'],
                Rabbit: ['Rat'],
                Pig: ['Rat'],
                Goat: ['Rat'],
                Snake: ['Horse'],
                Rooster: ['Horse'],
                Ox: ['Horse'],
                Monkey: ['Rooster'],
                Rat: ['Rooster'],
                Dragon: ['Rooster'],
            },
            dayBlossomCount: 0,
            yearBlossomCount: 0,
            score: {},
            pillar: {},

            clashYears: [],
            clashMonths: [],
            dangerPast: [],
            dangerFuture: [],
        }
    },
    mounted() {
        window.addEventListener('resize', this.recenter)
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.recenter)
    },
    computed: {
        currentIndex() {
            return this.months.findIndex((m) => m.isCurrent)
        },
        ...mapStores(useSessionStore),
    },
    watch: {
        'sessionStore.birthday': {
            immediate: true,
            handler(v) {
                if (!v) return
                if (!this.months?.length) this.generateMonths()

                this.$nextTick(() => {
                    const scroller = this.$refs.scroller
                    if (!scroller) return

                    scroller.classList.remove('smooth')
                    this.centerToIndex(this.currentIndex, 'auto')
                    requestAnimationFrame(() => scroller.classList.add('smooth'))

                    this.fetchData()
                    this.$nextTick(this.observeStatuses)
                })
            },
        },
    },
    methods: {
        observeStatuses() {
            const el2 = this.$refs.status2
            const el3 = this.$refs.status3
            const el4 = this.$refs.status4
            if (!el2 && !el3 && !el4) return

            const io = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (!entry.isIntersecting) return
                        if (entry.target === el2) {
                            this.reveal.status2 = true
                            io.unobserve(el2)
                        }
                        if (entry.target === el3) {
                            setTimeout(() => {
                                this.reveal.status3 = true
                                io.unobserve(el3)
                            }, 120)
                        }
                        if (entry.target === el4) {
                            setTimeout(() => {
                                this.reveal.status4 = true
                                io.unobserve(el4)
                            }, 240)
                        }
                    })
                },
                { threshold: 0.2 },
            )

            el2 && io.observe(el2)
            el3 && io.observe(el3)
            el4 && io.observe(el4)
        },
        generateMonths(baseDate = new Date()) {
            const start = subMonths(baseDate, 6)
            this.months = Array.from({ length: 13 }, (_, i) => {
                const d = addMonths(start, i)
                return {
                    date: d,
                    key: format(d, 'yyyy-MM'),
                    label: format(d, 'MMMM'),
                    isCurrent: isSameMonth(d, baseDate),
                }
            })
        },
        centerToIndex(index, behavior = 'smooth') {
            const scroller = this.$refs.scroller
            if (!scroller) return

            const current = this.currentIndex

            if (index === current + 5 || index === current + 6) {
                index = current + 4
            } else if (index === current - 5 || index === current - 6) {
                index = current - 4
            }

            if (index < 0) index = 0
            if (index >= this.months.length) index = this.months.length - 1

            const el = this.monthRefs[index]
            if (!el) return

            const elCenter = el.offsetLeft + el.offsetWidth / 2
            const target = elCenter - scroller.clientWidth / 2

            scroller.scrollTo({ left: target, behavior })
        },
        onMonthClick(idx) {
            this.months = this.months.map((m, i) => ({ ...m, isCurrent: i === idx }))
            this.$nextTick(() => {
                this.centerToIndex(idx, 'smooth')
                this.fetchData()
            })
        },
        recenter() {
            this.centerToIndex(this.currentIndex, 'auto')
        },
        fetchData() {
            const birthday = this.sessionStore.birthday
            const pillars = calculator.getPillars(birthday, false, 'male')
            const luckPillars = calculator.getLuckPillars(pillars.luckPillars)
            const dayMaster = calculator.getDayMaster(pillars)
            const score = calculator.getScore(pillars)
            const tranformedScore = calculator.tranformScore(dayMaster, score)

            console.log(tranformedScore)

            const cYear = this.months[this.currentIndex].key.split('-')[0]
            const cMonth = this.months[this.currentIndex].key
            const current = cMonth + '-15'
            const currentPillars = calculator.getPillars(current, false, 'male')
            const currentCountScore = calculator.getCountScoreYM(currentPillars)
            const currentTransformScore = calculator.addTranformScore(dayMaster, currentCountScore)

            const i = luckPillars.findIndex((r) => cYear >= r.yearStart && cYear <= r.yearEnd)

            const cyz = currentPillars.yearBranch.animal
            const cmz = currentPillars.monthBranch.animal
            const cdz = currentPillars.dayBranch.animal

            const yz = pillars.yearBranch.animal
            const mz = pillars.monthBranch.animal
            const dz = pillars.dayBranch.animal

            const lpz = luckPillars[i].earthlyBranch.animal

            const dayBlossom = this.blossomMap[dz][0]
            const yearBlossom = this.blossomMap[yz][0]

            const clashResult = calculator.findClash(yz, mz, dz, cYear)
            const clash = clashResult.clash

            let dangerPast = []
            let dangerFuture = []
            const danger = clashResult.danger

            danger.forEach(({ year, month }) => {
                const ym = `${year}-${String(month).padStart(2, '0')}`

                if (ym <= cMonth) {
                    dangerPast.push(ym)
                } else {
                    dangerFuture.push(ym)
                }
            })

            const clashYears = []
            const clashMonths = []
            const seenMonth = new Set()
            const seenYear = new Set()

            for (const item of clash) {
                if (
                    (item.clash.ym || item.clash.mm || item.clash.dm) &&
                    !seenMonth.has(item.month)
                ) {
                    clashMonths.push(item.month)
                    seenMonth.add(item.month)
                } else if (
                    (item.clash.yy || item.clash.my || item.clash.dy) &&
                    !seenYear.has(item.year)
                ) {
                    clashYears.push(item.year)
                    seenYear.add(item.year)
                }
            }

            let dayBlossomCount = 0
            let yearBlossomCount = 0

            if (cyz == dayBlossom) dayBlossomCount++
            if (cmz == dayBlossom) dayBlossomCount++
            if (lpz == dayBlossom) dayBlossomCount++
            if (yz == dayBlossom) dayBlossomCount++
            if (mz == dayBlossom) dayBlossomCount++

            if (cyz == yearBlossom) yearBlossomCount++
            if (cmz == yearBlossom) yearBlossomCount++
            if (lpz == yearBlossom) yearBlossomCount++
            if (dz == yearBlossom) yearBlossomCount++
            if (mz == yearBlossom) yearBlossomCount++

            const pillar = {
                cyz,
                cmz,
                yz,
                mz,
                dz,
            }

            this.tranformedScore = tranformedScore
            this.currentTransformedScore = currentTransformScore
            this.dayBlossomCount = dayBlossomCount
            this.yearBlossomCount = yearBlossomCount
            this.pillar = pillar
            this.clashMonths = clashMonths
            this.clashYears = clashYears
            this.dangerPast = dangerPast
            this.dangerFuture = dangerFuture
            this.score = score
        },
    },
}
</script>

<style scoped>
.reveal {
    opacity: 0;
    transform: translateY(12px);
    will-change: opacity, transform;
    transition:
        opacity 520ms ease,
        transform 520ms ease;
}
.reveal.is-visible {
    opacity: 1;
    transform: translateY(0);
}
span {
    color: #464646;
}
.monthly-wrap {
    display: flex;
    flex-direction: column;
}
.sub-header {
    display: flex;
    flex-wrap: nowrap;
    width: 100%;
    padding: 10px 0;
    flex-shrink: 0;
    height: 50px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    scroll-behavior: auto;
    scroll-snap-type: x mandatory;
}
.sub-header.smooth {
    scroll-behavior: smooth;
}
.sub-header::-webkit-scrollbar {
    display: none;
}
.sub-header .month {
    flex: 0 0 20%;
    max-width: 20%;
    text-align: center;
    white-space: nowrap;
    user-select: none;
    cursor: pointer;
    position: relative;
    scroll-snap-align: center;
    transition: transform 180ms ease;
}
.sub-header .month.current {
    transform: scale(1.02);
}
.sub-header .month.current::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: -1px;
    transform: translateX(-50%);
    width: 100%;
    height: 2px;
    background-color: #464646;
    border-radius: 2px;
}
.my-content {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch; /* โมเมนตัมบน iOS */
    scrollbar-width: none; /* Firefox ซ่อนสครอลบาร์ */
    -ms-overflow-style: none; /* IE/Edge รุ่นเก่า */
    display: flex;
    flex-direction: column;
    align-items: center;
}
.my-content::-webkit-scrollbar {
    width: 0;
    height: 0;
}
.status {
    display: flex;
    flex-direction: column;
    width: 80%;
    background-color: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3); /* เพิ่มเงาให้นูน */
    position: relative;
}
.status:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5);
}
.blossom img {
    margin-right: 10px;
    width: 10%;
}
.progress-bar {
    margin-bottom: 10px;
}
.status-1 {
    position: absolute;
    width: 100px;
    top: -50px;
    right: -40px;
}
.mt-8 {
    margin-top: 5rem;
}
</style>
