var custom_config = {
  server_ip: 'http://192.168.1.250',
  stampManagerUrl: 'http://192.168.1.250/StampManager',
  sqliteQuery: 'http://192.168.1.250:8080/sqliteQuery',
  data_id: 0
}

var STAMP_config = {
  fxaa: true, // 是否开启去锯齿
  viewEnable: false, // 是否开启场景效果设置
  viewSetting: { // 场景亮度
    brightness: 1.0,
    contrast: 1.0,
    hue: 0,
    saturation: 1.0,
    gamma: 1.0
  },
  highLightTime: 10 * 1000, // 持续高亮时间
  highlight_interval_time: 0.5, // 闪烁时间间隔
  highLightColor: 'ff2323', // 前六位颜色，后两位透明度
  lightTime: '2021-08-23 08:00:00',
  profileAlt: '0',
  quickQuerySetting: [{
    type: 'pipe',
    searchType: 'line',
    name: '材质',
    value: 'US_PMATER'
  }, {
    type: 'pipe',
    searchType: 'point',
    name: '特征',
    value: 'US_PT_TYPE'
  }, {
    type: 'pipe',
    searchType: 'point',
    name: '附属物',
    value: 'US_ATTACHMENT'
  }] // 快速查询配置
}

// 管线系统配置信息
STAMP_config.pipeline = {
  curProject: '', // 管线工程名
  locationHeight: 10000
}
