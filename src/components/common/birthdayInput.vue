<template>
    <div class="birthday">
        <!-- DD / MM / YYYY -->
        <input
            ref="dd"
            type="text"
            class="day"
            placeholder="DD"
            maxlength="2"
            inputmode="numeric"
            v-model="day"
            @input="onInput($event)"
            @click="selectAllOnClick"
            @keydown.enter.prevent="searchEnabled && emitEnter()"
            aria-label="Day"
            @keydown="onBackspaceKey('day', $event)"
        />
        <span>/</span>

        <input
            ref="mm"
            type="text"
            class="month"
            placeholder="MM"
            maxlength="2"
            inputmode="numeric"
            v-model="month"
            @input="onInput($event)"
            @click="selectAllOnClick"
            @keydown.enter.prevent="searchEnabled && emitEnter()"
            aria-label="Month"
            @keydown="onBackspaceKey('month', $event)"
        />
        <span>/</span>

        <input
            ref="yyyy"
            type="text"
            class="year"
            placeholder="YYYY"
            maxlength="4"
            inputmode="numeric"
            v-model="year"
            @input="onInput($event)"
            @click="selectAllOnClick"
            @keydown.enter.prevent="searchEnabled && emitEnter()"
            aria-label="Year"
            @keydown="onBackspaceKey('year', $event)"
        />

        <button
            class="icon-btn search-btn"
            type="button"
            aria-label="Search"
            @click="onSearchClick"
            :disabled="!searchEnabled"
        >
            <svg viewBox="0 0 24 24" aria-hidden="true" style="fill: currentColor">
                <path
                    d="M15.5 14h-.79l-.28-.27a6.471 6.471 0 0 0 1.57-4.23 6.5 6.5 0 1 0-6.5 6.5 6.471 6.471 0 0 0 4.23-1.57l.27.28v.79l5 5 1.5-1.5-5-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                />
            </svg>
        </button>
    </div>
</template>

<script>
export default {
    name: 'BirthdayInput',
    props: {
        modelValue: { type: String, default: null },
        searchEnabled: { type: Boolean, default: true },
    },
    emits: ['update:modelValue', 'enter'],
    data() {
        return {
            day: '',
            month: '',
            year: '',
        }
    },
    mounted() {
        if (this.modelValue) {
            const m = this.modelValue.match(/^(\d{4})-(\d{2})-(\d{2})$/)
            if (m) {
                this.year = m[1]
                this.month = m[2]
                this.day = m[3]
            }
        }
    },
    methods: {
        selectAllOnClick(e) {
            const el = e?.target
            if (!el || !el.value) return
            try {
                el.select()
                el.setSelectionRange(0, el.value.length)
            } catch (_) {}
        },
        onInput(e) {
            this.day = (this.day || '').replace(/\D/g, '').slice(0, 2)
            this.month = (this.month || '').replace(/\D/g, '').slice(0, 2)
            this.year = (this.year || '').replace(/\D/g, '').slice(0, 4)

            if (e?.target === this.$refs.dd) {
                const A =
                    typeof e.data === 'string' && e.data.length === 1 && /^\d$/.test(e.data)
                        ? parseInt(e.data, 10)
                        : NaN
                const B = this.day !== '' ? parseInt(this.day, 10) : NaN

                if (
                    (Number.isFinite(A) && A >= 4 && Number.isFinite(B) && B <= 10) ||
                    (Number.isFinite(B) && this.day.length === 2)
                ) {
                    if (this.$refs.mm) {
                        if (B < 10) this.day = this.day.padStart(2, '0')
                        this.$refs.mm.focus({ preventScroll: true })
                        this.$nextTick(() => {
                            const el = this.$refs.mm
                            if (el && (this.month || '').length > 0) el.select()
                        })
                    }
                }
            } else if (e?.target === this.$refs.mm) {
                const A =
                    typeof e.data === 'string' && e.data.length === 1 && /^\d$/.test(e.data)
                        ? parseInt(e.data, 10)
                        : NaN
                const B = this.month !== '' ? parseInt(this.month, 10) : NaN

                if (
                    (Number.isFinite(A) && A >= 2 && Number.isFinite(B) && B <= 10) ||
                    (Number.isFinite(B) && this.month.length === 2)
                ) {
                    if (this.$refs.yyyy) {
                        if (B < 10) this.month = this.month.padStart(2, '0')
                        this.$refs.yyyy.focus({ preventScroll: true })
                        this.$nextTick(() => {
                            const el = this.$refs.yyyy
                            if (el && (this.year || '').length > 0) el.select()
                        })
                    }
                }
            }

            const d = parseInt(this.day, 10)
            const m = parseInt(this.month, 10)
            if (
                this.day.length === 2 &&
                this.month.length === 2 &&
                this.year.length === 4 &&
                m >= 1 &&
                m <= 12 &&
                d >= 1 &&
                d <= 31
            ) {
                const iso = `${this.year}-${this.month.padStart(2, '0')}-${this.day.padStart(2, '0')}`
                this.$emit('update:modelValue', iso)
            } else {
                this.$emit('update:modelValue', null)
            }
        },
        emitEnter() {
            this.$emit('enter')
        },
        onSearchClick() {
            this.emitEnter()
        },
        onBackspaceKey(field, e) {
            if (e.key !== 'Backspace') return

            // map field -> ref id ในเทมเพลต
            const refKey = (f) => ({ day: 'dd', month: 'mm', year: 'yyyy' })[f]

            // ช่วยโฟกัส + ตั้ง caret
            const focusRef = (f) => {
                const el = this.$refs[refKey(f)]
                if (!el) return null
                el.focus({ preventScroll: true })
                this.$nextTick(() => {
                    try {
                        // วาง caret ที่ท้ายตัวอักษร (หรือ 0 ถ้าว่าง)
                        const L = (this[f] || '').length
                        el.setSelectionRange(L, L)
                    } catch (_) {}
                })
                return el
            }

            const order = ['day', 'month', 'year']
            const idx = order.indexOf(field)
            if (idx <= 0) return // ซ้ายสุดไม่ต้องข้าม

            // ทำงานเฉพาะตอนช่องปัจจุบันว่างอยู่แล้วเท่านั้น
            if ((this[field] || '').length > 0) return

            // หา field ซ้ายสุดที่ "มีค่า" ใกล้ที่สุด -> โฟกัส + ลบทั้งช่อง
            for (let i = idx - 1; i >= 0; i--) {
                const f = order[i]

                // โฟกัสไปช่องซ้ายก่อนเสมอ เพื่อให้เคอร์เซอร์ย้ายจริง
                focusRef(f)

                if ((this[f] || '').length > 0) {
                    this[f] = '' // ลบทั้งช่อง
                    this.updateModel?.() // sync v-model
                    // caret จะถูกตั้งอีกรอบหลัง nextTick (เป็นตำแหน่ง 0 เพราะว่าง)
                    e.preventDefault()
                    return
                }
                // ว่างก็เลื่อนไปซ้ายต่อ
            }

            // ถ้าซ้ายทั้งหมดว่าง: โฟกัสไว้ที่ day
            focusRef('day')
            e.preventDefault()
        },
        updateModel() {
            // ย้าย logic ปลายฟังก์ชัน onInput เดิมมาไว้ที่นี่ เพื่อเรียกซ้ำได้
            const d = parseInt(this.day, 10)
            const m = parseInt(this.month, 10)
            if (
                (this.day || '').length === 2 &&
                (this.month || '').length === 2 &&
                (this.year || '').length === 4 &&
                m >= 1 &&
                m <= 12 &&
                d >= 1 &&
                d <= 31
            ) {
                const iso = `${this.year}-${this.month.padStart(2, '0')}-${this.day.padStart(2, '0')}`
                this.$emit('update:modelValue', iso)
            } else {
                this.$emit('update:modelValue', null)
            }
        },
    },
}
</script>

<style scoped>
/* ===== Container ===== */
.birthday {
    display: inline-flex;
    align-items: center;
    height: 48px;
    background: transparent;
    color: #464646;
}

/* ===== Inputs ===== */
.birthday input {
    -webkit-appearance: none;
    appearance: none;
    border: 0;
    outline: 0;
    background: transparent;
    font: inherit;
    color: inherit;
    text-align: center;
    line-height: 24px;
    padding: 12px 8px 10px;
    width: 56px;
}

/* ปรับขนาดช่องปี */
.birthday input.year {
    width: 72px;
    padding-right: 14px;
}

/* โฟกัส: ขยายเส้นไฮไลท์เต็มความกว้าง */
.birthday input:focus {
    background-size:
        100% 2px,
        100% 1px;
}

/* placeholder */
.birthday input::placeholder {
    color: #999fb7;
}

/* คั่นสแลช */
.birthday span {
    margin: 0 4px;
    color: #464646;
    user-select: none;
}

/* ===== Search Button ===== */
.birthday .icon-btn {
    border: 0;
    background: transparent;
    height: 48px;
    padding: 0 10px;
    margin-left: 4px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #464646;
    transition: opacity 0.2s ease;
}
.birthday .icon-btn:disabled {
    opacity: 0.5;
    cursor: default;
}
.birthday .icon-btn svg {
    width: 20px;
    height: 20px;
    display: block;
}
</style>
