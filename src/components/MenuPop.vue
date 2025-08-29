<script setup>
const displayNone = () => {
    document.querySelector('.mp').style.display = 'none';
}
</script>
<template>
    <div class="mp">
        <div class="mp-img"></div>
        <div class="mp-btu" @click="displayNone"></div>
    </div>
</template>
<style scoped>
.mp{
    width: 143px;
    height: 498px;
    position: fixed;
    top: 20%;
    right: 0;
    z-index: 81;
}
.mp-img{
    width: 143px;
    height: 498px;
    background: url('../assets/imgs/30892.png') no-repeat;
    background-size: cover;
}
.mp-btu{
    width: 20px;
    height: 20px;
    position: absolute;
    top: 15px;
    right: 15px;
    cursor: pointer;
}
</style>
