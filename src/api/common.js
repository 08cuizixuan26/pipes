import { service, serviceWithoutIp } from '@/utils/request'

// import axios from 'axios'
// export function getJson(path) {
//   return axios.get(path)
// }

export function getServicePort() {
  return service({
    method: 'get',
    url: '/dcs?serviceport',
    responseType: 'text'
  })
}

export function DownloadFile(path, type) {
  var u = '/sde?' + path + '_sde'
  return service({
    method: 'get',
    url: u,
    responseType: type
  })
}

export function GetDynamicPath() {
  var url = '/dcs?Dynamic'
  return service({
    method: 'get',
    url: url,
    responseType: 'text'
  })
}

export function postXml(url, data) { // 发送xml请求
  return service({
    url,
    method: 'post',
    data,
    timeout: 1000 * 60 * 2
  })
}

export function DownloadFileWithoutIp(path, type) {
  var u = path
  return serviceWithoutIp({
    method: 'get',
    url: u,
    responseType: type
  })
}

export function uploadFile(path, data) {
  var url = '/filedownload?type=uploadfile&filename_full=' + path

  return service({
    method: 'post',
    url: url,
    data: data,
    responseType: 'xml'
  })
}

export function modelConvert(path, filePathName) {
  var url = '/se_mesh_convert?src_path=' + path + '&path_name=' + filePathName
  return service({
    method: 'get',
    url: url,
    responseType: 'xml'
  })
}

export function GetFilePath(path, type) {
  var url = '/se_publish_tool?type=subdirsfiles'
  var data = '<publishtool><browserpath>' + path + '</browserpath><filter>' + type + '</filter></publishtool>'

  return service({
    method: 'post',
    url: url,
    data: data,
    responseType: 'xml'
  })
}

export function createDirectory(path) {
  var url = '/se_publish_tool?type=createdirectory'
  var data = '<publishtool><browserpath>' + path + '</browserpath></publishtool>'

  return service({
    method: 'post',
    url: url,
    data: data,
    responseType: 'xml'
  })
}
