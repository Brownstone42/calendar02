<template>
    <div class="home-wrap">
        <div class="mt-4 birthday">
            <birthdayInput v-model="birthday" @enter="handleEnter"></birthdayInput>
        </div>

        <div class="sub-header mt-2" ref="subHeaderEl">
            <span
                v-for="(t, i) in tabs"
                :key="t.key"
                class="tab"
                :class="{ active: current === t.key }"
                @click="setActive(i)"
                :ref="(el) => (tabEls[i] = el)"
            >
                {{ t.label }}
                <span v-if="i < tabs.length - 1" class="divider">/</span>
            </span>

            <div class="underline" :style="underlineStyle"></div>
        </div>

        <router-view class="router-wrap" />
    </div>
</template>

<script>
import birthdayInput from '@/components/common/birthdayInput.vue'
import { useSessionStore } from '@/stores/session'

export default {
    name: 'Home',
    components: {
        birthdayInput,
    },
    data() {
        return {
            birthday: '1989-08-26',
            tabs: [
                { key: 'monthly', label: 'Monthly' },
                { key: 'compass', label: 'Compass' },
                { key: 'danger', label: 'Danger' },
            ],
            current: 'monthly',
            activeIndex: 0,
            tabEls: [],
            underlinePos: { x: 0, w: 0 },
        }
    },
    created() {
        this.syncFromRoute()
    },
    mounted() {
        this.$nextTick(this.updateUnderline) // ✅ เริ่มต้นครั้งแรก
    },
    computed: {
        underlineStyle() {
            return {
                width: this.underlinePos.w + 'px',
                transform: `translateX(${this.underlinePos.x}px)`,
            }
        },
    },
    methods: {
        handleEnter() {
            if (history.length > 100) {
                console.log('reset')
            }
            const session = useSessionStore()
            session.setBirthday(this.birthday)
            console.log('Saved birthday:', this.birthday)
        },
        setActive(i) {
            const tab = this.tabs[i]
            if (!tab) return
            this.activeIndex = i
            this.current = tab.key
            if (this.$route.name !== tab.key) this.$router.push({ name: tab.key })
            this.$nextTick(this.updateUnderline) // ✅ อัปเดตเส้นหลัง DOM เปลี่ยน
        },
        syncFromRoute() {
            const idx = this.tabs.findIndex((t) => t.key === this.$route.name)
            const safeIdx = idx >= 0 ? idx : 0
            this.activeIndex = safeIdx
            this.current = this.tabs[safeIdx].key
        },
        updateUnderline() {
            const el = this.tabEls[this.activeIndex]
            const wrap = this.$refs.subHeaderEl
            if (!el || !wrap) return
            // คำนวณระยะซ้ายของแท็บเทียบกับคอนเทนเนอร์
            const left = el.offsetLeft - wrap.offsetLeft
            const width = el.offsetWidth
            this.underlinePos = { x: left, w: width }
        },
    },
    watch: {
        birthday() {
            const session = useSessionStore()
            session.clearBirthday()
        },
        '$route.name'() {
            this.syncFromRoute()
            this.$nextTick(this.updateUnderline)
        },
    },
}
</script>

<style scoped>
.home-wrap {
    margin-top: 4rem;
    padding: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: rgba(236, 232, 224, 1);
    height: calc(100vh - 64px);
}
.birthday {
    margin-left: 35px;
}
.router-wrap {
    width: 100%;
    flex: 1;
    overflow-y: auto;
}
.sub-header {
    position: relative;
    width: 100%;
    display: flex;
    border-bottom: 1px solid #ddd;
    user-select: none;
    color: #464646;
    flex-shrink: 0;
    height: 50px;
}
.tab {
    flex: 1 1 0;
    text-align: center;
    padding: 12px 0;
    cursor: pointer;
    position: relative;
    font-weight: 500;
    transition: color 0.2s;
}
.tab:not(:first-child)::before {
    content: '/';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translate(-50%, -50%);
    opacity: 0.5;
    pointer-events: none;
}
.tab.active::after {
    content: none;
}
.tab.active {
    font-weight: 900;
}
.tab:hover {
    background: rgba(70, 70, 70, 0.03);
}
.divider {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translate(50%, -50%);
    opacity: 0.4;
}
.underline {
    position: absolute;
    bottom: -1px;
    left: 0;
    height: 3px;
    background-color: #464646;
    transition:
        transform 0.45s cubic-bezier(0.25, 1, 0.5, 1),
        width 0.3s ease;
    will-change: transform, width;
}
</style>
