<template>
    <div class="progress-bar">
        <div
            class="progress-track"
            ref="track"
            :style="{
                '--track-color': trackColor,
                '--fill-color': fillColor,
                '--separator-color': separatorColor,
                '--separator-w': separatorWidth + 'px',
            }"
        >
            <!-- แถบพลัง -->
            <div
                class="progress-fill"
                :style="{
                    width: current + '%',
                    transition: `width ${duration}ms ease-out`,
                }"
            />
        </div>
    </div>
</template>

<script>
export default {
    name: 'ProgressBar',
    props: {
        percent: { type: Number, required: true },
        duration: { type: Number, default: 800 },
        delay: { type: Number, default: 0 },
        threshold: { type: Number, default: 0.3 },
        once: { type: Boolean, default: true },

        /* ปรับแต่งโทนสีได้ */
        trackColor: { type: String, default: '#E5E8E7' }, // เทาพื้นหลัง
        fillColor: { type: String, default: '#90B1B6' }, // ฟ้านุ่ม
        separatorColor: { type: String, default: '#FFFFFF' }, // เส้นคั่น
        separatorWidth: { type: Number, default: 3 }, // px
    },
    data() {
        return { current: 0, io: null, hasPlayed: false }
    },
    mounted() {
        this.io = new IntersectionObserver(
            (entries) => {
                const isInView = entries.some(
                    (e) => e.isIntersecting && e.intersectionRatio >= this.threshold,
                )
                if (isInView) this.play()
            },
            { root: null, threshold: [this.threshold] },
        )
        this.io.observe(this.$refs.track)
    },
    beforeDestroy() {
        if (this.io) this.io.disconnect()
    },
    watch: {
        percent() {
            if (!this.once || !this.hasPlayed) {
                this.reset()
                this.$nextTick(() => this.play())
            }
        },
    },
    methods: {
        play() {
            if (this.once && this.hasPlayed) return
            this.hasPlayed = true
            this.current = 0
            window.setTimeout(() => {
                this.current = Math.max(0, Math.min(100, this.percent))
            }, this.delay)
        },
        reset() {
            this.current = 0
            this.hasPlayed = false
        },
    },
}
</script>

<style scoped>
.progress-bar {
    width: 100%;
}

/* แทร็กสีเทา */
.progress-track {
    position: relative;
    width: 100%;
    height: 8px; /* ปรับความสูงได้ */
    background: var(--track-color);
    border-radius: 2px; /* ปรับมุมได้ */
    overflow: hidden; /* ตัดส่วนเกินของ fill + เส้นคั่น */
}

/* แถบสีฟ้า + เส้นคั่นสีขาวปลายขวา */
.progress-fill {
    position: relative;
    height: 100%;
    width: 0%;
    background: var(--fill-color);
}

/* เส้นคั่นสีขาว: ติดปลายขวาของแถบฟ้า */
.progress-fill::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: var(--separator-w);
    height: 100%;
    background: var(--separator-color);
    opacity: 1;
    /* ซ่อนกรณีไม่มีพลังเลย หรือเต็ม 100% เพื่อไม่ให้เห็น "ขอบขาว" เกินจริง */
}

/* ถ้ากว้าง = 0 → ซ่อนเส้นคั่น */
.progress-fill[style*='width: 0%']::after,
.progress-fill[style*='width: 0%;']::after {
    opacity: 0;
}

/* ถ้าเต็มหลอด 100% → ซ่อนเส้นคั่นให้ดูเต็มสนิท */
.progress-fill[style*='width: 100%']::after,
.progress-fill[style*='width: 100%;']::after {
    opacity: 0;
}
</style>
