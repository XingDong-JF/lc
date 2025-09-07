<script setup>
import Header from '../components/Header.vue';
import Breadcrumb from '../components/Breadcrumb.vue';
import PopUp from '../components/PopUp.vue';
import GuessLike from '../components/GuessLike.vue';
import OurShop from '../components/OurShop.vue';
import Footer from '../components/Footer.vue';
import MenuPop from '../components/MenuPop.vue';
import GoTop from '../components/GoTop.vue';

import '../assets/css/detail.css';

import { goodsDetail, addToCart } from '../apis';
import { onMounted, ref, computed, watch, onUnmounted } from 'vue';
import { useCartStore } from '../stores/cartStore';
import { useRoute } from 'vue-router';

const route = useRoute();
const goodsId = ref(route.params.goodsId);
const goodsData = ref([]);
const showDetaliError = ref(false);
const currentImageIndex = ref(0);
const goodsCount = ref(1);
const isLike = ref(false);
const isNumber = ref(true); // 是否有库存
const thumbsScrollPosition = ref(0); // 缩略图滚动位置
const isAddingToCart = ref(false); // 是否正在添加到购物车（防抖）
const showAddCartSuccess = ref(false); // 显示添加购物车成功提示
const showAddCartError = ref(false); // 显示添加购物车失败提示

// 放大镜效果相关变量
const showMagnifier = ref(false); // 是否显示放大镜
const magnifierPosition = ref({ x: 0, y: 0 }); // 放大镜位置
const magnifierSize = { width: 100, height: 100 }; // 放大镜尺寸
const zoomLevel = 2; // 放大倍数

// 节流函数
const throttle = (fn, delay) => {
    let timer = null;
    let lastTime = 0;

    return function (...args) {
        const now = Date.now();
        const remaining = delay - (now - lastTime);

        if (remaining <= 0 || remaining > delay) {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
            lastTime = now;
            fn.apply(this, args);
        } else if (!timer) {
            timer = setTimeout(() => {
                lastTime = Date.now();
                timer = null;
                fn.apply(this, args);
            }, remaining);
        }
    };
};

// 切换当前展示的图片
const changeCurrentImage = (index) => {
    currentImageIndex.value = index;
    updateThumbsPosition();
};

// 节流处理过的图片切换函数
const throttledNextImage = throttle(() => {
    if (goodsData.value.length > 0 && goodsData.value[0].banner) {
        const maxIndex = goodsData.value[0].banner.length - 1;
        if (currentImageIndex.value < maxIndex) {
            currentImageIndex.value++;
        } else {
            // 如果是最后一张，循环到第一张
            currentImageIndex.value = 0;
        }
        updateThumbsPosition();
    }
}, 300);

const throttledPrevImage = throttle(() => {
    if (goodsData.value.length > 0 && goodsData.value[0].banner) {
        if (currentImageIndex.value > 0) {
            currentImageIndex.value--;
        } else {
            // 如果是第一张，循环到最后一张
            currentImageIndex.value = goodsData.value[0].banner.length - 1;
        }
        updateThumbsPosition();
    }
}, 300);

// 向外部暴露的切换函数
const nextImage = () => throttledNextImage();
const prevImage = () => throttledPrevImage();

// 更新缩略图位置
const updateThumbsPosition = () => {
    if (!goodsData.value || !goodsData.value.length || !goodsData.value[0].banner) {
        return;
    }

    const bannerLength = goodsData.value[0].banner.length;
    const thumbWidth = 70; // 每个缩略图的宽度
    const spacing = 10; // 每个缩略图的间距
    const containerWidth = 280; // 缩略图容器宽度 (减去左右箭头宽度)
    const itemFullWidth = thumbWidth + spacing; // 每个项的总宽度，包括间距

    // 计算所有缩略图的总宽度
    const totalWidth = bannerLength * thumbWidth + (bannerLength - 1) * spacing;

    // 如果总宽度小于容器宽度，居中显示，不滑动
    if (totalWidth <= containerWidth) {
        thumbsScrollPosition.value = (containerWidth - totalWidth) / 2;
        return;
    }

    // 计算显示窗口中可以显示的缩略图数量
    const visibleItems = Math.floor(containerWidth / itemFullWidth);

    // 计算当前索引在所有项中的相对位置（0-1之间的值）
    const relativeIndex = currentImageIndex.value / (bannerLength - 1);

    // 计算可滚动的总距离
    const scrollableWidth = totalWidth - containerWidth;

    // 根据当前索引的相对位置，计算滚动位置
    // 如果当前图片索引在前半部分，保持在左侧
    // 如果当前图片索引在后半部分，保持在右侧
    // 中间部分则平滑过渡
    if (currentImageIndex.value < Math.ceil(visibleItems / 2)) {
        // 当在左侧几张图时，不滚动
        thumbsScrollPosition.value = 0;
    } else if (currentImageIndex.value >= bannerLength - Math.floor(visibleItems / 2)) {
        // 当在右侧几张图时，滚动到最右
        thumbsScrollPosition.value = -scrollableWidth;
    } else {
        // 中间图片时，确保当前图片居中
        const centerPosition = currentImageIndex.value * itemFullWidth + thumbWidth / 2;
        const halfContainer = containerWidth / 2;
        thumbsScrollPosition.value = Math.max(-scrollableWidth, Math.min(0, halfContainer - centerPosition));
    }
};

// 商品数量增加
const increaseCount = () => {
    if (goodsCount.value < 99 && goodsCount.value < parseInt(goodsData.value[0].goods_number)) {
        goodsCount.value++;
    }
};

// 商品数量减少
const decreaseCount = () => {
    if (goodsCount.value > 1) {
        goodsCount.value--;
    }
};

// 添加到收藏
const addLike = () => {
    isLike.value = !isLike.value;
    // 更新点赞数量
    if (goodsData.value && goodsData.value.length > 0) {
        const currentStars = parseInt(goodsData.value[0].star_number);
        if (isLike.value) {
            goodsData.value[0].star_number = (currentStars + 1).toString();
        } else {
            goodsData.value[0].star_number = Math.max(0, currentStars - 1).toString();
        }
    }
};

// 添加到购物车并刷新pinia购物车
const cartStore = useCartStore();
const addToCartHandle = () => {
    if (isAddingToCart.value) return;
    if (!isNumber.value) {
        showAddCartError.value = true;
        setTimeout(() => { showAddCartError.value = false; }, 2000);
        return;
    }
    let userId = sessionStorage.getItem('userId') || localStorage.getItem('userId');
    if (!userId) {
        showAddCartError.value = true;
        setTimeout(() => { showAddCartError.value = false; }, 2000);
        return;
    }
    isAddingToCart.value = true;
    addToCart(userId, goodsId.value, goodsCount.value).then(async result => {
        if (result) {
            showAddCartSuccess.value = true;
            await cartStore.fetchCartList();
            setTimeout(() => { showAddCartSuccess.value = false; }, 2000);
        } else {
            showAddCartError.value = true;
            setTimeout(() => { showAddCartError.value = false; }, 2000);
        }
        isAddingToCart.value = false;
    }).catch(() => {
        showAddCartError.value = true;
        setTimeout(() => { showAddCartError.value = false; }, 2000);
        isAddingToCart.value = false;
    });
};

// 处理鼠标移入图片事件
const handleMouseEnter = () => {
    showMagnifier.value = true;
};

// 处理鼠标移出图片事件
const handleMouseLeave = () => {
    showMagnifier.value = false;
};

// 处理鼠标在图片上移动事件
const handleMouseMove = (event) => {
    if (!showMagnifier.value || !goodsData.value || !goodsData.value.length) return;

    const imageContainer = event.currentTarget;
    const rect = imageContainer.getBoundingClientRect();

    // 计算鼠标在图片上的相对位置 (0-1范围)
    // 需要考虑图片滑动的位置
    const relativeX = (event.clientX - rect.left) / rect.width;
    const relativeY = (event.clientY - rect.top) / rect.height;

    // 限制在0-1范围内
    const boundedX = Math.max(0, Math.min(1, relativeX));
    const boundedY = Math.max(0, Math.min(1, relativeY));

    // 更新放大镜位置
    magnifierPosition.value = {
        x: boundedX,
        y: boundedY
    };
};

const fetchDetail = async () => {
    // 重置状态
    showDetaliError.value = false;
    isLike.value = false;
    goodsCount.value = 1;
    showMagnifier.value = false;

    let result = await goodsDetail(goodsId.value);
    if (!result) {
        showDetaliError.value = true;
    } else {
        goodsData.value = result;
        // 检查是否有库存
        if (goodsData.value.length > 0) {
            isNumber.value = parseInt(goodsData.value[0].goods_number) > 0;
            // 初始化缩略图位置
            setTimeout(updateThumbsPosition, 100);
        }
    }
}

// 监听窗口大小变化，更新缩略图位置
onMounted(() => {
    fetchDetail();
    window.addEventListener('resize', throttle(updateThumbsPosition, 200));
});

// 监听图片索引变化
watch(currentImageIndex, () => {
    updateThumbsPosition();
});

// 监听路由参数变化，重新获取商品详情
watch(() => route.params.goodsId, (newId, oldId) => {
    if (newId !== oldId && newId) {
        goodsId.value = newId;
        currentImageIndex.value = 0; // 重置当前图片索引
        fetchDetail();
    }
});

// 清理事件监听器
onUnmounted(() => {
    window.removeEventListener('resize', throttle(updateThumbsPosition, 200));
});

// 构建面包屑导航项目
const breadcrumbItems = computed(() => {
    const items = [
        { name: '良仓', path: '/home' },
        { name: '商店', path: '' }
    ];

    // 如果已经获取到商品数据且存在商品名称，则添加到面包屑
    if (goodsData.value && goodsData.value.length > 0 && goodsData.value[0].goods_name) {
        items.push({ name: goodsData.value[0].goods_name, path: '' });
    }

    return items;
});

// 计算属性：是否达到最大数量
const isMaxCount = computed(() => {
    if (!goodsData.value || !goodsData.value.length) return false;
    return goodsCount.value >= parseInt(goodsData.value[0].goods_number);
});

// 计算属性：是否达到最小数量
const isMinCount = computed(() => {
    return goodsCount.value <= 1;
});
</script>

<template>
    <Header></Header>
    <Breadcrumb :items="breadcrumbItems" />
    <div class="detail">
        <div class="d-l" v-if="goodsData.length > 0">
            <div class="dl-top">
                <div class="dlt-l">
                    <div class="dltl-t">
                        <div class="image-container" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave"
                            @mousemove="handleMouseMove">
                            <div class="image-slider" :style="{ transform: `translateX(-${currentImageIndex * 100}%)` }">
                                <img v-for="(item, index) in goodsData[0].banner" :key="index" :src="item" alt="商品图片">
                            </div>
                        </div>
                    </div>
                    <div class="dltl-d">
                        <div class="banner-navigation">
                            <div class="thumb-arrow thumb-left" @click="prevImage">&lt;</div>
                            <div class="banner-container">
                                <div class="banner-scroll"
                                    :style="{ transform: `translateX(${thumbsScrollPosition}px)` }">
                                    <div v-for="(item, index) in goodsData[0].banner" :key="index" class="banner-item"
                                        :class="{ active: index === currentImageIndex }"
                                        @click="changeCurrentImage(index)">
                                        <img :src="item" alt="缩略图">
                                    </div>
                                </div>
                            </div>
                            <div class="thumb-arrow thumb-right" @click="nextImage">&gt;</div>
                        </div>
                    </div>
                </div>
                <div class="dlt-r">
                    <!-- 放大镜视图 -->
                    <div v-if="showMagnifier" class="magnifier-view">
                        <div class="magnified-image" :style="{
                            backgroundImage: `url(${goodsData[0].banner[currentImageIndex]})`,
                            backgroundPosition: `${magnifierPosition.x * 100}% ${magnifierPosition.y * 100}%`,
                            backgroundSize: `${zoomLevel * 100}%`
                        }"></div>
                    </div>
                    <div class="dltr-like" @click="addLike">
                        <span class="span-like">{{ isLike ? '💖' : '🤍' }}</span>
                        <span> &nbsp;{{ goodsData[0].star_number }}</span>
                    </div>
                    <div class="dltr-brand">
                        {{ goodsData[0].brand_name }}
                    </div>
                    <div class="dltr-name">
                        {{ goodsData[0].goods_name }}
                    </div>
                    <div class="dltr-price">
                        <span class="span-forword">价格：</span>
                        <span class="span-price">￥{{ goodsData[0].price + '元' }}</span>
                    </div>
                    <div class="dltr-rights">
                        <span class="span-forword">权益：</span>
                        <span class="span-rights-first">免运费</span>
                        <span class="span-rights-second">正品授权</span>
                    </div>
                    <div class="dltr-color">
                        <span class="span-forword">颜色：</span>
                        <img :src="goodsData[0].banner[0]">
                    </div>
                    <div class="dltr-number">
                        <span class="span-forword">数量：</span>
                        <div class="number-input">
                            <div class="ni-left" @click="decreaseCount" :class="{ 'disabled': isMinCount }">-</div>
                            <div class="ni-center">{{ goodsCount }}</div>
                            <div class="ni-right" @click="increaseCount" :class="{ 'disabled': isMaxCount }">+</div>
                        </div>
                    </div>
                    <div class="dltr-tips-nonumber">
                        <!-- 待补充点击跳转支付页面 -->
                        <div v-if="isNumber" class="dltr-addShop">
                            立即购买
                        </div>
                        <div v-else class="dltr-nonumber">
                            已售罄，即将到货
                        </div>
                    </div>
                    <div class="dltr-btus">
                        <!-- 待补充加入购物车 -->
                        <div class="dltr-left-btu" @click="addToCartHandle">
                            <img src="../assets/imgs/导航-购物车.png" alt="">
                            <span>添加购物车</span>
                        </div>
                        <div class="dltr-tips-success">
                            <img src="../assets/imgs/分享.png" alt="">
                            <span>分享</span>
                        </div>
                    </div>
                    <div class="dltr-tips-addShop" v-if="showAddCartSuccess">
                        <span>添加购物车成功！！！</span>
                    </div>
                    <div class="dltr-tips-addShop-error" v-if="showAddCartError">
                        <span>添加购物车失败，稍后再试吧！</span>
                    </div>
                </div>
            </div>
            <div class="dl-down" v-for="(item, index) in goodsData[0].product_banner" :key="index">
                    <img :src="item">
                </div>
        </div>
        <div class="d-r">
            <GuessLike></GuessLike>
        </div>
    </div>
    <OurShop></OurShop>
    <Footer></Footer>
    <MenuPop></MenuPop>
    <GoTop></GoTop>
    <PopUp v-if="showDetaliError" message="获取商品详情失败" />
</template>

<style scoped>
</style>
