<template>
  <div class="apply-shop-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>申请开店</h2>
      <p class="description">
        欢迎加入Fresh Choice商家行列，请填写以下信息完成店铺申请
      </p>
    </div>

    <!-- 申请表单 -->
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="130px"
      class="apply-form"
    >
      <!-- 店铺名称 -->
      <el-form-item label="店铺名称" prop="storeName">
        <el-input v-model="formData.storeName" placeholder="请输入店铺名称" />
      </el-form-item>

      <!-- 店铺logo上传 -->
      <el-form-item label="店铺Logo" prop="storeLogo">
        <image-upload v-model="formData.storeLogo" :limit="1" />
      </el-form-item>

      <!-- 联系电话 -->
      <el-form-item label="联系电话" prop="contact">
        <el-input v-model="formData.contact" placeholder="请输入联系电话" />
      </el-form-item>

      <!-- 店铺描述（富文本） -->
      <el-form-item label="店铺描述" prop="storeDesc">
        <WangEditor 
          v-model="formData.storeDesc"
          height="400px"
          :showPreview="false"
        />
      </el-form-item>

      <!-- 提交按钮 -->
      <el-form-item>
        <el-button type="primary" @click="submitForm">提交申请</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { addStore } from "@/api/manage/store";
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import ImageUpload from "@/components/ImageUpload/index.vue";
import WangEditor from "@/myComponents/WangEditor/index.vue"; // 新增导入

// 表单数据
const formData = reactive({
  storeName: "",
  storeLogo: "",
  contact: "",
  storeDesc: "",
});

// 表单验证规则
const rules = {
  // 店铺名称必填
  storeName: [{ required: true, message: "请输入店铺名称", trigger: "blur" }],
  // 店铺logo必填
  storeLogo: [{ required: true, message: "请上传店铺logo", trigger: "change" }],
  // 店铺名称必填
  contact: [
    { required: true, message: "请输入联系电话", trigger: "blur" },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入正确的手机号码",
      trigger: "blur",
    },
  ],
  //店铺名称必填
  storeDesc: [{ required: true, message: "请输入店铺描述", trigger: "blur" }],
};

// 表单引用
const formRef = ref(null);

// 提交表单
const submitForm = async () => {
  // 表单值不为空
  if (!formRef.value) return;
  // 表单验证
  await formRef.value.validate((valid) => {
    if (valid) {
      addStore(formData).then((res) => {
        if (res.code === 200) {
          // 提示成功
          ElMessage.success("店铺申请成功");
          // TODO：清空表单并且进入"我的店铺路由"
          // formRef.value.resetFields();
        } else {
          // 提示失败
          ElMessage.error(res.msg || "店铺申请失败");
        }
      });
    }
  });
};
</script>

<style scoped>
.apply-shop-container {
  max-width: 1000px;  /* 扩大容器宽度 */
  margin: 30px auto;
  padding: 40px;
  background: #f8fafc;
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 30px;
  background: linear-gradient(135deg, #f6f7f9 0%, #ffffff 100%);
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.description {
  color: #64748b;
  margin-top: 15px;
  font-size: 16px;
}

.apply-form {
  background: #fff;
  padding: 40px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);  /* 加深阴影浓度 */
}

.apply-form:hover {
  transform: translateY(-3px);  /* 增大悬停位移 */
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);  /* 增强悬停阴影 */
}

/* 表单项间距优化 */
.el-form-item {
  margin-bottom: 28px;
}

/* 输入框聚焦效果 */
:deep(.el-input__wrapper) {
  transition: all 0.3s ease;
  box-shadow: 0 0 0 1px #e2e8f0;
}

:deep(.el-input__wrapper:hover),
:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px #6366f1;
}

/* 按钮美化 */
.el-button--primary {
  background-color: #6366f1;
  border: none;
  padding: 12px 28px;
  transition: all 0.3s ease;
}

.el-button--primary:hover {
  background-color: #4f46e5;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.3);
}

/* 必填项标识 */
.el-form-item.is-required:not(.is-no-asterisk) > .el-form-item__label::before {
  color: #ef4444;
  margin-right: 4px;
}


/* 新增页面标题动画 */
.page-header {
  animation: titleFadeIn 0.6s ease;
}

@keyframes titleFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 表单容器悬停动画 */
.apply-form {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.apply-form:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.08);
}

/* 按钮点击动画 */
.el-button--primary:active {
  transform: scale(0.98);
}

/* 输入框标签美化 */
:deep(.el-form-item__label) {
  font-weight: 500;
  color: #475569;
  transition: color 0.3s ease;
}

:deep(.el-form-item__label:hover) {
  color: #6366f1;
}

/* 图片上传区域特效 */
:deep(.upload-container) {
  border: 2px dashed #cbd5e1;
  transition: all 0.3s ease;
}

:deep(.upload-container:hover) {
  border-color: #818cf8;
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.1);
}

/* 全局过渡效果 */
* {
  transition: all 0.3s ease;
}

</style>
