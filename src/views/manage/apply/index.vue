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
      label-width="120px"
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
        <el-input
          type="textarea"
          v-model="formData.storeDesc"
          :rows="4"
          placeholder="请输入店铺描述"
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
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.description {
  color: #666;
  margin-top: 10px;
}

.apply-form {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>
