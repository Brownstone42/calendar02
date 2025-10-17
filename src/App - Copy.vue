<template>
    <the-header></the-header>
    <router-view></router-view>
</template>

<script>
import theHeader from './components/common/theHeader.vue'

export default {
    name: 'App',
    components: {
        theHeader,
    },
}
</script>

<style>
html,
body {
    height: 100%;
}
#app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}
@font-face {
    font-family: 'D-DIN Condensed';
    src: url('./fonts/D-DINCondensed.otf') format('opentype');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
}
</style>
