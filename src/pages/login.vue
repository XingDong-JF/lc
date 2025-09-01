<script setup>
// 引入api
import { checkUsername, login } from '../apis/index.js';
// 引入css
import '../assets/css/login.css';
// 引入vue3关键字
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
// 引入弹窗组件
import Popup from '../components/PopUp.vue';

const router = useRouter();
const username = ref('');
const password = ref('');
const rememberMe = ref(false)
const isUsername = ref(true);
const isPassword = ref(true);
const showPopup = ref(false);
const popupMessage = ref('');

// 显示弹窗的方法
function showPopupMessage(message) {
    popupMessage.value = message;
    showPopup.value = true;
    // 2秒后自动隐藏（与动画时长一致）
    setTimeout(() => {
        showPopup.value = false;
    }, 2600);
}

// 提交处理
async function toLogin() {
    let count = 0;
    let axiosCheckUsername;
    let axiosLogin;
    if (!checkName(username.value)) {
        isUsername.value = false;
        count++;
    }
    if (!checkPassword(password.value)) {
        isPassword.value = false;
        count++;
    }
    if (count === 0) {
        axiosCheckUsername = await checkUsername(username.value);
    }
    // 初步验证用户名是否存在
    if (count === 0 && !axiosCheckUsername) {
        // 再次验证密码
        axiosLogin = await login(username.value, password.value);
        if (axiosLogin) {
            // 检验自动登录
            if (rememberMe.value) {
                localStorage.setItem('username', username.value);
                localStorage.setItem('userId', axiosLogin.user_id);
            } else {
                sessionStorage.setItem('username', username.value);
                sessionStorage.setItem('userId', axiosLogin.user_id);
            }
            router.push('/home')
        } else {
            username.value = '';
            password.value = '';
            // 显示错误弹窗
            showPopupMessage('用户名或密码错误！');
        }
    } else if(count === 0 && axiosCheckUsername){
        // 显示用户不存在弹窗
        showPopupMessage('用户名不存在，请注册！');
    }
}
// 检验用户名
function checkName(name) {
    return /^[0-9a-zA-Z_]{3,12}$/.test(name);
}
// 检验密码
function checkPassword(password) {
    return /^\d{6,12}$/.test(password);
}

// 添加输入监听
watch(username, () => {
    isUsername.value = true;
});

watch(password, () => {
    isPassword.value = true;
});
</script>

<template>
    <div class="box">
        <div class="box-img">
            <img src="https://www.iliangcang.com/images/nlicon.png" alt="良仓">
        </div>
        <div class="box-input">
            <div class="username-input">
                <input type="text" placeholder="请输入用户名" v-model="username">
            </div>
            <span class="tips" v-show="!isUsername">用户名为3-12位字母数字下划线组成！</span>
            <div class="password-input">
                <input type="password" placeholder="请输入密码" v-model="password">
            </div>
            <span class="tips" v-show="!isPassword">密码6-12位数字组成！</span>
        </div>
        <div class="box-checked">
            <input type="checkbox" name="autoLogin" id="autoLogin" v-model="rememberMe">
            <label for="autoLogin">自动登录</label>
        </div>
        <div class="box-btu">
            <button @click="toLogin">登录</button>
        </div>
        <div class="box-register">
            <router-link to="/register">没有账号？点击注册 > > ></router-link>
        </div>
    </div>
    <!-- 使用弹窗组件 -->
    <Popup v-if="showPopup" :message="popupMessage" /> <!-- 动态属性绑定 -->
</template>

<style scoped>
.box{
    width: 300px;
    height: 600px;
    position: absolute;
    top: 47%;
    left: 50%;
    transform: translate(-50%, -50%);
}
.box-checked{
    margin-top: 10px;
    font-size: 14px;
    color: #404040;
}
.box-checked>input{
    width: 12px;
    height: 12px;
    cursor: pointer;
}
.box-checked>label{
    padding-left: 6px;
    cursor: pointer;
}
.box-register{
    text-align: center;
    font-size: 12px;
}
.box-register>a{
    color: #404040;
}
</style>