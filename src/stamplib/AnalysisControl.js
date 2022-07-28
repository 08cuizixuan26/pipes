import { createGuid } from '@/utils'
import { profieRequest, surfaceExcavationAndFillRequest } from '@/api/analysis'
import RawBuffer from '@/utils/RawBuffer'
import { Loading } from 'element-ui';

var AnalysisControl = {};

var demIdArr = [];

function getDemLayerData(root) {
  for (var i = 0; i < root.getChildCount(); i++) {
    var subLayer = root.getChildAt(i);
    if (subLayer.getChildCount === undefined) {
      if (subLayer._rtti == 101 && subLayer.get_is_visible()) {
        demIdArr.push(subLayer.get_guid());
      }
    } else {
      getDemLayerData(subLayer);
    }
  }
}

function CreateTextPoint(earth, points, text, color) {
  var icon = earth.Factory.CreateElementIcon({
    guid: createGuid(),
    name: text,
    doc: earth.document,
    parentLayer: earth.document.elementRoot
  });
  if (!icon) {
    return null;
  }
  icon.transform.set_position_geo(points);
  icon.ShowHandle = false;

  icon.HandleHeight = 0;
  icon.RenderMode = 0;
  icon.TextColor = color;
  icon.TextHorizontalScale = 1;
  icon.TextVerticalScale = 1;
  icon.Text = text;
  icon.minVisibleRange = 0 * 1000;
  icon.maxVisibleRange = 5 * 1000;
  icon.Create();
  icon.BeginUpdate();
  icon.set_is_visible(true);
  icon.EndUpdate();

  earth.document.elementRoot.attach_object(icon);
  earth.document.register_object(icon);
  return icon;
}

var mission_list = {};

var line_signt_result_list = [];
var line_sight_icon_list = [];
AnalysisControl.line_sight = function (earth, startHeight, endHeight, callback) {
  let count = 0;
  earth.ShapeCreator.CreateLineWithFirstPoint({
    // first_point : new StampGis.Cartesian3(-2410180.121224507,4694699.004745766,3570175.2576547363),
    custom_excute_finish: function (result) {
      if (result.data != undefined) {
        if (result.data.length < 2) {
          return;
        }
        count++;
        var icon = CreateTextPoint(earth, result.data[0], "起始点", 0xffffffff);
        line_sight_icon_list.push(icon);
        var icon1 = CreateTextPoint(earth, result.data[1], `目标点${count}`, 0xffffffff);
        line_sight_icon_list.push(icon1);

        var start = StampGis.Cartographic.fromCartesian(result.data[0]);
        var end = StampGis.Cartographic.fromCartesian(result.data[1]);
        start.longitude = StampGis.StampMath.toDegrees(start.longitude);
        start.latitude = StampGis.StampMath.toDegrees(start.latitude);
        end.longitude = StampGis.StampMath.toDegrees(end.longitude);
        end.latitude = StampGis.StampMath.toDegrees(end.latitude);

        demIdArr = [];
        getDemLayerData(earth.document.rootFolder);
        var layerids = demIdArr.join(',');

        var mission = earth.Analysis.LineSight({
          layers: layerids,
          type: 3,
          s_height: startHeight,
          e_height: endHeight,
          start: start,
          end: end,
          custom_analysis_finish: custom_line_sight_analysis_finish,
          doc: earth.document
        });
        mission_list[mission] = mission;
        callback(count);
      } else {
        earth.ShapeCreator.Clear();
      }
    }
  });
}

function custom_line_sight_analysis_finish(result) {
  if (result.guid in mission_list) {
    line_signt_result_list.push(result);
  } else {
    this.$message({
      message: "通视分析出错",
      type: 'error',
      center: true
    });
  }
}

AnalysisControl.ShowHeight = function (earth) {
  if (line_signt_result_list.length > 0) {
    var allDatas = []
    var ids = []
    for (let i = 0; i < line_signt_result_list.length; i++) {
      var result = line_signt_result_list[i];
      var datas = [];
      var coords = undefined;
      if (result.object_list[1].SphereCoordinates !== undefined) {
        coords = result.object_list[1].SphereCoordinates;
        ids.push(result.object_list[0]._id)
        datas.push(coords[1]);
        datas.push(coords[2]);
        datas.push(coords[2]);
      } else if (result.object_list[2].SphereCoordinates !== undefined) {
        coords = result.object_list[2].SphereCoordinates;
        ids.push(result.object_list[0]._id)
        datas.push(coords[1]);
        datas.push(coords[3]);
        datas.push(coords[2]);
      }
      allDatas.push(datas);
      earth.ShapeCreator.HeightLimit({
        points: allDatas[i],
        custom_excute_finish: function (result) {
          if (result.data != undefined && result.data.length >= 2) {
            earth.ShapeCreator.Clear();
          } else {
            earth.ShapeCreator.Clear();
          }
        }
      });
    }
  }
  // earth.ToolManager.ObjectEditTool.Select();
  // earth.SelectSet.on_select_changed = function(){
  //     earth.SelectSet.on_select_changed = function(){}
  //     for(var i = 0; i < earth.SelectSet.GetTotalCount(); i++) {
  //       var obj = earth.SelectSet.GetOverallObject(i);
  //     }
  //     for (let j = 0; j < ids.length; j++) {
  //       if(obj._rtti != 220) { //220：线
  //         alert("请选择通视线！")
  //         return;
  //       }
  //       // earth.SelectSet.Clear()
  //       const id = ids[j];
  //       if(id === obj._id) {
  // earth.ShapeCreator.HeightLimit({
  // points : allDatas[j],
  // custom_excute_finish : function (result) {
  // if (result.data != undefined && result.data.length >= 2) {
  // earth.ShapeCreator.Clear();
  // } else {
  // earth.ShapeCreator.Clear();
  // }
  // }
  // });
  // earth.SelectSet.Clear()
  // break
  // }
  // }
  // };
  // earth.SelectSet.Clear()

}

AnalysisControl.clear_line_sight = function (earth) {
  //清除通视分析效果
  for (var i = 0; i < line_signt_result_list.length; i++) {
    var result = line_signt_result_list[i];
    for (var j = 0; j < result.object_list.length; j++) {
      result.layer.detach_object(result.object_list[j]);
    }
  }
  line_signt_result_list = [];
  for (var i = 0; i < line_sight_icon_list.length; i++) {
    var result = line_sight_icon_list[i];
    earth.document.elementRoot.detach_object(result);
  }
  line_sight_icon_list = [];

  mission_list = {};
}

var shinning_endtime = null;
var shinning_interval = null;
var shinning_callback = null;
var shinning_myDate = null;
var shinning_mytime = null;
var shinning_start = null;
var shinning_radius = null;
var shinning_layerStr = null;
var shinning_result_list = [];
AnalysisControl.shinning = function (earth, myDate, myTime, layerStr, callback) {
  var GeoAlg = new StampGis.SEGeometryAlgorithm();
  earth.ShapeCreator.CreateCircle({
    custom_excute_finish: function (result) {
      if (result.data != undefined) {
        var start = StampGis.Cartographic.fromCartesian(result.data[0]);
        start.longitude = StampGis.StampMath.toDegrees(start.longitude);
        start.latitude = StampGis.StampMath.toDegrees(start.latitude);
        shinning_start = start;
        shinning_radius = result.radius;
        shinning_layerStr = layerStr;
        var vector2 = GeoAlg.CalculateSunElevationAndAzimuthAngle(8, myDate.getFullYear(), myDate.getMonth(), myDate.getDate(), myTime.getHours(), myTime.getMinutes(), 0, start.longitude, start.latitude);
        if (vector2.ele_angle > 0) {
          var mission = earth.Analysis.Shinning({
            type: 1,
            elevationAngle: vector2.ele_angle,
            azimuthAngle: vector2.azi_angle,
            center: new StampGis.Cartographic(StampGis.StampMath.toRadians(start.longitude), StampGis.StampMath.toRadians(start.latitude), start.height)/*result.center*/,
            radius: result.radius,
            visiblelayer: layerStr,
            custom_analysis_finish: custom_shinning_analysis_finish,
          });
          mission_list[mission] = mission;
          earth.ShapeCreator.Clear();
          callback(false, false);
        } else {
          earth.ShapeCreator.Clear();
          callback(false, true);
        }

      } else {
        earth.ShapeCreator.Clear();
        callback(false, true);
      }
    }
  });
}
function custom_shinning_analysis_finish(result) {
  if (result.guid in mission_list) {
    shinning_result_list = result.meshArray;
  } else {
    this.$message({
      message: "阴影分析出错",
      type: 'error',
      center: true
    });
  }
}

AnalysisControl.clear_shinning = function (earth) {
  //清除阴影效果
  if (shinning_result_list) {
    for (var i = 0; i < shinning_result_list.length; i++) {
      var result = shinning_result_list[i];
      earth.document.elementRoot.detach_object(result);
    }
  }

  shinning_result_list = [];
  shinning_endtime = null;
  shinning_interval = null;
  shinning_callback = null;
  shinning_myDate = null;
  shinning_mytime = null;
  shinning_start = null;
  shinning_radius = null;
  shinning_layerStr = null;
  mission_list = {};
}

AnalysisControl.dynamicShinningFlag = false;
AnalysisControl.dynamicShinning = function (earth, myDate, hour, min, endtime, interval, callback) {
  shinning_endtime = endtime;
  shinning_interval = interval;
  shinning_callback = callback;
  shinning_myDate = myDate;
  shinning_mytime = new Date(myDate.getFullYear(), myDate.getMonth(), myDate.getDate(), hour, min);

  var GeoAlg = new StampGis.SEGeometryAlgorithm();
  var vector2 = GeoAlg.CalculateSunElevationAndAzimuthAngle(8, myDate.getFullYear(), myDate.getMonth(), myDate.getDate(), hour, min, 0, shinning_start.longitude, shinning_start.latitude);

  if (vector2.ele_angle && vector2.azi_angle && vector2.ele_angle > 0) {
    var self = this;
    var mission = earth.Analysis.Shinning({
      type: 1,
      elevationAngle: vector2.ele_angle,
      azimuthAngle: vector2.azi_angle,
      center: new StampGis.Cartographic(StampGis.StampMath.toRadians(shinning_start.longitude), StampGis.StampMath.toRadians(shinning_start.latitude), shinning_start.height)/*result.center*/,
      radius: shinning_radius,
      visiblelayer: shinning_layerStr,
      custom_analysis_finish: function (result) {
        for (var i = 0; i < shinning_result_list.length; i++) {
          var tempresult = shinning_result_list[i];
          earth.document.elementRoot.detach_object(tempresult);
        }
        if (result.guid in mission_list) {
          shinning_result_list = result.meshArray;
          var nowhour = shinning_mytime.getHours();
          var nowmin = Number(shinning_mytime.getMinutes()) + Number(shinning_interval);
          if (nowmin > 60) {
            nowmin = nowmin - 60;
            nowhour = nowhour + 1;
          }
          var temptime = nowhour * 60 + nowmin;
          var endtiem = shinning_endtime.getHours() * 60 + shinning_endtime.getMinutes();

          if (temptime < endtiem && self.dynamicShinningFlag) {
            var inter = setInterval(function () {
              clearInterval(inter);
              var time = new Date(shinning_myDate.getFullYear(), shinning_myDate.getMonth(), shinning_myDate.getDate(), nowhour, nowmin);
              shinning_callback("取消模拟", false, true, time);
              self.dynamicShinning(earth, shinning_myDate, nowhour, nowmin, shinning_endtime, shinning_interval, shinning_callback);
            }, 500);

          } else {
            var time = new Date();
            time.setDate(shinning_myDate.getDate());
            time.setMonth(shinning_myDate.getMonth());
            time.setFullYear(shinning_myDate.getFullYear());
            var nowtemptime = time.getHours() * 60 + time.getMinutes();
            if (nowtemptime > endtiem) {
              time = shinning_endtime;
            }
            shinning_callback("动态模拟", true, false, time);
            self.clear_shinning(earth);
          }

        } else {
          self.$message({
            message: "动态模拟出错",
            type: 'error',
            center: true
          });
        }
      },
    });
    mission_list[mission] = mission;
  } else {
    var time = new Date();
    time.setDate(shinning_myDate.getDate());
    time.setMonth(shinning_myDate.getMonth());
    time.setFullYear(shinning_myDate.getFullYear());
    var nowtemptime = time.getHours() * 60 + time.getMinutes();
    var endtiem = shinning_endtime.getHours() * 60 + shinning_endtime.getMinutes();
    if (nowtemptime > endtiem) {
      time = shinning_endtime;
    }
    shinning_callback("动态模拟", true, false, time);
    this.clear_shinning(earth);
  }
}

var usearth = null;
var best_color_list = {};
var best_path_result_list = [];
var best_path_icon_list = [];
AnalysisControl.best_path = function (earth, interval, climbLimitedArr, descentLimitedArr, colorArr, checkArr, callback) {
  usearth = earth;
  earth.ShapeCreator.CreateLine({
    custom_excute_finish: function (result) {
      if (result.data != undefined) {
        var icon = CreateTextPoint(earth, result.data[0], "起点", 0xffffffff);
        best_path_icon_list.push(icon);

        var icon1 = CreateTextPoint(earth, result.data[1], "终点", 0xffffffff);
        best_path_icon_list.push(icon1);

        var start = StampGis.Cartographic.fromCartesian(result.data[0]);
        var end = StampGis.Cartographic.fromCartesian(result.data[1]);
        start.longitude = StampGis.StampMath.toDegrees(start.longitude);
        start.latitude = StampGis.StampMath.toDegrees(start.latitude);
        end.longitude = StampGis.StampMath.toDegrees(end.longitude);
        end.latitude = StampGis.StampMath.toDegrees(end.latitude);

        demIdArr = [];
        getDemLayerData(earth.document.rootFolder);
        var layerids = demIdArr.join(',');

        var mission = null;
        if (checkArr[0]) {
          mission = earth.Analysis.BestPath({
            layers: layerids,
            u_angle: Number(climbLimitedArr[0]),
            d_angle: Number(descentLimitedArr[0]),
            d_interval: Number(interval),
            d_circle_factor: 1,
            start: start,
            end: end,
            custom_analysis_finish: custom_best_path_analysis_finish,
            doc: earth.document
          });
          best_color_list[mission] = colorArr[0];
          mission_list[mission] = mission;
        }

        if (checkArr[1]) {
          mission = earth.Analysis.BestPath({
            layers: layerids,
            u_angle: Number(climbLimitedArr[1]),
            d_angle: Number(descentLimitedArr[1]),
            d_interval: Number(interval),
            d_circle_factor: 1,
            start: start,
            end: end,
            custom_analysis_finish: custom_best_path_analysis_finish,
            doc: earth.document
          });
          best_color_list[mission] = colorArr[1];
          mission_list[mission] = mission;
        }

        if (checkArr[2]) {
          mission = earth.Analysis.BestPath({
            layers: layerids,
            u_angle: Number(climbLimitedArr[2]),
            d_angle: Number(descentLimitedArr[2]),
            d_interval: Number(interval),
            d_circle_factor: 1,
            start: end,
            end: start,
            custom_analysis_finish: custom_best_path_analysis_finish,
            doc: earth.document
          });
          best_color_list[mission] = colorArr[2];
          mission_list[mission] = mission;
        }

        earth.ShapeCreator.Clear();
      } else {
        earth.ShapeCreator.Clear();
      }
      callback();
    }
  });
}
function custom_best_path_analysis_finish(result) {
  if (result.ret_id in mission_list) {
    best_path_result_list.push(result);
    for (var j = 0; j < result.object_list.length; j++) {
      result.object_list[j].lineColor = parseInt(best_color_list[result.ret_id], 16);

      var point = result.object_list[j].transform;
      point = StampGis.Cartesian3.fromRadians(point.longitude, point.latitude, point.altitude);
      var icon = CreateTextPoint(usearth, point, result.object_list[j].length.toFixed(2), result.object_list[j].lineColor);
      best_path_icon_list.push(icon);
    }
  } else {
    this.$message({
      message: "地形路径分析出错",
      type: 'error',
      center: true
    });
  }
}

AnalysisControl.clear_best_path = function (earth) {
  //清除地形路径效果
  for (var i = 0; i < best_path_result_list.length; i++) {
    var result = best_path_result_list[i];
    for (var j = 0; j < result.object_list.length; j++) {
      result.layer.detach_object(result.object_list[j]);
    }
  }
  best_path_result_list = [];
  for (var i = 0; i < best_path_icon_list.length; i++) {
    var result = best_path_icon_list[i];
    earth.document.elementRoot.detach_object(result);
  }
  best_path_icon_list = [];
  best_path_result_list = [];
  best_color_list = {};
  usearth = null;

  mission_list = {};
}

AnalysisControl.fixed_observe = function (earth, observeHeight) {
  earth.ShapeCreator.CreateShapePose({
    height: Number(observeHeight),
    custom_excute_finish: function () {
      earth.ShapeCreator.Clear();
    }
  });
}

AnalysisControl.sky_line = function (earth, height, distance, depth, showTerrain, callback) {
  earth.ShapeCreator.CreatePolyline({
    custom_excute_finish: function (result) {
      if (result.data != undefined && result.data.length >= 2) {
        earth.ShapeCreator.Clear();
        earth.GlobeObserver.FixedPointObserveEx3({
          lineData: result.data,
          height: Number(height),
          distance: Number(distance),
          depth: Number(depth),
          showTerrain: showTerrain,
          seeLeft: true
        });
        callback();
      } else {
        earth.ShapeCreator.Clear();
      }
    }
  });
}

AnalysisControl.sky_line_save_jpg = function (earth, filename) {
  earth.application.render();
  var canvas = earth.application.canvas;
  canvas.getContext('experimental-webgl', { preserveDrawingBuffer: true });
  var name = filename;
  var link = document.createElement('a');
  var url = canvas.toDataURL("image/jpeg").replace("image/jpg", "image/octet-stream");
  link.setAttribute('download', name);
  link.setAttribute('href', url);
  link.click();

  setTimeout(function () {
    window.URL.revokeObjectURL(url);
  }, 100);

  canvas.getContext('experimental-webgl', { preserveDrawingBuffer: false });
}

var skyline_stage = undefined;
AnalysisControl.sky_line_ex = function (earth) {
  earth.document.environment.skySphere.show = false;
  if (skyline_stage === undefined) {
    skyline_stage = StampGis.PostProcessStageLibrary.createSkylineStage();
    skyline_stage.enabled = false;
    earth.view.postProcessStages.add(skyline_stage);
  }
  skyline_stage.enabled = true;
}

AnalysisControl.clear_sky_line_ex = function (earth) {
  //清除天际线描边
  if (skyline_stage != undefined) {
    skyline_stage.enabled = false;
    earth.document.environment.skySphere.show = false;
  }
}

var clip_guid = undefined;
AnalysisControl.clip = function (earth, alt, checkmodel, type, radius, callback, vueObj) {
  var self = this;
  if (type == 1) {
    earth.ShapeCreator.CreatePolygon({
      custom_excute_finish: function (result) {
        if (result.data != undefined && result.data.length >= 2) {
          var inPointArrays = new Array();
          inPointArrays.push(result.data);
          clip_guid = earth.TerrainManager.ClipTerrainByPolygon(inPointArrays, alt, checkmodel);
          earth.ShapeCreator.Clear();
          var pointsStr = "";
          var pointsStr2 = ""
          for (var i = 0; i < result.data.length; i++) {
            var start = StampGis.Cartographic.fromCartesian(result.data[i]);
            start.longitude = StampGis.StampMath.toDegrees(start.longitude);
            start.latitude = StampGis.StampMath.toDegrees(start.latitude);

            pointsStr += start.longitude + "," + start.latitude + ",";
            pointsStr2 += start.longitude + "," + start.latitude + "," + "0,";
          }
          pointsStr = pointsStr.substr(0, pointsStr.length - 1);
          pointsStr2 = pointsStr2.substr(0, pointsStr2.length - 1);

          demIdArr = [];
          getDemLayerData(earth.document.rootFolder);
          var layerids = demIdArr.join(',');
          var params = "&layer=" + layerids + "&aparam=" + alt + "," + pointsStr;
          surfaceExcavationAndFillRequest(params).then(resp => {
            var rawbuffer = new RawBuffer(resp.data);
            var alllength = rawbuffer.readInt32();
            var name_len = 25;
            var type = rawbuffer.readBuf(name_len);
            var exca = rawbuffer.readFloat64();
            var fill = rawbuffer.readFloat64();
            callback(exca.toFixed(2), fill.toFixed(2), pointsStr2);
          }).catch(err => {
            vueObj.$message({
              message: err,
              type: 'error',
              center: true
            });
            // alert('console.error();')
          });
        } else {
          earth.ShapeCreator.Clear();
        }
      }
    });
  } else if (type == 2) {
    earth.ShapeCreator.CreatePolyline({
      custom_excute_finish: function (result) {
        if (result.data != undefined && result.data.length >= 2) {
          var sphrArray = new Array()
          var pointsStr = "";
          var pointsStr2 = ""
          for (var i = 0; i < result.data.length; i++) {
            sphrArray[i] = StampGis.Cartographic.fromCartesian(result.data[i])
            sphrArray[i].longitude = StampGis.StampMath.toDegrees(sphrArray[i].longitude)
            sphrArray[i].latitude = StampGis.StampMath.toDegrees(sphrArray[i].latitude)
            // pointsStr += sphrArray[i].longitude + "," + sphrArray[i].latitude + ",";
            // pointsStr2 += sphrArray[i].longitude + "," + sphrArray[i].latitude + "," + "0,";
          }
          var polygonArray = earth.GeometryAlgorithm.CreatePolygonBufferFromPolyline(sphrArray, radius, 1, 36)
          var inPointArrays = new Array();
          for (var i = 0; i < polygonArray.length - 1; i++) {
            sphrArray[i] = StampGis.Cartesian3.fromDegrees(polygonArray[i].longitude, polygonArray[i].latitude, polygonArray[i].height)
            inPointArrays.push(sphrArray[i])
          }
          clip_guid = earth.TerrainManager.ClipTerrainByPolygon([inPointArrays], alt, checkmodel);
          earth.ShapeCreator.Clear();

          for (var j = 0; j < polygonArray.length; j++) {
            var start = polygonArray[j]
            pointsStr += start.longitude + "," + start.latitude + ",";
            pointsStr2 += start.longitude + "," + start.latitude + "," + "0,";
          }
          pointsStr = pointsStr.substr(0, pointsStr.length - 1);
          pointsStr2 = pointsStr2.substr(0, pointsStr2.length - 1);

          demIdArr = [];
          getDemLayerData(earth.document.rootFolder);
          var layerids = demIdArr.join(',');
          var params = "&layer=" + layerids + "&aparam=" + alt + "," + pointsStr;
          surfaceExcavationAndFillRequest(params).then(resp => {
            var rawbuffer = new RawBuffer(resp.data);
            var alllength = rawbuffer.readInt32();
            var name_len = 25;
            var type = rawbuffer.readBuf(name_len);
            var exca = rawbuffer.readFloat64();
            var fill = rawbuffer.readFloat64();
            callback(exca.toFixed(2), fill.toFixed(2), pointsStr2);
          }).catch(err => {
            vueObj.$message({
              message: err,
              type: 'error',
              center: true
            });
            // alert('console.error();')
          });
        } else {
          earth.ShapeCreator.Clear();
        }
      }
    });
  }

}

AnalysisControl.clipByPoints = function (earth, points, alt, checkmodel, callback) {
  var inPointArrays = new Array();
  inPointArrays.push(points);
  clip_guid = earth.TerrainManager.ClipTerrainByPolygon(inPointArrays, alt, checkmodel);
  clip_flag = true;

  var pointsStr = "";
  for (var i = 0; i < points.length; i++) {
    var start = StampGis.Cartographic.fromCartesian(points[i]);
    start.longitude = StampGis.StampMath.toDegrees(start.longitude);
    start.latitude = StampGis.StampMath.toDegrees(start.latitude);

    pointsStr += start.longitude + "," + start.latitude + ",";
  }
  pointsStr = pointsStr.substr(0, pointsStr.length - 1);

  demIdArr = [];
  getDemLayerData(earth.document.rootFolder);
  var layerids = demIdArr.join(',');

  var self = this;
  var params = "&layer=" + layerids + "&aparam=" + alt + "," + pointsStr;
  surfaceExcavationAndFillRequest(params).then(resp => {
    var rawbuffer = new RawBuffer(resp.data);
    var alllength = rawbuffer.readInt32();
    var name_len = 25;
    var type = rawbuffer.readBuf(name_len);
    var exca = rawbuffer.readFloat64();
    var fill = rawbuffer.readFloat64();
    callback(exca.toFixed(2), fill.toFixed(2));
  }).catch(err => {
    self.$message({
      message: err,
      type: 'error',
      center: true
    });
  });
}

AnalysisControl.clear_clip = function (earth) {
  //清除挖方效果
  if (clip_guid != undefined) {
    earth.TerrainManager.Clear(clip_guid);
    clip_guid = undefined;
  }
}

var terrain_smooth_guid = undefined;
var terrain_smooth_inPointArrays = undefined;
AnalysisControl.terrainSmooth = function (earth, inputValue, callback) {
  this.terrainSmoothClear(earth);
  earth.ShapeCreator.CreatePolygon({
    custom_excute_finish: function (result) {
      if (result.data != undefined && result.data.length >= 3) {
        terrain_smooth_inPointArrays = new Array();
        terrain_smooth_inPointArrays.push(result.data);
        var value = Number(inputValue);
        terrain_smooth_guid = earth.TerrainManager.ClipTerrainByPolygon(terrain_smooth_inPointArrays, value, true);
        earth.ShapeCreator.Clear();
        callback(true);
      } else {
        vueobj.$message({
          message: '请至少绘制三个点创建多边形',
          type: 'warning',
          center: true
        });
        earth.ShapeCreator.Clear();
        terrain_smooth_inPointArrays = undefined;
        callback(false);
      }
    }
  });
}

AnalysisControl.terrainSmoothByPoints = function (earth, inputValue) {
  this.terrainSmoothClear(earth);
  var value = Number(inputValue);
  if (terrain_smooth_inPointArrays) {
    terrain_smooth_guid = earth.TerrainManager.ClipTerrainByPolygon(terrain_smooth_inPointArrays, value, true);
  }
}

AnalysisControl.terrainSmoothClear = function (earth) {
  if (terrain_smooth_guid != undefined) {
    earth.TerrainManager.Clear(terrain_smooth_guid);
    terrain_smooth_guid = undefined;
  }
}

AnalysisControl.clear_terrainSmooth = function (earth) {
  //清除地形平整
  this.terrainSmoothClear(earth);
  terrain_smooth_inPointArrays = undefined;
}

AnalysisControl.getAltitude = function (earth, callback) {
  earth.ShapeCreator.CreatePoint({
    custom_excute_finish: function (result) {
      if (result.data != undefined) {
        var cartographic = StampGis.Cartographic.fromCartesian(result.data);
        callback(cartographic.height.toFixed(2));
      }

      earth.ShapeCreator.Clear();
    }
  });
}

AnalysisControl.measure_height = function (earth, callback) {
  earth.Measure.MeasureHeight({
    custom_excute_finish: function (result) {
      if (result.height != undefined) {
        callback(result.height.toFixed(2));
        earth.Measure.Clear();
      } else {
        earth.Measure.Clear();
      }
    }
  });
}

AnalysisControl.measure_insolation = function (earth, month, day, beginNum, endNum, acc, resultCount, singlePoint, stepNum, callback) {
  earth.Measure.Insolation({
    month: month,
    day: day,
    begin: beginNum,
    end: endNum,
    acc: acc,
    resultCount: resultCount,
    singlePoint: singlePoint,
    step: stepNum,
    custom_excute_finish: function (result) {
      if (result && result.result) {
        var totalMins = result.result * 60;
        totalMins = Math.ceil(totalMins);
        callback(false, totalMins);
      } else {
        earth.Measure.Clear();
        callback(true, "");
      }
    }
  });
}

AnalysisControl.clear_measure = function (earth) {
  //清除日照分析结果
  earth.Measure.Clear();
}

AnalysisControl.measure_slope_angle = function (earth) {
  earth.Measure.MeasureSlopeAngle({
    custom_excute_finish: function (result) {
      if (result != undefined) {

      } else {
        earth.Measure.Clear();
      }
    }
  });
}

AnalysisControl.measure_horizontal_angle = function (earth) {
  earth.Measure.MeasureHorizontalAngle({
    custom_excute_finish: function (result) {
      if (result.area != undefined) {

      } else {
        earth.Measure.Clear();
      }
    }
  });
}

var polygons_show = [];
var slide_land_set = [];
var callback_slideLand = null;
var fill_color = 0xaa00ff00;
var excavate_color = 0xaaff00ff;
var layerids_slideLand = "";
AnalysisControl.slide_land_and_fill = function (earth, layerids, excavateColor, fillColor, callback) {
  usearth = earth;
  layerids_slideLand = layerids;
  excavate_color = Number("0xaa" + excavateColor.substr(1));
  fill_color = Number("0xaa" + fillColor.substr(1));
  callback_slideLand = callback;
  earth.ShapeCreator.CreatePolygon({
    custom_excute_finish: function (result) {

      if (result.data != undefined) {
        var polygon = earth.Factory.CreateElementPolygon({
          name: "testPolygon",
          doc: earth.document
        });
        polygon.BeginUpdate();
        polygon.SetExteriorRing(result.data);
        polygon.set_altitude_type(1);
        polygon.lineColor = 0xaaffff00;
        polygon.lineWidth = 2.0;
        polygon.fillColor = 0x10ffff00;
        polygon.EndUpdate();
        earth.document.elementRoot.attach_object(polygon);
        earth.document.register_object(polygon);
        polygons_show.push(polygon);

        slide_land_set = [];
        for (var i = 0; i < result.data.length; i++) {
          var pos = StampGis.Cartographic.fromCartesian(result.data[i]);
          pos.longitude = StampGis.StampMath.toDegrees(pos.longitude);
          pos.latitude = StampGis.StampMath.toDegrees(pos.latitude);
          slide_land_set.push(pos);
        }

        var mission = earth.Analysis.SlideLandeMission_Step1({
          layers: layerids_slideLand,
          point_array: slide_land_set,
          custom_analysis_finish: slidelande_analysis_finish,
          doc: earth.document
        });
        mission_list[mission] = mission;
        earth.ShapeCreator.Clear();
      } else {
        earth.ShapeCreator.Clear();
      }
    }
  });
}

function create_up_polygon(sequence) {
  var name_str = "Up";
  name_str += sequence;
  var polygon = usearth.Factory.CreateElementPolygon({
    name: name_str,
    doc: usearth.document
  });

  return polygon;
}

function create_down_polygon(sequence) {
  var name_str = "Down";
  name_str += sequence;
  var polygon = usearth.Factory.CreateElementPolygon({
    name: name_str,
    doc: usearth.document
  });

  return polygon;
}

function slidelande_analysis_finish(result) {
  if (result.ret_id in mission_list) {
    var up_polygons = result.up_data;
    var down_polygons = result.down_data;

    for (var i = 0; i < up_polygons.length; i++) {

      var convert = [];
      for (var j = 0; j < up_polygons[i].length; j++) {
        var position = StampGis.Cartesian3.fromRadians(up_polygons[i][j].x, up_polygons[i][j].y, 100.0);
        convert.push(position);
      }
      var polygon = create_up_polygon(i);
      polygon.BeginUpdate();
      polygon.SetExteriorRing(convert);
      polygon.set_altitude_type(1);
      polygon.lineColor = fill_color;
      polygon.lineWidth = 2.0;
      polygon.fillColor = fill_color;
      polygon.EndUpdate();
      usearth.document.elementRoot.attach_object(polygon);
      usearth.document.register_object(polygon);
      polygons_show.push(polygon);
    }


    for (var i = 0; i < down_polygons.length; i++) {
      var convert = [];
      for (var j = 0; j < down_polygons[i].length; j++) {
        var position = StampGis.Cartesian3.fromRadians(down_polygons[i][j].x, down_polygons[i][j].y, 100.0);
        convert.push(position);
      }
      var polygon = create_down_polygon(i);
      polygon.BeginUpdate();
      polygon.SetExteriorRing(convert);
      polygon.set_altitude_type(1);
      polygon.lineColor = excavate_color;
      polygon.lineWidth = 2.0;
      polygon.fillColor = excavate_color;
      polygon.EndUpdate();
      usearth.document.elementRoot.attach_object(polygon);
      usearth.document.register_object(polygon);
      polygons_show.push(polygon);
    }

    var mission = usearth.Analysis.SlideLandeMission_Step2({
      layers: layerids_slideLand,
      point_array: slide_land_set,
      custom_analysis_finish: slidelande_step2_analysis_finish,
      doc: usearth.document
    });
    mission_list[mission] = mission;
  }
}

function slidelande_step2_analysis_finish(result) {
  if (result.ret_id in mission_list) {
    var fill_area = result.fill_area.toFixed(2);
    var fill_volume = result.fill_volume.toFixed(2);
    var excavate_area = result.excavate_area.toFixed(2);
    var excavate_volume = result.excavate_volume.toFixed(2);

    if (callback_slideLand) {
      callback_slideLand(fill_area, fill_volume, excavate_area, excavate_volume);
    }
  }
}

function showDemArea(earth, id) {
  var layer = earth.LayerManager.GetLayerByGUID(id);

  var arr = [];
  var mid = new StampGis.Cartographic(layer._bound.east, layer._bound.north, 0);
  arr.push(StampGis.Cartographic.toCartesian(mid));
  mid = new StampGis.Cartographic(layer._bound.east, layer._bound.south, 0);
  arr.push(StampGis.Cartographic.toCartesian(mid));
  mid = new StampGis.Cartographic(layer._bound.west, layer._bound.south, 0);
  arr.push(StampGis.Cartographic.toCartesian(mid));
  mid = new StampGis.Cartographic(layer._bound.west, layer._bound.north, 0);
  arr.push(StampGis.Cartographic.toCartesian(mid));
  mid = new StampGis.Cartographic(layer._bound.east, layer._bound.north, 0);
  arr.push(StampGis.Cartographic.toCartesian(mid));

  var line = earth.Factory.CreateElementLine({
    name: "testPolyline",
    doc: earth.document
  });
  line.BeginUpdate();
  line.SetPointArray(arr);
  line.set_altitude_type(1);
  line.lineColor = 0xffff0000;
  line.EndUpdate();
  earth.document.elementRoot.attach_object(line);
  earth.document.register_object(line);

  return line;
}

var lineBefore = null;
var lineAfter = null;
AnalysisControl.showBeforeDem = function (earth, id) {
  if (lineBefore) {
    earth.document.elementRoot.attach_object(lineBefore);
  } else {
    lineBefore = showDemArea(earth, id);
  }
}

AnalysisControl.showAfterDem = function (earth, id) {
  if (lineAfter) {
    earth.document.elementRoot.attach_object(lineAfter);
  } else {
    lineAfter = showDemArea(earth, id);
  }
}

AnalysisControl.hideBeforeDem = function (earth) {
  if (lineBefore) {
    earth.document.elementRoot.detach_object(lineBefore);
  }
}

AnalysisControl.hideAfterDem = function (earth) {
  if (lineAfter) {
    earth.document.elementRoot.detach_object(lineAfter);
  }
}

AnalysisControl.clear_landSlide = function (earth) {
  //清除滑坡分析结果
  for (var i = 0; i < polygons_show.length; i++) {
    earth.document.elementRoot.detach_object(polygons_show[i]);
  }
  polygons_show = [];

  if (lineBefore) {
    earth.document.elementRoot.detach_object(lineBefore);
    lineBefore = null;
  }

  if (lineAfter) {
    earth.document.elementRoot.detach_object(lineAfter);
    lineAfter = null;
  }
}

function parse_binary_interior(rawbuffer) {
  var vecbegin = new StampGis.Cartesian3(rawbuffer.readFloat64(), rawbuffer.readFloat64(), rawbuffer.readFloat64());
  var vecend = new StampGis.Cartesian3(rawbuffer.readFloat64(), rawbuffer.readFloat64(), rawbuffer.readFloat64());

  var maxheight = rawbuffer.readFloat64();
  var minheight = rawbuffer.readFloat64();

  var interval_num = rawbuffer.readInt32();

  var vec = [];
  var slopevec = [];
  if (interval_num > 0) {
    for (var i = 0; i < interval_num; i++) {
      var vec_data = new StampGis.Cartesian3(rawbuffer.readFloat64(), rawbuffer.readFloat64(), rawbuffer.readFloat64());
      vec.push(vec_data);
      var slopevec_data = rawbuffer.readFloat64();
      slopevec.push(slopevec_data);
    }
  }

  var maxslope = rawbuffer.readFloat64();
  var minslope = rawbuffer.readFloat64();
  var maxbegin = new StampGis.Cartesian3(rawbuffer.readFloat64(), rawbuffer.readFloat64(), rawbuffer.readFloat64());
  var maxend = new StampGis.Cartesian3(rawbuffer.readFloat64(), rawbuffer.readFloat64(), rawbuffer.readFloat64());
  var minbegin = new StampGis.Cartesian3(rawbuffer.readFloat64(), rawbuffer.readFloat64(), rawbuffer.readFloat64());
  var minend = new StampGis.Cartesian3(rawbuffer.readFloat64(), rawbuffer.readFloat64(), rawbuffer.readFloat64());

  var xData = [];
  var yData = [];
  var pointArr = [];
  var xml = "";
  xml += "<begin>" + vecbegin.x.toString() + "," + vecbegin.y.toString() + "," + vecbegin.z.toString() + "</begin>\n";
  xml += "<end>" + vecend.x.toString() + "," + vecend.y.toString() + "," + vecend.z.toString() + "</end>\n";
  xml += "<max_height>" + maxheight.toString() + "</max_height>\n";
  xml += "<min_height>" + minheight.toString() + "</min_height>\n";
  xml += "<point_number>" + interval_num.toString() + "</point_number>\n";
  xml += "<point_array>";
  if (interval_num > 0) {
    xData.push(1);
    yData.push(vec[0].z);
    pointArr.push(vec[0].x.toString() + "," + vec[0].y.toString() + "," + vec[0].z.toString());
    xml += vec[0].x.toString() + "," + vec[0].y.toString() + "," + vec[0].z.toString() + "," + slopevec[0].toString();
    for (var i = 1; i < interval_num; i++) {
      xData.push(i + 1);
      yData.push(vec[i].z);
      pointArr.push(vec[i].x.toString() + "," + vec[i].y.toString() + "," + vec[i].z.toString());
      xml += "," + vec[i].x.toString() + "," + vec[i].y.toString() + "," + vec[i].z.toString() + "," + slopevec[i].toString();
    }
  }

  xml += "</point_array>\n";
  xml += "<slope>\n";
  xml += "<max>" + maxslope.toString() + "</max>\n";
  xml += "<maxbegin>" + maxbegin.x.toString() + "," + maxbegin.y.toString() + "," + maxbegin.z.toString() + "</maxbegin>\n";
  xml += "<maxend>" + maxend.x.toString() + "," + maxend.y.toString() + "," + maxend.z.toString() + "</maxend>\n";
  xml += "<min>" + minslope.toString() + "</min>\n";
  xml += "<minbegin>" + minbegin.x.toString() + "," + minbegin.y.toString() + "," + minbegin.z.toString() + "</minbegin>\n";
  xml += "<minend>" + minend.x.toString() + "," + minend.y.toString() + "," + minend.z.toString() + "</minend>\n";
  xml += "</slope>\n";

  if (callback_profile && xData.length > 0 && yData.length > 0) {
    callback_profile(xData, yData, pointArr);
  }
  return xml;
}

function parse_binary_single(rawbuffer) {
  var alllength = rawbuffer.readInt32();

  var name_len = 25;
  var type = rawbuffer.readBuf(name_len);

  var xml = "<?xml version='1.0' encoding='gb2312'?>\n<xml>\n";
  var ret = parse_binary_interior(rawbuffer);
  if (ret != null) {
    xml += ret;
  }
  xml += "</xml>";
  return xml;
}

var parse_data = function (arrayBuffer) {
  var rawbuffer = new RawBuffer(arrayBuffer);

  var ret = parse_binary_single(rawbuffer);

  var ret_info = {
    //layer:this.edit_layer,
    xml: ret,
    ret_id: "0000",
  };

  return ret_info;
}

var profile_line = null;
var callback_profile = null;
AnalysisControl.profile = function (earth, interval, callback) {
  var self = this;
  earth.ShapeCreator.CreatePolyline({
    custom_excute_finish: function (result) {
      if (result.data != undefined && result.data.length >= 2) {
        profile_line = earth.Factory.CreateElementLine({
          name: "testPolyline",
          doc: earth.document
        });
        profile_line.BeginUpdate();
        profile_line.SetPointArray(result.data);
        profile_line.set_altitude_type(1);
        profile_line.lineColor = 0xffff0000;
        profile_line.EndUpdate();
        earth.document.elementRoot.attach_object(profile_line);
        earth.document.register_object(profile_line);
        earth.ShapeCreator.Clear();

        var pointsStr = "";
        for (var i = 0; i < result.data.length; i++) {
          var start = StampGis.Cartographic.fromCartesian(result.data[i]);
          start.longitude = StampGis.StampMath.toDegrees(start.longitude);
          start.latitude = StampGis.StampMath.toDegrees(start.latitude);
          pointsStr += "," + start.longitude + "," + start.latitude + "," + start.height;
        }

        demIdArr = [];
        getDemLayerData(earth.document.rootFolder);
        var layerids = demIdArr.join(',');

        //todo: 采样间距计算
        var params = "layer=" + layerids + "&aparam=1," + interval + pointsStr;
        profieRequest(params).then(resp => {
          callback_profile = callback;
          parse_data(resp.data);
        }).catch(err => {
          self.$message({
            message: err,
            type: 'error',
            center: true
          });
        });
      } else {
        API.usearth.ShapeCreator.Clear();
      }
    }
  });
}

AnalysisControl.clear_profile = function (earth) {
  //清除地形剖面
  if (profile_line) {
    earth.document.elementRoot.detach_object(profile_line);
    profile_line = null;
    callback_profile = null;
  }
}

var contourLayer = undefined;
AnalysisControl.contour_analysis = function (earth, color, stride) {
  earth.ShapeCreator.CreatePolygon({
    custom_excute_finish: function (result) {
      if (result.data != undefined && result.data.length >= 2) {
        contourLayer = earth.Factory.CreateContourLayer({
          doc: earth.document,
          domCoverage: earth.document.globe.domCoverage
        });
        contourLayer.color = Number("0xff" + color.substr(1));
        contourLayer.stride = Number(stride);
        contourLayer.set_coord_array(result.data);
        earth.document.globe.attach_object(contourLayer);
        earth.ShapeCreator.Clear();
      } else {
        earth.ShapeCreator.Clear();
      }
    }
  });
}

AnalysisControl.clear_contour_analysis = function (earth) {
  //清除等高线
  if (contourLayer != undefined) {
    earth.document.globe.detach_object(contourLayer);
    contourLayer = undefined;
  }
}

var polygonHuiShui = null;
AnalysisControl.slope_direct = function (earth, color) {
  earth.ShapeCreator.CreatePolygon({
    custom_excute_finish: function (result) {
      if (result.data != undefined) {
        var slope_direction_set = [];
        for (var i = 0; i < result.data.length; i++) {
          slope_direction_set.push(result.data[i]);
        }
        var name_str = "SlopeDirect";

        polygonHuiShui = earth.Factory.CreateElementSlopeDirectionPolygon({
          name: name_str,
          doc: earth.document
        });
        polygonHuiShui.BeginUpdate();
        polygonHuiShui.SetExteriorRing(slope_direction_set);
        polygonHuiShui.set_altitude_type(1);
        polygonHuiShui.lineColor = 0xaaffff00;
        polygonHuiShui.lineWidth = 1.0;
        polygonHuiShui.fillColor = Number("0xaa" + color.substr(1));
        polygonHuiShui.EndUpdate();
        earth.document.elementRoot.attach_object(polygonHuiShui);
        earth.document.register_object(polygonHuiShui);

        earth.ShapeCreator.Clear();
      } else {
        earth.ShapeCreator.Clear();
      }
    }
  });
}

AnalysisControl.clear_slope_direct = function (earth) {
  //清除汇水分析效果
  if (polygonHuiShui) {
    earth.document.elementRoot.detach_object(polygonHuiShui);
    polygonHuiShui = null;
  }
}

var g_red_line = undefined;
var g_red_buffer = undefined;
var g_red_building_parts = undefined;
AnalysisControl.back_red_line = function (earth, distance, color) {
  if (g_red_building_parts != undefined) {
    earth.document.elementRoot.detach_object(g_red_building_parts);
    g_red_building_parts = undefined;
  }
  if (g_red_buffer != undefined) {
    earth.document.elementRoot.detach_object(g_red_buffer);
    g_red_buffer = undefined;
  }
  if (g_red_line != undefined) {
    earth.document.elementRoot.detach_object(g_red_line);
    g_red_line = undefined;
  }
  earth.ShapeCreator.CreatePolyline({
    custom_excute_finish: function (result1) {
      if (result1.data != undefined && result1.data.length >= 2) {
        var radius = Number(distance);
        var fillcolor = Number("0x99" + color.substr(1));

        g_red_line = earth.Factory.CreateElementLine({
          name: "testPolyline",
          doc: earth.document
        });
        g_red_line.BeginUpdate();
        g_red_line.SetPointArray(result1.data);
        g_red_line.set_altitude_type(1);
        g_red_line.lineColor = 0xffff0000;
        g_red_line.EndUpdate();
        earth.document.elementRoot.attach_object(g_red_line);
        earth.document.register_object(g_red_line);

        var sphrArray = g_red_line.GetPointArray();
        var polygonArray = earth.GeometryAlgorithm.CreatePolygonBufferFromPolyline(sphrArray, radius, 1, 36);

        var polygon = earth.Factory.CreateElementPolygon({
          name: "testPolygon",
          doc: earth.document
        });

        polygon.BeginUpdate();
        polygon.SetExteriorRing(polygonArray, false);
        polygon.altitudeType = 1;
        polygon.lineColor = fillcolor;
        polygon.lineWidth = 1.0;
        polygon.fillColor = fillcolor;
        polygon.EndUpdate();
        earth.document.elementRoot.attach_object(polygon);
        earth.document.register_object(polygon);
        g_red_buffer = polygon;

        var red_line = [];
        for (var i = 0; i < result1.data.length; ++i) {
          red_line.push(StampGis.Cartographic.fromCartesian(result1.data[i]));
          red_line[i].longitude = StampGis.StampMath.toDegrees(red_line[i].longitude);
          red_line[i].latitude = StampGis.StampMath.toDegrees(red_line[i].latitude);
        }
        var redPart = earth.Factory.CreateBackRedLine({
          red_line: red_line,
          fill_color: 0x99FF0000,
          radius: radius,
          top_type: 1,
          num: 36,
          out_type: 0,
          document: earth.document
        });
        earth.document.elementRoot.attach_object(redPart);
        earth.document.register_object(redPart);
        g_red_building_parts = redPart;
        earth.ShapeCreator.Clear();
      } else {
        earth.ShapeCreator.Clear();
      }
    }
  });
}

AnalysisControl.clear_back_redline = function (earth) {
  //退线分析
  if (g_red_building_parts != undefined) {
    earth.document.elementRoot.detach_object(g_red_building_parts);
    g_red_building_parts = undefined;
  }
  if (g_red_buffer != undefined) {
    earth.document.elementRoot.detach_object(g_red_buffer);
    g_red_buffer = undefined;
  }
  if (g_red_line != undefined) {
    earth.document.elementRoot.detach_object(g_red_line);
    g_red_line = undefined;
  }
}

var g_height_limited = undefined;
var g_height_limited_polygon = undefined;
var g_height = 0.0;
AnalysisControl.height_limited = function (earth, color, height, speed, highlightcolor) {
  earth.ShapeCreator.CreatePolygon({
    custom_excute_finish: function (result1) {
      if (result1.data != undefined && result1.data.length >= 2) {
        var fillcolor = Number("0x99" + color.substr(1));
        var limitColor = Number("0x99" + highlightcolor.substr(1))
        var points = [];
        for (var i = 0; i < result1.data.length; i++) {
          var start = StampGis.Cartographic.fromCartesian(result1.data[i]);
          points.push(start);
        }

        var promise = earth.document.get_batch_dem_height_from_server(points);
        if (promise == undefined) {
          return;
        }

        StampGis.when(promise, function () {
        }).then(function () {
          var max_height = points[0].height;
          for (var i = 0; i < points.length; i++) {
            if (max_height < points[i].height) {
              max_height = points[i].height;
            }
          };

          for (var i = 0; i < points.length; i++) {
            points[i] = StampGis.Cartesian3.fromRadians(points[i].longitude, points[i].latitude, max_height);
          }

          var polygon = earth.Factory.CreateElementPolygon({
            name: "testPolygon",
            doc: earth.document
          });

          polygon.BeginUpdate();
          polygon.SetExteriorRing(points);
          polygon.altitudeType = 0;
          polygon.lineColor = fillcolor;
          polygon.lineWidth = 1.0;
          polygon.fillColor = fillcolor;
          polygon.EndUpdate();
          earth.document.elementRoot.attach_object(polygon);
          earth.document.register_object(polygon);
          g_height_limited_polygon = polygon;

          var heightLimited = earth.Factory.CreateHeightLimited({
            polygon: points,
            fill_color: limitColor,
            document: earth.document
          });
          heightLimited.height = 0;
          earth.document.elementRoot.attach_object(heightLimited);
          earth.document.register_object(heightLimited);
          g_height_limited = heightLimited;
          earth.ShapeCreator.Clear();

          var interval = setInterval(function () {
            if (g_height > Number(height)) {
              clearInterval(interval);
              return;
            }
            if (!g_height_limited) {
              return;
            }

            var per = Number(speed) * 0.5;
            g_height_limited.height = g_height;


            if (g_height_limited_polygon != undefined) {
              var location = g_height_limited_polygon.transform.get_position_sphr();
              location.height = g_height + max_height;
              g_height_limited_polygon.BeginUpdate();
              g_height_limited_polygon.transform.set_position_sphr(location);
              g_height_limited_polygon.EndUpdate();
            }

            g_height += per;
          }, 500);
        });
      } else {
        earth.ShapeCreator.Clear();
      }
    }
  });
}

AnalysisControl.clear_height_limited = function (earth) {
  if (g_height_limited != undefined) {
    earth.document.elementRoot.detach_object(g_height_limited);
    g_height_limited = undefined;
    g_height = 0.0;
  }
  if (g_height_limited_polygon != undefined) {
    earth.document.elementRoot.detach_object(g_height_limited_polygon);
    g_height_limited_polygon = undefined;
  }
}

var g_view_dome = undefined;
AnalysisControl.view_dome = function (earth, height, radius, visible, invisible, visibleColor, invisibleColor, callback) {
  earth.ShapeCreator.CreatePoint({
    custom_excute_finish: function (result1) {
      if (result1.data != undefined) {
        const loadingInstance1 = Loading.service({
          fullscreen: true,
          lock: true,
          text: 'Loading',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });

        var vcolor = Number("0x99" + visibleColor.substr(1));
        var invcolor = Number("0x99" + invisibleColor.substr(1));
        var center_sphr = StampGis.Cartographic.fromCartesian(result1.data);
        var longitude = StampGis.StampMath.toDegrees(center_sphr.longitude);
        var latitude = StampGis.StampMath.toDegrees(center_sphr.latitude);
        callback(longitude, latitude, center_sphr.height);
        center_sphr.height += Number(height);

        setTimeout(() => {
          var viewDome = earth.Factory.CreateViewDome({
            center: center_sphr,
            radius: Number(radius),
            segments: 24/*33*/,
            visibleColor: vcolor,
            invisibleColor: invcolor,
            document: earth.document
          });

          viewDome.invisibleArea = invisible;
          viewDome.visibleArea = visible;
          earth.document.elementRoot.attach_object(viewDome);
          earth.document.register_object(viewDome);
          g_view_dome = viewDome;

          loadingInstance1.close();
        }, 100);

        earth.ShapeCreator.Clear();
      } else {
        earth.ShapeCreator.Clear();
      }
    }
  });
}

AnalysisControl.clear_view_dome = function (earth) {
  if (g_view_dome != undefined) {
    earth.document.elementRoot.detach_object(g_view_dome);
    g_view_dome = undefined;
  }
}

var g_terrain_guid = undefined;
AnalysisControl.sub_scene = function (earth) {
  earth.ShapeCreator.CreatePolygon({
    custom_excute_finish: function (result) {
      if (result.data != undefined && result.data.length >= 2) {
        var inPointArrays = new Array();
        inPointArrays.push(result.data);
        g_terrain_guid = earth.TerrainManager.GetTerrainByPolygon(inPointArrays, 0.0);
        earth.ShapeCreator.Clear();
      } else {
        earth.ShapeCreator.Clear();
      }
    }
  });
}

AnalysisControl.clear_else = function (earth) {
  if (g_terrain_guid != undefined) {
    earth.TerrainManager.Clear(g_terrain_guid);
    g_terrain_guid = undefined;
  }
  earth.Measure.Clear(); //坡度、坡向清除
}

var terrain_tunnel_guid = undefined;
AnalysisControl.tunnel_excavation = function (earth, type, width, height, depth, altitude) {
  type = Number(type); // 0圆形 1拱形 2方形,3半圆
  width = Number(width); // 半径或宽度
  height = Number(height);
  depth = Number(depth);
  altitude = Number(altitude);

  earth.ShapeCreator.CreatePolyline({
    custom_excute_finish: function (result) {
      if (result.data != undefined && result.data.length >= 2) {
        // 转化弧度
        var lines = [];
        for (var i = 0; i < result.data.length; ++i) {
          lines.push(StampGis.Cartographic.fromCartesian(result.data[i]));
          lines[i].height = altitude;
        }

        terrain_tunnel_guid = earth.TerrainManager.excavateTerrainTunnel({
          lines: lines,
          type: type,
          width: width,
          height: height,
          depth: depth
        });

        earth.ShapeCreator.Clear();
      } else {
        earth.ShapeCreator.Clear();
      }
    }
  });
}

AnalysisControl.clear_tunnel_excavation = function (earth) {
  //清除地形隧道
  if (terrain_tunnel_guid != undefined) {
    earth.TerrainManager.Clear(terrain_tunnel_guid);
    terrain_tunnel_guid = undefined;
  }
}

function start(analysis, area_points, startTime, endTime, verticalSpace, horizontalSpace, timeInterval, bottom, extend, type, segments) {
  analysis.startTime = StampGis.JulianDate.fromDate(startTime);

  analysis.endTime = StampGis.JulianDate.fromDate(endTime);
  //设置垂直（高）采样个数
  analysis.verticalSpace = verticalSpace;
  //设置水平采样个数
  analysis.horizontalSpace = horizontalSpace;
  //设置阴影移动间隔，单位分钟
  analysis.timeInterval = timeInterval;

  // 相关参数设置
  if (type == 1) {
    analysis.mode = 1; // 0 点模式 1栅格模式
    analysis.filter = [0.3, 0.5, 0.8, 1.0];
    var colorSegment = {};// 颜色分段0——1.0之间（1.0代表强光照）
    // for(var item in segments){
    //     colorSegment[segments[item].seg] = Number("0x" + segments[item].color.substr(1));
    // }
    colorSegment[0.0] = 0xFF00FF00;// 0.0~0.5
    colorSegment[0.5] = 0xFF00FF00;// 0.5~0.6
    colorSegment[0.6] = 0xFF00FF00;//0.6~1.0
    analysis.colorSegment = colorSegment;
  }

  var options = {
    positions: area_points,//设置分析的区域
    bottom: bottom,//设置底部开始高度
    extend: extend, //设置接收阴影高度
  };
  analysis.analysis(options)
}

var g_shadow_rate = undefined;
AnalysisControl.shadow_rate = function (earth, startTime, endTime, verticalSpace, horizontalSpace, timeInterval, bottom, extend, type, segments) {
  earth.application.frameState.always_calculate_matrix = true;

  earth.ShapeCreator.CreatePolygon({
    custom_excute_finish: function (result) {
      if (result.data != undefined && result.data.length >= 2) {
        var shadow_analy = earth.Factory.CreateShadowRate({
          application: earth.application,
          region: result.data
        });
        //设置阴影开始时间
        var startTime1 = new Date();
        startTime1.setTime(startTime);
        //设置阴影结束时间
        var endTime1 = new Date();
        endTime1.setTime(endTime);
        start(shadow_analy, result.data, startTime1, endTime1, Number(verticalSpace), Number(horizontalSpace), Number(timeInterval), Number(bottom), Number(extend), Number(type), segments);

        earth.document.elementRoot.attach_object(shadow_analy);
        earth.document.register_object(shadow_analy);
        g_shadow_rate = shadow_analy;

        earth.ShapeCreator.Clear();
      } else {
        earth.ShapeCreator.Clear();
      }
    }
  });
}

AnalysisControl.cancel_shadow = function (earth) {
  earth.application.frameState.always_calculate_matrix = false;
  earth.application._view.shadowMap.enabled = false;
  if (g_shadow_rate != undefined) {
    g_shadow_rate.remove();
    earth.document.elementRoot.detach_object(g_shadow_rate);
    g_shadow_rate = undefined;
  }
}

export default AnalysisControl;



