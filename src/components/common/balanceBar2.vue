<template>
    <div class="bar" style="--p: 35%"></div>
    <div class="bar mt-2" style="--p: 70%"></div>
    <div class="bar mt-2" style="--p: 100%"></div>
</template>

<script>
export default {
    name: 'balanceBar2',
}
</script>

<style scoped>
.bar {
    --p: 0%;
    position: relative;
    width: 100%;
    height: 10px;
    border-radius: 999px;
    background: #eee; /* สีเทาของหลอด */
    overflow: hidden;
}

/* gradient bar ด้านใน */
.bar::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(
        90deg,
        #ff8a5b 0%,
        /* แดงซ้ายสุด */ #a8e6a1 50%,
        /* เขียวตรงกลาง */ #ff8a5b 100% /* แดงขวาสุด */
    );
    mask: linear-gradient(90deg, #000 0 var(--p), transparent var(--p) 100%);
    -webkit-mask: linear-gradient(90deg, #000 0 var(--p), transparent var(--p) 100%);
    transition: all 0.3s ease;
}
</style>
