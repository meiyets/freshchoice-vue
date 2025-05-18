<template>
  <div class="app-container my-favorite-page">
    <!-- 搜索与筛选区域 -->
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      v-show="showSearch"
      label-width="88px"
    >
      <!-- 搜索项 -->
      <el-form-item label="产品名称" prop="productName">
        <el-input
          v-model="queryParams.params.productName"
          placeholder="请输入产品名称"
          clearable
          style="width: 190px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="店铺名称" prop="storeName">
        <el-input
          v-model="queryParams.params.storeName"
          placeholder="请输入店铺名称"
          clearable
          style="width: 190px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="排序方式" prop="orderBy">
        <el-select
          v-model="queryParams.params.orderBy"
          placeholder="请选择排序方式"
          clearable
          style="width: 180px"
          @change="handleQuery"
        >
          <el-option label="按收藏时间" value="f.create_time" />
          <el-option label="按价格" value="p.price" />
          <el-option label="按评分" value="p.avg_rating" />
        </el-select>
      </el-form-item>
      <el-form-item label="排序顺序" prop="isDesc">
        <el-select
          v-model="queryParams.params.isDesc"
          placeholder="请选择排序顺序"
          clearable
          style="width: 180px"
          @change="handleQuery"
        >
          <el-option label="升序" value="false" />
          <el-option label="降序" value="true" />
        </el-select>
      </el-form-item>

      <!-- 搜索按钮 -->
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮区域 -->
    <el-row :gutter="10" class="mb8" >
      <!-- 批量取消收藏 -->
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleBatchCancelFavorite"
          >批量取消收藏</el-button
        >
      </el-col>

      <right-toolbar
        v-model:showSearch="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <!-- 收藏为空时的默认状态 -->
    <div v-if="favoriteList.length === 0 && !loading" class="empty-favorites">
      <el-empty description="暂无收藏商品" />
    </div>

    <!-- 收藏列表区域 - 网格布局 -->
    <el-row :gutter="20" v-loading="loading" v-else>
      <el-col
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
        v-for="item in favoriteList"
        :key="item.favoriteId"
        class="favorite-card-col"
      >
        <el-card
          :body-style="{ padding: '0px' }"
          shadow="hover"
          class="favorite-card"
        >
          <!-- 复选框 -->
          <div class="favorite-card-checkbox">
            <el-checkbox
              v-model="item.selected"
              @change="handleItemSelectionChange(item.favoriteId)"
            ></el-checkbox>
          </div>

          <!-- 上篇图片 -->
          <el-image
            :src="item.productVO.mainImg || defaultImage"
            class="favorite-image"
            fit="cover"
            @click="handleViewDetails(item.productVO.productId)"
          >
            <template #error>
              <div class="image-slot">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>

          <!-- 商品信息 -->
          <div style="padding: 14px">
            <!-- 产品名称 -->
            <h4
              class="product-name"
              @click="handleViewDetails(item.productVO.productId)"
            >
              {{ item.productVO.productName }}
            </h4>

            <!-- 价格 -->
            <div class="product-price">
              <span class="price-currency">¥</span>
              <span class="price-amount">{{
                item.productVO.price.toFixed(2)
              }}</span>
              <span class="price-unit">/{{ item.productVO.priceUnit }}</span>
            </div>

            <!-- 规格 -->
            <div class="product-spec">
              规格: {{ item.productVO.specificationValue
              }}{{ item.productVO.specificationUnit }}
            </div>

            <!-- 店铺名称 -->
            <div
              class="store-info"
              @click="handleViewStore(item.productVO.storeId)"
            >
              <el-icon><Shop /></el-icon> {{ item.productVO.storeName }}
            </div>

            <div class="product-status">
              <!-- 产品状态 -->
              <dict-tag
                :options="product_status"
                :value="item.productVO.productStatus"
              />

              <!-- 库存相关标识 -->
              <el-tag
                v-if="item.productVO.stock <= 0"
                type="info"
                size="small"
                effect="light"
                style="margin-left: 5px"
                >已售罄</el-tag
              >
              <el-tag
                v-else-if="item.productVO.stock <= item.productVO.stockAlert"
                type="warning"
                size="small"
                effect="light"
                style="margin-left: 5px"
                >库存紧张</el-tag
              >
            </div>

            <!-- 评分与评价 -->
            <div class="product-rating">
              <el-rate
                v-model="item.productVO.avgRating"
                disabled
                show-score
                text-color="#ff9900"
                score-template="{value} 分"
                size="small"
              />
              <span class="review-count"
                >({{ item.productVO.reviewCount }}条评价)</span
              >
            </div>

            <!-- 产品标签 -->
            <div
              class="product-tags"
              v-if="item.productVO.tags && item.productVO.tags.length"
            >
              <el-tag
                v-for="(tag, index) in item.productVO.tags.slice(0, 3)"
                :key="tag.tagId"
                :type="tagType[index % tagType.length]"
                size="small"
                effect="dark"
                class="tag-item"
              >
                {{ tag.tagName }}
              </el-tag>
            </div>

            <div class="card-actions">
              <!-- 按钮：查看详情 -->
              <el-button
                type="primary"
                link
                icon="View"
                @click="handleViewDetails(item.productVO.productId)"
                >查看详情</el-button
              >

              <!-- 按钮：取消收藏 -->
              <el-button
                type="danger"
                link
                icon="StarFilled"
                @click="
                  handleCancelFavorite(
                    item.favoriteId,
                    item.productVO.productName
                  )
                "
                >取消收藏</el-button
              >
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 分页组件 -->
    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script setup name="MyFavorite">
import { ref, reactive, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { listFavorite, delFavorite } from "@/api/manage/favorite";
import { ElMessage, ElMessageBox } from "element-plus";
import useUserStore from "@/store/modules/user";
import { getDicts } from "@/api/system/dict/data"; // 引入字典

// 图片加载失败时的默认图片
const defaultImage = ref(
  "https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png"
);

const router = useRouter();
const userStore = useUserStore();

const { proxy } = getCurrentInstance();
const { product_status } = proxy.useDict("product_status");

// 加载状态
const loading = ref(true);
// 是否显示搜索
const showSearch = ref(true);
// 总条数
const total = ref(0);
// 收藏列表数据
const favoriteList = ref([]);
// 选中数组的ID
const ids = ref([]);
// 非多个禁用
const multiple = ref(true);

// 标签样式
const tagType = ["primary", "success", "info", "warning", "danger"];

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 12, // 网格布局，每行4个，显示3行
  userId: userStore.id, // 当前用户ID
  params: {
    productName: undefined,
    storeName: undefined,
    orderBy: "f.create_time", // 默认按收藏时间排序
    isDesc: 'true', // 默认降序
  }
});

/** 查询收藏列表 */
function getList() {
  loading.value = true;
  listFavorite(queryParams)
    .then((response) => {
      if (response.code === 200) {
        favoriteList.value = response.rows.map((item) => ({
          ...item,
          selected: false,
        }));
        total.value = response.total;
      } else {
        ElMessage.error(response.msg || "获取收藏列表失败");
        favoriteList.value = [];
        total.value = 0;
      }
      loading.value = false;
    })
    .catch(() => {
      loading.value = false;
      favoriteList.value = [];
      total.value = 0;
      ElMessage.error("网络错误，获取收藏列表失败");
    });
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  queryParams.productName = undefined;
  queryParams.storeName = undefined;
  queryParams.orderBy = "createTime";
  queryParams.isAsc = "desc";
  handleQuery();
}

/** 处理单个收藏项选中状态改变 */
function handleItemSelectionChange(favoriteId) {
  // 找到对应的收藏项
  const item = favoriteList.value.find((fav) => fav.favoriteId === favoriteId);

  if (item) {
    if (item.selected) {
      // 如果已经选中，添加到ids中
      if (!ids.value.includes(favoriteId)) {
        ids.value.push(favoriteId);
      }
    } else {
      // 如果没有选中，从ids中过滤
      ids.value = ids.value.filter((id) => id !== favoriteId);
    }
  }
  multiple.value = !ids.value.length;
}

/** 批量取消收藏操作 */
function handleBatchCancelFavorite() {
  const favoriteIds = ids.value;
  if (favoriteIds.length === 0) {
    ElMessage.warning("请选择要取消收藏的商品");
    return;
  }
  ElMessageBox.confirm(
    `是否确认取消收藏选中的 ${favoriteIds.length} 个商品？`,
    "系统提示",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  )
    .then(() => {
      return delFavorite(favoriteIds.join(",")); // API需要逗号分隔的字符串或数组，根据API调整
    })
    .then((response) => {
      if (response.code === 200) {
        ElMessage.success("批量取消收藏成功");
        getList();
        ids.value = []; // 清空选中
        multiple.value = true;
      } else {
        ElMessage.error(response.msg || "批量取消收藏失败");
      }
    })
    .catch(() => {});
}

/** 取消收藏操作 */
function handleCancelFavorite(favoriteId, productName) {
  // 确认框
  ElMessageBox.confirm(`是否确认取消收藏商品 "${productName}" ？`, "系统提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      return delFavorite(favoriteId);
    })
    .then((response) => {
      if (response.code === 200) {
        ElMessage.success("取消收藏成功");
        getList();
      } else {
        ElMessage.error(response.msg || "取消收藏失败");
      }
    })
    .catch(() => {});
}

/** 查看商品详情 */
function handleViewDetails(productId) {
  router.push({ path: `/main/browse/${productId}` }); // 假设路由是 /product/detail/:id
}

/** 查看店铺 */
function handleViewStore(storeId) {
  router.push({ path: `/myStore/storefront/${storeId}` });
}

// 组件挂载时获取数据
onMounted(() => {
  getList();
});
</script>

<style scoped>
.my-favorite-page {
  padding: 20px;
}

.mb8 {
  margin-bottom: 8px;
}

.favorite-card-col {
  margin-bottom: 20px;
}

.favorite-card {
  border-radius: 8px;
  overflow: hidden; /* 确保图片圆角生效 */
  transition: all 0.3s ease;
  position: relative; /* 为了复选框定位 */
}

.favorite-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.favorite-card-checkbox {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  padding: 2px;
}

.favorite-image {
  width: 100%;
  height: 200px; /* 固定高度，可根据需要调整 */
  display: block;
  cursor: pointer;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
  font-size: 30px;
}

.product-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.product-price {
  font-size: 18px;
  color: #ff4d4f;
  margin-bottom: 8px;
}

.price-currency {
  font-size: 14px;
  margin-right: 2px;
}
.price-amount {
  font-weight: bold;
}
.price-unit {
  font-size: 12px;
  color: #666;
  margin-left: 2px;
}

.product-spec {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.store-info {
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.store-info .el-icon {
  margin-right: 4px;
}

.product-status {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.product-rating {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.product-rating .el-rate {
  margin-right: 5px;
}

.review-count {
  font-size: 12px;
  color: #909399;
}

.product-tags {
  margin-bottom: 12px;
}

.tag-item {
  margin-right: 5px;
  margin-bottom: 5px;
}

.card-actions {
  border-top: 1px solid #ebeef5;
  padding-top: 10px;
  margin-top: 10px;
  display: flex;
  justify-content: space-around; /* 或者 space-between */
}

.empty-favorites {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px; /* 确保在内容少时也能撑起一定高度 */
}

/* 响应式调整 */
@media (max-width: 768px) {
  .favorite-image {
    height: 180px;
  }
  .product-name {
    font-size: 15px;
  }
  .product-price {
    font-size: 16px;
  }
}

@media (max-width: 576px) {
  .favorite-card-col {
    /* 在小屏幕上，可以考虑每行只显示一个或两个 */
  }
  .favorite-image {
    height: 160px;
  }
  .el-form-item {
    width: 100%; /* 让搜索项在小屏幕上堆叠 */
  }
  .el-select {
    width: 100%;
  }
}
</style>
