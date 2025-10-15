<template>
    <div class="zodiac-container">
        <div class="zodiac-wrap">
            <img class="layer base" src="/images/circle1.svg" alt="zodiac animals" />

            <!-- highlight rings -->
            <img
                class="layer highlight year"
                :style="{ transform: rotations.year }"
                src="/images/circle2.svg"
                alt="year"
            />
            <img
                class="layer highlight month"
                :style="{ transform: rotations.month }"
                src="/images/circle2.svg"
                alt="month"
            />
            <img
                class="layer highlight day"
                :style="{ transform: rotations.day }"
                src="/images/circle2.svg"
                alt="day"
            />

            <!-- time rings -->
            <img
                class="layer hour"
                :style="{ transform: rotations.hour }"
                src="/images/circle3a.svg"
                alt="hour"
            />
            <img
                class="layer minute"
                :style="{ transform: rotations.minute }"
                src="/images/circle4a.svg"
                alt="minute"
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
    },
    mounted() {
        console.log(this.pillar)
    },
}
</script>

<style scoped>
.zodiac-container {
    width: 100%;
    background-color: rgba(0, 0, 0, 0.8);
}
.zodiac-wrap {
    position: relative;
    width: min(80vmin, 520px);
    aspect-ratio: 1 / 1;
    margin: auto;
}
.zodiac-wrap .layer {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    image-rendering: auto;
    transform-origin: 50% 50%;
    transition: transform 500ms ease; /* smooth rotate (optional) */
}
.zodiac-wrap .base {
    z-index: 2;
}
.zodiac-wrap .highlight {
    z-index: 1;
}
.zodiac-wrap .hour {
    z-index: 4;
}
.zodiac-wrap .minute {
    z-index: 3;
}
</style>
