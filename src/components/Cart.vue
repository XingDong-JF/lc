<script setup>
</script>

<template>
    <div class="cart-container">
        <div class="cart-list">
            <p>你的购物车暂时没有商品...</p>
        </div>
        <div class="cart-page">
            <p>快去抢购良仓商品吧!</p>
        </div>
    </div>
</template>

<style scoped>
.cart-container {
    width: 320px;
    border-top: 20px solid var(--theme-bg-color);
}
.cart-list{
    min-height: 80px;
    font-size: 14px;
    text-align: center;
    background-color: #2c2f33;
    color: #666;
}
.cart-list>p{
    line-height: 80px;
}
.cart-page{
    height: 50px;
    font-size: 14px;
    text-align: center;
    line-height: 50px;
    color: #fff;
    background-color: #7dbfde;
    border-bottom-left-radius: 3px;
    border-bottom-right-radius: 3px;
}
.cart-page:hover{
    background-color: #96c9e5;
    cursor: pointer;
}
</style>