<script setup>
import '../assets/css/ourShop.css';

const begin = () => {
    const ostImg = document.querySelector('.ost-img');
    ostImg.style.animationPlayState = 'running';
};
const end = () => {
    const ostImg = document.querySelector('.ost-img');
    ostImg.style.transform = 'translate(0px)';
    /**
     * ostImg.style.animationPlayState = 'paused';
    // 关键：重置动画到初始状态
    // 1. 移除当前应用的所有样式，以确保动画回到起点
    ostImg.style.animation = 'none'; // 移除所有动画属性
    // 2. 强制重绘 (reflow) 以确保样式更新生效
    ostImg.offsetHeight; // 这是一个常用的技巧来触发重绘
    // 3. 重新应用动画属性，使其回到初始状态
    ostImg.style.animation = 'ostImg 1.2s ease-in-out infinite';
    ostImg.style.animationPlayState = 'paused'; // 再次暂停
     */
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
