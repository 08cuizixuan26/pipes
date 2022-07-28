import { serviceWithoutIp } from '@/utils/request'

export function queryBIMProperties(path, entity) {
  var url = custom_config.sqliteQuery + '/services/BIMQuery/getBIMProperties?'
  url += 'path=' + path
  url += '&entity=' + entity

  return serviceWithoutIp({
    method: 'get',
    url: url,
    responseType: 'json'
  })
}

const stampManager = { // custom_config.stampManagerUrl
  addPubLayerUrl: custom_config.stampManagerUrl + '/dataConfigAction.do?method=addPubLayerData&disableFilter=true',
  updateLayerUrl: custom_config.stampManagerUrl + '/dataConfigAction.do?method=updateLayerData&disableFilter=true',
  requestDataLink: custom_config.stampManagerUrl + '/dataConfigAction.do?method=requestDataLink&disableFilter=true',
  createDirectory: custom_config.stampManagerUrl + '/dataConfigAction.do?method=createDirectory&disableFilter=true',
  addLayerUrl: custom_config.stampManagerUrl + '/dataConfigAction.do?method=addLayerData&disableFilter=true',
  deleteLayerUrl: custom_config.stampManagerUrl + '/dataConfigAction.do?method=deleteLayerData&disableFilter=true',
  getTempPathUrl: custom_config.stampManagerUrl + '/dataConfigAction.do?method=getTempPath&disableFilter=true',
  getOutPathUrl: custom_config.stampManagerUrl + '/dataConfigAction.do?method=getOutPath&disableFilter=true',
  getLayerTable: custom_config.stampManagerUrl + '/dataConfigAction.do?method=getLayerTable&disableFilter=true'
}

export function getLayerTable(layerId) {
  return serviceWithoutIp({
    method: 'get',
    url: stampManager.getLayerTable + '&layerid=' + layerId,
    responseType: 'text'
  })
}

export function getTempPath() {
  return serviceWithoutIp({
    method: 'get',
    url: stampManager.getTempPathUrl,
    responseType: 'text'
  })
}

export function getOutPath() {
  return serviceWithoutIp({
    method: 'get',
    url: stampManager.getOutPathUrl,
    responseType: 'text'
  })
}

export function getSearchFields(layerId) {
  var u = custom_config.stampManagerUrl + '/rest/StampService/getPbfColumn?layerid=' + layerId
  return serviceWithoutIp({
    method: 'get',
    url: u,
    responseType: 'text'
  })
}

export function updateVectorStyle(id, path) {
  var u = stampManager.updateLayerUrl + '&dataType=VectorTile&layerId=' + id + '&dataName=MapFile&dataValue=' + path
  return serviceWithoutIp({
    method: 'get',
    url: u,
    responseType: 'xml'
  })
}

export function updateBlockStyle(id, path) {
  var u = stampManager.updateLayerUrl + '&dataType=TileBlock&layerId=' + id + '&dataName=Style&dataValue=' + path
  return serviceWithoutIp({
    method: 'get',
    url: u,
    responseType: 'xml'
  })
}

export function GetFilePath(path, type) {
  var getFilePathUrl = stampManager.requestDataLink
  if (path) {
    getFilePathUrl += '&reqPath=' + path
  }
  if (type) {
    getFilePathUrl += '&reqFileType=' + type
  }

  return serviceWithoutIp({
    method: 'get',
    url: getFilePathUrl,
    responseType: 'xml'
  })
}

export function addGeologyLayerData(guid, name, projectId, dataNameStr, dataValueStr) {
  var url = stampManager.addLayerUrl
  url += '&dataType=EditGeologyLayer'
  url += '&layerId=' + guid
  url += '&name=' + name
  url += '&projectId=' + projectId
  url += '&dataName=' + dataNameStr
  url += '&dataValue=' + dataValueStr
  url += '&gisName=' + dataNameStr
  url += '&gisValue=' + dataValueStr

  return serviceWithoutIp({
    method: 'get',
    url: url,
    responseType: 'text'
  })
}

export function updateGeologyLayerData(guid, dataNameStr, dataValueStr) {
  var url = stampManager.updateLayerUrl
  url += '&layerId=' + guid
  url += '&dataName=' + dataNameStr
  url += '&dataValue=' + dataValueStr
  url += '&gisName=' + dataNameStr
  url += '&gisValue=' + dataValueStr

  return serviceWithoutIp({
    method: 'get',
    url: url,
    responseType: 'text'
  })
}

export function addPipelineLayerData(guid, name, projectId, pipeType, path, color, tableInfo) {
  var url = stampManager.addLayerUrl
  url += '&dataType=PipelineLayer'
  url += '&layerId=' + guid
  url += '&name=' + name
  url += '&projectId=' + projectId
  url += '&dataName=PipelineType,GISServer,HTTPLink,'
  url += 'LonLatRectNorth,LonLatRectSouth,LonLatRectEast,LonLatRectWest,LonLatRectMinHeight,LonLatRectMaxHeight,'
  url += 'SubLayers,CustomColor,Height,Level,Visibility,Underground,KeyLine,MScope,PScope'
  url += '&dataValue=' + pipeType + ',' + custom_config.server_ip + '/,' + custom_config.server_ip.replace('http', 'db') + '/sde?' + path
  url += ',90.0,-90.0,180.0,-180.0,0,0,'
  url += '0,' + color + ',1,14,true,true,false,0,0'
  url += '&gisName=PolylineTable,PointTable,PolygonTable,DangerPointTable,Code'
  url += '&gisValue='
  for (var key in tableInfo) {
    url += tableInfo[key] + ','
  }
  url += pipeType
  return serviceWithoutIp({
    method: 'get',
    url: url,
    responseType: 'xml'
  })
}

export function updatePipelineLayerData(id, subLayers) {
  var updateLayerUrl = stampManager.updateLayerUrl
  updateLayerUrl += '&layerId=' + id
  updateLayerUrl += '&dataName=SubLayers'
  updateLayerUrl += '&dataValue=' + subLayers

  return serviceWithoutIp({
    method: 'get',
    url: updateLayerUrl,
    responseType: 'xml'
  })
}

export function addPubLayerData(name, projectId, pubPathName, layerType, priority, level, lonlatbox) {
  var url = stampManager.addPubLayerUrl
  url += '&name=' + name
  url += '&projectId=' + projectId
  url += '&pubPathName=' + pubPathName
  if (layerType == 'dom') {
    url += '&dataType=DOMLayer'
    url += '&dataName=Priority,MinLevel,MaxLevel,LonLatRectNorth,LonLatRectSouth,LonLatRectEast,LonLatRectWest,LonLatRectMinHeight,LonLatRectMaxHeight,Visibility'
    url += '&dataValue='
    url += priority + ',' + ((level == null || level == '') ? '7,19' : level) + ',' + ((lonlatbox == null || lonlatbox == '') ? '90.0,-90.0,180.0,-180.0,0,0' : lonlatbox) + ',true'
  } else if (layerType == 'grid') {
    url += '&dataType=DEMLayer'
    url += '&dataName=DEMType,Priority,MinLevel,MaxLevel,LonLatRectNorth,LonLatRectSouth,LonLatRectEast,LonLatRectWest,LonLatRectMinHeight,LonLatRectMaxHeight,Visibility'
    url += '&dataValue=GRID,'
    url += priority + ',' + ((level == null || level == '') ? '7,19' : level) + ',' + ((lonlatbox == null || lonlatbox == '') ? '90.0,-90.0,180.0,-180.0,0,0' : lonlatbox) + ',true'
  } else if (layerType == 'tin') {
    url += '&dataType=DEMLayer'
    url += '&dataName=DEMType,Priority,MinLevel,MaxLevel,LonLatRectNorth,LonLatRectSouth,LonLatRectEast,LonLatRectWest,LonLatRectMinHeight,LonLatRectMaxHeight,Visibility'
    url += '&dataValue=TIN,'
    url += priority + ',' + ((level == null || level == '') ? '7,19' : level) + ',' + ((lonlatbox == null || lonlatbox == '') ? '90.0,-90.0,180.0,-180.0,0,0' : lonlatbox) + ',true'
  } else if (layerType == 'oblique') {
    url += '&dataType=ObliquePhotoLayer'
    url += '&dataName=Visibility,Height,Underground,DataType,AltitudeOffset,MaxScreenSpaceError'
    url += '&dataValue='
    url += 'true,4.5,false,Building,0,16'
  } else if (layerType == 'model') {
    url += '&dataType=ModelLayer'
    url += '&dataName=Visibility,Underground,TwoSided'
    url += '&dataValue='
    url += 'true,false,true'
  } else if (layerType == 'lod') {
    url += '&dataType=ModelLODLayer'
    url += '&dataName=Height,Visibility,Underground,DataType'
    url += '&dataValue='
    url += '4.5,true,false,Building'
  } else if (layerType == 'match') {
    url += '&dataType=MatchModelLayer'
    url += '&dataName=Height,VisibleRange,Visibility,Underground'
    url += '&dataValue='
    url += '1,1,true,false'
  } else if (layerType == 'billboard') {
    url += '&dataType=BillboardLayer'
    url += '&dataName=Height,VisibleRange,Visibility,Underground'
    url += '&dataValue='
    url += '1,1,true,false'
  }

  return serviceWithoutIp({
    method: 'get',
    url: url,
    responseType: 'xml'
  })
}

export function updatePubLayerData(id, rectStr, layerType) {
  var updateLayerUrl = stampManager.updateLayerUrl
  if (layerType == 'dom') {
    updateLayerUrl += '&dataType=DOMLayer'
  } else if (layerType == 'grid' || layerType == 'tin') {
    updateLayerUrl += '&dataType=DEMLayer'
  } else if (layerType == 'oblique') {
    updateLayerUrl += '&dataType=ObliquePhotoLayer'
  }
  updateLayerUrl += '&layerId=' + id
  updateLayerUrl += '&dataName=LonLatRectNorth,LonLatRectSouth,LonLatRectEast,LonLatRectWest,LonLatRectMinHeight,LonLatRectMaxHeight'
  updateLayerUrl += '&dataValue=' + rectStr

  return serviceWithoutIp({
    method: 'get',
    url: updateLayerUrl,
    responseType: 'xml'
  })
}

export function deletePubLayerData(guid) {
  var deleteLayerUrl = stampManager.deleteLayerUrl
  deleteLayerUrl += '&layerId=' + guid

  return serviceWithoutIp({
    method: 'get',
    url: deleteLayerUrl,
    responseType: 'xml'
  })
}

export function createDirectory(path) {
  var getFilePathUrl = stampManager.createDirectory
  if (path) {
    getFilePathUrl += '&datapath=' + path
  }

  return serviceWithoutIp({
    method: 'get',
    url: getFilePathUrl,
    responseType: 'xml'
  })
}
