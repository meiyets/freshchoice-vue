<template>
  <div class="app-container">
    <!-- 顶部搜索框 -->
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="分类名称" prop="categoryName">
        <el-input
          v-model="queryParams.categoryName"
          placeholder="请输入分类名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="分类来源" prop="sourceType">
        <el-select
          v-model="queryParams.sourceType"
          placeholder="请选择分类来源"
          clearable
          class="query-select"
        >
          <el-option
            v-for="dict in category_soure_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="审核状态" prop="auditStatus">
        <el-select
          v-model="queryParams.auditStatus"
          placeholder="请选择审核状态"
          clearable
          class="query-select"
        >
          <el-option
            v-for="dict in category_audit_comment"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 功能按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['manage:category:add']"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['manage:category:edit']"
          >修改</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['manage:category:remove']"
          >删除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['manage:category:export']"
          >导出</el-button
        >
      </el-col>
      <right-toolbar
        v-model:showSearch="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table
      v-loading="loading"
      :data="categoryList"
      @selection-change="handleSelectionChange"
    >
      <!-- 多选框 -->
      <el-table-column type="selection" width="55" align="center" />
      <!-- 序号 -->
      <el-table-column label="序号" width="55" align="center" type="index" />
      <!-- 分类名称 -->
      <el-table-column label="分类名称" align="center" prop="categoryName" />
      <!-- 分类描述 -->
      <el-table-column
        label="分类描述"
        align="center"
        prop="categoryDesc"
        show-overflow-tooltip
      />
      <!-- 分类来源(0:系统 1:商家) -->
      <el-table-column label="分类来源" align="center" prop="sourceType">
        <template #default="scope">
          <dict-tag
            :options="category_soure_type"
            :value="scope.row.sourceType"
          />
        </template>
      </el-table-column>
      <!-- 审核状态(0:待审核 1:已通过 2:已拒绝) -->
      <el-table-column label="审核状态" align="center" prop="auditStatus">
        <template #default="scope">
          <dict-tag
            :options="category_audit_comment"
            :value="scope.row.auditStatus"
          />
        </template>
      </el-table-column>
      <!-- 审核备注 -->
      <el-table-column label="审核备注" align="center" prop="auditComment" />
      <!-- 更新人 -->
      <el-table-column label="最后更新者" align="center" prop="updateBy" />
      <!-- 更新时间 
        设置为排序字段-->
      <el-table-column
        label="最后更新时间"
        align="center"
        prop="updateTime"
        width="180"
        sortable
      >
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, "{y}-{m}-{d}") }}</span>
        </template>
      </el-table-column>
      <!-- 操作 -->
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template #default="scope">
          <el-button
            link
            type="primary"
            icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['manage:category:edit']"
            >修改</el-button
          >
          <el-button
            link
            type="primary"
            icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['manage:category:remove']"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改分类管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <!-- 构造表单：rules校验每个form-item的prop -->
      <el-form
        ref="categoryRef"
        :model="form"
        :rules="rules"
        label-width="80px"
        status-icon
      >
        <el-form-item label="分类名称" prop="categoryName">
          <el-input v-model="form.categoryName" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="分类描述" prop="categoryDesc">
          <el-input
            v-model="form.categoryDesc"
            type="textarea"
            placeholder="请输入内容"
          />
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

<script setup name="Category">
// 导入组件
import {
  listCategory,
  getCategory,
  delCategory,
  addCategory,
  updateCategory,
} from "@/api/manage/category";

const { proxy } = getCurrentInstance();
const { category_soure_type, category_audit_comment } = proxy.useDict(
  "category_soure_type",
  "category_audit_comment"
);

// 数据表格内容
const categoryList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const daterangeCreateTime = ref([]);
const daterangeUpdateTime = ref([]);


/** 自定义表单验证函数 - 分类名称
 * @param {Object} rule - 当前验证规则对象
 * @param {string} value - 当前被验证的字段值
 * @param {Function} callback - 验证完成的回调函数
 */
const validateCategoryName = (rule, value, callback) => {
  // 检查输入值是否为空
  if (value === "") {
    // 如果为空，通过callback返回错误信息
    callback(new Error("请输入分类名称"));
  } else {
    // categoryList.value保存所有分类实体数据
    // 输入值value:1.可以是自己（编辑场景）
    //            2.不能在已有列表中（新增场景，但此时form数据为空）
    const isExist = categoryList.value.some(
      (item) =>
        item.categoryName === value && item.categoryId !== form.value.categoryId
    );

    if (isExist) {
      callback(new Error("分类名称已存在"));
    } else {
      callback();
    }
  }
};

const data = reactive({
  //表单数据
  form: {},
  // 查询参数
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    categoryName: null,
    sourceType: null,
    auditStatus: null,
  },
  // 表单校验规则：增加/编辑分类对话框
  rules: {
    categoryName: [
      // { required: true, message: "分类名称不能为空", trigger: "blur" },
      // { validator: validateCategoryName, trigger: "blur"}
    ],
    sourceType: [
      {
        required: true,
        message: "分类来源(0:系统 1:商家)不能为空",
        trigger: "change",
      },
    ],
    auditStatus: [
      {
        required: true,
        message: "审核状态(0:待审核 1:已通过 2:已拒绝)不能为空",
        trigger: "change",
      },
    ],
    createTime: [
      { required: true, message: "创建时间不能为空", trigger: "blur" },
    ],
    updateTime: [
      { required: true, message: "更新时间不能为空", trigger: "blur" },
    ],
    createBy: [{ required: true, message: "创建人不能为空", trigger: "blur" }],
    updateBy: [{ required: true, message: "更新人不能为空", trigger: "blur" }],
  },
});

const { queryParams, form, rules } = toRefs(data);



/** 查询分类管理列表 */
function getList() {
  loading.value = true;
  queryParams.value.params = {};
  if (null != daterangeCreateTime && "" != daterangeCreateTime) {
    queryParams.value.params["beginCreateTime"] = daterangeCreateTime.value[0];
    queryParams.value.params["endCreateTime"] = daterangeCreateTime.value[1];
  }
  if (null != daterangeUpdateTime && "" != daterangeUpdateTime) {
    queryParams.value.params["beginUpdateTime"] = daterangeUpdateTime.value[0];
    queryParams.value.params["endUpdateTime"] = daterangeUpdateTime.value[1];
  }
  listCategory(queryParams.value).then((response) => {
    categoryList.value = response.rows;
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
    categoryId: null,
    categoryName: null,
    categoryDesc: null,
    sourceType: null,
    auditStatus: null,
    auditComment: null,
    createTime: null,
    updateTime: null,
    createBy: null,
    updateBy: null,
  };
  proxy.resetForm("categoryRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  daterangeCreateTime.value = [];
  daterangeUpdateTime.value = [];
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.categoryId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加分类管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _categoryId = row.categoryId || ids.value;
  getCategory(_categoryId).then((response) => {
    form.value = response.data;
    open.value = true;
    title.value = "修改分类管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["categoryRef"].validate((valid) => {
    if (valid) {
      if (form.value.categoryId != null) {
        updateCategory(form.value).then((response) => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addCategory(form.value).then((response) => {
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
  const _categoryIds = row.categoryId || ids.value;
  proxy.$modal
    .confirm('是否确认删除分类管理编号为"' + _categoryIds + '"的数据项？')
    .then(function () {
      return delCategory(_categoryIds);
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
    "manage/category/export",
    {
      ...queryParams.value,
    },
    `category_${new Date().getTime()}.xlsx`
  );
}

getList();
</script>

<!-- CSS样式 -->
<style scoped>
/* 搜索栏中下拉框样式 */
.query-select {
  width: 180px;
}
</style>
