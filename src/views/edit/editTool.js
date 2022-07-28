import localStorage from '@/stamplib/LocalStorage'
import drawObj from '../draw/index'
import { deepCopy, createGuid } from '@/utils'

var earth = null
var firstPosition
function select(self) {
  self.stampAPI.usearth.ToolManager.ObjectEditTool.Select()
  self.stampAPI.usearth.SelectSet.on_select_changed = function () {
    self.stampAPI.usearth.SelectSet.on_select_changed = function () { }
    closeDialog(self)
  }
}

function onSelectChanged(self) {
  var earth = self.stampAPI.usearth
  var totalCount = earth.SelectSet.GetTotalCount()
  if (totalCount == 0) {
    self.$store.state.showMoveDialog = false
  }
}

/**
 * 循环更新所有选中对象的节点
 * @param {*} earth
 * @param {*} elementData
 * @param {*} location
 * @param {*} rotation
 * @param {*} scale
 */
function update(self, elementData, location, rotation, scale, points) {
  var earth = self.stampAPI.usearth
  var totalCount = earth.SelectSet.GetTotalCount()
  for (var i = 0; i < totalCount; ++i) {
    var obj = earth.SelectSet.GetOverallObject(i)
    updateNode(earth, elementData, obj, location, rotation, scale, points)
  }
}

/**
 * 显示编辑气泡
 * @param  {[type]} editFlag [编辑类型]
 * @return {[type]}          [description]
 */
var showEditDialog = function (self, editFlag) {
  var earth = self.stampAPI.usearth
  var selectSet = earth.SelectSet
  var bShow = true // 是否显示
  var sAltitudeType = true // 是否是贴地的模型
  for (var i = 0; i < selectSet.GetTotalCount(); i++) {
    var element = selectSet.GetOverallObject(i)
    if (i == 0) {
      firstPosition = element.transform.get_position_sphr()
    }
    if (element.Aspect) { // 宽高比例
      bShow = false
    }
    if (element.get_altitude_type == undefined || element.get_altitude_type() == '0') { // 0：正常
      sAltitudeType = false
    }
  }

  // 下面是显示编辑的气泡
  if (bShow && earth.SelectSet.GetTotalCount() != 0) {
    if (editFlag === 'move') { // 移动
      showDialog(self, 'move', sAltitudeType)
    } else if (editFlag === 'scale') { // 缩放
      showDialog(self, 'scale', sAltitudeType)
    } else if (editFlag === 'rotate') { // 旋转
      showDialog(self, 'rotate', sAltitudeType)
    }
  } else {
    closeDialog(self)
  }
}

function showDialog(self, type, sAltitudeType) {
  self.$store.state.moveDialogData.showMoveDialog = true
  self.$store.state.moveDialogData.editType = type

  if (type == 'rotate') {
    self.$store.state.moveDialogData.XDisabled = sAltitudeType
    self.$store.state.moveDialogData.YDisabled = false
    self.$store.state.moveDialogData.ZDisabled = sAltitudeType
  } else {
    self.$store.state.moveDialogData.XDisabled = false
    self.$store.state.moveDialogData.YDisabled = sAltitudeType
    self.$store.state.moveDialogData.ZDisabled = false
  }
  if (type == 'scale') {
    self.$store.state.moveDialogData.X = 1
    self.$store.state.moveDialogData.Y = 1
    self.$store.state.moveDialogData.Z = 1
  } else {
    self.$store.state.moveDialogData.X = 0
    self.$store.state.moveDialogData.Y = 0
    self.$store.state.moveDialogData.Z = 0
  }
}

function closeDialog(self) {
  self.$store.state.moveDialogData.showMoveDialog = false
  self.$store.state.moveDialogData.XDisabled = false
  self.$store.state.moveDialogData.YDisabled = false
  self.$store.state.moveDialogData.ZDisabled = false
}

/**
 * 移动
 * @param {*} earth
 * @param {*} self
 */
function move(self, elementData) {
  var earth = self.stampAPI.usearth
  earth.ToolManager.ObjectEditTool.Move({
    axis_status: 7,
    custom_excute_finish: function (result) {
      if (result.spherical_offset !== undefined) { // 偏移是弧度值，而且Y和Z是反的
        update(self, elementData, result.spherical_offset, null, null)
      } else {
        setTimeout(function () {
          showEditDialog(self, 'move')
        }, 10)
      }
    }
  })
  setOperate(self, 'move')
}

function setOperate(self, type) {
  showEditDialog(self, type)
}

/**
 * 根据输入值移动
 * @param {*} self
 * @param {*} x
 * @param {*} y
 * @param {*} z
 */
function moveByValue(self, offset) {
  var earth = self.stampAPI.usearth

  // 移动对象
  earth.ToolManager.ObjectEditTool.MoveSelectObject({
    dX: offset.x,
    dY: offset.y,
    dZ: offset.z
  })

  // 保存
  var selectSet = earth.SelectSet
  for (var i = 0; i < selectSet.GetTotalCount(); i++) {
    var element = selectSet.GetOverallObject(i)
    updateNode(earth, self.g_ElementData, element, offset, null, null)
  }
}

/**
 * 旋转
 * @param {*} self
 * @param {*} self
 */
function rotate(self, elementData) {
  var earth = self.stampAPI.usearth
  earth.ToolManager.ObjectEditTool.Rotate({
    axis_status: 7,
    custom_excute_finish: function (result) {
      if (result.rotation_offset !== undefined) {
        // self.$store.state.moveDialogData.X = result.rotation_offset.x?StampGis.StampMath.toDegrees(result.rotation_offset.x).toFixed(2):0;
        // self.$store.state.moveDialogData.Y = result.rotation_offset.y?StampGis.StampMath.toDegrees(result.rotation_offset.y).toFixed(2):0;
        // self.$store.state.moveDialogData.Z = result.rotation_offset.z?StampGis.StampMath.toDegrees(result.rotation_offset.z).toFixed(2):0;
        update(self, elementData, null, result.rotation_offset, null)
      } else {
        setTimeout(function () {
          showEditDialog(self, 'rotate')
        }, 10)
      }
    }
  })
  setOperate(self, 'rotate')
}

/**
 * 根据输入值旋转
 * @param {*} self
 * @param {*} x
 * @param {*} y
 * @param {*} z
 */
function rotateByValue(self, offset) {
  var earth = self.stampAPI.usearth

  // 旋转对象
  earth.ToolManager.ObjectEditTool.RotateSelectObject({
    dX: offset.x,
    dY: offset.y,
    dZ: offset.z
  })

  // 保存
  var selectSet = earth.SelectSet
  for (var i = 0; i < selectSet.GetTotalCount(); i++) {
    var element = selectSet.GetOverallObject(i)
    updateNode(earth, self.g_ElementData, element, null, offset, null)
  }
}

/**
 * 缩放
 * @param {*} self
 * @param {*} self
 */
function scale(self, elementData) {
  var earth = self.stampAPI.usearth
  earth.ToolManager.ObjectEditTool.Scale({
    axis_status: 7,
    custom_excute_finish: function (result) {
      if (result.scaling_offset !== undefined) {
        // self.$store.state.moveDialogData.X = result.scaling_offset.x?result.scaling_offset.x.toFixed(2):1;
        // self.$store.state.moveDialogData.Y = result.scaling_offset.y?result.scaling_offset.y.toFixed(2):1;
        // self.$store.state.moveDialogData.Z = result.scaling_offset.z?result.scaling_offset.z.toFixed(2):1;
        update(self, elementData, null, null, result.scaling_offset)
      } else {
        setTimeout(function () {
          showEditDialog(self, 'scale')
        }, 10)
      }
    }
  })
  setOperate(self, 'scale')
}

/**
 * 根据输入值缩放
 * @param {*} self
 * @param {*} x
 * @param {*} y
 * @param {*} z
 */
function scaleByValue(self, offset) {
  var earth = self.stampAPI.usearth

  // 缩放对象
  earth.ToolManager.ObjectEditTool.ScaleSelectObject({
    dX: offset.x,
    dY: offset.y,
    dZ: offset.z
  })

  var selectSet = earth.SelectSet
  for (var i = 0; i < selectSet.GetTotalCount(); i++) {
    var element = selectSet.GetOverallObject(i)
    updateNode(earth, self.g_ElementData, element, null, null, offset)
  }
}

/**
 * 根据guid找到该节点
 * @param {*} data
 * @param {*} guid
 */
function getElementObj(data, guid) {
  for (var i = 0; i < data.length; i++) {
    if (data[i].children) {
      var item = getElementObj(data[i].children, guid)
      if (item) {
        return item
      }
    } else if (data[i].guid == guid) {
      return data[i]
    }
  }
  return null
}

/**
 * 根据guid删除该节点
 * @param {*} data
 * @param {*} guid
 */
function removeElementObj(self, data, guid) {
  for (var i = 0; i < data.children.length; i++) {
    if (data.children[i].children) {
      return removeElementObj(self, data.children[i], guid)
    } else if (data.children[i].guid == guid) {
      if (drawObj[data.children[i].type] && typeof drawObj[data.children[i].type].delete === 'function') {
        drawObj[data.children[i].type].delete(self, data.children[i])
      }
      data.children.splice(i, 1)
      return true
    }
  }
  return false
}

/**
 * 更新数据库
 * @param {*} elementData
 * @param {*} earth
 * @param {*} guid
 * @param {*} location
 * @param {*} rotation
 * @param {*} scale
 */
function updateNode(earth, elementData, elementObj, location, rotation, scale, points) {
  if (location || rotation || scale || points) {
    if (!elementData) {
      return
    }
    for (var item in elementData) {
      if (elementData[item] && elementData[item].elementJson && elementData[item].elementJson[0]) {
        var obj = getElementObj(elementData[item].elementJson[0].children, elementObj.get_guid())
        if (obj) {
          if (location) {
            obj.location = elementObj.transform.get_position_sphr() // addLocation(obj.location, location);
          }
          if (rotation) {
            obj.rotation = elementObj.transform.get_rotation() // addRotation(obj.rotation, rotation);
          }
          if (scale) {
            obj.scale = elementObj.transform.get_scale() // addScale(obj.scale, scale);
          }
          if (points) {
            var pointArr = elementObj.get_control_geometry_data().get_coordinates_geo()
            if (pointArr && pointArr.length > 0) {
              obj['points'] = pointArr[0]// 外环
              if (pointArr.length > 1) {
                obj['innerPoints'] = []
                for (var i = 1; i < pointArr.length; i++) {
                  obj['innerPoints'].push(pointArr[i])// 内环
                }
              }
            }
          }
          localStorage.saveElementToDB(earth, item, elementData[item].elementJson)
          break
        }
      }
    }
  }
}

function getOffset(aLocation, offsetLocation) {
  var location = StampGis.Cartesian3.fromDegrees(StampGis.StampMath.toDegrees(aLocation.longitude), StampGis.StampMath.toDegrees(aLocation.latitude), aLocation.height)
  var location2 = StampGis.Cartesian3.fromDegrees(StampGis.StampMath.toDegrees(aLocation.longitude + offsetLocation.longitude), StampGis.StampMath.toDegrees(aLocation.latitude + offsetLocation.latitude), aLocation.height + offsetLocation.height)
  return {
    x: location2.x - location.x,
    y: location2.y - location.y,
    z: location2.z - location.z
  }
}

/**
 * 移动相加
 * @param {*} aLocation
 * @param {*} bLocation
 */
function addLocation(aLocation, bLocation) {
  var location = null
  if (aLocation) {
    // location = StampGis.Cartesian3.fromDegrees(StampGis.StampMath.toDegrees(aLocation.longitude), StampGis.StampMath.toDegrees(aLocation.latitude), aLocation.height);
    // location.x += parseFloat(bLocation.x);
    // location.y += parseFloat(bLocation.z);
    // location = StampGis.Cartographic.fromCartesian(location);
    location = aLocation
    location.longitude = parseFloat(aLocation.longitude) + parseFloat(bLocation.x)
    location.latitude = parseFloat(aLocation.latitude) + parseFloat(bLocation.z)// 坐标系Y和Z是反的
    location.height = parseFloat(aLocation.height) + parseFloat(bLocation.y)// 坐标系Y和Z是反的
  } else {
    return null
  }
  return location
}

/**
 * 旋转相加
 * @param {*} aRotation
 * @param {*} bRotation
 */
function addRotation(aRotation, bRotation) {
  if (aRotation) {
    aRotation.x += bRotation.x
    aRotation.y += bRotation.y
    aRotation.z += bRotation.z
  } else {
    aRotation = bRotation
  }

  return aRotation
}

/**
 * 缩放相加
 * @param {*} aScale
 * @param {*} bScale
 */
function addScale(aScale, bScale) {
  if (aScale) {
    aScale.x += bScale.x
    aScale.y += bScale.y
    aScale.z += bScale.z
  } else {
    aScale = bScale
  }

  return aScale
}

function browse(earth) {
  earth.ToolManager.ObjectEditTool.Browse()
}

/**
 * 删除
 * @param {*} self
 * @param {*} elementData
 */
function delObj(self, elementData) {
  var earth = self.stampAPI.usearth
  earth.ToolManager.ObjectEditTool.Select()
  earth.SelectSet.on_select_changed = function () {
    earth.SelectSet.on_select_changed = function () { }
    toDelete(self, elementData)
  }
  toDelete(self, elementData)
}

function toDelete(self, elementData) {
  var earth = self.stampAPI.usearth
  var totalCount = earth.SelectSet.GetTotalCount()
  if (totalCount <= 0) {
    return
  }
  self.$confirm('确定删除选中的对象？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    for (var i = 0; i < totalCount; ++i) {
      var elementObj = earth.SelectSet.GetOverallObject(i)
      var guid = elementObj.get_guid()
      if (elementObj.parentLayer) {
        elementObj.parentLayer.detach_object(elementObj)
      } else {
        earth.document.elementRoot.detach_object(elementObj)
      }
      for (var item in elementData) {
        if (elementData[item] && elementData[item].elementJson && elementData[item].elementJson[0]) {
          var bSuccess = removeElementObj(self, elementData[item].elementJson[0], guid)
          if (bSuccess) {
            localStorage.saveElementToDB(earth, item, elementData[item].elementJson)
            break
          }
        }
      }
    }
    browse(earth)
  }).catch((e) => {
    console.log(e, e.message)
  })
}

/**
 * 贴地
 * @param {*} self
 * @param {*} elementData
 */
function ground(self, elementData) {
  var earth = self.stampAPI.usearth
  earth.ToolManager.ObjectEditTool.Select()
  earth.SelectSet.on_select_changed = function () {
    earth.SelectSet.on_select_changed = function () { }
    toGround(earth, elementData)
  }
  toGround(earth, elementData)
}

function toGround(earth, elementData) {
  var objCount = earth.SelectSet.GetTotalCount()
  if (objCount <= 0) {
    return
  }
  var objArr = []
  var pointArr = []
  for (var i = 0; i < objCount; i++) {
    var item = earth.SelectSet.GetOverallObject(i)
    var pos = item.transform.get_position_sphr()
    objArr.push(item)
    var point = new StampGis.Cartographic(pos.longitude, pos.latitude, pos.height)
    pointArr.push(point)
  }
  // 批量获取高程
  var promise = earth.document.get_batch_dem_height_from_server(pointArr)
  if (promise == undefined) {
    return
  }
  StampGis.when(promise, function () {
  }).then(function () {
    for (var i = 0; i < pointArr.length; i++) {
      if (objArr[i]) {
        objArr[i].BeginUpdate()
        objArr[i].transform.set_position_sphr(pointArr[i])
        objArr[i].EndUpdate()
        updateNode(earth, elementData, objArr[i], pointArr[i], null, null)
      }
    }
  })
}

/**
 * 克隆
 * @param {*} self
 * @param {*} elementData
 */
function clone(self, elementData) {
  var earth = self.stampAPI.usearth
  earth.ToolManager.ObjectEditTool.Select()
  earth.SelectSet.on_select_changed = function () {
    earth.SelectSet.on_select_changed = function () { }
    toClone(self, elementData)
  }
  toClone(self, elementData)
}

function toClone(self, elementData) {
  var earth = self.stampAPI.usearth
  var objCount = earth.SelectSet.GetTotalCount()
  if (objCount <= 0) {
    return
  }
  for (var i = 0; i < objCount; i++) {
    var elementObj = earth.SelectSet.GetOverallObject(i)
    for (var item in elementData) {
      if (elementData[item] && elementData[item].elementJson && elementData[item].elementJson[0]) {
        var elementJson = elementData[item].elementJson[0].children
        var elementArr = elementData[item].elementArr
        var obj = getElementObj(elementJson, elementObj.get_guid())
        if (obj && drawObj[obj.type]) {
          var options = deepCopy(obj)
          options['guid'] = createGuid()
          options['name'] += 'Clone'
          if (options['location']) {
            options['location'].longitude += 0.000002
            options['location'].latitude += 0.000002
          }
          drawObj[obj.type].createElement(self, elementArr, options)
          elementJson.push(options)
          self.$store.state.checkUserData.push(options['guid'])
          localStorage.saveElementToDB(earth, item, elementData[item].elementJson)
        }
      }
    }
  }
}

/**
 * 编辑顶点
 * @param {*} self
 * @param {*} elementData
 */
function editpoint(self, elementData) {
  closeDialog(self)
  var earth = self.stampAPI.usearth
  earth.ToolManager.ElementEditTool.ShapeEdit({
    custom_excute_finish: function (result) {
      if (result.changed) {
        update(self, elementData, null, null, null, true)
      }
    }
  })
}

/**
 * 添加顶点
 * @param {*} self
 * @param {*} elementData
 */
function addpoint(self, elementData) {
  closeDialog(self)
  var earth = self.stampAPI.usearth
  earth.ToolManager.ElementEditTool.InsertPoint({
    custom_excute_finish: function (result) {
      if (result.data !== undefined) {
        update(self, elementData, null, null, null, true)
      }
    }
  })
}

/**
 * 删除顶点
 * @param {*} self
 * @param {*} elementData
 */
function deletepoint(self, elementData) {
  closeDialog(self)
  var earth = self.stampAPI.usearth
  earth.ToolManager.ElementEditTool.DeletePoint({
    custom_excute_finish: function (result) {
      if (result.need_delete) {
        earth.ToolManager.ElementEditTool.DeleteSelectedPoint()
        update(self, elementData, null, null, null, true)
      }
    }
  })
}

var editTool = {
  select,
  move,
  moveByValue,
  rotate,
  rotateByValue,
  scale,
  scaleByValue,
  onSelectChanged,
  browse,
  delObj,
  ground,
  clone,
  editpoint,
  addpoint,
  deletepoint
}

export default editTool
