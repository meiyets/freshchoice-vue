/** 技术选型：WangEditor（vue3语法） 技术需求：包含文本编辑、图片上传等丰富功能
图片上传接口：/dev-api/common/upload 图片上传后端返回数据： { "msg": "操作成功",
"fileName": , "code": 200, "newFileName": , "url": , "originalFilename": }
headers: { Authorization: "Bearer " + getToken(), },
使用功能应该尽可能使用WangEditor原生功能而非自己添加*/
<template>
  <div class="wang-editor">
    <div class="editor-header" v-if="showPreview">
      <el-radio-group v-model="currentMode" size="small">
        <el-radio-button label="default">编辑</el-radio-button>
        <el-radio-button label="preview">预览</el-radio-button>
      </el-radio-group>
    </div>
    <Toolbar
      v-show="currentMode === 'default'"
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      :mode="currentMode"
      style="border-bottom: 1px solid #ccc"
    />
    <Editor
      :defaultConfig="editorConfig"
      v-model="valueHtml"
      :mode="currentMode"
      :style="{ height: height }"
      @onCreated="handleCreated"
      @onChange="handleChange"
    />
  </div>
</template>

<script setup>
import "@wangeditor/editor/dist/css/style.css";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import { ref, shallowRef, onBeforeUnmount, watch } from "vue";
import { getToken } from "@/utils/auth";
import { ElMessage } from "element-plus";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  height: {
    type: String,
    default: "300px",
  },
  mode: {
    type: String,
    default: "default",
  },
  showPreview: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "change"]);

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef();

// 内容 HTML
const valueHtml = ref("");

// 模拟 ajax 异步获取内容
watch(
  () => props.modelValue,
  (val) => {
    valueHtml.value = val;
  },
  { immediate: true }
);

// 工具栏配置
const toolbarConfig = {
  excludeKeys: ['fullScreen'],  // 新增排除全屏按钮
};

// 编辑器配置
const editorConfig = {
  placeholder: "请输入内容...",
  MENU_CONF: {
    uploadImage: {
      server: "/dev-api/common/upload",
      fieldName: "file",
      headers: {
        Authorization: "Bearer " + getToken(),
      },
      customInsert(res, insertFn) {
        if (res.code === 200) {
          insertFn(res.url, res.fileName, res.url);
          ElMessage.success("图片上传成功");
        } else {
          ElMessage.error(res.msg || "图片上传失败");
        }
      },
    },
  },
};

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});

const handleCreated = (editor) => {
  editorRef.value = editor;
};

const handleChange = (editor) => {
  emit("update:modelValue", valueHtml.value);
  emit("change", valueHtml.value);
};

const currentMode = ref("default");
</script>

<style scoped>
.wang-editor {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.wang-editor:hover {
  box-shadow: 0 2px 16px 0 rgba(0, 0, 0, 0.15);
}

.editor-header {
  padding: 8px 16px;
  border-bottom: 1px solid #ebeef5;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
}

:deep(.w-e-toolbar) {
  background-color: #fff !important;
  padding: 8px 16px !important;
  gap: 8px !important;
}

:deep(.w-e-toolbar .w-e-menu) {
  padding: 6px !important;
  border-radius: 4px;
  transition: background-color 0.2s;
}

:deep(.w-e-toolbar .w-e-menu:hover) {
  background-color: #f5f7fa;
}

:deep(.w-e-text-container) {
  border-radius: 0 0 6px 6px !important;
}

/* 自定义滚动条 */
:deep(.w-e-text-container)::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

:deep(.w-e-text-container)::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 4px;
}

:deep(.w-e-text-container)::-webkit-scrollbar-track {
  background: #fff;
}
</style>
