<script setup>
import '../assets/css/bannerCarousel.css';
import { bannerCarousel } from '../apis';
import { ref, onMounted, onBeforeUnmount } from 'vue';

// 轮播图数据
const banners = ref([]);
const currentIndex = ref(0);
const isAnimating = ref(false); // 节流标志
const direction = ref(1); // 1 表示向右，-1 表示向左

// 获取轮播图数据
const fetchBanners = async () => {
    try {
        const data = await bannerCarousel();
        if (data && data.length > 0) {
            banners.value = data;
        } else {
            // 加载失败时显示默认图片
            banners.value = [
                { 
                    goods_thumb: '../assets/imgs/976.jpg',
                    cat_id: 0,
                    goods_id: 0,
                    goods_name: '默认图片'
                }
            ];
        }
    } catch (error) {
        banners.value = [
            { 
                goods_thumb: '../assets/imgs/976.jpg',
                cat_id: 0,
                goods_id: 0,
                goods_name: '默认图片'
            }
        ];
    }
};

// 切换到上一张图片
const prevSlide = () => {
    if (isAnimating.value || banners.value.length <= 1) return;
    isAnimating.value = true;
    direction.value = -1; // 向左滑动
    currentIndex.value = (currentIndex.value - 1 + banners.value.length) % banners.value.length;
    setTimeout(() => {
        isAnimating.value = false;
    }, 500); // 500ms 的节流时间
};

// 切换到下一张图片
const nextSlide = () => {
    if (isAnimating.value || banners.value.length <= 1) return;
    isAnimating.value = true;
    direction.value = 1; // 向右滑动
    currentIndex.value = (currentIndex.value + 1) % banners.value.length;
    setTimeout(() => {
        isAnimating.value = false;
    }, 500); // 500ms 的节流时间
};

// 直接跳转到指定索引的图片
const goToSlide = (index) => {
    if (isAnimating.value || index === currentIndex.value) return;
    isAnimating.value = true;
    direction.value = index > currentIndex.value ? 1 : -1;
    currentIndex.value = index;
    setTimeout(() => {
        isAnimating.value = false;
    }, 500); // 500ms 的节流时间
};

// 自动轮播
let autoplayTimer = null;
const startAutoplay = () => {
    if (banners.value.length <= 1) return;
    stopAutoplay(); // 先清除之前的定时器
    autoplayTimer = setInterval(() => {
        nextSlide();
    }, 2000); // 2秒切换一次
};

const stopAutoplay = () => {
    if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
    }
};

// 组件挂载时获取数据并启动自动轮播
onMounted(() => {
    fetchBanners().then(() => {
        if (banners.value.length > 1) {
            startAutoplay();
        }
    });
});

// 组件卸载时清除定时器
onBeforeUnmount(() => {
    stopAutoplay();
});
</script>

<template>
    <div class="banner-carousel" @mouseenter="stopAutoplay" @mouseleave="startAutoplay">
        <div class="bc-pre" @click.stop="prevSlide">
            <div class="bcp-img"></div>
        </div>
        <div class="bc-next" @click.stop="nextSlide">
            <div class="bcn-img"></div>
        </div>
        <!-- 轮播图内容 -->
        <div class="bc-imgs">
            <transition-group 
                name="slide" 
                tag="div" 
                class="slide-container"
                :class="{ 'slide-right': direction === 1, 'slide-left': direction === -1 }"
            >   
                <!-- 待补充点击跳转到商品分类 -->
                <!-- :to="`/category/${banner.cat_id}/goods/${banner.goods_id}`"  -->
                <router-link 
                    v-for="(banner, index) in banners" 
                    :key="index"

                    v-show="index === currentIndex"
                    class="slide-item"
                >
                    <img :src="banner.goods_thumb" :alt="`${banner.goods_name || '轮播图'}`">
                </router-link>
            </transition-group>
            <img v-if="banners.length === 0" src="../assets/imgs/976.jpg" alt="Default Banner">
        </div>
        <div class="bc-btu">
            <span 
                v-for="(banner, index) in banners" 
                :key="index" 
                :class="{ active: index === currentIndex }"
                @click="goToSlide(index)"
            ></span>
        </div>
    </div>
</template>
<style scoped>

</style>
