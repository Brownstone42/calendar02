<template>
    <div>
        <div class="sub-header" ref="scroller" v-if="sessionStore.birthday">
            <span
                v-for="(m, i) in months"
                :key="m.key"
                :ref="(el) => (monthRefs[i] = el)"
                class="month"
                :class="{ current: m.isCurrent }"
                @click="onMonthClick(i)"
                role="button"
                tabindex="0"
            >
                <span class="label">{{ m.label }}</span>
            </span>
        </div>
        <div class="wrap">
            <div class="content">
                <circle-zodiac v-if="sessionStore.birthday" :pillar="pillar"></circle-zodiac>

                <div class="status mt-4" v-if="sessionStore.birthday">
                    <span class="mb-4">เบื้องลึกตัวตน</span>

                    <div v-for="(val, key) in tranformedScore" :key="key">
                        <div>
                            <span>
                                {{ key }}
                                <span v-if="currentTransformedScore[key] == 1"
                                    >เพิ่มเล็กน้อย ></span
                                >
                                <span v-if="currentTransformedScore[key] == 2"
                                    >เพิ่มปานกลาง >></span
                                >
                                <span v-if="currentTransformedScore[key] == 3">เพิ่มเยอะ >>></span>
                                <span v-if="currentTransformedScore[key] == 4"
                                    >เพิ่มเยอะมาก >>>></span
                                >
                            </span>
                            <progress-bar
                                :percent="(val / 7) * 100"
                                :duration="900"
                                :threshold="0.35"
                                class="my-2"
                            />
                        </div>
                    </div>
                </div>

                <div class="status my-4" v-if="sessionStore.birthday">
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

export default {
    name: 'Monthly',
    components: {
        progressBar,
        circleZodiac,
    },
    data() {
        return {
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
            pillar: {},
        }
    },
    mounted() {
        this.generateMonths() // gen 13 เดือนครั้งเดียวตามที่ทำไว้
        this.$nextTick(() => {
            const scroller = this.$refs.scroller
            if (!scroller) return

            // 1) แน่ใจว่า "ยังไม่" เปิด smooth
            scroller.classList.remove('smooth')

            // 2) จัดกึ่งกลางครั้งแรกแบบ instant (ไม่เห็นอนิเมชัน)
            this.centerToIndex(this.currentIndex, 'auto')

            // 3) เปิด smooth สำหรับการใช้งานครั้งถัดไป (คลิก/สกรอล์)
            // ใช้ RAF ให้แน่ใจว่า layout เซ็ตเสร็จก่อน
            requestAnimationFrame(() => {
                scroller.classList.add('smooth')
            })
        })

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
                if (!v || !this.sessionStore.birthday) return

                this.$nextTick(() => {
                    if (!this.months?.length) this.generateMonths()

                    this.$nextTick(() => this.fetchData())
                })
            },
        },
    },
    methods: {
        generateMonths(baseDate = new Date()) {
            const start = subMonths(baseDate, 6)
            this.months = Array.from({ length: 13 }, (_, i) => {
                const d = addMonths(start, i)
                return {
                    date: d,
                    key: format(d, 'yyyy-MM'),
                    label: format(d, 'MMMM'),
                    isCurrent: isSameMonth(d, baseDate), // จะ true แค่ตัวกลาง
                }
            })

            // ถ้า lib format/isSameMonth ไม่ตรงเดือนปัจจุบันเป๊ะ ให้บังคับกลางไว้ที่ index=6
            const mid = 6
            this.months = this.months.map((m, i) => ({ ...m, isCurrent: i === mid }))
        },
        centerToIndex(index, behavior = 'smooth') {
            const scroller = this.$refs.scroller
            if (!scroller) return

            // หา current index (เดือนที่ active ตอนนี้)
            const current = this.currentIndex

            // --- HARD LIMIT LOGIC ---
            // ถ้าอยู่ฝั่งขวาสุด (current+5 หรือ +6) → center current+4
            if (index === current + 5 || index === current + 6) {
                index = current + 4
            }
            // ถ้าอยู่ฝั่งซ้ายสุด (current-5 หรือ -6) → center current-4
            else if (index === current - 5 || index === current - 6) {
                index = current - 4
            }

            // ป้องกันไม่ให้เกินขอบ array
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
                this.centerToIndex(idx, 'smooth') // ใช้ฟังก์ชันที่เราแก้
                this.fetchData()
            })
        },
        recenter() {
            this.centerToIndex(this.currentIndex, 'auto') // ไม่อนิเมตตอนย่อ/ขยายจอ
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
        },
    },
}
</script>

<style scoped>
span {
    color: white;
}
.wrap {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 235px); /* or 100% if it's already inside a full-height layout */
    color: white;
    overflow-y: auto;
}
.content {
    display: flex;
    flex-direction: column;
    flex: 1; /* fills the parent height */
    align-items: center;
}
div.sub-header {
    display: flex;
    flex-wrap: nowrap;
    width: 100%;
    padding: 10px 0;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;

    /* ลื่นเวลาใช้เมาส์/สัมผัส */
    scroll-behavior: auto;
    scroll-snap-type: x mandatory; /* ออปชัน: ช่วยเวลาลากด้วยมือ */
}
div.sub-header.smooth {
    scroll-behavior: smooth;
}
div.sub-header::-webkit-scrollbar {
    display: none;
}
/* ให้ “มองเห็น 5 ช่อง” — 5 * 20% = 100% */
div.sub-header .month {
    flex: 0 0 20%;
    max-width: 20%;
    text-align: center;
    white-space: nowrap;
    user-select: none;
    cursor: pointer;
    position: relative;

    scroll-snap-align: center; /* ออปชัน: snap ให้หยุดกลางตัวเอง */
    transition: transform 180ms ease; /* เนียนตอน active เปลี่ยน */
}
div.sub-header .month.current {
    font-weight: 700;
    text-decoration: underline;
    transform: scale(1.02);
}
div.sub-header .month span {
    color: white;
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
    background-color: gray;
    padding: 20px;
    border-radius: 10px;
}
div.blossom img {
    margin-right: 10px;
    width: 10%;
}
</style>
