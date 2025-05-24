<template>
  <div class="my-order-container">
    <!-- 页面头部 -->
    <div class="order-header">
      <h2>我的订单</h2>

      <!-- 搜索和状态筛选区域 -->
      <div class="order-actions">
        <!-- 订单编号 -->
        <el-input
          v-model="queryParams.orderCode"
          placeholder="请输入订单编号"
          clearable
          style="width: 200px; margin-right: 10px"
          @keyup.enter="handleQuery"
        />

        <!-- 订单状态 -->
        <el-select
          v-model="queryParams.orderStatus"
          placeholder="请选择订单状态"
          clearable
          style="width: 150px"
          @change="handleQuery"
        >
          <el-option label="全部" value="" />
          <el-option
            v-for="dict in order_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>

        <!-- 搜索和重置按钮 -->
        <el-button type="primary" icon="Search" @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </div>
    </div>

    <!-- 订单列表 -->
    <div class="order-content" v-loading="loading">
      <!-- 为空时默认显示 -->
      <el-empty
        v-if="!loading && orderGroups.length === 0"
        description="暂无订单数据"
        :image-size="200"
      />

      <div v-else>
        <!-- 按父订单号分组展示 -->
        <div
          v-for="group in orderGroups"
          :key="group.parentOrderId || 'single'"
          class="order-group"
        >
          <!-- 分组头部：父订单号或单订单标识 -->
          <div class="group-header">
            <!-- 如果分组的订单号存在，那么显示父订单编码；反之显示独立订单 -->
            <span v-if="group.parentOrderId"
              >联合订单：{{ group.parentOrderCode }}</span
            >
            <span v-else>独立订单</span>
          </div>

          <!-- 订单列表 -->
          <el-card
            v-for="order in group.orders"
            :key="order.order.orderId"
            class="order-card"
            shadow="hover"
          >
            <!-- 调整订单摘要布局 -->
            <div class="order-summary">
              <!-- 顶部信息区域：订单基本信息和状态 -->
              <div class="summary-top">
                <div class="order-basic-info">
                  <span>
                    <el-icon><Document /></el-icon>
                    <!-- 订单编号图标 -->
                    订单编号: {{ order.order.orderCode }}
                  </span>
                  <span class="separator">|</span>
                  <!-- 添加分隔符 -->
                  <span>
                    <el-icon><Shop /></el-icon>
                    <!-- 店铺图标 -->
                    店铺:
                    <span
                      class="store-name-tag clickable"
                      @click="goToStoreDetail(order.store.storeId)"
                      >{{ order.store.storeName }}</span
                    >
                    <!-- 店铺名称使用标签样式并添加点击事件 -->
                  </span>
                  <span class="separator">|</span>
                  <!-- 添加分隔符 -->
                  <span>
                    <el-icon><PriceTag /></el-icon>
                    <!-- 总额图标 -->
                    总额: ¥{{ order.order.totalAmount.toFixed(2) }}
                  </span>
                </div>
                <!-- 订单状态单独显示 -->
                <div class="order-status">
                  <dict-tag
                    :options="order_status"
                    :value="order.order.orderStatus"
                  />
                </div>
              </div>

              <!-- 操作按钮区域 -->
              <div class="order-actions">
                <!-- 添加订单创建时间 -->
                <span class="order-create-time">
                  <strong>创建时间: {{ order.order.createTime }}</strong>
                </span>

                <!-- 待发货=>取消订单 -->
                <el-button
                  v-if="order.order.orderStatus === 1"
                  type="danger"
                  link
                  @click="handleCancelOrder(order.order.orderId)"
                  >取消订单</el-button
                >

                <!-- 待收货=>确认收货 -->
                <el-button
                  v-if="order.order.orderStatus === 2"
                  type="primary"
                  link
                  @click="handleConfirmReceipt(order.order.orderId)"
                  >确认收货</el-button
                >

                <!-- 待评价=>进行评价 -->
                <el-button
                  v-if="order.order.orderStatus === 3"
                  type="success"
                  link
                  @click="handleReviewOrder(order)"
                  >进行评价</el-button
                >

                <!-- 已完成/已取消/已删除=>删除订单 -->
                <el-button
                  v-if="
                    order.order.orderStatus === 4 ||
                    order.order.orderStatus === 5 ||
                    order.order.orderStatus === 6
                  "
                  type="danger"
                  link
                  @click="
                    handleDeleteOrder(
                      order.order.orderId,
                      order.order.orderStatus
                    )
                  "
                  >删除订单</el-button
                >

                <!-- 已完成=>再次购买 -->
                <el-button
                  v-if="order.order.orderStatus === 4"
                  type="primary"
                  link
                  @click="handleRepurchase(order.orderDetails)"
                  >再次购买</el-button
                >

                <!-- 显示地址 -->
                <el-button
                  type="info"
                  link
                  @click="toggleAddressVisibility(order.order.orderId)"
                >
                  {{
                    visibleAddresses[order.order.orderId]
                      ? "隐藏地址"
                      : "显示地址"
                  }}
                </el-button>

                <!-- 显示详情 -->
                <el-button
                  type="info"
                  link
                  @click="toggleDetailsVisibility(order.order.orderId)"
                >
                  {{
                    visibleDetails[order.order.orderId]
                      ? "隐藏详情"
                      : "显示详情"
                  }}
                </el-button>
              </div>
            </div>

            <!-- 地址信息 (可折叠) -->
            <el-collapse-transition>
              <div
                v-show="visibleAddresses[order.order.orderId]"
                class="order-address-details"
              >
                <h4>收货地址</h4>
                <p>
                  收件人: {{ order.order.receiverSnapshot }} ({{
                    order.order.contactSnapshot
                  }})
                </p>
                <p>
                  地址: {{ order.order.provinceSnapshot
                  }}{{ order.order.citySnapshot
                  }}{{ order.order.districtSnapshot
                  }}{{ order.order.detailAddressSnapshot }}
                </p>
              </div>
            </el-collapse-transition>

            <!-- 订单详情 (可折叠) -->
            <el-collapse-transition>
              <div
                v-show="visibleDetails[order.order.orderId]"
                class="order-item-details"
              >
                <h4>商品清单</h4>
                <div class="detail-header">
                  <span>商品名称</span>
                  <span>单价</span>
                  <span>数量</span>
                  <span>小计</span>
                </div>
                <div
                  v-for="detail in order.orderDetails"
                  :key="detail.orderDetailId"
                  class="order-detail-item"
                >
                  <span
                    class="item-name clickable"
                    @click="goToProductDetail(detail.productIdSnapshot)"
                    >{{ detail.productNameSnapshot }}</span
                  >
                  <span class="item-price"
                    >¥{{ detail.productPriceSnapshot.toFixed(2) }}</span
                  >
                  <span class="item-quantity">{{ detail.quantity }}</span>
                  <span class="item-subtotal"
                    >¥{{
                      (detail.productPriceSnapshot * detail.quantity).toFixed(2)
                    }}</span
                  >
                </div>
              </div>
            </el-collapse-transition>
          </el-card>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-container" v-if="totalItems > 0">
      <el-pagination
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :page-sizes="[5, 10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalItems"
        @size-change="getList"
        @current-change="getList"
      />
    </div>

    <!-- 评价对话框 -->
    <el-dialog
      v-model="reviewDialogVisible"
      title="评价商品"
      width="500px"
      :close-on-click-modal="false"
      @closed="handleReviewDialogClosed"
    >
      <el-form
        ref="reviewFormRef"
        :model="reviewForm"
        :rules="reviewRules"
        label-width="80px"
      >
        <el-form-item label="评价内容" prop="content">
          <el-input
            v-model="reviewForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入评价内容"
          />
        </el-form-item>

        <el-form-item label="评价等级" prop="rating">
          <el-rate
            v-model="reviewForm.rating"
            :texts="['极差', '失望', '一般', '满意', '惊喜']"
            show-text
          />
        </el-form-item>

        <el-form-item label="匿名评价" prop="isAnonymous">
          <el-switch
            v-model="reviewForm.isAnonymous"
            active-text="是"
            inactive-text="否"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>
      </el-form>

      <!-- 评价对话框底部按钮 -->
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="reviewDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitReview">提交评价</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="MyOrder">
import { ref, reactive, computed, onMounted, getCurrentInstance } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import useUserStore from "@/store/modules/user";
import {
  listOrderByUserId,
  updateOrder,
  delOrder,
  getOrder,
} from "@/api/manage/order";
import { addReview } from "@/api/manage/review";
import { addCartItem } from "@/api/manage/cart-item";

const { proxy } = getCurrentInstance();
const router = useRouter();
const userStore = useUserStore();
const { order_status } = proxy.useDict("order_status");

// 加载状态
const loading = ref(true);

// 订单列表数据
const orderList = ref([]);
// 订单总条数
const totalItems = ref(0);

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  userId: userStore.id,
  orderCode: null,
  orderStatus: null,
});

// 计算属性：按父订单号分组的订单列表
// 每组包含：父订单ID、父订单编码和订单列表
// 对于独立订单，父订单ID为null，父订单编码为'独立订单'
const orderGroups = computed(() => {
  const grouped = {};
  orderList.value.forEach((orderItem) => {
    // 获取父订单号
    // 即使没有父订单号，先为其赋本身订单号
    // 这样随后创建组，组内父订单号依旧为null，编码为'独立订单'
    const parentId = orderItem.order.parentOrderId || orderItem.order.orderId;

    // 如果组不存在，则创建一个新组
    if (!grouped[parentId]) {
      // 每组包含：父订单ID、父订单编码和订单列表
      grouped[parentId] = {
        parentOrderId: orderItem.order.parentOrderId,
        parentOrderCode: orderItem.order.parentOrderId
          ? "加载中..."
          : "独立订单",
        orders: [],
      };
      // 如果有父订单ID，异步获取父订单编码；反之，独立订单则直接使用'独立订单'
      if (orderItem.order.parentOrderId) {
        fetchParentOrderCode(orderItem.order.parentOrderId, grouped[parentId]);
      }
    }
    // 将订单添加到对应的组
    grouped[parentId].orders.push(orderItem);
  });

  // 返回分组后的 对象数组，并按照组内第一个订单的创建时间从新到旧排序
  return Object.values(grouped).sort((a, b) => {
    // 假设每个组至少有一个订单，且同一组订单创建时间一致
    const timeA = new Date(a.orders[0].order.createTime).getTime();
    const timeB = new Date(b.orders[0].order.createTime).getTime();
    return timeB - timeA; // 从新到旧排序
  });
});

// 用于存储父订单编码的映射
const parentOrderCodeMap = reactive({});

// 异步获取父订单编码
async function fetchParentOrderCode(parentOrderId, group) {
  // 如果该父订单号已经获取过编码，直接返回
  if (parentOrderCodeMap[parentOrderId]) {
    group.parentOrderCode = parentOrderCodeMap[parentOrderId];
    return;
  }

  try {
    // 获取父订单数据
    const response = await getOrder(parentOrderId);
    if (response.code === 200 && response.data) {
      // 更新映射
      parentOrderCodeMap[parentOrderId] = response.data.orderCode;
      // 更新分组的父订单号
      group.parentOrderCode = response.data.orderCode;
    } else {
      group.parentOrderCode = "获取失败";
      console.error("获取失败:", response.msg);
    }
  } catch (error) {
    group.parentOrderCode = "获取失败";
    console.error("获取失败:", error);
  }
}

// 用于控制地址和详情的显示/隐藏状态
const visibleAddresses = reactive({});
const visibleDetails = reactive({});

// 切换地址显示状态
function toggleAddressVisibility(orderId) {
  visibleAddresses[orderId] = !visibleAddresses[orderId];
}

// 切换详情显示状态
function toggleDetailsVisibility(orderId) {
  visibleDetails[orderId] = !visibleDetails[orderId];
}

// 评价对话框状态和表单
const reviewDialogVisible = ref(false);
const reviewFormRef = ref(null);
const reviewForm = reactive({
  content: "",
  rating: 0,
  isAnonymous: 0,
  userId: userStore.id,
  orderId: null,
});

// 评价表单验证规则
const reviewRules = reactive({
  content: [{ required: true, message: "评价内容不能为空", trigger: "blur" }],
  rating: [{ required: true, message: "请选择评价等级", trigger: "change" }],
});

/** 获取订单列表 */
async function getList() {
  loading.value = true;
  try {
    const response = await listOrderByUserId(queryParams.userId);
    if (response.code === 200) {
      // 获取待过滤的订单数据
      let filteredOrders = response.rows;

      // 按订单状态过滤
      if (queryParams.orderStatus !== null && queryParams.orderStatus !== "") {
        filteredOrders = filteredOrders.filter(
          (item) => item.order.orderStatus == queryParams.orderStatus
        );
      }

      // 按订单编号搜索 (模糊匹配)
      if (queryParams.orderCode) {
        const searchCode = queryParams.orderCode.toLowerCase();
        filteredOrders = filteredOrders.filter((item) =>
          item.order.orderCode.toLowerCase().includes(searchCode)
        );
      }

      // 手动分页(选定页码范围的数据)
      const start = (queryParams.pageNum - 1) * queryParams.pageSize;
      const end = start + queryParams.pageSize;
      orderList.value = filteredOrders.slice(start, end);
      totalItems.value = filteredOrders.length;

      // 初始化地址和详情的显示状态为隐藏
      orderList.value.forEach((item) => {
        visibleAddresses[item.order.orderId] = false;
        visibleDetails[item.order.orderId] = false;
      });
    } else {
      ElMessage.error(response.msg || "获取订单列表失败");
      orderList.value = [];
      totalItems.value = 0;
    }
  } catch (error) {
    console.error("Error fetching order list:", error);
    ElMessage.error("获取订单数据时发生错误");
    orderList.value = [];
    totalItems.value = 0;
  } finally {
    loading.value = false;
  }
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  queryParams.orderCode = null;
  queryParams.orderStatus = null;
  queryParams.pageNum = 1;
  getList();
}

/** 处理取消订单 */
async function handleCancelOrder(orderId) {
  ElMessageBox.confirm("是否确认取消该订单?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      try {
        // 调用API更新订单状态为已取消 (6)
        const response = await updateOrder({
          orderId: orderId,
          orderStatus: 6, // 已取消
        });
        if (response.code === 200) {
          ElMessage.success("订单已取消");
          getList(); // 刷新列表
        } else {
          ElMessage.error(response.msg || "取消订单失败");
        }
      } catch (error) {
        console.error("Error cancelling order:", error);
        ElMessage.error("取消订单时发生错误");
      }
    })
    .catch(() => {}); // 用户取消操作
}

/** 处理确认收货 */
async function handleConfirmReceipt(orderId) {
  ElMessageBox.confirm("是否确认收货?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "info",
  })
    .then(async () => {
      try {
        // 调用API更新订单状态为待评价 (3)
        const response = await updateOrder({
          orderId: orderId,
          orderStatus: 3, // 待评价
        });
        if (response.code === 200) {
          ElMessage.success("确认收货成功，订单状态更新为待评价");
          getList(); // 刷新列表
        } else {
          ElMessage.error(response.msg || "确认收货失败");
        }
      } catch (error) {
        console.error("Error confirming receipt:", error);
        ElMessage.error("确认收货时发生错误");
      }
    })
    .catch(() => {}); // 用户取消操作
}

/** 处理进行评价 */
function handleReviewOrder(orderItem) {
  // 打开评价对话框，并填充必要信息
  reviewForm.orderId = orderItem.order.orderId;
  // 评价是针对订单中的产品，这里简化处理，假设评价整个订单
  if (!orderItem.orderDetails || orderItem.orderDetails.length == 0) {
    ElMessage.warning("该订单没有商品详情，无法评价");
    return;
  }

  reviewDialogVisible.value = true;
}

/** 提交评价 */
async function submitReview() {
  reviewFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 调用API新增评价
        const response = await addReview(reviewForm);
        if (response.code === 200) {
          ElMessage.success("评价提交成功");
          reviewDialogVisible.value = false;
          // 更新订单状态为已完成 (4)
          await updateOrder({
            orderId: reviewForm.orderId,
            orderStatus: 4, // 已完成
          });
          getList(); // 刷新列表
        } else {
          ElMessage.error(response.msg || "评价提交失败");
        }
      } catch (error) {
        ElMessage.error("提交评价时发生错误");
      }
    }
  });
}

/** 评价对话框关闭后重置表单 */
function handleReviewDialogClosed() {
  reviewFormRef.value.resetFields();
  reviewForm.orderId = null;
  reviewForm.productId = null;
  reviewForm.rating = 0;
  reviewForm.isAnonymous = 0;
}

/** 处理删除订单 */
async function handleDeleteOrder(orderId, orderStatus) {
  let confirmMsg = "是否确认删除该订单?";

  ElMessageBox.confirm(confirmMsg, "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      try {
        // 调用API删除订单
        const response = await delOrder(orderId);
        if (response.code === 200) {
          ElMessage.success("订单已删除");
          getList(); // 刷新列表
        } else {
          ElMessage.error(response.msg || "删除订单失败");
        }
      } catch (error) {
        console.error("Error deleting order:", error);
        ElMessage.error("删除订单时发生错误");
      }
    })
    .catch(() => {}); // 用户取消操作
}

/** 处理再次购买 */
async function handleRepurchase(orderDetails) {
  if (!orderDetails || orderDetails.length === 0) {
    ElMessage.warning("该订单没有商品详情，无法再次购买");
    return;
  }

  ElMessageBox.confirm("是否将该订单中的商品全部加入购物车?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "info",
  })
    .then(async () => {
      try {
        // 遍历订单详情，将每个商品添加到购物车
        for (const detail of orderDetails) {
          // 调用addCartItem API
          const response = await addCartItem({
            userId: userStore.id,
            productId: detail.productIdSnapshot,
            quantity: detail.quantity,
            productName: detail.productNameSnapshot, // 冗余字段
            productMainUrl: detail.productMainUrlSnapshot, // 冗余字段
            productPrice: detail.productPriceSnapshot, // 快照价格
            isSelected: 0, // 默认未选中
          });

          if (response.code !== 200) {
            // 如果某个商品添加失败，记录错误并继续添加其他商品
            console.error(
              `Failed to add product ${detail.productNameSnapshot} to cart:`,
              response.msg
            );
            ElMessage.warning(
              `部分商品加入购物车失败: ${detail.productNameSnapshot}`
            );
          }
        }
        ElMessage.success("订单中的商品已加入购物车");
        // TODO: 可以考虑跳转到购物车页面
        router.push("/main/my-cart");
      } catch (error) {
        console.error("Error during repurchase:", error);
        ElMessage.error("再次购买时发生错误");
      }
    })
    .catch(() => {}); // 用户取消操作
}

/** 跳转到店铺详情页 */
function goToStoreDetail(storeId) {
  if (storeId) {
    router.push({ path: `/myStore/storefront/${storeId}` });
  } else {
    ElMessage.warning("无法获取店铺ID");
  }
}

/** 跳转到产品详情页 */
function goToProductDetail(productId) {
  if (productId) {
    router.push({ path: `/main/browse/${productId}` });
  } else {
    ElMessage.warning("无法获取产品ID");
  }
}

// 页面加载时获取订单列表
onMounted(() => {
  getList();
});
</script>

<style lang="scss" scoped>
/* 页面容器 */
.my-order-container {
  padding: 20px;
  background-color: #f8f8f8; /* 轻微的背景色 */
}

/* 页面头部 */
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.order-header h2 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.order-actions {
  display: flex;
  align-items: center;
  gap: 10px; /* 搜索和重置按钮之间的间距 */
}

.order-create-time {
  margin-right: auto; /* 将创建时间推到最左侧 */
  font-size: 14px; /* 调整字体大小 */
  color: #606266; /* 调整字体颜色 */
  white-space: nowrap; /* 防止文本换行 */
}
/* 订单列表内容区域 */
.order-content {
  min-height: 300px; /* 确保内容区域有最小高度 */
}

/* 针对父订单分组的样式 */
.order-group {
  margin-bottom: 25px; /* 组与组之间的间距增加 */
  border: 1px solid #e4e7ed; /* 边框颜色调整 */
  border-radius: 8px; /* 圆角增加 */
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); /* 阴影更明显 */
  background-color: #fff; /* 组背景色 */
}

.group-header {
  background-color: #f2f6fc; /* 组头部背景色更突出 */
  padding: 14px 20px; /* 组头部内边距 */
  font-weight: bold;
  font-size: 16px; /* 字体大小增加 */
  color: #303133;
  border-bottom: 1px solid #e4e7ed; /* 组头部底边线 */
}

/* 调整组内订单卡片的样式 */
.order-group .order-card {
  margin-top: 0;
  margin-bottom: 0;
  border: none; /* 移除卡片自身边框 */
  box-shadow: none; /* 移除卡片阴影 */
  border-radius: 0; /* 移除卡片圆角 */
  padding: 0; /* 移除卡片默认内边距，由内部元素控制 */
}

/* 为组内的订单卡片添加底部边线，除了最后一个 */
.order-group .order-card:not(:last-child) {
  border-bottom: 1px solid #ebeef5; /* 卡片之间的分隔线 */
}

/* 订单摘要布局 */
.order-summary {
  display: flex;
  flex-direction: column; /* 摘要内部改为垂直布局 */
  padding: 15px 20px; /* 摘要内边距 */
}

/* 顶部信息区域：订单基本信息和状态 */
.summary-top {
  display: flex;
  justify-content: space-between; /* 基本信息和状态左右对齐 */
  align-items: center;
  margin-bottom: 15px; /* 顶部信息和操作按钮之间的间距 */
  flex-wrap: wrap; /* 允许换行 */
}

.order-basic-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  font-size: 14px;
  color: #606266;
  flex-grow: 1; /* 允许基本信息区域占据更多空间 */
}

.order-basic-info span {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-right: 20px; /* 信息项之间的右侧间距 */
}

.order-basic-info span:last-child {
  margin-right: 0; /* 最后一个信息项移除右侧间距 */
}

.order-basic-info span .el-icon {
  margin-right: 5px;
  font-size: 16px;
  color: #409eff;
}

/* 订单编号样式 */
.order-basic-info span:nth-child(1) {
  font-weight: bold;
  color: #303133;
}

/* 店铺名称标签样式 */
.store-name-tag {
  display: inline-block;
  background-color: #ecf5ff;
  color: #409eff;
  border: 1px solid #d9ecff;
  padding: 2px 8px;
  border-radius: 4px;
  margin-left: 5px;
  font-weight: normal;
  font-size: 13px; /* 标签字体稍微小一点 */
}

/* 总额样式 */
.order-basic-info span:nth-child(5) {
  color: #f56c6c;
  font-weight: bold;
  font-size: 15px; /* 总额字体稍微大一点 */
}

/* 分隔符样式 */
.order-basic-info .separator {
  margin: 0 10px;
  color: #dcdfe6;
  font-weight: normal;
}

/* 订单状态样式 */
.order-status {
  flex-shrink: 0; /* 订单状态不收缩 */
  font-weight: bold;
  color: #67c23a; /* 默认状态颜色 */
}

/* 操作按钮区域 */
.order-actions {
  display: flex;
  justify-content: flex-end; /* 按钮靠右对齐 */
  align-items: center;
  flex-wrap: wrap; /* 允许按钮换行 */
  gap: 10px; /* 按钮之间的间距 */
  padding-top: 15px; /* 与上方内容的间距 */
  border-top: 1px dashed #ebeef5; /* 添加虚线上边框 */
}

.order-actions .el-button {
  font-size: 13px; /* 按钮字体大小 */
}

/* 地址和详情区域 */
.order-address-details,
.order-item-details {
  padding: 15px 20px;
  background-color: #f9fafc; /* 轻微的背景色区分 */
  border-top: 1px solid #ebeef5;
}

.order-address-details h4,
.order-item-details h4 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 16px;
  color: #303133;
  border-bottom: 1px solid #ebeef5; /* 标题下划线 */
  padding-bottom: 5px;
}

.order-address-details p {
  margin-bottom: 5px;
  font-size: 14px;
  color: #606266;
}

.order-address-details p:last-child {
  margin-bottom: 0;
}

/* 商品清单头部 */
.detail-header {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  padding-bottom: 8px;
  margin-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
  font-size: 14px;
  color: #303133;
}

.detail-header span {
  flex: 1; /* 平均分配宽度 */
  text-align: center; /* 文字居中 */
}

.detail-header span:first-child {
  flex: 2; /* 商品名称占据更多空间 */
  text-align: left; /* 商品名称靠左 */
}

/* 单个商品详情项 */
.order-detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px dashed #f2f6fc; /* 虚线分隔 */
  font-size: 14px;
  color: #606266;
}

.order-detail-item:last-child {
  border-bottom: none; /* 最后一个商品项没有底边线 */
}

.order-detail-item span {
  flex: 1;
  text-align: center;
}

.order-detail-item .item-name {
  flex: 2;
  text-align: left;
  color: #409eff; /* 商品名称颜色 */
}

.order-detail-item .item-price {
  color: #e6a23c; /* 单价颜色 */
}

.order-detail-item .item-subtotal {
  font-weight: bold;
  color: #f56c6c; /* 小计颜色 */
}

/* 分页容器 */
.pagination-container {
  margin-top: 20px;
  padding: 15px 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: center; /* 分页组件居中 */
}

/* 评价对话框样式 */
.el-dialog {
  border-radius: 8px; /* 对话框圆角 */
  overflow: hidden; /* 确保内容不溢出圆角 */
}

.el-dialog__header {
  background-color: #f5f7fa; /* 头部背景色 */
  padding: 15px 20px; /* 头部内边距 */
  border-bottom: 1px solid #ebeef5; /* 头部底边线 */
}

.el-dialog__title {
  font-size: 18px; /* 标题字体大小 */
  color: #303133; /* 标题颜色 */
  font-weight: bold;
}

.el-dialog__body {
  padding: 20px; /* 内容区域内边距 */
}

/* 评价表单样式 */
.el-form-item {
  margin-bottom: 20px; /* 表单项之间间距 */
}

.el-form-item__label {
  font-weight: bold; /* 标签加粗 */
  color: #606266; /* 标签颜色 */
}

/* 评价内容输入框 */

/* 评价等级星星 */
.el-form-item__content .el-rate {
  /* 可以根据需要调整 el-rate 样式 */
  height: 32px; /* 确保与输入框高度对齐 */
  display: flex;
  align-items: center;
}

/* 匿名评价开关 */

/* 评价对话框底部按钮区域 */
.el-dialog__footer {
  background-color: #f5f7fa; /* 底部背景色 */
  padding: 15px 20px; /* 底部内边距 */
  border-top: 1px solid #ebeef5; /* 底部顶边线 */
  text-align: right; /* 按钮靠右对齐 */
}

/* 使店铺名称和产品名称可点击 */
.clickable {
  cursor: pointer;
  text-decoration: underline;
  &:hover {
    color: #66b1ff; /* Hover 颜色 */
  }
}
</style>
