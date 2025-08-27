<script setup>
    
</script>
<template>
    <div class="sad">
        <div class="sad1">
            <a href="javascript:void()">
                <img src="../assets/imgs/sad1.png" alt="">
            </a>
        </div>
        <div class="sad2">
            <a href="javascript:void()">
                <img src="../assets/imgs/sad2.png" alt="">
            </a>
        </div>
        <div class="sad3">
            <a href="javascript:void()">
                <img src="../assets/imgs/sad3.png" alt="">
            </a>
        </div>
        <div class="sad4">
            <a href="javascript:void()">
                <img src="../assets/imgs/sad4.png" alt="">
            </a>
        </div>
        <div class="sad5">
            <a href="javascript:void()">
                <img src="../assets/imgs/sad5.png" alt="">
            </a>
        </div>
    </div>
</template>
<style scoped>
.sad{
    width: 1000px;
    height: 400px;
    margin: 0 auto;
    margin-bottom: 40px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
}
.sad>div{
    width: 320px;
    height: 192px;
    object-fit: cover;
}
.sad2 {
    grid-row: span 2;
}
</style>
