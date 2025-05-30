import request from '@/utils/request'

// 查询地址列表
export function listAddress(query) {
  return request({
    url: '/manage/address/list',
    method: 'get',
    params: query
  })
}

// 查询地址详细
export function getAddress(addressId) {
  return request({
    url: '/manage/address/' + addressId,
    method: 'get'
  })
}

// 新增地址
export function addAddress(data) {
  return request({
    url: '/manage/address',
    method: 'post',
    data: data
  })
}

// 修改地址
export function updateAddress(data) {
  return request({
    url: '/manage/address',
    method: 'put',
    data: data
  })
}

// 删除地址
export function delAddress(addressId) {
  return request({
    url: '/manage/address/' + addressId,
    method: 'delete'
  })
}

// 根据用户id回显地址
export function listAddressByUserId(userId) {
  return request({
    url: "/manage/address/list/" + userId,
    method: "get",
  });
}

// 根据用户id切换默认地址
export function changeDefaultAddress(addressId) {
  return request({
    url: "/manage/address/default/" + addressId,
    method: "put",
  });
}