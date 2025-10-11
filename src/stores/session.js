import { defineStore } from 'pinia'

export const useSessionStore = defineStore('session', {
    state: () => ({
        birthday: null,
        lastSetAt: 0,
    }),
    actions: {
        setBirthday(val) {
            this.birthday = val
            this.lastSetAt = Date.now()
        },
        clearBirthday() {
            this.birthday = null
            this.lastSetAt = 0
        },
    },
})
