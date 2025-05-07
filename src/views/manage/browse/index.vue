<template>
  <div class="product-browse-container">
    <!-- 搜索条件区域 -->
    <div class="search-area">
      <el-form
        :model="queryParams"
        ref="queryRef"
        :inline="true"
        label-width="80px"
      >
        <!-- 产品名称搜索 -->
        <el-form-item label="产品名称" prop="productName">
          <el-input
            v-model="queryParams.productName"
            placeholder="请输入产品名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <!-- 店铺名称搜索 -->
        <el-form-item label="店铺名称" prop="storeName">
          <el-input
            v-model="queryParams.storeName"
            placeholder="请输入店铺名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <!-- 价格区间搜索 -->
        <el-form-item label="价格区间" prop="priceRange">
          <el-input-number
            v-model="queryParams.minPrice"
            :min="0"
            :precision="2"
            placeholder="最低价"
            style="width: 120px"
          />
          <span class="price-separator">-</span>
          <el-input-number
            v-model="queryParams.maxPrice"
            :min="0"
            :precision="2"
            placeholder="最高价"
            style="width: 120px"
          />
        </el-form-item>

        <!-- 分类选择 -->
        <el-form-item label="产品分类" prop="categoryId">
          <el-select
            v-model="queryParams.categoryId"
            placeholder="请选择分类"
            clearable
          >
            <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <!-- 标签多选 -->
        <el-form-item label="产品标签" prop="tagIds">
          <el-select
            v-model="queryParams.tagIds"
            multiple
            collapse-tags
            collapse-tags-tooltip
            placeholder="请选择标签"
            style="width: 240px"
          >
            <el-option
              v-for="item in tagOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <!-- 搜索按钮 -->
        <el-form-item>
          <el-button type="primary" @click="handleQuery">
            <el-icon><search /></el-icon> 搜索
          </el-button>
          <el-button @click="resetQuery">
            <el-icon><refresh /></el-icon> 重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 排序和工具栏 -->
    <div class="toolbar">
      <div class="sort-options">
        <span class="sort-label">排序方式：</span>
        <el-radio-group v-model="sortOption" @change="handleSortChange">
          <el-radio-button label="price">规格价格</el-radio-button>
          <el-radio-button label="unitPrice">单位价格</el-radio-button>
          <el-radio-button label="sales">销量</el-radio-button>
          <el-radio-button label="createTime">上架时间</el-radio-button>
          <el-radio-button label="rating">评分</el-radio-button>
        </el-radio-group>
        <el-switch
          v-model="sortDesc"
          active-text="降序"
          inactive-text="升序"
          @change="handleSortChange"
          style="margin-left: 10px"
        />
      </div>
    </div>

    <!-- 产品网格展示区域 -->
    <div class="product-grid" v-loading="loading">
      <el-empty v-if="productList.length === 0" description="暂无数据" />
      <el-row :gutter="20">
        <!-- 布局配置 -->
        <el-col
          v-for="(item, index) in productList"
          :key="index"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
          :xl="4"
        >
          <div class="product-card" @click="handleViewDetail(item)">
            <!-- 产品图片 -->
            <div class="product-img">
              <el-image
                :src="item.mainImg"
                fit="cover"
                :preview-src-list="[item.mainImg]"
                loading="lazy"
              >
                <!-- 产品图片报错 -->
                <template #error>
                  <div class="image-error">
                    <el-icon><picture-filled /></el-icon>
                  </div>
                </template>
              </el-image>

              <!-- 产品状态 -->
              <div class="product-status" v-if="item.productStatus !== 0">
                <el-tag type="danger" v-if="item.productStatus === 2"
                  >售罄</el-tag
                >
                <el-tag type="info" v-else-if="item.productStatus === 1"
                  >已下架</el-tag
                >
              </div>
            </div>

            <!-- 产品信息 -->
            <div class="product-info">
              <h3 class="product-name" :title="item.productName">
                {{ item.productName }}
              </h3>
              <!-- 店铺名称显示 -->
              <div
                class="product-store"
                @click.stop="handleViewStore(item.storeId)"
              >
                <el-icon><shop /></el-icon>
                <span>{{ item.storeName }}</span>
              </div>

              <!-- 产品规格 规格值/规格单位 -->
              <div class="product-spec">
                {{ item.specificationValue }}{{ item.specificationUnit }}/{{
                  item.priceUnit
                }}
              </div>

              <!-- 产品价格  -->
              <div class="product-price-row">
                <div class="product-price">¥{{ item.price.toFixed(2) }}</div>
                <div class="product-unit-price" v-if="item.unitPrice">
                  ¥{{ item.unitPrice.toFixed(2) }}/{{ item.specificationUnit }}
                </div>
              </div>

              <!-- 产品平均评分 -->
              <div class="product-rating">
                <el-rate
                  v-model="item.avgRating"
                  disabled
                  text-color="#ff9900"
                  score-template="{value}"
                />
                <span class="review-count">({{ item.reviewCount }})</span>
              </div>

              <!-- 标签展示 -->
              <div class="product-tags">
                <el-tag
                  v-for="(tag, tagIndex) in item.tags"
                  :key="tagIndex"
                  size="small"
                  :type="tagTypes[tagIndex % tagTypes.length]"
                  v-show="tagIndex < 3"
                >
                  {{ tag.tagName }}
                </el-tag>
              </div>

              <!-- 查看详情按钮 -->
              <div class="product-actions">
                <el-button
                  type="primary"
                  size="small"
                  @click.stop="handleViewDetail(item)"
                >
                  查看详情
                </el-button>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 分页组件 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :page-sizes="[8, 16, 24, 32]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
// 导入所需的组件和API
import { ref, reactive, onMounted, computed } from "vue";
import { Search, Refresh, Shop, PictureFilled } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";

// api
import {
  listProduct,
  getProduct,
  addProduct,
  updateProduct,
  delProduct,
} from "@/api/manage/product";

// 路由实例
const router = useRouter();

// 加载状态
const loading = ref(false);

// 产品列表数据
const productList = ref([]);
const total = ref(0);

// 查询参数
const queryParams = reactive({
  productName: "",
  storeName: "",
  minPrice: undefined,
  maxPrice: undefined,
  categoryId: undefined,
  tagIds: [],
  pageNum: 1,
  pageSize: 16,
  orderBy: "createTime",
  isDesc: true,
});

// 排序选项
const sortOption = ref("createTime");
const sortDesc = ref(true);

// 标签类型循环使用
const tagTypes = ["", "success", "warning", "info", "danger"];

// 分类选项（模拟数据，实际应从API获取）
const categoryOptions = ref([
  { value: 1, label: "新鲜水果", icon: "🍎" },
  { value: 2, label: "时令蔬菜", icon: "🥬" },
  { value: 3, label: "肉禽蛋品", icon: "🥩" },
  { value: 4, label: "海鲜水产", icon: "🦐" },
  { value: 5, label: "乳品烘焙", icon: "🥖" },
  { value: 6, label: "粮油调味", icon: "🌾" },
  { value: 7, label: "休闲零食", icon: "🍪" },
  { value: 8, label: "饮品冲调", icon: "🥤" },
]);

// 标签选项（模拟数据，实际应从API获取）
const tagOptions = ref([
  { value: 1, label: "有机认证", type: "success" },
  { value: 2, label: "无农残", type: "success" },
  { value: 3, label: "产地直供", type: "" },
  { value: 4, label: "进口优选", type: "warning" },
  { value: 5, label: "当季特选", type: "" },
  { value: 6, label: "限时特惠", type: "danger" },
  { value: 7, label: "热销爆款", type: "danger" },
  { value: 8, label: "生鲜精选", type: "success" },
  { value: 9, label: "品质保障", type: "info" },
  { value: 10, label: "人气推荐", type: "warning" },
]);

// 查询表单引用
const queryRef = ref(null);

// 获取产品列表数据
const getProductList = async () => {
  loading.value = true;
  try {
    // 这里应该调用实际的API
    listProduct(queryParams).then((res) => {
      if (res.code === 200) {
        productList.value = res.rows;
        total.value = res.total;
      } else {
        ElMessage.error(res.message);
      }
      loading.value = false;
    });
  } catch (error) {
    console.error("获取产品列表失败", error);
    ElMessage.error("获取产品列表失败");
    loading.value = false;
  }
};

// 处理查询
const handleQuery = () => {
  // 验证价格区间
  if (
    queryParams.minPrice !== undefined &&
    queryParams.maxPrice !== undefined
  ) {
    if (queryParams.minPrice > queryParams.maxPrice) {
      ElMessage.warning("价格区间设置有误，最低价不能大于最高价");
      return;
    }
  }
  queryParams.pageNum = 1;
  getProductList();
};

// 重置查询
const resetQuery = () => {
  queryRef.value?.resetFields();
  queryParams.minPrice = undefined;
  queryParams.maxPrice = undefined;
  queryParams.tagIds = [];
  queryParams.pageNum = 1;
  sortOption.value = "createTime";
  sortDesc.value = true;
  queryParams.orderBy = "createTime";
  queryParams.isDesc = true;
  getProductList();
};

// 处理排序变化
const handleSortChange = () => {
  queryParams.orderBy = sortOption.value;
  queryParams.isDesc = sortDesc.value;
  getProductList();
};

// 处理页码变化
const handleCurrentChange = (val) => {
  queryParams.pageNum = val;
  getProductList();
};

// 处理每页数量变化
const handleSizeChange = (val) => {
  queryParams.pageSize = val;
  queryParams.pageNum = 1;
  getProductList();
};

// 查看产品详情
const handleViewDetail = (item) => {
  // 跳转到产品详情页
  router.push({
    path: `/product/detail/${item.productId}`,
    query: { from: "browse" },
  });
};

// 查看店铺
const handleViewStore = (storeId) => {
  // 跳转到店铺页面
  router.push({
    path: `/store/${storeId}`,
    query: { from: "browse" },
  });
};

// 初始化
getProductList();

</script>

<style scoped>
.product-browse-container {
  padding: 20px;
}

.search-area {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.price-separator {
  margin: 0 5px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  padding: 15px 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.sort-options {
  display: flex;
  align-items: center;
}

.sort-label {
  margin-right: 10px;
  color: #606266;
}

.product-grid {
  margin-bottom: 20px;
}

.product-card {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  margin-bottom: 20px;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.product-img {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.product-img .el-image {
  width: 100%;
  height: 100%;
}

.image-error {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 30px;
}

.product-status {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1;
}

.product-info {
  padding: 15px;
}

.product-name {
  margin: 0 0 10px;
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-store {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
  cursor: pointer;
}

.product-store:hover {
  color: #409eff;
}

.product-store .el-icon {
  margin-right: 5px;
}

.product-spec {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.product-price-row {
  display: flex;
  align-items: baseline;
  margin-bottom: 8px;
}

.product-price {
  font-size: 18px;
  font-weight: bold;
  color: #f56c6c;
  margin-right: 8px;
}

.product-unit-price {
  font-size: 14px;
  color: #909399;
}

.product-rating {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.review-count {
  font-size: 12px;
  color: #909399;
  margin-left: 5px;
}

.product-tags {
  margin-bottom: 15px;
}

.product-tags .el-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}

.product-actions {
  display: flex;
  justify-content: center;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
