<template>
	<div class="progress-bar">
		<div class="progress-track" ref="track">
			<div class="progress-fill" :style="{ width: current + '%' }"></div>
			<!-- overlay ของเส้นแบ่ง -->
			<div class="ticks" aria-hidden="true">
				<div class="tick" v-for="i in 9" :key="i" :style="{ left: i * 10 + '%' }" />
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'ProgressBar',
	props: {
		/** เป้าหมายสุดท้าย (0-100) */
		percent: { type: Number, required: true },
		/** ms ของแอนิเมชัน */
		duration: { type: Number, default: 800 },
		/** หน่วงเวลาเริ่ม (ms) */
		delay: { type: Number, default: 0 },
		/** threshold ที่ต้องเห็นกี่ % ของ element จึงจะเริ่ม */
		threshold: { type: Number, default: 0.3 },
		/** เล่นแค่ครั้งเดียวหรือให้เล่นใหม่เมื่อค่าเปลี่ยน */
		once: { type: Boolean, default: true },
	},
	data() {
		return { current: 0, io: null, hasPlayed: false }
	},
	mounted() {
		// เซ็ต transition ด้วย JS เพื่อให้ duration ปรับได้ผ่าน prop
		this.$el.querySelector('.progress-fill').style.transition =
			`width ${this.duration}ms ease-out`

		// สร้าง observer
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
			// ถ้าไม่ได้ตั้ง once หรือยังไม่เคยเล่น ให้พร้อมเล่นใหม่
			if (!this.once || !this.hasPlayed) {
				this.reset()
				// ถ้าอยู่ในวิวนาทีนี้ ให้เล่นเลย
				this.$nextTick(() => this.play())
			}
		},
	},
	methods: {
		play() {
			if (this.once && this.hasPlayed) return
			this.hasPlayed = true
			// เริ่มจาก 0 → เป้าหมาย
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
.progress-track {
	position: relative;
	width: 100%;
	height: 20px;
	background: #ebebeb;
	overflow: hidden;
}
/* แถบเติม */
.progress-fill {
	position: relative; /* สร้าง stacking context ของตัวเอง */
	height: 100%;
	width: 0%;
	background: #666;
	z-index: 1; /* ต่ำกว่า ticks */
	transition: width 800ms ease-out;
}
/* ชั้น overlay สำหรับเส้นขีด */
.ticks {
	position: absolute;
	inset: 0; /* top/right/bottom/left = 0 */
	z-index: 2; /* อยู่เหนือ fill เสมอ */
	pointer-events: none; /* ไม่บังการคลิก */
}
/* เส้นขีดแต่ละเส้น */
.tick {
	position: absolute;
	top: 0;
	bottom: 0;
	width: 1px;
	background: rgba(255, 255, 255, 1); /* ปรับสีตามธีมได้ */
	transform: translateX(-0.5px); /* จิ้มให้อยู่กึ่งกลางพอดี */
}
</style>
