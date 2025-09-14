<script setup>
import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';
import GoTop from '../components/GoTop.vue';
import MenuPop from '../components/MenuPop.vue';
import OurShop from '../components/OurShop.vue';
import { queryPaymentStatus, getUserOrders, deleteUserOrder } from '../apis';
import { ref, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox, ElCard, ElButton, ElTag, ElEmpty, ElLoading } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// 响应式数据
const currentPaymentStatus = ref(null); // 当前支付状态
const userOrders = ref([]); // 用户订单列表
const loading = ref(false); // 加载状态
const currentTab = ref('current'); // 当前选项卡：current(当前支付) / orders(我的订单)

// 从URL参数获取交易号
const tradeNo = computed(() => {
    return route.query.tradeNo || route.query.out_trade_no || null;
});

// 格式化日期
const formatDate = (dateString) => {
    if (!dateString) return '未知';
    try {
        return new Date(dateString).toLocaleString('zh-CN');
    } catch (error) {
        return dateString;
    }
};

// 查询支付状态
const checkPaymentStatus = async (trade_no) => {
    if (!trade_no) {
        ElMessage.warning('缺少交易号参数');
        return;
    }

    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    if (!userId) {
        ElMessage.error('请先登录');
        router.push('/login');
        return;
    }

    loading.value = true;
    try {
        const result = await queryPaymentStatus(userId, trade_no);
        if (result) {
            currentPaymentStatus.value = result;
            ElMessage.success('支付状态查询成功');
        } else {
            ElMessage.error('支付状态查询失败');
        }
    } catch (error) {
        console.error('查询支付状态时发生错误:', error);
        ElMessage.error('查询失败，请重试');
    } finally {
        loading.value = false;
    }
};

// 获取用户订单列表
const fetchUserOrders = async () => {
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    if (!userId) {
        ElMessage.error('请先登录');
        router.push('/login');
        return;
    }

    loading.value = true;
    try {
        const result = await getUserOrders(userId);
        if (result && Array.isArray(result)) {
            userOrders.value = result;
        } else {
            userOrders.value = [];
            console.error('获取订单列表失败或数据格式错误:', result);
        }
    } catch (error) {
        console.error('获取用户订单时发生错误:', error);
        ElMessage.error('获取订单失败，请重试');
        userOrders.value = [];
    } finally {
        loading.value = false;
    }
};

// 删除订单
const handleDeleteOrder = async (trade_no) => {
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    if (!userId) {
        ElMessage.error('请先登录');
        return;
    }

    try {
        await ElMessageBox.confirm(
            '确定要删除这个订单吗？删除后无法恢复。',
            '确认删除',
            {
                confirmButtonText: '确定删除',
                cancelButtonText: '取消',
                type: 'warning',
            }
        );

        loading.value = true;
        const result = await deleteUserOrder(userId, trade_no);
        
        if (result) {
            ElMessage.success('订单删除成功');
            // 刷新订单列表
            await fetchUserOrders();
        } else {
            ElMessage.error('订单删除失败，请重试');
        }
    } catch (error) {
        if (error === 'cancel') {
            return; // 用户取消删除
        }
        console.error('删除订单时发生错误:', error);
        ElMessage.error('删除失败，请重试');
    } finally {
        loading.value = false;
    }
};

// 切换选项卡
const switchTab = (tab) => {
    currentTab.value = tab;
    if (tab === 'orders') {
        fetchUserOrders();
    }
};

// 返回购物车
const goToCart = () => {
    router.push('/cart');
};

// 继续购物
const goToHome = () => {
    router.push('/home');
};

// 页面初始化
onMounted(() => {
    // 如果有交易号参数，自动查询支付状态
    if (tradeNo.value) {
        checkPaymentStatus(tradeNo.value);
        currentTab.value = 'current';
    } else {
        // 如果没有交易号，直接显示订单列表
        currentTab.value = 'orders';
        fetchUserOrders();
    }
});

</script>
<template>
    <div class="payment-page">
        <div class="payment-container">
            <!-- 页面标题 -->
            <div class="page-header">
                <div class="tab-buttons">
                    <button 
                        :class="['tab-btn', { active: currentTab === 'current' }]" 
                        @click="switchTab('current')"
                        v-if="tradeNo"
                    >
                        当前支付
                    </button>
                    <button 
                        :class="['tab-btn', { active: currentTab === 'orders' }]" 
                        @click="switchTab('orders')"
                    >
                        我的订单
                    </button>
                </div>
            </div>

            <!-- 当前支付状态 -->
            <div v-if="currentTab === 'current' && tradeNo" class="current-payment">
                <el-card class="payment-status-card">
                    <template #header>
                        <div class="card-header">
                            <span>支付状态查询</span>
                            <el-button 
                                type="primary" 
                                size="small" 
                                @click="checkPaymentStatus(tradeNo)"
                                :loading="loading"
                            >
                                刷新状态
                            </el-button>
                        </div>
                    </template>
                    
                    <div v-if="currentPaymentStatus" class="payment-info">
                        <div class="info-item">
                            <label>交易号：</label>
                            <span>{{ tradeNo }}</span>
                        </div>
                        <div class="info-item">
                            <label>支付状态：</label>
                            <el-tag 
                                :type="currentPaymentStatus.trade_status === 'TRADE_SUCCESS' ? 'success' : 'warning'"
                            >
                                {{ currentPaymentStatus.trade_status === 'TRADE_SUCCESS' ? '支付成功' : currentPaymentStatus.trade_status || '未知' }}
                            </el-tag>
                        </div>
                        <div class="info-item" v-if="currentPaymentStatus.total_amount">
                            <label>支付金额：</label>
                            <span class="amount">￥{{ currentPaymentStatus.total_amount }}</span>
                        </div>
                        <div class="info-item" v-if="currentPaymentStatus.subject">
                            <label>订单标题：</label>
                            <span>{{ currentPaymentStatus.subject }}</span>
                        </div>
                        <div class="info-item" v-if="currentPaymentStatus.gmt_payment">
                            <label>支付时间：</label>
                            <span>{{ formatDate(currentPaymentStatus.gmt_payment) }}</span>
                        </div>
                        
                        <div class="action-buttons">
                            <el-button type="success" @click="switchTab('orders')">查看我的订单</el-button>
                            <el-button @click="goToHome">继续购物</el-button>
                        </div>
                    </div>
                    
                    <div v-else class="no-payment-info">
                        <el-empty description="暂无支付信息" />
                        <div class="action-buttons">
                            <el-button type="primary" @click="checkPaymentStatus(tradeNo)" :loading="loading">
                                查询支付状态
                            </el-button>
                            <el-button @click="goToCart">返回购物车</el-button>
                        </div>
                    </div>
                </el-card>
            </div>

            <!-- 用户订单列表 -->
            <div v-if="currentTab === 'orders'" class="user-orders">
                <div class="orders-header">
                    <h2>我的订单</h2>
                    <el-button 
                        type="primary" 
                        @click="fetchUserOrders" 
                        :loading="loading"
                        size="small"
                    >
                        刷新订单
                    </el-button>
                </div>

                <div v-if="userOrders.length > 0" class="orders-list">
                    <el-card 
                        v-for="order in userOrders" 
                        :key="order.out_trade_no || order.tradeNo" 
                        class="order-card"
                        shadow="hover"
                    >
                        <div class="order-header">
                            <div class="order-info">
                                <span class="order-id">订单号：{{ order.out_trade_no || order.tradeNo || '未知' }}</span>
                                <el-tag 
                                    :type="order.trade_status === 'TRADE_SUCCESS' ? 'success' : 'warning'"
                                    size="small"
                                >
                                    {{ order.trade_status === 'TRADE_SUCCESS' ? '支付成功' : order.trade_status || '未知状态' }}
                                </el-tag>
                            </div>
                            <div class="order-actions">
                                <el-button 
                                    type="danger" 
                                    size="small" 
                                    @click="handleDeleteOrder(order.out_trade_no || order.tradeNo)"
                                    :loading="loading"
                                >
                                    删除订单
                                </el-button>
                            </div>
                        </div>
                        
                        <div class="order-details">
                            <div class="detail-item" v-if="order.subject">
                                <label>订单标题：</label>
                                <span>{{ order.subject }}</span>
                            </div>
                            <div class="detail-item" v-if="order.total_amount">
                                <label>订单金额：</label>
                                <span class="amount">￥{{ order.total_amount }}</span>
                            </div>
                            <div class="detail-item" v-if="order.gmt_create">
                                <label>创建时间：</label>
                                <span>{{ formatDate(order.gmt_create) }}</span>
                            </div>
                            <div class="detail-item" v-if="order.gmt_payment">
                                <label>支付时间：</label>
                                <span>{{ formatDate(order.gmt_payment) }}</span>
                            </div>
                            <div class="detail-item" v-if="order.body">
                                <label>订单详情：</label>
                                <span class="order-body">{{ order.body }}</span>
                            </div>
                        </div>
                    </el-card>
                </div>
                
                <div v-else class="empty-orders">
                    <el-empty description="暂无订单记录">
                        <el-button type="primary" @click="goToHome">去购物</el-button>
                    </el-empty>
                </div>
            </div>

            <!-- 没有交易号时的默认页面 -->
            <div v-if="!tradeNo && currentTab === 'current'" class="no-trade-info">
                <el-empty description="没有找到交易信息">
                    <el-button type="primary" @click="switchTab('orders')">查看我的订单</el-button>
                </el-empty>
            </div>
        </div>
    </div>
    
    <Header></Header>
    <MenuPop></MenuPop>
    <GoTop></GoTop>
    <OurShop></OurShop>
    <Footer></Footer>
</template>
<style scoped>
.payment-page {
    min-height: calc(100vh - 200px);
    background: #f5f7fa;
    padding: 120px 0 40px 0;
    width: 1000px;
    margin: 0 auto;
}

.payment-container {
    width: 960px;
    margin: 0 auto;
    padding: 0 20px;
}

/* 页面头部 */
.page-header {
    text-align: center;
    margin-bottom: 40px;
}

.page-header h1 {
    color: #333;
    font-size: 28px;
    margin-bottom: 20px;
    font-weight: 600;
}

.tab-buttons {
    display: flex;
    justify-content: center;
    gap: 16px;
}

.tab-btn {
    padding: 12px 24px;
    border: 2px solid #e0e0e0;
    background: #fff;
    color: #666;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 500;
    transition: all 0.2s;
}

.tab-btn:hover {
    border-color: #3e89d9;
    color: #3e89d9;
}

.tab-btn.active {
    border-color: #3e89d9;
    background: #3e89d9;
    color: #fff;
    box-shadow: 0 2px 8px rgba(62, 137, 217, 0.3);
}

/* 当前支付状态 */
.current-payment {
    max-width: 800px;
    margin: 0 auto;
}

.payment-status-card {
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 18px;
    font-weight: 600;
    color: #333;
}

.payment-info {
    padding: 20px 0;
}

.info-item {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
    border-bottom: none;
}

.info-item label {
    width: 120px;
    font-weight: 500;
    color: #666;
    flex-shrink: 0;
}

.info-item span {
    color: #333;
    flex: 1;
}

.amount {
    color: #e74c3c !important;
    font-weight: 600;
    font-size: 18px;
}

.action-buttons {
    margin-top: 30px;
    text-align: center;
    display: flex;
    gap: 12px;
    justify-content: center;
}

.no-payment-info {
    text-align: center;
    padding: 40px 20px;
}

/* 订单列表 */
.orders-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
}

.orders-header h2 {
    color: #333;
    font-size: 24px;
    margin: 0;
    font-weight: 600;
}

.orders-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.order-card {
    border-radius: 12px;
    transition: all 0.2s;
    border: 1px solid #e0e0e0;
}

.order-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 16px;
}

.order-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.order-id {
    font-weight: 500;
    color: #333;
    font-size: 16px;
}

.order-details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}

.detail-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
}

.detail-item label {
    font-weight: 500;
    color: #666;
    min-width: 80px;
    flex-shrink: 0;
}

.detail-item span {
    color: #333;
    word-break: break-word;
}

.order-body {
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.empty-orders {
    text-align: center;
    padding: 60px 20px;
}

.no-trade-info {
    text-align: center;
    padding: 60px 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .payment-container {
        padding: 0 16px;
    }
    
    .tab-buttons {
        flex-direction: column;
        align-items: center;
    }
    
    .tab-btn {
        width: 100%;
        max-width: 300px;
    }
    
    .orders-header {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
    }
    
    .order-header {
        flex-direction: column;
        gap: 12px;
        align-items: flex-start;
    }
    
    .order-details {
        grid-template-columns: 1fr;
    }
    
    .action-buttons {
        flex-direction: column;
        align-items: center;
    }
    
    .action-buttons .el-button {
        width: 100%;
        max-width: 200px;
    }
}

/* Element Plus 组件样式覆盖 */
.el-card {
    border: none;
}

.el-empty {
    padding: 40px 20px;
}

.el-tag {
    font-weight: 500;
}

.el-button {
    border-radius: 6px;
    font-weight: 500;
}
</style>
