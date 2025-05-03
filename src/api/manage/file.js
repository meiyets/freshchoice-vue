import request from '@/utils/request'

// 查询文件管理列表
export function listFile(query) {
  return request({
    url: '/manage/file/list',
    method: 'get',
    params: query
  })
}

// 查询文件管理详细
export function getFile(fileId) {
  return request({
    url: '/manage/file/' + fileId,
    method: 'get'
  })
}

// 新增文件管理
export function addFile(data) {
  return request({
    url: '/manage/file',
    method: 'post',
    data: data
  })
}

// 修改文件管理
export function updateFile(data) {
  return request({
    url: '/manage/file',
    method: 'put',
    data: data
  })
}

// 删除文件管理
export function delFile(fileId) {
  return request({
    url: '/manage/file/' + fileId,
    method: 'delete'
  })
}
