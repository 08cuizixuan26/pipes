import { deepCopy, createGuid, getFileFromUrl } from '@/utils'
import drawConfig from '../drawConfig'
import Mark from '@/stamplib/Mark'
import localStorage from '@/stamplib/LocalStorage'
import { getTempPath, getOutPath } from '@/api/stampManagerService'
import { uploadFile, createDirectory, modelConvert } from '@/api/common'

var typeNameMap = {
  'model': '模型',
  'billboard': '树',
  'matchmodel': '小品'
}
export default function model(id) {
  return {
    state: 'create',
    type: id,
    typeName: typeNameMap[id],
    tempPath: '',
    createElement: function (self, elmentArr, options) {
      var earth = self.stampAPI.usearth
      var obj = Mark.createModel(earth, window.g_ModelLayer, options)
      if (obj) {
        elmentArr.push(obj)
      }
    },
    uploadFileFunc(self, index, files, guid, uploadFilePath, callback) {
      var that = this
      if (index >= files.length) {
        // 上传服务器后，需要做批量转换
        modelConvert(uploadFilePath, guid).then(res => {
          var data = self.$x2js.xml2js(res.data)
          if (data) {
            callback(data.des_dir)
          }
        })
        return
      }
      uploadFile(uploadFilePath + files[index].name, files[index]).then(resp => {
        if (resp.data === '<xml>file upload success!</xml>') {
          index++
          that.uploadFileFunc(self, index, files, guid, uploadFilePath, callback)
        } else {
          self.$message({
            message: '文件' + files[index].name + '上传失败',
            type: 'error'
          })
        }
      }).catch(() => {
        if (index < files.length) {
          self.$message({
            message: '文件' + files[index].name + '上传失败',
            type: 'error'
          })
        }
      })
    },
    uploadFiles(self, guid, files, callback) {
      var that = this
      return new Promise((resolve, reject) => {
        if (that.tempPath) {
          var uploadFilePath = that.tempPath + '/' + guid + '/'
          createDirectory(uploadFilePath).then(res => {
            that.uploadFileFunc(self, 0, files, guid, uploadFilePath, callback)
          })
        } else {
          getTempPath().then(res => { // 先取临时目录
            if (res.data) {
              that.tempPath = res.data
              var uploadFilePath = that.tempPath + '/' + guid + '/'
              createDirectory(uploadFilePath).then(res => {
                that.uploadFileFunc(self, 0, files, guid, uploadFilePath, callback)
              })
            }
          })
        }
      })
    },
    transformModelInfo(self, modelFile, picFiles, callback) {
      var that = this
      var guid = createGuid()
      that.uploadFiles(self, guid, picFiles, function (data) {
        var fileArr = []
        var fileinfo = {}
        var fileItem = {}
        function getFileFromUrlFunc(fileUrl, files, index, callback) { // 下载数据
          function checkIfReturn() { // 检查是否下载完
            if (index < files.length - 1) {
              index++
              getFileFromUrlFunc(fileUrl, files, index, callback)
            } else {
              localStorage.readFileToArrayBuffer(fileItem, function (fileData) {
                fileinfo = fileData
                callback()
              })
            }
          }
          if ((files[index].name.split('.')[1].toLowerCase() === 'usb' || files[index].name.split('.')[1].toLowerCase() === 'usx') && files[index].name.toLowerCase() !== modelFile.value.toLowerCase()) {
            checkIfReturn()
            return
          }
          getFileFromUrl(fileUrl + files[index].name, files[index].name).then(res => {
            if (res.name.toLowerCase() === modelFile.value.toLowerCase()) {
              fileItem = res
            }
            fileArr.push(res)
            checkIfReturn()
          }).catch(() => {
            checkIfReturn()
          })
        }
        getOutPath().then(res => {
          var outPath = res.data
          var fileUrl = custom_config.server_ip + '/sde?' + outPath + guid + '/'
          getFileFromUrlFunc(fileUrl, picFiles, 0, function () {
            // 新创建时需要先存
            var earth = self.stampAPI.usearth
            localStorage.saveMeshToDB(earth, modelFile.fileinfo.name, fileinfo.data, fileArr, function () {
              callback()
            })
          })
        })
      })
    },
    create: function (self) {
      var that = this
      that.state = 'create'
      var earth = self.stampAPI.usearth
      Mark.createPoint(earth, function (retData) {
        if (!retData) {
          self.$message({
            message: '请至少选择一个点创建' + that.typeName,
            type: 'warning',
            center: true
          })
          return
        }
        retData = StampGis.Cartographic.fromCartesian(retData)
        var dataConf = deepCopy(drawConfig['model'])
        dataConf['name'].value = that.type
        self.$refs.objectDialog.show({
          title: '添加' + that.typeName,
          data: dataConf,
          elementManager: that,
          callbackOK: function () {
            var options = {}
            options.type = that.type
            options.guid = createGuid()
            options.visibility = true
            options.points = retData
            for (var item in dataConf) {
              options[item] = dataConf[item].value
            }
            options['modelFile_Key'] = dataConf['modelFile'].fileinfo.name
            that.transformModelInfo(self, dataConf['modelFile'], dataConf['modelPath'].files, function () {
              that.createModelObj(self, options)
            })
          }
        })
      })
    },
    /**
     * 创建标绘对象和导入SHP线时调用
     * @param {*} self 左侧面板组件
     * @param {*} options 节点信息
     * @param {*} lineObj 绘制时由于要先创建对象，获取长度等信息，对象是提前创建好了的，传进去即可
     * @param {*} parentInfo 导入时放到一个统一的节点里面
     */
    createModelObj: function (self, options) {
      var earth = self.stampAPI.usearth
      var obj = Mark.createModel(earth, window.g_ModelLayer, options)
      if (obj) {
        self.elementArr.push(obj)
        var parentItem = self.data[0]
        parentItem.children.push(options)
        self.checkData.push(options.guid)
        self.expandData.push(options.guid)
        localStorage.saveElementToDB(earth, self.drawType, self.data)
      }
    },
    edit: function (self, data) {
      var that = this
      that.state = 'edit'
      var earth = self.stampAPI.usearth
      var dataConf = deepCopy(drawConfig['model'])
      for (var item in dataConf) {
        dataConf[item].value = data[item]
      }
      // dataConf["modelFile"].disabled = true;
      // dataConf["modelPath"].disabled = true;

      var options = {}
      options.type = that.type
      options.guid = data.guid// createGuid();
      options.visibility = data.visibility
      options.points = data.points
      options['modelFile_Key'] = data['modelFile_Key']
      self.$refs.objectDialog.show({
        title: '编辑' + that.typeName,
        data: dataConf,
        elementManager: that,
        callbackOK: function () {
          for (var item in dataConf) {
            options[item] = dataConf[item].value
          }

          var selIndex = 0
          for (var i = 0; i < self.elementArr.length; i++) {
            if (self.elementArr[i].get_guid() == data.guid) {
              selIndex = i
              break
            }
          }
          if (dataConf['modelFile'].fileinfo || dataConf['modelPath'].files) { // 选了模型文件，或纹理路径
            options['modelFile_Key'] = dataConf['modelFile'].fileinfo.name
            that.transformModelInfo(self, dataConf['modelFile'], dataConf['modelPath'].files, function () {
              var obj = Mark.editModel(earth, self.elementArr[selIndex], window.g_ModelLayer, options)
              if (obj) {
                self.elementArr[selIndex] = obj
                that.saveEditObj(self, obj, options)
              }
            })
            // // 新创建时需要先存
            // localStorage.saveMeshToDB(earth, dataConf['modelFile'].fileinfo.name, dataConf['modelFile'].fileinfo.data, dataConf['modelPath'].files, function(result) {
            //   var obj = Mark.editModel(earth, self.elementArr[selIndex], window.g_ModelLayer, options)
            //   if (obj) {
            //     self.elementArr[selIndex] = obj
            //     that.saveEditObj(self, obj, options)
            //   }
            // })
          } else { // 不涉及到保存纹理
            self.elementArr[selIndex].name = options.name
            self.elementArr[selIndex].description = options.description
            that.saveEditObj(self, self.elementArr[selIndex], options)
          }
        }
      })
    },
    saveEditObj(self, earth, options) { // 保存对象到全局
      for (var i = 0; i < self.data[0].children.length; i++) {
        if (self.data[0].children[i].guid == options.guid) {
          for (var item in self.data[0].children[i]) {
            self.data[0].children[i][item] = options[item]
          }
          break
        }
      }
      var earth = self.stampAPI.usearth
      localStorage.saveElementToDB(earth, self.drawType, self.data)
    },
    /**
         * 删除模型时调用，需要去删除对应的mesh和纹理
         * @param {*} self
         * @param {*} data
         */
    delete(self, data) {
      var that = this
      if (!data) {
        return
      }
      if (data.children && data.children.length > 0) {
        for (var i = 0; i < data.children.length; i++) {
          var item = data.children[i]
          that.delete(self, item)
        }
      } else {
        var bHasMesh = that.hasSameMesh(self.g_ElementData['model3D'].elementJson[0], data)
        if (!bHasMesh) { // 不存在其他对象引用该Mesh时才去删除mesh
          localStorage.deleteMeshFromDB(self.stampAPI.usearth, data['modelFile_Key'])
        }
      }
    },
    hasSameMesh(data, item) {
      var that = this
      if (data) {
        return true
      }
      var bReturn = false
      if (data.children && data.children.length > 0) {
        for (var i = 0; i < data.children.length; i++) {
          var dItem = data.children[i]
          bReturn = that.hasSameMesh(dItem, item)
          if (bReturn) {
            break
          }
        }
      } else {
        if (data.guid != item.guid && data['modelFile_Key'] == item['modelFile_Key']) {
          bReturn = true
        }
      }
      return bReturn
    },
    validate: function (data, self) {
      var that = this
      if (!data['name'].value) {
        self.$message({
          message: '名称不能为空！',
          type: 'warning'
        })
        return false
      }
      if (that.state == 'create') {
        if (!data['modelFile'].value) {
          self.$message({
            message: '请选择' + that.typeName + '文件',
            type: 'warning'
          })
          return false
        }
        if (!data['modelPath'].value) {
          self.$message({
            message: '请选择纹理路径',
            type: 'warning'
          })
          return false
        }
      } else { // 编辑
        if (data['modelFile'].fileinfo && !data['modelPath'].files) { // 选了模型文件，没选纹理路径
          self.$message({
            message: '请选择纹理路径',
            type: 'warning'
          })
          return false
        } else if (!data['modelFile'].fileinfo && data['modelPath'].files) { // 选了纹理路径，没选模型文件
          self.$message({
            message: '请选择' + that.typeName + '文件',
            type: 'warning'
          })
          return false
        }
      }

      return true
    }
  }
}
