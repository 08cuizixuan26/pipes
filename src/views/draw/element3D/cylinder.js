import { deepCopy, createGuid } from '@/utils'
import drawConfig from '../drawConfig'
import Mark from '@/stamplib/Mark'
import localStorage from '@/stamplib/LocalStorage'

export default {
  createElement: function(self, elmentArr, options) {
    var earth = self.stampAPI.usearth
    var obj = Mark.createElementCylinder(earth, options)
    if (obj) {
      elmentArr.push(obj)
    }
  },
  create: function(self) {
    var that = this
    var earth = self.stampAPI.usearth
    Mark.createCylinder(earth, function(retData) {
      if (retData.location == undefined) {
        self.$message({
          message: '请完成创建圆柱绘制',
          type: 'warning',
          center: true
        })
        return
      }

      var dataConf = deepCopy(drawConfig['cylinder'])
      dataConf.height.value = retData.height
      dataConf.radius.value = retData.radius
      self.$refs.objectDialog.show({
        title: '添加圆柱',
        data: dataConf,
        elementManager: that,
        callbackOK: function() {
          var options = {}
          options.type = 'cylinder'
          options.guid = createGuid()
          options.visibility = true
          options.locationDegree = retData.location
          options.radius = retData.radius
          options.height = retData.height

          for (var item in dataConf) {
            options[item] = dataConf[item].value
          }
          that.createElementObj(self, options)
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
  createElementObj: function(self, options, parentInfo) {
    var earth = self.stampAPI.usearth
    var obj = Mark.createElementCylinder(earth, options)
    if (obj) {
      self.elementArr.push(obj)
      var parentItem = parentInfo || self.data[0]
      parentItem.children.push(options)
      self.checkData.push(options.guid)
      self.expandData.push(options.guid)
      localStorage.saveElementToDB(earth, self.drawType, self.data)
    }
  },
  edit: function(self, data) {
    var that = this
    var earth = self.stampAPI.usearth
    var dataConf = deepCopy(drawConfig['cylinder'])
    for (var item in dataConf) {
      dataConf[item].value = data[item]
    }
    self.$refs.objectDialog.show({
      title: '编辑圆柱',
      data: dataConf,
      elementManager: that,
      callbackOK: function() {
        var options = {}
        options.type = 'cylinder'
        options.guid = data.guid// createGuid();
        options.visibility = data.visibility
        options.locationDegree = data.locationDegree
        options.radius = data.radius
        options.height = data.height
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
        var obj = Mark.editElementCylinder(self.elementArr[selIndex], options)
        if (obj) { // 保存对象到全局
          self.elementArr[selIndex] = obj

          for (var i = 0; i < self.data[0].children.length; i++) {
            if (self.data[0].children[i].guid == options.guid) {
              for (var item in self.data[0].children[i]) {
                self.data[0].children[i][item] = options[item]
              }
              break
            }
          }
        }
        localStorage.saveElementToDB(earth, self.drawType, self.data)
      }
    })
  },
  validate: function(data) {
    return true
  }
}