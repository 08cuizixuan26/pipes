import $ from 'jquery'
var API = {}

API.usearth = undefined
API.usearth1 = undefined
API.earth2D = undefined
API.lastObj = []
API.lastLayer = null

API.customer_key_down_func = []
API.customer_key_up_func = []

API.loadEarth = function (containerId, elementId, callbackFunc) {
  API.usearth = new StampGis.SEEarth(containerId, elementId, function () {
    API.usearth.Load_s({
      server: custom_config.server_ip,
      parameter: '<?xml version="1.0" encoding="gbk"?><xml><Config>' + custom_config.data_id + '</Config><UserName></UserName><PassWord></PassWord><Token></Token></xml>',
      on_document_changed: function () {
        // console.log("earth init finished");
        if (typeof callbackFunc === 'function') {
          callbackFunc()
        }
      }
    })
  },{
    baseUrlString: stamp_core_config.baseUrlString,
    server_ip: custom_config.server_ip,
    enable_pack_bim: stamp_core_config.enable_pack_bim,
    modelLodRange: stamp_core_config.modelLodRange,
    enableCompass: false,
    iconMouseOver: function (result) {
      // alert(result)
    },
    iconMouseLeave: function () {
      // alert("leave")
    }
  })
}

API.loadEarth1 = function (callback) {
  let flag = false
  if (API.usearth1) {
    flag = true
  }
  API.usearth1 = new StampGis.SEEarth('earthContainer', 'earthDiv1', function () {
    API.usearth1.Load_s({
      server: custom_config.server_ip,
      parameter: '<?xml version="1.0" encoding="gbk"?><xml><Config>' + custom_config.data_id + '</Config><UserName></UserName><PassWord></PassWord><Token></Token></xml>',
      on_document_changed: function () {
        if (typeof callback === 'function') {
          callback()
        }
      }
    })
  })

  if (flag) {
    API.usearth1.Load_s({
      server: custom_config.server_ip,
      parameter: '<?xml version="1.0" encoding="gbk"?><xml><Config>' + custom_config.data_id + '</Config><UserName></UserName><PassWord></PassWord><Token></Token></xml>',
      on_document_changed: function () {
        if (typeof callback === 'function') {
          callback()
        }
      }
    })
  }
}

API.unloadEarth = function () {
  if (API.usearth !== undefined) {
    API.usearth.Suicide(true)
  }
}

API.key_down_func = function (event) {
  for (var ni = 0, len = API.customer_key_down_func.length; ni < len; ++ni) {
    API.customer_key_down_func[ni](event)
  }
}

API.key_up_func = function (event) {
  for (var ni = 0, len = API.customer_key_up_func.length; ni < len; ++ni) {
    API.customer_key_up_func[ni](event)
  }
}

var g_screen_bSync = false
var g_2d_bSync = false
var earthArray = undefined
API.setScreen = function (n, data, is2d, callback) {
  if (n == 1) {
    $('#earthDiv').removeClass('major-viewer-half')
    $('#earthDiv').addClass('major-viewer')
    $('#earthDiv1').removeClass('minor-viewer-half')
    $('#earthDiv1').addClass('minor-viewer-hide')

    API.setSync(false)
    earthArray = undefined
    if (API.usearth1 != undefined && API.usearth1 != null) {
      API.usearth1.Suicide(false)
      API.usearth1 = undefined
    }
    $('#earthDiv1').empty()
    $('.info-div1').css({ 'visibility': 'hidden' })
  } else if (n == 2) {
    $('#earthDiv').removeClass('major-viewer')
    $('#earthDiv').addClass('major-viewer-half')
    $('#earthDiv1').removeClass('minor-viewer-hide')
    $('#earthDiv1').addClass('minor-viewer-half')
    $('#earthDiv').height(window.innerHeight)
    $('#earthDiv1').height(window.innerHeight)
    $('.info-div1').css({ 'visibility': 'visible' })
    API.loadEarth1(callback)
    earthArray = [API.usearth, API.usearth1]
  }
}

API.set2dScreen_by_url = function (n, url) {
  if (n == 1) {
    $('#earch2dDiv').removeClass('minor-viewer-quarter')
    $('#earch2dDiv').addClass('minor-viewer-hide')

    API.setSync(false, true)

    earthArray = undefined
    if (API.earth2D != undefined && API.earth2D != null) {
      API.earth2D.Suicide(false)
      API.earth2D = undefined
    }
    $('#earch2dDiv').empty()
  } else if (n == 2) {
    $('#earch2dDiv').removeClass('minor-viewer-hide')
    $('#earch2dDiv').addClass('minor-viewer-quarter')

    API.loadEarth_2d(url, API.on_document_changed_2d)
  }
}

API.set2dScreen_by_data = function (n, data) {
  if (n == 1) {
    $('#earch2dDiv').removeClass('minor-viewer-quarter')
    $('#earch2dDiv').addClass('minor-viewer-hide')
    API.setSync(false, true)

    earthArray = undefined
    if (API.earth2D != undefined && API.earth2D != null) {
      API.earth2D.Suicide(false)
      API.earth2D = undefined
    }
    $('#earch2dDiv').empty()
  } else if (n == 2) {
    $('#earch2dDiv').removeClass('minor-viewer-hide')
    $('#earch2dDiv').addClass('minor-viewer-quarter')

    API.loadEarth_2d_by_data(data, API.on_document_changed_2d)
  }
}

API.loadEarth_2d_by_data = function (data, callback) {
  API.size_frame()
  $('button').live('mousedown', function () { $('#infoDiv').html('') })
  API.earth2D = new StampGis.SEEarth('earthContainer', 'earch2dDiv', function () {
    API.earth2D.Connect_by_data({
      data: data,
      on_document_changed: function () {
        callback()
      }
    })
  })

  API.earth2D.Connect_by_data({
    data: data,
    on_document_changed: function () {
      callback()
    }
  })
}

API.loadEarth_2d = function (url, callback) {
  API.earth2D = new StampGis.SEEarth('earthContainer', 'earch2dDiv', function () {
    API.earth2D.Connect({
      data: { url: url },
      on_document_changed: function () {
        callback()
      }
    })
  })

  API.earth2D.Connect({
    data: { url: url },
    on_document_changed: function () {
      callback()
    }
  })
}

API.on_document_changed_2d = function () {
  API.earth2D.application.globe_control.enableVerticalTilt = false
  API.earth2D.application.pickingEnable = false
  earthArray = [API.usearth, API.earth2D]

  var pose = getPose(earthArray[0])
  API.earth2D.application.observer.flyTo({
    destination: pose.position,
    orientation: {
      heading: pose.heading,
      pitch: StampGis.StampMath.toRadians(-90),
      roll: 0.0
    }
  })

  setTimeout(function () {
    API.setSync(true, true)
  },
    100
  )
}

API.setSync = function (bSync, b2d) {
  if (API.usearth1 === undefined && API.earth2D === undefined) {
    return
  }

  if (bSync && b2d) { // 联动
    g_2d_bSync = true
    if (g_screen_bSync) {
      API.earth2D.application.globe_control._aggregator.mouseClickEvent.addEventListener(setFocusRight)
    } else {
      API.usearth.application.globe_control._aggregator.mouseClickEvent.addEventListener(setFocusLeft)
      API.earth2D.application.globe_control._aggregator.mouseClickEvent.addEventListener(setFocusRight)
    }

    gotoPoseLeftFly() // 将其他屏定位到第一屏的位置
  } else if (bSync && !b2d) {
    g_screen_bSync = true
    if (g_2d_bSync) {
      API.usearth1.application.globe_control._aggregator.mouseClickEvent.addEventListener(setFocusRight)
    } else {
      API.usearth.application.globe_control._aggregator.mouseClickEvent.addEventListener(setFocusLeft)
      API.usearth1.application.globe_control._aggregator.mouseClickEvent.addEventListener(setFocusRight)
    }

    gotoPoseLeftFly() // 将其他屏定位到第一屏的位置
  } else if (!bSync && b2d) {
    g_2d_bSync = false
    while (API.usearth.application.globe_control._aggregator.mouseClickEvent.numberOfListeners != 0) { API.usearth.application.globe_control._aggregator.mouseClickEvent.removeEventListener(setFocusLeft) }
    while (API.earth2D.application.globe_control._aggregator.mouseClickEvent.numberOfListeners != 0) { API.earth2D.application.globe_control._aggregator.mouseClickEvent.removeEventListener(setFocusRight) }

    while (API.usearth.GlobeObserver.GetObserverChangedEvent().numberOfListeners != 1) { API.usearth.GlobeObserver.GetObserverChangedEvent().removeEventListener(gotoPoseLeft) }
    while (API.earth2D.GlobeObserver.GetObserverChangedEvent().numberOfListeners != 0) { API.earth2D.GlobeObserver.GetObserverChangedEvent().removeEventListener(gotoPoseRight2d) }
    if (g_screen_bSync) {
      API.usearth.application.globe_control._aggregator.mouseClickEvent.addEventListener(setFocusLeft)
      API.usearth1.application.globe_control._aggregator.mouseClickEvent.addEventListener(setFocusRight)
    }

    gotoPoseLeftFly() // 将其他屏定位到第一屏的位置
  } else if (!bSync && !b2d) {
    g_screen_bSync = false
    while (API.usearth.application.globe_control._aggregator.mouseClickEvent.numberOfListeners != 0) { API.usearth.application.globe_control._aggregator.mouseClickEvent.removeEventListener(setFocusLeft) }
    while (API.usearth1.application.globe_control._aggregator.mouseClickEvent.numberOfListeners != 0) { API.usearth1.application.globe_control._aggregator.mouseClickEvent.removeEventListener(setFocusRight) }

    while (API.usearth.GlobeObserver.GetObserverChangedEvent().numberOfListeners != 1) { API.usearth.GlobeObserver.GetObserverChangedEvent().removeEventListener(gotoPoseLeft) }
    while (API.usearth1.GlobeObserver.GetObserverChangedEvent().numberOfListeners != 1) { API.usearth1.GlobeObserver.GetObserverChangedEvent().removeEventListener(gotoPoseRight) }
    if (g_2d_bSync) {
      API.usearth.application.globe_control._aggregator.mouseClickEvent.addEventListener(setFocusLeft)
      API.earth2D.application.globe_control._aggregator.mouseClickEvent.addEventListener(setFocusRight)
    }

    gotoPoseLeftFly() // 将其他屏定位到第一屏的位置
  }
}

function setFocusLeft() {
  if (API.usearth1 === undefined && API.earth2D === undefined) {
    return
  }

  if (API.usearth.GlobeObserver.GetObserverChangedEvent().numberOfListeners < 2) { API.usearth.GlobeObserver.GetObserverChangedEvent().addEventListener(gotoPoseLeft) }
  if (API.usearth1 && g_screen_bSync) {
    while (API.usearth1.GlobeObserver.GetObserverChangedEvent().numberOfListeners != 1) { API.usearth1.GlobeObserver.GetObserverChangedEvent().removeEventListener(gotoPoseRight) }
    if (API.usearth1.application.globe_control._aggregator.mouseClickEvent.numberOfListeners < 1) { API.usearth1.application.globe_control._aggregator.mouseClickEvent.addEventListener(setFocusRight) }
  }
  if (API.earth2D && g_2d_bSync) {
    while (API.earth2D.GlobeObserver.GetObserverChangedEvent().numberOfListeners != 0) { API.earth2D.GlobeObserver.GetObserverChangedEvent().removeEventListener(gotoPoseRight2d) }
    if (API.earth2D.application.globe_control._aggregator.mouseClickEvent.numberOfListeners < 1) { API.earth2D.application.globe_control._aggregator.mouseClickEvent.addEventListener(setFocusRight) }
  }
}

function setFocusRight() {
  if (API.usearth1 === undefined && API.earth2D === undefined) {
    return
  }

  if (API.usearth1 && g_screen_bSync) {
    if (API.usearth1.GlobeObserver.GetObserverChangedEvent().numberOfListeners < 2) { API.usearth1.GlobeObserver.GetObserverChangedEvent().addEventListener(gotoPoseRight) }
  }
  if (API.earth2D && g_2d_bSync) {
    if (API.earth2D.GlobeObserver.GetObserverChangedEvent().numberOfListeners < 1) { API.earth2D.GlobeObserver.GetObserverChangedEvent().addEventListener(gotoPoseRight2d) }
  }

  while (API.usearth.GlobeObserver.GetObserverChangedEvent().numberOfListeners != 1) { API.usearth.GlobeObserver.GetObserverChangedEvent().removeEventListener(gotoPoseLeft) }
  if (API.usearth.application.globe_control._aggregator.mouseClickEvent.numberOfListeners < 1) { API.usearth.application.globe_control._aggregator.mouseClickEvent.addEventListener(setFocusLeft) }
}

function gotoPoseLeft() {
  if (API.usearth1 === undefined && API.earth2D === undefined) {
    return
  }

  var pose = getPose(API.usearth)

  if (API.usearth1 && g_screen_bSync) {
    API.usearth1.application.observer.setView({
      destination: pose.position,
      orientation: {
        heading: pose.heading,
        pitch: API.usearth1.application.globe_control.enableVerticalTilt ? pose.tilt : StampGis.StampMath.toRadians(-90),
        roll: API.usearth1.application.globe_control.enableVerticalTilt ? pose.roll : 0
      }
    })
  }
  if (API.earth2D && g_2d_bSync) {
    API.earth2D.application.observer.setView({
      destination: pose.position,
      orientation: {
        heading: pose.heading,
        pitch: API.earth2D.application.globe_control.enableVerticalTilt ? pose.tilt : StampGis.StampMath.toRadians(-90),
        roll: API.earth2D.application.globe_control.enableVerticalTilt ? pose.roll : 0
      }
    })
  }
}

function gotoPoseLeftFly() {
  if (API.usearth1 === undefined && API.earth2D === undefined) {
    return
  }

  var pose = getPose(API.usearth)

  if (API.usearth1) {
    var pose1 = getPose(API.usearth1)
    API.usearth1.application.observer.flyTo({
      destination: pose.position,
      orientation: {
        heading: pose.heading,
        pitch: API.usearth1.application.globe_control.enableVerticalTilt ? pose.tilt : pose1.tilt,
        roll: API.usearth1.application.globe_control.enableVerticalTilt ? pose.roll : pose1.roll
      }
    })
  }
  if (API.earth2D) {
    var pose1 = getPose(API.earth2D)
    API.earth2D.application.observer.flyTo({
      destination: pose.position,
      orientation: {
        heading: pose.heading,
        pitch: API.earth2D.application.globe_control.enableVerticalTilt ? pose.tilt : pose1.tilt,
        roll: API.earth2D.application.globe_control.enableVerticalTilt ? pose.roll : pose1.roll
      }
    })
  }
}

function gotoPoseRight() {
  if (API.usearth1 === undefined) {
    return
  }

  var pose = getPose(API.usearth1)
  var pose1 = getPose(API.usearth)

  API.usearth.application.observer.setView({
    destination: pose.position,
    orientation: {
      heading: pose.heading,
      pitch: API.usearth1.application.globe_control.enableVerticalTilt ? pose.tilt : pose1.tilt,
      roll: API.usearth1.application.globe_control.enableVerticalTilt ? pose.roll : pose1.roll
    }
  })
  if (API.earth2D) {
    var pose2 = getPose(API.earth2D)
    API.earth2D.application.observer.setView({
      destination: pose.position,
      orientation: {
        heading: pose.heading,
        pitch: API.earth2D.application.globe_control.enableVerticalTilt ? pose.tilt : pose2.tilt,
        roll: API.earth2D.application.globe_control.enableVerticalTilt ? pose.roll : pose2.roll
      }
    })
  }
}

function gotoPoseRight2d() {
  if (API.earth2D === undefined) {
    return
  }

  var pose = getPose(API.earth2D)
  var pose1 = getPose(API.usearth)

  API.usearth.application.observer.setView({
    destination: pose.position,
    orientation: {
      heading: pose.heading,
      pitch: API.earth2D.application.globe_control.enableVerticalTilt ? pose.tilt : pose1.tilt,
      roll: API.earth2D.application.globe_control.enableVerticalTilt ? pose.roll : pose1.roll
    }
  })
  if (API.usearth1 && g_screen_bSync) {
    var pose2 = getPose(API.usearth1)
    API.usearth1.application.observer.setView({
      destination: pose.position,
      orientation: {
        heading: pose.heading,
        pitch: API.earth2D.application.globe_control.enableVerticalTilt ? pose.tilt : pose2.tilt,
        roll: API.earth2D.application.globe_control.enableVerticalTilt ? pose.roll : pose2.roll
      }
    })
  }
}

function getPose(earthObj) {
  var data = {}
  if (earthObj && earthObj.application.observer) {
    return earthObj.application.observer.pose
  }
  return data
}

export default API
