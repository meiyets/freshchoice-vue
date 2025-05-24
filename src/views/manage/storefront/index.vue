<template>
  <div class="store-detail-container">
    <!-- 头部信息 -->
    <el-row :gutter="20" class="header">
      <el-col :span="16">
        <el-card class="store-basic">
          <div class="logo-section">
            <el-image :src="storeData.storeLogo" class="store-logo" />
            <div class="title-section">
              <div class="title-wrapper">
                <h1>{{ storeData.storeName }}</h1>
                <!-- 将编辑按钮移到这里 -->
                <el-button
                  type="primary"
                  icon="Edit"
                  class="edit-button"
                  @click="handleEdit"
                  >编辑店铺</el-button
                >
              </div>
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
                  <!-- 审核备注弹出框 -->
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
                          'active-status': [1, 2].includes(
                            storeData.storeStatus
                          ),
                          'disabled-status': !storeData.auditComment,
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
                      <div class="audit-content">
                        {{ storeData.auditComment }}
                      </div>
                    </div>
                  </el-popover>

                  <!-- 新增申请标记按钮 -->
                  <el-tooltip
                    content="点击此处提交审核"
                    placement="top"
                    :disabled="storeData.auditFlag === 1"
                    :manual="true"
                    v-model:visible="showTooltip"
                    trigger="manual"
                  >
                    <el-button
                      v-if="showAuditFlag"
                      class="audit-flag-btn"
                      :class="{ 'is-pending': storeData.auditFlag }"
                      :disabled="storeData.auditFlag"
                      @click="handleAuditFlag"
                      type="primary"
                      circle
                    >
                      <el-icon
                        ><component
                          :is="storeData.auditFlag ? 'Clock' : 'Select'"
                      /></el-icon>
                    </el-button>
                  </el-tooltip>

                  <el-icon class="status-icon">
                    <component :is="statusConfig.icon" />
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
          <!-- 状态进度条 -->
          <div class="status-flow">
            <el-steps
              :active="statusStep"
              :status="stepStatus"
              simple
              class="status-steps"
            >
              <el-step
                title="申请提交"
                icon="DocumentChecked"
                :status="getStepStatus(1)"
              >
                <template #description>
                  <span
                    v-if="storeData.storeStatus === 0 && !storeData.auditFlag"
                    >等待提交</span
                  >
                  <span v-else-if="storeData.auditFlag === 1">审核中</span>
                </template>
              </el-step>
              <el-step
                title="审核通过"
                icon="CircleCheck"
                :status="getStepStatus(2)"
              >
                <template #description>
                  <span
                    v-if="[3, 4].includes(storeData.storeStatus)"
                    class="error-status"
                  >
                    {{ storeData.storeStatus === 3 ? "已封禁" : "已注销" }}
                  </span>
                </template>
              </el-step>
              <el-step title="正式运营" icon="Shop" :status="getStepStatus(3)">
                <template #description>
                  <span v-if="storeData.storeStatus === 1">营业中</span>
                  <span v-else-if="storeData.storeStatus === 2">已停业</span>
                </template>
              </el-step>
            </el-steps>
          </div>

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
    <!-- 添加编辑对话框 -->
    <el-dialog
      :title="'编辑店铺'"
      v-model="editDialogVisible"
      width="1200px"
      append-to-body
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="rules"
        label-width="130px"
        class="edit-form"
      >
        <!-- 店铺名称 -->
        <el-form-item label="店铺名称" prop="storeName">
          <el-input v-model="editForm.storeName" placeholder="请输入店铺名称" />
        </el-form-item>

        <!-- 店铺logo上传 -->
        <el-form-item label="店铺Logo" prop="storeLogo">
          <image-upload v-model="editForm.storeLogo" :limit="1" />
        </el-form-item>

        <!-- 联系电话 -->
        <el-form-item label="联系电话" prop="contact">
          <el-input v-model="editForm.contact" placeholder="请输入联系电话" />
        </el-form-item>

        <!-- 店铺描述（富文本） -->
        <el-form-item label="店铺描述" prop="storeDesc">
          <WangEditor
            v-model="editForm.storeDesc"
            height="400px"
            :showPreview="false"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitEditForm">确 定</el-button>
          <el-button @click="editDialogVisible = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
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
import { getStore, updateStore } from "@/api/manage/store";
// 导入Element Plus消息提示
import { ElMessage } from "element-plus";
import WangEditor from "@/myComponents/WangEditor/index.vue";
import ImageUpload from "@/components/ImageUpload/index.vue";
import { Edit } from "@element-plus/icons-vue";

// 店铺数据响应式对象
const storeData = ref({
  storeName: "", // 初始化关键字段
  storeCode: "",
  contact: "",
  storeStatus: 0,
  storeDesc: "",
  auditComment: "",
  createTime: "",
  auditFlag: 0,
});

// 编辑对话框显示状态
const editDialogVisible = ref(false);
// 编辑表单引用
const editFormRef = ref(null);
// 编辑表单数据
const editForm = reactive({
  storeName: "",
  storeLogo: "",
  contact: "",
  storeDesc: "",
});

// 表单验证规则
const rules = {
  storeName: [{ required: true, message: "请输入店铺名称", trigger: "blur" }],
  storeLogo: [{ required: true, message: "请上传店铺logo", trigger: "change" }],
  contact: [
    { required: true, message: "请输入联系电话", trigger: "blur" },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入正确的手机号码",
      trigger: "blur",
    },
  ],
  storeDesc: [{ required: true, message: "请输入店铺描述", trigger: "blur" }],
};

// 处理编辑按钮点击
const handleEdit = () => {
  editForm.storeName = storeData.value.storeName;
  editForm.storeLogo = storeData.value.storeLogo;
  editForm.contact = storeData.value.contact;
  editForm.storeDesc = storeData.value.storeDesc;
  editDialogVisible.value = true;
};

// 提交编辑表单
const submitEditForm = async () => {
  if (!editFormRef.value) return;

  await editFormRef.value.validate((valid) => {
    if (valid) {
      updateStore({
        storeId: storeData.value.storeId,
        ...editForm,
      }).then((res) => {
        if (res.code === 200) {
          ElMessage.success("店铺信息更新成功");
          editDialogVisible.value = false;
          // 刷新店铺数据
          getStore(storeData.value.storeId).then((res) => {
            storeData.value = res.data;
          });
        } else {
          ElMessage.error(res.msg || "店铺信息更新失败");
        }
      });
    }
  });
};
const getStepStatus = (step) => {
  const status = storeData.value.storeStatus;

  // 如果是封禁或注销状态
  if ([3, 4].includes(status)) {
    if (step === 1) return "finish";
    if (step === 2) return "error";
    if (step === 3) return "wait";
    return "wait";
  }

  // 如果是正常状态
  if (step < statusStep.value) return "finish";
  if (step === statusStep.value) return processStatus.value;
  return "wait";
};

// 进度条状态
const processStatus = computed(() => {
  // 异常状态显示为警告
  if ([3, 4].includes(storeData.value.storeStatus)) {
    return "error";
  }
  // 审核中状态
  if (storeData.value.auditFlag === 1) {
    return "wait";
  }
  return "process";
});

// 计算当前状态步骤
const statusStep = computed(() => {
  const status = storeData.value.storeStatus;
  // 如果是封禁或注销状态，停在第二步
  if ([3, 4].includes(status)) {
    return 2;
  }
  // 如果是正常营业或停业状态，显示为第三步
  if ([1, 2].includes(status)) {
    return 3;
  }
  // 如果是待审核状态，显示为第一步
  return 1;
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
  // 如果是异常状态且有审核标记，优先显示审核中状态
  if (
    ![1, 2].includes(storeData.value.storeStatus) &&
    storeData.value.auditFlag === 1
  ) {
    return {
      icon: "Clock",
      title: "审核中",
      color: "#e6a23c",
      description: "您的店铺正在等待管理员审核",
    };
  }

  const configMap = {
    0: {
      icon: "Clock",
      title: "待审核",
      color: "#e6a23c",
      description: "正在等待提交审核",
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

// 显示申请标记按钮的条件
const showAuditFlag = computed(() => {
  return ![1, 2].includes(storeData.value.storeStatus);
});

// 处理申请标记
const handleAuditFlag = async () => {
  if (storeData.value.auditFlag) {
    ElMessage.warning("已提交申请，请等待审核");
    return;
  }

  try {
    await updateStore({
      storeId: storeData.value.storeId,
      auditFlag: 1,
    });
    storeData.value.auditFlag = 1;
    ElMessage.success("申请提交成功");

    // 清除定时器
    if (tooltipTimer) {
      clearInterval(tooltipTimer);
      tooltipTimer = null;
    }
  } catch (error) {
    console.error("申请提交失败:", error);
    ElMessage.error("申请提交失败");
  }
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
      ElMessage.error("店铺信息加载失败，请先申请店铺");
      router.push("/main/apply");
    });
}

// 添加tooltip显示状态控制
const showTooltip = ref(false);

// 添加tooltip定时器变量
let tooltipTimer = null;

// 在组件挂载后启动定时器
onMounted(() => {
  // 只有在非营业/停业状态且未提交审核时才显示提示
  if (!storeData.value.auditFlag && ![1, 2].includes(storeData.value.storeStatus)) {
    startTooltipTimer();
  }
});

// 在组件卸载前清理定时器
onUnmounted(() => {
  if (tooltipTimer) {
    clearInterval(tooltipTimer);
  }
});

// 启动tooltip定时器
const startTooltipTimer = () => {
  tooltipTimer = setInterval(() => {
    showTooltip.value = true;
    setTimeout(() => {
      showTooltip.value = false;
    }, 2000); // 显示2秒后隐藏
  }, 5000); // 每5秒显示一次
};
// 监听店铺状态和审核标记的变化
watch(
  [
    () => storeData.value.storeStatus,
    () => storeData.value.auditFlag
  ],
  ([newStatus, newAuditFlag]) => {
    // 清理现有定时器
    if (tooltipTimer) {
      clearInterval(tooltipTimer);
      tooltipTimer = null;
    }
    
    // 只有在非营业/停业状态且未提交审核时才启动定时器
    if (!newAuditFlag && ![1, 2].includes(newStatus)) {
      startTooltipTimer();
    }
  }
);
getStoreInfo();
// 使用 defineOptions 显式设置组件名称，与路由 name 匹配
defineOptions({
  name: 'MyStore'
});
</script>

<style scoped lang="scss">
.status-flow {
  margin: 20px 0;

  :deep(.el-step) {
    .el-step__description {
      font-size: 12px;
      color: var(--el-text-color-secondary);

      .error-status {
        color: var(--el-color-danger);
        font-weight: bold;
      }

      &.is-error {
        color: var(--el-color-danger);
      }

      &.is-wait {
        color: var(--el-color-warning);
      }
    }

    &.is-error {
      .el-step__title,
      .el-step__icon {
        color: var(--el-color-danger) !important;
      }

      .el-step__line {
        background-color: var(--el-color-danger);
      }
    }

    &.is-wait {
      .el-step__title,
      .el-step__icon {
        color: var(--el-color-warning);
      }
    }
  }
}
.audit-flag-btn {
  position: absolute;
  right: 60px; // 位于审核备注按钮左侧
  top: 15px;
  z-index: 1;
  transition: all 0.3s ease;

  &.is-pending {
    background-color: var(--el-color-warning);
    border-color: var(--el-color-warning);

    &:hover {
      background-color: var(--el-color-warning);
      border-color: var(--el-color-warning);
      opacity: 0.8;
    }

    :deep(.el-icon) {
      animation: rotating 2s linear infinite;
    }
  }
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
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

.title-section {
  flex: 1;
  min-width: 0; /* 防止flex子项溢出 */

  h1 {
    margin: 0;
    font-size: 24px;
    color: #303133;
    word-break: break-all; /* 允许标题在必要时换行 */
  }
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
  position: relative; // 新增定位上下文
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

/* 标题包装器样式 */
.title-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;

  h1 {
    margin: 0;
  }
}

/* 编辑按钮样式 */
.edit-button {
  padding: 6px 12px;
  height: 32px;
}

.edit-form {
  width: 100%;
  margin: 0;
}

/* 编辑对话框中的表单项间距 */
:deep(.el-form-item) {
  margin-bottom: 22px;
}
</style>
