import { createWebHistory, createRouter } from "vue-router";
/* Layout */
import Layout from "@/layout";

/**
 * Vue Router 配置说明：
 *
 * 1. 基本路由结构：
 * {
 *   path: '/路径',              // URL 路径
 *   component: 组件,            // 路由对应的组件
 *   name: '路由名称',           // 路由名称，用于编程式导航
 *   meta: { ... },            // 路由元信息，用于存储自定义数据
 *   children: [ ... ]         // 子路由配置
 * }
 *
 * 2. 重要配置参数说明：
 * hidden: true                // 是否在侧边栏隐藏此路由
 * alwaysShow: true           // 是否始终显示根路由（即使只有一个子路由）
 * redirect: noRedirect       // 重定向设置，noRedirect 表示该路由在面包屑中不可点击
 * name: 'router-name'        // 路由名称，使用 keep-alive 时必须设置
 * query: {...}              // 路由默认传递的参数
 * roles: ['admin', ...]     // 可访问此路由的角色列表
 * permissions: [...]        // 可访问此路由的权限列表
 *
 * 3. meta 配置说明：
 * noCache: true             // 是否禁用 keep-alive 缓存
 * title: '标题'             // 路由在侧边栏和面包屑中显示的标题
 * icon: 'svg-name'         // 路由图标，对应 src/assets/icons/svg 中的图标
 * breadcrumb: false        // 是否在面包屑中显示
 * activeMenu: '/path'      // 指定侧边栏高亮的路由路径
 */

// 公共路由 - 所有用户都可以访问的路由配置
export const constantRoutes = [
  {
    // 重定向路由 - 用于处理路由重定向
    path: "/redirect",
    component: Layout,
    hidden: true,
    children: [
      {
        path: "/redirect/:path(.*)", // 动态路径参数，可以匹配任意路径
        component: () => import("@/views/redirect/index.vue"),
      },
    ],
  },
  // 登录页路由
  {
    path: "/login",
    component: () => import("@/views/login"),
    hidden: true, // 在侧边栏中隐藏
  },
  // 注册页路由
  {
    path: "/register",
    component: () => import("@/views/register"),
    hidden: true,
  },
  // 404错误页路由 - 匹配所有未定义的路由
  {
    path: "/:pathMatch(.*)*",
    component: () => import("@/views/error/404"),
    hidden: true,
  },
  // 401未授权页面路由
  {
    path: "/401",
    component: () => import("@/views/error/401"),
    hidden: true,
  },
  // 首页路由配置
  {
    path: "",
    component: Layout,
    redirect: "/index", // 重定向到首页
    children: [
      {
        path: "/index",
        component: () => import("@/views/index"),
        name: "Index",
        meta: {
          title: "首页",
          icon: "dashboard",
          affix: true, // 标签栏中固定显示
        },
      },
    ],
  },
  // 用户个人中心路由
  {
    path: "/user",
    component: Layout,
    hidden: true,
    redirect: "noredirect",
    children: [
      {
        path: "profile",
        component: () => import("@/views/system/user/profile/index"),
        name: "Profile",
        meta: { title: "个人中心", icon: "user" },
      },
    ],
  },
  // 店铺详情路由
  {
    path: "/myStore/storefront",
    component: Layout,
    meta: { title: "店铺详情" },
    children: [
      {
        path: ":storeId", // 动态路由参数，用于不同店铺ID
        name: "StoreDetail",
        component: () => import("@/views/manage/storefront/index.vue"),
        props: true, // 将路由参数作为组件的 props
        meta: { title: "店铺详情", activeMenu: "/myStore/storefront" },
      },
      {
        path: "",
        name: "MyStore",
        component: () => import("@/views/manage/storefront/index.vue"),
        props: { storeId: null },
        meta: { title: "我的店铺", activeMenu: "/myStore/storefront" },
      },
    ],
  },
];

// 动态路由配置 - 基于用户权限动态加载的路由
export const dynamicRoutes = [
  // 用户授权路由
  {
    path: "/system/user-auth",
    component: Layout,
    hidden: true,
    permissions: ["system:user:edit"], // 需要的权限
    children: [
      {
        path: "role/:userId(\\d+)", // 正则表达式限制userId必须为数字
        component: () => import("@/views/system/user/authRole"),
        name: "AuthRole",
        meta: { title: "分配角色", activeMenu: "/system/user" },
      },
    ],
  },
  {
    path: "/system/role-auth",
    component: Layout,
    hidden: true,
    permissions: ["system:role:edit"],
    children: [
      {
        path: "user/:roleId(\\d+)",
        component: () => import("@/views/system/role/authUser"),
        name: "AuthUser",
        meta: { title: "分配用户", activeMenu: "/system/role" },
      },
    ],
  },
  {
    path: "/system/dict-data",
    component: Layout,
    hidden: true,
    permissions: ["system:dict:list"],
    children: [
      {
        path: "index/:dictId(\\d+)",
        component: () => import("@/views/system/dict/data"),
        name: "Data",
        meta: { title: "字典数据", activeMenu: "/system/dict" },
      },
    ],
  },
  {
    path: "/monitor/job-log",
    component: Layout,
    hidden: true,
    permissions: ["monitor:job:list"],
    children: [
      {
        path: "index/:jobId(\\d+)",
        component: () => import("@/views/monitor/job/log"),
        name: "JobLog",
        meta: { title: "调度日志", activeMenu: "/monitor/job" },
      },
    ],
  },
  {
    path: "/tool/gen-edit",
    component: Layout,
    hidden: true,
    permissions: ["tool:gen:edit"],
    children: [
      {
        path: "index/:tableId(\\d+)",
        component: () => import("@/views/tool/gen/editTable"),
        name: "GenEdit",
        meta: { title: "修改生成配置", activeMenu: "/tool/gen" },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  },
});

// 添加全局前置守卫
router.beforeEach((to, from, next) => {
  // 更新页面标题
  if (to.meta.title) {
    document.title = to.meta.title;
  }
  next();
});

export default router;
