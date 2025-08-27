<script setup>
import '../assets/css/11.css';

const begin = () => {
    const ostImg = document.querySelector('.ost-img');
    ostImg.style.animationPlayState = 'running';
};
const end = () => {
    const ostImg = document.querySelector('.ost-img');
    ostImg.style.transform = 'translate(0px)';
}

</script>
<template>
    <div class="os">
        <div class="os-title" @mouseenter="begin" @mouseleave="end">
            <div class="ost-img"></div>
            <div class="ost-text">良品商店&nbsp;/&nbsp;OUR SHOP</div>
        </div>
        <div class="os-lis">
            <div class="osl-li1">
                <div class="osll-img"></div>
                <div class="osll-text">
                    <div class="osll-p1">全球精品</div>
                    <div class="osll-p2">Global Selections</div>
                </div>
            </div>
             <div class="osl-li2">
                <div class="osll-img"></div>
                <div class="osll-text">
                    <div class="osll-p1">正品保证</div>
                    <div class="osll-p2">Authenticity Guaranteed</div>
                </div>
            </div>
             <div class="osl-li3">
                <div class="osll-img"></div>
                <div class="osll-text">
                    <div class="osll-p1">全场包邮</div>
                    <div class="osll-p2">Free Delivery</div>
                </div>
            </div>
             <div class="osl-li4">
                <div class="osll-img"></div>
                <div class="osll-text">
                    <div class="osll-p1">客服邮箱</div>
                    <div class="osll-p2">kefu@iliangcang.com</div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
</style>
