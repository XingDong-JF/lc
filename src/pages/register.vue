<script setup>
// 引入api
import { register, checkUsername } from '../apis/index.js';
// 引入css
import '../assets/css/login.css';
// 引入vue3关键字
import { ref, watch } from 'vue'; // 引入
import { useRouter } from 'vue-router';
// 引入弹窗组件
import Popup from '../components/PopUp.vue';
// 引入验证码组件
import Captcha from '../components/Captcha.vue';

const router = useRouter();
const username = ref('');
const password = ref('');
const passwordAgain = ref('');
const isUsername = ref(true);
const isPassword = ref(true);
const isPasswordAgain = ref(true);
const showPopup = ref(false);
const popupMessage = ref('');
const verificationStatus = ref(true); // 初始设为true，表示未验证或验证不通过

// 获取Captcha组件的实例
const captchaRef = ref(null); // 创建一个ref来引用Captcha组件

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
async function toRegister() {
  let count = 0;
  let axiosCheckUsername;
  let axiosLogin;

  // 1. 基础信息验证
  if (!checkName(username.value)) {
    isUsername.value = false;
    count++;
  }
  if (!checkPassword(password.value)) {
    isPassword.value = false;
    count++;
  }
  if (password.value !== passwordAgain.value) {
    isPasswordAgain.value = false;
    count++;
  }

  // 2. 验证码验证
  // 确保 captchaRef.value 存在且 captchaRef.value.verifyCaptcha 是一个函数
  if (captchaRef.value && typeof captchaRef.value.verifyCaptcha === 'function') {
    const isCaptchaValid = captchaRef.value.verifyCaptcha(); // 调用子组件的验证方法
    if (!isCaptchaValid) {
      // 验证码验证失败，captchaRef.value.verifyCaptcha() 内部会显示提示信息并重新生成验证码
      // 我们在这里将 verificationStatus 设置为 false，以标记验证不通过
      verificationStatus.value = false;
      setTimeout(()=>verificationStatus.value = true,1000)
      count++; // 增加计数，表示需要继续验证
    } else {
      // 验证码验证成功
      verificationStatus.value = true;
    }
  } else {
    // 如果 captchaRef.value 或 verifyCaptcha 方法不存在，表示验证码组件未加载或未正确引用
    // 这种情况一般不应该发生，但为了健壮性，可以打印警告或处理
    console.error("Captcha component or its verifyCaptcha method is not available.");
    // 默认认为验证失败，增加计数
    verificationStatus.value = false;
    count++;
  }


  // 3. 如果所有验证都通过，则进行用户名存在性检查和注册
  if (count === 0) {
    // 调用 checkUsername API 检查用户名是否存在
    try {
      axiosCheckUsername = await checkUsername(username.value);
      console.log(axiosCheckUsername)
    } catch (error) {
      console.error("Error checking username:", error);
      showPopupMessage('检查用户名时发生错误！');
      return; // 停止执行
    }

    // 初步验证用户名是否存在
    if (!axiosCheckUsername) {
      // 用户名已存在
      showPopupMessage('用户名已存在！');
      username.value = '';
    } else {
      // 用户名不存在，进行注册
      try {
        axiosLogin = await register(username.value, password.value);
        if (axiosLogin) {
          sessionStorage.setItem('username', username.value);
          router.push('/home');
        } else {
          showPopupMessage('注册失败，请稍后再试！');
        }
      } catch (error) {
        console.error("Error during registration:", error);
        showPopupMessage('注册时发生错误！');
      }
    }
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
watch(passwordAgain, () => {
  isPasswordAgain.value = true;
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
      <div class="againpassword-input">
        <input type="password" placeholder="请确认输入密码" v-model="passwordAgain">
      </div>
      <span class="tips" v-show="!isPasswordAgain">两次输入的密码不同！</span>

      <!-- 引入 Captcha 组件，并为其添加 ref -->
      <Captcha ref="captchaRef" :length="5" :width="128" :height="40" font-family="Georgia, serif" :font-size="28"
        :text-color="['blue', 'green', 'purple']" background-color="#e0f7fa" placeholder="请输入验证码" />
      <span class="tips" v-show="!verificationStatus">验证码错误！</span>
    </div>
    <div class="box-btu">
      <button @click="toRegister">注册</button>
    </div>
    <div class="box-login">
      <router-link to="/login">已有账号？点击登录 > > ></router-link>
    </div>
  </div>
  <!-- 使用弹窗组件 -->
  <Popup v-if="showPopup" :message="popupMessage" />
</template>

<style scoped>
.box {
  width: 300px;
  height: 600px;
  position: absolute;
  top: 42%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.againpassword-input {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  margin-top: 10px;
}

.againpassword-input>input {
  width: 260px;
  height: 35px;
  padding: 2px 10px;
}

.againpassword-input::before {
  content: '';
  width: 19px;
  height: 24px;
  margin-top: 5px;
  display: inline-block;
  background: url('https://www.iliangcang.com/images/nlcode.png') no-repeat center;
}

.box-login {
  text-align: center;
  font-size: 12px;
}
.box-login>a{
  color: #404040;
}
/* 调整占位符的样式，确保它们不会干扰验证码组件 */
.box-input input::placeholder {
  color: #aaa;
}
</style>
