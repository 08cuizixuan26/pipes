function pickQuery(_self, _callback) {
  var self = _self
  var callback = _callback
  var earth = self.stampAPI.usearth
  var application = earth.application
  if (
    application._selectedEntityChanged._listeners &&
    application._selectedEntityChanged._listeners.length > 0
  ) {
    application._selectedEntityChanged._listeners.length = 0;
  }
  application.pickingEnable = true
  this.usearth = earth
  this.timeoutVal = null
  var fieldMap = ''
  var pickSelf = this

  this.searchCallback = function (res) {
    application._selectedEntity = undefined
    if (!res) {
      return
    }
    clearLastObj()
    if (Array.isArray(res)) {
      if (res.length == 0) {
        return
      }

      var resultInfo = []

      for (let i = 0; i < res.length; i++) {
        if (res[i].elementObject) {
          res[i].elementObject.altitudeType = 5
          earth.document.elementRoot.attach_object(res[i].elementObject)
          earth.document.register_object(res[i].elementObject)
          res[i].elementObject.show_high_light()
          self.stampAPI.lastObj.push(res[i].elementObject)
        }

        var name = ''
        var data = null
        var queryType = null
        var queryInfo = null
        if (res[i].layer) {
          name = res[i].layer._name

          var type = res[i].layer.get_LayerType().toLowerCase()

          if (type == 'container' || type == 'container_og' || type == 'plate' || type == 'well' || type == 'joint' || type == 'equipment' || type == 'room' || type == 'joint_og') {
            // 管线
            var layerId = res[i].layer._id
            var layerGuid = layerId.split('_')[0]
            var layerType = layerId.split('_')[1]
            var layer = earth.LayerManager.GetLayerByGUID(layerGuid)
            if (layer) {
              name = layer._name
            } else {
              name = type
            }
            if (res[i].properties && res[i].properties.properties && getPipelineFieldMap(earth.document.rootFolder, layerGuid)) {
              var data = res[i].properties.properties
              var key = res[i].properties.properties.Key

              queryType = 'pipe'
              queryInfo = { fieldMap: fieldMap, layerType: layerType, layerGuid: layerGuid, key: key, gisServer: layer._gis_server_connection }
            }
          } else if (res[i].layer._rtti === 135) {
            // BIM
            const keyArr = res[i].properties.properties.Key.split('_')
            const connection = res[i].layer._property_server_connection.split('?')[1]
            const key = keyArr[0]
            const path = connection + keyArr[1] + '.sdb'

            queryType = 'BIM'
            queryInfo = { path: path, key: key }
          } else if (type !== 'tileblock') { // 非TileBlock的模型
            if (res[i].layer._gis_server_connection) { // 带GISServer
              var keyFieldXml = res[i].layer.keyField;
              var url = res[i].layer._gis_server_connection + 'geoserver?service=' + res[i].layer._id + '&qt=16&pg=0,10';
              var sc = "";
              if (self.g_Project.selectQueryMethod == 1) {
                var lon = (res[i].layer._bound.east + res[i].layer._bound.west) / 2
                var lat = (res[i].layer._bound.north + res[i].layer._bound.south) / 2
                lon = StampGis.StampMath.toDegrees(lon)
                lat = StampGis.StampMath.toDegrees(lat)
                sc = '&sc=(3,0,0.001,' + lon + ',' + lat + ',0' + ')'
                // url = res[i].layer._gis_server_connection + 'geoserver?service=' + res[i].layer._id + '&encoding=utf-8&qt=16&pg=0,10' + src
              } else {
                // var keyField = res[i].layer.keyField
                // var src = `&pc=(and,equal,${keyField},${res[i].properties.properties.Key})`
                // url = res[i].layer._gis_server_connection + 'geoserver?service=' + res[i].layer._id + '&encoding=utf-8&qt=16&pg=0,10' + src
              }

              queryType = 'GISServer'
              queryInfo = { url: url, fieldXml: keyFieldXml, key: res[i].properties.properties.Key}
              if(sc){
                queryInfo.sc = sc;
              }
            }
          } else if (type == 'tileblock') {
            if (res[i].layer._gis_server_connection) {
              var keyFieldXml = res[i].layer.keyField;
              var keyField = 'gid'
              var pc = `&pc=(and,equal,${keyField},${res[i].properties.properties.gid})`
              var url = res[i].layer._gis_server_connection + 'geoserver?service=' + res[i].layer._id + '&qt=16&pg=0,10'
              queryType = 'GISServer'
              queryInfo = { url: url, pc: pc, fieldXml: keyFieldXml}
            }
          }

          data = res[i].properties.properties
          if (pickSelf.timeoutVal) {
            clearInterval(pickSelf.timeoutVal)
            pickSelf.timeoutVal = null
          }
          pickSelf.timeoutVal = setInterval(function () {
            res[i].layer._highlight_objs = []
          }, STAMP_config.highLightTime)
        } else if (res[i].imageryLayer) {
          // 矢量瓦片
          name = res[i].imageryLayer._name
          data = res[i].properties
          // if (res[i].screenCoord) {
            var keyFieldXml = res[i].imageryLayer.keyField;
            var keyField = 'gid'
            var src = `&pc=(and,equal,${keyField},${res[i].properties.gid})`
            var url = res[i].imageryLayer._baseUrl + 'geoserver?service=' + res[i].imageryLayer._id + '&encoding=utf-8&qt=16&pg=0,10'
            queryType = 'GISServer'
            queryInfo = { url: url, pc: src, fieldXml: keyFieldXml }
          // }
        }

        var result = []
        for (var key in data) {
          if (key != 'SHAPE' && key != 'SHAPE_AREA' && key != 'SHAPE_LEN' && key != 'geometry') {
            result.push({
              key: key,
              value: data[key]
            })
          }
        }
        resultInfo.push({
          result: result,
          name: name,
          queryType: queryType,
          queryInfo: queryInfo
        })
      }

      callback(resultInfo[0].result, resultInfo, this)
    }
  }

  var getPipelineFieldMap = function (root, id) {
    var flag = false
    for (var i = 0; i < root.getChildCount(); i++) {
      var subLayer = root.getChildAt(i)
      if (subLayer.getChildCount === undefined) {
        if (subLayer.get_guid() == id) {
          flag = true
          break
        }
      } else {
        if (subLayer._curProject != undefined) {
          var project = subLayer.get_guid()
          var index = subLayer.SpatialReference.indexOf('sde?')
          var temp =
            subLayer.SpatialReference.slice(0, index + 4) +
            'projectID=' +
            project +
            '&file='
          fieldMap = subLayer.FieldMap != ''
            ? temp + subLayer.FieldMap.slice(index + 4)
            : ''
        }
        flag = getPipelineFieldMap(subLayer, id)
        if (flag) {
          break
        }
      }
    }
    return flag
  }

  var clearLastObj = function () {
    if (self.stampAPI.lastObj.length > 0) {
      for (var i = 0; i < self.stampAPI.lastObj.length; ++i) {
        // self.stampAPI.lastObj[i]
        earth.document.elementRoot.detach_object(self.stampAPI.lastObj[i])
      }
      self.stampAPI.lastObj = []
    }
  }

  var that = this
  application._selectedEntityChanged.addEventListener(this.searchCallback)
  earth.OnRBClick = function () {
    application.pickingEnable = false
    if (application._selectedEntityChanged._listeners && application._selectedEntityChanged._listeners.length > 0) {
      application._selectedEntityChanged.removeEventListener(that.searchCallback)
    }
  }

  this.cancelPickQuery = function () {
    this.usearth.application.pickingEnable = false  //
    if (this.usearth.application._selectedEntityChanged._listeners && this.usearth.application._selectedEntityChanged._listeners.length > 0) {
      this.usearth.application._selectedEntityChanged.removeEventListener(this.searchCallback)
    }
  }
}

export default pickQuery
