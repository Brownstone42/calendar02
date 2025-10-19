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
#app {
    display: flex;
    flex-direction: column;
    font-family: 'Helvetica', 'D-DIN Condensed';
}
@font-face {
    font-family: 'D-DIN Condensed';
    src: url('./fonts/D-DINCondensed.otf') format('opentype');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
}
</style>
