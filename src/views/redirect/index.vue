<template>
  <div></div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute();
const router = useRouter();
const { params, query } = route
const { path } = params

// 确保路径格式正确，处理可能的多级路径情况
const fullPath = '/' + path.replace(/^\/+/, '')
router.replace({ path: fullPath, query })
</script>