<template>
    <div class="main-wrap">
        <div class="mt-4">
            <birthdayInput v-model="birthday" @enter="handleEnter"></birthdayInput>
        </div>
    </div>
    <div class="sub-header mt-2">
        <span
            v-for="(t, i) in tabs"
            :key="t.key"
            class="tab"
            :class="{ active: current === t.key }"
            @click="setActive(i)"
        >
            {{ t.label }}
            <span v-if="i < tabs.length - 1" class="divider">/</span>
        </span>

        <div class="underline" :style="underlineStyle"></div>
    </div>
    <router-view class="tab-panel" />
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
        }
    },
    created() {
        this.syncFromRoute()
    },
    computed: {
        underlineStyle() {
            return {
                transform: `translateX(${this.activeIndex * 100}%)`,
            }
        },
    },
    methods: {
        handleEnter() {
            if (history.length > 100) {
                console.log(reset)
            }
            const session = useSessionStore()
            session.setBirthday(this.birthday)
            console.log('Saved birthday:', this.birthday)
        },
        setActive(i) {
            const tab = this.tabs[i]

            this.activeIndex = i
            this.current = tab.key
            this.$router.push({ name: tab.key })
        },
        syncFromRoute() {
            let idx = this.tabs.findIndex((t) => t.key === this.$route.name)
            this.activeIndex = idx
            this.current = this.tabs[idx].key
        },
    },
    watch: {
        birthday() {
            const session = useSessionStore()
            session.clearBirthday()
        },
    },
}
</script>

<style scoped>
div.main-wrap {
    margin-top: 4rem;
    padding: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
}
div.sub-header {
    position: relative;
    width: 100%;
    display: flex;
    border-bottom: 1px solid #ddd;
    user-select: none;
    background-color: rgba(134, 25, 25, 0.699);
    color: white;
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
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1px;
    height: 3px;
    background: currentColor;
}
.tab.active {
    font-weight: 900;
}
.tab:hover {
    background: rgba(0, 0, 0, 0.03);
}
.tab-panel {
    padding: 12px 0;
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
    width: calc(100% / 3);
    height: 3px;
    background: #524b4b;
    transition: transform 0.3s ease;
}
</style>
