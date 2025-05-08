import request from '@/utils/request'

// 查询产品-标签关系列表
export function listTag(query) {
  return request({
    url: '/manage/tag/list',
    method: 'get',
    params: query
  })
}

// 查询产品-标签关系详细
export function getTag(productTagId) {
  return request({
    url: '/manage/tag/' + productTagId,
    method: 'get'
  })
}

// 新增产品-标签关系
export function addTag(data) {
  return request({
    url: '/manage/tag',
    method: 'post',
    data: data
  })
}

// 修改产品-标签关系
export function updateTag(data) {
  return request({
    url: '/manage/tag',
    method: 'put',
    data: data
  })
}

// 删除产品-标签关系
export function delTag(productTagId) {
  return request({
    url: '/manage/tag/' + productTagId,
    method: 'delete'
  })
}
