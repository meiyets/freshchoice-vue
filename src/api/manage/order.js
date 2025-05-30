import request from '@/utils/request'

// 查询订单列表
export function listOrder(query) {
  return request({
    url: '/manage/order/list',
    method: 'get',
    params: query
  })
}

// 查询订单详细
export function getOrder(orderId) {
  return request({
    url: '/manage/order/' + orderId,
    method: 'get'
  })
}

// 新增订单
export function addOrder(data) {
  return request({
    url: '/manage/order',
    method: 'post',
    data: data
  })
}

// 修改订单
export function updateOrder(data) {
  return request({
    url: '/manage/order',
    method: 'put',
    data: data
  })
}

// 删除订单
export function delOrder(orderId) {
  return request({
    url: '/manage/order/' + orderId,
    method: 'delete'
  })
}

// 根据用户id查询订单列表
export function listOrderByUserId(userId) {
  return request({
    url: '/manage/order/list-user/' + userId,
    method: 'get',
  })
}

// 根据店铺id查询订单列表
export function listOrderByStoreId(storeId) {
  return request({
    url: "/manage/order/list-store/" + storeId,
    method: "get",
  });
}
