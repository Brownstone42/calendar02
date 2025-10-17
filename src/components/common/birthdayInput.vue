<template>
    <div class="birthday">
        <!-- ไอคอน -->
        <div class="icon">
            <!-- เค้ก/เทียน: ซ่อนเมื่อมีราศี -->
            <div class="normal" :class="{ hide: showZodiac }">
                <svg
                    viewBox="0 0 36 36"
                    class="cake-smoke"
                    fill="none"
                    stroke="currentColor"
                    aria-hidden="true"
                >
                    <path
                        d="M18 11C18 11 18.832 7.48792 20.25 7C20.8172 6.80483 21.1828 7.19517 21.75 7C23.168 6.51208 24 3 24 3"
                    />
                    <path
                        d="M17 8C17 8 16.0731 6.29007 15.2857 6C14.849 5.8391 14.5663 6.24699 14.1429 6C13.1961 5.44772 13 2 13 2"
                    />
                    <path
                        d="M18.0916 5C18.0916 5 17.8855 4.20779 18.0916 3.71429C18.3987 2.97862 20 2 20 2"
                    />
                </svg>
                <svg class="cake-light" viewBox="0 0 36 36" aria-hidden="true">
                    <use xlink:href="#cake-light" />
                </svg>
                <svg class="cake" viewBox="0 0 36 36" aria-hidden="true">
                    <use xlink:href="#cake" />
                </svg>
            </div>

            <!-- ราศี: โชว์ตัวที่ตรงกับวัน/เดือน -->
            <div class="zodiac">
                <div
                    v-for="(z, i) in zodiacs"
                    :key="z"
                    :class="['z', z, { show: zodiacName === z }]"
                    :style="{ '--offset': `${-24 * i}px` }"
                ></div>
            </div>
        </div>

        <!-- DD / MM / YYYY (ไม่มี key mechanics) -->
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
        />

        <button
            class="icon-btn search-btn"
            type="button"
            aria-label="Search"
            @click="onSearchClick"
            :disabled="!searchEnabled"
        >
            <!-- magnifying glass -->
            <svg viewBox="0 0 24 24" aria-hidden="true" style="fill: white">
                <path
                    d="M15.5 14h-.79l-.28-.27a6.471 6.471 0 0 0 1.57-4.23 6.5 6.5 0 1 0-6.5 6.5 6.471 6.471 0 0 0 4.23-1.57l.27.28v.79l5 5 1.5-1.5-5-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                />
            </svg>
        </button>

        <!-- SVG symbols -->
        <svg xmlns="http://www.w3.org/2000/svg" style="display: none">
            <symbol viewBox="0 0 36 36" id="cake-light" fill="currentColor">
                <path
                    d="M21 10.5C21 12.1569 19.6569 13.5 18 13.5C16.3431 13.5 15 12.1569 15 10.5C15 8.84315 18 3.5 18 3.5C18 3.5 21 8.84315 21 10.5Z"
                />
            </symbol>
            <symbol viewBox="0 0 36 36" id="cake" fill="currentColor">
                <path
                    d="M19.5 14V14C19.2793 12.2344 16.7207 12.2344 16.5 14V14C11.25 14.3 6 15.95 6 19.25V23.75C6 27.35 12.15 29 18 29C23.85 29 30 27.35 30 23.75V19.25C30 15.95 24.75 14.3 19.5 14ZM16.5 17V18.5C16.5 19.4 17.1 20 18 20C18.9 20 19.5 19.4 19.5 18.5V17C24.15 17.3 26.7 18.65 27 19.25C26.7 19.85 23.7 21.5 18 21.5C12.3 21.5 9.15 19.85 9 19.25C9.15 18.65 11.7 17.3 16.5 17Z"
                />
            </symbol>
        </svg>
    </div>
</template>

<script>
export default {
    name: 'BirthdayInput',
    props: {
        /* v-model: 'YYYY-MM-DD' หรือ null */
        modelValue: { type: String, default: null },
        searchEnabled: { type: Boolean, default: true },
    },
    emits: ['update:modelValue', 'enter'],
    data() {
        return {
            day: '',
            month: '',
            year: '',
            zodiacs: [
                'capricorn',
                'aquarius',
                'pisces',
                'aries',
                'taurus',
                'gemini',
                'cancer',
                'leo',
                'virgo',
                'libra',
                'scorpio',
                'sagittarius',
            ],
        }
    },
    computed: {
        zodiacName() {
            const d = parseInt(this.day, 10)
            const m = parseInt(this.month, 10)
            if (!d || !m || d < 1 || d > 31 || m < 1 || m > 12) return ''
            // เกณฑ์เหมือนใน CodePen เดิม
            const last = ['', 19, 18, 20, 20, 21, 21, 22, 22, 21, 22, 21, 20, 19]
            const z = ['', ...this.zodiacs, this.zodiacs[0]]
            return d > last[m] ? z[m + 1] : z[m]
        },
        showZodiac() {
            return !!this.zodiacName
        },
    },
    mounted() {
        // เติมค่าจาก v-model หากมี
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
            if (!el || !el.value) return // ว่างไม่ต้อง select
            try {
                el.select() // เลือกทั้งหมด
                el.setSelectionRange(0, el.value.length)
            } catch (_) {}
        },
        onInput(e) {
            console.log(e.data)
            // เก็บแค่ตัวเลข และจำกัดความยาว
            this.day = (this.day || '').replace(/\D/g, '').slice(0, 2)
            this.month = (this.month || '').replace(/\D/g, '').slice(0, 2)
            this.year = (this.year || '').replace(/\D/g, '').slice(0, 4)

            if (e?.target === this.$refs.dd) {
                // A = ตัวที่เพิ่งพิมพ์ (เฉพาะเคส insertText 1 ตัวอักษร)
                const A =
                    typeof e.data === 'string' && e.data.length === 1 && /^\d$/.test(e.data)
                        ? parseInt(e.data, 10)
                        : NaN

                // B = ค่าหลังกรอกเสร็จ (หลัง sanitize แล้ว)
                const B = this.day !== '' ? parseInt(this.day, 10) : NaN

                // ถ้า (A ≥ 4 และ B ≤ 10) หรือ (B ≥ 10) → โฟกัสไป Month ทันที
                if (
                    (Number.isFinite(A) && A >= 4 && Number.isFinite(B) && B <= 10) ||
                    (Number.isFinite(B) && this.day.length == 2)
                ) {
                    if (this.$refs.mm) {
                        if (B < 10) {
                            this.day = this.day.padStart(2, '0')
                        }
                        this.$refs.mm.focus({ preventScroll: true })

                        this.$nextTick(() => {
                            const el = this.$refs.mm
                            if (el && (this.month || '').length > 0) {
                                el.select()
                            }
                        })
                    }
                }
            } else if (e?.target === this.$refs.mm) {
                // A = ตัวที่เพิ่งพิมพ์ (เฉพาะเคส insertText 1 ตัวอักษร)
                const A =
                    typeof e.data === 'string' && e.data.length === 1 && /^\d$/.test(e.data)
                        ? parseInt(e.data, 10)
                        : NaN

                // B = ค่าหลังกรอกเสร็จ (หลัง sanitize แล้ว)
                const B = this.month !== '' ? parseInt(this.month, 10) : NaN

                // ถ้า (A ≥ 2 และ B ≤ 10) หรือ (B ≥ 10) → โฟกัสไป Year ทันที
                if (
                    (Number.isFinite(A) && A >= 2 && Number.isFinite(B) && B <= 10) ||
                    (Number.isFinite(B) && this.month.length == 2)
                ) {
                    if (this.$refs.yyyy) {
                        if (B < 10) {
                            this.month = this.month.padStart(2, '0')
                        }
                        this.$refs.yyyy.focus({ preventScroll: true })

                        this.$nextTick(() => {
                            const el = this.$refs.yyyy
                            if (el && (this.year || '').length > 0) {
                                el.select()
                            }
                        })
                    }
                }
            }

            // อัปเดต v-model เมื่อครบแบบคร่าว ๆ (ยังไม่เช็คจำนวนวันตามเดือน)
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
    },
}
</script>

<style scoped>
.birthday {
    position: relative;
    display: inline-flex;
    align-items: center;
    border-radius: 8px;
    box-shadow: inset 0 0 0 1px #e6e7ee;
    height: 48px;
    padding: 0;
    box-shadow: none;
    background: transparent;
}

/* ===== Icon (fixed) ===== */
.icon {
    position: absolute;
    top: 12px;
    left: 12px;
    width: 24px;
    height: 24px;
}
.icon svg {
    position: absolute;
    inset: 0;
    width: 24px;
    height: 24px;
    display: block;
    color: #0077ff;
    transform: none !important;
}
.icon .normal {
    transition: opacity 0.2s;
}
.icon .normal.hide {
    opacity: 0;
}

/* ===== Zodiac sprite ===== */
.icon .zodiac .z {
    position: absolute;
    left: 0;
    top: 0;
    width: 24px;
    height: 24px;
    background: url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/165585/zodiac-signs-sprite%402x.png');
    background-size: auto 24px;
    background-position: var(--offset) 0;
    opacity: 0;
    transform: scale(0.6);
    transform-origin: top left;
    transition:
        transform 0.2s,
        opacity 0.2s;
}
.icon .zodiac .z.show {
    opacity: 1;
    transform: scale(1);
}

/* ===== Inputs ===== */
.birthday input {
    -webkit-appearance: none;
    appearance: none;
    border: none;
    outline: none;
    background: transparent;
    font: inherit;
    color: white;
    text-align: center;
    line-height: 24px;
    padding: 12px 8px;
    width: 56px; /* 2 ตัวอักษร */
}
.birthday input.year {
    width: 72px;
    padding-right: 14px;
}

/* ช่องแรกเว้นที่ให้ไอคอน + เพิ่ม width ตามที่ขอ */
.birthday input:first-of-type {
    padding-left: 44px; /* เผื่อพื้นที่ icon 24px + ช่องไฟ */
    width: 90px;
}

/* placeholder */
.birthday input::placeholder {
    color: #999fb7;
}

/* สแลชคั่น */
.birthday span {
    margin: 0 4px;
    color: white;
    user-select: none;
}

/* focus ring ทั้งกล่อง */
.birthday:focus-within {
    box-shadow: none;
}

.birthday .icon-btn {
    appearance: none;
    border: 0;
    background: transparent;
    height: 48px; /* ให้สูงเท่ากล่อง */
    padding: 0 10px;
    margin-left: 4px; /* เว้นจาก YYYY นิดนึง */
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: color 0.2s;
}
.birthday .icon-btn:hover,
.birthday .icon-btn:focus {
    outline: none;
}
.birthday .icon-btn svg {
    width: 20px;
    height: 20px;
    display: block;
}
</style>
