import fire from './elementDynamic/fire'
import smoke from './elementDynamic/smoke'
import nozzle from './elementDynamic/nozzle'
import warnRing from './elementDynamic/warnRing'
import heatmap from './elementDynamic/heatmap'
import pointClouds from './elementDynamic/pointClouds'
import sixPolygon from './elementDynamic/sixPolygon'
import polyhedron from './elementDynamic/polyhedron'
import smokeFire from './elementDynamic/smokeFire' // 粒子特效
import dScan from './elementDynamic/dScan'
import dSpread from './elementDynamic/dSpread'
import dWall from './elementDynamic/dWall'
import warnWall from './elementDynamic/warnWall'
import ballonIcon from './elementDynamic/ballonIcon'
import pyramidIcon from './elementDynamic/pyramidIcon'
import dome from './elementDynamic/dome'
import moveIcon from './elementDynamic/moveIcon'
import cylinderElement from './elementDynamic/cylinderElement'
import verticalLine from './elementDynamic/verticalLine'
import circularFountain from './elementDynamic/circularFountain'
import panelIcon from './elementDynamic/panelIcon'

import createpoint from './element2D/point'
import createline from './element2D/line'
import createpolygon from './element2D/polygon'
import createcircle from './element2D/circle'
import texturePolygon from './element2D/texturePolygon'
import createcurve from './element2D/curve'
import guardLine from './element2D/guardLine'
import dynamicLine from './element2D/dynamicLine'
import dwater from './element2D/dWater'

import linebuffer from './element2Dedit/linebuffer'
import polygonbuffer from './element2Dedit/polygonbuffer'

import importVectorPolygon from './element2DImport/importVectorPolygon.js'
import importVectorLine from './element2DImport/importVectorLine.js'
import importVectorPoint from './element2DImport/importVectorPoint.js'
import exportShp from './element2DImport/exportSHP.js'

import sevenColorArcs from './element3D/sevenColorArcs' //七色弧线
import progressiveArc from './element3D/progressiveArc' //渐进弧线
import moveSolitaryLine from './element3D/moveSolitaryLine' //运动孤形虚线
import brokenDotted from './element3D/brokenDotted' //运动折线
import moveArrow from './element3D/moveArrow' //运动箭头
import glowLine from './element3D/glowLine' //光晕线
import flowliquid from './element3D/flowliquid' //管道工艺
import odLine from './element3D/odLine'
import river from './element3D/river'
import flowline from './element3D/flowline'

import sphere from './element3D/sphere'
import box from './element3D/box'
import volume from './element3D/volume'
import cylinder from './element3D/cylinder'
import cone from './element3D/cone'
import prism from './element3D/prism'
import pyramid from './element3D/pyramid'

import model from './model3D/model'

import sArrow from './militaryPlot/sArrow' // 简单箭头
import customArrow from './militaryPlot/customArrow' // 自定义箭头
import equalSArrow from './militaryPlot/equalSArrow' // 直箭头
import tailSArrow from './militaryPlot/tailSArrow' // 燕尾箭头
import doubleArrow from './militaryPlot/doubleArrow' // 双箭头
import xArrow from './militaryPlot/xArrow' // 多箭头
import curveFlag from './militaryPlot/curveFlag' // 曲面旗标
import rightAngleFlag from './militaryPlot/rightAngleflag' // 直角旗标
import triangleFlag from './militaryPlot/triangleFlag' // 三角旗标
import assemblyArea from './militaryPlot/assemblyArea' // 集结地
import customTailArrow from './militaryPlot/customTailArrow' // 自定义燕尾箭头

import emergencyPlot from './emergencyPlot/emergencyPlot'

import label from './label'
// import lines from './line'
import line from './element2D/line'

const drawObj = {
  fire,
  smoke,
  nozzle,
  dwater,
  warnRing,
  odLine,
  heatmap,
  pointClouds,
  flowline,
  sixPolygon,
  polyhedron,
  smokeFire,
  dScan,
  dSpread,
  dWall,
  warnWall,
  ballonIcon,
  pyramidIcon,
  dome,
  moveIcon,
  cylinderElement,
  verticalLine,
  circularFountain,
  panelIcon,

  createpoint,
  createline,
  createpolygon,
  createcircle,
  texturePolygon,
  createcurve,
  flowliquid,

  linebuffer,
  polygonbuffer,
  
  importVectorPolygon,
  importVectorLine,
  importVectorPoint,
  exportShp,

  guardLine, //几何对象
  dynamicLine,
  sevenColorArcs,
  progressiveArc,
  moveSolitaryLine,
  brokenDotted,
  moveArrow,
  glowLine,

  sphere,
  box,
  volume,
  cylinder,
  cone,
  prism,
  pyramid,

  model: getModelByType('model'),
  billboard: getModelByType('billboard'),
  matchmodel: getModelByType('matchmodel'),
  river,

  sArrow,
  equalSArrow,
  tailSArrow,
  customTailArrow,
  doubleArrow,
  xArrow,
  customArrow,
  curveFlag,
  rightAngleFlag,
  triangleFlag,
  assemblyArea,

  emergencyPlot,
  label,
  line
}

function getModelByType(type) {
  return model(type)
}

export default drawObj