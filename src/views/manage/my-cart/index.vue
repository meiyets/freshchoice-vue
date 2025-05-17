<template>
  <div class="my-cart-container" v-loading="loading">
    <!-- 页面头部 -->
    <div class="cart-header">
      <h2>我的购物车</h2>
      <div class="cart-actions" v-if="cartItemsByStore.length > 0">
        <!-- 删除选中按钮 -->
        <el-button
          type="danger"
          @click="handleBatchDelete"
          :disabled="selectedItems.length === 0"
        >
          删除选中
        </el-button>

        <!-- 清空购物车 -->
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
        <!-- 一个用于标识全选的复选框 -->
        <!-- 单击将全部 -->
        <el-checkbox
          v-model="isAllSelected"
          @change="handleSelectAllItems"
          label="全选"
          size="large"
        />

        <!-- 已选商品信息 -->
        <!-- TODO:之后检查这里价格算的对不对 -->
        <div class="summary-info">
          <span>已选 {{ selectedItemsCount }} 件商品</span>
          <span class="total-price-display"
            >合计：<span class="price-value"
              >¥{{ selectedTotalPrice.toFixed(2) }}</span
            ></span
          >
        </div>

        <!-- 结算按钮 -->
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
        <!-- 店铺级别复选框 -->
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

        <!-- 店铺下产品列表 -->
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

    <!-- 订单确认对话框 -->
    <el-dialog
      v-model="checkoutDialogVisible"
      title="确认订单信息"
      width="600px"
      :close-on-click-modal="false"
      @closed="handleCheckoutDialogClosed"
    >
      <div class="order-confirm-dialog-content" v-loading="dialogLoading">
        <!-- 地址信息 -->
        <div class="address-section">
          <h3>收货地址</h3>
          <div v-if="addressList.length > 0">
            <el-radio-group
              v-model="selectedAddressId"
              class="address-radio-group"
            >
              <el-radio
                v-for="address in addressList"
                :key="address.addressId"
                :label="address.addressId"
                class="address-radio-item"
              >
                <div class="address-info-content">
                  <div class="consignee-phone">
                    {{ address.consignee }} {{ address.contact }}
                  </div>
                  <div class="detail-address">
                    {{ address.province }}{{ address.city }}{{ address.district
                    }}{{ address.detailAddress }}
                  </div>
                </div>
              </el-radio>
            </el-radio-group>
          </div>

          <!-- 为空时点击跳转到“我的地址簿” -->
          <!-- TODO: -->
          <div v-else class="empty-address-state">
            <el-empty description="请添加收货地址"></el-empty>
            <el-button type="primary" @click="goToAddressManagement">
              去添加地址
            </el-button>
          </div>
        </div>

        <el-divider />

        <!-- 商品总览 (小票形式) -->
        <div class="items-overview-section">
          <h3>商品清单</h3>
          <div class="receipt-style-list">
            <!-- 按店铺分组展示商品 -->
            <div
              v-for="storeGroup in cartItemsByStore.filter((group) =>
                group.items.some((item) => item.isSelected)
              )"
              :key="storeGroup.storeId"
              class="store-receipt-group"
            >
              <div class="store-name-header">
                <el-icon><Shop /></el-icon>
                <span>{{ storeGroup.storeName }}</span>
              </div>
              <!-- 收据标题 -->
              <div class="receipt-header">
                <span>商品名称</span>
                <span>单价</span>
                <span>数量</span>
                <span>小计</span>
              </div>

              <!-- 店铺分组下产品数据 -->
              <div
                v-for="item in storeGroup.items.filter(
                  (item) => item.isSelected
                )"
                :key="item.cartItemId"
                class="receipt-item"
              >
                <span class="item-name">{{ item.product.productName }}</span>
                <span class="item-price"
                  >¥{{ item.productPrice.toFixed(2) }}</span
                >
                <span class="item-quantity">{{ item.quantity }}</span>
                <span class="item-subtotal"
                  >¥{{ (item.productPrice * item.quantity).toFixed(2) }}</span
                >
              </div>

              <!-- 店铺小计 -->
              <div class="store-subtotal">
                <span>店铺小计</span>
                <span class="total-price"
                  >¥{{
                    calculateStoreSubtotal(storeGroup.items).toFixed(2)
                  }}</span
                >
              </div>
              <!-- 分割线：不为最后一个时触发 -->
              <el-divider
                class="receipt-divider"
                v-if="
                  storeGroup !==
                  cartItemsByStore
                    .filter((group) =>
                      group.items.some((item) => item.isSelected)
                    )
                    .slice(-1)[0]
                "
              />
            </div>

            <el-divider class="receipt-divider" />

            <!-- 总计 -->
            <div class="receipt-footer">
              <span>订单总计</span>
              <span class="total-price"
                >¥{{ selectedTotalPrice.toFixed(2) }}</span
              >
            </div>
          </div>
        </div>

        <el-divider />
      </div>

      <!-- 确认区域 -->
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="checkoutDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="handleCreateOrder"
            :disabled="!selectedAddressId || selectedItems.length === 0"
          >
            提交订单 (¥{{ selectedTotalPrice.toFixed(2) }})
          </el-button>
        </span>
      </template>
    </el-dialog>
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

import { listAddressByUserId } from "@/api/manage/address";
import { addOrder } from "@/api/manage/order";
import { addOrderDetail } from "@/api/manage/order-detail";

const { proxy } = getCurrentInstance();
const router = useRouter();
const userStore = useUserStore();
const { product_status } = proxy.useDict("product_status");

// 加载状态
const loading = ref(true);
// 对话框加载状态
const dialogLoading = ref(false);

// 原始购物车列表: 购物车项数据 + 关联产品数据
const rawCartItems = ref([]);
// 购物车列表总条数
const totalItems = ref(0);

// 对话框相关状态
const checkoutDialogVisible = ref(false);
const addressList = ref([]); // 用户地址列表
const selectedAddressId = ref(null); // 选中的地址ID

// 新增计算店铺小计的方法
const calculateStoreSubtotal = (items) => {
  return items
    .filter((item) => item.isSelected)
    .reduce((sum, item) => {
      return sum + item.productPrice * item.quantity;
    }, 0);
};

// 计算属性：根据selectedAddressId返回对应的地址对象
const selectedAddress = computed(() => {
  if (!selectedAddressId.value) {
    return null; // 如果没有选中地址ID，返回null
  }
  // 在addressList中查找匹配selectedAddressId的地址对象
  return addressList.value.find(
    (address) => address.addressId === selectedAddressId.value
  );
});

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  userId: userStore.id, // 从store获取用户ID
});

// 记录选中状态发生变化的商品ID
const changedSelectedItemIds = ref(new Set());

// 默认商品图片
const defaultProductImage =
  "https://via.placeholder.com/100x100.png?text=FreshChoice";

// 计算属性：按店铺ID分组的购物车项
// 根据店铺ID为分隔条件的对象数组
// 每个元素包含:storeId、storeName、selected、items
const cartItemsByStore = computed(() => {
  // 构造一个分组对象，店铺ID为键，值为一个封装对象
  const grouped = {};

  // 遍历所有的原始购物车项数据
  rawCartItems.value.forEach((item) => {
    // 跳过没有产品数据的项
    if (!item.product) {
      console.warn("Cart item missing product data:", item);
      return;
    }

    // 获取店铺ID
    const storeId = item.product.storeId;

    // 假如是第一次遇到该组，那么创建该组
    if (!grouped[storeId]) {
      // 封装一个对象成员，元素包含:店铺ID、店铺名称、店铺选中状态、商品项数组
      grouped[storeId] = {
        storeId: storeId,
        storeName: item.product.storeName || "未知店铺",
        selected: false, // 店铺是否全选
        items: [],
      };
    }

    // 为对应组增加商品数据项
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

  // 返回根据店铺ID为分隔条件的对象数组
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
  // 累积计算：对所有选中商品的价格和数量相乘
  return selectedItems.value.reduce((sum, item) => {
    return sum + item.productPrice * item.quantity;
  }, 0);
});

// 计算属性：是否全选 (布尔值)
const isAllSelected = computed({
  // getter 方法：判断是否全选
  get() {
    // 返回条件：购物车有商品且所有商品都被选中
    return (
      rawCartItems.value.length > 0 &&
      rawCartItems.value.every(
        (item) => item.isSelected === 1 || item.isSelected === true
      )
    );
  },
  // setter 方法：处理全选/全不选操作
  set(value) {
    handleSelectAllItems(value); // 调用全选处理方法
  },
});

/** 获取购物车列表 */
async function getCartList() {
  loading.value = true;
  try {
    const response = await listCartItem(queryParams);
    if (response.code === 200) {
      // 返回数据必定携带isSelected项(布尔值)
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
  // 检验商品状态
  if (item.product.productStatus !== 0) {
    ElMessage.warning("该商品已下架或无法购买");
    item.quantity = oldValue; // 恢复旧值
    return;
  }
  // 数量限制
  if (currentValue > item.product.stock) {
    ElMessage.warning(`最多可购买 ${item.product.stock} 件`);
    item.quantity = item.product.stock;
    // 修正后可能需要重新计算总价等，或者由isSelected状态变化触发
  }

  // 找到原始数据中对应的VO对象
  const originalItem = rawCartItems.value.find(
    (i) => i.cartItemId === item.cartItemId
  );

  if (!originalItem) {
    ElMessage.error("更新数量时发生错误：找不到对应商品");
    // 恢复视图上的旧值
    item.quantity = oldValue;
    return;
  }

  // 调用API更新后端数量
  try {
    const response = await updateCartItem({
      cartItemId: item.cartItemId, // 使用传递进来的item的ID
      quantity: currentValue, // 使用修正后的currentValue
    });
    if (response.code !== 200) {
      ElMessage.error(response.msg || "更新数量失败");
      // 失败则恢复原始数据中的数量
      originalItem.quantity = oldValue;
      // 同时恢复视图上的数量，因为API失败了
      item.quantity = oldValue;
    } else {
      // 更新成功后，更新原始数据中的数量
      originalItem.quantity = currentValue;
      // 视图上的数量因为v-model绑定到item.quantity，已经是最新的currentValue了
      ElMessage.success("数量已更新"); // 可选：成功提示
    }
  } catch (error) {
    console.error("Error updating quantity:", error);
    ElMessage.error("更新数量时发生错误");
    // 发生错误则恢复原始数据中的数量
    originalItem.quantity = oldValue;
    // 同时恢复视图上的数量
    item.quantity = oldValue;
  }
}

/** 处理单个商品选中状态变更 */
async function handleItemSelectionChange(changedItem) {
  // 找到对应VO
  const itemInRaw = rawCartItems.value.find(
    (i) => i.cartItemId === changedItem.cartItemId
  );

  // 更新原始数据的选中状态
  if (itemInRaw) {
    itemInRaw.isSelected = changedItem.isSelected;

    if (changedSelectedItemIds.value.has(changedItem.cartItemId)) {
      changedSelectedItemIds.value.delete(changedItem.cartItemId);
    } else {
      changedSelectedItemIds.value.add(changedItem.cartItemId);
    }
  }
}

/** 处理店铺全选/全不选 */
async function handleSelectStore(storeGroup) {
  // 获取当前最新选中状态
  const newSelectionState = storeGroup.selected;

  // 更新原始数据，计算属性将同步计算
  storeGroup.items.forEach((itemFromStoreGroup) => {
    // 找到原始数据中对应的VO对象
    const rawItem = rawCartItems.value.find(
      (ri) => ri.cartItemId === itemFromStoreGroup.cartItemId
    );
    // 更新原始数据的选中状态
    if (rawItem && rawItem.isSelected !== newSelectionState) {
      rawItem.isSelected = newSelectionState;
      // 更新changedSelectedItemIds
      if (changedSelectedItemIds.value.has(rawItem.cartItemId)) {
        changedSelectedItemIds.value.delete(rawItem.cartItemId);
      } else {
        changedSelectedItemIds.value.add(rawItem.cartItemId);
      }
    }
  });
}

/** 处理全选/全不选所有商品 */
async function handleSelectAllItems(value) {
  // value来自于计算属性设置值的传递
  const newSelectionState = value;

  // 将所有产品的选中状态和isAllSelected同步
  rawCartItems.value.forEach((item) => {
    if (item.isSelected !== newSelectionState) {
      item.isSelected = newSelectionState;

      // 更新changedSelectedItemIds
      // 假如已经改变了，那么现在没改变，应该删除；反之应当添加
      if (changedSelectedItemIds.value.has(item.cartItemId)) {
        changedSelectedItemIds.value.delete(item.cartItemId);
      } else {
        changedSelectedItemIds.value.add(item.cartItemId);
      }
    }
  });
  // 根据店铺ID分组的购物车项也会重新计算
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
            ElMessage.error(`清空商品ID ${id} 失败: ${response.msg}`);
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
  await syncSelectedItemsWithBackend(); // 结算前同步状态
  if (selectedItems.value.length === 0) {
    ElMessage.warning("请至少选择一件商品进行结算");
    return;
  }
  // 打开订单确认对话框
  checkoutDialogVisible.value = true;
  // 获取地址列表
  getAddresses();
}

/** 去购物 */
function goShopping() {
  router.push({ path: "/main/browse/index" }); // 假设商品浏览页路由
}

/** 跳转到商品详情 */
function goToProductDetail(productId) {
  router.push({ path: `/main/browse/${productId}` });
}

/** 跳转到店铺 */
function goToStore(storeId) {
  router.push({ path: `/myStore/storefront/${storeId}` }); // 假设店铺页路由
}

/** 同步选中状态到后端 */
// 同步时机：删除行为、后端获取列表
async function syncSelectedItemsWithBackend() {
  if (changedSelectedItemIds.value.size === 0) {
    return; // 没有需要同步的变更
  }

  loading.value = true;
  // 转换为同步数组
  const itemsToSync = Array.from(changedSelectedItemIds.value);
  let successCount = 0;

  try {
    for (const cartItemId of itemsToSync) {
      // 找到对应的原始数据项
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
        }
      }
    }

    if (successCount > 0 && successCount === itemsToSync.length) {
      ElMessage.success("购物车选中状态已同步"); // 可选的成功提示
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

/** 获取用户地址列表 */
async function getAddresses() {
  dialogLoading.value = true;
  try {
    const response = await listAddressByUserId(userStore.id);
    if (response.code === 200) {
      addressList.value = response.rows;
      // 默认选中第一个地址或用户设置的默认地址
      if (addressList.value.length > 0) {
        const defaultAddress = addressList.value.find((addr) => addr.isDefault);
        selectedAddressId.value = defaultAddress
          ? defaultAddress.addressId
          : addressList.value[0].addressId;
      } else {
        selectedAddressId.value = null;
      }
    } else {
      ElMessage.error(response.msg || "获取地址失败");
      addressList.value = [];
      selectedAddressId.value = null;
    }
  } catch (error) {
    console.error("Error fetching addresses:", error);
    ElMessage.error("获取地址时发生错误");
    addressList.value = [];
    selectedAddressId.value = null;
  }
  dialogLoading.value = false;
}

/** 跳转到地址管理页面 */
function goToAddressManagement() {
  // TODO: 确认地址管理页面的路由路径
  router.push({ path: "/manage/address" }); // 假设地址管理页面的路由是 /manage/address
}

/** 创建订单 */
async function handleCreateOrder() {
  // 校验地址和订单合法
  if (!selectedAddressId.value) {
    ElMessage.warning("请选择收货地址");
    return;
  }
  if (selectedItems.value.length === 0) {
    ElMessage.warning("没有选中商品，无法创建订单");
    return;
  }

  // [一个店铺创建一个订单，订单所包含的每项商品都要用于创建订单详情项]

  // 遍历所有的分组，得到包含选中商品的的店铺分组storeGroups
  const storeGroups = cartItemsByStore.value.filter((group) =>
    group.items.some((item) => item.isSelected)
  );

  // 使用 selectedAddress.value 获取选中地址对象
  const address = selectedAddress.value;
  if (!address) {
    ElMessage.error("获取选中地址信息失败");
  }

  dialogLoading.value = true;
  const orderCreationPromises = []; // 用于存储创建订单的Promise

  //遍历会产生订单的分组
  for (const group of storeGroups) {
    // 产生一个订单
    const orderData = {
      userId: userStore.id,
      storeId: group.storeId,
      addressId: selectedAddressId.value,
      totalAmount: calculateStoreSubtotal(group.items).toFixed(2),
      provinceSnapshot: address.province,
      citySnapshot: address.city,
      districtSnapshot: address.district,
      detailAddressSnapshot: address.detailAddress,
      receiverSnapshot: address.consignee,
      contactSnapshot: address.contact,
      params: {
        parent: false,
      },
    };

    // 将订单创建的Promise添加到数组中
    orderCreationPromises.push(
      (async () => {
        try {
          const orderRes = await addOrder(orderData);
          if (orderRes.code === 200) {
            const detailCreationPromises = []; // 用于存储创建订单详情的Promise
            
            // 为每个选中商品创建订单详情
            for (const item of group.items) {
              if (item.isSelected) {
                detailCreationPromises.push(
                  addOrderDetail({
                    orderId: orderRes.data,
                    productIdSnapshot: item.productId,
                    productNameSnapshot: item.productName,
                    quantity: item.quantity,
                    totalAmount: item.quantity * item.product.price,
                    priceUnitSnapshot: item.product.priceUnit,
                    productPriceSnapshot: item.product.price,
                  }).catch((detailError) => {
                    console.error("Error adding order detail:", detailError);
                    ElMessage.error(
                      `添加商品 "${item.product.productName}" 订单详情失败`
                    );
                    // 可以选择在这里处理单个详情失败的逻辑，例如标记订单为异常
                  })
                );
              }
            }
            // 等待当前订单的所有订单详情创建完成
            await Promise.all(detailCreationPromises);
            ElMessage.success(`店铺 "${group.storeName}" 订单创建成功！`); // 可以按店铺提示成功
          } else {
            ElMessage.error(
              orderRes.msg || `店铺 "${group.storeName}" 订单创建失败`
            );
            // 可以选择在这里处理单个订单失败的逻辑
          }
        } catch (orderError) {
          console.error("Error creating order:", orderError);
          ElMessage.error(`创建店铺 "${group.storeName}" 订单时发生错误`);
          // 可以选择在这里处理单个订单创建错误的逻辑
        }
      })() // 立即执行 async 函数并返回 Promise
    );
  }

  // 等待所有店铺的订单创建完成
  await Promise.all(orderCreationPromises);

  dialogLoading.value = false;
  ElMessage.success("所有选中商品订单已提交！"); // 所有订单都处理完毕后的总提示
}

/** 对话框关闭时的回调 */
function handleCheckoutDialogClosed() {
  // 重置对话框相关状态
  selectedAddressId.value = null;
  addressList.value = [];
  dialogLoading.value = false;
}

// 生命周期钩子：组件卸载前执行
onBeforeUnmount(async () => {
  // 在组件卸载前，同步当前页面上发生的选中状态变化
  await syncSelectedItemsWithBackend();
  // 移除 beforeunload 监听器
  window.removeEventListener("beforeunload", handleBeforeUnload);
});

// 生命周期钩子：组件挂载后执行
onMounted(async () => {
  // 在组件挂载后，先尝试同步上次未完成的选中状态变化（如果存在）
  await syncSelectedItemsWithBackend();
  // 然后获取最新的购物车列表，其中应包含后端已保存的选中状态
  getCartList();
  // 添加 beforeunload 监听器
  window.addEventListener("beforeunload", handleBeforeUnload);
});

// 处理页面卸载或刷新前的同步
async function handleBeforeUnload(event) {
  // 只有当有未同步的选中状态变化时才进行同步
  if (changedSelectedItemIds.value.size > 0) {
    // 阻止默认的页面卸载行为，以便有时间发送同步请求
    // event.preventDefault(); // 注意：现代浏览器可能不支持阻止卸载
    // event.returnValue = ''; // 兼容旧版浏览器

    // 尝试发送同步请求，但不等待结果，因为页面即将卸载
    // 使用 navigator.sendBeacon 或 keepalive fetch 可以在页面卸载时发送请求
    // 这里为了简单，直接调用同步函数，但不能保证请求一定成功
    console.log("页面卸载前同步选中状态...");
    await syncSelectedItemsWithBackend();
  }
}
</script>

<style lang="scss" scoped>
.my-cart-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 84px); // 减去头部高度

  .cart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;

    h2 {
      margin: 0;
      font-size: 24px;
      color: #333;
    }
  }

  .cart-content {
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .cart-summary-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 15px 0;
      border-bottom: 1px solid #eee;
      margin-bottom: 20px;

      .summary-info {
        flex-grow: 1;
        text-align: right;
        margin-right: 20px;
        font-size: 16px;
        color: #666;

        .total-price-display {
          margin-left: 20px;
          font-size: 18px;
          color: #333;

          .price-value {
            color: #f56c6c;
            font-weight: bold;
          }
        }
      }

      .checkout-button {
        padding: 0 30px;
      }
    }

    .store-group {
      margin-bottom: 30px;
      border: 1px solid #ebeef5;
      border-radius: 4px;
      overflow: hidden;

      .store-header {
        display: flex;
        align-items: center;
        padding: 10px 15px;
        background-color: #f9fafc;
        border-bottom: 1px solid #ebeef5;
        font-weight: bold;
        color: #333;

        .el-checkbox {
          margin-right: 10px;
        }

        .el-icon {
          margin-right: 5px;
        }

        .store-name {
          cursor: pointer;
          &:hover {
            color: #409eff;
          }
        }
      }

      .cart-items-list {
        .cart-item-card {
          margin: 0;
          border: none;
          border-bottom: 1px solid #ebeef5;
          &:last-child {
            border-bottom: none;
          }

          .el-card__body {
            padding: 15px;
          }

          .cart-item {
            display: flex;
            align-items: center;

            .item-checkbox {
              margin-right: 15px;
            }

            .product-image {
              width: 80px;
              height: 80px;
              border-radius: 4px;
              margin-right: 15px;
              flex-shrink: 0;
              cursor: pointer;

              .image-slot {
                display: flex;
                justify-content: center;
                align-items: center;
                width: 100%;
                height: 100%;
                background: var(--el-fill-color-light);
                color: var(--el-text-color-secondary);
                font-size: 30px;
              }
            }

            .product-info {
              flex-grow: 1;
              margin-right: 15px;

              .product-name {
                font-size: 16px;
                color: #333;
                margin-bottom: 5px;
                cursor: pointer;
                &:hover {
                  color: #409eff;
                }
              }

              .product-specs {
                font-size: 13px;
                color: #999;
                margin-bottom: 5px;
              }
              .product-status {
                font-size: 13px;
                color: #999;
              }
            }

            .unit-price {
              width: 80px;
              text-align: center;
              font-size: 15px;
              color: #f56c6c;
              font-weight: bold;
              flex-shrink: 0;
            }

            .quantity-control {
              width: 120px;
              text-align: center;
              flex-shrink: 0;
            }

            .item-subtotal {
              width: 100px;
              text-align: center;
              font-size: 16px;
              color: #f56c6c;
              font-weight: bold;
              flex-shrink: 0;
            }

            .item-actions {
              width: 100px;
              text-align: center;
              flex-shrink: 0;

              .el-button {
                margin: 0 5px;
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
}

// 对话框样式
.order-confirm-dialog-content {
  padding: 0 20px; // 调整对话框内容整体内边距

  h3 {
    margin-top: 0;
    margin-bottom: 15px;
    font-size: 18px;
    color: #333;
  }

  .address-section {
    padding: 0; // 移除address-section自身的内边距，由内部item控制

    .address-radio-group {
      display: flex;
      flex-direction: column;
      gap: 12px; // 增加地址卡片之间的垂直间距
    }

    .address-radio-item {
      padding: 15px 20px; // 增加地址卡片内边距
      margin: 0; // 移除margin，使用gap控制间距
      border-radius: 8px;
      border: 1px solid #ebeef5;
      background: #f8f9fa;
      transition: all 0.2s ease-in-out; // 添加平滑过渡效果
      cursor: pointer; // 添加手型光标
      width: 100%; // 使地址卡片宽度一致，占满父容器
      box-sizing: border-box; // 边框和内边距包含在宽度内
      min-height: 70px; // 设置最小高度，确保基本信息能显示

      &:hover {
        border-color: #409eff;
        box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
      }

      // 调整el-radio内部元素的对齐和间距
      :deep(.el-radio__input) {
        vertical-align: top; // 使radio按钮与内容顶部对齐
        margin-top: 4px; // 微调位置
      }

      :deep(.el-radio__label) {
        padding-left: 15px; // 增加radio按钮和内容之间的间距
        display: flex; // 使用flex布局控制label内容
        align-items: flex-start; // 内容顶部对齐
        white-space: normal; // 允许文本换行
        flex-grow: 1; // 允许内容区域填充剩余空间
        overflow: hidden; // 防止内容溢出label区域
      }

      .address-info-content {
        display: flex;
        flex-direction: column;
        gap: 6px; // 调整信息行之间的垂直间距
        flex-grow: 1; // 允许内容区域填充剩余空间
        overflow: hidden; // 防止内容溢出info-content区域

        .consignee-phone {
          font-size: 15px;
          font-weight: 500;
          color: #303133;
          display: flex;
          align-items: center; // 垂直居中对齐
          gap: 10px; // 调整姓名和电话之间的间距
          word-break: break-word; // 允许长文本换行
          overflow: hidden; // 防止内容溢出

          &::before {
            content: "👤"; // 添加人物图标
            font-size: 14px;
            color: #606266; // 图标颜色
            flex-shrink: 0; // 防止图标被压缩
          }
        }
        .detail-address {
          font-size: 13px;
          color: #606266;
          line-height: 1.6; // 调整行高
          padding-left: 24px; // 为图标留出空间
          position: relative;
          word-break: break-word; // 允许长文本换行
          overflow: hidden; // 防止内容溢出

          &::before {
            content: "📍"; // 添加定位图标
            position: absolute;
            left: 0;
            top: 1px; // 微调位置
            font-size: 14px;
            color: #606266; // 图标颜色
          }
        }
      }
    }

    .empty-address-state {
      text-align: center;
      .el-empty {
        padding: 20px 0;
      }
      .el-button {
        margin-top: 15px;
        width: 100%;
        padding: 12px 0;
      }
    }
  }

  .items-overview-section {
    .receipt-style-list {
      border: 1px dashed #ccc;
      padding: 15px;
      font-family: monospace;
      font-size: 14px;
      background-color: #fff;

      .store-receipt-group {
        margin-bottom: 20px; // 增加店铺组之间的间距

        .store-name-header {
          font-weight: bold;
          margin-bottom: 10px;
          font-size: 15px;
          color: #333;
          display: flex;
          align-items: center;
          gap: 5px;
        }
      }

      .receipt-header,
      .receipt-item,
      .store-subtotal,
      .receipt-footer {
        display: flex;
        justify-content: space-between;
        padding: 5px 0;
      }

      .receipt-header {
        font-weight: bold;
        border-bottom: 1px dashed #ccc;
        margin-bottom: 8px;
        color: #333;

        span {
          flex: 1; // 允许所有列伸缩
          text-align: left;
          // 调整flex-basis和max-width来控制列宽，确保对齐但不强制固定
          &:nth-child(1) {
            // 商品名称
            flex: 2; // 给予更多空间
            max-width: 50%; // 限制最大宽度，避免过长
          }
          &:nth-child(2) {
            // 单价
            flex: 1;
            text-align: right;
            max-width: 20%;
          }
          &:nth-child(3) {
            // 数量
            flex: 0 0 15%; // 固定数量列宽度，确保对齐
            text-align: right;
          }
          &:nth-child(4) {
            // 小计
            flex: 1;
            text-align: right;
            max-width: 25%;
          }
        }
      }

      .receipt-item {
        border-bottom: 1px dashed #eee;
        &:last-child {
          border-bottom: none;
        }

        .item-name {
          flex: 2;
          text-align: left;
          word-break: break-word;
          max-width: 50%;
        }
        .item-price {
          flex: 1;
          text-align: right;
          color: #f56c6c;
          max-width: 20%;
        }
        .item-quantity {
          flex: 0 0 15%;
          text-align: right;
        } // 固定数量列宽度
        .item-subtotal {
          flex: 1;
          text-align: right;
          font-weight: bold;
          color: #f56c6c;
          max-width: 25%;
        }
      }

      .store-subtotal {
        font-weight: bold;
        margin-top: 10px;
        border-top: 1px dashed #ccc;
        padding-top: 8px;
        color: #333;
        justify-content: flex-end; // 右对齐
        gap: 20px; // 调整文字和金额间距

        .total-price {
          color: #f56c6c;
        }
      }

      .receipt-divider {
        border-style: dashed;
        margin: 15px 0;
      }

      .receipt-footer {
        display: flex;
        justify-content: space-between;
        font-weight: bold;
        font-size: 16px;
        padding-top: 8px;

        .total-price {
          color: #f56c6c;
        }
      }
    }
  }

  .other-info-section {
    // TODO: 添加支付方式选择等
    padding: 0 15px; // 添加内边距
    h3 {
      margin-bottom: 15px;
    }
    p {
      font-size: 14px;
      color: #606266;
    }
  }
}

.dialog-footer {
  text-align: right;
}
</style>
