<template>
    <div class="danger-wrap">
        <div class="sub-header">
            <span
                v-for="t in tabs"
                :key="t.key"
                class="tab"
                :class="{ active: t.key === activeKey }"
                @click="setActive(t.key)"
            >
                {{ t.yearStart }}-{{ t.yearEnd }}
            </span>
        </div>

        <div class="my-content px-4" v-if="sessionStore.birthday">
            <div v-if="activeKey == 'prev'">
                <div v-for="d in danger.prev" class="mt-3">
                    <span>{{ d.month + ` : ${getType(d.type)}` }}</span>
                    <span>{{ getSuggest(d.type, d.currentScore, d.clash).elementSuggest }}</span>
                    <span v-for="s in getSuggest(d.type, d.currentScore, d.clash).zodiacSuggest">
                        {{ s }}
                    </span>
                </div>
            </div>
            <div v-if="activeKey == 'lp0'">
                <div v-for="d in danger.lp0" class="mt-3">
                    <span>{{ d.month + ` : ${getType(d.type)}` }}</span>
                    <span>{{ getSuggest(d.type, d.currentScore, d.clash).elementSuggest }}</span>
                    <span v-for="s in getSuggest(d.type, d.currentScore, d.clash).zodiacSuggest">
                        {{ s }}
                    </span>
                </div>
            </div>
            <div v-if="activeKey == 'lp1'">
                <div v-for="d in danger.lp1" class="mt-3">
                    <span>{{ d.month + ` : ${getType(d.type)}` }}</span>
                    <span>{{ getSuggest(d.type, d.currentScore, d.clash).elementSuggest }}</span>
                    <span v-for="s in getSuggest(d.type, d.currentScore, d.clash).zodiacSuggest">
                        {{ s }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapStores } from 'pinia'
import { useSessionStore } from '@/stores/session'
import calculator from '@/utils/calculator'
import { getYear } from 'date-fns'

export default {
    name: 'Danger',
    data() {
        return {
            tabs: [],
            activeKey: null,
            danger: {},
            dm: '',
            dms: '',
        }
    },
    computed: {
        ...mapStores(useSessionStore),
    },
    watch: {
        'sessionStore.birthday': {
            immediate: true,
            handler(v) {
                if (!v || !this.sessionStore.birthday) return
                this.$nextTick(() => {
                    this.fetchData()
                })
            },
        },
    },
    methods: {
        getType(type) {
            let text = ''
            if (type == 'element') {
                text = 'ธาตุไม่สมดุลอย่างรุนแรง'
            } else if (type == 'zodiac') {
                text = 'นักกษัตริย์ชง(ไม่ดี) หลายจุด'
            } else {
                text = 'นักกษัตริย์ชง(ไม่ดี) และ ธาตุไม่สมดุลอย่างรุนแรง'
            }
            return text
        },
        getSuggest(type, score, clash) {
            let elementSuggest = ''
            let zodiacSuggest = []
            const relationScore = calculator.getRelationScore(score, this.dm)

            //console.log(relationScore)

            const support = relationScore.Support.element
            const self = relationScore.Self.element
            const output = relationScore.Output.element
            const wealth = relationScore.Wealth.element
            const control = relationScore.Control.element

            //console.log(type)
            //console.log(relationScore)

            if (type == 'element' || type == 'both') {
                if (this.dms == 'Strong') {
                    if (relationScore.max == 'Self') {
                        elementSuggest = `เนื่องจากมีพลังธาตุ ${self} เข้ามาเป็นจำนวนมาก แนะนำธาตุ ${control} เพื่อควบคุมพลังธาตุ ${self} และธาตุ ${output} เพื่อผ่องถ่ายพลังจากธาตุ ${self}`
                    } else if (relationScore.max == 'Support') {
                        elementSuggest = `เนื่องจากมีพลังธาตุ ${support} เข้ามาเป็นจำนวนมาก แนะนำธาตุ ${wealth} เพื่อควบคุมพลังธาตุ ${support} และธาตุ ${output} เพื่อดูดพลังจากธาตุ ${support}`
                    }
                } else {
                    if (relationScore.max == 'Output') {
                        elementSuggest = `เนื่องจากมีพลังธาตุ ${output} เข้ามาเป็นจำนวนมาก แนะนำธาตุ ${support} เพื่อควบคุมพลังธาตุ ${output} และเติมพลังให้ธาตุ ${self}`
                    } else if (relationScore.max == 'Wealth') {
                        elementSuggest = `เนื่องจากมีพลังธาตุ ${wealth} เข้ามาเป็นจำนวนมาก แนะนำธาตุ ${self} เพื่อควบคุมพลังธาตุ ${wealth} หรือธาตุ ${support} เพื่อดูดพลังจากธาตุ ${wealth} มาเติมให้ธาตุ ${self}`
                    } else if (relationScore.max == 'Control') {
                        elementSuggest = `เนื่องจากมีพลังธาตุ ${control} เข้ามาเป็นจำนวนมาก แนะนำธาตุ ${support} เพื่อผ่องถ่ายพลังจากธาตุ ${control} เอามาให้กับธาตุ ${self}`
                    }
                }
            }

            if (type == 'zodiac' || type == 'both') {
                if (clash.yy) {
                    zodiacSuggest.push(
                        'ปี/ปี - โดยรวม อาจเกิดการย้ายที่อยู่/ที่ทำงาน หรือ มีเหตุ์ให้ต้องเดินทางบ่อย ให้ระวังอุบัติเหตุจากการเดินทาง',
                    )
                }
                if (clash.ym) {
                    zodiacSuggest.push(
                        'ปี/เดือน - เฉพาะเดือนนี้ อาจจะมีงานที่ต้องเดินทาง หรือ พบป่ะผู้คนกลุ่มใหม่ๆ ให้ระวังเรื่องอุบัติเหตุจากการเดินทาง หรือ ตารางนัดหมาย',
                    )
                }
                if (clash.my) {
                    zodiacSuggest.push(
                        'เดือน/ปี - โดยรวม อาจจะกระทบกระทั้งกับคนที่ทำงาน หรือมีการ เปลี่ยนทีมเปลี่ยนหัวหน้าหรือแม้กระทั่งเปลี่ยนบทบาทในบริษัท พยายามปรับตัวกับการเปลี่ยนแปลงที่อาจจะเกิดขึ้นในที่ทำงาน',
                    )
                }
                if (clash.mm) {
                    zodiacSuggest.push(
                        'เดือน/เดือน - เฉพาะเดือนนี้ อาจมีงานเร่งด่วน หรือ งานที่นัดหมายไว้อาจจะไม่เป็นไปตามแผน แนะนำให้ จัดตารางเวลางานให้ดีเผื่อเวลาสำรอง อย่าทำอะไรจวนตัว',
                    )
                }
                if (clash.dy) {
                    zodiacSuggest.push(
                        'วัน/ปี - โดยรวม อาจเกิดการกระทบกระทั่งกันกับคู่ครอง หรือ คนที่มีความสัมพันธ์ใกล้ชิด อาจมีเหตุการณ์ที่ทำให้ต้องเปลี่ยนวิธีการใช้ชีวิต ให้ระวังการตัดสินใจโดยใช้อารมณ์ รวมถึงเรื่องสุขภาพ',
                    )
                }
                if (clash.dm) {
                    zodiacSuggest.push(
                        'วัน/เดือน - เฉพาะเดือนนี้ อาจเกิดการกระทบกระทั่งกันกับคู่ครอง หรือ คนที่มีความสัมพันธ์ใกล้ชิด มีเหตุการณ์ฉับพลับเข้ามาทำให้ตัดสินใจไม่ตรงกัน จนเกิดการถกเถียงกัน แนะนำให้ระมัดระวังเรื่องอารมณ์และคำพูดกับคนใกล้ตัว โดยเฉพาะเมื่อต้องเจอกับการตัดสินใจที่ยากลำบาก',
                    )
                }
            }

            return { elementSuggest, zodiacSuggest }
        },
        setActive(key) {
            this.activeKey = key
        },
        isYearInRange(y, start, end) {
            return y >= Number(start) && y <= Number(end)
        },
        fetchData() {
            const birthday = this.sessionStore.birthday
            const pillars = calculator.getPillars(birthday, false, 'male')
            const luckPillars = calculator.getLuckPillars(pillars.luckPillars)
            const dayMaster = calculator.getDayMaster(pillars)
            const score = calculator.getScore(pillars)
            const dayMasterStrength = calculator.getDayMasterStrength(dayMaster, score)
            const favorite = calculator.getFavoriteElement(dayMaster, score, dayMasterStrength)

            const currentYear = getYear(new Date())

            const prev = {
                key: 'prev',
                yearStart: currentYear - 10,
                yearEnd: currentYear - 1,
            }

            const lp0 = {
                key: 'lp0',
                yearStart: currentYear,
                yearEnd: Number(luckPillars[0].yearEnd),
            }

            const lp1 = {
                key: 'lp1',
                yearStart: Number(luckPillars[1].yearStart),
                yearEnd: Number(luckPillars[1].yearEnd),
            }

            const danger = calculator.findDanger(
                score,
                dayMaster,
                favorite,
                pillars,
                prev.yearStart,
                lp0.yearStart,
                lp1.yearStart,
            )

            this.tabs = [prev, lp0, lp1]
            this.activeKey = 'lp0'
            this.danger = danger
            this.dm = dayMaster
            this.dms = dayMasterStrength
        },
    },
}
</script>

<style scoped>
.danger-wrap {
    display: flex;
    flex-direction: column;
}
.sub-header {
    flex-shrink: 0;
    padding: 10px 0;
    display: flex;
    width: 100%;
    height: 50px;
}
.my-content {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
}
.tab {
    flex: 1 1 0;
    text-align: center;
    cursor: pointer;
    position: relative;
    font-weight: 500;
    transition: color 0.2s;
    font-size: 15pt;
}
.tab.active {
    font-weight: 800;
    text-decoration: underline;
}
.danger {
    height: 100vh;
    overflow: auto;
}
.danger span {
    display: block;
    width: 100%;
}
span {
    color: black;
}
</style>
