<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
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
        <el-select v-model="queryParams.storeStatus" placeholder="请选择店铺状态" clearable>
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
      <el-form-item label="申请标记" prop="auditFlag">
        <el-input
          v-model="queryParams.auditFlag"
          placeholder="请输入申请标记"
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
          v-hasPermi="['manage:store:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['manage:store:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['manage:store:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['manage:store:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="storeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="店铺主键" align="center" prop="storeId" />
      <el-table-column label="店铺编号" align="center" prop="storeCode" />
      <el-table-column label="店铺logo" align="center" prop="storeLogo" width="100">
        <template #default="scope">
          <image-preview :src="scope.row.storeLogo" :width="50" :height="50"/>
        </template>
      </el-table-column>
      <el-table-column label="店铺名称" align="center" prop="storeName" />
      <el-table-column label="店铺状态" align="center" prop="storeStatus">
        <template #default="scope">
          <dict-tag :options="store_status" :value="scope.row.storeStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="联系电话" align="center" prop="contact" />
      <el-table-column label="创建人" align="center" prop="createBy" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['manage:store:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['manage:store:remove']">删除</el-button>
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

    <!-- 添加或修改店铺管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="storeRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="店铺logo" prop="storeLogo">
          <image-upload v-model="form.storeLogo"/>
        </el-form-item>
        <el-form-item label="店铺名称" prop="storeName">
          <el-input v-model="form.storeName" placeholder="请输入店铺名称" />
        </el-form-item>
        <el-form-item label="店铺描述" prop="storeDesc">
          <el-input v-model="form.storeDesc" type="textarea" placeholder="请输入内容" />
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
import { listStore, getStore, delStore, addStore, updateStore } from "@/api/manage/store";

const { proxy } = getCurrentInstance();
const { store_status } = proxy.useDict('store_status');

const storeList = ref([]);
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
    storeCode: null,
    storeName: null,
    storeStatus: null,
    contact: null,
    auditFlag: null,
    userId: null,
  },
  rules: {
    storeLogo: [
      { required: true, message: "店铺logo不能为空", trigger: "blur" }
    ],
    storeName: [
      { required: true, message: "店铺名称不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询店铺管理列表 */
function getList() {
  loading.value = true;
  listStore(queryParams.value).then(response => {
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
    updateBy: null
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
  ids.value = selection.map(item => item.storeId);
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
  const _storeId = row.storeId || ids.value
  getStore(_storeId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改店铺管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["storeRef"].validate(valid => {
    if (valid) {
      if (form.value.storeId != null) {
        updateStore(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addStore(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除店铺管理编号为"' + _storeIds + '"的数据项？').then(function() {
    return delStore(_storeIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('manage/store/export', {
    ...queryParams.value
  }, `store_${new Date().getTime()}.xlsx`)
}

getList();
</script>
