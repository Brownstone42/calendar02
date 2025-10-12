<template>
    <div class="wrap">
        <div class="sub-header mt-2" ref="scroller">
            <span
                v-for="(m, i) in months"
                :key="m.key"
                :ref="(el) => (monthRefs[i] = el)"
                class="month"
                :class="{
                    current: m.isCurrent,
                    locked: isLocked(i),
                }"
                @click="onMonthClick(i)"
                role="button"
                tabindex="0"
            >
                <span class="label">{{ m.label }}</span>
                <span v-if="isLocked(i)" class="lock" aria-hidden="true">🔒</span>
            </span>
        </div>

        <div class="status mt-4" v-if="sessionStore.birthday">
            <span>อุปนิสัยจากวันเกิดในเดือนนี้</span>

            <hr />

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
                        class="my-2"
                    />
                </div>
            </div>

            <hr />

            <div>
                <div>
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

export default {
    name: 'Monthly',
    components: {
        progressBar,
    },
    data() {
        return {
            months: [],
            monthRefs: [],
            baseIndex: -1,

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
        }
    },
    mounted() {
        this.generateMonths()
        this.baseIndex = this.months.findIndex((m) => m.isCurrent)
        this.$nextTick(() => this.centerCurrentMonth('auto'))
        window.addEventListener('resize', this.recenter)
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.recenter)
    },
    watch: {
        'sessionStore.birthday': {
            immediate: true,
            handler(v) {
                if (!v || !this.sessionStore.birthday) return

                this.$nextTick(() => {
                    if (!this.months?.length) this.generateMonths()

                    this.$nextTick(() => this.fetchData())
                })
            },
        },
    },
    computed: {
        currentIndex() {
            return this.months.findIndex((m) => m.isCurrent)
        },
        ...mapStores(useSessionStore),
    },
    methods: {
        generateMonths(centerDate = new Date()) {
            const start = subMonths(centerDate, 3)
            this.months = Array.from({ length: 7 }, (_, i) => {
                const d = addMonths(start, i)
                return {
                    date: d,
                    key: format(d, 'yyyy-MM'),
                    label: format(d, 'MMMM'),
                    isCurrent: isSameMonth(d, centerDate),
                }
            })
        },
        isLocked(index) {
            if (this.baseIndex === -1) return false
            const diff = Math.abs(index - this.baseIndex)
            return diff === 2 || diff === 3
        },
        centerCurrentMonth(behavior = 'smooth', forcedIndex = null) {
            const scroller = this.$refs.scroller
            if (!scroller) return

            const idx =
                forcedIndex != null ? forcedIndex : this.months.findIndex((m) => m.isCurrent)
            if (idx < 0) return

            const el = this.monthRefs[idx]
            if (!el) return

            const elCenter = el.offsetLeft + el.offsetWidth / 2
            const target = Math.max(0, elCenter - scroller.clientWidth / 2)
            scroller.scrollTo({ left: target, behavior })
        },
        onMonthClick(idx) {
            if (this.isLocked(idx)) {
                alert('Locked')
                return
            }
            this.months = this.months.map((m, i) => ({ ...m, isCurrent: i === idx }))
            this.$nextTick(() => this.centerCurrentMonth('smooth', idx))
            this.fetchData()
        },
        recenter() {
            this.centerCurrentMonth('auto')
        },
        fetchData() {
            const birthday = this.sessionStore.birthday
            const pillars = calculator.getPillars(birthday, false, 'male')
            const luckPillars = calculator.getLuckPillars(pillars.luckPillars)
            const dayMaster = calculator.getDayMaster(pillars)
            const score = calculator.getScore(pillars)
            const tranformedScore = calculator.tranformScore(dayMaster, score)

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

            this.tranformedScore = tranformedScore
            this.currentTransformedScore = currentTransformScore
            this.dayBlossomCount = dayBlossomCount
            this.yearBlossomCount = yearBlossomCount
        },
    },
}
</script>

<style scoped>
div.wrap {
    padding: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
}
div.sub-header {
    display: flex;
    flex-wrap: nowrap;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.381);
    padding: 10px 0;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
}
div.sub-header::-webkit-scrollbar {
    display: none;
}
div.sub-header .month {
    flex: 0 0 20%;
    max-width: 20%;
    text-align: center;
    box-sizing: border-box;
    white-space: nowrap;
    user-select: none;
    cursor: pointer;
    position: relative;
}
div.sub-header .month.current {
    font-weight: 700;
    text-decoration: underline;
}
span.lock {
    position: absolute;
    top: -5px;
    font-size: 22px;
    left: calc(50% - 15px);
}
div.status {
    display: flex;
    flex-direction: column;
    width: 90%;
}
div.blossom img {
    margin-right: 10px;
    width: 10%;
}
</style>
