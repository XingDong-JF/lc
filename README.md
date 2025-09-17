# 良仓电商平台

> 基于 Vue 3 + Vite 构建的现代化 B2C 电商平台，采用前后端分离架构，实现完整的电商业务流程。

## 🚀 技术栈

### 核心技术
- **Vue 3.5.18** - 采用 Composition API，提供更好的逻辑复用和类型推导
- **Vite 7.1.2** - 极速的构建工具，支持 HMR 和 ES 模块
- **Vue Router 4.5.1** - 官方路由管理器，支持懒加载和路由守卫
- **Pinia 3.0.3** - 新一代状态管理库，替代 Vuex
- **Element Plus 2.11.2** - 基于 Vue 3 的企业级 UI 组件库
- **Axios 1.11.0** - HTTP 客户端，用于 API 请求

### 开发工具
- **@vitejs/plugin-vue 6.0.1** - Vue 单文件组件支持
- **JavaScript ES6+** - 现代 JavaScript 语法
- **CSS3** - 样式开发

## 📁 项目架构

```
src/
├── apis/           # API 接口层
│   └── index.js    # 统一的 API 请求封装
├── assets/         # 静态资源
│   ├── css/        # 全局样式
│   └── imgs/       # 图片资源
├── components/     # 可复用组件
│   ├── BannerCarousel.vue    # 轮播图组件
│   ├── Header.vue            # 页面头部
│   ├── Footer.vue            # 页面底部
│   ├── GoodsClassify.vue     # 商品分类导航
│   ├── HotGoods.vue          # 热门商品展示
│   ├── HeadCart.vue          # 头部购物车
│   └── ...                   # 其他业务组件
├── pages/          # 页面组件
│   ├── home.vue              # 首页
│   ├── login.vue             # 登录页
│   ├── register.vue          # 注册页
│   ├── classify.vue          # 分类页
│   ├── detail.vue            # 商品详情页
│   ├── cart.vue              # 购物车页
│   ├── search.vue            # 搜索页
│   └── payment.vue           # 支付页
├── routes/         # 路由配置
│   └── index.js    # 路由定义和守卫
├── stores/         # 状态管理
│   └── cartStore.js          # 购物车状态管理
├── App.vue         # 根组件
└── main.js         # 应用入口
```

## 🔧 核心功能实现

### 1. 用户认证系统
- **注册/登录**: 用户名密码验证，支持本地存储和会话存储
- **路由守卫**: 基于 `beforeEach` 实现的登录状态检查
- **权限控制**: 区分需要认证和无需认证的页面

```javascript
// 路由守卫示例
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    if (isAuthenticated()) {
      next();
    } else {
      next('/login');
    }
  } else {
    next();
  }
});
```

### 2. 状态管理 (Pinia)
- **购物车状态**: 使用 Pinia 管理购物车数据，支持跨组件状态共享
- **用户状态**: 持久化存储用户登录信息

```javascript
// 购物车 Store
export const useCartStore = defineStore('cart', {
  state: () => ({
    cartList: []
  }),
  actions: {
    async fetchCartList() {
      // 获取购物车数据逻辑
    }
  }
});
```

### 3. API 接口封装
- **统一请求处理**: 封装 Axios，统一错误处理和响应格式
- **接口分类**: 按业务模块组织 API 接口
- **跨域处理**: Vite 代理配置解决开发环境跨域问题

```javascript
// Vite 代理配置
server: {
  proxy: {
    '/api_user': {
      target: 'http://8.134.172.28:3008',
      changeOrigin: true,
      rewrite: (path) => path
    }
    // ... 其他 API 代理
  }
}
```

### 4. 组件化开发
- **业务组件**: 轮播图、商品展示、分类导航等可复用组件
- **基础组件**: 消息提示、弹窗、面包屑等通用 UI 组件
- **组件通信**: Props/Emit、Provide/Inject 等多种通信方式

### 5. 路由管理
- **懒加载**: 所有页面组件采用动态导入，优化首屏加载
- **动态路由**: 支持商品详情、分类等动态参数路由
- **页面标题**: 自动设置页面标题，提升 SEO

## 🛠 开发环境配置

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview
```

## 🌐 API 接口说明

项目与后端 API 服务 (`http://8.134.172.28:3008`) 进行数据交互，主要接口包括：

- `/api_user` - 用户相关接口（注册、登录、验证）
- `/api_goods` - 商品相关接口（列表、详情、分类）
- `/api_cart` - 购物车接口（增删改查）
- `/api_search` - 商品搜索接口
- `/api_address` - 收货地址管理
- `/api_payment` - 支付相关接口
- `/api_order` - 订单管理接口

## 🎯 核心业务流程

### 用户购物流程
1. **用户注册/登录** → 身份验证
2. **商品浏览** → 首页/分类页/搜索页
3. **商品详情** → 查看详细信息
4. **加入购物车** → 状态管理更新
5. **购物车管理** → 商品增删改
6. **订单结算** → 地址选择、订单确认
7. **支付处理** → 第三方支付集成
8. **订单查询** → 订单状态跟踪

## 🔍 技术亮点

### 1. 现代化开发体验
- **Vite 构建**: 极速的开发服务器启动和 HMR
- **Composition API**: 更好的逻辑复用和类型推导
- **ES6+ 语法**: 使用最新的 JavaScript 特性

### 2. 性能优化
- **路由懒加载**: 按需加载页面组件，减少初始包大小
- **组件复用**: 高度组件化，提高代码复用率
- **状态管理**: Pinia 提供更好的性能和开发体验

### 3. 用户体验
- **响应式设计**: 适配不同屏幕尺寸
- **交互反馈**: 完善的加载状态和错误提示
- **路由守卫**: 自动登录状态检查和页面跳转

### 4. 代码质量
- **模块化架构**: 清晰的目录结构和职责分离
- **错误处理**: 统一的错误处理机制
- **代码规范**: 一致的编码风格和命名规范

## 📈 项目特色

- **前后端分离**: 纯前端项目，通过 API 与后端交互
- **单页应用**: SPA 架构，提供流畅的用户体验
- **组件化开发**: 高度模块化，便于维护和扩展
- **现代化技术栈**: 采用最新的 Vue 3 生态系统
- **完整业务流程**: 涵盖电商平台核心功能模块

## 🚀 部署说明

项目使用 Vite 构建，生成的静态文件可部署到任何静态文件服务器：

1. 执行 `npm run build` 生成 `dist` 目录
2. 将 `dist` 目录内容部署到服务器
3. 配置服务器支持 SPA 路由（如 Nginx 的 `try_files`）

---

> 这个项目展示了现代 Vue.js 开发的最佳实践，从项目架构到具体实现都体现了前端工程化的思想。通过完整的电商业务场景，深入实践了 Vue 3 生态系统的各项技术。