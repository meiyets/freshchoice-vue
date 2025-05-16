import request from '@/utils/request'

// 查询购物车项列表
export function listCartItem(query) {
  return request({
    url: '/manage/cart-item/list',
    method: 'get',
    params: query
  })
}

// 查询购物车项详细
export function getCartItem(cartItemId) {
  return request({
    url: '/manage/cart-item/' + cartItemId,
    method: 'get'
  })
}

// 新增购物车项
export function addCartItem(data) {
  return request({
    url: '/manage/cart-item',
    method: 'post',
    data: data
  })
}

// 修改购物车项
export function updateCartItem(data) {
  return request({
    url: '/manage/cart-item',
    method: 'put',
    data: data
  })
}

// 删除购物车项
export function delCartItem(cartItemId) {
  return request({
    url: "/manage/cart-item/" + cartItemId,
    method: "delete",
  });
}
