<template>
  <div class="address-book-container" v-loading="loading">
    <!-- 页面头部：标题和新增按钮 -->
    <div class="page-header">
      <h2>我的地址簿</h2>
      <el-button type="primary" @click="handleAddAddress">
        <el-icon><plus /></el-icon> 新增地址
      </el-button>
    </div>

    <!-- 新增/编辑地址表单 -->
    <transition name="address-form">
      <div v-if="showAddressForm" class="address-form-section">
        <h3>{{ addressForm.addressId ? "编辑地址" : "新增地址" }}</h3>
        <el-form
          :model="addressForm"
          :rules="addressRules"
          ref="addressFormRef"
          label-width="100px"
          class="address-form"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="收货人" prop="consignee">
                <el-input
                  v-model="addressForm.consignee"
                  placeholder="请输入收货人姓名"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系电话" prop="contact">
                <el-input
                  v-model="addressForm.contact"
                  placeholder="请输入联系电话"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="性别" prop="gender">
            <el-radio-group v-model="addressForm.gender">
              <el-radio :label="0">先生</el-radio>
              <el-radio :label="1">女士</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="省份" prop="province">
                <el-input
                  v-model="addressForm.province"
                  placeholder="请输入省份"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="城市" prop="city">
                <el-input v-model="addressForm.city" placeholder="请输入城市" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="区县" prop="district">
                <el-input
                  v-model="addressForm.district"
                  placeholder="请输入区县"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="详细地址" prop="detailAddress">
            <el-input
              v-model="addressForm.detailAddress"
              type="textarea"
              :rows="3"
              placeholder="请输入详细地址"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitAddressForm"
              >保存</el-button
            >
            <el-button @click="cancelAddressForm">取消</el-button>
          </el-form-item>
        </el-form>
      </div>
    </transition>

    <!-- 地址列表 -->
    <div class="address-list-section" v-loading="addressLoading">
      <el-empty
        description="暂无收货地址，快去添加一个吧！"
        v-if="!addressList.length && !showAddressForm"
        :image-size="150"
      >
        <el-button type="primary" @click="handleAddAddress">立即添加</el-button>
      </el-empty>

      <div v-else-if="addressList.length > 0" class="address-list">
        <div
          v-for="address in filteredAddressList"
          :key="address.addressId"
          class="address-item"
          :class="{ 'default-address': address.isDefault === 1 }"
        >
          <div class="address-details">
            <div class="address-line-1">
              <span class="consignee">{{ address.consignee }}</span>
              <span class="contact">{{ address.contact }}</span>
              <el-tag size="small" type="success" v-if="address.isDefault === 1"
                >默认</el-tag
              >
            </div>
            <div class="address-line-2">
              {{ address.province }} {{ address.city }} {{ address.district }}
            </div>
            <div class="address-line-3">{{ address.detailAddress }}</div>
          </div>
          <div class="address-actions">
            <el-button type="primary" link @click="editAddress(address)">
              <el-icon><edit /></el-icon> 编辑
            </el-button>
            <el-button
              type="danger"
              link
              @click="removeAddress(address.addressId)"
              :disabled="address.isDefault === 1"
            >
              <el-icon><delete /></el-icon> 删除
            </el-button>
            <el-button
              type="success"
              link
              @click="setDefault(address.addressId)"
              v-if="address.isDefault !== 1"
            >
              设为默认
            </el-button>
          </div>
        </div>

        <!-- 展开/收起按钮 -->
        <div class="expand-button-container" v-if="addressList.length > 1">
          <el-button type="primary" link @click="toggleAddressExpand">
            {{ isExpanded ? "收起部分地址" : "展开全部地址" }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Edit, Delete } from "@element-plus/icons-vue";
import useUserStore from "@/store/modules/user";
import {
  listAddressByUserId,
  addAddress,
  updateAddress,
  changeDefaultAddress,
  delAddress,
} from "@/api/manage/address";

// 用户状态管理
const userStore = useUserStore();
const userId = computed(() => userStore.id);

// 加载状态
const loading = ref(false); // 页面整体加载，暂未使用，可按需启用
const addressLoading = ref(false);

// 地址列表数据
const addressList = ref([]);
// 是否展开全部地址
const isExpanded = ref(false);

// 地址表单相关
const showAddressForm = ref(false);
const addressFormRef = ref(null);
const addressForm = reactive({
  addressId: null,
  consignee: "",
  contact: "",
  gender: 0, // 0先生 1女士
  province: "",
  city: "",
  district: "",
  detailAddress: "",
  isDefault: 0, // 默认为非默认地址
  userId: null,
});

// 表单校验规则
const addressRules = reactive({
  consignee: [{ required: true, message: "请输入收货人姓名", trigger: "blur" }],
  contact: [
    { required: true, message: "请输入联系电话", trigger: "blur" },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入正确的手机号码",
      trigger: "blur",
    },
  ],
  province: [{ required: true, message: "请输入省份", trigger: "blur" }],
  city: [{ required: true, message: "请输入城市", trigger: "blur" }],
  district: [{ required: true, message: "请输入区县", trigger: "blur" }],
  detailAddress: [
    { required: true, message: "请输入详细地址", trigger: "blur" },
  ],
});

// 计算属性：筛选显示的地址列表
// 根据 design.md: "默认仅显示默认地址，点击后可展开地址列表"
const filteredAddressList = computed(() => {
  if (!addressList.value) return [];
  if (isExpanded.value) {
    return addressList.value; // 展开时显示全部
  }
  // 收起时，优先显示默认地址
  const defaultAddress = addressList.value.find((addr) => addr.isDefault === 1);
  if (defaultAddress) {
    return [defaultAddress];
  }
  // 如果没有默认地址，且列表不为空，显示第一个
  if (addressList.value.length > 0) {
    return [addressList.value[0]];
  }
  return []; // 其他情况（如列表为空）返回空数组，由el-empty处理
});

// 加载地址列表
const loadAddressList = async () => {
  if (!userId.value) {
    ElMessage.warning("用户未登录，无法加载地址信息");
    return;
  }
  addressLoading.value = true;
  try {
    const res = await listAddressByUserId(userId.value);
    if (res.code === 200) {
      addressList.value = res.rows || [];
      // 初始时，如果只有一个地址，则默认展开
      if (addressList.value.length <= 1) {
        isExpanded.value = true;
      }
    } else {
      ElMessage.error(res.msg || "地址加载失败");
      addressList.value = []; // 加载失败则清空
    }
  } catch (e) {
    console.error("地址加载失败:", e);
    ElMessage.error("地址加载失败，请稍后再试");
    addressList.value = []; // 异常时清空
  } finally {
    addressLoading.value = false;
  }
};

// 处理新增地址按钮点击
const handleAddAddress = () => {
  // 重置表单
  if (addressFormRef.value) {
    addressFormRef.value.resetFields();
  }
  Object.assign(addressForm, {
    addressId: null,
    consignee: "",
    contact: "",
    gender: 0,
    province: "",
    city: "",
    district: "",
    detailAddress: "",
    isDefault: addressList.value.length === 0 ? 1 : 0, // 如果是第一个地址，则默认为默认地址
    userId: userId.value,
  });
  showAddressForm.value = true;
};

// 提交地址表单（新增/编辑）
const submitAddressForm = async () => {
  if (!addressFormRef.value) return;
  await addressFormRef.value.validate(async (valid) => {
    if (valid) {
      addressLoading.value = true;
      try {
        addressForm.userId = userId.value; // 确保userId已设置
        let res;
        const params = { ...addressForm };

        if (params.addressId) {
          // 编辑地址
          res = await updateAddress(params);
        } else {
          // 新增地址
          res = await addAddress(params);
        }

        if (res.code === 200) {
          ElMessage.success(params.addressId ? "修改成功" : "新增成功");
          showAddressForm.value = false;
          await loadAddressList(); // 重新加载列表
        } else {
          ElMessage.error(
            res.msg || (params.addressId ? "修改失败" : "新增失败")
          );
        }
      } catch (e) {
        console.error("保存地址失败:", e);
        ElMessage.error("操作失败，请稍后再试");
      } finally {
        addressLoading.value = false;
      }
    }
  });
};

// 取消地址表单
const cancelAddressForm = () => {
  showAddressForm.value = false;
  if (addressFormRef.value) {
    addressFormRef.value.clearValidate(); // 清除校验状态
  }
};

// 编辑地址
const editAddress = (address) => {
  // 深拷贝一份数据到表单，防止意外修改列表中的原始数据
  Object.assign(addressForm, JSON.parse(JSON.stringify(address)));
  showAddressForm.value = true;
};

// 删除地址
const removeAddress = async (addressId) => {
  try {
    await ElMessageBox.confirm("确定要删除该地址吗？此操作不可撤销。", "警告", {
      confirmButtonText: "确定删除",
      cancelButtonText: "取消",
      type: "warning",
    });
    addressLoading.value = true;
    const res = await delAddress(addressId);
    if (res.code === 200) {
      ElMessage.success("删除地址成功");
      await loadAddressList(); // 重新加载列表
    } else {
      ElMessage.error(res.msg || "删除地址失败");
    }
  } catch (e) {
    if (e !== "cancel") {
      console.error("删除地址失败:", e);
      ElMessage.error("操作失败，请稍后再试");
    }
  } finally {
    addressLoading.value = false;
  }
};

// 设置为默认地址
const setDefault = async (addressId) => {
  addressLoading.value = true;
  try {
    const res = await changeDefaultAddress(addressId);
    if (res.code === 200) {
      ElMessage.success("设置默认地址成功");
      await loadAddressList(); // 重新加载列表以更新默认状态
    } else {
      ElMessage.error(res.msg || "设置默认地址失败");
    }
  } catch (e) {
    console.error("设置默认地址失败:", e);
    ElMessage.error("操作失败，请稍后再试");
  } finally {
    addressLoading.value = false;
  }
};

// 切换地址列表展开/收起状态
const toggleAddressExpand = () => {
  isExpanded.value = !isExpanded.value;
};

// 组件挂载时加载地址列表
onMounted(() => {
  loadAddressList();
});
</script>

<style scoped>
.address-book-container {
  padding: 24px;
  background-color: #f4f6f8; /* 更现代的浅灰色背景 */
  min-height: calc(100vh - 80px);
  font-family: "Inter", "Helvetica Neue", Helvetica, "PingFang SC",
    "Hiragino Sans GB", "Microsoft YaHei", "\5FAE\8F6F\96C5\9ED1", Arial,
    sans-serif; /* 引入 Inter 字体 */
  box-sizing: border-box;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px; /* 增加底部间距 */
  padding-bottom: 24px;
  border-bottom: 1px solid #dee2e6; /* 柔和的分割线颜色 */
}

.page-header h2 {
  margin: 0;
  font-size: 26px; /* 增大标题字号 */
  color: #181c23; /* 深邃的标题颜色 */
  font-weight: 700; /* 加粗 */
}

.page-header .el-button {
  border-radius: 8px; /* 按钮圆角 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.page-header .el-button .el-icon {
  margin-right: 8px;
}

.address-form-section {
  background-color: #ffffff;
  padding: 32px; /* 增加内边距 */
  border-radius: 20px; /* 更大的圆角 */
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08); /* 更柔和的阴影 */
  margin-bottom: 32px;
  transition: all 0.3s ease-in-out; /* 平滑过渡 */
}

.address-form-section h3 {
  font-size: 22px;
  margin-bottom: 32px;
  color: #181c23;
  font-weight: 600;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 18px;
}

.address-form .el-form-item {
  margin-bottom: 26px;
}

.address-form .el-input__wrapper {
  border-radius: 8px !important; /* 输入框圆角 */
}

.address-form .el-button {
  min-width: 110px;
  padding: 12px 24px; /* 调整按钮内边距 */
  border-radius: 8px; /* 按钮圆角 */
  font-weight: 500;
}

.address-list-section {
  margin-top: 32px;
}

.address-list {
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(400px, 1fr)
  ); /* 调整最小宽度 */
  gap: 32px; /* 增加卡片间距 */
}

.address-item {
  background-image: linear-gradient(
    to top right,
    #ffffff,
    #f8f9fa
  ); /* 淡雅渐变背景 */
  border: 1px solid #dee2e6;
  border-radius: 16px; /* 更大的圆角 */
  padding: 28px; /* 增加内边距 */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden; /* 配合 ::before 伪元素 */
}

.address-item:hover {
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
  transform: translateY(-6px) scale(1.02); /* 更明显的悬浮效果 */
  border-color: var(--el-color-primary-light-3);
}

.address-item.default-address {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 3px var(--el-color-primary-light-5),
    0 8px 20px rgba(var(--el-color-primary-rgb), 0.2); /* 增强默认地址外发光效果 */
}

/* 默认地址的丝带标记 */
.address-item.default-address::before {
  content: "\e611"; /* 使用 Element Plus 图标库中的 'SuccessFilled' 图标，或自定义SVG */
  font-family: "element-plus-icons";
  position: absolute;
  top: -1px; /* 调整位置使其与边框融合 */
  right: -1px;
  width: 45px; /* 调整丝带大小 */
  height: 45px;
  background-color: var(--el-color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px; /* 图标大小 */
  border-radius: 0 16px 0 8px; /* 配合卡片圆角调整 */
  clip-path: polygon(
    0 0,
    100% 0,
    100% 100%,
    20% 100%,
    0 80%
  ); /* 更有设计感的形状 */
  box-shadow: -2px 2px 5px rgba(0, 0, 0, 0.2);
}

.address-details {
  margin-bottom: 20px;
  flex-grow: 1;
}

.address-line-1 {
  display: flex;
  align-items: baseline; /* 基线对齐，使文字更整齐 */
  margin-bottom: 14px;
  gap: 12px;
}

.address-line-1 .consignee {
  font-weight: 700; /* 加粗 */
  font-size: 19px;
  color: #0d121c; /* 更深沉的颜色 */
}

.address-line-1 .contact {
  font-size: 17px;
  color: #525866; /* 柔和的联系方式颜色 */
}

/* 移除原有的 el-tag 默认标签，使用 ::before 代替 */
.address-line-1 .el-tag {
  display: none;
}

.address-line-2,
.address-line-3 {
  font-size: 16px;
  color: #343a40; /* 调整地址详情颜色 */
  line-height: 1.9; /* 调整行高 */
}

.address-line-2 {
  margin-bottom: 10px;
}

.address-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  border-top: 1px solid #e9ecef;
  padding-top: 20px;
  margin-top: auto;
}

.address-actions .el-button {
  margin-left: 18px;
  font-size: 15px;
  padding: 8px 16px;
  border-radius: 6px; /* 按钮圆角 */
}

.address-actions .el-button .el-icon {
  margin-right: 6px;
  font-size: 17px;
}

.expand-button-container {
  margin-top: 32px;
  text-align: center;
}

.expand-button-container .el-button {
  font-weight: 500;
}

.el-empty {
  background-color: #fff;
  padding: 80px 0; /* 增加内边距 */
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.07);
}

/* 新增：表单出现/消失的动画 */
.address-form-enter-active,
.address-form-leave-active {
  transition: all 0.4s ease-in-out;
  max-height: 1000px; /* 足够大的高度 */
  opacity: 1;
}
.address-form-enter-from,
.address-form-leave-to {
  opacity: 0;
  transform: translateY(-20px);
  max-height: 0;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .address-list {
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  }
}

@media (max-width: 992px) {
  .address-list {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  }
  .address-form .el-row {
    display: flex;
    flex-direction: column;
  }
  .address-form .el-col {
    width: 100% !important;
    max-width: 100% !important;
    margin-bottom: 0;
  }
  .address-form .el-form-item {
    margin-bottom: 22px;
  }
}

@media (max-width: 768px) {
  .address-book-container {
    padding: 20px;
  }
  .page-header {
    margin-bottom: 28px;
    padding-bottom: 20px;
  }
  .page-header h2 {
    font-size: 24px;
  }
  .address-form-section {
    padding: 20px;
    border-radius: 16px;
  }
  .address-form-section h3 {
    font-size: 20px;
    margin-bottom: 24px;
    padding-bottom: 16px;
  }
  .address-list {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .address-item {
    padding: 24px;
    border-radius: 12px;
  }
  .address-item.default-address::before {
    width: 40px;
    height: 40px;
    font-size: 18px;
    border-radius: 0 12px 0 6px;
  }
  .address-line-1 .consignee {
    font-size: 18px;
  }
  .address-line-1 .contact {
    font-size: 16px;
  }
  .address-line-2,
  .address-line-3 {
    font-size: 15px;
  }
  .address-actions .el-button {
    margin-left: 14px;
    font-size: 14px;
  }
  .address-actions .el-button .el-icon {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .address-book-container {
    padding: 16px;
  }
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  .page-header .el-button {
    width: 100%;
  }
  .address-form-section {
    padding: 20px;
  }
  .address-form .el-button {
    width: calc(50% - 10px);
  }
  .address-form .el-button + .el-button {
    margin-left: 20px;
  }
  .address-item {
    padding: 20px;
  }
  .address-line-1 {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
  .address-line-1 .consignee {
    font-size: 17px;
  }
  .address-line-1 .contact {
    font-size: 15px;
  }
  .address-item.default-address::before {
    width: 35px;
    height: 35px;
    font-size: 16px;
  }
}
</style>
