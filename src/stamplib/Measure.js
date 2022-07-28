import { surfacearea } from '@/api/measure'
import pickPipeQuery from "@/stamplib/pickPipeQuery";

function Measure(earth, vueObj) {
  let demIdArr = [];
  this.vueObj = vueObj;
  this.usearth = earth
  this.notify = null
  this.attachObj = null

  this.$_pickPipeQuery = null;

  this.mHorizontalDist = function () {
    // 水平距离
    this.usearth.Measure.MeasureHorizontalDistance({
      custom_excute_finish: (result) => {
        if (result.length !== undefined && result.length !== 0) {
          this.notice(result.length, '水平距离:')
        } else {
          this.usearth.Measure.Clear()
          this.vueObj.$message({
            title: '警告',
            message: '请至少绘制两个点',
            type: 'warning',
          })
        }
      },
    })
  }
  this.mHeight = function () {
    // 垂直距离
    this.usearth.Measure.MeasureHeight({
      custom_excute_finish: (result) => {
        if (result.height !== undefined && result.length !== 0) {
          this.notice(result.height, '垂直距离:')
        } else {
          this.usearth.Measure.Clear()
          this.vueObj.$message({
            title: '警告',
            message: '请至少绘制两个点',
            type: 'warning',
          })
        }
      },
    })
  }
  this.mLineLength = function () {
    // 空间距离
    this.usearth.Measure.MeasureLineLength({
      custom_excute_finish: (result) => {
        if (result.length !== undefined && result.length !== 0) {
          this.notice(result.length, '空间距离:')
        } else {
          this.usearth.Measure.Clear()
          this.vueObj.$message({
            title: '警告',
            message: '请至少绘制两个点',
            type: 'warning',
          })
        }
      },
    })
  }
  this.mPathLength = function () {
    // 地表距离
    this.usearth.Measure.MeasurePathLength({
      custom_excute_finish: (result) => {
        if (result.length !== undefined && result.length !== 0) {
          this.notice(result.length, '地表距离:')
          if (result.line) {
            this.usearth.document.elementRoot.detach_object(result.line)
            this.usearth.Measure.Clear()
            var line = this.usearth.Factory.CreateElementLine({
              name: "mPathLength",
              doc: this.usearth.document,
            });
            line.BeginUpdate();
            line.SetPointArray(result.line.get_control_geometry_data().get_coordinates_geo()[0]);
            line.set_altitude_type(1);//贴地
            line.lineColor = 0xaaffff00;
            line.lineWidth = 1;
            line.drawOrder = 0;
            line.EndUpdate();
            this.usearth.document.elementRoot.attach_object(line);
            this.usearth.document.register_object(line);
            this.attachObj = line;
          }
        } else {
          this.usearth.document.elementRoot.detach_object(result.line)
          this.usearth.Measure.Clear()
          this.vueObj.$message({
            title: '警告',
            message: '请至少绘制两个点',
            type: 'warning',
          })
        }
      },
    })
  }
  this.mArea = function () {
    // 水平面积
    this.usearth.Measure.MeasureArea({
      custom_excute_finish: (result) => {
        if (result.area !== undefined) {
          if (result.points.length > 2) {
            this.notice(result.area, '水平面积:', '平方米')
            var polygon_area = this.usearth.Factory.CreateElementPolygon({
              name: 'AreaPolygon',
              doc: this.usearth.document,
            })
            polygon_area.BeginUpdate()
            polygon_area.SetExteriorRing(result.points)
            polygon_area.altitudeType = 5

            polygon_area.lineColor = 0xaaffff00
            polygon_area.lineWidth = 1.0
            polygon_area.fillColor = 0xaaff0000
            polygon_area.drawOrder = 0
            polygon_area.EndUpdate()
            this.usearth.document.elementRoot.attach_object(polygon_area)
            this.usearth.document.register_object(polygon_area)
            this.attachObj = polygon_area
          } else {
            this.vueObj.$message({
              title: '警告',
              message: '请至少绘制三个点',
              type: 'warning',
            })
          }
        } else {
          this.usearth.Measure.Clear()
        }
      },
    })
  }
  this.mSurfaceArea = function () {
    // 地表面积
    this.usearth.Measure.MeasureSurfaceArea({
      custom_excute_finish: (result) => {
        if (result.area) {
          if (result.points.length > 2) {
            demIdArr = [];
            getDemLayerData(this.usearth.document.rootFolder);
            const demGuid = demIdArr.join(',');
            let params = `layer=${demGuid}&aparam=`
            let points = result.points
            for (let data of points) {
              data = StampGis.Cartographic.fromCartesian(data)
              let longitude = StampGis.StampMath.toDegrees(data.longitude)
              let latitude = StampGis.StampMath.toDegrees(data.latitude)
              params = `${params}${longitude},${latitude},${data.height},`
            }
            params = params.slice(0, -1)
            surfacearea(params)
              .then((response) => {
                const view = new DataView(response.data)
                view.getFloat64(37, 8)
                this.notice(view.getFloat64(37, 8), '地表面积', '平方米')
              })
              .catch((error) => {
                this.message = this.vueObj.$message({
                  title: '错误',
                  message: '请求服务出错',
                  type: 'error',
                })
              })
            let polygon = this.usearth.Factory.CreateElementPolygon({
              name: 'mSurfaceArea',
              doc: this.usearth.document,
            })
            polygon.BeginUpdate()
            polygon.SetExteriorRing(result.points)
            polygon.altitudeType = 1
            polygon.lineColor = 0x99ffff00
            polygon.lineWidth = 0.5
            polygon.fillColor = 0x99ff0000
            polygon.drawOrder = 0
            polygon.EndUpdate()
            this.usearth.document.elementRoot.attach_object(polygon)
            this.usearth.document.register_object(polygon)
            this.usearth.ShapeCreator.Clear()
            this.attachObj = polygon
          } else {
            this.usearth.ShapeCreator.Clear()
            this.vueObj.$message({
              title: '警告',
              message: '请至少绘制三个点',
              type: 'warning',
            })
          }
        }
      },
    })
  }
  this.mSpatialArea = function () {
    // 空间面积
    this.usearth.Measure.MeasureSpatialArea({
      custom_excute_finish: (result) => {
        if (result.area !== undefined) {
          if (result.area !== 0) {
            this.notice(result.area, '空间面积:', '平方米')
          }
          if (result.points.length > 2) {
            var polygon_spatial = this.usearth.Factory.CreateElementPolygon({
              name: 'SpatialPolygon',
              doc: this.usearth.document,
            })
            polygon_spatial.BeginUpdate()
            polygon_spatial.SetExteriorRing(result.points)
            polygon_spatial.altitudeType = 0

            polygon_spatial.lineColor = 0xaaffff00
            polygon_spatial.lineWidth = 1.0
            polygon_spatial.fillColor = 0xaaff0000
            polygon_spatial.drawOrder = 0
            polygon_spatial.EndUpdate()
            this.attachObj = polygon_spatial
            this.usearth.document.elementRoot.attach_object(polygon_spatial)
            this.usearth.document.register_object(polygon_spatial)
          } else {
            this.vueObj.$message({
              title: '警告',
              message: '请至少绘制三个点',
              type: 'warning',
            })
          }
        } else {
          this.usearth.Measure.Clear()
        }
      },
    })
  }
  this.mPlaneAngle = function () {
    // 平面角度
    this.usearth.Measure.MeasurePlaneAngle({
      custom_excute_finish: (result) => {
        if (result.angle != undefined && result.angle != 0) {
          this.notice(result.angle, '平面角度', '°')
          if (result.plane != undefined) {
            this.attachObj = result.plane
            this.usearth.Measure.Clear()
          } else {
            this.usearth.Measure.Clear()
          }
        } else {
          this.usearth.Measure.Clear()
          if (result.plane) {
            this.usearth.document.elementRoot.detach_object(result.plane)
            this.vueObj.$message({
              title: '警告',
              message: '请至少绘制三个点',
              type: 'warning',
            })
          }
        }
      },
    })
  }

  this.lineSpacing = function () {
    let that = this;
    this.$_pickPipeQuery = new pickPipeQuery(vueObj, function (pipeObj1, pipeObj2) {
      let pipe1Ds1 = pipeObj1.ds;
      let pipe1Ds2 = pipeObj1.ds;
      const dsInd = pipeObj1.ds.indexOf("x");

      if (dsInd > -1) {
        pipe1Ds1 = pipe1Ds1.substring(0, dsInd);
        pipe1Ds2 = pipe1Ds2.substr(dsInd + 1);
      }
      pipe1Ds1 = Number(pipe1Ds1);
      pipe1Ds2 = Number(pipe1Ds2);

      let pipe2Ds1 = pipeObj2.ds;
      let pipe2Ds2 = pipeObj2.ds;
      const dsInd2 = pipeObj2.ds.indexOf("x");

      if (dsInd2 > -1) {
        pipe2Ds1 = pipe2Ds1.substring(0, dsInd2);
        pipe2Ds2 = pipe2Ds2.substr(dsInd2 + 1);
      }
      pipe2Ds1 = Number(pipe2Ds1);
      pipe2Ds2 = Number(pipe2Ds2);

      const line1 = [];
      line1[0] = {
        x: Number(pipeObj1.coorArr[0]),
        y: Number(pipeObj1.coorArr[1]),
        z: Number(pipeObj1.coorArr[2]),
      };
      line1[1] = {
        x: Number(pipeObj1.coorArr[3]),
        y: Number(pipeObj1.coorArr[4]),
        z: Number(pipeObj1.coorArr[5]),
      };
      const line2 = [];
      line2[0] = {
        x: Number(pipeObj2.coorArr[0]),
        y: Number(pipeObj2.coorArr[1]),
        z: Number(pipeObj2.coorArr[2]),
      };
      line2[1] = {
        x: Number(pipeObj2.coorArr[3]),
        y: Number(pipeObj2.coorArr[4]),
        z: Number(pipeObj2.coorArr[5]),
      };
      const geoAlg = new StampGis.SEGeometryAlgorithm()
      // 水平距离
      const outHor = geoAlg.CalculateLineLineDistance(line1, line2)
      if (outHor.m_dis !== undefined && outHor.m_dis !== 0) {
        const horDis = outHor.m_dis - (pipe1Ds1 + pipe2Ds1) / 2 * 0.001
        that.notice(horDis > 0 ? horDis : 0, '管线间水平距离:')

      } else {
        that.usearth.Measure.Clear()
        that.vueObj.$message({
          title: '警告',
          message: '结果为空',
          type: 'warning',
        })
      }
      that.$_pickPipeQuery.cancelPickQuery()
    })
  }

  this.verticalDistance = function () {
    let that = this;
    this.$_pickPipeQuery = new pickPipeQuery(vueObj, function (pipeObj1, pipeObj2) {
      let pipe1Ds1 = pipeObj1.ds;
      let pipe1Ds2 = pipeObj1.ds;
      const dsInd = pipeObj1.ds.indexOf("x");

      if (dsInd > -1) {
        pipe1Ds1 = pipe1Ds1.substring(0, dsInd);
        pipe1Ds2 = pipe1Ds2.substr(dsInd + 1);
      }
      pipe1Ds1 = Number(pipe1Ds1) * 0.001;
      pipe1Ds2 = Number(pipe1Ds2) * 0.001;

      let start1 = Number(pipeObj1.coorArr[2]);
      let end1 = Number(pipeObj1.coorArr[5]);
      if (pipeObj1.deepFormat == "0") {
        start1 = start1 - pipe1Ds2;
        end1 = end1 - pipe1Ds2;
      }

      let pipe2Ds1 = pipeObj2.ds;
      let pipe2Ds2 = pipeObj2.ds;
      const dsInd2 = pipeObj2.ds.indexOf("x");

      if (dsInd2 > -1) {
        pipe2Ds1 = pipe2Ds1.substring(0, dsInd2);
        pipe2Ds2 = pipe2Ds2.substr(dsInd2 + 1);
      }
      pipe2Ds1 = Number(pipe2Ds1) * 0.001;
      pipe2Ds2 = Number(pipe2Ds2) * 0.001;

      let start2 = Number(pipeObj2.coorArr[2]);
      let end2 = Number(pipeObj2.coorArr[5]);
      if (pipeObj2.deepFormat == "0") {
        start2 = start2 - pipe2Ds2;
        end2 = end2 - pipe2Ds2;
      }

      let min1;
      let max1;
      if (start2 < end1) {
        min1 = start1;
        max1 = end1;
      } else {
        min1 = end1;
        max1 = start1;
      }

      let min2;
      let max2;
      if (start2 < end2) {
        min2 = start2;
        max2 = end2;
      } else {
        min2 = end2;
        max2 = start2;
      }

      let verDis = 0;
      if (min1 < min2) {
        if (max1 < min2) {
          verDis = min2 - max1;
          verDis = verDis - pipe2Ds2;
          if (verDis < 0) {
            verDis = 0;
          }
        }
      } else {
        if (max2 < min1) {
          verDis = min1 - max2;
          verDis = verDis - pipe1Ds2;
          if (verDis < 0) {
            verDis = 0;
          }
        }
      }

      that.notice(verDis, '管线间垂直距离:')
      that.$_pickPipeQuery.cancelPickQuery()
    })
  }

  this.spaceDistance = function () {
    let that = this;
    this.$_pickPipeQuery = new pickPipeQuery(vueObj, function (pipeObj1, pipeObj2) {
      let pipe1Ds1 = pipeObj1.ds;
      let pipe1Ds2 = pipeObj1.ds;
      const dsInd = pipeObj1.ds.indexOf("x");

      if (dsInd > -1) {
        pipe1Ds1 = pipe1Ds1.substring(0, dsInd);
        pipe1Ds2 = pipe1Ds2.substr(dsInd + 1);
      }
      pipe1Ds1 = Number(pipe1Ds1);
      pipe1Ds2 = Number(pipe1Ds2);

      let pipe2Ds1 = pipeObj2.ds;
      let pipe2Ds2 = pipeObj2.ds;
      const dsInd2 = pipeObj2.ds.indexOf("x");

      if (dsInd2 > -1) {
        pipe2Ds1 = pipe2Ds1.substring(0, dsInd2);
        pipe2Ds2 = pipe2Ds2.substr(dsInd2 + 1);
      }
      pipe2Ds1 = Number(pipe2Ds1);
      pipe2Ds2 = Number(pipe2Ds2);

      const line1 = [];
      line1[0] = {
        x: Number(pipeObj1.coorArr[0]),
        y: Number(pipeObj1.coorArr[1]),
        z: Number(pipeObj1.coorArr[2]),
      };
      line1[1] = {
        x: Number(pipeObj1.coorArr[3]),
        y: Number(pipeObj1.coorArr[4]),
        z: Number(pipeObj1.coorArr[5]),
      };
      const line2 = [];
      line2[0] = {
        x: Number(pipeObj2.coorArr[0]),
        y: Number(pipeObj2.coorArr[1]),
        z: Number(pipeObj2.coorArr[2]),
      };
      line2[1] = {
        x: Number(pipeObj2.coorArr[3]),
        y: Number(pipeObj2.coorArr[4]),
        z: Number(pipeObj2.coorArr[5]),
      };
      const geoAlg = new StampGis.SEGeometryAlgorithm()
      // 空间距离
      const outSpace = geoAlg.CalculateLineLineSpaceDistance(line1, line2)
      if (outSpace.m_dis !== undefined && outSpace.m_dis !== 0) {
        const spaceDis = outSpace.m_dis - (pipe1Ds1 + pipe2Ds1) / 2 * 0.001
        that.notice(spaceDis > 0 ? spaceDis : 0, '管线间空间距离:')

      } else {
        that.usearth.Measure.Clear()
        that.vueObj.$message({
          title: '警告',
          message: '结果为空',
          type: 'warning',
        })
      }
      that.$_pickPipeQuery.cancelPickQuery()
    })
  }

  var getDemLayerData = function (root) {
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
}

Measure.prototype.notice = function (result, title, unit = '米') {
  if (this.notify) {
    this.notify.close()
    this.notify = null
  }

  let self = this
  const h = this.vueObj.$createElement
  const data = (+result).toFixed(2) + unit
  this.notify = this.vueObj.$notify({
    title,
    message: h(
      'i', {
      style: 'color: #fff',
    },
      data
    ),
    offset: 100,
    type: 'success',
    iconClass: 'measureIconClass',
    position: 'top-left',
    onClose(e) {
      if (self.attachObj) {
        self.usearth.document.elementRoot.detach_object(self.attachObj)
        // self.usearth.document.unregister_object(self.attachObj);
        self.attachObj = null
      }
      self.usearth.Measure.Clear()
      // self = null
    },
    customClass: 'measureNotify',
    duration: 0,
  })
}

Measure.prototype.notify = null

Measure.prototype.createCommonPolygon = function () {
  var polygon = this.usearth.Factory.CreateElementPolygon({
    name: 'testPolygon',
    doc: this.usearth.document,
  })

  return polygon
}

export default Measure