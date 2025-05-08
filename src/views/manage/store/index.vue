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
      <!-- 模板按钮 -->
      <el-col :span="8">
        <!-- 新增按钮 -->
        <div class="left-buttons">
          <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['manage:store:add']"
            >新增</el-button
          >
          <!-- 修改按钮 -->
          <el-button
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['manage:store:edit']"
            >修改</el-button
          >
          <!-- 删除按钮 -->

          <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['manage:store:remove']"
            >删除</el-button
          >
          <!-- 导出按钮 -->
          <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['manage:store:export']"
            >导出</el-button
          >
        </div>
      </el-col>

      <!-- 审核按钮--居中 -->
      <el-col :span="8" class="center-col" v-hasRole="['admin', 'operator']">
        <el-badge :value="auditTotal">
          <el-button type="warning" plain icon="List" @click="handleAuditOpen"
            >开始审核</el-button
          >
        </el-badge>
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
      <el-table-column label="店铺名称" align="center" prop="storeName">
        <template #default="scope">
          <router-link
            :to="{
              name: 'StoreDetail',
              params: { storeId: scope.row.storeId },
            }"
            class="store-name-link"
          >
            {{ scope.row.storeName }}
          </router-link>
        </template>
      </el-table-column>
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
          <div class="status-cell">
            <dict-tag :options="store_status" :value="scope.row.storeStatus" />
            <el-badge
              is-dot
              type="danger"
              v-if="
                scope.row.auditFlag === 1 &&
                (scope.row.storeStatus === 0 || scope.row.storeStatus === 3)
              "
              class="audit-dot"
            />
          </div>
        </template>
      </el-table-column>

      <!-- 联系电话 -->
      <el-table-column label="联系电话" align="center" prop="contact" />
      <!-- 创建人 -->
      <el-table-column label="创建人" align="center" prop="createBy" />

      <!-- 操作列表 -->
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <!-- 表头信息 -->
        <template #header>
          <div>
            <span>操作</span>
            <div class="operation-tips">
              <i class="ban-mini-icon"></i>封禁
              <i class="terminate-mini-icon"></i>删除
            </div>
          </div>
        </template>

        <!-- 具体操作 -->
        <template #default="scope">
          <!-- 封禁店铺 -->
          <el-button
            link
            type="danger"
            @click="handleBan(scope.row)"
            v-hasRole="['admin', 'operator']"
            :disabled="scope.row.storeStatus === 3"
          >
            <i
              :class="scope.row.storeStatus === 3 ? 'baned-icon' : 'ban-icon'"
            ></i>
          </el-button>

          <!-- 删除店铺 -->
          <el-button
            link
            type="primary"
            @click="handleDelete(scope.row)"
            v-hasPermi="['manage:store:remove']"
          >
            <i class="terminate-icon"></i>
          </el-button>
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

    <!-- 对话框：填写封禁理由 -->
    <el-dialog v-model="banOpen" :title="title">
      <!-- 待提交表单项 -->
      <el-form ref="storeRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="封禁理由" prop="banComment">
          <el-input
            v-model="form.banComment"
            type="textarea"
            placeholder="请输入封禁理由"
            :rows="4"
          />
        </el-form-item>
      </el-form>

      <!-- 底部按钮 -->
      <template #footer>
        <el-button type="primary" @click="submitBanForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </template>
    </el-dialog>

    <!-- 审核对话框 -->
    <el-dialog :title="title" v-model="auditOpen" width="700px" append-to-body>
      <el-table :data="auditList">
        <el-table-column label="序号" width="55" align="center" type="index" />
        <el-table-column label="店铺名称" align="center" prop="storeName">
          <template #default="scope">
            <router-link
              :to="{
                name: 'StoreDetail',
                params: { storeId: scope.row.storeId },
              }"
              class="store-name-link"
              @click="auditOpen = false"
            >
              {{ scope.row.storeName }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="店铺状态" align="center" prop="storeStatus">
          <template #default="scope">
            <dict-tag :options="store_status" :value="scope.row.storeStatus" />
          </template>
        </el-table-column>

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

<script setup name="Store">
// 导入API接口函数
import {
  listStore,
  getStore,
  delStore,
  addStore,
  updateStore,
  ban,
  audit,
} from "@/api/manage/store";
import { useRouter } from "vue-router";
const router = useRouter();
// 获取全局代理对象
const { proxy } = getCurrentInstance();
// 获取字典数据：店铺状态
const { store_status } = proxy.useDict("store_status");

// 数据表格内容
const storeList = ref([]);
// 待审核数据表格内容
const auditList = ref([]);

// 存储总记录数
const total = ref(0);
// 待审核记录数
const auditTotal = ref(0);

// 对话框标题
const title = ref("");
// 封禁理由固定前缀
const banCommentPrefix = ref("Ban Comment:");

// 审核对话框开关
const auditOpen = ref(false);
// 对话框开关
const open = ref(false);
// 封禁对话框开关
const banOpen = ref(false);

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

  // 待审查数据查询参数
  auditParams: {
    pageNum: 1,
    pageSize: 10,
    auditFlag: 1,
    // auditStatus自行添加
  },

  // 表单校验规则：增加/编辑店铺对话框
  rules: {
    storeLogo: [
      { required: true, message: "店铺logo不能为空", trigger: "blur" },
    ],
    storeName: [
      { required: true, message: "店铺名称不能为空", trigger: "blur" },
    ],
    banComment: [
      { required: true, message: "封禁理由不能为空", trigger: "blur" },
      {
        validator: (rule, value, callback) => {
          if (value && value.trim().length === 0) {
            callback(new Error("封禁理由不能全为空格"));
          } else {
            callback();
          }
        },
        trigger: "blur",
      },
    ],
    contact: [
      { required: true, message: "联系电话不能为空", trigger: "blur" },
    ],
  },
});

// 解构响应式数据
const { queryParams, form, rules, auditParams } = toRefs(data);

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
  banOpen.value = false;
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
    // 附加：封禁理由
    banComment: null,
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
          reset();
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

/** 点击”封禁店铺按钮“ */
function handleBan(row) {
  // 打开封禁对话框，填写封禁理由
  title.value = "店铺封禁理由";
  form.value = row;
  banOpen.value = true;
  console.log(form.value);
}

/** 提交封禁理由 */
function submitBanForm() {
  proxy.$refs["storeRef"].validate((valid) => {
    if (valid) {
      proxy.$modal
        .confirm("真的要封禁[ " + form.value.storeName + " ]吗？")
        .then(() =>
          ban({
            storeId: form.value.storeId,
            banComment: banCommentPrefix.value + form.value.banComment,
          })
        )
        .then(() => {
          proxy.$modal.msgSuccess("封禁成功");
          banOpen.value = false;
          getList();
          reset();
        })
        .catch(() => {});
    }
  });
}

/** 获取待审核数据
 * 申请标记：1； 状态：待审核/封禁
 */
async function getAuditList() {
  // 查询两次，保存两次数据

  try {
    // 使用Promise.all等待两个请求都完成
    const [response1, response2] = await Promise.all([
      listStore({ ...auditParams.value, storeStatus: 0 }),
      listStore({ ...auditParams.value, storeStatus: 3 }),
    ]);

    // 直接使用response的数据
    auditList.value = [...response1.rows, ...response2.rows];
    auditTotal.value = response1.total + response2.total;
  } catch (error) {
    console.error("获取审核列表失败:", error);
    proxy.$modal.msgError("获取审核列表失败");
  }
}

/** 打开审核对话框 */
function handleAuditOpen() {
  auditOpen.value = true;
  title.value = "店铺审核";
}

/** 处理审核结果 */
function handleAudit(row, accept) {
  audit({
    storeId: row.storeId,
    auditComment: row.auditComment,
    params: {
      isAccept: accept,
    },
  }).then(() => {
    proxy.$modal.msgSuccess("审核成功");
    // 从待审查列表中删除当前数据
    auditList.value = auditList.value.filter(
      (item) => item.storeId !== row.storeId
    );
    auditTotal.value--;
    // 重新加载主视图表格
    getList();
  });
}
// 初始化列表数据
getList();
getAuditList();
</script>

<style scoped>
.query-select {
  width: 180px;
}

/* 封禁图标 */
.ban-icon {
  display: inline-block;
  width: 24px;
  height: 24px;
  margin-right: 3px;
  background: url("@/assets/icons/my_svg/ban.svg") no-repeat center;
  background-size: contain;
}
.baned-icon {
  display: inline-block;
  width: 24px;
  height: 24px;
  margin-right: 3px;
  background: url("@/assets/icons/my_svg/baned.svg") no-repeat center;
  background-size: contain;
}
.terminate-icon {
  display: inline-block;
  width: 24px;
  height: 24px;
  margin-right: 3px;
  background: url("@/assets/icons/my_svg/terminate.svg") no-repeat center;
  background-size: contain;
}
/**封禁图标mini */
.ban-mini-icon {
  display: inline-block;
  width: 15px;
  height: 15px;
  background: url("@/assets/icons/my_svg/ban.svg") no-repeat center;
  background-size: contain;
}
.terminate-mini-icon {
  display: inline-block;
  width: 15px;
  height: 15px;
  background: url("@/assets/icons/my_svg/terminate.svg") no-repeat center;
  background-size: contain;
}

/**操作提示表头：封禁图标、删除图标 */
.operation-tips {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  width: 100%;
}

/** 功能按钮--ruoyi生成 */
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

.status-cell {
  position: relative;
  display: inline-block;
}

.audit-dot {
  position: absolute;
  top: -2px;
  right: -8px;
}
</style>
