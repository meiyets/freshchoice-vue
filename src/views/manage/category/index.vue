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
      <!-- 若依生成的按钮位于左侧 -->
      <el-col :span="8">
        <div class="left-buttons">
          <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['manage:category:add']"
            >新增</el-button
          >

          <el-button
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['manage:category:edit']"
            >修改</el-button
          >
          <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['manage:category:remove']"
            >删除</el-button
          >
        </div>
      </el-col>

      <!-- 开始审核按钮 -->
      <el-col :span="8" class="center-col">
        <el-badge :value="auditTotal">
          <el-button
            type="warning"
            plain
            icon="List"
            @click="openAuditDialog"
            v-hasRole="['admin', 'operator']"
            >开始审核</el-button
          >
        </el-badge>
      </el-col>

      <!-- :showSearch绑定了当前组件的showSearch属性 -->
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
      <el-table-column
        label="分类来源"
        align="center"
        prop="sourceType"
        sortable
      >
        <template #default="scope">
          <dict-tag
            :options="category_soure_type"
            :value="scope.row.sourceType"
          />
        </template>
      </el-table-column>
      <!-- 审核状态(0:待审核 1:已通过 2:已拒绝) -->
      <el-table-column
        label="审核状态"
        align="center"
        prop="auditStatus"
        sortable
      >
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
      <el-table-column label="最后更新人" align="center" prop="updateBy" />
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
          <span>{{
            parseTime(scope.row.updateTime, "{y}-{m}-{d} {h}:{i}:{s}")
          }}</span>
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

    <!-- 添加/修改对话框 -->
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

    <!-- 审核对话框 -->
    <el-dialog :title="title" v-model="auditOpen" width="700px" append-to-body>
      <el-table v-loading="auditLoading" :data="auditList">
        <el-table-column label="序号" width="55" align="center" type="index" />
        <el-table-column label="分类名称" align="center" prop="categoryName" />
        <el-table-column label="分类描述" align="center" prop="categoryDesc" />

        <!-- 操作 -->
        <el-table-column
          label="审查"
          align="center"
          class-name="small-padding fixed-width"
        >
          <template #default="scope">
            <div class="audit-actions">
              <!-- 第一行：接受/拒绝按钮-->
              <div class="button-group">
                <el-button
                  type="success"
                  icon="Check"
                  @click="handleAudit(scope.row, true)"
                  v-hasRole="['admin', 'operator']"
                  >接受</el-button
                >
                <el-button
                  type="danger"
                  icon="Close"
                  @click="handleAudit(scope.row, false)"
                  v-hasRole="['admin', 'operator']"
                  >拒绝</el-button
                >
              </div>
              <!-- 第二行：审核备注输入框 -->
              <el-input
                v-model="scope.row.auditComment"
                placeholder="若予以拒绝，请输入备注"
                size="small"
                type="textarea"
                :rows="2"
              />
            </div>
          </template>
        </el-table-column>
      </el-table>
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
  audit,
} from "@/api/manage/category";

const { proxy } = getCurrentInstance();
const { category_soure_type, category_audit_comment } = proxy.useDict(
  "category_soure_type",
  "category_audit_comment"
);

// 数据表格内容
const categoryList = ref([]);
// 审查数据表单数据
const auditList = ref([]);

// 存储数据的ids（由多选框传递）
const ids = ref([]);
// 存储总记录数
const total = ref(0);
// 存储待审查总记录数
const auditTotal = ref(0);

// 对话框标题
const title = ref("");

// 新增/修改对话框开关
const open = ref(false);
// 审核对话框开关
const auditOpen = ref(false);

// 标记：是否显示主视图加载
const loading = ref(true);
// 标记：是否显示搜索栏
const showSearch = ref(true);
// 标记：是否仅选中一条数据
const single = ref(true);
// 标记：是否选中多条数据
const multiple = ref(true);

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
  // 审查查询参数（进查询来源为商家且未审核的分类）
  auditParams: {
    pageNum: 1,
    pageSize: 10,
    sourceType: 1,
    auditStatus: 0,
  },
  // 表单校验规则：增加/编辑分类对话框
  rules: {
    categoryName: [
      { required: true, message: "分类名称不能为空", trigger: "blur" },
      { validator: validateCategoryName, trigger: "blur" },
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

const { queryParams, form, rules, auditParams } = toRefs(data);

/** 查询分类管理列表 */
function getList() {
  loading.value = true;

  listCategory(queryParams.value).then((response) => {
    // 获取实体数据
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
    params: {
      isAccept: null,
    },
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

/**
 * 获取审查列表
 * 用于全局初始化，后续会自动更新
 */
function getAuditList() {
  //此处并没有设置加载标识
  listCategory(auditParams.value).then((response) => {
    auditList.value = response.rows;
    auditTotal.value = response.total;
  });
}

/** 开始审核按钮操作
 * 打开审查对话框
 */
function openAuditDialog() {
  // 清空表单
  reset();
  // 打开审查对话框
  auditOpen.value = true;
  // 修改对话框标题
  title.value = "待审查列表";
}

/**
 * 审查按钮：审查通过
 * 用form承载数据，向后端发起请求
 */
function handleAudit(row, isAccept) {
  // 以防万一先清空表单
  reset();
  // 为表单赋值（当前行数据 + 审查标记）
  form.value = {
    ...row,
    params: {
      isAccept: isAccept,
    },
  };
  // 发送请求
  audit(form.value).then((response) => {
    // 提示信息
    proxy.$modal.msgSuccess("操作完成");
    // 从待审查列表中删除当前数据
    auditList.value = auditList.value.filter(
      (item) => item.categoryId !== row.categoryId
    );
    auditTotal.value--;
    // 重新加载主视图表格
    getList();
  });
}

getList();
getAuditList();
</script>

<!-- CSS样式 -->
<style lang="scss" scoped>
/* 搜索栏中下拉框样式 */
.query-select {
  width: 180px;
}
/* 审核操作区样式 */
.audit-actions {
  /* 使用flex布局，实现灵活的容器布局 */
  display: flex;
  /* 设置主轴方向为垂直方向，使子元素垂直排列 */
  flex-direction: column;
  /* 设置子元素之间的间距为8px */
  gap: 8px;
}

.button-group {
  /* 使用flex布局，实现按钮组的水平排列 */
  display: flex;
  /* 设置子元素（按钮）在主轴上居中对齐 */
  justify-content: center;
  /* 设置按钮之间的间距为8px */
  gap: 8px;
}
/* 若依的三个按钮 */
.left-buttons {
  display: flex;
  gap: 10px;
}
/*让自定义按钮居中布局 */
.center-col {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 添加整体页面容器的内边距 */
.app-container {
  padding: 20px;
  background-color: #f9f9f9; /* 添加一个浅背景色 */
  border-radius: 8px; /* 添加圆角 */
  opacity: 1; /* 增加透明度 */
  position: relative; /* 为伪元素定位提供参考 */
  overflow: hidden; /* 隐藏溢出的伪元素 */
  border: 1px solid #e0e0e0; /* 为主要内容区域添加细微边框 */
}

/* @keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
} */

/* 添加一个 subtle 的背景渐变效果 */
.app-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    45deg,
    #b0b0b0 0%,
    #c0c0c0 100%
  ); /* 调整渐变颜色，增加对比度 */
  opacity: 0.7; /* 增加透明度 */
  z-index: -1; /* 确保在内容下方 */
}

/* 调整搜索表单的样式 */
.el-form--inline .el-form-item {
  margin-right: 20px; /* 增加表单项右侧间距 */
  margin-bottom: 15px; /* 增加表单项底部间距 */
  /* 添加边框和阴影 */
  border: 1px solid #dcdfe6; /* 浅灰色边框 */
  border-radius: 4px; /* 圆角 */
  padding: 8px 12px; /* 内边距 */
  background-color: #fff; /* 白色背景 */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); /* 细微阴影 */
  transition: all 0.3s ease; /* 添加过渡效果 */
}

.el-form--inline .el-form-item:hover {
  border-color: #c0c4cc; /* 鼠标悬停时边框颜色变深 */
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); /* 鼠标悬停时阴影变大 */
}

/* 调整按钮样式 */
.el-button {
  border-radius: 4px; /* 按钮圆角 */
  transition: all 0.3s ease; /* 添加过渡效果 */
}

.el-button:hover {
  opacity: 0.9; /* 鼠标悬停时降低透明度 */
  transform: translateY(-2px); /* 鼠标悬停时向上移动2px */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 添加阴影 */
}

.el-button:active {
  transform: translateY(0); /* 鼠标按下时恢复位置 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 鼠标按下时减小阴影 */
}

/* 调整表格样式 */
.el-table {
  margin-top: 20px; /* 表格顶部间距 */
  border-radius: 8px; /* 表格圆角 */
  overflow: hidden; /* 隐藏溢出内容，配合圆角使用 */
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1); /* 添加阴影 */
}

.el-table th,
.el-table td {
  padding: 12px 0; /* 调整表格单元格内边距 */
  font-size: 14px; /* 调整表格字体大小 */
}

.el-table th {
  background-color: #f5f7fa; /* 表头背景色 */
  color: #303133; /* 表头字体颜色 */
  font-weight: bold; /* 表头字体加粗 */
}

/* 调整分页组件样式 */
.pagination-container {
  margin-top: 20px; /* 分页组件顶部间距 */
  justify-content: flex-end; /* 分页组件靠右对齐 */
}

/* 调整对话框样式 */
.el-dialog__wrapper {
  .el-dialog {
    border-radius: 15px; /* 增加对话框圆角 */
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4); /* 增加对话框阴影 */
    border: 3px solid #808080; /* 调整对话框边框颜色和粗细 */
    animation: slideIn 0.4s ease-out; /* 调整对话框进入动画 */
    .el-dialog__header {
      border-bottom: 1px solid #ebeef5; /* 对话框头部下边框 */
      padding: 15px 20px; /* 对话框头部内边距 */
      font-weight: bold; /* 对话框标题加粗 */
      background-color: #f9f9f9; /* 调整浅色背景 */
    }
    .el-dialog__body {
      padding: 20px; /* 对话框内容内边距 */
    }
    .el-dialog__footer {
      border-top: 1px solid #ebeef5; /* 对话框底部上边框 */
      padding: 10px 20px; /* 对话框底部内边距 */
      background-color: #f9f9f9; /* 调整浅色背景 */
    }
  }
}

@keyframes slideIn {
  from {
    transform: translateY(-40px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 为对话框遮罩层添加模糊效果 */
.el-overlay-dialog {
  backdrop-filter: blur(12px); /* 增加模糊效果 */
  background-color: rgba(0, 0, 0, 0.6); /* 调整背景颜色和透明度 */
}

/* 调整审核对话框中的输入框样式 */
.audit-actions .el-input__inner,
.audit-actions .el-textarea__inner {
  border-radius: 4px; /* 输入框圆角 */
}

/* 添加一些hover效果到表格行 */
.el-table__row {
  transition: background-color 0.3s ease, box-shadow 0.3s ease; /* 添加过渡效果 */
}

.el-table__row:hover {
  background-color: #eef1f6 !important; /* 鼠标悬停时改变背景色 */
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08); /* 鼠标悬停时添加细微阴影 */
}

/* 添加选中行样式 */
.el-table__row.is-checked {
  background-color: #d9ecff !important; /* 选中行背景色 */
  font-weight: bold; /* 选中行字体加粗 */
}

/* 调整功能按钮区域的间距 */
.mb8 {
  margin-bottom: 15px; /* 增加功能按钮区域底部间距 */
}

/* 为搜索框和选择框添加过渡效果 */
.el-input__inner,
.el-select__wrapper {
  transition: border-color 0.3s ease, box-shadow 0.3s ease; /* 添加过渡效果 */
}

.el-input__inner:focus,
.el-select__wrapper.is-focused {
  border-color: #409eff; /* 聚焦时边框颜色 */
  box-shadow: 0 0 0 6px rgba(64, 158, 255, 0.6); /* 聚焦时添加更明显的阴影和光晕效果 */
}

/* 调整对话框底部按钮样式 */
.dialog-footer .el-button {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out; /* 添加过渡效果 */
}

.dialog-footer .el-button:hover {
  transform: translateY(-3px); /* 鼠标悬停时向上移动3px */
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15); /* 添加阴影 */
}
</style>
