<template>
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
</template>

<script>
import { addMonths, subMonths, format, isSameMonth } from 'date-fns'

export default {
    name: 'Monthly',
    data() {
        return {
            months: [],
            monthRefs: [],
            baseIndex: -1,
        }
    },
    mounted() {
        this.generateMonths()
        this.baseIndex = this.months.findIndex((m) => m.isCurrent)
        this.$nextTick(() => this.centerCurrentMonth('auto'))
        window.addEventListener('resize', this.recenter)
        this.fetchData()
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.recenter)
    },
    computed: {
        currentIndex() {
            return this.months.findIndex((m) => m.isCurrent)
        },
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

            // 3) (OPTIONAL) If you want the list to always be 7 months around the selected one:
            // const selected = this.months[idx].date
            // this.generateMonths(selected)
            // this.$nextTick(() => {
            //   // after regenerating, current will be at index 3
            //   this.centerCurrentMonth('smooth', 3)
            // })
        },
        recenter() {
            this.centerCurrentMonth('auto')
        },
        fetchData() {
            console.log('data')
        },
    },
}
</script>

<style scoped>
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
</style>
