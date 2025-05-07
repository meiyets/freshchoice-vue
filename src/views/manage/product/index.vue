<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="产品名称" prop="productName">
        <el-input
          v-model="queryParams.productName"
          placeholder="请输入产品名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="产品编号" prop="productCode">
        <el-input
          v-model="queryParams.productCode"
          placeholder="请输入产品编号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="产品主图" prop="mainImg">
        <el-input
          v-model="queryParams.mainImg"
          placeholder="请输入产品主图"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="规格数值" prop="specificationValue">
        <el-input
          v-model="queryParams.specificationValue"
          placeholder="请输入规格数值"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="规格单位" prop="specificationUnit">
        <el-input
          v-model="queryParams.specificationUnit"
          placeholder="请输入规格单位"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="计价单位" prop="priceUnit">
        <el-input
          v-model="queryParams.priceUnit"
          placeholder="请输入计价单位"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="产品价格" prop="price">
        <el-input
          v-model="queryParams.price"
          placeholder="请输入产品价格"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="单位价格" prop="unitPrice">
        <el-input
          v-model="queryParams.unitPrice"
          placeholder="请输入单位价格"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="库存数量" prop="stock">
        <el-input
          v-model="queryParams.stock"
          placeholder="请输入库存数量"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="总销量" prop="totalSales">
        <el-input
          v-model="queryParams.totalSales"
          placeholder="请输入总销量"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="产品状态(0:上架 1:下架 2:售罄)" prop="productStatus">
        <el-select v-model="queryParams.productStatus" placeholder="请选择产品状态(0:上架 1:下架 2:售罄)" clearable>
          <el-option
            v-for="dict in product_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="平均评分" prop="avgRating">
        <el-input
          v-model="queryParams.avgRating"
          placeholder="请输入平均评分"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="店铺名称" prop="storeName">
        <el-input
          v-model="queryParams.storeName"
          placeholder="请输入店铺名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['manage:product:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['manage:product:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['manage:product:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['manage:product:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="productList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="产品ID" align="center" prop="productId" />
      <el-table-column label="产品名称" align="center" prop="productName" />
      <el-table-column label="产品编号" align="center" prop="productCode" />
      <el-table-column label="产品主图" align="center" prop="mainImg" />
      <el-table-column label="产品价格" align="center" prop="price" />
      <el-table-column label="库存数量" align="center" prop="stock" />
      <el-table-column label="产品状态(0:上架 1:下架 2:售罄)" align="center" prop="productStatus">
        <template #default="scope">
          <dict-tag :options="product_status" :value="scope.row.productStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['manage:product:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['manage:product:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改产品对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="productRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="产品名称" prop="productName">
          <el-input v-model="form.productName" placeholder="请输入产品名称" />
        </el-form-item>
        <el-form-item label="产品描述" prop="productDesc">
          <el-input v-model="form.productDesc" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="产品主图" prop="mainImg">
          <el-input v-model="form.mainImg" placeholder="请输入产品主图" />
        </el-form-item>
        <el-form-item label="规格数值" prop="specificationValue">
          <el-input v-model="form.specificationValue" placeholder="请输入规格数值" />
        </el-form-item>
        <el-form-item label="规格单位" prop="specificationUnit">
          <el-input v-model="form.specificationUnit" placeholder="请输入规格单位" />
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
  </div>
</template>

<script setup name="Product">
import { listProduct, getProduct, delProduct, addProduct, updateProduct } from "@/api/manage/product";

const { proxy } = getCurrentInstance();
const { product_status } = proxy.useDict('product_status');

const productList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    productName: null,
    productCode: null,
    productDesc: null,
    mainImg: null,
    specificationValue: null,
    specificationUnit: null,
    priceUnit: null,
    price: null,
    unitPrice: null,
    stock: null,
    totalSales: null,
    productStatus: null,
    avgRating: null,
    reviewCount: null,
    storeName: null,
    storeId: null,
    categoryId: null,
    stockAlert: null
  },
  rules: {
    productName: [
      { required: true, message: "产品名称不能为空", trigger: "blur" }
    ],
    productCode: [
      { required: true, message: "产品编号不能为空", trigger: "blur" }
    ],
    specificationValue: [
      { required: true, message: "规格数值不能为空", trigger: "blur" }
    ],
    specificationUnit: [
      { required: true, message: "规格单位不能为空", trigger: "blur" }
    ],
    priceUnit: [
      { required: true, message: "计价单位不能为空", trigger: "blur" }
    ],
    price: [
      { required: true, message: "产品价格不能为空", trigger: "blur" }
    ],
    unitPrice: [
      { required: true, message: "单位价格不能为空", trigger: "blur" }
    ],
    stock: [
      { required: true, message: "库存数量不能为空", trigger: "blur" }
    ],
    totalSales: [
      { required: true, message: "总销量不能为空", trigger: "blur" }
    ],
    productStatus: [
      { required: true, message: "产品状态(0:上架 1:下架 2:售罄)不能为空", trigger: "change" }
    ],
    avgRating: [
      { required: true, message: "平均评分不能为空", trigger: "blur" }
    ],
    reviewCount: [
      { required: true, message: "评价数量不能为空", trigger: "blur" }
    ],
    storeName: [
      { required: true, message: "店铺名称不能为空", trigger: "blur" }
    ],
    storeId: [
      { required: true, message: "店铺ID不能为空", trigger: "blur" }
    ],
    categoryId: [
      { required: true, message: "分类ID不能为空", trigger: "blur" }
    ],
    createTime: [
      { required: true, message: "创建时间不能为空", trigger: "blur" }
    ],
    updateTime: [
      { required: true, message: "更新时间不能为空", trigger: "blur" }
    ],
    createBy: [
      { required: true, message: "创建人不能为空", trigger: "blur" }
    ],
    updateBy: [
      { required: true, message: "更新人不能为空", trigger: "blur" }
    ],
    stockAlert: [
      { required: true, message: "库存预警不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询产品列表 */
function getList() {
  loading.value = true;
  listProduct(queryParams.value).then(response => {
    productList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    productId: null,
    productName: null,
    productCode: null,
    productDesc: null,
    mainImg: null,
    specificationValue: null,
    specificationUnit: null,
    priceUnit: null,
    price: null,
    unitPrice: null,
    stock: null,
    totalSales: null,
    productStatus: null,
    avgRating: null,
    reviewCount: null,
    storeName: null,
    storeId: null,
    categoryId: null,
    createTime: null,
    updateTime: null,
    createBy: null,
    updateBy: null,
    stockAlert: null
  };
  proxy.resetForm("productRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.productId);
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
  const _productId = row.productId || ids.value
  getProduct(_productId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改产品";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["productRef"].validate(valid => {
    if (valid) {
      if (form.value.productId != null) {
        updateProduct(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addProduct(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除产品编号为"' + _productIds + '"的数据项？').then(function() {
    return delProduct(_productIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('manage/product/export', {
    ...queryParams.value
  }, `product_${new Date().getTime()}.xlsx`)
}

getList();
</script>
