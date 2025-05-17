<template>
  <div class="my-cart-container" v-loading="loading">
    <!-- 页面头部 -->
    <div class="cart-header">
      <h2>我的购物车</h2>
      <div class="cart-actions" v-if="cartItemsByStore.length > 0">
        <el-button
          type="danger"
          @click="handleBatchDelete"
          :disabled="selectedItems.length === 0"
        >
          删除选中
        </el-button>
        <el-button type="warning" @click="handleClearCart"
          >清空购物车</el-button
        >
      </div>
    </div>

    <!-- 购物车为空 -->
    <el-empty
      v-if="!loading && cartItemsByStore.length === 0"
      description="购物车还是空的，快去选购商品吧！"
      :image-size="200"
    >
      <el-button type="primary" @click="goShopping">去购物</el-button>
    </el-empty>

    <!-- 购物车内容 -->
    <div v-else class="cart-content">
      <!-- 顶部操作栏：全选、总计、结算 -->
      <div class="cart-summary-bar">
        <el-checkbox
          v-model="isAllSelected"
          @change="handleSelectAllItems"
          label="全选"
          size="large"
        />
        <div class="summary-info">
          <span>已选 {{ selectedItemsCount }} 件商品</span>
          <span class="total-price-display"
            >合计：<span class="price-value"
              >¥{{ selectedTotalPrice.toFixed(2) }}</span
            ></span
          >
        </div>
        <el-button
          type="danger"
          @click="handleCheckout"
          :disabled="selectedItems.length === 0"
          class="checkout-button"
          size="large"
        >
          去结算
        </el-button>
      </div>

      <!-- 按店铺分组展示商品 -->
      <div
        v-for="storeGroup in cartItemsByStore"
        :key="storeGroup.storeId"
        class="store-group"
      >
        <div class="store-header">
          <el-checkbox
            v-model="storeGroup.selected"
            @change="() => handleSelectStore(storeGroup)"
          />
          <el-icon><Shop /></el-icon>
          <span class="store-name" @click="goToStore(storeGroup.storeId)">{{
            storeGroup.storeName
          }}</span>
        </div>

        <div class="cart-items-list">
          <el-card
            v-for="item in storeGroup.items"
            :key="item.cartItemId"
            class="cart-item-card"
            shadow="hover"
          >
            <div class="cart-item">
              <!-- 选择框 -->
              <el-checkbox
                v-model="item.isSelected"
                @change="() => handleItemSelectionChange(item)"
                class="item-checkbox"
              />

              <!-- 商品图片 -->
              <el-image
                :src="item.product.mainImg || defaultProductImage"
                fit="cover"
                class="product-image"
                @click="goToProductDetail(item.product.productId)"
              >
                <template #error>
                  <div class="image-slot">
                    <el-icon><PictureFilled /></el-icon>
                  </div>
                </template>
              </el-image>

              <!-- 商品信息 -->
              <div class="product-info">
                <div
                  class="product-name"
                  @click="goToProductDetail(item.product.productId)"
                >
                  {{ item.product.productName }}
                </div>
                <div class="product-specs">
                  规格：{{ item.product.specificationValue
                  }}{{ item.product.specificationUnit }} /
                  {{ item.product.priceUnit }}
                </div>
                <div class="product-status">
                  <dict-tag
                    :options="product_status"
                    :value="item.product.productStatus"
                  />
                  <el-tag
                    type="warning"
                    v-if="item.quantity > item.product.stock"
                    style="margin-left: 8px"
                    >库存不足</el-tag
                  >
                </div>
              </div>

              <!-- 单价 -->
              <div class="unit-price">¥{{ item.productPrice.toFixed(2) }}</div>

              <!-- 数量操作 -->
              <div class="quantity-control">
                <el-input-number
                  v-model="item.quantity"
                  :min="1"
                  :max="item.product.stock"
                  @change="
                    (currentValue, oldValue) =>
                      handleQuantityChange(item, currentValue, oldValue)
                  "
                  controls-position="right"
                  size="small"
                  :disabled="
                    item.product.productStatus !== 0 || item.product.stock === 0
                  "
                />
              </div>

              <!-- 小计 -->
              <div class="item-subtotal">
                ¥{{ (item.productPrice * item.quantity).toFixed(2) }}
              </div>

              <!-- 操作 -->
              <div class="item-actions">
                <el-button
                  type="primary"
                  link
                  @click="handleAddToFavorites(item.product.productId)"
                  >加入收藏</el-button
                >
                <el-button
                  type="danger"
                  link
                  @click="handleDeleteItem(item.cartItemId)"
                  >删除</el-button
                >
              </div>
            </div>
          </el-card>
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
          @size-change="getCartList"
          @current-change="getCartList"
        />
      </div>
    </div>
  </div>
</template>

<script setup name="MyCart">
import {
  ref,
  reactive,
  computed,
  onMounted,
  onBeforeUnmount,
  getCurrentInstance,
} from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { Shop, PictureFilled, Delete, Star } from "@element-plus/icons-vue";
import useUserStore from "@/store/modules/user";
import {
  listCartItem,
  delCartItem,
  updateCartItem,
  changeCartItem,
} from "@/api/manage/cart-item";
import { addFavorite } from "@/api/manage/favorite"; // 假设收藏API

const { proxy } = getCurrentInstance();
const router = useRouter();
const userStore = useUserStore();
const { product_status } = proxy.useDict("product_status");

// 加载状态
const loading = ref(true);
// 原始购物车列表（后端返回）
const rawCartItems = ref([]);
// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  userId: userStore.id, // 从store获取用户ID
});
// 总条数
const totalItems = ref(0);
// 记录选中状态发生变化的商品ID
const changedSelectedItemIds = ref(new Set());

// 默认商品图片
const defaultProductImage =
  "https://via.placeholder.com/100x100.png?text=FreshChoice";

// 计算属性：按店铺ID分组的购物车项
const cartItemsByStore = computed(() => {
  const grouped = {};
  rawCartItems.value.forEach((item) => {
    if (!item.product) {
      console.warn("Cart item missing product data:", item);
      return; // 跳过没有产品数据的项
    }
    const storeId = item.product.storeId;
    if (!grouped[storeId]) {
      grouped[storeId] = {
        storeId: storeId,
        storeName: item.product.storeName || "未知店铺",
        selected: false, // 店铺是否全选
        items: [],
      };
    }
    grouped[storeId].items.push({
      ...item,
    });
  });

  // 检查并设置店铺的选中状态
  Object.values(grouped).forEach((storeGroup) => {
    storeGroup.selected =
      storeGroup.items.length > 0 &&
      storeGroup.items.every((p) => p.isSelected);
  });
  return Object.values(grouped);
});

// 计算属性：所有选中的商品项 (扁平化列表)
const selectedItems = computed(() => {
  return rawCartItems.value.filter(
    (item) => item.isSelected === 1 || item.isSelected === true
  );
});

// 计算属性：已选商品数量
const selectedItemsCount = computed(() => selectedItems.value.length);

// 计算属性：已选商品总金额
const selectedTotalPrice = computed(() => {
  return selectedItems.value.reduce((sum, item) => {
    return sum + item.productPrice * item.quantity;
  }, 0);
});

// 计算属性：是否全选 (所有商品都被选中)
const isAllSelected = computed({
  get() {
    return (
      rawCartItems.value.length > 0 &&
      rawCartItems.value.every(
        (item) => item.isSelected === 1 || item.isSelected === true
      )
    );
  },
  set(value) {
    handleSelectAllItems(value);
  },
});

/** 获取购物车列表 */
async function getCartList() {
  await syncSelectedItemsWithBackend(); // 在获取列表前同步状态
  loading.value = true;
  try {
    const response = await listCartItem(queryParams);
    if (response.code === 200) {
      rawCartItems.value = response.rows.map((item) => ({
        ...item,
        isSelected: item.isSelected === 1, // 确保isSelected是布尔值或1/0
      }));
      totalItems.value = response.total;
    } else {
      ElMessage.error(response.msg || "获取购物车失败");
      rawCartItems.value = [];
      totalItems.value = 0;
    }
  } catch (error) {
    console.error("Error fetching cart list:", error);
    ElMessage.error("获取购物车数据时发生错误");
    rawCartItems.value = [];
    totalItems.value = 0;
  }
  loading.value = false;
}

/** 处理商品数量变更 */
async function handleQuantityChange(item, currentValue, oldValue) {
  if (item.product.productStatus !== 0) {
    ElMessage.warning("该商品已下架或无法购买");
    item.quantity = oldValue; // 恢复旧值
    return;
  }
  if (currentValue > item.product.stock) {
    ElMessage.warning(`最多可购买 ${item.product.stock} 件`);
    item.quantity = item.product.stock;
    // 修正后可能需要重新计算总价等，或者由isSelected状态变化触发
  }
  // 调用API更新后端数量
  try {
    const response = await updateCartItem({
      cartItemId: item.cartItemId,
      quantity: item.quantity,
    });
    if (response.code !== 200) {
      ElMessage.error(response.msg || "更新数量失败");
      item.quantity = oldValue; // 失败则恢复
    } else {
      // ElMessage.success('数量已更新'); // 可选：成功提示
      // 重新获取列表或局部更新价格
    }
  } catch (error) {
    console.error("Error updating quantity:", error);
    ElMessage.error("更新数量时发生错误");
    item.quantity = oldValue;
  }
}

/** 处理单个商品选中状态变更 */
async function handleItemSelectionChange(changedItem) {
  // changedItem is from cartItemsByStore. Its isSelected is already updated by v-model.
  const itemInRaw = rawCartItems.value.find(
    (i) => i.cartItemId === changedItem.cartItemId
  );
  if (itemInRaw) {
    // Update the source of truth
    itemInRaw.isSelected = changedItem.isSelected;

    // Update changedSelectedItemIds for backend sync
    if (changedSelectedItemIds.value.has(changedItem.cartItemId)) {
      changedSelectedItemIds.value.delete(changedItem.cartItemId);
    } else {
      changedSelectedItemIds.value.add(changedItem.cartItemId);
    }
  }
  // The storeGroup.selected state will be re-evaluated by cartItemsByStore
  // when rawCartItems changes. No need to manually set it here.
}

/** 处理店铺全选/全不选 */
async function handleSelectStore(storeGroup) {
  // storeGroup is from cartItemsByStore. Its selected is already updated by v-model.
  const newSelectionState = storeGroup.selected;

  // Update rawCartItems based on the new store selection state
  // This will trigger cartItemsByStore to recompute.
  storeGroup.items.forEach((itemFromStoreGroup) => {
    const rawItem = rawCartItems.value.find(
      (ri) => ri.cartItemId === itemFromStoreGroup.cartItemId
    );
    if (rawItem && rawItem.isSelected !== newSelectionState) {
      rawItem.isSelected = newSelectionState;
      // Update changedSelectedItemIds for backend sync
      if (changedSelectedItemIds.value.has(rawItem.cartItemId)) {
        changedSelectedItemIds.value.delete(rawItem.cartItemId);
      } else {
        changedSelectedItemIds.value.add(rawItem.cartItemId);
      }
    }
  });
  // cartItemsByStore will recompute, and its items' isSelected
  // and the storeGroup's selected state will be updated accordingly.
}

/** 处理全选/全不选所有商品 */
async function handleSelectAllItems(value) {
  // value is the new state from isAllSelected setter
  const newSelectionState = value;
  rawCartItems.value.forEach((item) => {
    if (item.isSelected !== newSelectionState) {
      item.isSelected = newSelectionState;
      // Update changedSelectedItemIds for backend sync
      if (changedSelectedItemIds.value.has(item.cartItemId)) {
        changedSelectedItemIds.value.delete(item.cartItemId);
      } else {
        changedSelectedItemIds.value.add(item.cartItemId);
      }
    }
  });
  // cartItemsByStore will recompute, and each storeGroup.selected
  // will be updated accordingly. No need to manually set it here.
}

/** 删除单个商品 */
async function handleDeleteItem(cartItemId) {
  await syncSelectedItemsWithBackend(); // 删除前同步状态
  ElMessageBox.confirm("确定要删除该商品吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      loading.value = true;
      try {
        const response = await delCartItem(cartItemId);
        if (response.code === 200) {
          ElMessage.success("删除成功");
          getCartList(); // 重新加载列表
        } else {
          ElMessage.error(response.msg || "删除失败");
        }
      } catch (error) {
        console.error("Error deleting item:", error);
        ElMessage.error("删除商品时发生错误");
      }
      loading.value = false;
    })
    .catch(() => {});
}

/** 批量删除选中商品 */
async function handleBatchDelete() {
  await syncSelectedItemsWithBackend(); // 批量删除前同步状态
  if (selectedItems.value.length === 0) {
    ElMessage.warning("请先选择要删除的商品");
    return;
  }
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedItems.value.length} 件商品吗？`,
    "提示",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  )
    .then(async () => {
      loading.value = true;
      const idsToDelete = selectedItems.value.map((item) => item.cartItemId);
      try {
        // 后端delCartItem通常接收单个id，若支持批量，则修改API调用
        // 此处假设逐个删除或后端delCartItem接受数组
        // 若后端delCartItem只接受单个id，需要循环调用
        let successCount = 0;
        for (const id of idsToDelete) {
          const response = await delCartItem(id);
          if (response.code === 200) {
            successCount++;
          } else {
            ElMessage.error(`删除商品ID ${id} 失败: ${response.msg}`);
          }
        }
        if (successCount > 0) {
          ElMessage.success(`成功删除 ${successCount} 件商品`);
        }
        if (successCount !== idsToDelete.length) {
          ElMessage.warning(`部分商品删除失败，请重试`);
        }
        getCartList(); // 重新加载列表
      } catch (error) {
        console.error("Error batch deleting items:", error);
        ElMessage.error("批量删除商品时发生错误");
      }
      loading.value = false;
    })
    .catch(() => {});
}

/** 清空购物车 */
async function handleClearCart() {
  await syncSelectedItemsWithBackend(); // 清空前同步状态
  if (rawCartItems.value.length === 0) {
    ElMessage.info("购物车已经是空的了");
    return;
  }
  ElMessageBox.confirm("确定要清空购物车吗？所有商品都将被移除。", "警告", {
    confirmButtonText: "确定清空",
    cancelButtonText: "取消",
    type: "error",
  })
    .then(async () => {
      loading.value = true;
      const idsToDelete = rawCartItems.value.map((item) => item.cartItemId);
      try {
        // 假设逐个删除，或后端支持批量删除所有（可能需要新API）
        let successCount = 0;
        for (const id of idsToDelete) {
          const response = await delCartItem(id);
          if (response.code === 200) {
            successCount++;
          } else {
            // ElMessage.error(`清空商品ID ${id} 失败: ${response.msg}`);
          }
        }
        if (successCount > 0) {
          ElMessage.success("购物车已清空");
        }
        if (successCount !== idsToDelete.length) {
          ElMessage.warning(`部分商品未能从购物车移除，请刷新后重试`);
        }
        getCartList(); // 重新加载列表
      } catch (error) {
        console.error("Error clearing cart:", error);
        ElMessage.error("清空购物车时发生错误");
      }
      loading.value = false;
    })
    .catch(() => {});
}

/** 加入收藏 */
async function handleAddToFavorites(productId) {
  try {
    const response = await addFavorite({
      userId: userStore.id,
      productId: productId,
    });
    if (response.code === 200) {
      ElMessage.success("成功加入收藏");
    } else {
      ElMessage.error(response.msg || "加入收藏失败");
    }
  } catch (error) {
    console.error("Error adding to favorites:", error);
    ElMessage.error("加入收藏时发生错误");
  }
}

/** 去结算 */
async function handleCheckout() {
  // 改为异步函数
  await syncSelectedItemsWithBackend(); // 结算前同步状态
  if (selectedItems.value.length === 0) {
    ElMessage.warning("请至少选择一件商品进行结算");
    return;
  }
  // 导航到订单确认页面，并传递选中的商品ID或整个商品信息
  // router.push({ name: 'OrderConfirm', query: { items: JSON.stringify(selectedItems.value) } });
  // 实际传递的数据根据订单确认页面的需要来定
  ElMessage.info("正在跳转到结算页面...");
  // 假设订单确认页路由为 'ConfirmOrder'
  // router.push({ name: 'ConfirmOrder', state: { selectedCartItems: selectedItems.value } });
  // 或者将选中项ID传过去，由订单页重新获取详情
  const selectedCartItemIds = selectedItems.value.map(
    (item) => item.cartItemId
  );
  router.push({
    path: "/manage/order-confirm",
    query: { cartItemIds: selectedCartItemIds.join(",") },
  });
}

/** 去购物 */
function goShopping() {
  router.push({ path: "/manage/browse" }); // 假设商品浏览页路由
}

/** 跳转到商品详情 */
function goToProductDetail(productId) {
  router.push({ path: `/manage/browse-detail/${productId}` });
}

/** 跳转到店铺 */
function goToStore(storeId) {
  // router.push({ path: `/store/${storeId}` }); // 假设店铺页路由
  ElMessage.info(`跳转到店铺ID: ${storeId} (功能待实现)`);
}

/** 同步选中状态到后端 */
async function syncSelectedItemsWithBackend() {
  if (changedSelectedItemIds.value.size === 0) {
    return; // 没有需要同步的变更
  }

  loading.value = true;
  const itemsToSync = Array.from(changedSelectedItemIds.value);
  let successCount = 0;

  try {
    for (const cartItemId of itemsToSync) {
      // 注意：changeCartItem API 可能需要知道商品当前的 isSelected 状态，
      // 或者它是一个 toggle API。当前代码是 toggle API。
      // 如果 API 需要具体状态，需要从 rawCartItems 中找到对应商品并传递其 isSelected 值。
      const item = rawCartItems.value.find((i) => i.cartItemId === cartItemId);
      if (item) {
        // 确保商品仍然存在于购物车中
        const response = await changeCartItem(cartItemId); // 假设 changeCartItem 是一个 toggle 操作
        if (response.code === 200) {
          successCount++;
        } else {
          ElMessage.error(
            `同步商品ID ${cartItemId} 选中状态失败: ${response.msg}`
          );
          // 此处可以选择是否停止同步，或者继续同步其他项目
        }
      }
    }
    if (successCount > 0 && successCount === itemsToSync.length) {
      // ElMessage.success('购物车选中状态已同步'); // 可选的成功提示
    } else if (successCount > 0) {
      ElMessage.warning("部分购物车商品选中状态同步成功");
    }
    changedSelectedItemIds.value.clear(); // 清空已同步的ID
  } catch (error) {
    console.error("Error syncing selected items with backend:", error);
    ElMessage.error("同步购物车选中状态时发生错误");
    // 错误发生，不清空 changedSelectedItemIds，以便下次尝试
  } finally {
    loading.value = false;
  }
}

// 组件卸载前同步状态
onBeforeUnmount(async () => {
  await syncSelectedItemsWithBackend();
});

// 组件挂载时获取购物车数据
onMounted(() => {
  console.log("User ID:", userStore.id);
  if (userStore.id) {
    getCartList();
  } else {
    ElMessage.warning("请先登录再查看购物车");
    loading.value = false;
    // 可选择跳转到登录页
    // router.push('/login');
  }
});
</script>

<style lang="scss" scoped>
.my-cart-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 50px); // 假设顶部导航栏高度50px
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;

  h2 {
    margin: 0;
    font-size: 24px;
    color: #333;
  }

  .cart-actions .el-button {
    margin-left: 10px;
  }
}

.cart-summary-bar {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .el-checkbox {
    margin-right: auto; // 将全选推到最左边
  }

  .summary-info {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-right: 20px;
    font-size: 14px;
    color: #555;

    .total-price-display {
      font-size: 16px;
      .price-value {
        font-weight: bold;
        font-size: 20px;
        color: #ff4d4f;
      }
    }
  }

  .checkout-button {
    font-size: 16px;
  }
}

.store-group {
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.store-header {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;

  .el-checkbox {
    margin-right: 10px;
  }

  .el-icon {
    margin-right: 8px;
    font-size: 18px;
    color: #555;
  }

  .store-name {
    font-size: 16px;
    font-weight: 500;
    color: #333;
    cursor: pointer;
    &:hover {
      color: #409eff;
    }
  }
}

.cart-items-list {
  padding: 0 20px 10px; // 给最后一个卡片底部留些空间
}

.cart-item-card {
  margin-top: 15px;
  border: none; // 使用卡片自带的边框和阴影
  &:first-child {
    margin-top: 0;
  }
  .el-card__body {
    padding: 15px !important; // 覆盖element-plus默认padding
  }
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 15px;

  .item-checkbox {
    flex-shrink: 0;
  }

  .product-image {
    width: 80px;
    height: 80px;
    border-radius: 4px;
    cursor: pointer;
    flex-shrink: 0;
    border: 1px solid #eee;
    .image-slot {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      background: #f5f7fa;
      color: #c0c4cc;
      font-size: 24px;
    }
  }

  .product-info {
    flex-grow: 1;
    min-width: 200px; // 避免被压缩过小
    .product-name {
      font-size: 14px;
      color: #333;
      font-weight: 500;
      cursor: pointer;
      margin-bottom: 5px;
      &:hover {
        color: #409eff;
      }
    }
    .product-specs {
      font-size: 12px;
      color: #999;
      margin-bottom: 5px;
    }
    .product-status {
      font-size: 12px;
      display: flex;
      align-items: center;
    }
  }

  .unit-price,
  .item-subtotal {
    width: 100px;
    text-align: center;
    font-size: 14px;
    color: #333;
    flex-shrink: 0;
  }
  .item-subtotal {
    font-weight: bold;
    color: #ff4d4f;
  }

  .quantity-control {
    width: 120px;
    flex-shrink: 0;
    .el-input-number {
      width: 100%;
    }
  }

  .item-actions {
    width: 120px;
    text-align: right;
    flex-shrink: 0;
    .el-button {
      padding: 5px;
      margin-left: 5px;
    }
  }
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding: 15px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

// 响应式调整
@media (max-width: 768px) {
  .cart-item {
    flex-wrap: wrap; // 在小屏幕上允许换行
    .product-info {
      width: 100%;
      order: 1; // 将信息放在图片下方
      margin-top: 10px;
    }
    .unit-price,
    .quantity-control,
    .item-subtotal,
    .item-actions {
      width: 50%; // 两列布局
      text-align: left;
      margin-top: 10px;
    }
    .item-actions {
      text-align: right;
    }
  }
  .cart-summary-bar {
    flex-direction: column;
    align-items: stretch;
    .summary-info {
      margin: 10px 0;
      justify-content: space-between;
    }
    .checkout-button {
      width: 100%;
    }
  }
}
</style>
