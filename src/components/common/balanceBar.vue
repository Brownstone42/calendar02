<template>
    <!-- เปลี่ยนค่าได้ที่ --p -->
    <div class="bar" style="--p: 35%">
        <div class="grad"></div>
    </div>

    <div class="bar mt-2" style="--p: 70%">
        <div class="grad"></div>
    </div>

    <div class="bar mt-2" style="--p: 100%">
        <div class="grad"></div>
    </div>
</template>

<script>
export default {
    name: 'balanceBar',
}
</script>

<style scoped>
.bar {
    position: relative;
    width: 100%;
    height: 10px;
    border-radius: 999px;
    background: #eee; /* track สีเทา */
    overflow: hidden;
    --p: 0%; /* รับค่าจาก inline style */
}

/* gradient เต็ม 0–100% */
.grad {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(
        90deg,
        #a8e6a1 0%,
        #d7e96b 40%,
        #ffd166 60%,
        #ff8a5b 80%,
        #e63946 100%
    );

    /* ตัดให้เหลือ 0 → --p เท่านั้น */
    -webkit-mask: linear-gradient(90deg, #000 0 var(--p), transparent var(--p) 100%);
    mask: linear-gradient(90deg, #000 0 var(--p), transparent var(--p) 100%);
}
</style>
