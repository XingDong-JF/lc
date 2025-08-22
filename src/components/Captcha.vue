<script setup>
import { ref, onMounted, watch, defineExpose } from 'vue'; // 引入 defineExpose

const props = defineProps({
    length: {
        type: Number,
        default: 4,
    },
    width: {
        type: Number,
        default: 120,
    },
    height: {
        type: Number,
        default: 40,
    },
    fontFamily: {
        type: String,
        default: 'Arial, sans-serif',
    },
    fontSize: {
        type: Number,
        default: 24,
    },
    textColor: {
        type: Array,
        default: () => ['#333', '#666', '#999'],
    },
    backgroundColor: {
        type: String,
        default: '#f0f0f0',
    },
    placeholder: {
        type: String,
        default: '请输入验证码',
    },
});

const emit = defineEmits(['verify']); 

const captchaCanvas = ref(null);
const captchaString = ref('');
const userInput = ref('');
const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

// 生成随机颜色
const getRandomColor = (colors) => {
    if (!colors || colors.length === 0) return '#000';
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
};

// 生成验证码字符串
const generateCaptchaString = () => {
    let result = '';
    for (let i = 0; i < props.length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    captchaString.value = result;
};

// 绘制验证码到 Canvas
const drawCaptcha = () => {
    const canvas = captchaCanvas.value;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // 清除画布
    ctx.clearRect(0, 0, props.width, props.height);

    // 绘制背景
    ctx.fillStyle = props.backgroundColor;
    ctx.fillRect(0, 0, props.width, props.height);

    // 绘制干扰线
    for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = getRandomColor(props.textColor);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(Math.random() * props.width, Math.random() * props.height);
        ctx.lineTo(Math.random() * props.width, Math.random() * props.height);
        ctx.stroke();
    }

    // 绘制验证码字符
    ctx.font = `${props.fontSize}px ${props.fontFamily}`;
    const charWidth = props.width / (props.length + 1);
    const charHeight = props.height / 2 + props.fontSize / 2;

    // 调整垂直居中
    for (let i = 0; i < captchaString.value.length; i++) {
        ctx.fillStyle = getRandomColor(props.textColor);
        // 随机倾斜角度
        ctx.setTransform(1, Math.random() * 0.2 - 0.1, 0, 1, 0, 0); // 随机倾斜 [-0.1, 0.1]
        ctx.fillText(
            captchaString.value[i],
            charWidth * (i + 0.5), // 字符中心位置
            charHeight
        );
        // 重置变换
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
};

// 生成新的验证码
const generateCaptcha = () => {
    userInput.value = ''; // 清空输入框
    generateCaptchaString();
    drawCaptcha();
};

// 验证方法（现在将由父组件调用）
const verifyCaptcha = () => {
    if (userInput.value.toLowerCase() === captchaString.value.toLowerCase()) {
        return true; // 返回 true 表示验证成功
    } else {
        generateCaptcha(); // 验证失败后重新生成验证码
        return false; // 返回 false 表示验证失败
    }
};

// 监听 props 变化，重新绘制
watch(
    [
        () => props.length,
        () => props.width,
        () => props.height,
        () => props.fontFamily,
        () => props.fontSize,
        () => props.textColor,
        () => props.backgroundColor,
    ],
    () => {
        generateCaptcha();
    },
    { deep: true }
);

onMounted(() => {
    generateCaptcha();
});

// 暴露方法给父组件
defineExpose({
    verifyCaptcha, // 暴露 verifyCaptcha 方法
    generateCaptcha, // 也可以暴露 generateCaptcha 方法，用于重置验证码
    userInput // 如果父组件需要获取用户输入的验证码，也可以暴露
});
</script>

<template>
    <div class="captcha-container">
        <div class="input-wrapper">
            <input type="text" v-model="userInput"  :placeholder="placeholder"   @input="handleInput"
                @keyup.enter="verifyCaptcha" />
            <canvas ref="captchaCanvas" :width="width" :height="height" @click="generateCaptcha"
                style="cursor: pointer; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 4px"></canvas>
        </div>
    </div>
</template>

<style scoped>
.captcha-container {
    width: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    font-family: sans-serif;
    margin-top: 10px;
}

.input-wrapper {
    display: flex;
    gap: 5px;
    align-items: center;
    border-bottom: 1px solid var(--border-color);
}

/* 覆盖父组件中关于验证码样式的部分 */
.captcha-container input[type="text"] {
    width: 140px;
    padding: 0 10px;
}

</style>
