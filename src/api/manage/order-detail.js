import request from '@/utils/request'

// 查询订单详情列表
export function listOrderDDetail(query) {
  return request({
    url: '/manage/order-detail/list',
    method: 'get',
    params: query
  })
}

// 查询订单详情详细
export function getOrderDetail(orderDetailId) {
  return request({
    url: '/manage/order-detail/' + orderDetailId,
    method: 'get'
  })
}

// 新增订单详情
export function addOrderDetail(data) {
  return request({
    url: '/manage/order-detail',
    method: 'post',
    data: data
  })
}

// 修改订单详情
export function updateOrderDetail(data) {
  return request({
    url: '/manage/order-detail',
    method: 'put',
    data: data
  })
}

// 删除订单详情
export function delOrderDetail(orderDetailId) {
  return request({
    url: "/manage/order-detail/" + orderDetailId,
    method: "delete",
  });
}
