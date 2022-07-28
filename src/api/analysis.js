import { service } from '@/utils/request'

export function terrainAltRequest(data) {
  return service({
    method: 'post',
    url: '/analysis?type=calculate_min_max_point&id=',
    data: data,
    responseType: 'arraybuffer'
  })
}

export function dbsdeRequest(url, data) {
  return service({
    method: 'post',
    url: url,
    data: data,
    responseType: 'xml'
  })
}

export function profieRequest(data) {
  return service({
    method: 'post',
    url: '/analysis?type=profile&id=',
    data: data,
    responseType: 'arraybuffer'
  })
}

export function surfaceExcavationAndFillRequest(data) {
  return service({
    method: 'post',
    url: '/analysis?type=surfaceexcavationandfill&id=',
    data: data,
    responseType: 'arraybuffer'
  })
}

export function networkGet(params) { // GET /network
  return service({
    method: 'get',
    url: '/network',
    params
  })
}

export function pipelineGet(params) {
  var url = '/pipeline'
  if(params.gisServer){
    url = params.gisServer + 'pipeline';
    delete params.gisServer
  }

  return service({
    method: 'get',
    url: url,
    params
  })
}
