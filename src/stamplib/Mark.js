/**
 * 作   者：StampGIS Team
 * 创建日期：2019.11.25
 * 描   述：标绘功能模块
 * 注意事项：
 * 遗留Bug：0
 * 修改日期：
 ******************************************/

import {
  createGuid,
  colorRgba
} from '@/utils'
var _mark = {}

/** **************** common function begin ********************************/
function _colorToHex(color, trans) {
  color = color == undefined ? '#FFFF00' : color
  trans = trans == undefined ? 'CC' : parseInt(trans).toString(16)
  if (color.substr(0, 1) == '#') {
    color = parseInt('0x' + trans + color.substr(1))
  }
  return color
}

function _getColorPercent(color, trans) {
  color = color == undefined ? '#FFFF00' : color
  trans = trans == undefined ? 255 : parseInt(trans)
  if (color.substr(0, 1) == '#') {
    var colorT = color.substr(1, color.length - 1)
    return {
      r: parseInt('0x' + colorT.substr(0, 2)) / 255,
      g: parseInt('0x' + colorT.substr(2, 2)) / 255,
      b: parseInt('0x' + colorT.substr(4, 2)) / 255,
      a: trans / 255
    }
  } else {
    return {
      r: 0.2,
      g: 0.2,
      b: 0.6,
      a: 1
    }
  }
}

function updateTransform(obj, options) {
  if (options.location) {
    obj.transform.set_position_sphr(options.location)
  } else {
    options.location = obj.transform.get_position_sphr()
  }
  if (options.rotation) {
    obj.transform.set_rotation(options.rotation)
  } else {
    options.rotation = obj.transform.get_rotation()
  }
  if (options.scale) {
    obj.transform.set_scale(options.scale)
  } else {
    options.scale = obj.transform.get_scale()
  }
}

/** *************** common function end *********************************/
// //////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * 创建线缓冲
 * @param {*} options
 */
function _createElementLinebuffer(earth, options) {
  var polygon = earth.Factory.CreateElementPolygon({
    guid: options.guid,
    name: options.name,
    doc: earth.document
  })
  polygon = _editElementLinebuffer(earth, polygon, options)
  // earth.document.elementRoot.attach_object(polygon);
  // earth.document.register_object(polygon);
  return polygon
}

/**
 * 编辑线缓冲
 * @param {*} options
 */
function _editElementLinebuffer(earth, polygon, options) {
  var sphrArray = new Array()
  for (var i = 0; i < options.points.length; i++) {
    sphrArray[i] = StampGis.Cartographic.fromCartesian(options.points[i])
    sphrArray[i].longitude = StampGis.StampMath.toDegrees(sphrArray[i].longitude)
    sphrArray[i].latitude = StampGis.StampMath.toDegrees(sphrArray[i].latitude)
  }
  var type = parseInt(options.way)
  var radius = parseInt(options.radius)
  var polygonArray = earth.GeometryAlgorithm.CreatePolygonBufferFromPolyline(sphrArray, radius, type, 36)
  var name = options.name || ''
  polygon.name = name
  polygon.BeginUpdate()
  polygon.SetExteriorRing(polygonArray, false)
  polygon.set_altitude_type(1)
  polygon.lineColor = 0xaaffff00
  polygon.lineWidth = 2.0
  polygon.fillColor = 0xaa00ff00
  polygon.EndUpdate()
  earth.document.elementRoot.attach_object(polygon)
  earth.document.register_object(polygon)
  polygon.set_is_visible(!!options.visibility)
  polygon.EndUpdate()
  updateTransform(polygon, options)
  return polygon
}

/**
 * 创建面缓冲
 * @param {*} options
 */
function _createElementPolygonbuffer(earth, options) {
  var polygon = earth.Factory.CreateElementPolygon({
    guid: options.guid,
    name: options.name,
    doc: earth.document
  })
  polygon = _editElementPolygonbuffer(earth, polygon, options)
  // earth.document.elementRoot.attach_object(polygon);
  // earth.document.register_object(polygon);
  return polygon
}

/**
 * 编辑面缓冲
 * @param {*} options
 */
function _editElementPolygonbuffer(earth, polygon, options) {
  var sphrArray = new Array()
  for (var i = 0; i < options.points.length; i++) {
    sphrArray[i] = StampGis.Cartographic.fromCartesian(options.points[i])
    sphrArray[i].longitude = StampGis.StampMath.toDegrees(sphrArray[i].longitude)
    sphrArray[i].latitude = StampGis.StampMath.toDegrees(sphrArray[i].latitude)
  }
  var type = parseInt(options.way)
  var radius = parseInt(options.radius)
  var polygonArray = earth.GeometryAlgorithm.CreatePolygonBufferFromPolygon(sphrArray, radius, type, 36, 0)
  var name = options.name || ''
  polygon.name = name
  polygon.BeginUpdate()
  polygon.SetExteriorRing(polygonArray, false)
  polygon.set_altitude_type(1)
  polygon.lineColor = 0xaaffff00
  polygon.lineWidth = 2.0
  polygon.fillColor = 0xaa00ff00
  polygon.EndUpdate()
  earth.document.elementRoot.attach_object(polygon)
  earth.document.register_object(polygon)
  polygon.set_is_visible(!!options.visibility)
  polygon.EndUpdate()
  updateTransform(polygon, options)
  return polygon
}

/**
 * 创建动态线
 */
function _createElementdynamicLine(earth, options) {
  var name = options.name || ''
  var dynamicline = earth.Factory.CreateDynamicLine({
    guid: options.guid,
    name: name,
    doc: earth.document
  })
  if (!dynamicline) {
    return
  }
  // dynamicline = _editElementdynamicLine(earth,dynamicline,options);
  var points = options.points
  var sample = parseFloat(options.space)
  var height = parseFloat(options.height)
  var altitudeType = parseInt(options.altitudeType)
  if (altitudeType !== 0) {
    points = StampGis.BaseAlgorithm.calculate_polyline_add_interpolation(points, sample, height, earth.application)
    point_len = points.length
    for (var i = 0; i < point_len; i++) {
      points[i] = StampGis.Cartesian3.fromRadians(points[i].longitude, points[i].latitude, points[i].height)
    }
    options.points = points
  } else {
    var point_len = points.length
    for (var i = 0; i < point_len; i++) {
      var sphr = StampGis.Cartographic.fromCartesian(points[i])
      sphr.height += height
      points[i] = StampGis.Cartesian3.fromRadians(sphr.longitude, sphr.latitude, sphr.height)
      options.points = points
    }
  }
  dynamicline.guid = options.guid
  dynamicline.name = options.name
  dynamicline.BeginUpdate()
  dynamicline.set_altitude_type(altitudeType)
  dynamicline.SetPointArray(points)
  dynamicline.radius = parseFloat(options.lineWidth)
  dynamicline.split = parseFloat(options.length)
  dynamicline.speed = parseInt(options.speed)
  if (options.texture_Data) {
    dynamicline.texture_data = options.texture_Data
  }
  dynamicline.set_is_visible(!!options.visibility)
  dynamicline.EndUpdate()
  earth.document.elementRoot.attach_object(dynamicline)
  earth.document.register_object(dynamicline)
  dynamicline.show_high_light()
  updateTransform(dynamicline, options)
  return dynamicline
}
function _editElementdynamicLine(earth, dynamicline, options) {
  options.points = JSON.parse(JSON.stringify(options.points2))
  earth.document.elementRoot.detach_object(dynamicline)
  dynamicline = _createElementdynamicLine(earth, options)
  return dynamicline
}

/**
 * 创建环形喷泉
 */
function _createElementCircularFountain(earth, layer, options) {
  var point = StampGis.Cartographic.fromCartesian(options.points)
  point.longitude = StampGis.StampMath.toDegrees(point.longitude)
  point.latitude = StampGis.StampMath.toDegrees(point.latitude)

  var colorStr = options.color
  var red = Number('0x' + colorStr.substr(1, 2))
  var green = Number('0x' + colorStr.substr(3, 2))
  var blue = Number('0x' + colorStr.substr(5, 2))
  var color = {
    r: red / 255,
    g: green / 255,
    b: blue / 255,
    a: 1.0
  }

  var points = []
  points.push(new StampGis.Cartographic(point.longitude + 0.0019, point.latitude + 0.0005, 50))
  points.push(new StampGis.Cartographic(point.longitude - 0.0019, point.latitude - 0.0005, 50))
  points.push(new StampGis.Cartographic(point.longitude + 0.0002, point.latitude + 0.0015, 50))
  points.push(new StampGis.Cartographic(point.longitude - 0.0002, point.latitude - 0.0015, 50))
  points.push(new StampGis.Cartographic(point.longitude + 0.0016, point.latitude - 0.001, 50))
  points.push(new StampGis.Cartographic(point.longitude - 0.0016, point.latitude + 0.001, 50))

  var curveHeight = point.height + Number(options.curveHeight)
  var highlightLength = Number(options.highlightLength)
  var lineWidth = Number(options.lineWidth)
  var stepSpeed = Number(options.stepSpeed)

  var obj_opt1 = {
    guid: options.guidArr[0],
    dst_longitude: point.longitude,
    dst_latitude: point.latitude,
    dst_altitude: point.height,
    longitude: points[0].longitude,
    latitude: points[0].latitude,
    altitude: points[0].height,
    curve_height: curveHeight,
    highlight_length: highlightLength,
    step_speed: stepSpeed,
    line_width: lineWidth,
    line_color: color
  }

  var obj_opt2 = {
    guid: options.guidArr[1],
    dst_longitude: point.longitude,
    dst_latitude: point.latitude,
    dst_altitude: point.height,
    longitude: points[1].longitude,
    latitude: points[1].latitude,
    altitude: points[1].height,
    curve_height: curveHeight,
    highlight_length: highlightLength,
    step_speed: stepSpeed,
    line_width: lineWidth,
    line_color: color
  }

  var obj_opt3 = {
    guid: options.guidArr[2],
    dst_longitude: point.longitude,
    dst_latitude: point.latitude,
    dst_altitude: point.height,
    longitude: points[2].longitude,
    latitude: points[2].latitude,
    altitude: points[2].height,
    curve_height: curveHeight,
    highlight_length: highlightLength,
    step_speed: stepSpeed,
    line_width: lineWidth,
    line_color: color
  }

  var obj_opt4 = {
    guid: options.guidArr[3],
    dst_longitude: point.longitude,
    dst_latitude: point.latitude,
    dst_altitude: point.height,
    longitude: points[3].longitude,
    latitude: points[3].latitude,
    altitude: points[3].height,
    curve_height: curveHeight,
    highlight_length: highlightLength,
    step_speed: stepSpeed,
    line_width: lineWidth,
    line_color: color
  }

  var obj_opt5 = {
    guid: options.guidArr[4],
    dst_longitude: point.longitude,
    dst_latitude: point.latitude,
    dst_altitude: point.height,
    longitude: points[4].longitude,
    latitude: points[4].latitude,
    altitude: points[4].height,
    curve_height: curveHeight,
    highlight_length: highlightLength,
    step_speed: stepSpeed,
    line_width: lineWidth,
    line_color: color
  }

  var obj_opt6 = {
    guid: options.guidArr[5],
    dst_longitude: point.longitude,
    dst_latitude: point.latitude,
    dst_altitude: point.height,
    longitude: points[5].longitude,
    latitude: points[5].latitude,
    altitude: points[5].height,
    curve_height: curveHeight,
    highlight_length: highlightLength,
    step_speed: stepSpeed,
    line_width: lineWidth,
    line_color: color
  }

  var batch_trans_obj1 = earth.Factory.CreateTransparentLine(obj_opt1)
  var batch_trans_obj2 = earth.Factory.CreateTransparentLine(obj_opt2)
  var batch_trans_obj3 = earth.Factory.CreateTransparentLine(obj_opt3)
  var batch_trans_obj4 = earth.Factory.CreateTransparentLine(obj_opt4)
  var batch_trans_obj5 = earth.Factory.CreateTransparentLine(obj_opt5)
  var batch_trans_obj6 = earth.Factory.CreateTransparentLine(obj_opt6)

  layer.attach_object(batch_trans_obj1)
  layer.attach_object(batch_trans_obj2)
  layer.attach_object(batch_trans_obj3)
  layer.attach_object(batch_trans_obj4)
  layer.attach_object(batch_trans_obj5)
  layer.attach_object(batch_trans_obj6)

  var objArr = []
  objArr.push(batch_trans_obj1)
  objArr.push(batch_trans_obj2)
  objArr.push(batch_trans_obj3)
  objArr.push(batch_trans_obj4)
  objArr.push(batch_trans_obj5)
  objArr.push(batch_trans_obj6)
  return objArr
}

function _editElementCircularFountain(eleArr, options, earth, layer) {
  for (var i = 0; i < eleArr.length; i++) {
    layer.detach_object(eleArr[i])
  }

  var objArr = _createElementCircularFountain(earth, layer, options)
  return objArr
}

/**
 * 创建运动标注
 */
function _createElementMoveIcon(earth, layer, options) {
  var curTrack = earth.Factory.CreateTrack({
    name: 'moveTrack',
    visibility: true
  })

  var curvePoints = options.points
  var cartographic = StampGis.Cartographic.fromCartesian(curvePoints[0])
  var model = earth.Factory.CreateDynamicModel({
    name: 'moveModel',
    longitude: cartographic.longitude,
    latitude: cartographic.latitude,
    altitude: cartographic.height,
    url: '',   //options.dynamicObj
  })

  // if (options.dynamicRot) {
  //   var offsetArr = options.dynamicRot.split(',')
  //   model.rot_offset.x = Number(offsetArr[0]) * StampGis.StampMath.RADIANS_PER_DEGREE
  //   model.rot_offset.y = Number(offsetArr[1]) * StampGis.StampMath.RADIANS_PER_DEGREE
  //   model.rot_offset.z = Number(offsetArr[2]) * StampGis.StampMath.RADIANS_PER_DEGREE
  // }
  StampGis.when(model.readyPromise).then(function (model) {

  })
  window.g_DynamicLayer.attach_object(model)
  earth.document.register_object(model)
  curTrack.bind_object = model
  var route = earth.Factory.CreateStationRoute({
    name: 'route',
    yaw: 0,
    pitch: 0,
    fly_height: 0,
    speed: 1,
    rate: 0.01
  })
  curTrack.add_station(route)
  for (var ni = 0; ni < curvePoints.length; ni++) {
    var pass = earth.Factory.CreateStationPass({
      name: 'pass' + ni,
      position_geo: curvePoints[ni],
      fly_height: 0,
      speed: 1
    })
    route.add_station(pass)
  }
  curTrack.commit_changes(true)

  var icon_url = custom_config.server_ip + '/StampWebGL/Assets/Textures/icon.png'
  var obj_opt = {
    guid: options.guid,
    wall_height: Number(options.size),
    longitude: StampGis.StampMath.toDegrees(cartographic.longitude),
    latitude: StampGis.StampMath.toDegrees(cartographic.latitude),
    altitude: cartographic.height + Number(options.height),
    url: icon_url
  }
  var icon_obj = earth.Factory.CreateMoveIcon(obj_opt)
  layer.attach_object(icon_obj)

  model._position_changed_event = function () {
    var dis = new StampGis.Cartographic(model.transform.longitude, model.transform.latitude, model.transform.altitude + Number(options.height))
    icon_obj.transform.set_position_sphr(dis)
  }
  earth.TrackControl.SetMainTrack(curTrack.get_guid(), 3)

  if (options.visibility) {
    // curTrack.play(true)
  } else {
    icon_obj.set_is_visible(false)
    model.set_is_visible(false)
    curTrack.set_is_visible(false)
  }

  model.activeAnimations && model.activeAnimations.addAll({
    loop: StampGis.ModelAnimationLoop.REPEAT
  })

  icon_obj.track = curTrack
  icon_obj.model = model

  return icon_obj
}
/**
 * 创建面板标注对象
 * @param {*} options
 */
var PanelCanvas = undefined
var index = 50
/**
 *
 * @param ctx 2d上下文对象
 * @param text 绘制文本
 * @param x 坐标轴x位置
 * @param y 坐标轴y位置
 * @param options 包含 maxWidth 最大宽度，lineHeight 文字行高，row 限制行数，textIndent 首行缩进，fontSize 文字大小
 */
function textEllipsis(ctx, text, x, y, options) {
  if (typeof text !== 'string' || typeof x !== 'number' || typeof y !== 'number') {
    return
  }
  const defaultOpt = {
    maxWidth: 100,
    lineHeight: 14,
    row: 1000,
    textIndent: 0,
    fontSize: 14
  }
  const params = Object.assign({}, defaultOpt, options)
  // 分割文本
  const textArr = text.split('')
  // 文本最终占据高度
  let textHeight = 0
  // 每行显示的文字
  let textOfLine = ''
  // 控制行数
  const limitRow = params.row
  let rowCount = 0
  // 循环分割的文字数组
  for (let i = 0; i < textArr.length; i++) {
    // 获取单个文字或字符
    const singleWord = textArr[i]
    // 连接文字
    const connectText = textOfLine + singleWord
    // 计算接下来要写的是否是最后一行
    const isLimitRow = limitRow ? rowCount === limitRow - 1 : false
    // 最后一行则显示省略符,否则显示连接文字
    const measureText = isLimitRow ? connectText + '...' : connectText
    // 设置字体并计算宽度,判断是否存在首行缩进
    ctx.font = `${params.fontSize}px "MicroSoft YaHei"`
    const width = ctx.measureText(measureText).width
    // 首行需要缩进满足条件
    const conditionIndent = params.textIndent && rowCount === 0
    const measureWidth = conditionIndent ? width + params.textIndent : width
    // 大于限制宽度且已绘行数不是最后一行，则写文字
    if (measureWidth > params.maxWidth && i > 0 && rowCount !== limitRow) {
      // 如果是最后一行，显示计算文本
      const canvasText = isLimitRow ? measureText : textOfLine
      const xPos = conditionIndent ? x + params.textIndent : x
      // 写文字
      ctx.fillStyle = '#000'
      ctx.fillText(canvasText, xPos, y)
      // 下一行文字
      textOfLine = singleWord
      // 记录下一行位置
      y += params.lineHeight
      // 计算文本高度
      textHeight += params.lineHeight
      rowCount++

      if (isLimitRow) {
        break
      }
    } else {
      // 不大于最大宽度
      textOfLine = connectText
    }
  }
  if (rowCount !== limitRow) {
    const xPos = params.textIndent && rowCount === 0 ? x + params.textIndent : x
    ctx.fillStyle = '#000'
    ctx.fillText(textOfLine, xPos, y)
  }
  // 计算文字总高度
  const textHeightVal = rowCount < limitRow ? textHeight + params.lineHeight : textHeight
  return textHeightVal
}

function getPanelCanvas(options) {
  if (!PanelCanvas) {
    PanelCanvas = document.createElement('canvas')
    PanelCanvas.width = 1024
    PanelCanvas.height = 1024
    var context2D = PanelCanvas.getContext('2d')
    context2D.fillStyle = options.color
    context2D.fillRect(0, 0, 1024, 1024)
    var options1 = {
      maxWidth: 980,
      lineHeight: 30,
      row: 3,
      textIndent: 40,
      fontSize: Number(options.fontSize)
    }
    textEllipsis(context2D, options.desc, 30, Number(options.fontSize), options1)
    context2D.fillStyle = '#000000'
  }
  return PanelCanvas
}

var panel_obj = null

function _createElementPanelIcon(earth, layer, options) {
  var points = options.points
  var point = StampGis.Cartographic.fromCartesian(points)
  point.longitude = StampGis.StampMath.toDegrees(point.longitude)
  point.latitude = StampGis.StampMath.toDegrees(point.latitude)

  var obj_opt = {
    guid: options.guid,
    wall_height: options.height,
    longitude: point.longitude,
    latitude: point.latitude,
    altitude: point.height + 1 / 2 * options.height,
    in_canvas: getPanelCanvas(options)
  }

  panel_obj = earth.Factory.CreateElementPanel(obj_opt)
  if (!panel_obj) {
    return
  }

  panel_obj.BeginUpdate()
  panel_obj.set_is_visible(!!options.visibility)
  panel_obj.EndUpdate()

  updateTransform(panel_obj, options)
  layer.attach_object(panel_obj)
  PanelCanvas = undefined
  return panel_obj
}
/**
 * 编辑气球标注对象
 * @param {*} options
 */

function _editElementPanelIcon(panel_obj, options, earth, layer) {
  layer.detach_object(panel_obj)
  PanelCanvas = undefined
  panel_obj = _createElementPanelIcon(earth, layer, options)
  return panel_obj
}
/**
 * 更新面板标注对象
 * @param {*} options
 */
function update_panel(text) {
  if (panel_obj && PanelCanvas) {
    PanelCanvas.height = 256

    var context2D = PanelCanvas.getContext('2d')
    context2D.fillStyle = '#FF5500'
    context2D.fillRect(0, 0, 256, 256)

    context2D.font = '20px Georgia'
    context2D.fillStyle = '#000000'

    context2D.fillText(text, 10, 50)
    panel_obj.UpdateCanva()
  }
}

function _editElementMoveIcon(icon_obj, options, earth, layer) {
  if (icon_obj.track) {
    if (icon_obj.track.status != 0) {
      icon_obj.track.stop()
    }
    icon_obj.track.Suicide()
  }

  if (icon_obj.model) {
    window.g_DynamicLayer.detach_object(icon_obj.model)
  }

  layer.detach_object(icon_obj)
  icon_obj = _createElementMoveIcon(earth, layer, options)
  return icon_obj
}
/**
 * 创建气球标注对象
 * @param {*} options
 */

function _createElementBallonIcon(earth, layer, options) {
  var points = options.points
  var point = StampGis.Cartographic.fromCartesian(points)
  point.longitude = StampGis.StampMath.toDegrees(point.longitude)
  point.latitude = StampGis.StampMath.toDegrees(point.latitude)

  var colorStr = options.color
  var red = Number('0x' + colorStr.substr(1, 2))
  var green = Number('0x' + colorStr.substr(3, 2))
  var blue = Number('0x' + colorStr.substr(5, 2))
  var color_value = {
    r: red / 255,
    g: green / 255,
    b: blue / 255,
    a: 0.5
  }

  var obj_opt = {
    guid: options.guid,
    longitude: point.longitude,
    latitude: point.latitude,
    altitude: point.height + 9 + 2 * Number(options.radius),
    height: 160.0, // 没有作用
    radius: Number(options.radius),
    color: color_value
  }

  var balloon_obj = earth.Factory.CreateBalloonElement(obj_opt)
  if (!balloon_obj) {
    return
  }

  balloon_obj.BeginUpdate()
  balloon_obj.set_is_visible(!!options.visibility)
  balloon_obj.EndUpdate()

  updateTransform(balloon_obj, options)
  layer.attach_object(balloon_obj)

  return balloon_obj
}

/**
 * 编辑气球标注对象
 * @param {*} options
 */
function _editElementBallonIcon(balloon_obj, options, earth, layer) {
  layer.detach_object(balloon_obj)
  balloon_obj = _createElementBallonIcon(earth, layer, options)

  return balloon_obj
}

/**
 * 创建上下移动光晕对象对象
 * @param {*} options
 */
var cylinder_obj = null

function _createCylinderElement(earth, layer, options) {
  var points = options.points
  var point = StampGis.Cartographic.fromCartesian(points)
  point.longitude = StampGis.StampMath.toDegrees(point.longitude)
  point.latitude = StampGis.StampMath.toDegrees(point.latitude)

  var colorStr = options.color
  var red = Number('0x' + colorStr.substr(1, 2))
  var green = Number('0x' + colorStr.substr(3, 2))
  var blue = Number('0x' + colorStr.substr(5, 2))
  var color_value = {
    r: red / 255,
    g: green / 255,
    b: blue / 255,
    a: 0.5
  }

  var obj_opt = {
    guid: options.guid,
    longitude: point.longitude,
    latitude: point.latitude,
    altitude: point.height,
    height: 160.0, // 没有作用
    radius: Number(options.radius),
    color: color_value
  }

  cylinder_obj = earth.Factory.CreateCylinderElement(obj_opt)
  if (!cylinder_obj) {
    return
  }

  cylinder_obj.BeginUpdate()
  cylinder_obj.set_is_visible(!!options.visibility)
  cylinder_obj.EndUpdate()

  updateTransform(cylinder_obj, options)
  layer.attach_object(cylinder_obj)

  return cylinder_obj
}

/**
 * 编辑上下移动光晕对象
 * @param {*} options
 */
function _editCylinderElement(cylinder_obj, options, earth, layer) {
  layer.detach_object(cylinder_obj)
  cylinder_obj = _createCylinderElement(earth, layer, options)

  return cylinder_obj
}

/**
 * 创建竖直流动管线对象对象
 * @param {*} options
 */
var vertical_line_obj = null

function _createVerticalLine(earth, layer, options) {
  var points = options.points
  var point = StampGis.Cartographic.fromCartesian(points)
  point.longitude = StampGis.StampMath.toDegrees(point.longitude)
  point.latitude = StampGis.StampMath.toDegrees(point.latitude)

  var colorStr = options.color
  var red = Number('0x' + colorStr.substr(1, 2))
  var green = Number('0x' + colorStr.substr(3, 2))
  var blue = Number('0x' + colorStr.substr(5, 2))
  var color = {
    r: red / 255,
    g: green / 255,
    b: blue / 255,
    a: 0.5
  }

  var obj_opt = {
    guid: options.guid,
    longitude: point.longitude,
    latitude: point.latitude,
    altitude: point.height,
    radius: Number(options.radius),
    height: Number(options.height),
    highlight_length: Number(options.highlightLength),
    step_speed: Number(options.stepSpeed),
    line_width: Number(options.width),
    line_color: color
  }

  vertical_line_obj = earth.Factory.CreateVerticalLine(obj_opt)
  if (!vertical_line_obj) {
    return
  }

  vertical_line_obj.BeginUpdate()
  vertical_line_obj.set_is_visible(!!options.visibility)
  vertical_line_obj.EndUpdate()

  updateTransform(vertical_line_obj, options)
  layer.attach_object(vertical_line_obj)

  return vertical_line_obj
}

/**
 * 编辑竖直流动管线对象
 * @param {*} options
 */
function _editVerticalLine(vertical_line_obj, options, earth, layer) {
  layer.detach_object(vertical_line_obj)
  vertical_line_obj = _createVerticalLine(earth, layer, options)

  return vertical_line_obj
}

/**
 * 创建倒椎标注对象
 * @param {*} options
 */
function _createElementPyramidIcon(earth, layer, options) {
  var points = options.points
  var point = StampGis.Cartographic.fromCartesian(points)
  // point.longitude = StampGis.StampMath.toDegrees(point.longitude)
  // point.latitude = StampGis.StampMath.toDegrees(point.latitude)

  var colorStr = options.color
  var red = Number('0x' + colorStr.substr(1, 2))
  var green = Number('0x' + colorStr.substr(3, 2))
  var blue = Number('0x' + colorStr.substr(5, 2))
  var color_value = {
    r: red / 255,
    g: green / 255,
    b: blue / 255,
    a: 1.0
  }

  var obj_opt = {
    guid: options.guid,
    longitude: point.longitude,
    latitude: point.latitude,
    altitude: point.height,
    height: Number(options.height),
    radius: Number(options.radius),
    color: color_value,
    doc: earth.document,
  }

  var pyramid_obj = earth.Factory.CreatePyramidElement(obj_opt)

  if (!pyramid_obj) {
    return
  }

  pyramid_obj.BeginUpdate()
  pyramid_obj.set_fill_color('0x99' + colorStr.substr(1));
  pyramid_obj.radiusBottom = 0;
  pyramid_obj.radiusTop = Number(options.radius);
  pyramid_obj.height = Number(options.height);
  pyramid_obj.sides = 4;
  pyramid_obj.set_is_visible(!!options.visibility)
  pyramid_obj.EndUpdate()
  updateTransform(pyramid_obj, options)
  layer.attach_object(pyramid_obj)

  return pyramid_obj
}

/**
 * 编辑倒椎标注对象
 * @param {*} options
 */
function _editElementPyramidIcon(pyramid_obj, options, earth, layer) {
  layer.detach_object(pyramid_obj)
  pyramid_obj = _createElementPyramidIcon(earth, layer, options)

  return pyramid_obj
}

/**
 * 创建警告墙体对象
 * @param {*} options
 */
function _createElementWarnWall(earth, layer, options) {
  var altitude = null
  var geo_points = []
  for (var i = 0; i < options.points.length; i++) {
    if (!altitude) {
      altitude = options.points[i].height
    } else if (options.points[i].height < altitude) {
      altitude = options.points[i].height
    }
    geo_points.push({
      longitude: options.points[i].longitude,
      latitude: options.points[i].latitude
    })
  }

  var icon_url = stamp_core_config.baseUrlString + 'Assets/Textures/warning.png'

  var name = options.name || ''
  var obj_opt = {
    guid: options.guid,
    name: name,
    wall_height: Number(options.wallHeight),
    geo_point_array: geo_points,
    altitude: altitude,
    url: icon_url
  }

  var wall_warning_obj = earth.Factory.CreateWallWarning(obj_opt)

  if (!wall_warning_obj) {
    return
  }
  wall_warning_obj.BeginUpdate()
  wall_warning_obj.set_is_visible(!!options.visibility)
  wall_warning_obj.EndUpdate()

  updateTransform(wall_warning_obj, options)

  layer.attach_object(wall_warning_obj)

  return wall_warning_obj
}

/**
 * 编辑警告墙体对象
 * @param {*} options
 */
function _editElementWarnWall(wall_warning_obj, options, earth, layer) {
  layer.detach_object(wall_warning_obj)
  wall_warning_obj = _createElementWarnWall(earth, layer, options)

  return wall_warning_obj
}

/**
 * 创建动态墙体对象
 * @param {*} options
 */
function _createElementDynamicWall(earth, layer, options) {
  var altitude = null
  var geo_points = []
  for (var i = 0; i < options.points.length; i++) {
    if (!altitude) {
      altitude = options.points[i].height
    } else if (options.points[i].height < altitude) {
      altitude = options.points[i].height
    }
    geo_points.push({
      longitude: options.points[i].longitude,
      latitude: options.points[i].latitude
    })
  }

  var colorStr = options.wallColor
  var red = Number('0x' + colorStr.substr(1, 2))
  var green = Number('0x' + colorStr.substr(3, 2))
  var blue = Number('0x' + colorStr.substr(5, 2))
  var color = {
    r: red / 255,
    g: green / 255,
    b: blue / 255
  }

  var name = options.name || ''
  var obj = {
    guid: options.guid,
    name: name,
    wall_height: Number(options.wallHeight),
    geo_point_array: geo_points,
    altitude: altitude,
    speed: Number(options.wallSpeed)
  }

  var wall_slide_up_down_obj = null
  switch (options.wallType) {
    case '0':
      obj.line_color = color
      wall_slide_up_down_obj = earth.Factory.CreateWallSlideUpDown(obj)
      break
    case '1':
      var count = 50
      var temp_geo_points = []
      for (var i = 1; i < geo_points.length; i++) {
        var capLon = geo_points[i].longitude - geo_points[i - 1].longitude
        var capLat = geo_points[i].latitude - geo_points[i - 1].latitude

        for (var index = 0; index < count; index++) {
          temp_geo_points.push({
            longitude: geo_points[i - 1].longitude + (capLon / count) * index,
            latitude: geo_points[i - 1].latitude + (capLat / count) * index
          })
        }
      }
      // temp_geo_points.push({longitude: geo_points[geo_points.length-1].longitude,latitude: geo_points[geo_points.length-1].latitude});
      var capLon =
        geo_points[0].longitude - geo_points[geo_points.length - 1].longitude
      var capLat =
        geo_points[0].latitude - geo_points[geo_points.length - 1].latitude
      for (var index = 0; index < count; index++) {
        temp_geo_points.push({
          longitude: geo_points[geo_points.length - 1].longitude +
            (capLon / count) * index,
          latitude: geo_points[geo_points.length - 1].latitude +
            (capLat / count) * index
        })
      }
      obj.geo_point_array = temp_geo_points
      obj.move_count = 3
      obj.line_color = color
      wall_slide_up_down_obj = earth.Factory.CreateWallSlideFlow(obj)
      break
    case '2':
      var icon_url = stamp_core_config.baseUrlString + 'Assets/Textures/arraw2.png'
      obj.url = icon_url
      obj.fill_color = color
      wall_slide_up_down_obj = earth.Factory.CreateWallMoveArraw(obj)
      break
    case '3':
      var icon_url = stamp_core_config.baseUrlString + 'Assets/Textures/arraw.png'
      obj.url = icon_url
      obj.fill_color = color
      wall_slide_up_down_obj = earth.Factory.CreateWallMoveArraw(obj)
      break
  }

  if (!wall_slide_up_down_obj) {
    return
  }

  wall_slide_up_down_obj.BeginUpdate()
  wall_slide_up_down_obj.set_is_visible(!!options.visibility)
  wall_slide_up_down_obj.EndUpdate()

  updateTransform(wall_slide_up_down_obj, options)

  layer.attach_object(wall_slide_up_down_obj)

  return wall_slide_up_down_obj
}

/**
 * 编辑动态墙体对象
 * @param {*} options
 */
function _editElementDynamicWall(wall_slide_up_down_obj, options, earth, layer) {
  layer.detach_object(wall_slide_up_down_obj)
  wall_slide_up_down_obj = _createElementDynamicWall(earth, layer, options)

  return wall_slide_up_down_obj
}

/**
 * 创建动态扫描对象
 * @param {*} options
 */
function _createElementDynamicScan(earth, layer, options) {
  var name = options.name || ''

  var colorStr = options.color
  var red = Number('0x' + colorStr.substr(1, 2))
  var green = Number('0x' + colorStr.substr(3, 2))
  var blue = Number('0x' + colorStr.substr(5, 2))
  var color_info = {
    r: red / 255,
    g: green / 255,
    b: blue / 255,
    a: 0.5
  }

  var obj = {
    guid: options.guid,
    name: name,
    rate: 0.25,
    color: color_info,
    boundary: options.boundary,
    doc: earth.document
  }

  var slideCircleObj = earth.Factory.CreateElementScanCircle(obj)
  if (!slideCircleObj) {
    return
  }

  var points = options.points
  var radius = options.radius

  slideCircleObj.BeginUpdate()
  slideCircleObj.setPosition(points[0], radius)
  slideCircleObj.set_is_visible(!!options.visibility)
  slideCircleObj.EndUpdate()

  updateTransform(slideCircleObj, options)
  layer.attach_object(slideCircleObj)

  return slideCircleObj
}

/**
 * 编辑动态扫描对象
 * @param {*} options
 */
function _editElementDynamicScan(slideCircleObj, options, earth, layer) {
  layer.detach_object(slideCircleObj)
  slideCircleObj = _createElementDynamicScan(earth, layer, options)

  return slideCircleObj
}

/**
 * 创建动态扩散对象
 * @param {*} options
 */
function _createElementDynamicSpread(earth, layer, options) {
  var name = options.name || ''
  var obj = {
    guid: options.guid,
    name: name,
    rate: 0.25,
    doc: earth.document
  }

  var slideCircleObj = earth.Factory.CreateElementSlideCircle(obj)
  if (!slideCircleObj) {
    return
  }

  slideCircleObj = _editElementDynamicSpread(slideCircleObj, options)
  layer.attach_object(slideCircleObj)

  return slideCircleObj
}

/**
 * 编辑动态扩散对象
 * @param {*} options
 */
function _editElementDynamicSpread(slideCircleObj, options) {
  var name = options.name || ''
  var points = options.points
  var radius = options.radius

  slideCircleObj.guid = options.guid
  slideCircleObj.name = name
  slideCircleObj.BeginUpdate()
  slideCircleObj.setPosition(points[0], radius)
  slideCircleObj.set_is_visible(!!options.visibility)
  slideCircleObj.EndUpdate()

  updateTransform(slideCircleObj, options)
  return slideCircleObj
}

/**
 * 创建穹顶光晕
 * @param {*} earth
 * @param {*} layer
 * @param {*} options
 */
function _createElementDome(earth, layer, options) {
  var points = options.points
  var point = StampGis.Cartographic.fromCartesian(points)
  point.longitude = StampGis.StampMath.toDegrees(point.longitude)
  point.latitude = StampGis.StampMath.toDegrees(point.latitude)

  var colorStr = options.color
  var red = Number('0x' + colorStr.substr(1, 2))
  var green = Number('0x' + colorStr.substr(3, 2))
  var blue = Number('0x' + colorStr.substr(5, 2))
  var color_value = {
    r: red / 255,
    g: green / 255,
    b: blue / 255,
    a: 0.8
  }

  var obj_opt = {
    guid: options.guid,
    longitude: point.longitude,
    latitude: point.latitude,
    altitude: point.height,
    height: 0, // 没有作用
    radius: Number(options.radius),
    color: color_value
  }

  var dome_obj = earth.Factory.CreateDomeElement(obj_opt)
  if (!dome_obj) {
    return
  }
  dome_obj.BeginUpdate()
  dome_obj.set_is_visible(!!options.visibility)
  dome_obj.EndUpdate()

  updateTransform(dome_obj, options)

  layer.attach_object(dome_obj)
  return dome_obj
}

function _editElementDome(domeObj, options, earth, layer) {
  layer.detach_object(domeObj)
  domeObj = _createElementDome(earth, layer, options)

  return domeObj
}

/**
 * 创建火对象
 * @param {*} options
 */
function _createElementFire(earth, layer, options) {
  var points = options.points
  var point = StampGis.Cartographic.fromCartesian(points)
  point.longitude = StampGis.StampMath.toDegrees(point.longitude)
  point.latitude = StampGis.StampMath.toDegrees(point.latitude)

  var start_color = { red: 1.0, green: 1.0, blue: 1.0, alpha: 1.0 }
  var end_color = { red: 1.0, green: 1.0, blue: 1.0, alpha: 0.0 }

  var obj = {
    guid: options.guid,
    longitude: point.longitude,
    latitude: point.latitude,
    altitude: point.height,
    width: 5,
    imageSize: { x: 2.0, y: 2.0 },
    startColor: start_color,
    endColor: end_color,
    emissionRate: 5,
    emitter: earth.Factory.CreateCircleEmitter(1.0),
    image: stamp_core_config.baseUrlString + 'Assets/Textures/fire1.png',
    startScale: 3.0,
    endScale: 1.5,
    minimumSpeed: 7.0,
    maximumSpeed: 9.0,
    minimumParticleLife: 1.5,
    maximumParticleLife: 1.8,
    lifetime: 10,
    sizeInMeters: true,
    loop: true,
    parentLayer: earth.document.elementRoot
  }

  var fireObj = earth.Factory.CreateParticleSystem(obj)
  if (!fireObj) {
    return
  }
  // fireObj = _editElementFire(fireObj, options);
  layer.attach_object(fireObj)

  return fireObj
}

/**
 * 编辑火对象
 * @param {*} options
 */
function _editElementFire(fireObj, options, earth, layer) {
  layer.detach_object(fireObj)
  fireObj = _createElementFire(earth, layer, options)

  return fireObj
}

/**
 * 创建火对象
 * @param {*} options
 */
function _createElementFire1(earth, layer, options) {
  var points = options.points
  var point = StampGis.Cartographic.fromCartesian(points)
  point.longitude = StampGis.StampMath.toDegrees(point.longitude)
  point.latitude = StampGis.StampMath.toDegrees(point.latitude)
  var obj = {
    guid: options.guid,
    longitude: point.longitude,
    latitude: point.latitude,
    altitude: point.height,
    width: 5
  }

  var fireObj = earth.Factory.CreateFireEffectElement(obj)
  if (!fireObj) {
    return
  }
  fireObj = _editElementFire(fireObj, options)
  layer.attach_object(fireObj)

  return fireObj
}

/**
 * 编辑火对象
 * @param {*} options
 */
function _editElementFire1(fireObj, options) {
  var name = options.name || ''
  fireObj.guid = options.guid
  fireObj.name = name
  fireObj.BeginUpdate()
  fireObj.set_is_visible(!!options.visibility)
  fireObj.EndUpdate()

  updateTransform(fireObj, options)
  return fireObj
}

/**
 * 创建警报环对象
 * @param {*} options
 */
function _createElementWarnRing(earth, layer, options) {
  var points = options.points
  var point = StampGis.Cartographic.fromCartesian(points)
  point.longitude = StampGis.StampMath.toDegrees(point.longitude)
  point.latitude = StampGis.StampMath.toDegrees(point.latitude)
  var obj = {
    guid: options.guid,
    longitude: point.longitude,
    latitude: point.latitude,
    altitude: point.height + 10
  }
  var warnObj = earth.Factory.CreateCircleBucketElement(obj)
  if (!warnObj) {
    return
  }
  warnObj = _editElementWarnRing(warnObj, options)
  layer.attach_object(warnObj)

  return warnObj
}

/**
 * 编辑警报环对象
 * @param {*} options
 */
function _editElementWarnRing(warnObj, options) {
  var name = options.name || ''
  // warnObj.guid = options.guid;
  warnObj.name = name
  warnObj.BeginUpdate()
  warnObj.set_is_visible(!!options.visibility)
  warnObj.EndUpdate()

  updateTransform(warnObj, options)
  return warnObj
}

/**
 * 创建OD线对象
 * @param {*} options
 */
function _createElementODLine(earth, layer, options, line) {
  if (!line) {
    var points = options.points
    if (points.length < 2) {
      return
    }

    var point = StampGis.Cartographic.fromCartesian(points[0])
    point.longitude = StampGis.StampMath.toDegrees(point.longitude)
    point.latitude = StampGis.StampMath.toDegrees(point.latitude)

    var point2 = StampGis.Cartographic.fromCartesian(points[1])
    point2.longitude = StampGis.StampMath.toDegrees(point2.longitude)
    point2.latitude = StampGis.StampMath.toDegrees(point2.latitude)
    var color_bg = {
      r: 0.2,
      g: 0.2,
      b: 0.6,
      a: 0.2
    }
    var color_hl = {
      r: 0.61,
      g: 0.61,
      b: 0.8,
      a: 1
    }
    options.backgroundTransparent = options.backgroundTransparent || 0.2
    if (options.backgroundColor || options.backgroundTransparent) {
      color_bg = _getColorPercent(
        options.backgroundColor,
        options.backgroundTransparent
      )
    }
    options.highlightTransparent = options.highlightTransparent || 0.2
    if (options.highlightColor || options.highlightTransparent) {
      color_hl = _getColorPercent(
        options.highlightColor,
        options.highlightTransparent
      )
    }
    var line_width = options.lineWidth || 1
    var obj = {
      guid: options.guid,
      longitude: point.longitude,
      latitude: point.latitude,
      altitude: point.height,
      dst_longitude: point2.longitude,
      dst_latitude: point2.latitude,
      dst_altitude: point2.height,
      curve_height: parseFloat(options.curveHeight),
      highlight_length: parseFloat(options.highlightLength),
      step_speed: parseFloat(options.stepSpeed),
      back_color: color_bg,
      highlight_color: color_hl,
      line_width: line_width
    }
    line = earth.Factory.CreateOdLineElement(obj)
  }

  if (!line) {
    return
  }
  line = _editElementODLine(line, options)
  layer.attach_object(line)
  return line
}
/**
 * 编辑线对象
 * @param {*} options
 */
function _editElementODLine(line, options) {
  var name = options.name || ''
  // line.guid = options.guid;
  line.name = name
  line.BeginUpdate()
  line.curve_height = parseFloat(options.curveHeight)
  line.highlight_length = parseFloat(options.highlightLength)
  line.step_speed = parseFloat(options.stepSpeed)
  if (options.backgroundColor && options.backgroundTransparent) {
    line.bg_color = _getColorPercent(
      options.backgroundColor,
      options.backgroundTransparent
    )
  }
  if (options.highlightColor && options.highlightTransparent) {
    line.hl_color = _getColorPercent(
      options.highlightColor,
      options.highlightTransparent
    )
  }
  if (line.lineWidth) {
    line.line_width = options.lineWidth
  }
  line.set_is_visible(!!options.visibility)
  line.EndUpdate()

  updateTransform(line, options)
  return line
}

/**
 * 创建热力图对象
 * @param {*} options
 */
function _createElementHeatmap(earth, layer, options) {
  var points = options.points
  // var centerPoint = options.centerPoint;
  var gradient = {
    0.25: 'rgb(0,0,255)',
    0.55: 'rgb(0,255,0)',
    0.85: 'yellow',
    1.0: 'rgb(255,0,0)'
  } // 默认值
  if (options.colorArr && options.colorArr.length > 0) {
    gradient = {}
    for (var i = 0; i < options.colorArr.length; i++) {
      gradient[options.colorArr[i].weight] = options.colorArr[i].color
    }
  }
  var obj = {
    guid: options.guid,
    radius: options.radius || 20,
    gradient: gradient,
    geo_point_array: points,
    altitude: options.altitude || 50
  }
  var heatmapObj = earth.Factory.CreateHeatMapElement(obj)
  if (!heatmapObj) {
    return
  }
  heatmapObj.name = options.name
  heatmapObj.BeginUpdate()
  heatmapObj.set_is_visible(!!options.visibility)
  heatmapObj.EndUpdate()
  // heatmapObj = _editElementHeatmap(heatmapObj, options);
  layer.attach_object(heatmapObj)

  updateTransform(heatmapObj, options)
  return heatmapObj
}

/**
 * 编辑热力图对象
 * @param {*} options
 */
function _editElementHeatmap(earth, heatmapObj, layer, options, isCreate) {
  if (isCreate) {
    layer.detach_object(heatmapObj)
    heatmapObj = _createElementHeatmap(earth, layer, options)
  } else {
    heatmapObj.name = options.name // 目前只有name需要更新
  }

  return heatmapObj
}

/**
 * 创建点云对象
 * @param {*} options
 */
function _createElementPointClouds(earth, layer, options) {
  var points = options.points
  var obj = {
    guid: options.guid,
    geo_point_array: points
  }
  var pObj = earth.Factory.CreatePointCloudsElement(obj)
  if (!pObj) {
    return
  }
  pObj.name = options.name
  pObj.BeginUpdate()
  pObj.set_is_visible(!!options.visibility)
  pObj.EndUpdate()
  // heatmapObj = _editElementHeatmap(heatmapObj, options);
  layer.attach_object(pObj)

  updateTransform(pObj, options)
  return pObj
}

/**
 * 编辑点云对象
 * @param {*} options
 */
function _editElementPointClouds(earth, pObj, layer, options, isCreate) {
  if (isCreate) {
    layer.detach_object(pObj)
    pObj = _createElementPointClouds(earth, layer, options)
  } else {
    pObj.name = options.name // 目前只有name需要更新
  }

  return pObj
}

/**
 * 创建流动线对象
 * @param {*} options
 */
function _createElementFlowLine(earth, layer, options) {
  var points = options.points
  var obj = {
    guid: options.guid,
    geo_point_array: points,
    highlight_length: parseFloat(options.highlightLength),
    step_speed: parseFloat(options.stepSpeed),
    interpolation_flag: true,
    inter_value: 3
  }
  var pObj = earth.Factory.CreateFlowLineElement(obj)
  if (!pObj) {
    return
  }
  pObj.guid = options.guid
  pObj.name = options.name
  pObj.BeginUpdate()
  pObj.set_is_visible(!!options.visibility)
  pObj.EndUpdate()
  layer.attach_object(pObj)
  return pObj
}

/*
 * 编辑流动线对象
 * @param {*} options
 */
function _editElementFlowLine(earth, pObj, layer, options, isCreate) {
  if (isCreate) {
    layer.detach_object(pObj)
    pObj = _createElementFlowLine(earth, layer, options)
  } else {
    pObj.name = options.name // 目前只有name需要更新
    pObj.highlight_length = parseFloat(options.highlightLength)
    pObj.step_speed = parseFloat(options.stepSpeed)
    pObj.interpolation_flag = true
    pObj.inter_value = 30
  }
  return pObj
}

/**
 * 创建蜂窝图对象（六边形）
 * @param {*} options
 */
function _createElementSixPolygon(earth, layer, options) {
  var point = options.points
  var obj = {
    guid: options.guid,
    longitude: point.longitude,
    latitude: point.latitude,
    altitude: point.height,
    radius: options.radius || 10,
    height: options.height || 800,
    color: _getColorPercent(options.fillColor, options.fillTransparent)
  }
  var elObj = earth.Factory.CreateHexagonElement(obj)
  if (!elObj) {
    return
  }
  var name = options.name || ''
  elObj.name = name
  elObj.BeginUpdate()
  elObj.set_is_visible(!!options.visibility)
  elObj.EndUpdate()
  layer.attach_object(elObj)

  updateTransform(elObj, options)
  return elObj
}

/**
 * 编辑蜂窝图对象（六边形）
 * @param {*} options
 */
function _editElementSixPolygon(earth, elObj, layer, options) {
  layer.detach_object(elObj)
  elObj = _createElementSixPolygon(earth, layer, options)
  return elObj
}

/**
 * 创建烟对象
 * @param {*} options
 */
function _createElementSmoke(earth, layer, options) {
  var points = options.points
  var point = StampGis.Cartographic.fromCartesian(points)
  point.longitude = StampGis.StampMath.toDegrees(point.longitude)
  point.latitude = StampGis.StampMath.toDegrees(point.latitude)

  var start_color = { red: 1.0, green: 1.0, blue: 1.0, alpha: 1.0 }
  var end_color = { red: 1.0, green: 1.0, blue: 1.0, alpha: 0.0 }

  var obj = {
    guid: options.guid,
    longitude: point.longitude,
    latitude: point.latitude,
    altitude: point.height,
    width: 20,
    imageSize: { x: 0.5, y: 0.5 },
    startColor: start_color,
    endColor: end_color,
    emissionRate: 5,
    emitter: earth.Factory.CreateCircleEmitter(0.2),
    image: stamp_core_config.baseUrlString + 'Assets/Textures/smoke1.png',
    startScale: 1.3,
    endScale: 1.8,
    minimumSpeed: 1.0,
    maximumSpeed: 1.8,
    minimumParticleLife: 1.5,
    maximumParticleLife: 1.5,
    lifetime: 16,
    sizeInMeters: true,
    loop: true,
    parentLayer: earth.document.elementRoot
  }
  var smokeObj = earth.Factory.CreateParticleSystem(obj)
  if (!smokeObj) {
    return
  }
  // smokeObj = _editElementSmoke(smokeObj, options);
  layer.attach_object(smokeObj)
  return smokeObj
}

/**
 * 编辑烟对象
 * @param {*} options
 */
function _editElementSmoke(smokeObj, options, earth, layer) {
  layer.detach_object(smokeObj)
  smokeObj = _createElementSmoke(earth, layer, options)

  return smokeObj
}

/**
 * 创建烟对象
 * @param {*} options
 */
function _createElementSmoke1(earth, layer, options) {
  var points = options.points
  var point = StampGis.Cartographic.fromCartesian(points)
  point.longitude = StampGis.StampMath.toDegrees(point.longitude)
  point.latitude = StampGis.StampMath.toDegrees(point.latitude)
  var obj = {
    guid: options.guid,
    longitude: point.longitude,
    latitude: point.latitude,
    altitude: point.height,
    width: 20
  }
  var smokeObj = earth.Factory.CreateSmokeEffectElement(obj)
  if (!smokeObj) {
    return
  }
  smokeObj = _editElementSmoke(smokeObj, options)
  layer.attach_object(smokeObj)
  return smokeObj
}

/**
 * 编辑烟对象
 * @param {*} options
 */
function _editElementSmoke1(smokeObj, options) {
  var name = options.name || ''
  smokeObj.guid = options.guid
  smokeObj.name = name
  smokeObj.BeginUpdate()
  smokeObj.set_is_visible(!!options.visibility)
  smokeObj.EndUpdate()
  updateTransform(smokeObj, options)
  return smokeObj
}

// ///////////////////////////////////////////////////////////////////////////////////////////////
/**
 * 创建多边形色阶图
 * @param {*} options
 */
function _createElementpolyhedron(earth, layer, options) {
  var points = options.points
  var obj = {
    guid: options.guid,
    geo_point_array: points,
    height: parseInt(options.height) || 800,
    color: _getColorPercent(options.fillColor, options.fillTransparent)
  }
  var elObj = earth.Factory.CreatePolyhedronElement(obj)
  if (!elObj) {
    return
  }
  var name = options.name || ''
  elObj.guid = options.guid
  elObj.name = name
  elObj.BeginUpdate()
  elObj.set_is_visible(!!options.visibility)
  elObj.EndUpdate()
  layer.attach_object(elObj)
  return elObj
}

/**
 * 编辑多边形色阶图
 * @param {*} options
 */
function _editElementpolyhedron(earth, elObj, layer, options) {
  layer.detach_object(elObj)
  elObj = _createElementpolyhedron(earth, layer, options)
  return elObj
}

// //////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * 创建喷泉对象
 * @param {*} options
 */
function _createElementNozzle(earth, layer, options) {
  var points = options.points
  var point = StampGis.Cartographic.fromCartesian(points)
  point.longitude = StampGis.StampMath.toDegrees(point.longitude)
  point.latitude = StampGis.StampMath.toDegrees(point.latitude)
  var obj = {
    guid: options.guid,
    longitude: point.longitude,
    latitude: point.latitude,
    altitude: point.height,
    width: 20
  }
  var nozzleObj = earth.Factory.CreateWaterCannonElement(obj)
  if (!nozzleObj) {
    return
  }
  nozzleObj = _editElementNozzle(nozzleObj, options)
  layer.attach_object(nozzleObj)

  return nozzleObj
}

/**
 * 编辑喷泉对象
 * @param {*} options
 */
function _editElementNozzle(nozzleObj, options) {
  var name = options.name || ''
  nozzleObj.guid = options.guid
  nozzleObj.name = name
  nozzleObj.BeginUpdate()
  nozzleObj.set_is_visible(!!options.visibility)
  nozzleObj.EndUpdate()
  updateTransform(nozzleObj, options)
  return nozzleObj
}

// //////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * 创建水面
 * @param {*} earth
 * @param {*} options
 */
function _createElementWater(earth, options) {
  var name = options.name || ''
  var water = earth.Factory.CreateGeometryWater({
    guid: options.guid,
    name: name,
    doc: earth.document
  })

  if (!water) {
    return
  }
  water = _editElementWater(water, options)
  earth.document.elementRoot.attach_object(water)
  earth.document.register_object(water)
  // water.show_high_light();

  return water
}

/**
 * 编辑水面
 * @param {*} water
 * @param {*} options
 */
function _editElementWater(water, options) {
  var points = options.points
  var name = options.name || ''
  // water.guid = options.guid;
  water.name = name
  water.BeginUpdate()
  water.SetExteriorRing(points)

  let tempColor = _getColorPercent(options.color, options.transparent);
  let color = new StampGis.Cartesian4(tempColor.r, tempColor.g, tempColor.b, tempColor.a);
  water.set_water_color(color)
  water.set_is_visible(!!options.visibility)
  water.EndUpdate()

  updateTransform(water, options)
  return water
}

// //////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * 标注点对象
 * @param {*} earth
 * @param {*} callback
 */
function _createPoint(earth, callback) {
  earth.ShapeCreator.CreatePoint({
    custom_excute_finish: function (result) {
      if (typeof callback === 'function') {
        callback(result && result.data ? result.data : null)
      }
      // create_volume_symbol(result.data);
      earth.ShapeCreator.Clear()
    }
  })
}

/**
 * 创建点对象
 * @param {*} options
 */
function _createElementPoint(earth, options) {
  var name = options.name || ''
  var icon = earth.Factory.CreateElementIcon({
    guid: options.guid,
    name: name,
    doc: earth.document,
    parentLayer: earth.document.elementRoot
  })
  if (!icon) {
    return
  }
  icon = _editElementPoint(icon, options)
  earth.document.elementRoot.attach_object(icon)
  earth.document.register_object(icon)
  return icon
}

/**
 * 创建点对象
 * @param {*} options
 */
function _createElementPoint1(earth, options) {
  var name = options.name || ''
  var icon = earth.Factory.CreateElementIcon({
    guid: options.guid,
    name: name,
    doc: earth.document,
    parentLayer: earth.document.elementRoot
  })
  if (!icon) {
    return
  }
  icon = _editElementPoint1(icon, options)
  earth.document.elementRoot.attach_object(icon)
  earth.document.register_object(icon)
  return icon
}

/**
 * 编辑点对象
 * @param {*} options
 */
function _editElementPoint(icon, options, callback) {
  var points = options.points
  var name = options.name || ''
  // icon.NormalIcon.IconLink = "http://192.168.100.164/StampWebGL/images/centerPoint.png";
  if (options.iconPath_Data) {
    icon.NormalIcon.DbTextureData = options.iconPath_Data
    // icon.NormalIcon.IconLink = custom_config.server_ip + "/sde?" + options.iconPath;
  }
  if (options.highlightIconPath_Data) {
    icon.HighlightIcon.DbTextureData = options.highlightIconPath_Data
    // icon.HighlightIcon.IconLink = custom_config.server_ip + "/sde?" + options.highlightIconPath;
  }

  // icon.guid = options.guid;
  icon.name = name
  icon.NormalIcon.IconIsClip = true
  icon.HighlightIcon.IconIsClip = true
  icon.transform.set_position_geo(points)
  icon.ShowHandle = options.showHandle
  if (options.showHandle) {
    icon.HandleHeight = parseFloat(options.handleHeight)
    icon.HandleColor = _colorToHex(options.handleLineColor, 255)
  } else {
    icon.HandleHeight = 0
  }
  icon.RenderMode = 0
  icon.TextColor = _colorToHex(options.textColor, 255)
  icon.TextHorizontalScale = parseFloat(options.textScale)
  icon.TextVerticalScale = parseFloat(options.textScale)
  icon.Text = name
  // icon.Seperator = ",";
  // icon.ShowBackground = true;
  // icon.ShowFrame = true;
  // icon.BackgroundColor = 0xccff0000;
  // icon.FrameColor = 0xcc00ff00;
  // icon.ComplexColNum = 2;
  // icon.ComplexRowNum = 3;
  // icon.AlignMethod = 1;
  icon.minVisibleRange = parseFloat(options.visibleRange.split(',')[0]) * 1000
  icon.maxVisibleRange = parseFloat(options.visibleRange.split(',')[1]) * 1000
  icon.Create()
  icon.BeginUpdate()
  icon.set_is_visible(!!options.visibility)
  icon.EndUpdate()

  updateTransform(icon, options)
  return icon
}

/**
 * 编辑点对象
 * @param {*} options
 */
function _editElementPoint1(icon, options, callback) {
  var points = options.points
  var name = options.name || ''
  // icon.NormalIcon.IconLink = "http://192.168.100.164/StampWebGL/images/centerPoint.png";
  if (options.iconPath_Data) {
    icon.NormalIcon.DbTextureData = options.iconPath_Data
    // icon.NormalIcon.IconLink = custom_config.server_ip + "/sde?" + options.iconPath;
  }
  if (options.highlightIconPath_Data) {
    icon.HighlightIcon.DbTextureData = options.highlightIconPath_Data
    // icon.HighlightIcon.IconLink = custom_config.server_ip + "/sde?" + options.highlightIconPath;
  }

  // icon.guid = options.guid;
  icon.name = 'name'
  icon.NormalIcon.IconIsClip = true
  icon.HighlightIcon.IconIsClip = true
  icon.transform.set_position_geo(points)
  icon.ShowHandle = options.showHandle
  if (options.showHandle) {
    icon.HandleHeight = parseFloat(options.handleHeight)
    icon.HandleColor = _colorToHex(options.handleLineColor, 255)
  } else {
    icon.HandleHeight = 0
  }
  icon.RenderMode = 0

  let arr = options.name.split('@');
  if (options.name.indexOf(':') != -1) {
    for (let i = 0; i < arr.length; i++) {
      let temp = arr[i].split(':');
      icon.AddComplexText(temp[0]);
      if (temp.length > 1) {
        icon.AddComplexText(temp[1]);
      }
    }
  } else {
    // let arr = options.name.split('@');
    for (let i = 0; i < arr.length; i++) {
      icon.AddComplexText(arr[i]);
    }
  }
  // icon.AddComplexText();
  icon.ComplexColNum = options.name.indexOf(':') != -1 ? 2 : 1;
  icon.ComplexRowNum = arr.length;
  icon.AlignMethod = 0;
  // icon.TextColor = _colorToHex(options.textColor, 255)
  // icon.TextHorizontalScale = parseFloat(options.textScale)
  // icon.TextVerticalScale = parseFloat(options.textScale)
  // icon.Text = name
  // icon.Seperator = ",";
  // icon.ShowBackground = true;
  // icon.ShowFrame = true;
  // icon.BackgroundColor = 0xccff0000;
  // icon.FrameColor = 0xcc00ff00;
  // icon.ComplexColNum = 2;
  // icon.ComplexRowNum = 3;
  // icon.AlignMethod = 1;
  icon.minVisibleRange = parseFloat(options.visibleRange.split(',')[0]) * 1000
  icon.maxVisibleRange = parseFloat(options.visibleRange.split(',')[1]) * 1000
  icon.Create()
  icon.BeginUpdate()
  icon.set_is_visible(!!options.visibility)
  icon.EndUpdate()

  updateTransform(icon, options)
  return icon
}

// //////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * 绘制线
 * @param {*} options
 *  @earth  三维地球
 *  @callback 回调
 */
function _createLine(earth, callback) {
  earth.ShapeCreator.CreateLine({
    custom_excute_finish: function (result) {
      if (typeof callback === 'function') {
        callback(result && result.data ? result.data : null)
      }
      earth.ShapeCreator.Clear()
    }
  })
}

/**
 * 绘制多段线
 * @param {*} options
 *  @earth  三维地球
 *  @callback 回调
 */
function _createPolyline(earth, callback) {
  earth.ShapeCreator.CreatePolyline({
    custom_excute_finish: function (result) {
      if (typeof callback === 'function') {
        callback(result && result.data ? result.data : null)
      }
      earth.ShapeCreator.Clear()
    }
  })
}

/**
 * 创建线对象
 * @param {*} options
 */
function _createElementLine(earth, options, line) {
  if (!line) {
    var name = options.name || ''
    line = earth.Factory.CreateElementLine({
      guid: options.guid,
      name: name,
      doc: earth.document
    })
  }

  if (!line) {
    return
  }
  line = _editElementLine(line, options)
  earth.document.elementRoot.attach_object(line)
  earth.document.register_object(line)
  return line
}

/**
 * 提前创建线对象，用于获取长度信息
 * @param {*} options
 */
function _createElementLineByPoints(earth, points) {
  var line = earth.Factory.CreateElementLine({
    name: '',
    doc: earth.document
  })
  line.BeginUpdate()
  line.SetPointArray(points)
  line.EndUpdate()
  return line
}

/**
 * 编辑线对象
 * @param {*} options
 */
function _editElementLine(line, options) {
  var points = options.points
  var name = options.name || ''
  var lineColor = _colorToHex(options.lineColor, options.lineColorTransparent)
  var altitudeType =
    options.altitudeType != undefined ? parseInt(options.altitudeType) : 1
  var lineWidth = parseInt(options.lineWidth) || 1
  var drawOrder = parseInt(options.drawOrder) || 0
  var arrowType = parseInt(options.arrowType) || 0

  // line.guid = options.guid;
  line.name = name
  line.BeginUpdate()
  line.SetPointArray(points)
  line.set_altitude_type(altitudeType)
  line.lineColor = lineColor
  line.lineWidth = lineWidth
  line.drawOrder = drawOrder
  line.arrowType = arrowType
  line.set_is_visible(!!options.visibility)
  line.EndUpdate()

  updateTransform(line, options)
  return line
}
// //////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * 绘制曲线
 * @param {*} options
 *  @earth  三维地球
 *  @callback 回调
 */
function _createCurve(earth, callback) {
  earth.ShapeCreator.CreateCurve({
    custom_excute_finish: function (result) {
      if (typeof callback === 'function') {
        callback(result && result.data ? result.data : null)
      }
      earth.ShapeCreator.Clear()
    }
  })
}

/**
 * 创建曲线对象
 * @param {*} options
 */
function _createElementCurve(earth, options) {
  // var name = options.name || "";
  // debugger
  // var curve = earth.Factory.CreateElementLine({
  //   guid: options.guid,
  //   name: name,
  //   doc: earth.document,
  // });
  // if (!curve) {
  //   return;
  // }

  // curve = _editElementCurve(curve, options);
  // earth.document.elementRoot.attach_object(curve);
  // earth.document.register_object(curve);
  // // curve.show_high_light();
  // return curve;

  var symbol = earth.Factory.CreateElementTextureSymbol({
    name: options.name || '',
    doc: earth.document,
    symbolRtti: options.rtti,
    guid: options.guid
  })
  if (!symbol) {
    return
  }
  symbol = _editElementCurve(symbol, options)
  earth.document.elementRoot.attach_object(symbol)
  earth.document.register_object(symbol)
  symbol.show_high_light()
  return symbol
}

/**
 * 编辑曲线对象
 * @param {*} options
 */
function _editElementCurve(symbol, options) {
  // var points = options.points;
  // var name = options.name || "";
  // var curveColor = _colorToHex(options.lineColor, options.lineColorTransparent);
  // var altitudeType =
  //   options.altitudeType != undefined ? parseInt(options.altitudeType) : 1;
  // var curveWidth = parseInt(options.lineWidth) || 1;
  // var drawOrder = parseInt(options.drawOrder) || 0;
  // var arrowType = parseInt(options.arrowType) || 0;

  // // curve.guid = options.guid;
  // curve.name = name;
  // curve.BeginUpdate();
  // curve.SetPointArray(points);
  // curve.set_altitude_type(altitudeType);
  // curve.lineColor = curveColor;
  // curve.lineWidth = curveWidth;
  // curve.drawOrder = drawOrder;
  // curve.arrowType = arrowType;
  // curve.set_is_visible(!!options.visibility);
  // curve.EndUpdate();

  // updateTransform(curve, options);
  // return curve;

  var name = options.name || ''
  var lineColor = _colorToHex(options.lineColor, options.lineColorTransparent)
  var altitudeType = parseInt(options.altitudeType) || 1
  var lineWidth = parseInt(options.lineWidth) || 1
  var drawOrder = parseInt(options.drawOrder) || 0
  var symbolStyle = symbol.symbolStyle
  symbolStyle.libraryName = stamp_core_config.baseUrlString + 'Assets/MilitaryPlotting.symlib'// STAMP_config.filePath.symbolStyle_ip;
  symbolStyle.symbolId = '001'
  symbolStyle.colorArgb = lineColor
  symbolStyle.outlineColorArgb = lineColor
  symbolStyle.outlineWidth = lineWidth
  symbol.guid = options.guid
  symbol.name = name
  symbol.BeginUpdate()
  symbol.SetControlPoints(options.points, false)
  symbol.set_altitude_type(altitudeType)
  symbol.drawOrder = drawOrder
  symbol.set_is_visible(!!options.visibility)
  symbol.EndUpdate()
  return symbol
}

// //////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * 绘制多边形
 */
function _createPolygon(earth, callback) {
  earth.ShapeCreator.CreatePolygon({
    custom_excute_finish: function (result) {
      if (typeof callback === 'function') {
        callback(result && result.data ? result.data : null)
      }
      earth.ShapeCreator.Clear()
    }
  })
}

/**
 * 创建多边形
 * @param {*} earth
 * @param {*} options
 */
function _createElementPolygon(earth, options, polygon) {
  if (!polygon) {
    var name = options.name || ''
    polygon = earth.Factory.CreateElementPolygon({
      guid: options.guid,
      name: name,
      doc: earth.document
    })
  }

  if (!polygon) {
    return
  }
  polygon = _editElementPolygon(polygon, options)
  earth.document.elementRoot.attach_object(polygon)
  earth.document.register_object(polygon)
  return polygon
}

/**
 * 创建多边形
 * @param {*} earth
 * @param {*} options
 */
function _createElementPolygonByPoints(earth, points) {
  var polygon = earth.Factory.CreateElementPolygon({
    name: name,
    doc: earth.document
  })
  polygon.BeginUpdate()
  polygon.SetExteriorRing(points)
  polygon.EndUpdate()
  return polygon
}

/**
 * 编辑多边形
 * @param {*} polygon
 * @param {*} options
 */
function _editElementPolygon(polygon, options) {
  var points = options.points
  var innerPoints = options['innerPoints']
  var name = options.name || ''
  var lineColor = _colorToHex(options.lineColor, options.lineColorTransparent)
  var fillColor = _colorToHex(options.fillColor, options.fillColorTransparent)
  var altitudeType =
    options.altitudeType != undefined ? parseInt(options.altitudeType) : 1
  var lineWidth = parseInt(options.lineWidth) || 1
  var drawOrder = parseInt(options.drawOrder) || 0

  polygon.name = name
  polygon.BeginUpdate()
  polygon.SetExteriorRing(points)
  if (innerPoints && innerPoints.length > 0) {
    for (var i = 0; i < innerPoints.length; i++) {
      polygon.AddInteriorRing(innerPoints[i])
    }
  }
  polygon.set_altitude_type(altitudeType)
  polygon.lineColor = lineColor
  polygon.lineWidth = lineWidth
  polygon.fillColor = fillColor
  polygon.drawOrder = drawOrder
  polygon.set_is_visible(!!options.visibility)
  polygon.EndUpdate()

  updateTransform(polygon, options)
  return polygon
}

// //////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * 创建纹理多边形
 * @param {*} earth
 * @param {*} options
 */
function _createElementTexturePolygon(earth, options) {
  var name = options.name || ''
  var Texturepolygon = earth.Factory.CreateElementTexturePolygon({
    guid: options.guid,
    name: name,
    doc: earth.document
  })
  if (!Texturepolygon) {
    return
  }
  Texturepolygon = _editElementTexturePolygon(Texturepolygon, options)
  earth.document.elementRoot.attach_object(Texturepolygon)
  earth.document.register_object(Texturepolygon)
  Texturepolygon.show_high_light()
  return Texturepolygon
}

/**
 * 编辑纹理多边形
 * @param {*} Texturepolygon
 * @param {*} options
 */
function _editElementTexturePolygon(Texturepolygon, options) {
  var points = options.points
  var name = options.name || ''
  var lineColor = _colorToHex(options.lineColor, options.lineColorTransparent)
  var fillColor = _colorToHex(options.fillColor, options.fillColorTransparent)
  var altitudeType =
    options.altitudeType != undefined ? parseInt(options.altitudeType) : 1
  var lineWidth = parseInt(options.lineWidth) || 1
  Texturepolygon.guid = options.guid
  Texturepolygon.name = name
  Texturepolygon.BeginUpdate()
  Texturepolygon.SetExteriorRing(points)
  Texturepolygon.set_altitude_type(altitudeType)
  Texturepolygon.lineColor = lineColor
  Texturepolygon.lineWidth = lineWidth
  Texturepolygon.fillColor = fillColor
  if (options.picture_Data) {
    Texturepolygon.DbTextureData = options.picture_Data
  }
  Texturepolygon._textureEnable = options.vein
  // TexturePolygon.textureTiltX = parseInt(options.broadwise);
  // TexturePolygon.textureTiltY = parseInt(options.vertical);
  Texturepolygon.set_is_visible(!!options.visibility)
  Texturepolygon.EndUpdate()

  updateTransform(Texturepolygon, options)
  return Texturepolygon
}

// /////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * 创建圆
 */
function _createCircle(earth, callback) {
  earth.ShapeCreator.CreateCircle({
    custom_excute_finish: function (result) {
      if (typeof callback === 'function') {
        callback(result) // result.data和result.radius
      }
      earth.ShapeCreator.Clear()
    }
  })
}

/**
 * 创建圆
 * @param {*} earth
 * @param {*} options
 */
function _createElementCircle(earth, options, circle) {
  if (!circle) {
    var name = options.name || ''
    circle = earth.Factory.CreateElementCircle({
      guid: options.guid,
      name: name,
      doc: earth.document
    })
  }

  if (!circle) {
    return
  }
  circle = _editElementCircle(circle, options)
  earth.document.elementRoot.attach_object(circle)
  earth.document.register_object(circle)
  return circle
}

/**
 * 创建圆
 * @param {*} earth
 * @param {*} options
 */
function _createElementCircleByPoints(earth, points) {
  var circle = earth.Factory.CreateElementCircle({
    name: '',
    doc: earth.document
  })
  circle.BeginUpdate()
  circle.setRadiusAndCenter(points.radius, points.data[0])
  circle.EndUpdate()
  return circle
}

/**
 * 编辑圆
 * @param {*} circle
 * @param {*} options
 */
function _editElementCircle(circle, options) {
  var points = options.points
  var radius = options.radius
  var name = options.name || ''
  var lineColor = _colorToHex(options.lineColor, options.lineColorTransparent)
  var fillColor = _colorToHex(options.fillColor, options.fillColorTransparent)
  var altitudeType =
    options.altitudeType != undefined ? parseInt(options.altitudeType) : 1
  var lineWidth = parseInt(options.lineWidth) || 1
  var drawOrder = parseInt(options.drawOrder) || 0

  // circle.guid = options.guid;
  circle.name = name
  circle.BeginUpdate()
  circle.setRadiusAndCenter(radius, points[0])
  circle.set_altitude_type(altitudeType)
  circle.lineColor = lineColor
  circle.lineWidth = lineWidth
  circle.fillColor = fillColor
  circle.drawOrder = drawOrder
  circle.set_is_visible(!!options.visibility)
  circle.EndUpdate()

  updateTransform(circle, options)
  return circle
}

/**
 * 创建纹理多边形
 * @param {*} earth
 * @param {*} options
 */
function _createElementGuardline(earth, options) {
  var guardline = earth.Factory.CreateGuardLIne({
    guid: options.guid || createGuid(),
    name: options.name || '',
    doc: earth.document
  })
  guardline = _editElementGuardline(guardline, options)
  earth.document.elementRoot.attach_object(guardline)
  earth.document.register_object(guardline)
  return guardline
}

/**
 * 编辑警戒线
 * @param {*} guardline
 * @param {*} options
 */
function _editElementGuardline(guardline, options) {
  var points = options.points
  var name = options.name || ''
  // var altitudeType = options.altitudeType!=undefined?parseInt(options.altitudeType) : 1;
  guardline.name = name
  guardline.BeginUpdate()
  guardline.set_altitude_type(0)
  guardline.SetPointArray(points)
  guardline.column_radius = parseFloat(options.columnRadius) || 0.05
  guardline.column_height = parseFloat(options.columnHeight) || 1
  guardline.banner_height = parseFloat(options.bannerHeight) || 0.5
  guardline.banner_width = parseFloat(options.bannerWidth) || 0.3
  if (options.columnTexture_Data) {
    guardline.column_texture_data = options.columnTexture_Data
  }
  if (options.bannerTexture_Data) {
    guardline.banner_texture_data = options.bannerTexture_Data
  }
  guardline.set_is_visible(!!options.visibility)
  guardline.EndUpdate()

  updateTransform(guardline, options)
  return guardline
}

function _createModel(earth, layer, options) {
  var point = options.points
  var model = null
  switch (options.type) {
    case 'model':
      model = earth.Factory.CreateEditSingleModel({
        guid: options.guid,
        name: options.name || '',
        longitude: point.longitude,
        latitude: point.latitude,
        altitude: point.height,
        url: options.modelFile_Key,
        data_storage_type: StampGis.DataStorageType.Indexdb
      })
      break
    case 'billboard':
      model = earth.Factory.CreateEditBillboard({
        guid: options.guid,
        name: options.name || '',
        longitude: point.longitude,
        latitude: point.latitude,
        altitude: point.height,
        url: options.modelFile_Key,
        data_storage_type: StampGis.DataStorageType.Indexdb
      })
      break
    case 'matchmodel':
      model = earth.Factory.CreateEditSingleModel({
        guid: options.guid,
        name: options.name || '',
        longitude: point.longitude,
        latitude: point.latitude,
        altitude: point.height,
        url: options.modelFile_Key,
        data_storage_type: StampGis.DataStorageType.Indexdb
      })
      break
  }

  model.name = options.name || ''
  model.BeginUpdate()
  model.set_is_visible(!!options.visibility)
  model.EndUpdate()
  updateTransform(model, options)
  layer.attach_object(model)
  earth.document.register_object(model)
  return model
}

function _editModel(earth, modelObj, layer, options) {
  layer.detach_object(modelObj)
  modelObj = _createModel(earth, layer, options)
  return modelObj
}

function _createSmokeFire(earth, options) {
  StampGis.StampMath.setRandomNumberSeed(315)
  const startColor = {
    red: 1.0,
    green: 1.0,
    blue: 1.0,
    alpha: 1.0
  }
  const endColor = {
    red: 1.0,
    green: 1.0,
    blue: 1.0,
    alpha: 0.0
  }
  var bursts = []
  for (var j = 0; j < 3; ++j) {
    bursts.push(
      earth.Factory.CreateParticleBurst({
        time: StampGis.StampMath.nextRandomNumber() * 10.0,
        minimum: 400.0,
        maximum: 400.0
      })
    )
  }
  const objOpt = {
    guid: options.guid,
    longitude: options.lon,
    latitude: options.lat,
    altitude: 300.0,
    width: 10,
    imageSize: {
      x: options.imageSize,
      y: options.imageSize
    },
    startColor: startColor,
    endColor: endColor,
    speed: 100,
    emissionRate: options.emissionRate,
    emitter: earth.Factory.CreateSphereEmitter(0.1),
    bursts: bursts,
    lifetime: 10.0,
    minimumParticleLife: options.minLife,
    maximumParticleLife: options.maxLife,
    image: _getImage(),
    startScale: options.startScale,
    endScale: options.endScale
  }
  const particleObj = earth.Factory.CreateParticleSystem(objOpt)
  earth.document.elementRoot.attach_object(particleObj)
  earth.document.register_object(particleObj)
  return particleObj
}

function _getImage() {
  const particleCanvas = document.createElement('canvas')
  particleCanvas.width = 32
  particleCanvas.height = 32
  const context2D = particleCanvas.getContext('2d')
  context2D.fillStyle = 'rgb(180, 180, 180)'
  // context2D.fillRect(0,0,32,32);
  context2D.beginPath()
  context2D.arc(16, 16, 16, 0, Math.PI * 2.0, true)
  context2D.closePath()

  context2D.fill()
  return particleCanvas
}

// 七色弧线
function _createEleSevenArcs(earth, layer, opt) {
  const sp = StampGis.Cartographic.fromCartesian(opt.points[0])
  sp.longitude = StampGis.StampMath.toDegrees(sp.longitude)
  sp.latitude = StampGis.StampMath.toDegrees(sp.latitude)
  const ep = StampGis.Cartographic.fromCartesian(opt.points[1])
  ep.longitude = StampGis.StampMath.toDegrees(ep.longitude)
  ep.latitude = StampGis.StampMath.toDegrees(ep.latitude)
  const objOpt = {
    guid: opt.guid,
    longitude: sp.longitude,
    latitude: sp.latitude,
    altitude: sp.height,
    dst_longitude: ep.longitude,
    dst_latitude: ep.latitude,
    dst_altitude: ep.height,
    curve_height: parseFloat(opt.curveHeight) || 800.0, // 中心高度
    step_speed: parseFloat(opt.stepSpeed) || 15, // 运动速度
    line_width: opt.lineWidth || 20 //
  }
  const flowColor = earth.Factory.CreateFlowColorElement(objOpt)
  if (!flowColor) {
    return
  }
  _editEleFlowColor(flowColor, opt)
  layer.attach_object(flowColor)
  return flowColor
}

function _editEleFlowColor(flowColor, opt) {
  var name = opt.name || ''
  flowColor.name = name
  flowColor.BeginUpdate()
  flowColor.curve_height = parseFloat(opt.curveHeight)
  flowColor.step_speed = parseFloat(opt.stepSpeed)
  flowColor.set_is_visible(!!opt.visibility)
  flowColor.EndUpdate()
  return flowColor
}

// 渐进线
function _createEleProArc(earth, layer, opt) {
  const sp = StampGis.Cartographic.fromCartesian(opt.points[0])
  sp.longitude = StampGis.StampMath.toDegrees(sp.longitude)
  sp.latitude = StampGis.StampMath.toDegrees(sp.latitude)
  const ep = StampGis.Cartographic.fromCartesian(opt.points[1])
  ep.longitude = StampGis.StampMath.toDegrees(ep.longitude)
  ep.latitude = StampGis.StampMath.toDegrees(ep.latitude)
  const color = colorRgba(opt.lineColor, opt.lineColorTransparent)
  const objOpt = {
    guid: opt.guid,
    longitude: sp.longitude,
    latitude: sp.latitude,
    altitude: sp.height,
    dst_longitude: ep.longitude,
    dst_latitude: ep.latitude,
    dst_altitude: ep.height,
    curve_height: parseFloat(opt.curveHeight) || 800.0, // 中心高度
    step_speed: parseFloat(opt.stepSpeed) || 15, // 运动速度
    line_width: opt.lineWidth || 20, //
    line_color: color
  }
  const transparenTine = earth.Factory.CreateTransparentLine(objOpt)
  if (!transparenTine) {
    return
  }
  _editEleProArc(transparenTine, opt)
  layer.attach_object(transparenTine)
  return transparenTine
}

function _editEleProArc(transparenTine, opt) {
  var name = opt.name || ''
  const color = colorRgba(opt.lineColor, opt.lineColorTransparent)
  transparenTine.name = name
  transparenTine.BeginUpdate()
  transparenTine.curve_height = parseFloat(opt.curveHeight)
  transparenTine.step_speed = parseFloat(opt.stepSpeed)
  transparenTine.lineColor = color
  transparenTine.lineWidth = opt.lineWidth || 2
  transparenTine.set_is_visible(!!opt.visibility)
  transparenTine.EndUpdate()
  return transparenTine
}

// 运动弧线
function _createEleMoveSolLine(earth, layer, opt) {
  const sp = StampGis.Cartographic.fromCartesian(opt.points[0])
  sp.longitude = StampGis.StampMath.toDegrees(sp.longitude)
  sp.latitude = StampGis.StampMath.toDegrees(sp.latitude)
  const ep = StampGis.Cartographic.fromCartesian(opt.points[1])
  ep.longitude = StampGis.StampMath.toDegrees(ep.longitude)
  ep.latitude = StampGis.StampMath.toDegrees(ep.latitude)
  const color = colorRgba(opt.lineColor, opt.lineColorTransparent)
  const objOpt = {
    guid: opt.guid,
    longitude: sp.longitude,
    latitude: sp.latitude,
    altitude: sp.height,
    dst_longitude: ep.longitude,
    dst_latitude: ep.latitude,
    dst_altitude: ep.height,
    curve_height: parseFloat(opt.curveHeight) || 800.0, // 中心高度
    step_speed: parseFloat(opt.stepSpeed) || 25, // 运动速度
    line_width: opt.lineWidth || 2, //
    line_color: color
  }
  const moveSolLine = earth.Factory.CreateDottedLine(objOpt)
  if (!moveSolLine) {
    return
  }

  layer.attach_object(moveSolLine)
  return moveSolLine
}

function _editEleMoveSolLine(moveSolLine, opt) {
  _editEleProArc(moveSolLine, opt)
}

// 运动折线
function _createEleBrokenDot(earth, layer, opt) {
  const points = opt.points
  const geoPoints = []
  for (let i = 0, len = points.length; i < len; i++) {
    const tempObj = {}
    const point = StampGis.Cartographic.fromCartesian(points[i])
    tempObj.longitude = StampGis.StampMath.toDegrees(point.longitude)
    tempObj.latitude = StampGis.StampMath.toDegrees(point.latitude)
    tempObj.altitude = point.height
    geoPoints.push(tempObj)
  }
  const color = colorRgba(opt.lineColor, opt.lineColorTransparent)
  const objOpt = {
    guid: opt.guid,
    inter_value: +opt.interValue || 3,
    step_speed: parseFloat(opt.stepSpeed) || 25, // 运动速度
    line_width: +opt.lineWidth || 2, //
    geo_point_array: geoPoints,
    line_color: color
  }
  const transparenTine = earth.Factory.CreateBrokenDotted(objOpt)
  if (!transparenTine) {
    return
  }

  layer.attach_object(transparenTine)
  return transparenTine
}

function _editEleBrokenDot(brokendot, opt) {
  var name = opt.name || ''
  const color = colorRgba(opt.lineColor, opt.lineColorTransparent)
  brokendot.name = name
  brokendot.BeginUpdate()
  brokendot.inter_value = opt.interValue || 3
  brokendot.line_width = opt.lineWidth || 2
  brokendot.step_speed = parseFloat(opt.stepSpeed) || 25
  brokendot.lineColor = color
  brokendot.set_is_visible(!!opt.visibility)
  brokendot.EndUpdate()
  return brokendot
}

// 运动箭头
function _createEleMoveArrow(earth, layer, opt) {
  const points = opt.points
  const geoPoints = []
  for (let i = 0, len = points.length; i < len; i++) {
    const tempObj = {}
    const point = StampGis.Cartographic.fromCartesian(points[i])
    tempObj.longitude = StampGis.StampMath.toDegrees(point.longitude)
    tempObj.latitude = StampGis.StampMath.toDegrees(point.latitude)
    tempObj.altitude = point.height
    geoPoints.push(tempObj)
  }
  const color = colorRgba(opt.lineColor, opt.lineColorTransparent)
  const objOpt = {
    guid: opt.guid,
    inter_value: +opt.interValue || 3,
    step_speed: +opt.stepSpeed || 5,
    line_width: +opt.lineWidth || 2,
    arrow_length: +opt.arrowLength || 32,
    geo_point_array: geoPoints,
    line_color: color
  }
  const moveArrow = earth.Factory.CreateMovedArrow(objOpt)
  if (!moveArrow) {
    return
  }

  layer.attach_object(moveArrow)
  return moveArrow
}

function _editEleMoveArrow(moveArrow, opt) {
  var name = opt.name || ''
  const color = colorRgba(opt.lineColor, opt.lineColorTransparent)
  moveArrow.name = name
  moveArrow.BeginUpdate()
  moveArrow.inter_value = opt.interValue || 3
  moveArrow.arrow_length = opt.arrowLength || 32
  moveArrow.line_width = opt.lineWidth || 2
  moveArrow.step_speed = parseFloat(opt.stepSpeed) || 5
  moveArrow.line_color = color
  moveArrow.set_is_visible(!!opt.visibility)
  moveArrow.EndUpdate()
  return moveArrow
}

// 光晕线
function _createEleGlowLine(earth, layer, opt) {
  const points = opt.points
  const geoPoints = []
  for (let i = 0, len = points.length; i < len; i++) {
    const tempObj = {}
    const point = StampGis.Cartographic.fromCartesian(points[i])
    tempObj.longitude = StampGis.StampMath.toDegrees(point.longitude)
    tempObj.latitude = StampGis.StampMath.toDegrees(point.latitude)
    tempObj.altitude = point.height
    geoPoints.push(tempObj)
  }
  const color = colorRgba(opt.lineColor, opt.lineColorTransparent)
  const objOpt = {
    guid: opt.guid,
    inter_value: opt.interValue || 3,
    line_width: opt.lineWidth || 2, //
    ratio: opt.ratio || 0.1,
    geo_point_array: geoPoints,
    line_color: color
  }
  const glowLine = earth.Factory.CreateGlowLine(objOpt)
  if (!glowLine) {
    return
  }

  layer.attach_object(glowLine)
  return glowLine
}

function _editEleGlowLine(glowLine, opt) {
  var name = opt.name || ''
  const color = colorRgba(opt.lineColor, opt.lineColorTransparent)
  glowLine.name = name
  glowLine.BeginUpdate()
  glowLine.inter_value = opt.interValue || 20
  glowLine.line_width = opt.lineWidth || 10
  glowLine.ratio = opt.ratio || 0.1
  glowLine.line_color = color
  glowLine.set_is_visible(!!opt.visibility)
  glowLine.EndUpdate()
  return glowLine
}

// //////////////////////////////////////////////////////////////////////////////////////////////
function _createFlowLiquid(earth, layer, opt) {
  // const getAngle = ({
  //   x: x1,
  //   y: y1
  // }, {
  //   x: x2,
  //   y: y2
  // }) => {
  //   const dot = x1 * x2 + y1 * y2;
  //   const det = x1 * y2 - y1 * x2;
  //   let angle = (Math.atan2(det, dot) / Math.PI) * 180;
  //   angle = (angle + 360) % 360;
  //   return angle > 180 ? 360 - 180 : angle;
  // };
  const points = opt.points
  const geoPoints = []

  let point
  for (let i = 0, len = points.length; i < len; i++) {
    const tempObj = {}
    point = StampGis.Cartographic.fromCartesian(points[i])
    tempObj.longitude = StampGis.StampMath.toDegrees(point.longitude)
    tempObj.latitude = StampGis.StampMath.toDegrees(point.latitude)

    geoPoints.push(tempObj)
  }
  var flowLiquid_ip = stamp_core_config.baseUrlString + 'Assets/Textures/JY.jpg'
  var objOpt = {
    guid: opt.guid,
    pipe_radius: +opt.radius,
    geo_point_array: geoPoints,
    altitude: point.height,
    speed: +opt.speed,
    url: flowLiquid_ip
  }
  const flowLiquidObj = earth.Factory.CreateFlowLiquid(objOpt)
  if (!flowLiquidObj) {
    return
  }
  layer.attach_object(flowLiquidObj)
  return flowLiquidObj
}

// ///////////////////////////////////////////////////////////////////////////////////////
// 河流
function _createEleRiver(earth, layer, opt) {
  const points = opt.points
  var posSet = []
  for (var i = 0; i < points.length; i++) {
    var pos = StampGis.Cartographic.fromCartesian(points[i])
    pos.longitude = StampGis.StampMath.toDegrees(pos.longitude)
    pos.latitude = StampGis.StampMath.toDegrees(pos.latitude)
    posSet.push(pos)
  }

  var riverPng_ip = stamp_core_config.baseUrlString + 'Assets/Textures/river.png'
  var objOpt = {
    guid: opt.guid,
    river_width: +opt.width,
    geo_point_array: posSet,
    altitude: +opt.height,
    speed: +opt.speed,
    url: riverPng_ip
  }

  const riverObj = earth.Factory.CreateRiver(objOpt)
  if (!riverObj) {
    return
  }
  layer.attach_object(riverObj)
  return riverObj
}

function _editEleRiver(river, opt) {
  var name = opt.name || ''
  river.name = name
  river.BeginUpdate()
  river.update_height(+opt.height || 50)
  river.update_with(+opt.width || 10)
  river.update_speed(+opt.speed || 10)
  river.set_is_visible(!!opt.visibility)
  river.EndUpdate()
  return river
}

/**
 * 绘制简单箭头
 * @param {*} circle
 * @param {*} options
 */
function _createSArrow(earth, callback) {
  earth.ShapeCreator.CreatePlotSArrow({
    custom_excute_finish: function (result) {
      if (typeof callback === 'function') {
        callback(result && result.data ? result.data : null)
      }
      earth.ShapeCreator.Clear()
    }
  })
}

function _createElementSArrow(earth, options) {
  var symbol = earth.Factory.CreateElementTextureSymbol({
    name: options.name || '',
    doc: earth.document,
    symbolRtti: options.rtti,
    guid: options.guid
  })
  if (!symbol) {
    return
  }
  symbol = _editTextureSymbol(symbol, options)
  earth.document.elementRoot.attach_object(symbol)
  earth.document.register_object(symbol)
  symbol.show_high_light()
  return symbol
}

// 直箭头
function _createequalSArrow(earth, callback) {
  earth.ShapeCreator.CreatePlotEqualSArrow({
    custom_excute_finish: function (result) {
      if (typeof callback === 'function') {
        callback(result && result.data ? result.data : null)
      }
      earth.ShapeCreator.Clear()
    }
  })
}

function _createElementequalSArrow(earth, options) {
  return _createElementSArrow(earth, options)
}

// 燕尾箭头
function _createtailSarrow(earth, callback) {
  earth.ShapeCreator.CreatePlotTailSArrow({
    custom_excute_finish: function (result) {
      if (typeof callback === 'function') {
        callback(result && result.data ? result.data : null)
      }
      earth.ShapeCreator.Clear()
    }
  })
}

function _createElementtailSArrow(earth, options) {
  return _createElementSArrow(earth, options)
}

// 自定义燕尾箭头
function _createCustomTailSArrow(earth, callback) {
  earth.ShapeCreator.CreatePlotCustomTailArrow({
    custom_excute_finish: function (result) {
      if (typeof callback === 'function') {
        callback(result && result.data ? result.data : null)
      }
      earth.ShapeCreator.Clear()
    }
  })
}

function _createEleCustomTailSArrow(earth, options) {
  return _createElementSArrow(earth, options)
}

// 双箭头
function _createdoubleSArrow(earth, callback) {
  earth.ShapeCreator.CreatePlotDoubleArrow({
    custom_excute_finish: function (result) {
      if (typeof callback === 'function') {
        callback(result && result.data ? result.data : null)
      }
      earth.ShapeCreator.Clear()
    }
  })
}

function _createElementdoubleSArrow(earth, options) {
  return _createElementSArrow(earth, options)
}

// 多箭头
function _createxSArrow(earth, callback) {
  earth.ShapeCreator.CreatePlotXArrow({
    custom_excute_finish: function (result) {
      if (typeof callback === 'function') {
        callback(result && result.data ? result.data : null)
      }
      earth.ShapeCreator.Clear()
    }
  })
}

function _createElementxSArrow(earth, options) {
  return _createElementSArrow(earth, options)
}

// 自定义箭头
function _createcustomArrow(earth, callback) {
  earth.ShapeCreator.CreatePlotCustomArrow({
    custom_excute_finish: function (result) {
      if (typeof callback === 'function') {
        callback(result && result.data ? result.data : null)
      }
      earth.ShapeCreator.Clear()
    }
  })
}

function _createElementcustomArrow(earth, options) {
  return _createElementSArrow(earth, options)
}

// 曲面旗
function _createcurveflag(earth, callback) {
  earth.ShapeCreator.CreatePlotCurveFlag({
    custom_excute_finish: function (result) {
      if (typeof callback === 'function') {
        callback(result && result.data ? result.data : null)
      }
      earth.ShapeCreator.Clear()
    }
  })
}

function _createElementcurveflag(earth, options) {
  let symbol = earth.Factory.CreateElementPlotCurveFlag({
    name: options.name || '',
    doc: earth.document,
    guid: options.guid
  })

  if (!symbol) {
    return
  }
  symbol = _editcurveflag(symbol, options)
  earth.document.elementRoot.attach_object(symbol)
  earth.document.register_object(symbol)
  symbol.show_high_light()
  return symbol
}

function _editcurveflag(symbol, options) {
  const name = options.name || ''
  const lineColor = _colorToHex(options.lineColor, options.lineColorTransparent)
  const fillColor = _colorToHex(options.fillColor, options.fillColorTransparent)
  const lineWidth = parseInt(options.lineWidth) || 1.0
  const drawOrder = parseInt(options.drawOrder) || 0
  symbol.BeginUpdate()
  symbol.SetControlPointsArrayGeo(options.points)
  symbol.guid = options.guid
  symbol.name = name
  symbol.lineColor = lineColor
  symbol.lineWidth = lineWidth
  symbol.fillColor = fillColor
  symbol.drawOrder = drawOrder
  symbol.set_is_visible(!!options.visibility)
  symbol.EndUpdate()
  return symbol
}

// 直角旗标
function _createrightAngleflag(earth, callback) {
  earth.ShapeCreator.CreatePlotRectFlag({
    custom_excute_finish: function (result) {
      if (typeof callback === 'function') {
        callback(result && result.data ? result.data : null)
      }
      earth.ShapeCreator.Clear()
    }
  })
}

function _createElementrightAngleflag(earth, options) {
  const symbol = earth.Factory.CreateElementPlotRectFlag({
    name: options.name || '',
    doc: earth.document,
    guid: options.guid
  })

  if (!symbol) {
    return
  }
  _editrightAngleflag(symbol, options)
  earth.document.elementRoot.attach_object(symbol)
  earth.document.register_object(symbol)
  symbol.show_high_light()
  return symbol
}

function _editrightAngleflag(symbol, options) {
  const name = options.name || ''
  const lineColor = _colorToHex(options.lineColor, options.lineColorTransparent)
  const fillColor = _colorToHex(options.fillColor, options.fillColorTransparent)
  const lineWidth = parseInt(options.lineWidth) || 1
  const drawOrder = parseInt(options.drawOrder) || 0
  symbol.BeginUpdate()
  symbol.SetControlPointsArrayGeo(options.points)
  symbol.name = name
  symbol.guid = options.guid
  symbol.drawOrder = drawOrder
  symbol.lineColor = lineColor
  symbol.lineWidth = lineWidth
  symbol.fillColor = fillColor
  symbol.EndUpdate()
  return symbol
}

// 三角旗
function _createtriangleFlag(earth, callback) {
  earth.ShapeCreator.CreatePlotTriangleFlag({
    custom_excute_finish: function (result) {
      if (typeof callback === 'function') {
        callback(result && result.data ? result.data : null)
      }
      earth.ShapeCreator.Clear()
    }
  })
}

function _createElementTriangleFlag(earth, options) {
  const symbol = earth.Factory.CreateElementPlotTriangleFlag({
    name: options.name || '',
    doc: earth.document,
    guid: options.guid
  })

  if (!symbol) {
    return
  }
  _editTriangleFlag(symbol, options)
  earth.document.elementRoot.attach_object(symbol)
  earth.document.register_object(symbol)
  symbol.show_high_light()
  return symbol
}

function _editTriangleFlag(symbol, options) {
  _editrightAngleflag(symbol, options)
}

// 集结地
function _createAssemblyArea(earth, callback) {
  earth.ShapeCreator.CreatePlotAssemblyArea({
    custom_excute_finish: function (result) {
      if (typeof callback === 'function') {
        callback(result && result.data ? result.data : null)
      }
      earth.ShapeCreator.Clear()
    }
  })
}

function _createElementAssemblyArea(earth, options) {
  return _createElementSArrow(earth, options)
}

function _editTextureSymbol(symbol, options) {
  var name = options.name || ''
  var lineColor = _colorToHex(options.lineColor, options.lineColorTransparent)
  var fillColor = _colorToHex(options.fillColor, options.fillColorTransparent)
  var altitudeType = parseInt(options.altitudeType) || 1
  var lineWidth = parseInt(options.lineWidth) || 1
  var drawOrder = parseInt(options.drawOrder) || 0
  var symbolStyle = symbol.symbolStyle
  symbolStyle.libraryName = stamp_core_config.baseUrlString + 'Assets/MilitaryPlotting.symlib'// STAMP_config.filePath.symbolStyle_ip;
  symbolStyle.symbolId = '001'
  symbolStyle.colorArgb = fillColor
  symbolStyle.outlineColorArgb = lineColor
  symbolStyle.outlineWidth = lineWidth
  symbol.guid = options.guid
  symbol.name = name
  symbol.BeginUpdate()
  symbol.SetControlPoints(options.points, false)
  symbol.set_altitude_type(altitudeType)
  symbol.drawOrder = drawOrder
  symbol.set_is_visible(!!options.visibility)
  symbol.EndUpdate()
  return symbol
}

function _createSphere(earth, callback) {
  earth.ShapeCreator.CreateSphere({
    custom_excute_finish: function (result) {
      if (typeof callback === 'function') {
        callback(result || null)
      }
      earth.ShapeCreator.Clear()
    }
  })
}

/**
 * 创建球体
 * @param {*} earth
 * @param {*} options
 */
function _createElementSphere(earth, options, sphere) {
  if (!sphere) {
    var name = options.name || ''
    sphere = earth.Factory.CreateElementSphere({
      guid: options.guid,
      name: name,
      doc: earth.document
    })
  }

  if (!sphere) {
    return
  }
  sphere = _editElementSphere(sphere, options)
  earth.document.elementRoot3D.attach_object(sphere)
  earth.document.register_object(sphere)
  return sphere
}

/**
 * 编辑球体
 * @param {*} polygon
 * @param {*} options
 */
function _editElementSphere(sphere, options) {
  var name = options.name || ''
  var color = _colorToHex(options.color, options.transparent)
  sphere.name = name
  sphere.BeginUpdate()
  sphere.transform.set_position_sphr_degree(options.locationDegree)
  sphere.radius = options.radius
  sphere.set_fill_color(color)
  sphere.set_is_visible(!!options.visibility)
  sphere.EndUpdate()

  updateTransform(sphere, options)
  return sphere
}

function _createBox(earth, callback) {
  earth.ShapeCreator.CreateBox({
    custom_excute_finish: function (result) {
      if (typeof callback === 'function') {
        callback(result || null)
      }
      earth.ShapeCreator.Clear()
    }
  })
}

/**
 * 创建立方体
 * @param {*} earth
 * @param {*} options
 */
function _createElementBox(earth, options, box) {
  if (!box) {
    var name = options.name || ''
    box = earth.Factory.CreateElementBox({
      guid: options.guid,
      name: name,
      doc: earth.document
    })
  }

  if (!box) {
    return
  }
  box = _editElementBox(box, options)
  earth.document.elementRoot3D.attach_object(box)
  earth.document.register_object(box)
  return box
}

/**
 * 编辑立方体
 * @param {*} polygon
 * @param {*} options
 */
function _editElementBox(box, options) {
  var name = options.name || ''
  var color = _colorToHex(options.color, options.transparent)

  box.name = name
  box.BeginUpdate()
  box.transform.set_position_sphr_degree(options.locationDegree)
  box.width = options.width
  box.length = options.length
  box.height = options.height
  box.set_fill_color(color)
  box.set_is_visible(!!options.visibility)
  box.EndUpdate()

  updateTransform(box, options)
  return box
}

function _createCylinder(earth, callback) {
  earth.ShapeCreator.CreateCylinder({
    custom_excute_finish: function (result) {
      if (typeof callback === 'function') {
        callback(result || null)
      }
      earth.ShapeCreator.Clear()
    }
  })
}

/**
 * 创建圆柱
 * @param {*} earth
 * @param {*} options
 */
function _createElementCylinder(earth, options, cylinder) {
  if (!cylinder) {
    var name = options.name || ''
    cylinder = earth.Factory.CreateElementCylinder({
      guid: options.guid,
      name: name,
      doc: earth.document
    })
  }

  if (!cylinder) {
    return
  }
  cylinder = _editElementCylinder(cylinder, options)
  earth.document.elementRoot3D.attach_object(cylinder)
  earth.document.register_object(cylinder)
  return cylinder
}

/**
 * 编辑圆柱
 * @param {*} polygon
 * @param {*} options
 */
function _editElementCylinder(cylinder, options) {

  var name = options.name || ''
  var color = _colorToHex(options.color, options.transparent)
  cylinder.name = name
  cylinder.BeginUpdate()
  cylinder.transform.set_position_sphr_degree(options.locationDegree)
  cylinder.radius = Number(options.radius)
  cylinder.height = Number(options.height)
  cylinder.set_fill_color(color)
  cylinder.set_is_visible(!!options.visibility)
  cylinder.EndUpdate()

  updateTransform(cylinder, options)
  return cylinder
}

function _createVolume(earth, callback) {
  earth.ShapeCreator.CreateVolume({
    custom_excute_finish: function (result) {
      if (typeof callback === 'function') {
        callback(result || null)
      }
      earth.ShapeCreator.Clear()
    }
  })
}

/**
 * 创建立体多边形
 * @param {*} earth
 * @param {*} options
 */
function _createElementVolume(earth, options, volume) {
  if (!volume) {
    var name = options.name || ''
    volume = earth.Factory.CreateElementVolume({
      guid: options.guid,
      name: name,
      doc: earth.document
    })
  }

  if (!volume) {
    return
  }
  volume = _editElementVolume(volume, options)
  earth.document.elementRoot3D.attach_object(volume)
  earth.document.register_object(volume)
  return volume
}

/**
 * 编辑圆柱
 * @param {*} polygon
 * @param {*} options
 */
function _editElementVolume(volume, options) {
  var name = options.name || ''
  var color = _colorToHex(options.color, options.transparent)

  volume.name = name
  volume.BeginUpdate()
  volume.transform.set_position_sphr_degree(options.locationDegree)
  volume.SetVectors(options.data)
  volume.height = options.height
  volume.set_fill_color(color)
  volume.set_is_visible(!!options.visibility)
  volume.EndUpdate()

  updateTransform(volume, options)
  return volume
}

function _createCone(earth, callback) {
  earth.ShapeCreator.CreateCone({
    custom_excute_finish: function (result) {
      if (typeof callback === 'function') {
        callback(result || null)
      }
      earth.ShapeCreator.Clear()
    }
  })
}

/**
 * 创建圆锥
 * @param {*} earth
 * @param {*} options
 */
function _createElementCone(earth, options, cone) {
  if (!cone) {
    var name = options.name || ''
    cone = earth.Factory.CreateElementCone({
      guid: options.guid,
      name: name,
      doc: earth.document
    })
  }

  if (!cone) {
    return
  }
  cone = _editElementCone(cone, options)
  earth.document.elementRoot3D.attach_object(cone)
  earth.document.register_object(cone)
  return cone
}

/**
 * 编辑圆锥
 * @param {*} polygon
 * @param {*} options
 */
function _editElementCone(cone, options) {
  var name = options.name || ''
  var color = _colorToHex(options.color, options.transparent)

  cone.name = name
  cone.BeginUpdate()
  cone.transform.set_position_sphr_degree(options.locationDegree)
  cone.radiusBottom = options.radiusBottom
  cone.radiusTop = options.radiusTop
  cone.height = options.height
  cone.set_fill_color(color)
  cone.set_is_visible(!!options.visibility)
  cone.EndUpdate()

  updateTransform(cone, options)
  return cone
}

function _createPrism(earth, callback) {
  earth.ShapeCreator.CreatePrism({
    custom_excute_finish: function (result) {
      if (typeof callback === 'function') {
        callback(result || null)
      }
      earth.ShapeCreator.Clear()
    }
  })
}

/**
 * 创建棱柱
 * @param {*} earth
 * @param {*} options
 */
function _createElementPrism(earth, options, prism) {
  if (!prism) {
    var name = options.name || ''
    prism = earth.Factory.CreateElementPrism({
      guid: options.guid,
      name: name,
      doc: earth.document
    })
  }

  if (!prism) {
    return
  }
  prism = _editElementPrism(prism, options)
  earth.document.elementRoot3D.attach_object(prism)
  earth.document.register_object(prism)
  return prism
}

/**
 * 编辑棱柱
 * @param {*} polygon
 * @param {*} options
 */
function _editElementPrism(prism, options) {
  var name = options.name || ''
  var color = _colorToHex(options.color, options.transparent)

  prism.name = name
  prism.BeginUpdate()
  prism.transform.set_position_sphr_degree(options.locationDegree)
  prism.radius = options.radius
  prism.sides = parseInt(options.sides)
  prism.height = options.height
  prism.set_fill_color(color)
  prism.set_is_visible(!!options.visibility)
  prism.EndUpdate()

  updateTransform(prism, options)
  return prism
}

function _createPyramid(earth, callback) {
  earth.ShapeCreator.CreatePyramid({
    custom_excute_finish: function (result) {
      if (typeof callback === 'function') {
        callback(result || null)
      }
      earth.ShapeCreator.Clear()
    }
  })
}

/**
 * 创建棱锥
 * @param {*} earth
 * @param {*} options
 */
function _createElementPyramid(earth, options, pyramid) {
  if (!pyramid) {
    var name = options.name || ''
    pyramid = earth.Factory.CreateElementPyramid({
      guid: options.guid,
      name: name,
      doc: earth.document
    })
  }

  if (!pyramid) {
    return
  }
  pyramid = _editElementPyramid(pyramid, options)
  earth.document.elementRoot3D.attach_object(pyramid)
  earth.document.register_object(pyramid)
  return pyramid
}

/**
 * 编辑棱锥
 * @param {*} polygon
 * @param {*} options
 */
function _editElementPyramid(pyramid, options) {
  var name = options.name || ''
  var color = _colorToHex(options.color, options.transparent)

  pyramid.name = name
  pyramid.BeginUpdate()
  pyramid.transform.set_position_sphr_degree(options.locationDegree)
  pyramid.radiusBottom = options.radiusBottom
  pyramid.radiusTop = options.radiusTop
  pyramid.height = options.height
  pyramid.sides = parseInt(options.sides)
  pyramid.set_fill_color(color)
  pyramid.set_is_visible(!!options.visibility)
  pyramid.EndUpdate()

  updateTransform(pyramid, options)
  return pyramid
}



/**
 * 创建管线
 * @param {*} earth
 * @param {*} options
 */
function _createGenerateTunnel(earth, options, tunnel) {
  if (!tunnel) {
    var name = options.name || ''
    tunnel = earth.Factory.GenerateTunnel({
      // guid: options.guid,
      name: name,
      doc: earth.document
    })
  }

  if (!tunnel) {
    return
  }
  tunnel = _editGenerateTunnel(tunnel, options)

  earth.document.elementRoot.attach_object(tunnel);
  earth.document.register_object(tunnel);
  return tunnel
}

/**
 * 编辑管线
 * @param {*} polygon
 * @param {*} options
 */
function _editGenerateTunnel(tunnel, options) {
  tunnel.BeginUpdate();
  tunnel.set_altitude_type(0);
  tunnel.SetPointArray(options.data);
  tunnel.is_close_mesh = true;
  tunnel.set_is_underground(true);
  tunnel._texture_url = options.texture_url
  if (options.specification.indexOf("X") == -1) {
    tunnel.is_round = true
    let radius = 0.0005 * parseFloat(options.specification);
    tunnel.radius = radius;
    tunnel.seg_num = 16;
  } else {
    tunnel.is_round = false
    let w = options.specification.split("X")[0];
    w = 0.001 * parseFloat(w);
    let h = options.specification.split("X")[1];
    h = 0.001 * parseFloat(h);
    tunnel.height = h;
    tunnel.width = w;
  }
  tunnel.show_high_light();
  tunnel.EndUpdate();
  updateTransform(tunnel, options)
  return tunnel
}

_mark.editTextureSymbol = _editTextureSymbol // 绘制箭头

_mark.createSArrow = _createSArrow // 绘制简单箭头
_mark.createElementSArrow = _createElementSArrow // 创建箭头

_mark.createequalSArrow = _createequalSArrow // 绘制直箭头
_mark.createElementequalSArrow = _createElementequalSArrow // 创建直箭头

_mark.createtailSarrow = _createtailSarrow // 燕尾箭头
_mark.createElementtailSArrow = _createElementtailSArrow

_mark.createCustomTailSArrow = _createCustomTailSArrow // 自定义燕尾箭头
_mark.createEleCustomTailSArrow = _createEleCustomTailSArrow

_mark.createdoubleSArrow = _createdoubleSArrow // 双箭头
_mark.createElementdoubleSArrow = _createElementdoubleSArrow

_mark.createxSArrow = _createxSArrow // 多箭头
_mark.createElementxSArrow = _createElementxSArrow

_mark.createcustomArrow = _createcustomArrow // 自定义箭头
_mark.createElementcustomArrow = _createElementcustomArrow

_mark.createcurveflag = _createcurveflag // 创建曲面旗
_mark.createElementcurveflag = _createElementcurveflag
_mark.editcurveflag = _editcurveflag // 编辑曲面旗

_mark.createrightAngleflag = _createrightAngleflag // 直角旗
_mark.createElementrightAngleflag = _createElementrightAngleflag
_mark.editrightAngleflag = _editrightAngleflag

_mark.createtriangleFlag = _createtriangleFlag // 三角旗
_mark.createElementTriangleFlag = _createElementTriangleFlag
_mark.editTriangleFlag = _editTriangleFlag

_mark.createAssemblyArea = _createAssemblyArea // 集结地
_mark.createElementAssemblyArea = _createElementAssemblyArea

// /////////////////////////////////////////////////////////////////////////////////////////////
_mark.createPoint = _createPoint // 绘制
_mark.createElementPoint = _createElementPoint // 创建
_mark.createElementPoint1 = _createElementPoint1 // 创建
_mark.editElementPoint = _editElementPoint

_mark.createLine = _createLine // 绘制
_mark.createPolyline = _createPolyline // 绘制
_mark.createElementLine = _createElementLine // 创建
_mark.createElementLineByPoints = _createElementLineByPoints // 提前创建对象，用于获取长度
_mark.editElementLine = _editElementLine

_mark.createPolygon = _createPolygon // 绘制
_mark.createElementPolygon = _createElementPolygon // 创建
_mark.createElementPolygonByPoints = _createElementPolygonByPoints // 创建
_mark.editElementPolygon = _editElementPolygon

_mark.createCircle = _createCircle // 绘制
_mark.createElementCircle = _createElementCircle // 创建
_mark.createElementCircleByPoints = _createElementCircleByPoints // 创建
_mark.editElementCircle = _editElementCircle

_mark.CreateCurve = _createCurve // 绘制曲线
_mark.CreateElementCurve = _createElementCurve // 创建
_mark.editElementCurve = _editElementCurve

_mark.createElementFire = _createElementFire // 创建火
_mark.editElementFire = _editElementFire // 编辑火

_mark.createElementSmoke = _createElementSmoke // 创建烟
_mark.editElementSmoke = _editElementSmoke // 编辑烟

_mark.createElementNozzle = _createElementNozzle // 创建喷泉
_mark.editElementNozzle = _editElementNozzle // 编辑喷泉

_mark.createElementWarnRing = _createElementWarnRing // 创建警报环
_mark.editElementWarnRing = _editElementWarnRing // 编辑警报环

_mark.createElementODLine = _createElementODLine // 创建
_mark.editElementODLine = _editElementODLine

_mark.createElementHeatmap = _createElementHeatmap // 创建热力图
_mark.editElementHeatmap = _editElementHeatmap // 编辑热力图

_mark.createElementPointClouds = _createElementPointClouds // 创建点云
_mark.editElementPointClouds = _editElementPointClouds // 编辑点云

_mark.createElementFlowLine = _createElementFlowLine // 创建流动线
_mark.editElementFlowLine = _editElementFlowLine // 编辑流动线

_mark.createElementSixPolygon = _createElementSixPolygon // 创建火
_mark.editElementSixPolygon = _editElementSixPolygon // 编辑火

_mark.createElementWater = _createElementWater // 创建水面
_mark.editElementWater = _editElementWater // 编辑水面

_mark.createElementTexturePolygon = _createElementTexturePolygon // 创建
_mark.editElementTexturePolygon = _editElementTexturePolygon

_mark.createModel = _createModel // 创建模型
_mark.editModel = _editModel // 编辑模型-其实就是删除后再添加

_mark.createElementpolyhedron = _createElementpolyhedron
_mark.editElementpolyhedron = _editElementpolyhedron

_mark.createElementGuardline = _createElementGuardline
_mark.editElementGuardline = _editElementGuardline

_mark.createSmokeFire = _createSmokeFire // 粒子特效烟火

_mark.createElementDynamicScan = _createElementDynamicScan // 动态扫描
_mark.editElementDynamicScan = _editElementDynamicScan

_mark.createElementDynamicSpread = _createElementDynamicSpread // 动态扩散
_mark.editElementDynamicSpread = _editElementDynamicSpread

_mark.createEleSevenArcs = _createEleSevenArcs // 七色弧线
_mark.editEleProArc = _editEleProArc

_mark.createEleProArc = _createEleProArc // 渐进弧线
_mark.editEleProArc = _editEleProArc

_mark.createEleMoveSolLine = _createEleMoveSolLine // 运动弧线虚线
_mark.editEleMoveSolLine = _editEleMoveSolLine

_mark.createEleBrokenDot = _createEleBrokenDot // 运动折线
_mark.editEleBrokenDot = _editEleBrokenDot

_mark.createEleMoveArrow = _createEleMoveArrow // 运动箭头
_mark.editEleMoveArrow = _editEleMoveArrow

_mark.createEleGlowLine = _createEleGlowLine // 光晕线
_mark.editEleGlowLine = _editEleGlowLine

_mark.createFlowLiquid = _createFlowLiquid // 流动液体

_mark.createElementDynamicWall = _createElementDynamicWall
_mark.editElementDynamicWall = _editElementDynamicWall

_mark.createElementWarnWall = _createElementWarnWall
_mark.editElementWarnWall = _editElementWarnWall

_mark.createEleRiver = _createEleRiver // 河流
_mark.editEleRiver = _editEleRiver

_mark.createElementBallonIcon = _createElementBallonIcon
_mark.editElementBallonIcon = _editElementBallonIcon

_mark.createElementPanelIcon = _createElementPanelIcon
_mark.editElementPanelIcon = _editElementPanelIcon

_mark.createElementPyramidIcon = _createElementPyramidIcon
_mark.editElementPyramidIcon = _editElementPyramidIcon

_mark.createCylinderElement = _createCylinderElement
_mark.editCylinderElement = _editCylinderElement

_mark.createElementDome = _createElementDome
_mark.editElementDome = _editElementDome

_mark.createVerticalLine = _createVerticalLine
_mark.editVerticalLine = _editVerticalLine

_mark.createElementMoveIcon = _createElementMoveIcon
_mark.editElementMoveIcon = _editElementMoveIcon

_mark.createElementCircularFountain = _createElementCircularFountain
_mark.editElementCircularFountain = _editElementCircularFountain

_mark.createElementdynamicLine = _createElementdynamicLine
_mark.editElementdynamicLine = _editElementdynamicLine

_mark.createElementLinebuffer = _createElementLinebuffer // 创建
_mark.editElementLinebuffer = _editElementLinebuffer

_mark.createElementPolygonbuffer = _createElementPolygonbuffer // 创建
_mark.editElementPolygonbuffer = _editElementPolygonbuffer

_mark.createSphere = _createSphere
_mark.createElementSphere = _createElementSphere
_mark.editElementSphere = _editElementSphere

_mark.createBox = _createBox
_mark.createElementBox = _createElementBox
_mark.editElementBox = _editElementBox

_mark.createVolume = _createVolume
_mark.createElementVolume = _createElementVolume
_mark.editElementVolume = _editElementVolume

_mark.createCylinder = _createCylinder
_mark.createElementCylinder = _createElementCylinder
_mark.editElementCylinder = _editElementCylinder

_mark.createCone = _createCone
_mark.createElementCone = _createElementCone
_mark.editElementCone = _editElementCone

_mark.createPrism = _createPrism
_mark.createElementPrism = _createElementPrism
_mark.editElementPrism = _editElementPrism

_mark.createPyramid = _createPyramid
_mark.createElementPyramid = _createElementPyramid
_mark.editElementPyramid = _editElementPyramid

_mark.createGenerateTunnel = _createGenerateTunnel
_mark.editGenerateTunnel = _editGenerateTunnel
export default _mark
