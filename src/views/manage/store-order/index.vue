<template>
  <div class="store-order-container">
    <!-- 页面头部 -->
    <div class="order-header">
      <h2>店内订单</h2>

      <!-- 订单状态按钮组 -->
      <div class="order-status-filter">
        <el-button-group>
          <el-button
            :type="
              queryParams.orderStatus === null || queryParams.orderStatus === ''
                ? 'primary'
                : ''
            "
            @click="handleStatusChange(null)"
            >全部</el-button
          >
          <el-button
            v-for="dict in order_status"
            :key="dict.value"
            :type="queryParams.orderStatus == dict.value ? 'primary' : ''"
            @click="handleStatusChange(dict.value)"
            >{{ dict.label }}</el-button
          >
        </el-button-group>
      </div>

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
                    <el-icon><PriceTag /></el-icon>
                    <!-- 总额图标 -->
                    总额: ¥{{ order.order.totalAmount.toFixed(2) }}
                  </span>
                  <span class="separator">|</span>
                  <!-- 添加分隔符 -->
                  <span>
                    <el-icon><User /></el-icon>
                    <!-- 用户图标 -->
                    用户ID: {{ order.order.userId }}
                  </span>
                  <!-- **新增：订单创建时间** -->
                  <span class="separator">|</span>
                  <span>
                    <el-icon><Clock /></el-icon>
                    创建时间: {{ order.order.createTime }}
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
                <!-- 待发货=>进行发货 -->
                <el-button
                  v-if="order.order.orderStatus === 1"
                  type="primary"
                  link
                  @click="handleShipOrder(order.order.orderId)"
                  >进行发货</el-button
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
  </div>
</template>

<script setup name="StoreOrder">
import { ref, reactive, computed, onMounted, getCurrentInstance } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import useUserStore from "@/store/modules/user";
import { listOrderByStoreId, updateOrder, getOrder } from "@/api/manage/order";
import { listStore } from "@/api/manage/store";

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
  storeId: null,
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
    // 使用组内第一个订单的创建时间进行排序
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

// 获取用户关联店铺
async function getStore() {
  listStore({
    userId: userStore.id,
  }).then((response) => {
    if (response.code === 200 && response.rows.length > 0) {
      queryParams.storeId = response.rows[0].storeId;
      getList();
    }
  });
}

/** 获取订单列表 */
async function getList() {
  loading.value = true;
  try {
    if (!queryParams.storeId) {
      ElMessage.warning("无法获取店铺ID，请确保已登录商家账号。");
      loading.value = false;
      return;
    }
    const response = await listOrderByStoreId(queryParams.storeId);
    if (response.code === 200) {
      // 获取待过滤的订单数据
      let filteredOrders = response.rows;

      // 根据创建时间排序
      filteredOrders.sort((a, b) => {
        const timeA = new Date(a.order.createTime).getTime();
        const timeB = new Date(b.order.createTime).getTime();
        return timeB - timeA; // 从新到旧排序
      });

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

/** 处理订单状态按钮点击 */
function handleStatusChange(status) {
  queryParams.orderStatus = status;
  handleQuery();
}

/** 处理进行发货 */
async function handleShipOrder(orderId) {
  ElMessageBox.confirm("是否确认对该订单进行发货?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      try {
        // 调用API更新订单状态为待收货 (2)
        const response = await updateOrder({
          orderId: orderId,
          orderStatus: 2, // 待收货
        });
        if (response.code === 200) {
          ElMessage.success("发货成功，订单状态更新为待收货");
          getList(); // 刷新列表
        } else {
          ElMessage.error(response.msg || "发货失败");
        }
      } catch (error) {
        console.error("Error shipping order:", error);
        ElMessage.error("发货时发生错误");
      }
    })
    .catch(() => {}); // 用户取消操作
}

onMounted(() => {
  getStore();
});
</script>

<style lang="scss" scoped>
.store-order-container {
  padding: 20px;
  background-color: #f4f6f8; /* Slightly lighter background */

  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 15px 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08); /* Softer shadow */
    flex-wrap: wrap;

    h2 {
      margin: 0;
      font-size: 22px; /* Slightly smaller title */
      color: #333;
      flex-shrink: 0;
      margin-right: 20px;
    }

    .order-status-filter {
      margin-bottom: 0;
      margin-right: 20px;
      flex-shrink: 0;
    }

    .order-actions {
      display: flex;
      align-items: center;
      flex-grow: 1;
      justify-content: flex-end;
      flex-wrap: wrap;
      gap: 10px;
    }
  }

  .order-content {
    min-height: 300px;

    .order-group {
      margin-bottom: 20px;
      border: 1px solid #e0e6ed; /* Lighter border */
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05); /* Softer shadow */

      .group-header {
        background-color: #f0f2f5; /* Lighter header */
        padding: 12px 20px;
        font-weight: bold;
        color: #555; /* Slightly lighter text */
        border-bottom: 1px solid #dcdfe6; /* Lighter border */
        font-size: 15px; /* Slightly smaller font */
      }

      .order-card {
        margin: 0;
        border: none;
        border-bottom: 1px solid #e0e6ed; /* Use group header border color */
        background-color: #fff;

        &:last-child {
          border-bottom: none;
        }

        &:hover {
          /* Add hover effect */
          transform: translateY(-3px); /* Slightly lift the card */
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.12); /* More pronounced shadow on hover */
          transition: all 0.3s ease; /* Smooth transition */
        }

        .el-card__body {
          padding: 20px;
        }

        .order-summary {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;

          .summary-top {
            flex-grow: 1;
            margin-right: 20px;

            .order-basic-info {
              display: flex;
              align-items: center;
              flex-wrap: wrap;
              margin-bottom: 15px;

              span {
                margin-right: 20px; /* Slightly less space */
                font-size: 14px;
                color: #555; /* Slightly lighter text */

                &:last-child {
                  margin-right: 0;
                }
              }

              span .el-icon {
                margin-right: 5px; /* Slightly less icon margin */
                font-size: 16px; /* Slightly smaller icons */
                color: #409eff; /* Use Element Plus primary blue */
              }

              /* 订单编号样式 */
              span:nth-child(1) {
                font-weight: bold;
                color: #333;
              }

              /* 总额样式 */
              span:nth-child(3) {
                color: #f56c6c; /* Use Element Plus danger red */
                font-weight: bold;
                font-size: 15px; /* Slightly smaller font */
              }

              /* 分隔符样式 */
              .separator {
                margin: 0 10px; /* Slightly less margin */
                color: #dcdfe6; /* Lighter separator */
                font-weight: normal;
              }
            }

            /* 订单状态样式 */
            .order-status {
              flex-shrink: 0;
              font-weight: bold;
              color: #67c23a; /* Use Element Plus success green */
              font-size: 14px; /* Slightly smaller status font */
            }
          }

          /* 操作按钮区域 */
          .order-actions {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            flex-wrap: wrap;
            gap: 10px; /* Slightly less gap */
            padding-top: 15px;
            border-top: 1px dashed #dcdfe6; /* Use lighter dashed border */
            width: 100%;
          }
        }

        /* 地址和详情区域 */
        .order-address-details,
        .order-item-details {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px dashed #dcdfe6; /* Use lighter dashed border */

          h4 {
            margin-top: 0;
            margin-bottom: 10px; /* Slightly less margin */
            color: #444; /* Slightly lighter heading color */
            font-size: 16px; /* Slightly smaller heading font */
          }

          p {
            margin-bottom: 6px; /* Slightly less margin */
            font-size: 14px;
            color: #555; /* Slightly lighter text */
          }

          .detail-header {
            display: flex;
            padding: 8px 0; /* Adjust padding */
            border-bottom: 1px solid #dcdfe6; /* Lighter border */
            font-weight: bold;
            color: #444; /* Slightly lighter text */
            font-size: 14px;

            span {
              flex: 1;
              text-align: left;

              &:nth-child(1) {
                flex: 4;
              }
              &:nth-child(2) {
                flex: 1;
                text-align: right;
              }
              &:nth-child(3) {
                flex: 1;
                text-align: right;
              }
              &:nth-child(4) {
                flex: 1;
                text-align: right;
              }
            }
          }

          .order-detail-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0; /* Adjust padding */
            border-bottom: 1px dashed #dcdfe6; /* Use lighter dashed border */
            font-size: 14px;
            color: #555; /* Slightly lighter text */

            &:last-child {
              border-bottom: none;
            }

            span {
              flex: 1;
              text-align: left;

              &.item-name {
                flex: 4; /* 商品名称占据更多空间 */
              }

              &.item-price,
              &.item-quantity,
              &.item-subtotal {
                flex: 1; /* 单价、数量、小计占据相同空间 */
                text-align: right; /* 右对齐 */
              }
            }
          }
        }
      }
    }
  }

  .pagination-container {
    margin-top: 25px; /* Increase top margin */
    display: flex;
    justify-content: center;
    padding: 15px 0; /* Add padding */
    background-color: #fff; /* Add white background */
    border-radius: 8px; /* Match card border radius */
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05); /* Match card shadow */
  }
}
</style>
