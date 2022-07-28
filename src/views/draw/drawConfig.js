/**
 * 标绘配置
 * type:    1.普通输入框
 *          2.普通下拉框
 *          3.多行文本框
 *          4.颜色选择框
 *          5.文件选择输入框
 *          6.双输入框：_ 到 _ 
 *          7.文件选择输入框（选择服务器）
 *          8.文件夹目录选择
 */
const transparentValidator = {
  validator: (rule, val, callback) => {
    (val > 255 || val < 0) ? callback(new Error('值需介于0-255')) : callback()
  },
  trigger: 'blur'
}
const lineValidator = {
  validator: (rule, val, callback) => {
    (val > 20 || val < 0) ? callback(new Error('值需介于0-20')) : callback()
  },
  trigger: 'blur'
}
const descriptPattern = {
  pattern: /.\S{0,100}$/,
  trigger: "blur",
  message: '100个字符以内'
}
//名称
const namePattern = {
  pattern: /^\S{1,50}$/,
  trigger: 'blur',
  message: '1到50个字符'
}
//颜色
const colorPattern = {
  pattern: /^#[0-9A-Fa-f]{6}$/,
  trigger: 'blur',
  message: "颜色值为16进制,如#FFFF00"
}
//渲染顺序
const drawOrderValidator = {
  validator: (rule, val, callback) => {
    (val > 100 || val < 0) ? callback(new Error('值需介于0-100')) : callback()
  },
  trigger: 'blur'
}
//墙体高度
const wallHeightValidator = {
  validator: (rule, val, callback) => {
    (val > 500 || val < 0) ? callback(new Error('值需介于0-500')) : callback()
  },
  trigger: 'blur'
}
//流动速度
const speedValidator = {
  validator: (rule, val, callback) => {
    (val > 500 || val < 0) ? callback(new Error('值需介于0-500')) : callback()
  },
  trigger: 'blur'
}
//中心高度
const curveHeightValidator = {
  validator: (rule, val, callback) => {
    (val > 500 || val < 0) ? callback(new Error('值需介于0-500')) : callback()
  },
  trigger: 'blur'
}
//高亮长度正则表达式
const hightLigLenValidator = {
  validator: (rule, val, callback) => {
    (val < 0) ? callback(new Error('值需大于0')) : callback()
  },
  trigger: 'blur'
}
//必选字段
const required = {
  required: true,
  message: '必填字段'
}
//高度
const heightValidator = {
  validator: (rule, val, callback) => {
    (val > 500 || val < 0) ? callback(new Error('值需介于0-500')) : callback()
  },
  trigger: 'blur'
}
//箭头长度
const arrowLenValidator = {
  validator: (rule, val, callback) => {
    (val > 20 || val < 0) ? callback(new Error('值需介于0-20')) : callback()
  },
  trigger: 'blur'
}
//半径
const radiusValidator = {
  validator: (rule, val, callback) => {
    (val < 0) ? callback(new Error('值需大于0')) : callback()
  },
  trigger: 'blur'
}
export default {
  emergencyPlot: {
    name: {
      label: "名称",
      field: "name",
      value: "emergencyPlot",
      type: "1", //代表普通输入框
      afterText: "",
      validator: namePattern
    },
    altitudeType: {
      label: "绘制方式",
      field: "altitudeType",
      value: "5",
      content: [{
        label: "贴模型",
        value: "5"
      }, {
        label: "贴地",
        value: "1"
      }, {
        label: "正常",
        value: "0"
      }],
      type: "2",
      afterText: ""
    }
  },
  circularFountain: {
    name: {
      label: "名称",
      field: "name",
      value: "circularFountain",
      type: "1", //代表普通输入框
      afterText: "",
      validator: namePattern
    },
    color: {
      label: "颜色",
      field: "color",
      value: "#CCCC00",
      type: "4", //代表普通输入框
      afterText: "",
      validator: colorPattern
    },
    curveHeight: {
      label: "相对高度",
      field: "curveHeight",
      value: "100",
      type: "1", //代表普通输入框
      afterText: "米",
      validator: heightValidator
    },
    highlightLength: {
      label: "高亮长度",
      field: "highlightLength",
      value: "10",
      type: "1", //代表普通输入框
      afterText: "",
      validator: hightLigLenValidator
    },
    stepSpeed: {
      label: "速度",
      field: "stepSpeed",
      value: "50",
      type: "1", //代表普通输入框
      afterText: "",
      validator: speedValidator
    },
    lineWidth: {
      label: "线宽",
      field: "lineWidth",
      value: "1",
      type: "1", //代表普通输入框
      afterText: "",
      validator: arrowLenValidator
    }
  },
  cylinderElement: {
    name: {
      label: "名称",
      field: "name",
      value: "cylinderElement",
      type: "1", //代表普通输入框
      afterText: "",
      validator: namePattern
    },
    radius: {
      label: "半径",
      field: "radius",
      value: "50",
      type: "1", //代表普通输入框
      afterText: "米",
      validator: radiusValidator
    },
    color: {
      label: "颜色",
      field: "color",
      value: "#CCCC00",
      type: "4", //代表普通输入框
      afterText: "",
      validator: colorPattern
    }
  },
  panelIcon: {
    name: {
      label: "名称",
      field: "name",
      value: "panelIcon",
      type: "1", //代表普通输入框
      afterText: "",
      validator: namePattern
    },
    color: {
      label: "面板颜色",
      field: "color",
      value: "#CCCC00",
      type: "4", //代表普通输入框
      afterText: "",
      validator: colorPattern
    },
    height: {
      label: "高度",
      field: "height",
      value: "30",
      type: "1", //代表普通输入框
      afterText: "米",
      validator: heightValidator
    },
    fontSize: {
      label: "字体大小",
      field: "width",
      value: "20",
      type: "1", //代表普通输入框
      afterText: "像素",
      validator: hightLigLenValidator
    },
    desc: {
      label: "内容",
      field: "desc",
      value: "This is a Panel!",
      type: "3", //代表多行输入框
      afterText: "",
      validator: descriptPattern
    },
  },
  ballonIcon: {
    name: {
      label: "名称",
      field: "name",
      value: "ballonIcon",
      type: "1", //代表普通输入框
      afterText: "",
      validator: namePattern
    },
    radius: {
      label: "半径",
      field: "radius",
      value: "2",
      type: "1", //代表普通输入框
      afterText: "米",
      validator: radiusValidator
    },
    color: {
      label: "颜色",
      field: "color",
      value: "#CCCC00",
      type: "4", //代表普通输入框
      afterText: "",
      validator: colorPattern
    },
  },
  pyramidIcon: {
    name: {
      label: "名称",
      field: "name",
      value: "pyramidIcon",
      type: "1", //代表普通输入框
      afterText: "",
      validator: namePattern
    },
    radius: {
      label: "边长",
      field: "radius",
      value: "10",
      type: "1", //代表普通输入框
      afterText: "米",
      validator: radiusValidator
    },
    height: {
      label: "高度",
      field: "height",
      value: "30",
      type: "1", //代表普通输入框
      afterText: "米",
      validator: heightValidator
    },
    color: {
      label: "颜色",
      field: "color",
      value: "#CC0000",
      type: "4", //代表普通输入框
      afterText: "",
      validator: colorPattern
    }
  },
  verticalLine: {
    name: {
      label: "名称",
      field: "name",
      value: "verticalLine",
      type: "1", //代表普通输入框
      afterText: "",
      validator: namePattern
    },
    width: {
      label: "线宽",
      field: "width",
      value: "2",
      type: "1", //代表普通输入框
      afterText: "",
      validator: hightLigLenValidator
    },
    highlightLength: {
      label: "高亮长度",
      field: "highlightLength",
      value: "100",
      type: "1", //代表普通输入框
      afterText: "米",
      validator: hightLigLenValidator
    },
    height: {
      label: "高度",
      field: "height",
      value: "500",
      type: "1", //代表普通输入框
      afterText: "米",
      validator: heightValidator
    },
    color: {
      label: "颜色",
      field: "color",
      value: "#CC0000",
      type: "4", //代表普通输入框
      afterText: "",
      validator: colorPattern
    },
    stepSpeed: {
      label: "运动速度",
      field: "stepSpeed",
      value: "15",
      type: "1", //代表普通输入框
      afterText: "米/秒",
      validator: speedValidator
    },
  },
  moveIcon: {
    name: {
      label: "名称",
      field: "name",
      value: "moveIcon",
      type: "1", //代表普通输入框
      afterText: "",
      validator: namePattern
    },
    // dynamicObj: {
    //   label: "运动物体",
    //   field: "dynamicObj",
    //   value: "",
    //   content: [],
    //   type: "2", //代表普通下拉框
    //   afterText: ""
    // },
    height: {
      label: "相对高度",
      field: "height",
      value: "2.5",
      type: "1",
      afterText: "米",
      validator: heightValidator
    },
    size: {
      label: "图标大小",
      field: "size",
      value: "1",
      type: "1",
      afterText: "",
      validator: heightValidator
    }
  },
  warnWall: {
    name: {
      label: "名称",
      field: "name",
      value: "warnWall",
      type: "1", //代表普通输入框
      afterText: "",
      validator: namePattern
    },
    wallHeight: {
      label: "墙体高度",
      field: "wallHeight",
      value: "100",
      type: "1", //代表普通输入框
      afterText: "米",
      validator: wallHeightValidator
    }
  },
  wall: {
    name: {
      label: "名称",
      field: "name",
      value: "dynamicWall",
      type: "1", //代表普通输入框
      afterText: "",
      validator: namePattern
    },
    wallType: {
      label: "墙体类型",
      field: "wallType",
      value: "1",
      content: [{
        label: "移动箭头1墙",
        value: "3"
      }, {
        label: "移动箭头2墙",
        value: "2"
      }, {
        label: "流动渐变墙",
        value: "1"
      }, {
        label: "上下渐变墙",
        value: "0"
      }],
      type: "2",
      afterText: ""
    },
    wallHeight: {
      label: "墙体高度",
      field: "wallHeight",
      value: "100",
      type: "1", //代表普通输入框
      afterText: "米",
      validator: wallHeightValidator
    },
    wallSpeed: {
      label: "流动速度",
      field: "wallSpeed",
      value: "1.0",
      type: "1", //代表普通输入框
      afterText: "米/秒",
      validator: speedValidator
    },
    wallColor: {
      label: "墙体颜色",
      field: "wallColor",
      value: "#00FF00",
      type: "4", //代表普通输入框
      afterText: "",
      validator: colorPattern
    }
  },
  scan: {
    name: {
      label: "名称",
      field: "name",
      value: "dynamicScan",
      type: "1", //代表普通输入框
      afterText: "",
      validator: namePattern
    },
    color: {
      label: "颜色",
      field: "color",
      value: "#FFFFFF",
      type: "4",
      afterText: ""
    },
    boundary: {
      label: "边缘",
      field: "boundary",
      value: false,
      content: [{
        label: "否",
        value: false
      }, {
        label: "是",
        value: true
      }],
      type: "2", //代表普通下拉框
      afterText: ""
    }
  },
  spread: {
    name: {
      label: "名称",
      field: "name",
      value: "dynamicSpread",
      type: "1", //代表普通输入框
      afterText: "",
      validator: namePattern
    }
  },
  dome: {
    name: {
      label: "名称",
      field: "name",
      value: "smoke",
      type: "1", //代表普通输入框
      afterText: "",
      validator: namePattern
    },
    radius: {
      label: "半径",
      field: "radius",
      value: "20",
      type: "1", //代表普通输入框
      afterText: "米",
      validator: radiusValidator
    },
    color: {
      label: "颜色",
      field: "color",
      value: "#6666CC",
      type: "4",
      afterText: ""
    }
  },
  fire: {
    name: {
      label: "名称",
      field: "name",
      value: "fire",
      type: "1", //代表普通输入框
      afterText: "",
      validator: namePattern
    }
  },
  label:  {
    name: {
      label: "名称",
      field: "name",
      value: "lable",
      type: "1", //代表普通输入框
      afterText: "",
      validator: namePattern,

      // type: "createpoint",
      // guid: createGuid(),// 重新创建id
      // visibility: true,
      // points: lastPoint,
      // name: height2,
      // description: '',
      // handleHeight: 2,
      // handleLineColor: "#FFFFFF",
      // highlightIconPath: "",
      // iconPath: "",
      // showHandle: true,
      // textColor: "#FFFFFF",
      // textScale: "1",
      // visibleRange: "0,100",
    }
  },
  smoke: {
    name: {
      label: "名称",
      field: "name",
      value: "smoke",
      type: "1", //代表普通输入框
      afterText: "",
      validator: namePattern
    }
  },
  water: {
    name: {
      label: "名称",
      field: "name",
      value: "water",
      type: "1", //代表普通输入框
      afterText: "",
      validator: namePattern
    },
    transparent: {
      label: "透明度",
      field: "transparent",
      value: "229",
      type: "1", //代表普通输入框
      afterText: "(0~255)",
      validator: transparentValidator
    },
    color: {
      label: "颜色",
      field: "color",
      value: "#19331F",
      type: "4",
      afterText: ""
    }
  },
  nozzle: {
    name: {
      label: "名称",
      field: "name",
      value: "nozzle",
      type: "1", //代表普通输入框
      afterText: "",
      validator: namePattern
    }
  },
  warnRing: {
    name: {
      label: "名称",
      field: "name",
      value: "warnRing",
      type: "1", //代表普通输入框
      afterText: "",
      validator: namePattern
    }
  },
  odLine: {
    name: {
      label: "名称",
      field: "name",
      value: "odLine",
      type: "1", //代表普通输入框
      afterText: "",
      validator: namePattern
    },
    curveHeight: {
      label: "中心高度",
      field: "curveHeight",
      value: "100",
      type: "1", //代表普通输入框
      afterText: "米",
      validator: curveHeightValidator
    },
    highlightLength: {
      label: "高亮长度",
      field: "highlightLength",
      value: "100",
      type: "1", //代表普通输入框
      afterText: "米",
      validator: hightLigLenValidator
    },
    stepSpeed: {
      label: "运动速度",
      field: "stepSpeed",
      value: "5",
      type: "1", //代表普通输入框
      afterText: "米/秒",
      validator: speedValidator
    },
    highlightTransparent: {
      label: "高亮透明度",
      field: "highlightTransparent",
      value: "255",
      type: "1", //代表普通输入框
      afterText: "(0~255)",
      validator: transparentValidator
    },
    highlightColor: {
      label: "高亮颜色",
      field: "highlightColor",
      value: "#9B9BCC",
      type: "4", //代表普通输入框
      afterText: "",
      validator: colorPattern
    },
    backgroundTransparent: {
      label: "背景透明度",
      field: "highlightTransparent",
      value: "51",
      type: "1", //代表普通输入框
      afterText: "(0~255)",
      validator: transparentValidator
    },
    backgroundColor: {
      label: "背景颜色",
      field: "backgroundColor",
      value: "#333399",
      type: "4", //代表普通输入框
      afterText: "",
      validator: colorPattern
    },
    lineWidth: {
      label: "线宽",
      field: "lineWidth",
      value: "1",
      type: "1", //代表普通输入框
      afterText: "像素",
      validator: lineValidator
    }
  },
  flowline: {
    name: {
      label: "名称",
      field: "name",
      value: "flowLine",
      type: "1", //代表普通输入框
      afterText: "",
      validator: namePattern
    },
    highlightLength: {
      label: "高亮长度",
      field: "highlightLength",
      value: "20",
      type: "1", //代表普通输入框
      afterText: "米",
      validator: hightLigLenValidator
    },
    stepSpeed: {
      label: "运动速度",
      field: "stepSpeed",
      value: "5",
      type: "1", //代表普通输入框
      afterText: "米/秒",
      validator: speedValidator
    },
    // highlightTransparent: {
    //     label: "高亮透明度",
    //     field: "highlightTransparent",
    //     value: "255",
    //     type: "1",//代表普通输入框
    //     afterText: "(0~255)"
    // },
    // highlightColor: {
    //     label: "高亮颜色",
    //     field: "highlightColor",
    //     value: "#9B9BCC",
    //     type: "4",//代表普通输入框
    //     afterText: ""
    // },
    // backgroundTransparent: {
    //     label: "背景透明度",
    //     field: "highlightTransparent",
    //     value: "51",
    //     type: "1",//代表普通输入框
    //     afterText: "(0~255)"
    // },
    // backgroundColor: {
    //     label: "背景颜色",
    //     field: "backgroundColor",
    //     value: "#333399",
    //     type: "4",//代表普通输入框
    //     afterText: ""
    // },
    // lineWidth: {
    //     label: "线宽",
    //     field: "lineWidth",
    //     value: "1",
    //     type: "1",//代表普通输入框
    //     afterText: "像素"
    // }
  },
  heatmap: {
    name: {
      label: "名称",
      field: "name",
      value: "heatmap",
      type: "1", //代表普通输入框
      afterText: "",
      validator: namePattern
    },
    vectorFile: {
      label: "矢量点文件",
      field: "vectorFile",
      value: "",
      type: "5", //代表文件选择
      fileExt: ".shp,.dbf",
      isMultiSel: true,
      afterText: "",
      validator: required
    },
    spatialFile: {
      label: "空间参考",
      field: "spatialFile",
      value: "",
      type: "5", //代表文件选择
      fileExt: ".spatial",
      isMultiSel: false,
      afterText: "",
      validator: required
    },
    weightField: {
      label: "权重字段",
      field: "weightField",
      value: "",
      content: [],
      type: "2", //代表下拉框
      afterText: ""
    }
  },
  dynamicLine: {
    name: {
      label: "名称",
      field: "name",
      value: "dynamicLine",
      type: "1", //代表普通输入框
      afterText: "",
      validator: namePattern
    },
    altitudeType: {
      label: "绘制方式",
      field: "altitudeType",
      value: "0",
      content: [{
        label: "正常",
        value: "0"
      }, {
        label: "贴地",
        value: "1"
      }, {
        label: "贴模型",
        value: "5"
      }],
      type: "2",
      afterText: ""
    },
    lineWidth: {
      label: "线宽",
      field: "lineWidth",
      value: "0.05",
      type: "1",
      afterText: "米",
      validator: lineValidator
    },
    height: {
      label: "据地高度",
      field: "height",
      value: "0.5",
      type: "1",
      afterText: "米",
      validator: heightValidator
    },
    space: {
      label: "采样间距",
      field: "space",
      value: "5",
      type: "1",
      afterText: "米",
      disabled: true,
      validator: required
    },
    texture: {
      label: "箭头纹理",
      field: "texture",
      value: "",
      type: "5", //代表文件选择
      fileExt: ".jpg,.png",
      isMultiSel: true,
      afterText: "",
      validator: required,
      b2NSize: true,
      toolTip: "选择图片长宽必须是2的N次方像素大小"
    },
    length: {
      label: "箭头长度",
      field: "length",
      value: "0.5",
      type: "1",
      afterText: "米",
      disabled: false,
      validator: arrowLenValidator
    },
    speed: {
      label: "流动速度",
      field: "speed",
      value: "1.5",
      type: "1",
      afterText: "米/秒",
      validator: speedValidator
    },
  },
  pointClouds: {
    name: {
      label: "名称",
      field: "name",
      value: "pointClouds",
      type: "1", //代表普通输入框
      afterText: "",
      validator: namePattern
    },
    vectorFile: {
      label: "矢量点SHP",
      field: "vectorFile",
      value: "",
      type: "5", //代表文件选择
      fileExt: ".shp",
      isMultiSel: false,
      afterText: "",
      validator: required
    },
    spatialFile: {
      label: "空间参考",
      field: "spatialFile",
      value: "",
      type: "5", //代表文件选择
      fileExt: ".spatial",
      isMultiSel: false,
      afterText: "",
      validator: required
    }
  },
  flowline1: {
    name: {
      label: "名称",
      field: "name",
      value: "flowline",
      type: "1", //代表普通输入框
      afterText: "",
      validator: namePattern
    },
    vectorFile: {
      label: "矢量点SHP",
      field: "vectorFile",
      value: "",
      type: "5", //代表文件选择
      fileExt: ".shp",
      isMultiSel: false,
      afterText: "",
      validator: required
    },
    spatialFile: {
      label: "空间参考",
      field: "spatialFile",
      value: "",
      type: "5", //代表文件选择
      fileExt: ".spatial",
      isMultiSel: false,
      afterText: "",
      validator: required
    },
    highlightLength: {
      label: "高亮长度",
      field: "highlightLength",
      value: "20",
      type: "1", //代表普通输入框
      afterText: "米",
      validator: hightLigLenValidator
    },
    stepSpeed: {
      label: "运动速度",
      field: "stepSpeed",
      value: "1",
      type: "1", //代表普通输入框
      afterText: "米/秒",
      validator: speedValidator
    },
  },
  sixPolygon: {
    name: {
      label: "名称",
      field: "name",
      value: "sixPolygon",
      type: "1", //代表普通输入框
      afterText: "",
      validator: namePattern
    },
    radius: {
      label: "半径",
      field: "radius",
      value: "10",
      type: "1", //代表普通输入框
      afterText: "米",
      validator: radiusValidator
    },
    height: {
      label: "高度",
      field: "height",
      value: "50",
      type: "1", //代表普通输入框
      afterText: "米",
      validator: heightValidator
    },
    fillTransparent: {
      label: "透明度",
      field: "fillTransparent",
      value: "255",
      type: "1", //代表普通输入框
      afterText: "(0~255)",
      validator: transparentValidator
    },
    fillColor: {
      label: "颜色",
      field: "fillColor",
      value: "#00CCCC",
      type: "4", //代表普通输入框
      afterText: "",
      validator: colorPattern
    }
  },
  polyhedron: {
    name: {
      label: "名称",
      field: "name",
      value: "polyhedron",
      type: "1", //代表普通输入框
      afterText: "",
      validator: namePattern
    },
    height: {
      label: "高度",
      field: "height",
      value: "20",
      type: "1", //代表普通输入框
      afterText: "米",
      validator: heightValidator
    },
    fillTransparent: {
      label: "透明度",
      field: "fillTransparent",
      value: "255",
      type: "1", //代表普通输入框
      afterText: "(0~255)",
      validator: transparentValidator
    },
    fillColor: {
      label: "颜色",
      field: "fillColor",
      value: "#00CCCC",
      type: "4", //代表普通输入框
      afterText: "",
      validator: colorPattern
    }
  },
  linebuffer: {
    name: {
      label: "名称",
      field: "name",
      value: "linebuffer",
      type: "1", //代表普通输入框
      afterText: "",
      validator: namePattern
    },
    way: {
      label: "缓冲方式",
      field: "way",
      value: "1",
      content: [{
        label: "平头",
        value: "1"
      }, {
        label: "圆头",
        value: "0"
      }],
      type: "2",
      afterText: ""
    },
    radius: {
      label: "缓冲半径",
      field: "radius",
      value: "1",
      type: "1", //代表普通输入框
      afterText: "米",
      disabled: false,
      validator: radiusValidator
    }
  },
  polygonbuffer: {
    name: {
      label: "名称",
      field: "name",
      value: "polygonbuffer",
      type: "1", //代表普通输入框
      afterText: "",
      validator: namePattern
    },
    way: {
      label: "缓冲方式",
      field: "way",
      value: "1",
      content: [{
        label: "平头",
        value: "1"
      }, {
        label: "圆头",
        value: "0"
      }],
      type: "2",
      afterText: ""
    },
    radius: {
      label: "缓冲半径",
      field: "radius",
      value: "1",
      type: "1", //代表普通输入框
      afterText: "米",
      disabled: false,
      validator: radiusValidator
    }
  },
  createpoint: {
    name: {
      label: "名称",
      field: "name",
      value: "point",
      type: "1", //代表普通输入框
      afterText: "",
      validator: namePattern
    },
    iconPath: {
      label: "图标",
      field: "iconPath",
      value: "",
      type: "5", //代表图片选择
      fileExt: ".png,.jpg,.jpeg,.bmp,.gif",
      afterText: "",
      b2NSize: false,
      toolTip: "选择图片长宽必须是2的N次方像素大小"
    },
    highlightIconPath: {
      label: "高亮图标",
      field: "highlightIconPath",
      value: "",
      type: "5", //代表图片选择
      fileExt: ".png,.jpg,.jpeg,.bmp,.gif",
      afterText: "",
      b2NSize: false,
      toolTip: "选择图片长宽必须是2的N次方像素大小"
    },
    textColor: {
      label: "文字颜色",
      field: "textColor",
      value: "#FFFFFF",
      type: "4", //代表颜色输入框
      afterText: "",
      validator: colorPattern
    },
    textScale: {
      label: "文字比例",
      field: "textScale",
      value: "1",
      type: "1", //代表普通输入框
      afterText: ""
    },
    showHandle: {
      label: "显示指示线",
      field: "showHandle",
      value: false,
      content: [{
        label: "否",
        value: false
      }, {
        label: "是",
        value: true
      }],
      type: "2", //代表普通下拉框
      afterText: ""
    },
    handleHeight: {
      label: "指示线长度",
      field: "handleHeight",
      value: "2",
      type: "1", //代表普通输入框
      afterText: "米",
      disabled: true,
      validator: arrowLenValidator
    },
    handleLineColor: {
      label: "指示线颜色",
      field: "handleLineColor",
      value: "#FFFFFF",
      type: "4", //代表颜色输入框
      afterText: "",
      disabled: true,
      validator: colorPattern
    },
    visibleRange: {
      label: "可视范围",
      field: "visibleRange",
      minValue: "0",
      maxValue: "100",
      type: "6",
      middleText: "至",
      afterText: "千米",

    },
    description: {
      label: "描述",
      field: "description",
      value: "",
      type: "3", //代表多文本输入框
      afterText: ""
    }
  },
  createcurve: {
    name: {
      label: "名称",
      value: "curve",
      field: "name",
      type: "1", //代表普通输入框
      afterText: "",
      validator: namePattern
    },
    lineColor: {
      label: "线颜色",
      field: "lineColor",
      value: "#FFFF00",
      type: "4", //代表颜色输入框
      afterText: "",
      validator: colorPattern
    },
    lineColorTransparent: {
      label: "线透明度",
      field: "lineColorTransparent",
      value: "204",
      type: "1",
      afterText: "(0~255)",
      validator: transparentValidator
    },
    lineWidth: {
      label: "线宽",
      field: "lineWidth",
      value: "1",
      type: "1",
      afterText: "像素",
      validator: lineValidator
    },
    arrowType: {
      label: "显示箭头",
      field: "arrowType",
      value: "0",
      content: [{
        label: "无箭头",
        value: "0"
      }, {
        label: "三角形箭头",
        value: "1"
      }, {
        label: "伞状箭头",
        value: "2"
      }],
      type: "2", //代表普通下拉框
      afterText: ""
    },
    altitudeType: {
      label: "渲染模式",
      field: "altitudeType",
      value: "1",
      content: [{
        label: "贴地",
        value: "1"
      }, {
        label: "正常",
        value: "0"
      }, {
        label: "贴模型",
        value: "5"
      }],
      type: "2",
      afterText: ""
    },
    drawOrder: {
      label: "渲染顺序",
      field: "drawOrder",
      value: "0",
      type: "1",
      afterText: "",
      validator: drawOrderValidator
    },
    description: {
      label: "描述",
      field: "description",
      value: "",
      type: "3", //代表多文本输入框
      afterText: ""
    }
  },
  createline: {
    name: {
      label: "名称",
      value: "line",
      field: "name",
      type: "1", //代表普通输入框
      afterText: "",
      validator: namePattern
    },
    lineColor: {
      label: "线颜色",
      field: "lineColor",
      value: "#FFFF00",
      type: "4", //代表颜色输入框
      afterText: "",
      validator: colorPattern
    },
    lineColorTransparent: {
      label: "线透明度",
      field: "lineColorTransparent",
      value: "204",
      type: "1",
      afterText: "(0~255)",
      validator: transparentValidator
    },
    lineWidth: {
      label: "线宽",
      field: "lineWidth",
      value: "1",
      type: "1",
      afterText: "像素",
      validator: lineValidator
    },
    arrowType: {
      label: "显示箭头",
      field: "arrowType",
      value: "0",
      content: [{
        label: "无箭头",
        value: "0"
      }, {
        label: "三角形箭头",
        value: "1"
      }, {
        label: "伞状箭头",
        value: "2"
      }],
      type: "2", //代表普通下拉框
      afterText: ""
    },
    altitudeType: {
      label: "渲染模式",
      field: "altitudeType",
      value: "1",
      content: [{
        label: "贴地",
        value: "1"
      }, {
        label: "正常",
        value: "0"
      }, {
        label: "贴模型",
        value: "5"
      }],
      type: "2",
      afterText: ""
    },
    drawOrder: {
      label: "渲染顺序",
      field: "drawOrder",
      value: "0",
      type: "1",
      afterText: "",
      validator: drawOrderValidator
    },
    lineLength: { //有问题
      label: "线长度",
      field: "lineLength",
      value: "0",
      type: "1",
      disabled: true,
      afterText: "米",
      validator: hightLigLenValidator
    },
    description: {
      label: "描述",
      field: "description",
      value: "",
      type: "3", //代表多文本输入框
      afterText: ""
    }
  },
  createpolygon: {
    name: {
      label: "名称",
      value: "polygon",
      field: "name",
      type: "1",
      afterText: "",
      validator: namePattern
    },
    lineColor: {
      label: "线颜色",
      field: "lineColor",
      value: "#FFFF00",
      type: "4",
      afterText: "",
      validator: colorPattern
    },
    lineColorTransparent: {
      label: "线透明度",
      field: "lineColorTransparent",
      value: "204",
      type: "1",
      afterText: "(0~255)",
      validator: transparentValidator
    },
    lineWidth: {
      label: "线宽",
      field: "lineWidth",
      value: "1",
      type: "1",
      afterText: "像素",
      validator: lineValidator
    },
    fillColor: {
      label: "填充色",
      field: "fillColor",
      value: "#00FF00",
      type: "4",
      afterText: "",
      validator: colorPattern
    },
    fillColorTransparent: {
      label: "透明度",
      field: "fillColorTransparent",
      value: "204",
      type: "1",
      afterText: "(0~255)",
      validator: transparentValidator
    },
    altitudeType: {
      label: "渲染模式",
      field: "altitudeType",
      value: "1",
      content: [{
        label: "贴地",
        value: "1"
      }, {
        label: "正常",
        value: "0"
      }, {
        label: "贴模型",
        value: "5"
      }],
      type: "2",
      afterText: ""
    },
    drawOrder: {
      label: "渲染顺序",
      field: "drawOrder",
      value: "0",
      type: "1",
      afterText: "",
      validator: drawOrderValidator
    },
    lineLength: { //有问题
      label: "周长",
      field: "lineLength",
      value: "0",
      type: "1",
      disabled: true,
      afterText: "米"
    },
    polygonArea: { //有问题
      label: "水平面积",
      field: "polygonArea",
      value: "0",
      type: "1",
      disabled: true,
      afterText: "平方米"
    },
    description: {
      label: "描述",
      field: "description",
      value: "",
      type: "3",
      afterText: ""
    }
  },
  createcircle: {
    name: {
      label: "名称",
      value: "circle",
      field: "name",
      type: "1",
      afterText: "",
      validator: namePattern
    },
    radius: {
      label: "半径",
      value: "0",
      field: "radius",
      type: "1",
      afterText: "",
      validator: radiusValidator
    },
    lineColor: {
      label: "线颜色",
      field: "lineColor",
      value: "#FFFF00",
      type: "4",
      afterText: "",
      validator: lineValidator
    },
    lineColorTransparent: {
      label: "线透明度",
      field: "lineColorTransparent",
      value: "204",
      type: "1",
      afterText: "(0~255)",
      validator: transparentValidator
    },
    lineWidth: {
      label: "线宽",
      field: "lineWidth",
      value: "1",
      type: "1",
      afterText: "像素",
      validator: lineValidator
    },
    fillColor: {
      label: "填充色",
      field: "fillColor",
      value: "#00FF00",
      type: "4",
      afterText: "",
      validator: colorPattern
    },
    fillColorTransparent: {
      label: "透明度",
      field: "fillColorTransparent",
      value: "204",
      type: "1",
      afterText: "(0~255)",
      validator: transparentValidator
    },
    altitudeType: {
      label: "渲染模式",
      field: "altitudeType",
      value: "1",
      content: [{
        label: "贴地",
        value: "1"
      }, {
        label: "正常",
        value: "0"
      }, {
        label: "贴模型",
        value: "5"
      }],
      type: "2",
      afterText: ""
    },
    drawOrder: {
      label: "渲染顺序",
      field: "drawOrder",
      value: "0",
      type: "1",
      afterText: "",
      validator: drawOrderValidator
    },
    lineLength: { //有问题
      label: "周长",
      field: "lineLength",
      value: "0",
      type: "1",
      disabled: true,
      afterText: "米",
    },
    polygonArea: { //有问题
      label: "水平面积",
      field: "polygonArea",
      value: "0",
      type: "1",
      disabled: true,
      afterText: "平方米"
    },
    description: {
      label: "描述",
      field: "description",
      value: "",
      type: "3",
      afterText: ""
    }
  },
  TexturePolygon: {
    name: {
      label: "名称",
      value: "TexturePolygon",
      field: "name",
      type: "1",
      afterText: "",
      validator: namePattern
    },
    lineColor: {
      label: "线颜色",
      field: "lineColor",
      value: "#FFFF00",
      type: "4",
      afterText: "",
      validator: colorPattern
    },
    lineColorTransparent: {
      label: "线透明度",
      field: "lineColorTransparent",
      value: "204",
      type: "1",
      afterText: "(0~255)",
      validator: transparentValidator
    },
    lineWidth: {
      label: "线宽",
      field: "lineWidth",
      value: "1",
      type: "1",
      afterText: "像素",
      validator: lineValidator
    },
    fillColor: {
      label: "填充色",
      field: "fillColor",
      value: "#00FF00",
      type: "4",
      afterText: "",
      validator: colorPattern
    },
    fillColorTransparent: {
      label: "透明度",
      field: "fillColorTransparent",
      value: "204",
      type: "1",
      afterText: "(0~255)",
      validator: transparentValidator
    },
    altitudeType: {
      label: "渲染模式",
      field: "altitudeType",
      value: "1",
      content: [{
        label: "贴地",
        value: "1"
      }, {
        label: "正常",
        value: "0"
      }, {
        label: "贴模型",
        value: "5"
      }],
      type: "2",
      afterText: ""
    },
    vein: {
      label: "纹理",
      field: "vein",
      value: true,
      content: [{
        label: "显示",
        value: true
      }, {
        label: "不显示",
        value: false
      }],
      type: "2",
      afterText: ""
    },
    picture: {
      label: "图片",
      field: "picture",
      value: "",
      type: "5", //代表图片选择
      fileExt: ".png,.jpg,.jpeg,.bmp,.gif",
      afterText: "",
      validator: required,
      b2NSize: true,
      toolTip: "选择图片长宽必须是2的N次方像素大小"
    },
    broadwise: {
      label: "横向平铺",
      field: "broadwise",
      value: "1",
      type: "1",
      disabled: true,
    },
    vertical: {
      label: "纵向平铺",
      field: "vertical",
      value: "1",
      type: "1",
      disabled: true,
    },
    description: {
      label: "描述",
      field: "description",
      value: "",
      type: "3",
      afterText: ""
    }
  },
  guardLine: {
    name: {
      label: "名称",
      value: "guardLine",
      field: "name",
      type: "1",
      afterText: "",
      validator: namePattern
    },
    columnRadius: {
      label: "警戒柱半径",
      field: "columnRadius",
      value: "0.5",
      type: "1",
      afterText: "米",
      validator: radiusValidator
    },
    columnHeight: {
      label: "警戒柱高度",
      field: "columnHeight",
      value: "1.5",
      type: "1",
      afterText: "米",
      validator: heightValidator
    },
    columnTexture: {
      label: "警戒柱纹理",
      field: "columnTexture",
      value: "",
      type: "5",
      fileExt: ".png,.jpg,.jpeg,.bmp,.gif",
      afterText: "",
      validator: required,
      b2NSize: true,
      toolTip: "选择图片长宽必须是2的N次方像素大小"
    },
    bannerWidth: {
      label: "警戒带宽度",
      field: "bannerWidth",
      value: "0.1",
      type: "1",
      afterText: "米",
      validator: heightValidator
    },
    bannerHeight: {
      label: "警戒带高度",
      field: "bannerHeight",
      value: "0.5",
      type: "1",
      afterText: "米",
      validator: heightValidator
    },
    bannerTexture: {
      label: "警戒带纹理",
      field: "bannerTexture",
      value: "",
      type: "5",
      fileExt: ".png,.jpg,.jpeg,.bmp,.gif",
      afterText: "",
      validator: required,
      b2NSize: true,
      toolTip: "选择图片长宽必须是2的N次方像素大小"
    },
    description: {
      label: "描述",
      field: "description",
      value: "",
      type: "3",
      afterText: ""
    }
  },
  sArrow: {
    name: {
      label: "名称",
      value: "sArrow",
      field: "name",
      type: "1",
      afterText: "",
      validator: namePattern
    },
    lineColor: {
      label: "线颜色",
      field: "lineColor",
      value: "#FFFF00",
      type: "4",
      afterText: "",
      validator: colorPattern
    },
    lineColorTransparent: {
      label: "线透明度",
      field: "lineColorTransparent",
      value: "204",
      type: "1",
      afterText: "(0~255)",
      validator: transparentValidator
    },
    lineWidth: {
      label: "线宽",
      field: "lineWidth",
      value: "1",
      type: "1",
      afterText: "像素",
      validator: lineValidator
    },
    fillColor: {
      label: "填充色",
      field: "fillColor",
      value: "#FFFF00",
      type: "4",
      afterText: "",
      validator: colorPattern
    },
    fillColorTransparent: {
      label: "透明度",
      field: "fillColorTransparent",
      value: "204",
      type: "1",
      afterText: "(0~255)",
      validator: transparentValidator
    },
    altitudeType: {
      label: "渲染模式",
      field: "altitudeType",
      value: "1",
      content: [{
        label: "贴地",
        value: "1"
      }, {
        label: "正常",
        value: "0"
      }, {
        label: "贴模型",
        value: "5"
      }],
      type: "2",
      afterText: ""
    },
    drawOrder: {
      label: "渲染顺序",
      field: "drawOrder",
      value: "0",
      type: "1",
      afterText: "",
      validator: drawOrderValidator
    },
    description: {
      label: "描述",
      field: "description",
      value: "",
      type: "3",
      afterText: "",
      validator: descriptPattern
    }
  },
  equalSArrow: { //直箭头
    name: {
      label: "名称",
      value: "equalSArrow",
      field: "name",
      type: "1",
      afterText: "",
      validator: namePattern
    },
    lineColor: {
      label: "线颜色",
      field: "lineColor",
      value: "#FFFF00",
      type: "4",
      afterText: "",
      validator: colorPattern
    },
    lineColorTransparent: {
      label: "线透明度",
      field: "lineColorTransparent",
      value: "204",
      type: "1",
      afterText: "(0~255)",
      validator: transparentValidator
    },
    lineWidth: {
      label: "线宽",
      field: "lineWidth",
      value: "1",
      type: "1",
      afterText: "像素",
      validator: lineValidator
    },
    fillColor: {
      label: "填充色",
      field: "fillColor",
      value: "#FFFF00",
      type: "4",
      afterText: "",
      validator: lineValidator
    },
    fillColorTransparent: {
      label: "透明度",
      field: "fillColorTransparent",
      value: "204",
      type: "1",
      afterText: "(0~255)",
      validator: transparentValidator
    },
    altitudeType: {
      label: "渲染模式",
      field: "altitudeType",
      value: "1",
      content: [{
        label: "贴地",
        value: "1"
      }, {
        label: "正常",
        value: "0"
      }, {
        label: "贴模型",
        value: "5"
      }],
      type: "2",
      afterText: ""
    },
    drawOrder: {
      label: "渲染顺序",
      field: "drawOrder",
      value: "0",
      type: "1",
      afterText: "",
      validator: drawOrderValidator
    },
    description: {
      label: "描述",
      field: "description",
      value: "",
      type: "3",
      afterText: "",
      validator: descriptPattern
    }
  },
  xArrow: { //多箭头
    name: {
      label: "名称",
      value: "xArrow",
      field: "name",
      type: "1",
      afterText: "",
      validator: namePattern
    },
    lineColor: {
      label: "线颜色",
      field: "lineColor",
      value: "#FFFF00",
      type: "4",
      afterText: "",
      validator: colorPattern
    },
    lineColorTransparent: {
      label: "线透明度",
      field: "lineColorTransparent",
      value: "204",
      type: "1",
      afterText: "(0~255)",
      validator: transparentValidator
    },
    lineWidth: {
      label: "线宽",
      field: "lineWidth",
      value: "1",
      type: "1",
      afterText: "像素",
      validator: lineValidator
    },
    fillColor: {
      label: "填充色",
      field: "fillColor",
      value: "#FFFF00",
      type: "4",
      afterText: "",
      validator: colorPattern
    },
    fillColorTransparent: {
      label: "透明度",
      field: "fillColorTransparent",
      value: "204",
      type: "1",
      afterText: "(0~255)",
      validator: transparentValidator
    },
    altitudeType: {
      label: "渲染模式",
      field: "altitudeType",
      value: "1",
      content: [{
        label: "贴地",
        value: "1"
      }, {
        label: "正常",
        value: "0"
      }, {
        label: "贴模型",
        value: "5"
      }],
      type: "2",
      afterText: ""
    },
    drawOrder: {
      label: "渲染顺序",
      field: "drawOrder",
      value: "0",
      type: "1",
      afterText: "",
      validator: drawOrderValidator
    },
    description: {
      label: "描述",
      field: "description",
      value: "",
      type: "3",
      afterText: "",
      validator: descriptPattern
    }
  },
  tailSArrow: { //燕尾箭头
    name: {
      label: "名称",
      value: "tailSArrow",
      field: "name",
      type: "1",
      afterText: "",
      validator: namePattern
    },
    lineColor: {
      label: "线颜色",
      field: "lineColor",
      value: "#FFFF00",
      type: "4",
      afterText: "",
      validator: colorPattern
    },
    lineColorTransparent: {
      label: "线透明度",
      field: "lineColorTransparent",
      value: "204",
      type: "1",
      afterText: "(0~255)",
      validator: transparentValidator
    },
    lineWidth: {
      label: "线宽",
      field: "lineWidth",
      value: "1",
      type: "1",
      afterText: "像素",
      validator: lineValidator
    },
    fillColor: {
      label: "填充色",
      field: "fillColor",
      value: "#FFFF00",
      type: "4",
      afterText: "",
      validator: colorPattern
    },
    fillColorTransparent: {
      label: "透明度",
      field: "fillColorTransparent",
      value: "204",
      type: "1",
      afterText: "(0~255)",
      validator: transparentValidator
    },
    altitudeType: {
      label: "渲染模式",
      field: "altitudeType",
      value: "1",
      content: [{
        label: "贴地",
        value: "1"
      }, {
        label: "正常",
        value: "0"
      }, {
        label: "贴模型",
        value: "5"
      }],
      type: "2",
      afterText: ""
    },
    drawOrder: {
      label: "渲染顺序",
      field: "drawOrder",
      value: "0",
      type: "1",
      afterText: "",
      validator: drawOrderValidator
    },
    description: {
      label: "描述",
      field: "description",
      value: "",
      type: "3",
      afterText: ""
    }
  },
  customTailArrow: {
    name: {
      label: "名称",
      value: "customTailArrow",
      field: "name",
      type: "1",
      afterText: "",
      validator: namePattern
    },
    lineColor: {
      label: "线颜色",
      field: "lineColor",
      value: "#FFFF00",
      type: "4",
      afterText: "",
      validator: colorPattern
    },
    lineColorTransparent: {
      label: "线透明度",
      field: "lineColorTransparent",
      value: "204",
      type: "1",
      afterText: "(0~255)",
      validator: transparentValidator
    },
    lineWidth: {
      label: "线宽",
      field: "lineWidth",
      value: "1",
      type: "1",
      afterText: "像素",
      validator: lineValidator
    },
    fillColor: {
      label: "填充色",
      field: "fillColor",
      value: "#FFFF00",
      type: "4",
      afterText: "",
      validator: colorPattern
    },
    fillColorTransparent: {
      label: "透明度",
      field: "fillColorTransparent",
      value: "204",
      type: "1",
      afterText: "(0~255)",
      validator: transparentValidator
    },
    altitudeType: {
      label: "渲染模式",
      field: "altitudeType",
      value: "1",
      content: [{
        label: "贴地",
        value: "1"
      }, {
        label: "正常",
        value: "0"
      }, {
        label: "贴模型",
        value: "5"
      }],
      type: "2",
      afterText: "",
    },
    drawOrder: {
      label: "渲染顺序",
      field: "drawOrder",
      value: "0",
      type: "1",
      afterText: "",
      validator: drawOrderValidator
    },
    description: {
      label: "描述",
      field: "description",
      value: "",
      type: "3",
      afterText: ""
    }
  },
  doubleArrow: { //燕尾箭头
    name: {
      label: "名称",
      value: "doubleArrow",
      field: "name",
      type: "1",
      afterText: "",
      validator: namePattern
    },
    lineColor: {
      label: "线颜色",
      field: "lineColor",
      value: "#FFFFFF",
      type: "4",
      afterText: "",
      validator: colorPattern
    },
    lineColorTransparent: {
      label: "线透明度",
      field: "lineColorTransparent",
      value: "204",
      type: "1",
      afterText: "(0~255)",
      validator: transparentValidator
    },
    lineWidth: {
      label: "线宽",
      field: "lineWidth",
      value: "1",
      type: "1",
      afterText: "像素",
      validator: lineValidator
    },
    fillColor: {
      label: "填充色",
      field: "fillColor",
      value: "#FF0000",
      type: "4",
      afterText: "",
      validator: colorPattern
    },
    fillColorTransparent: {
      label: "透明度",
      field: "fillColorTransparent",
      value: "204",
      type: "1",
      afterText: "(0~255)",
      validator: transparentValidator
    },
    altitudeType: {
      label: "渲染模式",
      field: "altitudeType",
      value: "1",
      content: [{
        label: "贴地",
        value: "1"
      }, {
        label: "正常",
        value: "0"
      }, {
        label: "贴模型",
        value: "5"
      }],
      type: "2",
      afterText: ""
    },
    drawOrder: {
      label: "渲染顺序",
      field: "drawOrder",
      value: "0",
      type: "1",
      afterText: "",
      validator: drawOrderValidator
    },
    description: {
      label: "描述",
      field: "description",
      value: "",
      type: "3",
      afterText: "",
      validator: descriptPattern
    }
  },
  customArrow: { //自定义箭头
    name: {
      label: "名称",
      value: "customArrow",
      field: "name",
      type: "1",
      afterText: "",
      validator: namePattern
    },
    lineColor: {
      label: "线颜色",
      field: "lineColor",
      value: "#FFFFFF",
      type: "4",
      afterText: "",
      validator: colorPattern
    },
    lineColorTransparent: {
      label: "线透明度",
      field: "lineColorTransparent",
      value: "204",
      type: "1",
      afterText: "(0~255)",
      validator: transparentValidator
    },
    lineWidth: {
      label: "线宽",
      field: "lineWidth",
      value: "1",
      type: "1",
      afterText: "像素",
      validator: lineValidator
    },
    fillColor: {
      label: "填充色",
      field: "fillColor",
      value: "#FF0000",
      type: "4",
      afterText: "",
      validator: colorPattern
    },
    fillColorTransparent: {
      label: "透明度",
      field: "fillColorTransparent",
      value: "204",
      type: "1",
      afterText: "(0~255)",
      validator: transparentValidator
    },
    altitudeType: {
      label: "渲染模式",
      field: "altitudeType",
      value: "1",
      content: [{
        label: "贴地",
        value: "1"
      }, {
        label: "正常",
        value: "0"
      }, {
        label: "贴模型",
        value: "5"
      }],
      type: "2",
      afterText: ""
    },
    drawOrder: {
      label: "渲染顺序",
      field: "drawOrder",
      value: "0",
      type: "1",
      afterText: "",
      validator: drawOrderValidator
    },
    description: {
      label: "描述",
      field: "description",
      value: "",
      type: "3",
      afterText: "",
      validator: descriptPattern
    }
  },
  curveFlag: { //曲面旗
    name: {
      label: "名称",
      value: "curveFlag",
      field: "name",
      type: "1",
      afterText: "",
      validator: namePattern
    },
    lineColor: {
      label: "线颜色",
      field: "lineColor",
      value: "#FFFFFF",
      type: "4",
      afterText: "",
      validator: colorPattern
    },
    lineColorTransparent: {
      label: "线透明度",
      field: "lineColorTransparent",
      value: "204",
      type: "1",
      afterText: "(0~255)",
      validator: transparentValidator
    },
    lineWidth: {
      label: "线宽",
      field: "lineWidth",
      value: "1",
      type: "1",
      afterText: "像素",
      validator: lineValidator
    },
    fillColor: {
      label: "填充色",
      field: "fillColor",
      value: "#FF0000",
      type: "4",
      afterText: "",
      validator: colorPattern
    },
    fillColorTransparent: {
      label: "透明度",
      field: "fillColorTransparent",
      value: "204",
      type: "1",
      afterText: "(0~255)",
      validator: transparentValidator
    },
    drawOrder: {
      label: "渲染顺序",
      field: "drawOrder",
      value: "0",
      type: "1",
      afterText: "",
      validator: drawOrderValidator
    },
    description: {
      label: "描述",
      field: "description",
      value: "",
      type: "3",
      afterText: "",
      validator: descriptPattern
    }
  },
  rightAngleFlag: { //直角旗
    name: {
      label: "名称",
      value: "rightAngleFlag",
      field: "name",
      type: "1",
      afterText: "",
      validator: namePattern
    },
    lineColor: {
      label: "线颜色",
      field: "lineColor",
      value: "#FFFFFF",
      type: "4",
      afterText: "",
      validator: colorPattern
    },
    lineColorTransparent: {
      label: "线透明度",
      field: "lineColorTransparent",
      value: "204",
      type: "1",
      afterText: "(0~255)",
      validator: transparentValidator
    },
    lineWidth: {
      label: "线宽",
      field: "lineWidth",
      value: "1",
      type: "1",
      afterText: "像素",
      validator: lineValidator
    },
    fillColor: {
      label: "填充色",
      field: "fillColor",
      value: "#FF0000",
      type: "4",
      afterText: "",
      validator: colorPattern
    },
    fillColorTransparent: {
      label: "透明度",
      field: "fillColorTransparent",
      value: "204",
      type: "1",
      afterText: "(0~255)",
      validator: transparentValidator
    },
    drawOrder: {
      label: "渲染顺序",
      field: "drawOrder",
      value: "0",
      type: "1",
      afterText: "",
      validator: drawOrderValidator
    },
    description: {
      label: "描述",
      field: "description",
      value: "",
      type: "3",
      afterText: ""
    }
  },
  triangleFlag: { //三角旗
    name: {
      label: "名称",
      value: "triangleFlag",
      field: "name",
      type: "1",
      afterText: "",
      validator: namePattern
    },
    lineColor: {
      label: "线颜色",
      field: "lineColor",
      value: "#FFFFFF",
      type: "4",
      afterText: "",
      validator: colorPattern
    },
    lineColorTransparent: {
      label: "线透明度",
      field: "lineColorTransparent",
      value: "204",
      type: "1",
      afterText: "(0~255)",
      validator: transparentValidator
    },
    lineWidth: {
      label: "线宽",
      field: "lineWidth",
      value: "1",
      type: "1",
      afterText: "像素",
      validator: lineValidator
    },
    fillColor: {
      label: "填充色",
      field: "fillColor",
      value: "#FF0000",
      type: "4",
      afterText: "",
      validator: colorPattern
    },
    fillColorTransparent: {
      label: "透明度",
      field: "fillColorTransparent",
      value: "204",
      type: "1",
      afterText: "(0~255)",
      validator: transparentValidator
    },
    drawOrder: {
      label: "渲染顺序",
      field: "drawOrder",
      value: "0",
      type: "1",
      afterText: "",
      validator: drawOrderValidator
    },
    description: {
      label: "描述",
      field: "description",
      value: "",
      type: "3",
      afterText: "",
      validator: descriptPattern
    }
  },
  assemblyArea: { //集结地
    name: {
      label: "名称",
      value: "assemblyArea",
      field: "name",
      type: "1",
      afterText: "",
      validator: namePattern
    },
    lineColor: {
      label: "线颜色",
      field: "lineColor",
      value: "#FFFFFF",
      type: "4",
      afterText: "",
      validator: colorPattern
    },
    lineColorTransparent: {
      label: "线透明度",
      field: "lineColorTransparent",
      value: "204",
      type: "1",
      afterText: "(0~255)",
      validator: transparentValidator
    },
    lineWidth: {
      label: "线宽",
      field: "lineWidth",
      value: "1",
      type: "1",
      afterText: "像素",
      validator: lineValidator
    },
    fillColor: {
      label: "填充色",
      field: "fillColor",
      value: "#FF0000",
      type: "4",
      afterText: "",
      validator: colorPattern
    },
    fillColorTransparent: {
      label: "透明度",
      field: "fillColorTransparent",
      value: "204",
      type: "1",
      afterText: "(0~255)",
      validator: transparentValidator
    },
    drawOrder: {
      label: "渲染顺序",
      field: "drawOrder",
      value: "0",
      type: "1",
      afterText: "",
      validator: drawOrderValidator
    },
    description: {
      label: "描述",
      field: "description",
      value: "",
      type: "3",
      afterText: "",
      validator: descriptPattern
    }
  },
  model: { //模型
    name: {
      label: "名称",
      value: "model",
      field: "name",
      type: "1",
      afterText: "",
      validator: namePattern
    },
    modelFile: {
      label: "模型文件",
      value: "",
      field: "modelFile",
      type: "5", //选择本地文件
      fileExt: ".usb,.usx",
      afterText: ""
    },
    modelPath: {
      label: "纹理路径",
      value: "",
      field: "modelPath",
      type: "8", //选择本地文件夹
      afterText: ""
    },
    description: {
      label: "描述",
      field: "description",
      value: "",
      type: "3",
      afterText: ""
    }
  },
  tree: { //树
    name: {
      label: "名称",
      value: "tree",
      field: "name",
      type: "1",
      afterText: "",
      validator: namePattern
    },
    modelFile: {
      label: "模型文件",
      value: "",
      field: "modelFile",
      type: "5", //选择本地文件
      fileExt: ".usb,.usx",
      afterText: ""
    },
    modelPath: {
      label: "模型文件夹",
      value: "",
      field: "modelPath",
      type: "8", //选择本地文件夹
      afterText: ""
    },
    description: {
      label: "描述",
      field: "description",
      value: "",
      type: "3",
      afterText: ""
    }
  },
  sphere: {
    name: {
      label: "名称",
      value: "sphere",
      field: "name",
      type: "1",
      afterText: "",
      validator: namePattern
    },
    // radius: {
    //   label: "半径",
    //   field: "radius",
    //   value: "0.5",
    //   type: "1",
    //   afterText: "米",
    //   validator: radiusValidator
    // },
    color: {
      label: "填充色",
      field: "color",
      value: "#FFFF00",
      type: "4",
      afterText: "",
      validator: colorPattern
    },
    transparent: {
      label: "透明度",
      field: "transparent",
      value: "204",
      type: "1",
      afterText: "(0~255)",
      validator: transparentValidator
    }
  },
  box: {
    name: {
      label: "名称",
      value: "box",
      field: "name",
      type: "1",
      afterText: "",
      validator: namePattern
    },
    length: {
      label: "长",
      field: "length",
      value: "0.5",
      type: "1",
      afterText: "米",
      validator: radiusValidator
    },
    width: {
      label: "宽",
      field: "width",
      value: "0.5",
      type: "1",
      afterText: "米",
      validator: radiusValidator
    },
    height: {
      label: "高",
      field: "height",
      value: "0.5",
      type: "1",
      afterText: "米",
      validator: radiusValidator
    },
    color: {
      label: "填充色",
      field: "color",
      value: "#FFFF00",
      type: "4",
      afterText: "",
      validator: colorPattern
    },
    transparent: {
      label: "透明度",
      field: "transparent",
      value: "204",
      type: "1",
      afterText: "(0~255)",
      validator: transparentValidator
    }
  },
  volume: {
    name: {
      label: "名称",
      value: "volume",
      field: "name",
      type: "1",
      afterText: "",
      validator: namePattern
    },
    height: {
      label: "高",
      field: "height",
      value: "0.5",
      type: "1",
      afterText: "米",
      validator: radiusValidator
    },
    color: {
      label: "填充色",
      field: "color",
      value: "#FFFF00",
      type: "4",
      afterText: "",
      validator: colorPattern
    },
    transparent: {
      label: "透明度",
      field: "transparent",
      value: "204",
      type: "1",
      afterText: "(0~255)",
      validator: transparentValidator
    }
  },
  cylinder: {
    name: {
      label: "名称",
      value: "cylinder",
      field: "name",
      type: "1",
      afterText: "",
      validator: namePattern
    },
    radius: {
      label: "半径",
      field: "radius",
      value: "0.5",
      type: "1",
      afterText: "米",
      validator: radiusValidator
    },
    height: {
      label: "高",
      field: "height",
      value: "0.5",
      type: "1",
      afterText: "米",
      validator: radiusValidator
    },
    color: {
      label: "填充色",
      field: "color",
      value: "#FFFF00",
      type: "4",
      afterText: "",
      validator: colorPattern
    },
    transparent: {
      label: "透明度",
      field: "transparent",
      value: "204",
      type: "1",
      afterText: "(0~255)",
      validator: transparentValidator
    }
  },
  cone: {
    name: {
      label: "名称",
      value: "cone",
      field: "name",
      type: "1",
      afterText: "",
      validator: namePattern
    },
    radiusBottom: {
      label: "底部半径",
      field: "radiusBottom",
      value: "0.5",
      type: "1",
      afterText: "米",
      validator: radiusValidator
    },
    radiusTop: {
      label: "顶部半径",
      field: "radiusTop",
      value: "0.5",
      type: "1",
      afterText: "米",
      validator: radiusValidator
    },
    height: {
      label: "高",
      field: "height",
      value: "0.5",
      type: "1",
      afterText: "米",
      validator: radiusValidator
    },
    color: {
      label: "填充色",
      field: "color",
      value: "#FFFF00",
      type: "4",
      afterText: "",
      validator: colorPattern
    },
    transparent: {
      label: "透明度",
      field: "transparent",
      value: "204",
      type: "1",
      afterText: "(0~255)",
      validator: transparentValidator
    }
  },
  prism: {
    name: {
      label: "名称",
      value: "prism",
      field: "name",
      type: "1",
      afterText: "",
      validator: namePattern
    },
    radius: {
      label: "半径",
      field: "radius",
      value: "0.5",
      type: "1",
      afterText: "米",
      validator: radiusValidator
    },
    height: {
      label: "高",
      field: "height",
      value: "0.5",
      type: "1",
      afterText: "米",
      validator: radiusValidator
    },
    sides: {
      label: "边数",
      field: "sides",
      value: "5",
      type: "1",
      afterText: "条",
      validator: lineValidator
    },
    color: {
      label: "填充色",
      field: "color",
      value: "#FFFF00",
      type: "4",
      afterText: "",
      validator: colorPattern
    },
    transparent: {
      label: "透明度",
      field: "transparent",
      value: "204",
      type: "1",
      afterText: "(0~255)",
      validator: transparentValidator
    }
  },
  pyramid: {
    name: {
      label: "名称",
      value: "pyramid",
      field: "name",
      type: "1",
      afterText: "",
      validator: namePattern
    },
    radiusBottom: {
      label: "底部半径",
      field: "radiusBottom",
      value: "0.5",
      type: "1",
      afterText: "米",
      validator: radiusValidator
    },
    radiusTop: {
      label: "顶部半径",
      field: "radiusTop",
      value: "0.5",
      type: "1",
      afterText: "米",
      validator: radiusValidator
    },
    height: {
      label: "高",
      field: "height",
      value: "0.5",
      type: "1",
      afterText: "米",
      validator: radiusValidator
    },
    sides: {
      label: "边数",
      field: "sides",
      value: "5",
      type: "1",
      afterText: "条",
      validator: lineValidator
    },
    color: {
      label: "填充色",
      field: "color",
      value: "#FFFF00",
      type: "4",
      afterText: "",
      validator: colorPattern
    },
    transparent: {
      label: "透明度",
      field: "transparent",
      value: "204",
      type: "1",
      afterText: "(0~255)",
      validator: transparentValidator
    }
  }
}