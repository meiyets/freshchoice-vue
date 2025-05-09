<template>
  <div class="product-detail-container" v-loading="loading">
    <!-- 返回按钮 -->
    <div class="back-button">
      <el-button @click="goBack" type="primary" plain>
        <el-icon><back /></el-icon> 返回
      </el-button>
    </div>

    <div v-if="productInfo" class="product-content">
      <!-- 顶部区域：轮播图和基本信息 -->
      <div class="top-section">
        <!-- 左侧：产品轮播图 -->
        <div class="product-gallery">
          <el-carousel :interval="4000" indicator-position="outside">
            <el-carousel-item
              v-for="(img, index) in productImages"
              :key="index"
            >
              <el-image
                :src="img"
                fit="contain"
                :preview-src-list="productImages"
                :initial-index="index"
                class="carousel-image"
              >
                <!-- 图片加载失败显示 -->
                <template #error>
                  <div class="image-error">
                    <el-icon><picture-filled /></el-icon>
                  </div>
                </template>
              </el-image>
            </el-carousel-item>
          </el-carousel>
        </div>

        <!-- 右侧：产品基本信息 -->
        <div class="product-info">
          <!-- 产品标题和状态 -->
          <div class="product-header">
            <h1 class="product-title">{{ productInfo.productName }}</h1>
            <div class="product-status">
              <dict-tag
                :options="product_status"
                :value="productInfo.productStatus"
              />
            </div>
          </div>

          <!-- 产品编号 -->
          <div class="product-code">
            产品编号：{{ productInfo.productCode }}
          </div>

          <!-- 价格信息 -->
          <div class="price-section">
            <div class="price-tag">
              <span class="currency">¥</span>
              <span class="amount">{{ productInfo.price.toFixed(2) }}</span>
              <span class="unit">/{{ productInfo.priceUnit }}</span>
            </div>
            <div class="unit-price" v-if="productInfo.unitPrice">
              单价：¥{{ productInfo.unitPrice.toFixed(2) }}/{{
                productInfo.specificationUnit
              }}
            </div>
          </div>

          <!-- 规格信息 -->
          <div class="specification">
            规格：{{ productInfo.specificationValue
            }}{{ productInfo.specificationUnit }}
          </div>

          <!-- 评分和评价数 -->
          <div class="rating-section">
            <el-rate
              v-model="productInfo.avgRating"
              disabled
              show-score
              text-color="#ff9900"
              score-template="{value}"
            />
            <span class="review-count"
              >({{ productInfo.reviewCount }}条评价)</span
            >
          </div>

          <!-- 标签展示 -->
          <div
            class="tags-section"
            v-if="productInfo.tags && productInfo.tags.length"
          >
            <span class="section-label">产品标签：</span>
            <div class="tags-list">
              <el-tag
                v-for="(tag, index) in productInfo.tags"
                :key="index"
                :type="tagTypes[index % tagTypes.length]"
                class="tag-item"
              >
                {{ tag.tagName }}
              </el-tag>
            </div>
          </div>

          <!-- 库存和销量 -->
          <div class="stock-sales-section">
            <div
              class="stock-item"
              :class="{
                'stock-warning': productInfo.stock <= productInfo.stockAlert,
              }"
            >
              <span class="section-label">库存：</span>
              <span class="stock-value">{{ productInfo.stock }}</span>
              <el-tooltip
                v-if="productInfo.stock <= productInfo.stockAlert"
                effect="dark"
                :content="`库存已低于预警值(${productInfo.stockAlert})`"
                placement="top"
              >
                <el-icon class="warning-icon"><warning /></el-icon>
              </el-tooltip>
            </div>
            <div class="sales-item">
              <span class="section-label">销量：</span>
              <span>{{ productInfo.totalSales }}</span>
            </div>
          </div>

          <!-- 店铺信息 -->
          <div class="store-section">
            <span class="section-label">店铺：</span>
            <div class="store-info" @click="viewStore(productInfo.storeId)">
              <el-icon><shop /></el-icon>
              <span class="store-name">{{ productInfo.storeName }}</span>
            </div>
          </div>

          <!-- 操作按钮区域 -->
          <div class="action-buttons">
            <!-- 收藏按钮 -->
            <el-button
              :type="isFavorite ? 'danger' : 'default'"
              :icon="isFavorite ? 'Star' : 'StarFilled'"
              @click="toggleFavorite"
              :disabled="productInfo.productStatus !== 0"
            >
              {{ isFavorite ? "已收藏" : "收藏" }}
            </el-button>

            <!-- 分享按钮 -->
            <el-button type="primary" @click="shareProduct">
              <el-icon><share /></el-icon> 分享
            </el-button>
          </div>
        </div>
      </div>

      <!-- 中间区域：产品描述和分类科普 -->
      <div class="middle-section">
        <!-- 标签页 -->
        <el-tabs type="border-card">
          <!-- 产品描述标签页 -->
          <el-tab-pane label="产品描述">
            <div class="description-content">
              <h3>产品详情</h3>
              <div
                class="description-text"
                v-html="productInfo.productDesc || '暂无描述'"
              ></div>
            </div>
          </el-tab-pane>

          <!-- 分类科普标签页 - 仅显示审核通过的 -->
          <el-tab-pane
            label="分类科普"
            v-if="categoryInfo && categoryInfo.auditStatus === 1"
          >
            <div class="category-content">
              <h3>{{ categoryInfo.categoryName }} - 科普信息</h3>
              <div
                class="category-description"
                v-html="categoryInfo.categoryDesc"
              ></div>
            </div>
          </el-tab-pane>

        </el-tabs>
      </div>

      <!-- 底部区域：评价列表 -->
      <div class="bottom-section">
        <div class="reviews-header">
          <h2>用户评价 ({{ productInfo.reviewCount }})</h2>
        </div>

        <!-- 评价列表 -->
        <div class="reviews-list" v-if="reviews.length > 0">
          <div
            class="review-item"
            v-for="(review, index) in reviews"
            :key="index"
          >
            <!-- 用户信息 -->
            <div class="review-user">
              <el-avatar
                :size="40"
                :src="review.avatar || defaultAvatar"
              ></el-avatar>
              <span class="user-name">{{
                review.isAnonymous ? "匿名用户" : review.userName
              }}</span>
            </div>

            
            <!-- 评价内容 -->
            <div class="review-content">
              <!-- 评分 -->
              <div class="review-rating">
                <el-rate
                  v-model="review.rating"
                  disabled
                  text-color="#ff9900"
                />
                <span class="review-date">{{ review.createTime }}</span>
              </div>

              <!-- 评价文字 -->
              <div class="review-text">{{ review.content }}</div>

              <!-- 评价图片 -->
              <div
                class="review-images"
                v-if="review.images && review.images.length"
              >
                <el-image
                  v-for="(img, imgIndex) in review.images"
                  :key="imgIndex"
                  :src="img"
                  :preview-src-list="review.images"
                  fit="cover"
                  class="review-image"
                ></el-image>
              </div>
            </div>
          </div>
        </div>

        <!-- 无评价时显示 -->
        <el-empty v-else description="暂无评价" :image-size="200"></el-empty>

        <!-- 评价分页 -->
        <div class="reviews-pagination" v-if="reviews.length > 0">
          <el-pagination
            v-model:current-page="reviewParams.pageNum"
            v-model:page-size="reviewParams.pageSize"
            :page-sizes="[5, 10, 20]"
            :total="reviewTotal"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleReviewSizeChange"
            @current-change="handleReviewCurrentChange"
          />
        </div>
      </div>
    </div>

    <!-- 数据为空时显示 -->
    <el-empty
      v-if="!loading && !productInfo"
      description="未找到产品信息"
      :image-size="200"
    ></el-empty>

    <!-- 分享对话框 -->
    <el-dialog v-model="shareDialogVisible" title="分享产品" width="400px">
      <div class="share-dialog-content">
        <p>复制以下链接分享给好友：</p>
        <el-input v-model="shareUrl" readonly class="share-url-input">
          <template #append>
            <el-button @click="copyShareUrl">复制</el-button>
          </template>
        </el-input>

        <div class="share-qrcode" v-if="shareUrl">
          <p>或使用二维码分享：</p>
          <!-- 这里可以集成二维码生成库 -->
          <div class="qrcode-placeholder">二维码展示区域</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
// 导入所需的组件和API
import { ref, reactive, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Back,
  PictureFilled,
  Shop,
  Warning,
  Share,
  Star,
  StarFilled,
} from "@element-plus/icons-vue";

// API导入
import { listProduct, getProduct } from "@/api/manage/product";
import { listCategory, getCategory } from "@/api/manage/category";
import { listFile } from "@/api/manage/file";

// 获取全局代理对象和字典数据
const { proxy } = getCurrentInstance();
const { product_status } = proxy.useDict("product_status");

// 路由实例
const route = useRoute();
const router = useRouter();

// 产品ID
const productId = computed(() => route.params.productId);

// 加载状态
const loading = ref(false);

// 产品信息
const productInfo = ref(null);

// 产品对应的分类信息
const categoryInfo = ref(null);



// 标签类型循环使用
const tagTypes = ["", "success", "warning", "info", "danger"];

// 产品图片列表
const productImages = ref([]);

// 收藏状态
const isFavorite = ref(false);

// 评价列表
const reviews = ref([]);
const reviewTotal = ref(0);
const reviewParams = reactive({
  productId: "",
  pageNum: 1,
  pageSize: 5,
});

// 默认头像
const defaultAvatar =
  "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png";

// 分享对话框
const shareDialogVisible = ref(false);
const shareUrl = ref("");

// 获取产品详情
const getProductDetail = async () => {
  if (!productId.value) return;

  loading.value = true;
  try {
    // 使用getProduct方法获取产品列表，传入productId作为筛选条件
    const res = await getProduct(productId.value);
    if (res.code === 200 && res.data) {
      productInfo.value = res.data;
      // 获取其余图片信息，处理为数组存入productImages
      listFile({
        bizType: "product_img",
        bizId: productInfo.value.productId,
        isMainImage: 0,
      }).then((response) => {
        // 先从后端获取的文件列表拿到所有的url
        const otherImages = response.rows.map((item) => item.storagePath);
        productImages.value = [productInfo.value.mainImg, ...otherImages];

        // 获取分类信息
        if (productInfo.value.categoryId) {
          getCategoryDetail(productInfo.value.categoryId);
        }
        // 获取评价列表
        getProductReviews();
        // 检查是否已收藏
        checkFavoriteStatus();
      });
    } else {
      ElMessage.error("获取产品详情失败");
    }
  } catch (error) {
    console.error("获取产品详情失败", error);
    ElMessage.error("获取产品详情失败");
  } finally {
    loading.value = false;
  }
};

// 获取分类详情
const getCategoryDetail = async (categoryId) => {
  try {
    const res = await getCategory(categoryId);
    if (res.code === 200) {
      categoryInfo.value = res.data;
    }
  } catch (error) {
    console.error("获取分类详情失败", error);
  }
};

// 获取产品评价列表
const getProductReviews = async () => {
  if (!productId.value) return;

  reviewParams.productId = productId.value;

  try {
    // 这里应该调用实际的评价API
    // 由于没有提供评价API，这里模拟一些评价数据
    // 实际项目中应替换为真实API调用
    setTimeout(() => {
      // 模拟数据
      reviews.value = [
        {
          userName: "用户A",
          avatar: "",
          rating: 5,
          content: "非常新鲜，物流很快，包装也很好，下次还会购买！",
          createTime: "2025-05-10 14:30:22",
          isAnonymous: false,
          images: [
            "https://picsum.photos/300/300?random=1",
            "https://picsum.photos/300/300?random=2",
          ],
        },
        {
          userName: "用户B",
          avatar: "",
          rating: 4,
          content: "质量不错，但是发货有点慢。",
          createTime: "2025-05-09 09:15:36",
          isAnonymous: false,
          images: [],
        },
        {
          userName: "",
          avatar: "",
          rating: 3.5,
          content: "一般般吧，没有想象中那么好。",
          createTime: "2025-05-08 18:45:10",
          isAnonymous: true,
          images: ["https://picsum.photos/300/300?random=3"],
        },
      ];
      reviewTotal.value = 3;
    }, 500);
  } catch (error) {
    console.error("获取评价列表失败", error);
  }
};

// 检查收藏状态
const checkFavoriteStatus = async () => {
  if (!productId.value) return;

  try {
    // 这里应该调用实际的收藏API检查状态
    // 由于没有提供收藏API，这里模拟收藏状态
    // 实际项目中应替换为真实API调用
    setTimeout(() => {
      isFavorite.value = Math.random() > 0.5; // 随机模拟收藏状态
    }, 300);
  } catch (error) {
    console.error("检查收藏状态失败", error);
  }
};

// 切换收藏状态
const toggleFavorite = async () => {
  if (!productId.value) return;

  try {
    // 这里应该调用实际的收藏/取消收藏API
    // 由于没有提供收藏API，这里只是切换状态
    // 实际项目中应替换为真实API调用
    isFavorite.value = !isFavorite.value;
    ElMessage.success(isFavorite.value ? "收藏成功" : "已取消收藏");
  } catch (error) {
    console.error("操作收藏失败", error);
    ElMessage.error("操作失败，请稍后重试");
  }
};

// 分享产品
const shareProduct = () => {
  // 生成分享链接
  const host = window.location.origin;
  shareUrl.value = `${host}/product/detail/${productId.value}`;
  shareDialogVisible.value = true;
};

// 复制分享链接
const copyShareUrl = () => {
  navigator.clipboard
    .writeText(shareUrl.value)
    .then(() => {
      ElMessage.success("链接已复制到剪贴板");
    })
    .catch(() => {
      ElMessage.error("复制失败，请手动复制");
    });
};

// 查看店铺
const viewStore = (storeId) => {
  if (!storeId) return;
  router.push({
    path: `/store/${storeId}`,
    query: { from: "product-detail" },
  });
};

// 评价分页处理
const handleReviewSizeChange = (val) => {
  reviewParams.pageSize = val;
  getProductReviews();
};

const handleReviewCurrentChange = (val) => {
  reviewParams.pageNum = val;
  getProductReviews();
};

// 返回上一页
const goBack = () => {
  router.back();
};

// 初始化
onMounted(() => {
  getProductDetail();
});
</script>

<style scoped>
.product-detail-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 120px);
}

.back-button {
  margin-bottom: 20px;
}

.product-content {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 顶部区域样式 */
.top-section {
  display: flex;
  padding: 30px;
  border-bottom: 1px solid #ebeef5;
  align-items: stretch; /* 确保子元素高度一致 */
}

/* 轮播图区域 */
.product-gallery {
  flex: 2;
  max-width: 800px;
  margin-right: 30px;
  display: flex; /* 添加flex布局 */
  flex-direction: column; /* 垂直方向布局 */
}
/* 确保轮播图组件占满容器高度 */
.product-gallery :deep(.el-carousel) {
  flex: 1; /* 占满剩余空间 */
  height: 100%; /* 占满容器高度 */
}

/* 确保轮播图项和图片占满容器 */
.product-gallery :deep(.el-carousel__container) {
  height: 100%;
}

.carousel-image {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  background-color: #f5f7fa;
  display: flex;
  justify-content: center;
  align-items: center;
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

/* 产品信息区域 */
.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.product-title {
  margin: 0;
  font-size: 24px;
  color: #303133;
  flex: 1;
}

.product-code {
  font-size: 14px;
  color: #909399;
  margin-bottom: 20px;
}

.price-section {
  margin-bottom: 20px;
}

.price-tag {
  display: flex;
  align-items: baseline;
  margin-bottom: 5px;
}

.currency {
  font-size: 16px;
  color: #f56c6c;
  margin-right: 2px;
}

.amount {
  font-size: 28px;
  font-weight: bold;
  color: #f56c6c;
}

.unit {
  font-size: 14px;
  color: #909399;
  margin-left: 5px;
}

.unit-price {
  font-size: 14px;
  color: #606266;
}

.specification {
  font-size: 14px;
  color: #606266;
  margin-bottom: 20px;
}

.rating-section {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.review-count {
  font-size: 14px;
  color: #909399;
  margin-left: 10px;
}

.tags-section {
  margin-bottom: 20px;
}

.section-label {
  font-size: 14px;
  color: #606266;
  margin-right: 10px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  margin-top: 8px;
}

.tag-item {
  margin-right: 8px;
  margin-bottom: 8px;
}

.stock-sales-section {
  display: flex;
  margin-bottom: 20px;
}

.stock-item,
.sales-item {
  margin-right: 30px;
  display: flex;
  align-items: center;
}

.stock-warning .stock-value {
  color: #f56c6c;
}

.warning-icon {
  color: #f56c6c;
  margin-left: 5px;
}

.store-section {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.store-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.store-info:hover .store-name {
  color: #409eff;
}

.store-name {
  margin-left: 5px;
  color: #606266;
  transition: color 0.3s;
}

.action-buttons {
  display: flex;
  gap: 15px;
  margin-top: auto;
}

/* 中间区域样式 */
.middle-section {
  padding: 30px;
  border-bottom: 1px solid #ebeef5;
}

.description-content,
.category-content {
  padding: 20px 0;
}

.description-content h3,
.category-content h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
  color: #303133;
}

.description-text {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

/* 富文本内容的基本样式 */
.description-text :deep(p) {
  margin-bottom: 1em;
}

.description-text :deep(img) {
  max-width: 100%;
  height: auto;
  margin: 10px 0;
}

.description-text :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 10px 0;
}

.description-text :deep(th),
.description-text :deep(td) {
  border: 1px solid #dcdfe6;
  padding: 8px;
}

.description-text :deep(ul),
.description-text :deep(ol) {
  padding-left: 20px;
  margin: 10px 0;
}

.category-description {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

/* 底部区域样式 */
.bottom-section {
  padding: 30px;
}

.reviews-header {
  margin-bottom: 20px;
}

.reviews-header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.reviews-list {
  margin-bottom: 30px;
}

.review-item {
  display: flex;
  padding: 20px 0;
  border-bottom: 1px solid #ebeef5;
}

.review-user {
  margin-right: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.user-name {
  margin-top: 10px;
  font-size: 14px;
  color: #606266;
  max-width: 80px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.review-content {
  flex: 1;
}

.review-rating {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.review-date {
  margin-left: 10px;
  font-size: 12px;
  color: #909399;
}

.review-text {
  font-size: 14px;
  color: #303133;
  line-height: 1.6;
  margin-bottom: 15px;
}

.review-images {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.review-image {
  width: 100px;
  height: 100px;
  border-radius: 4px;
  object-fit: cover;
}

.reviews-pagination {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

/* 分享对话框样式 */
.share-dialog-content {
  padding: 10px 0;
}

.share-url-input {
  margin: 15px 0;
}

.share-qrcode {
  margin-top: 20px;
  text-align: center;
}

.qrcode-placeholder {
  width: 150px;
  height: 150px;
  margin: 15px auto;
  background-color: #f5f7fa;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #909399;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
}

/* 响应式布局 */
@media (max-width: 992px) {
  .top-section {
    flex-direction: column;
  }

  .product-gallery {
    max-width: 100%;
    margin-right: 0;
    margin-bottom: 30px;
  }
}
</style>
