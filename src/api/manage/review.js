import request from '@/utils/request'

// 查询评价列表
export function listReview(query) {
  return request({
    url: '/manage/review/list',
    method: 'get',
    params: query
  })
}

// 查询评价详细
export function getReview(reviewId) {
  return request({
    url: '/manage/review/' + reviewId,
    method: 'get'
  })
}

// 新增评价
export function addReview(data) {
  return request({
    url: '/manage/review',
    method: 'post',
    data: data
  })
}

// 修改评价
export function updateReview(data) {
  return request({
    url: '/manage/review',
    method: 'put',
    data: data
  })
}

// 删除评价
export function delReview(reviewId) {
  return request({
    url: '/manage/review/' + reviewId,
    method: 'delete'
  })
}
