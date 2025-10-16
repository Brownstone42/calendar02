<template>
    <div class="zodiac-container">
        <div class="zodiac-wrap">
            <img class="layer yinyang" src="/images/circle-1a.svg" alt="yin yang" />
            <img class="layer wheel" src="/images/circle-4a.svg" alt="wheel" />
            <img class="layer animal" src="/images/circle-3a.svg" alt="animal" />
            <img
                class="layer highlight year"
                src="/images/circle-2a.svg"
                alt="highlight year"
                :style="{ transform: rotations.hour }"
            />
            <img
                class="layer highlight month"
                src="/images/circle-2a.svg"
                alt="highlight month"
                :style="{ transform: rotations.minute }"
            />
            <img
                class="layer text"
                src="/images/circle-y.svg"
                alt="year"
                :style="{ transform: rotations.year }"
                v-if="type == 'normal' || type == 'md'"
            />
            <img
                class="layer text"
                src="/images/circle-m.svg"
                alt="month"
                :style="{ transform: rotations.month }"
                v-if="type == 'normal' || type == 'yd'"
            />
            <img
                class="layer text"
                src="/images/circle-d.svg"
                alt="day"
                :style="{ transform: rotations.day }"
                v-if="type == 'normal' || type == 'ym'"
            />
            <img
                class="layer text"
                src="/images/circle-ym.svg"
                alt="year month"
                :style="{ transform: rotations.year }"
                v-if="type == 'ym'"
            />
            <img
                class="layer text"
                src="/images/circle-yd.svg"
                alt="year day"
                :style="{ transform: rotations.year }"
                v-if="type == 'yd'"
            />
            <img
                class="layer text"
                src="/images/circle-md.svg"
                alt="month day"
                :style="{ transform: rotations.month }"
                v-if="type == 'md'"
            />
            <img
                class="layer text"
                src="/images/circle-ymd.svg"
                alt="year month day"
                :style="{ transform: rotations.year }"
                v-if="type == 'ymd'"
            />
        </div>
    </div>
</template>

<script>
export default {
    name: 'circleZodiac',
    props: {
        pillar: {
            type: Object,
            required: true, // { cyz, cmz, yz, mz, dz }
        },
    },
    computed: {
        rotations() {
            // Accept both “Goat” and the misspelled “Goad” just in case.
            const z2deg = {
                Rat: 0,
                Ox: 30,
                Tiger: 60,
                Rabbit: 90,
                Dragon: 120,
                Snake: 150,
                Horse: 180,
                Goat: 210,
                Monkey: 240,
                Rooster: 270,
                Dog: 300,
                Pig: 330,
            }
            const deg = (name) => (name && z2deg[name]) ?? 0

            return {
                year: `rotate(${deg(this.pillar?.yz)}deg)`,
                month: `rotate(${deg(this.pillar?.mz)}deg)`,
                day: `rotate(${deg(this.pillar?.dz)}deg)`,
                hour: `rotate(${deg(this.pillar?.cyz)}deg)`,
                minute: `rotate(${deg(this.pillar?.cmz)}deg)`,
            }
        },
        type() {
            let type = ''
            const year = this.pillar?.yz
            const month = this.pillar?.mz
            const day = this.pillar?.dz

            if ((year == month) == day) type = 'ymd'
            else if (year == month) type = 'ym'
            else if (year == day) type = 'yd'
            else if (month == day) type = 'md'
            else type = 'normal'

            return type
        },
    },
    mounted() {
        console.log(this.pillar)
    },
}
</script>

<style scoped>
.zodiac-wrap .layer,
.zodiac-wrap img,
.zodiac-wrap svg {
    pointer-events: none;
}
.zodiac-container {
    width: 100%;
}
.zodiac-wrap {
    position: relative;
    width: min(70vmin, 520px);
    aspect-ratio: 1 / 1;
    margin: auto;
}
img.yinyang {
    z-index: 2;
}
img.wheel {
    z-index: 1;
}
img.animal {
    z-index: 4;
}
img.highlight {
    z-index: 3;
}
img.text {
    z-index: 5;
}
.zodiac-wrap .layer {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    image-rendering: auto;
    transform-origin: 50% 50%;
    transition: transform 500ms ease;
}
</style>
