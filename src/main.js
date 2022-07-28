import Vue from 'vue'

import 'normalize.css/normalize.css'

import App from './App.vue'
import router from './router'
import store from './store'
import './registerServiceWorker'
import './directives/index'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import '@/style/index.less'

// import './icons'

import API from './stamplib/API'

import x2js from 'x2js'

Vue.use(ElementUI)

Vue.config.productionTip = false

import echarts from 'echarts'

Vue.prototype.$echarts = echarts // 引入组件

Vue.prototype.$x2js = new x2js()

Vue.prototype.stampAPI = API

Vue.prototype.g_Project = {
  project: null,
  location: null,
  SpatialReference: null,
  FieldMap: null,
  PipeConfig: null,
  ValueMap: null,
  Bounds: null,
  pipeListData: [],
  geologyListData: [],
  selectGeologyLayer: null,
  selectQueryMethod: 0
}

Vue.prototype.g_ElementData = {// 对象大类类型：动态特效、二维Element对象、三维Element对象、模型对象
  'dynamicObject': {
    elementArr: [], // 显示用的对象列表，无层级关系的
    elementJson: [{// 标绘对象的图层树
      guid: -1,
      name: '动态特效',
      children: []
    }]
  },
  'element2D': {
    elementArr: [],
    elementJson: [{
      guid: -1,
      name: '二维对象',
      children: []
    }]
  },
  // 'line':{
  //   elementArr: [],
  //   elementJson: [{
  //     guid: -1,
  //     name: '管线标注管理',
  //     children: []
  //   }]
  // },
  'elementLabel': {
    elementArr: [],
    elementJson: [{
      guid: -1,
      name: '管线标注管理',
      children: []
    }]
  },
  'militaryPlot': {
    elementArr: [],
    elementJson: [{
      guid: -1,
      name: '军事标绘',
      children: []
    }]
  },
  'element3D': {
    elementArr: [],
    elementJson: [{
      guid: -1,
      name: '几何对象',
      children: []
    }]
  },
  'emergencyPlot': {
    elementArr: [],
    elementJson: [{
      guid: -1,
      name: '应急标绘',
      children: [
        {
          guid: -11,
          name: '点符号',
          children: []
        }, {
          guid: -12,
          name: '线符号',
          children: []
        }, {
          guid: -13,
          name: '面符号',
          children: []
        }
      ]
    }]
  },
  'model3D': {
    elementArr: [],
    elementJson: [{
      guid: -1,
      name: '模型对象',
      children: []
    }]
  },
  'publishObject': {
    elementArr: [],
    elementJson: [{
      guid: -1,
      name: '任务列表',
      children: []
    }]
  }
}

Vue.prototype.g_DrillData = {

}

Vue.prototype.stage = {
  rain_stage: null,
  snow_stage: null,
  fog_stage: null,
  night_stage: null,
  adjustment_stage: null
}

window.g_VideoLayer = null
window.g_ModelLayer = null
window.g_DynamicLayer = null
window.key_valid = true

var env = process.env
// console.log(env)
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

window.oncontextmenu = function () {
  return false
}

// Array.prototype.indexOf = function(val) {
//   for (var i = 0; i < this.length; i++) {
//       if (this[i] == val) return i;
//   }
//   return -1;
// };
