<template>
    <div class="zodiac-container">
        <div class="zodiac-wrap">
            <img class="layer base" src="/images/circle1.svg" alt="zodiac animals" />
            <img class="layer highlight" src="/images/circle2.svg" alt="outer labels" />
            <img class="layer hour" src="/images/circle3a.svg" alt="outer labels" />
            <img class="layer minute" src="/images/circle4a.svg" alt="outer labels" />
        </div>
    </div>
</template>

<script>
export default {
    name: 'circleZodiac',
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
