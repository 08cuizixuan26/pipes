export default {
  buffer2String: function (buf) { // ArrayBuffer转为字符串，参数为ArrayBuffer对象
    var uintArr = new Uint16Array(buf)
    return String.fromCharCode.apply(null, uintArr)
  },
  string2Buffer: function (str) { // 字符串转为ArrayBuffer对象，参数为字符串
    var buf = new ArrayBuffer(str.length * 2) // 每个字符占用2个字节
    var bufView = new Uint16Array(buf)
    for (var i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i)
    }
    return buf
  },
  saveElementToDB: function (earth, drawType, telementJson) {
    var elementJson = JSON.stringify(telementJson)
    earth.application.db_helper.save_global_data(drawType, elementJson, function () {
      console.log('save indexdb success')
    })
  },
  readElementFromDB: function (earth, elementData, callback) {
    //console.log('begin read')
    for (var item in elementData) {
      (function (dbElementItem) {
        earth.application.db_helper.load_global_data(dbElementItem, function (jsonResult) {
          if (jsonResult && jsonResult.result && jsonResult.data) {
            console.log('read indexdb success')
            var jsonData = JSON.parse(jsonResult.data)
            elementData[dbElementItem].elementJson = jsonData
            if (typeof callback === 'function') {
              callback(elementData[dbElementItem].elementArr, jsonData)
            }
          }
        })
      })(item)
    }
  },
  getFileKey: function (file) {
    var name = file.name
    var mdate = file.lastModified
    var size = file.size
    name = name + '_' + mdate + '_' + size
    return name
  },
  readFileToText: function (file, callback) {
    var name = file.name
    var mdate = file.lastModified
    var size = file.size
    name = name + '_' + mdate + '_' + size

    var reader = new FileReader()
    reader.readAsText(file)
    reader.onload = function (oFREvent) {
      var fileText = oFREvent.target.result
      if (typeof callback === 'function') {
        callback({
          name: name,
          data: fileText
        })
      }
    }
  },
  readFileToArrayBuffer: function (file, callback) {
    var name = file.name
    var mdate = file.lastModified
    var size = file.size
    name = name + '_' + mdate + '_' + size

    var reader = new FileReader()
    reader.readAsArrayBuffer(file)
    reader.onload = function (oFREvent) {
      var fileText = oFREvent.target.result
      if (typeof callback === 'function') {
        callback({
          name: name,
          data: fileText
        })
      }
    }
  },
  /**
     * 保存数据到IndexDB
     * @param {*} earth
     * @param {*} name
     * @param {*} data
     * @param {*} callback
     */
  saveToDB: function (earth, name, data, callback) {
    if (!name) {
      if (callback && typeof callback === 'function') {
        callback(null)
      }
      return
    }
    earth.application.db_helper.save_global_data(name, data, function (result) {
      console.log('save fileinfo success')
      if (callback && typeof callback === 'function') {
        callback(result)
      }
    })
  },
  /**
     * 添加数据到IndexDB
     * @param {*} earth
     * @param {*} name
     * @param {*} data
     * @param {*} callback
     */
  addToDB(earth, name, data, callback) {
    if (!name) {
      if (callback && typeof callback === 'function') {
        callback(null)
      }
      return
    }
    earth.application.db_helper.add_global_data(name, data, function (result) {
      console.log('add fileinfo success')
      if (callback && typeof callback === 'function') {
        callback(result)
      }
    })
  },
  /**
     * 从IndexDB数据库读取指定Key的数据
     * @param {*} earth
     * @param {*} name
     * @param {*} callback
     */
  readFromDB: function (earth, name, callback) {
    if (!name) {
      if (callback && typeof callback === 'function') {
        callback(null)
      }
      return
    }
    earth.application.db_helper.load_global_data(name, function (result) {
      if (callback && typeof callback === 'function') {
        callback(result.data)
      }
    })
  },
  /**
     * 保存纹理
     * @param {*} earth
     * @param {*} name
     * @param {*} meshData
     * @param {*} textureFiles
     * @param {*} callback
     */
  saveMeshToDB(earth, name, meshData, textureFiles, callback) {
    if (!name) {
      if (callback && typeof callback === 'function') {
        callback(null)
      }
      return
    }
    StampGis.MeshTextureWithIndexDb.SaveMesh(earth.application.db_helper, name, meshData, textureFiles, function (result) {
      if (callback && typeof callback === 'function') {
        callback(result)
      }
    })
  },
  /**
     * 删除纹理
     * @param {*} earth
     * @param {*} name
     * @param {*} callback
     */
  deleteMeshFromDB(earth, name, callback) {
    if (!name) {
      if (callback && typeof callback === 'function') {
        callback(result)
      }
      return
    }
    StampGis.MeshTextureWithIndexDb.DeleteMesh(earth.application.db_helper, name, function (result) {
      if (callback && typeof callback === 'function') {
        callback(result)
      }
    })
  },
  /**
     * 清除IndexDB数据库中指定Key数据
     * @param {*} earth
     * @param {*} name
     */
  deleteFromDB: function (earth, name) {
    if (!name) {
      return
    }
    earth.application.db_helper.delete_global_data(name, function (result) {
    })
  }
}
