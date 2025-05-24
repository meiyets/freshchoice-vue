<template>
  <div class="fresh-choice-home">
    <!-- 头部宣传区域 -->
    <section class="hero-section">
      <div class="hero-content">
        <h1>鲜果优选：新鲜直达，品质生活</h1>
        <p>
          我们致力于将最新鲜、最优质的水果从产地直接送到您的手中，让您享受健康美味的品质生活。
        </p>
        <div class="cta-buttons">
          <el-button type="primary" size="large" @click="goToShop"
            >立即选购</el-button
          >
        </div>
      </div>
    </section>

    <!-- 理念介绍区域 -->
    <section class="philosophy-section">
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="philosophy-item">
            <i class="el-icon-circle-check"></i>
            <h3>品质保证</h3>
            <p>严格筛选，确保每一颗水果都新鲜美味。</p>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="philosophy-item">
            <i class="el-icon-truck"></i>
            <h3>极速配送</h3>
            <p>高效物流，让新鲜不等待。</p>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="philosophy-item">
            <i class="el-icon-leaf"></i>
            <h3>健康生活</h3>
            <p>天然无添加，为您和家人带来健康。</p>
          </div>
        </el-col>
      </el-row>
    </section>

    <!-- 关于我们/技术优势区域 -->
    <section class="about-tech-section">
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="about-us">
            <h2>关于我们</h2>
            <p>
              鲜果优选是基于先进的电商技术构建的鲜果销售平台。我们利用
              SpringBoot 后端、Vue3 前端、Element Plus UI 组件库、Vite
              构建工具、Pinia 状态管理、Axios HTTP 客户端、MySQL 数据库、Redis
              缓存等技术，为您提供稳定、安全、高效的购物体验。
            </p>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="tech-advantage">
            <h2>技术优势</h2>
            <ul>
              <li>强大的后端支持，保障系统稳定运行。</li>
              <li>响应式前端设计，适应各种设备。</li>
              <li>高效的数据处理能力，快速响应您的需求。</li>
              <li>基于 RBAC 的权限管理，保障系统安全。</li>
              <li>集成 JWT 实现无状态认证。</li>
            </ul>
          </div>
        </el-col>
      </el-row>
    </section>

    <!-- 底部信息区域 -->
    <footer class="footer-section">
      <p>&copy; 2023 鲜果优选. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const goToShop = () => {
  // 假设您的商城页面路由是 '/shop'
  router.push("/main/browse/index");
};
</script>

<style scoped>
.fresh-choice-home {
  font-family: "Arial", sans-serif;
  color: #333;
  line-height: 1.6;
}

.hero-section {
  background: url("@/assets/images/hero-bg.jpg") no-repeat center center;
  background-size: cover;
  color: white;
  text-align: center;
  padding: 120px 20px;
  position: relative;
  overflow: hidden; /* 防止伪元素溢出 */
}

.hero-section::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6); /* 调整遮罩透明度 */
  z-index: 0; /* 确保遮罩在内容下方 */
}

.hero-content {
  position: relative;
  z-index: 1; /* 确保内容在遮罩上方 */
  max-width: 800px;
  margin: 0 auto;
}

.hero-content h1 {
  font-size: 3.5em;
  margin-bottom: 25px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); /* 添加文字阴影 */
}

.hero-content p {
  font-size: 1.6em;
  margin-bottom: 40px;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5); /* 添加文字阴影 */
}

.cta-buttons .el-button {
  margin: 0 15px;
  padding: 12px 30px;
  font-size: 1.1em;
  border-radius: 25px; /* 圆角按钮 */
}

.cta-buttons .el-button--primary {
  background-color: #4caf50; /* 主题绿色 */
  border-color: #4caf50;
}

.cta-buttons .el-button--primary:hover {
  background-color: #66bb6a;
  border-color: #66bb6a;
}

.philosophy-section {
  padding: 80px 20px;
  text-align: center;
  background-color: #e8f5e9; /* 淡绿色背景 */
}

.philosophy-item {
  padding: 20px;
  transition: transform 0.3s ease; /* 添加悬停动画 */
}

.philosophy-item:hover {
  transform: translateY(-10px); /* 悬停上移效果 */
}

.philosophy-item i {
  font-size: 4em;
  color: #388e3c; /* 深绿色图标 */
  margin-bottom: 20px;
}

.philosophy-item h3 {
  font-size: 1.8em;
  margin-bottom: 15px;
  color: #333;
}

.philosophy-item p {
  font-size: 1.1em;
  color: #555;
}

.about-tech-section {
  padding: 80px 20px;
  background-color: #fff;
}

.about-us,
.tech-advantage {
  padding: 20px;
}

.about-tech-section h2 {
  color: #388e3c; /* 深绿色标题 */
  margin-bottom: 30px;
  text-align: center;
}

.about-us p {
  font-size: 1.1em;
  line-height: 1.8;
  color: #555;
}

.tech-advantage ul {
  list-style: none;
  padding: 0;
}

.tech-advantage li {
  margin-bottom: 15px;
  padding-left: 25px;
  position: relative;
  font-size: 1.1em;
  color: #555;
}

.tech-advantage li::before {
  content: "•";
  color: #4caf50; /* 主题绿色 */
  font-weight: bold;
  position: absolute;
  left: 0;
}

.footer-section {
  background-color: #222; /* 更深的背景 */
  color: #ccc; /* 浅色文字 */
  text-align: center;
  padding: 30px 20px;
  font-size: 0.9em;
}
</style>
