import { service, serviceWithoutIp } from '@/utils/request'

export function postSearch(data) {
  return service({
    method: 'post',
    url: '/search',
    data
  })
}

export function postDataQuery(data, gisServer) {
  var url = "/dataquery";
  if(gisServer){
    url = gisServer + "dataquery";
  }

  var postDataParam = ''
  for (let key in data) {
      postDataParam += `${key}=${data[key]}&`
  }
  return service({
    method: 'post',
    url: url,
    data: postDataParam
  })
}

export function getPipeline(data, gisServer) {
  var url = "/pipeline";
  if(gisServer){
    url = gisServer + "pipeline";
  }

  return service({
    method: 'get',
    url: url,
    params: data
  })
}

export function postGeoServer(data, gisServer) {
  var url = "/geoserver";
  if(gisServer){
    url = gisServer + "geoserver";
  }

  return service({
    method: 'post',
    url: url,
    data: data
  })
}

export function getSde(url = '/sde', params) { // GET /sde
  return serviceWithoutIp({
    method: 'get',
    url,
    params,
    responseType: 'arraybuffer'
  })
}

/**
 * 根据标准字段取数据库字段或字段名
 */
export function getNameNoIgnoreCase(configJson, standardName, pipeType, returnFiledName) {
  if (standardName === '' || standardName === undefined) {
    return
  }
  if (pipeType === '' || pipeType === undefined) {
    return
  }
  if (!configJson) {
    this.$message({
      message: '无管线字段映射，请配置!',
      type: 'warning'
    })
    return false
  }
  var lineData
  if (pipeType === 1 || pipeType === '1') {
    lineData = configJson.PipelineFieldMap.LineFieldInfo ? configJson.PipelineFieldMap.LineFieldInfo.SystemFieldList.FieldMapItem : null
  } else if (pipeType === 2 || pipeType === '2') {
    lineData = configJson.PipelineFieldMap.RoomFieldInfo ? configJson.PipelineFieldMap.RoomFieldInfo.SystemFieldList.FieldMapItem : null
  } else if (pipeType === 0 || pipeType === '0') {
    lineData = configJson.PipelineFieldMap.PointFieldInfo ? configJson.PipelineFieldMap.PointFieldInfo.SystemFieldList.FieldMapItem : null
  }
  if (lineData && lineData.length) {
    for (const item of lineData) {
      if (item._StandardName == standardName) {
        if (returnFiledName) {
          return item._FieldName.toLowerCase()
        } else {
          return item._CaptionName
        }
      }
    }
  }

  return standardName
}

export function getNameNoIgnoreCase1(configJson, filedName, pipeType, returnFiledName) {
  if (filedName === '' || filedName === undefined) {
    return
  }
  if (pipeType === '' || pipeType === undefined) {
    return
  }
  if (!configJson) {
    this.$message({
      message: '无管线字段映射，请配置!',
      type: 'warning'
    })
    return false
  }
  var lineData
  if (pipeType === 1 || pipeType === '1') {
    lineData = configJson.PipelineFieldMap.LineFieldInfo ? configJson.PipelineFieldMap.LineFieldInfo.SystemFieldList.FieldMapItem : null
  } else if (pipeType === 2 || pipeType === '2') {
    lineData = configJson.PipelineFieldMap.RoomFieldInfo ? configJson.PipelineFieldMap.RoomFieldInfo.SystemFieldList.FieldMapItem : null
  } else if (pipeType === 0 || pipeType === '0') {
    lineData = configJson.PipelineFieldMap.PointFieldInfo ? configJson.PipelineFieldMap.PointFieldInfo.SystemFieldList.FieldMapItem : null
  }
  if (lineData && lineData.length) {
    for (const item of lineData) {
      if (item._FieldName.toLowerCase() == filedName.toLowerCase()) {
        if (returnFiledName) {
          return item._StandardName.toUpperCase()
        } else {
          return item._CaptionName.toUpperCase()
        }
      }
    }
  }

  return filedName
}

export const getValueCfgXml = (() => {
  let valueCfg
  let lastUrl = ''
  return (url, self) => {
    if (valueCfg && url == lastUrl) {
      return Promise.resolve(valueCfg)
    } else {
      return getSde(url).then(res => {
        var x = new Uint8Array(res.data)
        var str = new TextDecoder('gbk').decode(x)
        valueCfg = self.$x2js.xml2js(str)
        lastUrl = url
        return valueCfg
      })
    }
  }
})()

export const getFiledCfgXml = (() => {
  let filedCfg
  let lastUrl = ''
  return (url, self) => {
    if (filedCfg && url == lastUrl) {
      return Promise.resolve(filedCfg)
    } else {
      return getSde(url).then(res => {
        var x = new Uint8Array(res.data)
        var str = new TextDecoder('gbk').decode(x)
        filedCfg = self.$x2js.xml2js(str)
        lastUrl = url
        return filedCfg
      })
    }
  }
})()

export const getFiledCfgXmlUtf8 = (() => {
  let filedCfg
  let lastUrl = ''
  return (url, self) => {
    if (filedCfg && url == lastUrl) {
      return Promise.resolve(filedCfg)
    } else {
      return getSde(url).then(res => {
        var x = new Uint8Array(res.data)
        var str = new TextDecoder('utf8').decode(x)
        filedCfg = self.$x2js.xml2js(str)
        lastUrl = url
        return filedCfg
      })
    }
  }
})()

export function getGeoNameNoIgnoreCase(configJson, fieldName, tableType, returnCaption) {
  if (fieldName === '' || fieldName === undefined) {
    return fieldName
  }
  if (tableType === '' || tableType === undefined) {
    return fieldName
  }
  if (!configJson) {
    this.$message({
      message: '无管线字段映射，请配置!',
      type: 'warning'
    })
    return fieldName
  }

  if (configJson.GeoFieldMap && configJson.GeoFieldMap[tableType] && configJson.GeoFieldMap[tableType].SystemFieldList && configJson.GeoFieldMap[tableType].SystemFieldList.FieldMapItem) {
    var data = configJson.GeoFieldMap[tableType].SystemFieldList.FieldMapItem
    Array.isArray(data) || (data = [data])
    for (let i = 0; i < data.length; i++) {
      var item = data[i]
      if (item._FieldName == fieldName.toUpperCase()) {
        if (returnCaption) {
          return item._CaptionName
        } else {
          return item._StandardName
        }
      }
    }
  }
  return fieldName
}

export function getGeoNameNoIgnoreCaseByStandard(configJson, standardName, tableType, returnCaption) {
  if (standardName === '' || standardName === undefined) {
    return standardName
  }
  if (tableType === '' || tableType === undefined) {
    return standardName
  }
  if (!configJson) {
    this.$message({
      message: '无管线字段映射，请配置!',
      type: 'warning'
    })
    return standardName
  }

  if (configJson.GeoFieldMap && configJson.GeoFieldMap[tableType] && configJson.GeoFieldMap[tableType].SystemFieldList && configJson.GeoFieldMap[tableType].SystemFieldList.FieldMapItem) {
    var data = configJson.GeoFieldMap[tableType].SystemFieldList.FieldMapItem
    Array.isArray(data) || (data = [data])
    for (let i = 0; i < data.length; i++) {
      var item = data[i]
      if (item._StandardName == standardName.toUpperCase()) {
        if (returnCaption) {
          return item._CaptionName
        } else {
          return item._FieldName.toLowerCase()
        }
      }
    }
  }
  return standardName
}

//根据名称获取配置文件的key
export function getNameNoIgnoreCaseByCaptionName(configJson, captionName, pipeType, returnFiledName, flag) {
  if (captionName === '' || captionName === undefined) {
    return
  }
  if (pipeType === '' || pipeType === undefined) {
    return
  }
  if (!configJson) {
    this.$message({
      message: '无管线字段映射，请配置!',
      type: 'warning'
    })
    return false
  }
  var lineData
  if (pipeType === 1 || pipeType === '1') {
    lineData = configJson.PipelineFieldMap.LineFieldInfo ? configJson.PipelineFieldMap.LineFieldInfo.SystemFieldList.FieldMapItem : null
  } else if (pipeType === 2 || pipeType === '2') {
    lineData = configJson.PipelineFieldMap.RoomFieldInfo ? configJson.PipelineFieldMap.RoomFieldInfo.SystemFieldList.FieldMapItem : null
  } else if (pipeType === 0 || pipeType === '0') {
    lineData = configJson.PipelineFieldMap.PointFieldInfo ? configJson.PipelineFieldMap.PointFieldInfo.SystemFieldList.FieldMapItem : null
  }
  if (lineData && lineData.length) {
    for (const item of lineData) {
      if (item._CaptionName == captionName) {
        if (returnFiledName) {
          return item._FieldName.toLowerCase()
        } else {
          return item._StandardName
        }
      }
    }
  }
  return flag ? false : captionName
}

export function getUseYear(configJson, standardName) {
  if (!configJson) {
    this.$message({
      message: '无管线字段映射，请配置!',
      type: 'warning'
    })
    return fieldName
  }
  let year = undefined
  if (configJson.Xml && Array.isArray(configJson.Xml.MaterialType)) {
    for (let i = 0; i < configJson.Xml.MaterialType.length; i++) {
      const el = configJson.Xml.MaterialType[i];
      if (el.Customer === standardName) {
        year = el.UseYear
        break
      }
    }
    return year
  }
}
