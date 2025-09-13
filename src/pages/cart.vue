<script setup>
import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';
import GoTop from '../components/GoTop.vue';
import MenuPop from '../components/MenuPop.vue';
import PopUp from '../components/PopUp.vue';
import OurShop from '../components/OurShop.vue';
import "../assets/css/cart.css";
import { getCartList, deleteCartItem, getProvinces, getCities, getDistricts, addAress, getAddressList, deleteAddress, clearCart } from '../apis';
import { ref, onMounted,watch,computed } from 'vue';
import { useCartStore } from '../stores/cartStore';
import { ElMessage, ElMessageBox } from 'element-plus';

const isPay = ref(true);
const showCartList = ref(false);
const cartStore = useCartStore();
const cartList = computed(() => cartStore.cartList);

// 新增地址表单数据
const addressForm = ref({
    takename: '',      // 收货人姓名
    province: '',      // 省份
    city: '',          // 城市
    district: '',      // 区县
    streetname: '',    // 详细地址
    tel: '',          // 手机号码
    postcode: ''      // 邮政编码（从选择的区县数据中获取code）
});

// 地址选择器数据
const provinces = ref([]);
const cities = ref([]);
const districts = ref([]);

// 地址列表数据
const addressList = ref([]);

// 选中的地址
const selectedAddress = ref(null);

// 选中商品总价，响应式
const totalPrice = computed(() => {
    if (!selectedItems.value.length || !cartList.value.length) return 0;
    let sum = 0;
    selectedItems.value.forEach(sel => {
        const item = cartList.value.find(c => c.goods_id === sel.goodsId);
        if (item) {
            sum += Number(item.price) * Number(sel.goods_number);
        }
    });
    return sum;
});
// 选中商品数组，初始全选
const selectedItems = ref([]); // 待补充：将选中的商品通过api提交到结算清单

// 计算全选状态
const isAllChecked = ref(true);

// 监听cartList变化，初始化全选
watch(cartList, (newList) => {
    if (newList && newList.length > 0) {
        selectedItems.value = newList.map(item => ({ goodsId: item.goods_id, goods_number: item.goods_number }));
        isAllChecked.value = true;
    } else {
        selectedItems.value = [];
        isAllChecked.value = false;
    }
}, { immediate: true });

// 处理单个商品选中/取消
const handleItemCheck = (item, checked) => {
    if (checked) {
        // 添加到选中数组
        if (!selectedItems.value.some(i => i.goodsId === item.goods_id)) {
            selectedItems.value.push({ goodsId: item.goods_id, goods_number: item.goods_number });
        }
    } else {
        // 从选中数组移除
        selectedItems.value = selectedItems.value.filter(i => i.goodsId !== item.goods_id);
    }
    // 判断是否全选
    isAllChecked.value = selectedItems.value.length === cartList.value.length;
};

// 处理全选按钮
const handleCheckAll = (checked) => {
    isAllChecked.value = checked;
    if (checked) {
        selectedItems.value = cartList.value.map(item => ({ goodsId: item.goods_id, goods_number: item.goods_number }));
    } else {
        selectedItems.value = [];
    }
};
const goToCart = () => {
    isPay.value = true;
    fetchCartList();
}

// 删除购物车商品
const deleteCart = async (goodsId) => {
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    const res = await deleteCartItem(userId, goodsId);
    if (res) {
        // 删除成功后刷新购物车列表，使用pinia
        await cartStore.fetchCartList();
    } else {
        // 可选：弹窗提示删除失败
        showCartList.value = true;
    }
};
const goToPay = () => {
    isPay.value = false;
}
const fetchCartList = async () => {
    await cartStore.fetchCartList();
    if (!cartStore.cartList.length) {
        showCartList.value = true;
    }
}

// 获取省份数据
const fetchProvinces = async () => {
    try {
        const res = await getProvinces();
        if (res && Array.isArray(res) && res.length > 0) {
            provinces.value = res;
        } else {
            console.error('获取省份数据失败或数据为空:', res);
        }
    } catch (error) {
        console.error('获取省份数据时发生错误:', error);
    }
}

// 获取地址列表
const fetchAddressList = async () => {
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    if (!userId) {
        console.error('用户未登录');
        return;
    }
    
    try {
        const res = await getAddressList(userId);
        if (res && Array.isArray(res)) {
            addressList.value = res;
        } else {
            console.error('获取地址列表失败或数据为空:', res);
            addressList.value = [];
        }
    } catch (error) {
        console.error('获取地址列表时发生错误:', error);
        addressList.value = [];
    }
}

// 选择地址
const selectAddress = (address) => {
    selectedAddress.value = address;
    console.log('选中的地址:', selectedAddress.value);
}

// 清空表单
const clearAddressForm = () => {
    addressForm.value = {
        takename: '',
        province: '',
        city: '',
        district: '',
        streetname: '',
        tel: '',
        postcode: ''
    };
    // 清空选择器数据
    cities.value = [];
    districts.value = [];
}

// 省份选择改变时，获取城市数据
const onProvinceChange = async () => {
    // 清空城市和区县选择
    addressForm.value.city = '';
    addressForm.value.district = '';
    cities.value = [];
    districts.value = [];
    
    if (addressForm.value.province) {
        const res = await getCities(addressForm.value.province);
        if (res) {
            cities.value = res;
        }
    }
}

// 城市选择改变时，获取区县数据
const onCityChange = async () => {
    // 清空区县选择
    addressForm.value.district = '';
    districts.value = [];
    
    if (addressForm.value.city) {
        const res = await getDistricts(addressForm.value.province, addressForm.value.city);
        if (res && res.area) {
            districts.value = res.area;
        }
    }
}

// 区县选择改变时，保存code到邮政编码字段
const onDistrictChange = () => {
    if (addressForm.value.district) {
        const selectedDistrict = districts.value.find(item => item.name === addressForm.value.district);
        if (selectedDistrict) {
            addressForm.value.postcode = selectedDistrict.code;
        }
    }
}

// 新增地址
const addNewAddress = async () => {
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    if (!userId) {
        console.error('用户未登录');
        return;
    }
    
    // 表单验证
    if (!addressForm.value.takename || !addressForm.value.province || !addressForm.value.city || 
        !addressForm.value.district || !addressForm.value.streetname || !addressForm.value.tel) {
        ElMessage.warning('请填写完整的地址信息');
        return;
    }
    
    try {
        const res = await addAress(
            'addAddress',
            userId,
            addressForm.value.province,
            addressForm.value.city,
            addressForm.value.district,
            addressForm.value.streetname,
            addressForm.value.takename,
            addressForm.value.postcode,
            addressForm.value.tel
        );
        
        if (res) {
            // 新增成功后刷新地址列表
            await fetchAddressList();
            // 清空表单
            clearAddressForm();
            ElMessage.success('地址添加成功！');
        } else {
            ElMessage.error('地址添加失败，请重试！');
        }
    } catch (error) {
        console.error('新增地址时发生错误:', error);
        ElMessage.error('地址添加失败，请重试！');
    }
}

// 删除地址
const deleteAddressItem = async (addressId) => {
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    if (!userId) {
        console.error('用户未登录');
        return;
    }
    
    try {
        // 确认删除
        await ElMessageBox.confirm(
            '确定要删除这个地址吗？',
            '提示',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }
        );
        
        const res = await deleteAddress(userId, addressId);
        
        if (res) {
            // 删除成功后刷新地址列表
            await fetchAddressList();
            // 如果删除的是当前选中的地址，清空选中状态
            if (selectedAddress.value && selectedAddress.value.address_id === addressId) {
                selectedAddress.value = null;
            }
            ElMessage.success('地址删除成功！');
        } else {
            ElMessage.error('地址删除失败，请重试！');
        }
    } catch (error) {
        if (error === 'cancel') {
            // 用户取消删除，不显示错误信息
            return;
        }
        console.error('删除地址时发生错误:', error);
        ElMessage.error('地址删除失败，请重试！');
    }
}
// 清空购物车
const clearCartAll = async () => {
    try {
        // 确认清空
        await ElMessageBox.confirm(
            '确定要清空购物车吗？',
            '提示',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }
        );
        
        const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
        if (!userId) {
            console.error('用户未登录');
            return;
        }
        
        const res = await clearCart(userId);
        
        if (res) {
            // 清空成功后刷新购物车列表
            await cartStore.fetchCartList();
            // 清空选中状态
            selectedItems.value = [];
            isAllChecked.value = false;
            ElMessage.success('购物车已清空！');
        } else {
            ElMessage.error('清空购物车失败，请重试！');
        }
    } catch (error) {
        if (error === 'cancel') {
            // 用户取消清空，不显示错误信息
            return;
        }
        console.error('清空购物车时发生错误:', error);
        ElMessage.error('清空购物车失败，请重试！');
    }
}
onMounted(() => {
    fetchCartList();
    fetchProvinces(); // 获取省份数据
    fetchAddressList(); // 获取地址列表
});
</script>
<template>
    <div class="cart-page">
        <div class="cart-page-title">
            <p @click="goToCart" :style="{ color: isPay ? '#3e89d9' : '#666' }">购物车</p>
            <span>|</span>
            <p @click="goToPay" :style="{ color: !isPay ? '#3e89d9' : '#666' }">付款</p>
        </div>
        <div v-if="isPay" class="cart-page-shop">
            <div v-if="cartList.length > 0">
                <table>
                    <thead>
                            <th class="checkall">
                                <input type="checkbox" id="checkall" :checked="isAllChecked" @change="handleCheckAll($event.target.checked)">
                                <label for="checkall">全选</label>
                            </th>
                        <th>良品</th>
                        <th>数量</th>
                        <th>单价（元）</th>
                        <th>小计（元）</th>
                        <th>操作</th>
                    </thead>
                    <tbody>
                        <tr v-for="value in cartList" :key="value.id">
                            <td>
                                    <label>
                                        <input type="checkbox"
                                            :id="value.id"
                                            :checked="selectedItems.some(i => i.goodsId === value.goods_id)"
                                            @change="handleItemCheck(value, $event.target.checked)"
                                        >
                                        <img :src="value.goods_thumb">
                                    </label>
                            </td>
                            <td><span>{{ value.goods_name }}</span></td>
                            <td><span>{{ value.goods_number }}</span></td>
                            <td>{{ value.price }}</td>
                            <td>{{ value.price * Number(value.goods_number) }}</td>
                            <td><button @click="deleteCart(value.goods_id)">删除</button></td>
                        </tr>
                    </tbody>
                </table>
                <div class="cart-actions">
                    <button class="clear-cart-btn" @click="clearCartAll">清空购物车</button>
                </div>
                <div class="cps-bottom">
                    <div class="cpsb-price">
                        良品总价：<span>￥{{ totalPrice }}</span>
                    </div>
                    <div class="cpsb-pay" @click="goToPay">立即结算</div>
                    <router-link to="/home">继续购物</router-link>
                </div>
            </div>
            <div v-else class="cart-empty">
                <router-link to="/home">购物车空空如也~~去购物吧!</router-link>
            </div>
        </div>
        <div v-else class="cart-page-pay">
            <div class="cpp-address">
                <div class="cppa-title">
                    <p>收货地址</p>
                </div>
                <div class="cppa-addressList">
                    <div v-if="addressList.length > 0" class="address-list-container">
                        <div class="address-list-wrapper">
                            <div 
                                v-for="address in addressList" 
                                :key="address.address_id"
                                :class="['address-card', { 'selected': selectedAddress && selectedAddress.address_id === address.address_id }]"
                                @click="selectAddress(address)"
                            >
                                <div class="address-card-header">
                                    <div class="address-info">
                                        <span class="address-name">{{ address.takename }}</span>
                                        <span class="address-phone">{{ address.tel }}</span>
                                    </div>
                                    <button class="delete-btn" @click.stop="deleteAddressItem(address.address_id)">删除</button>
                                </div>
                                <div class="address-card-body">
                                    <p class="address-detail">
                                        {{ address.province }} {{ address.district }} {{ address.streetname }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else class="no-address">
                        <p>暂无收货地址，请添加新地址</p>
                    </div>
                </div>
                <div class="cppa-newAddress">
                    <h3>新增收货地址</h3>
                    <div class="address-form">
                        <div class="form-row">
                            <label>收货人姓名：</label>
                            <input 
                                type="text" 
                                v-model="addressForm.takename" 
                                placeholder="请输入收货人姓名"
                                class="form-input"
                            >
                        </div>
                        
                        <div class="form-row">
                            <label>所在地区：</label>
                            <div class="select-group">
                                <select 
                                    v-model="addressForm.province" 
                                    @change="onProvinceChange"
                                    class="form-select"
                                >
                                    <option value="">请选择省份</option>
                                    <option 
                                        v-for="province in provinces" 
                                        :key="province.code" 
                                        :value="province.name"
                                    >
                                        {{ province.name }}
                                    </option>
                                </select>
                                
                                <select 
                                    v-model="addressForm.city" 
                                    @change="onCityChange"
                                    :disabled="!addressForm.province"
                                    class="form-select"
                                >
                                    <option value="">请选择城市</option>
                                    <option 
                                        v-for="city in cities" 
                                        :key="city.code" 
                                        :value="city.name"
                                    >
                                        {{ city.name }}
                                    </option>
                                </select>
                                
                                <select 
                                    v-model="addressForm.district" 
                                    @change="onDistrictChange"
                                    :disabled="!addressForm.city"
                                    class="form-select"
                                >
                                    <option value="">请选择区县</option>
                                    <option 
                                        v-for="district in districts" 
                                        :key="district.code" 
                                        :value="district.name"
                                    >
                                        {{ district.name }}
                                    </option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <label>详细地址：</label>
                            <input 
                                type="text" 
                                v-model="addressForm.streetname" 
                                placeholder="请输入详细地址"
                                class="form-input"
                            >
                        </div>
                        
                        <div class="form-row">
                            <label>手机号码：</label>
                            <input 
                                type="tel" 
                                v-model="addressForm.tel" 
                                placeholder="请输入手机号码"
                                class="form-input"
                            >
                        </div>
                        
                        <div class="form-row">
                            <button class="add-address-btn" @click="addNewAddress">新增地址</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <Header></Header>
    <MenuPop></MenuPop>
    <GoTop></GoTop>
    <OurShop></OurShop>
    <PopUp v-if="showCartList" message="获取购物车清单失败！"></PopUp>
    <Footer></Footer>
</template>
<style scoped>
</style>
