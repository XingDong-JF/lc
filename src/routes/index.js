// 引入路由
import { createRouter, createWebHistory } from 'vue-router';
// 引入路由组件 -- 懒加载

// token验证
const isAuthenticated = () => {
  // 检查 localStorage
  return localStorage.getItem('username') !== null || sessionStorage.getItem('username');
};


// 定义路由
const routes = [
  {
    path: '/',
    name: 'Root',
    // 当用户访问根路径时，根据登录状态进行重定向
    redirect: to => {
      if (isAuthenticated()) {
        return { name: 'Home' }; // 如果已登录，跳转到 Home
      } else {
        return { name: 'Login' }; // 如果未登录，跳转到 Login
      }
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/login.vue'), // 懒加载
    meta: {
      title: '良仓-登录',
      noAuth: true // 标记为不需要认证的页面
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../pages/register.vue'), // 懒加载
    meta: {
      title: '良仓-注册',
      noAuth: true // 标记为不需要认证的页面
    }
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../pages/home.vue'), // 懒加载
    meta: {
      title: '良仓',
      requiresAuth: true // 标记为需要认证的页面
    }
  },
  {
    path: '/classify/:catId',
    name: 'Classify',
    component: () => import('../pages/classify.vue'), // 懒加载
    meta: {
      title: '良仓-分类商品',
      requiresAuth: true // 标记为需要认证的页面
    }
  },
  {
    path: '/detail/:goodsId',
    name: 'Detail',
    component: () => import('../pages/detail.vue'), // 懒加载
    meta: {
      title: '良仓-商品详情',
      requiresAuth: true // 标记为需要认证的页面
    }
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('../pages/cart.vue'), // 懒加载
    meta: {
      title: '良仓-购物车',
      requiresAuth: true // 标记为需要认证的页面
    }
  }
];

// 创建路由实例
const router = createRouter({
  // history: createWebHistory('/'), // '/ ' 通常可以省略，createWebHistory() 默认就是 '/'
  history: createWebHistory(), // 部署在服务器根目录
  routes
});

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题 (可选，但通常是个好习惯)
  if (to.meta.title) {
    document.title = to.meta.title;
  } else {
    document.title = '良仓-美好生活'; // 默认标题
  }

  // 检查路由是否需要登录
  if (to.meta.requiresAuth) {
    if (isAuthenticated()) {
      // 如果需要登录且已登录，允许访问
      next();
    } else {
      // 如果需要登录但未登录，重定向到登录页
      next('/login')
    }
  } else {
    // 如果不需要登录 (例如登录页本身)，允许访问
    next();
  }
});


// 导出路由实例
export default router;
