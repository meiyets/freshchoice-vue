<template>
  <div class="app-container">
    <!-- 店铺申请表单 -->
    <el-form
      ref="applyFormRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
      class="apply-form"
    >
      <!-- 基本信息部分 -->
      <el-divider content-position="left">基本信息</el-divider>

      <el-form-item label="店铺名称" prop="storeName">
        <el-input
          v-model="formData.storeName"
          placeholder="请输入店铺名称"
          clearable
        />
      </el-form-item>

      <el-form-item label="店铺简介" prop="storeDesc">
        <el-input
          v-model="formData.storeDesc"
          type="textarea"
          placeholder="请输入店铺简介"
          :rows="3"
        />
      </el-form-item>

      <el-form-item label="联系电话" prop="contact">
        <el-input
          v-model="formData.contact"
          placeholder="请输入联系电话"
          clearable
        />
      </el-form-item>

      <el-form-item label="店铺Logo" prop="storeLogo">
        <el-upload
          class="avatar-uploader"
          :action="uploadUrl"
          :show-file-list="false"
          :on-success="handleLogoSuccess"
          :before-upload="beforeLogoUpload"
        >
          <img
            v-if="formData.storeLogo"
            :src="formData.storeLogo"
            class="avatar"
          />
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
      </el-form-item>

      <!-- 提交按钮 -->
      <el-form-item>
        <el-button type="primary" @click="submitForm">提交申请</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup name="StoreApply">
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import { Plus } from "@element-plus/icons-vue";

// 表单引用
const applyFormRef = ref();

// 表单数据
const formData = reactive({
  storeName: "",
  storeDesc: "",
  contact: "",
  storeLogo: "",
});

// 表单验证规则
const rules = {
  storeName: [
    { required: true, message: "请输入店铺名称", trigger: "blur" },
    { min: 2, max: 30, message: "长度在 2 到 30 个字符", trigger: "blur" },
  ],
  storeDesc: [
    { required: true, message: "请输入店铺简介", trigger: "blur" },
    { min: 10, max: 500, message: "长度在 10 到 500 个字符", trigger: "blur" },
  ],
  contact: [
    { required: true, message: "请输入联系电话", trigger: "blur" },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入正确的手机号码",
      trigger: "blur",
    },
  ],
  storeLogo: [{ required: true, message: "请上传店铺Logo", trigger: "change" }],
};

// 上传地址（需要替换为实际的上传接口地址）
const uploadUrl = import.meta.env.VITE_APP_BASE_API + "/common/upload";

// Logo上传成功回调
const handleLogoSuccess = (res, file) => {
  if (res.code === 200) {
    formData.storeLogo = res.url;
    ElMessage.success("上传成功");
  } else {
    ElMessage.error("上传失败");
  }
};

// Logo上传前的校验
const beforeLogoUpload = (file) => {
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isJpgOrPng) {
    ElMessage.error("Logo只能是JPG或PNG格式!");
    return false;
  }
  if (!isLt2M) {
    ElMessage.error("Logo大小不能超过2MB!");
    return false;
  }
  return true;
};

// 提交表单
const submitForm = () => {
  applyFormRef.value.validate((valid) => {
    if (valid) {
      // TODO: 调用后端接口提交店铺申请
      ElMessage.success("申请提交成功，请等待审核");
    }
  });
};

// 重置表单
const resetForm = () => {
  applyFormRef.value.resetFields();
  formData.storeLogo = "";
};
</script>

<style lang="scss" scoped>
.apply-form {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.avatar-uploader {
  :deep(.el-upload) {
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);

    &:hover {
      border-color: var(--el-color-primary);
    }
  }
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
  line-height: 178px;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
