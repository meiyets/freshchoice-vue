import request from '@/utils/request'

// 查询产品-标签关系列表
export function listProductTag(query) {
  return request({
    url: "/manage/product-tag/list",
    method: "get",
    params: query,
  });
}

// 查询产品-标签关系详细
export function getProductTag(productTagId) {
  return request({
    url: "/manage/product-tag/" + productTagId,
    method: "get",
  });
}

// 新增产品-标签关系
export function addProductTag(data) {
  return request({
    url: "/manage/product-tag",
    method: "post",
    data: data,
  });
}

// 修改产品-标签关系
export function updateProductTag(data) {
  return request({
    url: "/manage/product-tag",
    method: "put",
    data: data,
  });
}

// 删除产品-标签关系
export function delProductTag(productTagId) {
  return request({
    url: "/manage/product-tag/" + productTagId,
    method: "delete",
  });
}
