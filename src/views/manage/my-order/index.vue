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

          <!-- 组内订单列表 -->
          <el-card
            v-for="order in group.orders"
            :key="order.order.orderId"
            class="order-card"
            shadow="hover"
          >
            <div class="order-summary">
              <div class="order-info">
                <span>订单编号: {{ order.order.orderCode }}</span>
                <span>店铺: {{ order.store.storeName }}</span>
                <span>总额: ¥{{ order.order.totalAmount.toFixed(2) }}</span>
                <span
                  >状态:
                  <dict-tag
                    :options="order_status"
                    :value="order.order.orderStatus"
                  />
                </span>
              </div>
              <div class="order-actions">
                <!-- 操作按钮区域 -->
                <el-button
                  v-if="order.order.orderStatus === 1"
                  type="danger"
                  link
                  @click="handleCancelOrder(order.order.orderId)"
                  >取消订单</el-button
                >
                <el-button
                  v-if="order.order.orderStatus === 2"
                  type="primary"
                  link
                  @click="handleConfirmReceipt(order.order.orderId)"
                  >确认收货</el-button
                >
                <el-button
                  v-if="order.order.orderStatus === 3"
                  type="success"
                  link
                  @click="handleReviewOrder(order)"
                  >进行评价</el-button
                >
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
                <el-button
                  v-if="order.order.orderStatus === 4"
                  type="primary"
                  link
                  @click="handleRepurchase(order.orderDetails)"
                  >再次购买</el-button
                >
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
                  <span class="item-name">{{
                    detail.productNameSnapshot
                  }}</span>
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

  // 返回分组后的 对象数组
  return Object.values(grouped);
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
  productId: null, // 评价是针对产品的，需要产品ID
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
  // 评价是针对订单中的产品，这里简化处理，假设评价整个订单（或第一个产品）
  // TODO: 如果需要对订单中的每个产品进行评价，需要修改逻辑
  if (orderItem.orderDetails && orderItem.orderDetails.length > 0) {
    // 假设评价订单中的第一个产品
    reviewForm.productId = orderItem.orderDetails[0].productIdSnapshot;
  } else {
    // 如果没有订单详情，则无法评价
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
        console.error("Error submitting review:", error);
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
  if (orderStatus === 3) {
    // 待评价状态
    confirmMsg = "该订单尚未评价，确认删除吗?";
  }

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
        // router.push('/manage/my-cart');
      } catch (error) {
        console.error("Error during repurchase:", error);
        ElMessage.error("再次购买时发生错误");
      }
    })
    .catch(() => {}); // 用户取消操作
}

// 页面加载时获取订单列表
onMounted(() => {
  getList();
});
</script>

<style lang="scss" scoped>
.my-order-container {
  padding: 20px;

  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      font-size: 24px;
    }

    .order-actions {
      display: flex;
      align-items: center;
    }
  }

  .order-content {
    min-height: 300px; /* 确保加载时有一定高度 */

    .order-group {
      margin-bottom: 20px;
      border: 1px solid #ebeef5;
      border-radius: 4px;
      overflow: hidden;

      .group-header {
        background-color: #f5f7fa;
        padding: 10px 15px;
        font-weight: bold;
        border-bottom: 1px solid #ebeef5;
      }

      .order-card {
        margin: 0;
        border: none;
        border-bottom: 1px solid #ebeef5; /* 卡片之间加分隔线 */

        &:last-child {
          border-bottom: none; /* 最后一个卡片没有下边线 */
        }

        .el-card__body {
          padding: 15px;
        }

        .order-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap; /* 允许换行 */

          .order-info {
            display: flex;
            flex-wrap: wrap;
            gap: 15px; /* 信息之间的间距 */
            font-size: 14px;
            color: #606266;
          }

          .order-actions {
            display: flex;
            align-items: center;
            gap: 10px; /* 按钮之间的间距 */
            margin-top: 10px; /* 响应式布局下，按钮换行后与上方信息保持距离 */
            @media (min-width: 768px) {
              margin-top: 0; /* 非小屏幕下取消上边距 */
            }
          }
        }

        .order-address-details,
        .order-item-details {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px dashed #ebeef5;

          h4 {
            margin-top: 0;
            margin-bottom: 10px;
            font-size: 16px;
            color: #303133;
          }

          p {
            margin-bottom: 5px;
            font-size: 14px;
            color: #606266;
          }
        }

        .order-item-details {
          .detail-header {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr; /* 商品名称 | 单价 | 数量 | 小计 */
            gap: 10px;
            font-weight: bold;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #ebeef5;
          }
          .order-detail-item {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr; /* 商品名称 | 单价 | 数量 | 小计 */
            gap: 10px;
            font-size: 14px;
            color: #606266;
            margin-bottom: 5px;
          }
          /* 响应式调整 */
          @media (max-width: 768px) {
            .detail-header,
            .order-detail-item {
              grid-template-columns: 1.5fr 1fr 1fr 1fr; /* 调整列宽 */
            }
          }
        }
      }
    }
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
}
</style>
