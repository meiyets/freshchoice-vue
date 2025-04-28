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
      <el-form-item label="店铺编号" prop="storeCode">
        <el-input
          v-model="queryParams.storeCode"
          placeholder="请输入店铺编号"
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
      <el-form-item label="店铺状态" prop="storeStatus">
        <el-select
          v-model="queryParams.storeStatus"
          placeholder="请选择店铺状态"
          clearable
          class="query-select"
        >
          <el-option
            v-for="dict in store_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="联系电话" prop="contact">
        <el-input
          v-model="queryParams.contact"
          placeholder="请输入联系电话"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>

      <!-- 搜索框右侧按键 -->
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 功能按钮 -->
    <el-row :gutter="10" class="mb8">
      <!-- 新增按钮 -->
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['manage:store:add']"
          >新增</el-button
        >
      </el-col>
      <!-- 修改按钮 -->
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['manage:store:edit']"
          >修改</el-button
        >
      </el-col>
      <!-- 删除按钮 -->
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['manage:store:remove']"
          >删除</el-button
        >
      </el-col>
      <!-- 导出按钮 -->
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['manage:store:export']"
          >导出</el-button
        >
      </el-col>
      <!-- 搜索条显示控制工具栏 -->
      <right-toolbar
        v-model:showSearch="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table
      v-loading="loading"
      :data="storeList"
      @selection-change="handleSelectionChange"
    >
      <!-- 多选框 -->
      <el-table-column type="selection" width="55" align="center" />
      <!-- 序号-->
      <el-table-column label="序号" type="index" align="center" width="55" />
      <!-- 店铺编号 -->
      <el-table-column label="店铺编号" align="center" prop="storeCode" />
      <!-- 店铺名称 -->
      <el-table-column label="店铺名称" align="center" prop="storeName" />
      <!-- 店铺logo -->
      <el-table-column
        label="店铺logo"
        align="center"
        prop="storeLogo"
        width="100"
      >
        <template #default="scope">
          <image-preview :src="scope.row.storeLogo" :width="50" :height="50" />
        </template>
      </el-table-column>

      <!-- 店铺状态 -->
      <el-table-column label="店铺状态" align="center" prop="storeStatus">
        <template #default="scope">
          <dict-tag :options="store_status" :value="scope.row.storeStatus" />
        </template>
      </el-table-column>
      <!-- 联系电话 -->
      <el-table-column label="联系电话" align="center" prop="contact" />
      <!-- 创建人 -->
      <el-table-column label="创建人" align="center" prop="createBy" />

      <!-- 功能按钮 -->
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
            v-hasPermi="['manage:store:edit']"
            >修改</el-button
          >
          <el-button
            link
            type="primary"
            icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['manage:store:remove']"
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

    <!-- 添加或修改店铺管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <!-- 构造表单：rules校验每个form-item的prop -->
      <el-form ref="storeRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="店铺logo" prop="storeLogo">
          <image-upload v-model="form.storeLogo" />
        </el-form-item>
        <el-form-item label="店铺名称" prop="storeName">
          <el-input v-model="form.storeName" placeholder="请输入店铺名称" />
        </el-form-item>
        <el-form-item label="店铺描述" prop="storeDesc">
          <el-input
            v-model="form.storeDesc"
            type="textarea"
            placeholder="请输入内容"
          />
        </el-form-item>
        <el-form-item label="联系电话" prop="contact">
          <el-input v-model="form.contact" placeholder="请输入联系电话" />
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

<script setup name="Store">
// 导入API接口函数
import {
  listStore,
  getStore,
  delStore,
  addStore,
  updateStore,
} from "@/api/manage/store";

// 获取全局代理对象
const { proxy } = getCurrentInstance();
// 获取字典数据：店铺状态
const { store_status } = proxy.useDict("store_status");

// 数据表格内容
const storeList = ref([]);

// 存储总记录数
const total = ref(0);
// 对话框标题
const title = ref("");

// 对话框开关
const open = ref(false);

// 标记：是否显示主视图加载
const loading = ref(true);
// 标记：是否显示搜索栏
const showSearch = ref(true);
// 存储数据的ids（由多选框传递）
const ids = ref([]);
// 标记：是否仅选中一条数据
const single = ref(true);
// 标记：是否选中多条数据
const multiple = ref(true);

// 响应式数据对象
const data = reactive({
  // 表单数据
  form: {},
  // 查询参数
  // 若存在于搜索框，则与之关联，（好像）也就导致没法用于主视图数据以外的数据查询
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    storeCode: null,
    storeName: null,
    storeStatus: null,
    contact: null,
  },
  // 表单校验规则：增加/编辑店铺对话框
  rules: {
    storeLogo: [
      { required: true, message: "店铺logo不能为空", trigger: "blur" },
    ],
    storeName: [
      { required: true, message: "店铺名称不能为空", trigger: "blur" },
    ],
  },
});

// 解构响应式数据
const { queryParams, form, rules } = toRefs(data);

/** 查询店铺管理列表 */
function getList() {
  loading.value = true;
  listStore(queryParams.value).then((response) => {
    storeList.value = response.rows;
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
    storeId: null,
    storeCode: null,
    storeLogo: null,
    storeName: null,
    storeDesc: null,
    storeStatus: null,
    contact: null,
    auditFlag: null,
    auditComment: null,
    userId: null,
    createTime: null,
    updateTime: null,
    createBy: null,
    updateBy: null,
  };
  proxy.resetForm("storeRef");
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
  ids.value = selection.map((item) => item.storeId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加店铺管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _storeId = row.storeId || ids.value;
  getStore(_storeId).then((response) => {
    form.value = response.data;
    open.value = true;
    title.value = "修改店铺管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["storeRef"].validate((valid) => {
    if (valid) {
      if (form.value.storeId != null) {
        updateStore(form.value).then((response) => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addStore(form.value).then((response) => {
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
  const _storeIds = row.storeId || ids.value;
  proxy.$modal
    .confirm('是否确认删除店铺管理编号为"' + _storeIds + '"的数据项？')
    .then(function () {
      return delStore(_storeIds);
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
    "manage/store/export",
    {
      ...queryParams.value,
    },
    `store_${new Date().getTime()}.xlsx`
  );
}

// 初始化列表数据
getList();
</script>

<style scoped>
.query-select {
  width: 180px;
}
</style>
