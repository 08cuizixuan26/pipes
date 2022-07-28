import { service } from '@/utils/request'

export function GetGeoLayerFields(id) {
  var url = '/geoserver?service=' + id + '&qt=0&time=' + new Date();
  return service({
    method: 'get',
    url: url,
    responseType: 'text'
  })
}

export function GetValueByField(id, field) {
  var u = '/geoserver?service=' + id + '&qt=2' + '&cf=' + field;
  return service({
    method: 'get',
    url: u,
    responseType: 'text'
  })
}

export function uploadfile(path, data) {
  var u = '/filedownload?type=uploadfile&filename_full=' + path;
  return service({
    method: 'post',
    url: u,
    data: data,
    responseType: 'xml'
  })
}