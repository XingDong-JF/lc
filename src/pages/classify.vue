<script setup>
import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';
import OurShop from '../components/OurShop.vue';
import MenuPop from '../components/MenuPop.vue';
import GoTop from '../components/GoTop.vue';
import PopUp from '../components/PopUp.vue';
import Breadcrumb from '../components/Breadcrumb.vue';

import { classifyGoods } from '../apis';
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const catId = ref(route.params.catId);
const catName = ref(route.query.catName || '未知分类');
const breadcrumbItems = ref([
    { name: '良仓', path: '/home' },
    { name: '商店', path: null },
    { name: catName.value, path: null }
]);
const showClassifyGoods = ref(false);
const hotList = ref([]);
const currentPage = ref(1);
const pageSize = ref(9);
const totalItems = ref(0);
const totalPages = ref(1);
const loading = ref(false);

const fetchClassifyGoods = async (page, pageSize, catId) => {
    loading.value = true;
    hotList.value = [];
    const result = await classifyGoods(page, pageSize, catId);
    loading.value = false;
    
    if (!result) {
        showClassifyGoods.value = true;
        return;
    }
    
    showClassifyGoods.value = false;
    // 为每个商品添加一个本地的like状态
    const processedResult = result.map(item => ({
        ...item,
        isLike: false
    }));
    hotList.value = processedResult;
    
    // 固定总页数为27页
    totalPages.value = 27;
};

// 处理点赞事件，防止冒泡
const changeLike = (event, index) => {
    event.preventDefault(); // 阻止默认行为
    event.stopPropagation(); // 阻止事件冒泡
    hotList.value[index].isLike = !hotList.value[index].isLike;
};

// 切换页面
const changePage = (page) => {
    if (page < 1 || page > totalPages.value || page === currentPage.value || loading.value) {
        return;
    }
    currentPage.value = page;
    fetchClassifyGoods(currentPage.value, pageSize.value, catId.value);
};

// 生成分页显示范围
const getPaginationRange = () => {
    const range = [];
    
    if (totalPages.value <= 7) {
        // 页数少时，显示所有页码
        for (let i = 1; i <= totalPages.value; i++) {
            range.push(i);
        }
    } else {
        // 总是显示第一页
        range.push(1);
        
        // 当前页靠近开始
        if (currentPage.value <= 3) {
            range.push(2, 3, 4, '...', totalPages.value);
        } 
        // 当前页靠近结束
        else if (currentPage.value >= totalPages.value - 2) {
            range.push('...', totalPages.value - 3, totalPages.value - 2, totalPages.value - 1, totalPages.value);
        } 
        // 当前页在中间
        else {
            range.push(
                '...', 
                currentPage.value - 1, 
                currentPage.value, 
                currentPage.value + 1,
                '...', 
                totalPages.value
            );
        }
    }
    
    return range;
};

// 监听路由参数的变化
watch(
    () => route.params.catId,
    (newCatId) => {
        catId.value = newCatId;
        currentPage.value = 1; // 重置为第一页
        fetchClassifyGoods(currentPage.value, pageSize.value, catId.value);
    }
);

// 监听分类名称的变化
watch(
    () => route.query.catName,
    (newCatName) => {
        if (newCatName) {
            catName.value = newCatName;
            breadcrumbItems.value = [
                { name: '良仓', path: '/home' },
                { name: '商店', path: null },
                { name: catName.value, path: null }
            ];
        }
    }
);

onMounted(() => {
    fetchClassifyGoods(currentPage.value, pageSize.value, catId.value);
});

</script>
<template>
    <Header></Header>
    <Breadcrumb :items="breadcrumbItems" />
    <div class="ht">
        <!-- :to="{ name: 'Detail', params: { goodsId: item.goods_id }}" }}" -->
        <!-- 待补充，热门商品跳转到详情 -->
        <div v-for="(item, index) in hotList" :key="item.goods_id" class="ht-goods-wrapper">
            <router-link :to="{ name: 'Detail', params: { goodsId: item.goods_id }}" >
                <div class="ht-goods">
                    <div class="htg-img">
                        <img :src="item.goods_thumb" :alt="item.goods_name">
                        <div class="htg-hover">
                            <div class="htgh-price">
                                <span>￥{{ item.price }}</span>
                            </div>
                            <div class="htgh-title">
                                <p class="p-first">{{ item.goods_name }}</p>
                                <p class="p-second">{{ item.goods_desc }}</p>
                            </div>
                        </div>
                    </div>
                    <div class="htg-name">
                        <div class="htgn-l">
                            <img :src="item.brand_thumb" :alt="item.brand_name">
                            <p>{{ item.brand_name }}</p>
                        </div>
                        <div class="htgn-r">
                            <span class="number">{{ item.goods_number }}</span>
                            <button 
                                class="like-btn" 
                                :class="{ 'liked': item.isLike }"
                                @click="changeLike($event, index)"
                                :aria-label="item.isLike ? '取消喜欢' : '添加喜欢'"
                            >
                                <span class="like-icon">{{ item.isLike ? '❤️' : '🤍' }}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </router-link>
        </div>
    </div>
    
    <!-- 加载指示器 -->
    <div v-if="loading" class="loading-indicator">
        <div class="spinner"></div>
        <p>加载中...</p>
    </div>
    
    <!-- 分页控件 -->
    <div class="pagination" v-if="!loading && hotList.length > 0">
        <div class="pagination-wrapper">
            <span class="page-info">第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
            <div class="page-controls">
                <button 
                    class="page-btn" 
                    :class="{ disabled: currentPage <= 1 }"
                    @click="changePage(currentPage - 1)"
                >上一页</button>
                
                <template v-for="page in getPaginationRange()" :key="page">
                    <button 
                        v-if="page !== '...'"
                        class="page-num" 
                        :class="{ active: page === currentPage }"
                        @click="changePage(page)"
                    >{{ page }}</button>
                    <span v-else class="ellipsis">...</span>
                </template>
                
                <button 
                    class="page-btn" 
                    :class="{ disabled: currentPage >= totalPages }"
                    @click="changePage(currentPage + 1)"
                >下一页</button>
            </div>
        </div>
    </div>

    <PopUp v-if="showClassifyGoods" message="获取热门商品失败" />
    <MenuPop></MenuPop>
    <OurShop></OurShop>
    <Footer></Footer>
    <GoTop></GoTop>
</template>
<style scoped>
.ht {
    width: 1000px;
    height: auto;
    margin: 0 auto;
    margin-top: 10px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
}
.ht-goods {
    width: 320px;
    height: 366px;
}

.htg-img,
.htg-hover {
    width: 320px;
    height: 320px;
}

.htg-img {
    position: relative;
}

.htg-img img {
    width: 100%;
    object-fit: contain;
}

.htg-hover {
    position: absolute;
    top: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.7);
    color: #fff;
    opacity: 0;
    visibility: hidden;
    z-index: 5;
    transition: opacity 0.3s ease, visibility 0.3s ease;
}

.htgh-price span {
    display: inline-block;
    color: #0c6eba;
    font-size: 20px;
    font-style: italic;
    font-weight: bold;
    margin: 10px;
}

.htgh-title {
    width: 85%;
    margin: 0 auto;
    margin-top: 80px;
    text-align: center;
}

.p-first {
    font-size: 14px;
    font-weight: bold;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.p-second {
    font-size: 12px;
    font-weight: 100;
    margin-top: 5px;
    white-space: normal;
    overflow: hidden;
    text-overflow: ellipsis;
}

.htg-img:hover .htg-hover {
    opacity: 1;
    visibility: visible;
}

.htg-name {
    width: 320px;
    height: 46px;
    display: flex;
    justify-content: space-between;
}

.htgn-l {
    display: flex;
    align-items: center;
    white-space: nowrap;
    text-overflow: ellipsis;
    width: 216px;
    overflow: hidden;
}

.htgn-l img {
    width: 34px;
    height: 34px;
}

.htgn-l p {
    margin-left: 8px;
    line-height: 40px;
    vertical-align: middle;
    font-size: 14px;
    color: #666;
}

.htgn-r {
    height: 46px;
    line-height: 46px;
    font-size: 18px;
}

.number {
    color: #666;
    margin-right: 6px;
}
.ht-goods-wrapper {
    display: contents; 
}
.like-btn {
    cursor: pointer;
    user-select: none;
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    font-size: 18px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease;
}

.like-btn:hover {
    transform: scale(1.2);
}

.like-btn.liked .like-icon {
    animation: heartBeat 0.3s ease-in-out;
}

@keyframes heartBeat {
    0% { transform: scale(1); }
    50% { transform: scale(1.3); }
    100% { transform: scale(1); }
}

/* 加载指示器样式 */
.loading-indicator {
    text-align: center;
    padding: 40px;
    width: 100%;
}

.spinner {
    width: 50px;
    height: 50px;
    margin: 0 auto;
    border: 4px solid rgba(12, 110, 186, 0.2);
    border-top: 4px solid #0c6eba;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.loading-indicator p {
    margin-top: 15px;
    color: #666;
    font-size: 16px;
    font-weight: 500;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* 分页控件样式 */
.pagination {
    margin: 30px auto;
    width: 1000px;
    display: flex;
    justify-content: center;
}

.pagination-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
}

.page-info {
    color: #666;
    font-size: 14px;
    font-weight: 500;
}

.page-controls {
    display: flex;
    gap: 8px;
    align-items: center;
}

.page-btn, .page-num {
    padding: 8px 12px;
    border: 1px solid #ddd;
    background-color: #fff;
    color: #333;
    cursor: pointer;
    transition: all 0.3s;
    border-radius: 4px;
    min-width: 40px;
    text-align: center;
}

.page-num.active {
    background-color: #0c6eba;
    color: #fff;
    border-color: #0c6eba;
    font-weight: bold;
}

.page-btn:hover, .page-num:hover:not(.active) {
    background-color: #f5f5f5;
    border-color: #0c6eba;
}

.page-btn.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    border-color: #ddd;
}

.ellipsis {
    margin: 0 2px;
    color: #666;
    align-self: flex-end;
    padding-bottom: 8px;
}
</style>
