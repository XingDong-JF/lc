<script setup>
import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';
import GoTop from '../components/GoTop.vue';
import MenuPop from '../components/MenuPop.vue';
import PopUp from '../components/PopUp.vue';
import OurShop from '../components/OurShop.vue';
import '../assets/css/search.css';

import { searchGoods } from '../apis/index';
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const showGoodsSearch = ref(false);
const totalCount = ref(0);
const hotList = ref([]);
const page = ref(1);
const pageSize = ref(9);
const keywords = ref('');
const totalPages = ref(1);
const loading = ref(false);
const noData = ref(false);

const fetchSearchGoods = async (page, pagesize, keywords) => {
    loading.value = true;
    hotList.value = [];
    noData.value = false;
    
    const result = await searchGoods(page, pagesize, keywords);
    loading.value = false;
    
    if (result.code !== 0){
        showGoodsSearch.value = true;
        return;
    } else {
        totalCount.value = result.count;
        showGoodsSearch.value = false;
        
        if (result.data && result.data.length > 0) {
            // 为每个商品添加一个本地的like状态
            const processedResult = result.data.map(item => ({
                ...item,
                isLike: false
            }));
            hotList.value = processedResult;
            totalPages.value = Math.ceil(totalCount.value / pageSize.value);
        } else {
            noData.value = true;
        }
    }
}

// 处理点赞事件，防止冒泡
const changeLike = (event, index) => {
    event.preventDefault(); // 阻止默认行为
    event.stopPropagation(); // 阻止事件冒泡
    hotList.value[index].isLike = !hotList.value[index].isLike;
};

// 切换页面
const changePage = (pageNum) => {
    if (pageNum < 1 || pageNum > totalPages.value || pageNum === page.value || loading.value) {
        return;
    }
    page.value = pageNum;
    fetchSearchGoods(page.value, pageSize.value, keywords.value);
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
        if (page.value <= 3) {
            range.push(2, 3, 4, '...', totalPages.value);
        } 
        // 当前页靠近结束
        else if (page.value >= totalPages.value - 2) {
            range.push('...', totalPages.value - 3, totalPages.value - 2, totalPages.value - 1, totalPages.value);
        } 
        // 当前页在中间
        else {
            range.push('...', page.value - 1, page.value, page.value + 1, '...', totalPages.value);
        }
    }
    
    return range;
};

// 监听路由查询参数变化
watch(
    () => route.query.keyword,
    (newKeyword) => {
        if (newKeyword) {
            keywords.value = newKeyword;
            page.value = 1; // 重置为第一页
            fetchSearchGoods(page.value, pageSize.value, keywords.value);
        }
    },
    { immediate: true }
);

onMounted(() => {
    const keyword = route.query.keyword || '';
    keywords.value = keyword;
    fetchSearchGoods(page.value, pageSize.value, keywords.value);
})
</script>
<template>
    <Header></Header>
    <div class="search">
        <div class="search-title">
            <span>搜索结果</span>
            <span v-if="keywords" class="keyword">「{{ keywords }}」</span>
            <span v-if="totalCount > 0" class="count">共{{ totalCount }}件商品</span>
        </div>
        
        <!-- 搜索结果列表 -->
        <div v-if="!loading && !noData && hotList.length > 0" class="search-list">
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
                                <span class="like-btn" @click="changeLike($event, index)">{{item.isLike ? '💖' : '🤍'}}</span>
                            </div>
                        </div>
                    </div>
                </router-link>
            </div>
        </div>
        
        <!-- 加载指示器 -->
        <div v-if="loading" class="loading-indicator">
            <div class="spinner"></div>
            <p>搜索中...</p>
        </div>
        
        <!-- 无数据提示 -->
        <div v-if="!loading && noData" class="no-data">
            <p>抱歉，没有找到相关商品</p>
        </div>
        
        <!-- 分页控件 -->
        <div class="pagination" v-if="!loading && !noData && hotList.length > 0 && totalPages > 1">
            <div class="pagination-wrapper">
                <div class="page-info">
                    第 {{ page }} 页，共 {{ totalPages }} 页，共 {{ totalCount }} 条记录
                </div>
                <div class="page-controls">
                    <button 
                        class="page-btn" 
                        :class="{ disabled: page === 1 }" 
                        @click="changePage(page - 1)"
                        :disabled="page === 1"
                    >
                        上一页
                    </button>
                    
                    <template v-for="(pageNum, index) in getPaginationRange()" :key="index">
                        <span v-if="pageNum === '...'" class="ellipsis">...</span>
                        <button 
                            v-else
                            class="page-num" 
                            :class="{ active: pageNum === page }" 
                            @click="changePage(pageNum)"
                        >
                            {{ pageNum }}
                        </button>
                    </template>
                    
                    <button 
                        class="page-btn" 
                        :class="{ disabled: page === totalPages }" 
                        @click="changePage(page + 1)"
                        :disabled="page === totalPages"
                    >
                        下一页
                    </button>
                </div>
            </div>
        </div>
        
        <div class="search-btu"></div>
    </div>
    <PopUp v-if="showGoodsSearch" message="请求搜索失败！"></PopUp>
    <OurShop></OurShop>
    <Footer></Footer>
    <GoTop></GoTop>
    <MenuPop></MenuPop>
</template>
<style scoped>
</style>
