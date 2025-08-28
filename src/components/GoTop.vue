<script setup>
import { onMounted, onUnmounted } from 'vue';

const scrollGotop = () => {
    if (window.scrollY > 100) {
        document.querySelector('.gt').style.display = 'block';
        toGoptop;
    }else {
        document.querySelector('.gt').style.display = 'none';
    }
};

const toGoptop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
};

onMounted (() => {
    window.addEventListener('scroll', scrollGotop);
});

onUnmounted(() => {
    window.removeEventListener('scroll', scrollGotop);
});

</script>
<template>
    <div class="gt" @click="toGoptop"></div>
</template>
<style scoped>
.gt{
    width: 59px;
    height: 59px;
    opacity: 0.7;
    background: url(../assets/imgs/icon.png) -20px -813px no-repeat;
    position: fixed;
    bottom: 120px;
    right: 40px;
    border-radius: 21%;
    z-index: 80;
    display: none;
    cursor: pointer;
}
.gt:hover{
    opacity: 0.3;
}
.gt:active{
    opacity: 1;
}
</style>
