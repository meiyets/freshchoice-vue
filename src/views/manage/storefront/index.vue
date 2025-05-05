<template>
  <div class="store-detail-container">
    <!-- 头部信息 -->
    <el-row :gutter="20" class="header">
      <el-col :span="16">
        <el-card class="store-basic">
          <div class="logo-section">
            <el-image :src="storeData.storeLogo" class="store-logo" />
            <div class="title-section">
              <h1>{{ storeData.storeName }}</h1>
              <div class="store-code">店铺编号：{{ storeData.storeCode }}</div>
            </div>
          </div>

          <!-- 核心信息 -->
          <div class="core-info">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="联系电话">{{
                storeData.contact
              }}</el-descriptions-item>
              <el-descriptions-item label="创建时间">{{
                storeData.createTime
              }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </el-col>

      <!-- 状态面板 -->
      <el-col :span="8">
        <el-card class="status-panel">
          <!-- 状态卡片组 -->
          <div class="status-cards">
            <el-row :gutter="12">
              <el-col :span="24">
                <div
                  class="status-card"
                  :class="'status-' + storeData.storeStatus"
                >
                  <!-- 保留状态卡片内的图标按钮 -->
                  <el-popover 
                    placement="top"
                    trigger="click"
                    :width="280"
                    v-show="storeData.auditComment !== undefined"
                    class="audit-badge"
                  >
                    <template #reference>
                      <el-button
                        class="audit-icon-btn"
                        :class="{
                          'active-status': [1,2].includes(storeData.storeStatus),
                          'disabled-status': !storeData.auditComment
                        }"
                        :disabled="!storeData.auditComment"
                        type="warning"
                        plain
                        circle
                      >
                        <el-icon><Warning /></el-icon>
                      </el-button>
                    </template>
                    <div class="audit-popover">
                      <h4>审核备注</h4>
                      <div class="audit-content">{{ storeData.auditComment }}</div>
                    </div>
                  </el-popover>
                  
                  <el-icon class="status-icon">
                    <component :is="statusConfig.icon"/>
                  </el-icon>
                  <div class="status-content">
                    <h3>{{ statusConfig.title }}</h3>
                    <p>{{ statusConfig.description }}</p>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>

          <!-- 状态进度条 -->
          <el-steps
            :active="statusStep"
            finish-status="success"
            simple
            class="status-steps"
          >
            <el-step title="申请提交" icon="DocumentChecked" />
            <el-step title="审核通过" icon="CircleCheck" />
            <el-step title="正式运营" icon="Shop" />
          </el-steps>



          <!-- 状态操作 -->
          <div class="status-actions" v-if="showStatusToggle">
            <el-button
              :type="storeData.storeStatus === 1 ? 'success' : 'danger'"
              @click="toggleStoreStatus"
              round
            >
              {{ storeData.storeStatus === 1 ? "暂停营业" : "恢复营业" }}
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 店铺描述 -->
    <el-card class="description-section">
      <h3 class="section-title">店铺介绍</h3>
      <div class="wang-editor-content" v-html="storeData.storeDesc"></div>
    </el-card>


  </div>
</template>

<script setup>
// 导入Element Plus组件
import {
  CircleCheck,
  Shop,
  SwitchButton,
  Clock, // 新增导入
  Warning, // 新增导入
  Close, // 新增导入
} from "@element-plus/icons-vue";
// 导入请求API
import { getStore } from "@/api/manage/store";
// 导入Element Plus消息提示
import { ElMessage } from "element-plus";

// 店铺数据响应式对象
const storeData = ref({
  storeName: "", // 初始化关键字段
  storeCode: "",
  contact: "",
  storeStatus: 0,
  storeDesc: "",
  auditComment: "",
  createTime: "",
});

// 计算当前状态步骤
const statusStep = computed(() => {
  return Math.min(storeData.value.storeStatus + 1, 3); // 简化逻辑
});

// 显示状态切换的条件（营业中/停业中）
const showStatusToggle = computed(() => {
  return [1, 2].includes(storeData.value.storeStatus);
});

// 状态切换处理
const toggleStoreStatus = () => {
  storeData.value.storeStatus = storeData.value.storeStatus === 1 ? 2 : 1;
};

// 新增状态配置映射
const statusConfig = computed(() => {
  const configMap = {
    0: {
      icon: "Clock",
      title: "审核中",
      color: "#e6a23c",
      description: "您的店铺正在等待管理员审核",
    },
    1: {
      icon: "CircleCheck",
      title: "营业中",
      color: "#67c23a",
      description: "店铺正在正常运营",
    },
    2: {
      icon: "SwitchButton",
      title: "已停业",
      color: "#909399",
      description: "店铺已主动暂停营业",
    },
    3: {
      icon: "Warning",
      title: "已封禁",
      color: "#f56c6c",
      description: "店铺因违规行为被封禁",
    },
    4: {
      icon: "Close",
      title: "已注销",
      color: "#999",
      description: "店铺已永久关闭",
    },
  };
  return configMap[storeData.value.storeStatus] || {};
});

// 编辑处理
const handleEdit = () => {
  // 后续实现编辑逻辑
};

// 页面加载时获取店铺信息
// 根据店铺ID获取店铺信息
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

function getStoreInfo() {
  // 从路由参数获取storeId（移除调试用的默认值）
  let storeId = route.params.storeId;
  if (!storeId) {
    // 如果为空，传递一个不存在的id：0，作为标记，查看自己的店铺
    storeId = 0;
  }

  getStore(storeId)
    .then((response) => {
      storeData.value = response.data;
      // 确保数据结构正确
      console.log("店铺数据:", response.data);

      // 添加空值保护
      const pageTitle = storeData.value.storeName
        ? `${storeData.value.storeName} - 店铺详情`
        : "店铺详情";
      document.title = pageTitle;

      // 使用路由元信息更新（需配合路由守卫）
      const newRoute = { ...route, meta: { ...route.meta, title: pageTitle } };
      router.replace(newRoute);
    })
    .catch((error) => {
      console.error("获取店铺信息失败:", error);
      ElMessage.error("店铺信息加载失败");
    });
}

getStoreInfo();
</script>

<style scoped lang="scss">
.store-detail-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.store-basic {
  margin-bottom: 20px;
}

/* 统一卡片内边距 */
.store-basic .el-card__body,
.status-panel .el-card__body {
  padding: 20px;
}

.logo-section {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.store-logo {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  margin-right: 20px;
}

.title-section h1 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.store-code {
  color: #909399;
  margin-top: 8px;
}

.status-panel {
  height: 100%;
}

.status-actions {
  margin-top: 20px;
  text-align: center;
}

.section-title {
  color: #606266;
  border-left: 4px solid #409eff;
  padding-left: 10px;
  margin: 0 0 15px;
}

.audit-section {
  margin-top: 20px;
  background-color: #f8f9fa;
}

.audit-content {
  color: #e6a23c;
  line-height: 1.6;
}

/* 富文本内容样式 */
.wang-editor-content {
  /* 新增容器尺寸控制 */
  max-width: 100%;
  overflow: visible; /* 确保不裁剪内容 */
}

/* 修改图片样式定义 (合并重复样式) */
.wang-editor-content :deep(img) {
  max-width: min(100%, 600px) !important;
  height: auto !important;
  display: block;
  margin: 10px auto;
  object-fit: contain;
  border-radius: 4px; /* 保留特色样式 */
  background: #fff; /* 新增背景色 */
  padding: 4px;
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}


/* 状态卡片 */
.status-card {
  position: relative;  // 新增定位上下文
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 8px;
  background: var(--el-bg-color);
  transition: all 0.3s ease;
}

.status-icon {
  font-size: 32px;
  margin-right: 15px;
  flex-shrink: 0;
}

.status-content h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
}

.status-content p {
  margin: 0;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

/* 不同状态配色 */
.status-0 {
  border-left: 4px solid #e6a23c;
}
.status-1 {
  border-left: 4px solid #67c23a;
}
.status-2 {
  border-left: 4px solid #909399;
}
.status-3 {
  border-left: 4px solid #f56c6c;
}
.status-4 {
  border-left: 4px solid #999;
}

/* 步骤条样式 */
.status-steps {
  margin: 20px 0;
  :deep(.el-step__title) {
    font-size: 14px;
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .status-card {
    padding: 15px;
  }

  .status-icon {
    font-size: 24px;
  }
}
</style>

<style scoped lang="scss">
// 新增审核备注样式
.audit-reminder {
  margin-top: 15px;
  text-align: center;

  .audit-tag {
    cursor: pointer;
    padding: 8px 12px;
    transition: all 0.3s;

    .el-icon {
      margin-right: 6px;
      font-size: 16px;
    }

    &:hover {
      opacity: 0.9;
    }
  }
}

.audit-popover-content {
  line-height: 1.6;
  font-size: 14px;
  color: #606266;
}

// 删除原悬浮按钮样式
.audit-container {
  position: fixed;
  right: 40px;
  bottom: 40px;
  z-index: 2000;

  .audit-badge {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);

    :deep(.el-icon) {
      font-size: 18px;
    }
  }
}

.audit-popover {
  h4 {
    color: #e6a23c;
    margin: 0 0 12px 0;
    font-size: 15px;
  }

  .audit-content {
    line-height: 1.6;
    font-size: 13px;
    color: #606266;
  }
}

// 响应式调整
@media (max-width: 768px) {
  .audit-container {
    right: 15px;
    bottom: 20px;
  }
}

// 状态颜色变量
$status-active-color: #67c23a;
$status-inactive-color: #e6a23c;
$disabled-color: #c0c4cc;

.audit-icon-btn {
  // 新增状态样式
  &.active-status {
    background-color: rgba($status-active-color, 0.1);
    border-color: $status-active-color;
    
    .el-icon {
      color: $status-active-color;
    }
  }
  
  &.disabled-status {
    background-color: $disabled-color !important;
    border-color: $disabled-color !important;
    cursor: not-allowed;
    opacity: 0.6;
    
    .el-icon {
      color: #fff;
    }
  }

  // 基础样式保持原状
  position: absolute;
  right: 15px;
  top: 15px;
  padding: 6px;
  z-index: 1;
  
  :deep(.el-icon) {
    font-size: 16px;
  }
}
</style>
