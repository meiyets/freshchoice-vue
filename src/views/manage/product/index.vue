<template>
  <!-- 页面容器 -->
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <!-- 产品名称搜索项 -->
      <el-form-item label="产品名称" prop="productName">
        <el-input
          v-model="queryParams.productName"
          placeholder="请输入产品名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <!-- 产品编号 -->
      <el-form-item label="产品编号" prop="productCode">
        <el-input
          v-model="queryParams.productCode"
          placeholder="请输入产品编号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>

      <!-- 查询表单按钮 -->
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 功能 -->
    <el-row :gutter="10" class="mb8">
      <!-- 新增按钮 -->
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['manage:product:add']"
          >新增</el-button
        >
      </el-col>
      <!-- 修改 -->
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['manage:product:edit']"
          >修改</el-button
        >
      </el-col>
      <!-- 删除 -->
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['manage:product:remove']"
          >删除</el-button
        >
      </el-col>
      <!-- 导出 -->
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['manage:product:export']"
          >导出</el-button
        >
      </el-col>
      <!-- 是否显示搜索 -->
      <right-toolbar
        v-model:showSearch="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <!-- 表格容器 -->
    <div class="table-container">
      <!-- 状态筛选按钮组 -->
      <div class="status-filter">
        <el-button-group>
          <el-button
            type="info"
            size="large"
            round
            @click="handleFilter('all')"
            :class="{ 'is-active': activeFilter === 'all' }"
          >
            <el-icon><List /></el-icon>All
          </el-button>
          <el-button
            type="success"
            size="large"
            round
            @click="handleFilter(0)"
            :class="{ 'is-active': activeFilter === 0 }"
          >
            <el-icon><Select /></el-icon>上架ing
          </el-button>
          <el-button
            type="warning"
            size="large"
            round
            @click="handleFilter(1)"
            :class="{ 'is-active': activeFilter === 1 }"
          >
            <el-icon><Warning /></el-icon>下架ing
          </el-button>
          <el-button
            type="danger"
            plain
            size="large"
            round
            @click="handleFilter('alert')"
            :class="{ 'is-active': activeFilter === 'alert' }"
          >
            <el-icon><Bell /></el-icon>预警ing
          </el-button>
          <el-button
            type="danger"
            size="large"
            round
            @click="handleFilter(2)"
            :class="{ 'is-active': activeFilter === 2 }"
          >
            <el-icon><CircleClose /></el-icon>售罄！
          </el-button>
        </el-button-group>
      </div>

      <!-- 主视图数据 -->
      <el-table
        v-loading="loading"
        :data="productList"
        @selection-change="handleSelectionChange"
      >
        <!-- 表格列配置 -->
        <el-table-column type="selection" width="55" align="center" />
        <!-- 序号 -->
        <el-table-column label="序号" align="center" type="index" width="55" />
        <!-- 名称 -->
        <el-table-column label="产品名称" align="center" prop="productName" />
        <!-- 编码 -->
        <el-table-column label="产品编号" align="center" prop="productCode" />

        <!-- 主图 -->
        <el-table-column label="产品主图" align="center" prop="mainImg">
          <template #default="scope">
            <image-preview :src="scope.row.mainImg" :width="50" :height="50" />
          </template>
        </el-table-column>

        <!-- 产品状态 -->
        <el-table-column label="产品状态" align="center" prop="productStatus">
          <template #default="scope">
            <dict-tag
              :options="product_status"
              :value="scope.row.productStatus"
            />
          </template>
        </el-table-column>

        <!-- 库存 -->
        <el-table-column label="库存数量" align="center" prop="stock" sortable>
          <template #default="scope">
            <div class="stock-container">
              <span
                :class="{
                  'stock-warning': scope.row.stock <= scope.row.stockAlert,
                }"
              >
                {{ scope.row.stock }}
              </span>
              <el-tooltip
                v-if="scope.row.stock <= scope.row.stockAlert"
                effect="dark"
                :content="`库存已低于预警值(${scope.row.stockAlert})`"
                placement="top"
              >
                <el-icon class="warning-icon"><Warning /></el-icon>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>

        <!-- 销量 -->
        <el-table-column
          label="产品销量"
          align="center"
          prop="totalSales"
          sortable
        />

        <!-- 评价 -->
        <el-table-column
          label="产品评价"
          align="center"
          prop="avgRating"
          sortable
        >
          <template #default="scope">
            <div class="rating-container">
              <el-rate
                v-model="scope.row.avgRating"
                disabled
                show-score
                text-color="#ff9900"
                size="small"
                score-template="{value}"
              />
            </div>
          </template>
        </el-table-column>

        <!-- 操作按钮 -->
        <el-table-column
          label="操作"
          align="center"
          class-name="small-padding fixed-width"
        >
          <template #default="scope">
            <el-button
              link
              type="success"
              icon="CreditCard"
              @click="handleInfo(scope.row)"
              v-hasPermi="['manage:product:list']"
            ></el-button>
            <el-button
              link
              type="primary"
              icon="Edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['manage:product:edit']"
            ></el-button>
            <el-button
              link
              type="danger"
              icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['manage:product:remove']"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页组件 -->
    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加/修改产品对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="productRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="产品名称" prop="productName">
          <el-input v-model="form.productName" placeholder="请输入产品名称" />
        </el-form-item>
        <el-form-item label="产品描述" prop="productDesc">
          <el-input
            v-model="form.productDesc"
            type="textarea"
            placeholder="请输入内容"
          />
        </el-form-item>
        <el-form-item label="产品主图" prop="mainImg">
          <image-upload v-model="form.storeLogo" />
        </el-form-item>
        <el-form-item label="规格数值" prop="specificationValue">
          <el-input
            v-model="form.specificationValue"
            placeholder="请输入规格数值"
          />
        </el-form-item>
        <el-form-item label="规格单位" prop="specificationUnit">
          <el-input
            v-model="form.specificationUnit"
            placeholder="请输入规格单位"
          />
        </el-form-item>
        <el-form-item label="计价单位" prop="priceUnit">
          <el-input v-model="form.priceUnit" placeholder="请输入计价单位" />
        </el-form-item>
        <el-form-item label="产品价格" prop="price">
          <el-input v-model="form.price" placeholder="请输入产品价格" />
        </el-form-item>
        <el-form-item label="库存数量" prop="stock">
          <el-input v-model="form.stock" placeholder="请输入库存数量" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog :title="title" v-model="infoOpen" width="800px">
      <div class="product-card">
        <!-- 顶部区域：主图和核心信息 -->
        <div class="card-header">
          <!-- 产品主图 -->
          <div class="product-image">
            <image-preview :src="form.mainImg" :width="300" :height="300" />
          </div>

          <!-- 核心信息 -->
          <div class="product-core-info">
            <!-- 名称、编号、状态 -->
            <div class="product-title">
              <h2>{{ form.productName }}</h2>
              <span class="product-code">编号：{{ form.productCode }}</span>
              <dict-tag
                :options="product_status"
                :value="form.productStatus"
                class="status-tag"
              />
            </div>
            <!-- 价格相关 -->
            <div class="product-price">
              <div class="price-tag">
                <span class="currency">¥</span>
                <span class="amount">{{ form.price }}</span>
                <span class="unit">/{{ form.priceUnit }}</span>
              </div>
              <div class="specification">
                规格：{{ form.specificationValue }}{{ form.specificationUnit }}
              </div>
            </div>

            <!-- 新增产品标签 -->
            <div
              class="product-tags"
              v-if="form.tagNames && form.tagNames.length"
            >
              <el-tag
                v-for="(tag, index) in form.tagNames"
                :key="index"
                type="info"
                size="small"
                effect="plain"
                class="tag-item"
              >
                {{ tag }}
              </el-tag>
            </div>

            <!-- 业务信息 -->
            <div class="product-stats">
              <!-- 库存 -->
              <div class="stat-item">
                <span class="label">库存</span>
                <span
                  class="value"
                  :class="{ warning: form.stock <= form.stockAlert }"
                >
                  {{ form.stock }}
                  <el-tooltip
                    v-if="form.stock <= form.stockAlert"
                    effect="dark"
                    :content="`库存已低于预警值(${form.stockAlert})`"
                    placement="top"
                  >
                    <el-icon class="warning-icon"><Warning /></el-icon>
                  </el-tooltip>
                </span>
              </div>
              <!-- 销量 -->
              <div class="stat-item">
                <span class="label">销量</span>
                <span class="value">{{ form.totalSales }}</span>
              </div>
              <!-- 评分 -->
              <div class="stat-item">
                <span class="label">评分</span>
                <div class="rating-value">
                  <el-rate
                    v-model="form.avgRating"
                    disabled
                    show-score
                    text-color="#ff9900"
                    size="small"
                    score-template="{value}"
                  />
                  <span class="review-count"
                    >({{ form.reviewCount }}条评价)</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 店铺信息 -->
        <div class="store-info">
          <el-icon><Shop /></el-icon>
          <span class="store-name">{{ form.storeName }}</span>
        </div>

        <!-- 分类信息 -->
        <div class="category-info">
          <el-icon><Collection /></el-icon>
          <div class="category-content">
            <span class="category-name">{{
              getCategoryName(form.categoryId)
            }}</span>
            <el-tag
              :type="getCategorySourceType(form.categoryId).type"
              size="small"
              effect="plain"
              class="source-tag"
            >
              {{ getCategorySourceType(form.categoryId).label }}
            </el-tag>
          </div>
        </div>

        <!-- 产品描述 -->
        <div class="product-description">
          <h3>产品描述</h3>
          <p>{{ form.productDesc }}</p>
        </div>

        <!-- 其他信息 -->
        <div class="additional-info">
          <div class="info-item">
            <span class="label">创建时间：</span>
            <span class="value">{{ form.createTime }}</span>
          </div>
          <div class="info-item">
            <span class="label">更新时间：</span>
            <span class="value">{{ form.updateTime }}</span>
          </div>
          <div class="info-item">
            <span class="label">创建人：</span>
            <span class="value">{{ form.createBy }}</span>
          </div>
          <div class="info-item">
            <span class="label">更新人：</span>
            <span class="value">{{ form.updateBy }}</span>
          </div>
        </div>
      </div>

      <!-- 对话框操作按钮 -->
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancel">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Product">
// 导入API接口函数
import {
  listProduct,
  getProduct,
  delProduct,
  addProduct,
  updateProduct,
} from "@/api/manage/product";
import { listCategory } from "@/api/manage/category";
import { listStore } from "@/api/manage/store";

// 查询参数
import { loadAllParams } from "@/api/page";

// 导入用户信息存储组件
import useUserStore from "@/store/modules/user";
import { ElMessage } from "element-plus";
// 导入图标
import {
  List,
  Select,
  Warning,
  Bell,
  CircleClose,
} from "@element-plus/icons-vue";
import { Shop, Collection } from "@element-plus/icons-vue";
// 获取全局代理对象和字典数据
const { proxy } = getCurrentInstance();
const { product_status } = proxy.useDict("product_status");

// 主视图数据
const productList = ref([]);
// 数据总数
const total = ref(0);
// 用户存储对象
const userStore = useUserStore();
// 当前用户的店铺
const store = ref(null);
// 分类数据
const categoryList = ref([]);

// 选中的产品ID数组
const ids = ref([]);

// 新增/编辑对话框开关
const open = ref(false);
// 查看详情对话框开关
const infoOpen = ref(false);
// 主视图加载状态
const loading = ref(true);

// 对话框标题
const title = ref("");

// 标记：搜索区域显示状态
const showSearch = ref(true);
// 标记：是否禁用单个操作按钮
const single = ref(true);
// 标记：是否禁用批量操作按钮
const multiple = ref(true);
// 标记：是否返回预警数据
const isAlert = ref(false);
// 标记：当前选中的筛选状态
const activeFilter = ref("all");

// 定义响应式表单数据和校验规则
const data = reactive({
  // 表单对象
  form: {},
  // 查询参数对象
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    productName: null,
    productCode: null,
    productStatus: null,
    storeId: null, //只会存一次，之后不会再重置
  },
  // 表单验证规则
  rules: {
    productName: [
      { required: true, message: "产品名称不能为空", trigger: "blur" },
    ],
    productCode: [
      { required: true, message: "产品编号不能为空", trigger: "blur" },
    ],
    specificationValue: [
      { required: true, message: "规格数值不能为空", trigger: "blur" },
    ],
    specificationUnit: [
      { required: true, message: "规格单位不能为空", trigger: "blur" },
    ],
    priceUnit: [
      { required: true, message: "计价单位不能为空", trigger: "blur" },
    ],
    price: [{ required: true, message: "产品价格不能为空", trigger: "blur" }],
    unitPrice: [
      { required: true, message: "单位价格不能为空", trigger: "blur" },
    ],
    stock: [{ required: true, message: "库存数量不能为空", trigger: "blur" }],
    totalSales: [
      { required: true, message: "总销量不能为空", trigger: "blur" },
    ],
    productStatus: [
      {
        required: true,
        message: "产品状态(0:上架 1:下架 2:售罄)不能为空",
        trigger: "change",
      },
    ],
    avgRating: [
      { required: true, message: "平均评分不能为空", trigger: "blur" },
    ],
    reviewCount: [
      { required: true, message: "评价数量不能为空", trigger: "blur" },
    ],
    storeName: [
      { required: true, message: "店铺名称不能为空", trigger: "blur" },
    ],
    storeId: [{ required: true, message: "店铺ID不能为空", trigger: "blur" }],
    categoryId: [
      { required: true, message: "分类ID不能为空", trigger: "blur" },
    ],
    createTime: [
      { required: true, message: "创建时间不能为空", trigger: "blur" },
    ],
    updateTime: [
      { required: true, message: "更新时间不能为空", trigger: "blur" },
    ],
    createBy: [{ required: true, message: "创建人不能为空", trigger: "blur" }],
    updateBy: [{ required: true, message: "更新人不能为空", trigger: "blur" }],
    stockAlert: [
      { required: true, message: "库存预警不能为空", trigger: "blur" },
    ],
  },
});

// 解构响应式数据
const { queryParams, form, rules } = toRefs(data);

// 取消按钮
function cancel() {
  open.value = false;
  infoOpen.value = false;
  reset();
}

// 表单重置
// 要包含整个Product实体
function reset() {
  form.value = {
    productId: null,
    productName: null,
    productCode: null,
    productDesc: null,
    productStatus: null,
    mainImg: null,
    specificationValue: null,
    specificationUnit: null,
    priceUnit: null,
    price: null,
    stock: null,
    totalSales: null,
    avgRating: null,
    reviewCount: null,
    storeName: null,
    storeId: null,
    categoryId: null,
    createTime: null,
    updateTime: null,
    createBy: null,
    updateBy: null,
    stockAlert: null,
    tagNames: [],
  };
  proxy.resetForm("productRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
// 只会影响到搜索框表单中的两项
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.productId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加产品";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _productId = row.productId || ids.value;
  getProduct(_productId).then((response) => {
    form.value = response.data;
    open.value = true;
    title.value = "修改产品";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["productRef"].validate((valid) => {
    if (valid) {
      if (form.value.productId != null) {
        updateProduct(form.value).then((response) => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addProduct(form.value).then((response) => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _productIds = row.productId || ids.value;
  proxy.$modal
    .confirm('是否确认删除产品编号为"' + _productIds + '"的数据项？')
    .then(function () {
      return delProduct(_productIds);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess("删除成功");
    })
    .catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download(
    "manage/product/export",
    {
      ...queryParams.value,
    },
    `product_${new Date().getTime()}.xlsx`
  );
}

/** 获取店铺信息 */
function getStoreInfo() {
  listStore({
    userId: userStore.id,
  })
    .then((response) => {
      //得到的店铺应当只有一个
      const storeList = response.rows;
      if (storeList.length != 1) {
        ElMessage.error("违法操作，该用户未绑定或绑定了多个店铺");
        return Promise.reject("店铺数据异常");
      }
      // 存储店铺，并且作为固定查询参数
      store.value = storeList[0];
      queryParams.value.storeId = store.value.storeId;
      getList();
    })
    .catch((error) => {
      console.error("获取数据失败：", error);
      ElMessage.error("获取数据失败");
    });
}

/** 查询产品列表数据 */
function getList() {
  loading.value = true;
  listProduct({
    ...queryParams.value,
    params: {
      isAlert: isAlert.value,
    },
  }).then((response) => {
    productList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

/** 状态筛选按钮操作 */
function handleFilter(status) {
  // 更新选中状态
  activeFilter.value = status;

  // all和预警不区分产品状态
  if (status === "all" || status === "alert") {
    queryParams.value.productStatus = null;
  } else {
    queryParams.value.productStatus = status;
  }

  // 预警状态设置预警标记
  if (status === "alert") {
    isAlert.value = true;
  } else {
    isAlert.value = false;
  }
  getList();
}

/** 打开详情对话框 */
function handleInfo(row) {
  // 清空表单
  reset();
  // 赋值，更改标题，打开对话框
  form.value = row;
  title.value = `${form.value.productName}`;
  infoOpen.value = true;
}

/** 加载分类数据 */
function getCategorylist() {
  listCategory(loadAllParams).then((response) => {
    categoryList.value = response.rows;
  });
}

// 获取分类名称
function getCategoryName(categoryId) {
  const category = categoryList.value.find(
    (item) => item.categoryId === categoryId
  );
  return category ? category.categoryName : "未知分类";
}

// 获取分类来源类型
function getCategorySourceType(categoryId) {
  const category = categoryList.value.find(
    (item) => item.categoryId === categoryId
  );
  if (!category) return { type: "info", label: "未知" };

  return category.sourceType === 0
    ? { type: "success", label: "系统分类" }
    : { type: "warning", label: "商家分类" };
}

// 页面加载时获取列表数据、分类数据
getStoreInfo();
getCategorylist();
</script>

<style scoped>
.rating-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

:deep(.el-rate) {
  display: inline-flex;
  align-items: center;
}

:deep(.el-rate__text) {
  margin-left: 8px;
  font-size: 14px;
  color: #ff9900;
}

/* 按钮组相关 */
.table-container {
  position: relative;
  margin-top: 20px;
}

.status-filter {
  position: absolute;
  top: -60px;
  right: 100px;
  z-index: 2;
  background: transparent;
}

.status-filter .el-button-group {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.status-filter .el-button {
  margin: 0;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  transition: all 0.3s ease;
}

.status-filter .el-button:hover {
  transform: translateY(-2px);
}

.status-filter .el-button .el-icon {
  margin-right: 6px;
  font-size: 16px;
}

/* 按钮样式优化 */
.status-filter .el-button--info {
  background-color: #909399;
  color: white;
}

.status-filter .el-button--success {
  background-color: #67c23a;
  color: white;
}

.status-filter .el-button--warning {
  background-color: #e6a23c;
  color: white;
}

.status-filter .el-button--danger.is-plain {
  background-color: white;
  color: #f56c6c;
  border: 1px solid #fbc4c4;
}

.status-filter .el-button--danger:not(.is-plain) {
  background-color: #f56c6c;
  color: white;
}

/* 按钮选中状态样式 */
.status-filter .el-button.is-active {
  transform: translateY(2px);
  box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.2);
  filter: brightness(0.85);
  position: relative;
  border: 2px solid rgba(255, 255, 255, 0.8);
}

.status-filter .el-button.is-active::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(
    to right,
    transparent,
    rgba(255, 255, 255, 0.9),
    transparent
  );
  border-radius: 2px;
}

.status-filter .el-button.is-active .el-icon {
  transform: scale(1.1);
  filter: brightness(1.2);
}
/**库存-预警数值提示 */
.stock-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.stock-container span {
  min-width: 40px; /* 根据实际数字长度调整 */
  text-align: center;
}

.stock-container .stock-warning {
  color: #f56c6c;
  font-weight: bold;
}

.warning-icon {
  color: #e6a23c;
  font-size: 16px;
  position: absolute;
  margin-left: 50px; /* 调整图标位置，确保不影响数字居中 */
}

.warning-icon:hover {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}

/* 产品详情卡片样式 */
.product-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}

.card-header {
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
}

.product-image {
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.product-core-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.product-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-title h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.product-code {
  color: #909399;
  font-size: 14px;
}

.status-tag {
  margin-left: auto;
}

.price-tag {
  display: flex;
  align-items: baseline;
  color: #f56c6c;
  margin-bottom: 8px;
}

.currency {
  font-size: 16px;
  margin-right: 4px;
}

.amount {
  font-size: 28px;
  font-weight: bold;
}

.unit {
  font-size: 14px;
  color: #909399;
  margin-left: 4px;
}

.specification {
  color: #606266;
  font-size: 14px;
}

.product-stats {
  display: flex;
  gap: 30px;
  margin-top: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-item .label {
  color: #909399;
  font-size: 14px;
}

.stat-item .value {
  font-size: 16px;
  color: #303133;
}

.stat-item .value.warning {
  color: #f56c6c;
}

.warning-icon {
  color: #e6a23c;
  margin-left: 4px;
}

.rating-value {
  display: flex;
  align-items: center;
  gap: 8px;
}

.review-count {
  color: #909399;
  font-size: 14px;
}

.store-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 0;
  border-top: 1px solid #ebeef5;
  margin: 20px 0 0 0;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
  margin: 0 0 20px 0;
}

.category-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.category-name {
  font-size: 15px;
  color: #606266;
}

.source-tag {
  font-size: 12px;
}

.store-name {
  color: #409eff;
  font-size: 16px;
}

.product-description {
  margin: 20px 0;
}

.product-description h3 {
  font-size: 18px;
  color: #303133;
  margin-bottom: 12px;
}

.product-description p {
  color: #606266;
  line-height: 1.6;
}

.additional-info {
  background: #f5f7fa;
  border-radius: 4px;
  padding: 16px;
  margin-top: 20px;
}

.info-item {
  display: flex;
  margin-bottom: 8px;
}

.info-item .label {
  color: #909399;
  width: 100px;
}

.info-item .value {
  color: #606266;
}

/* 产品标签样式 */
.product-tags {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  border-radius: 12px;
  padding: 4px 10px;
  background-color: #f5f7fa;
  color: #606266;
}
</style>
