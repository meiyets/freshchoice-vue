import request from '@/utils/request'

// 查询店铺管理列表
export function listStore(query) {
  return request({
    url: '/manage/store/list',
    method: 'get',
    params: query
  })
}

// 查询店铺管理详细
export function getStore(storeId) {
  return request({
    url: '/manage/store/' + storeId,
    method: 'get'
  })
}

// 新增店铺管理
export function addStore(data) {
  return request({
    url: '/manage/store',
    method: 'post',
    data: data
  })
}

// 修改店铺管理
export function updateStore(data) {
  return request({
    url: '/manage/store',
    method: 'put',
    data: data
  })
}

// 删除店铺管理
export function delStore(storeId) {
  return request({
    url: '/manage/store/' + storeId,
    method: 'delete'
  })
}
