<template>
  <Popover
    :visible.sync="dialogVisible"
    :show-header="true"
    title="水平净距分析"
    custom-class="analysishorizon"
    :beforeClose="handleClose"
  >
    <div class="analysishorizon-container">
      <el-row>
        <el-col :span="6" class="analysishorizon-container-text">
          <div class="text">管段:</div>
        </el-col>
        <el-col :span="15">
          <el-input v-model="tubulation" disabled v-input-focus></el-input>
        </el-col>
        <el-col :span="4"> </el-col>
      </el-row>
      <el-row>
        <el-col :span="6" class="analysishorizon-container-text">
          <div class="text">分析半径:</div>
        </el-col>
        <el-col :span="15">
          <el-input
            v-model="analysisRadius"
            @input="createBuffer"
            v-input-focus
            v-only-number="{ max: 100, min: 0, precision: 2 }"
          ></el-input>
        </el-col>
        <el-col :span="3" class="analysishorizon-container-text"
          ><span>米</span></el-col
        >
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-button
            @click.prevent="pickTubulation"
            type="primary"
            size="mini"
            class="pickBtn"
            >选择管段</el-button
          >
          <el-button
            @click.prevent="analysisCollision"
            type="primary"
            :disabled="disabledAnalysis"
            >分析</el-button
          >
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12" class="analysishorizon-container-result">
          <div>{{ detailInfoShow ? "详细信息" : "分析结果" }}</div>
        </el-col>
        <el-col :span="12">
          <transition name="el-fade-in">
            <el-button
              v-show="detailInfoShow"
              class="backbutton"
              icon="el-icon-back"
              size="mini"
              type="primary"
              @click="detailInfoShow = false"
            />
          </transition>
        </el-col>
      </el-row>
      <el-row class="analysiswarning-container-table">
        <el-col :span="24">
          <el-scrollbar>
            <el-table
              size="mini"
              :height="tableHeight"
              :data="tableData"
              :row-style="getRowClass"
              @row-dblclick="getDetailInfo"
              :cell-style="finalCellStyle"
              v-show="!detailInfoShow"
            >
              <el-table-column
                prop="id"
                width="70"
                label="编号"
                :show-overflow-tooltip="true"
              ></el-table-column>
              <el-table-column
                prop="layer"
                width="70"
                label="图层"
                :show-overflow-tooltip="true"
              ></el-table-column>
              <el-table-column
                prop="horizonDistance"
                width="75"
                label="水平净距"
                :show-overflow-tooltip="true"
              ></el-table-column>
              <el-table-column
                prop="horizonISO"
                width="75"
                label="标准"
                :show-overflow-tooltip="true"
              ></el-table-column>
            </el-table>
            <table
              v-show="detailInfoShow"
              style="display: inline-block"
              :style="{ height: tableHeight + 'px' }"
            >
              <tr v-for="(item, index) in detailInfo" :key="index">
                <td class="col">{{ item.name }}</td>
                <td class="col">{{ item.value }}</td>
              </tr>
            </table>

            <el-row> </el-row>
          </el-scrollbar>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-checkbox v-model="showResult" :disabled="disabled"
            >显示结果</el-checkbox
          >
        </el-col>
        <el-col :span="8">
          <el-checkbox v-model="detailCheckbox" :disabled="disabled"
            >详细信息</el-checkbox
          >
        </el-col>
        <el-col :span="8">
          <el-button
            size="mini"
            :loading="downloadLoading"
            :disabled="disabled"
            type="primary"
            icon="el-icon-download"
            @click="download"
            >导出</el-button
          >
        </el-col>
      </el-row>
    </div>
  </Popover>
</template>

<script>
import { pipelineGet } from "@/api/analysis";
import {
  postSearch,
  postDataQuery,
  getFiledCfgXml,
  getNameNoIgnoreCase,
  getNameNoIgnoreCase1,
} from "@/api/query";
import { convertExcelData } from "@/utils";
import axios from "axios";
var lastPolygon_analysisCollision = null;
import onlyNumber from "@/directives/el-only-number";
import Popover from "@/components/Popover";
export default {
  name: "AnalysisHorizontalDis",
  data() {
    this.pipeListData = [];
    this.project = null;
    this.timer = null;
    this.lastLayer = null;
    return {
      dialogVisible: true,
      disabled: true,
      disabledAnalysis: true,
      tubulation: "",
      analysisRadius: 10,
      tableData: [],
      $respData: null,
      $layerGuid: null,
      downloadLoading: false,
      detailCheckbox: false,
      detailInfoShow: false,
      detailInfo: [],
      $layer: null,
      $pickChange: null,
      $hightLightArr: null, //高亮对象guid
      showResult: false, //是否显示结果
      $selObjKey: "",
      selectedObjStr: "",
      pdiam: "",
      plttype: "",
      ppressure: "", //压力
      ppsvalue: "",
      $linePoints: [],
      $filedCfgJson: "",
      $pipelID: "", //管线编号字段
      $pipepID: "", //管点编号字段
      $pipelineType: "", //管线类型
    };
  },
  components: {
    Popover,
  },
  directives: { onlyNumber },
  computed: {
    tableHeight() {
      return (390 / 1920) * window.innerWidth;
    },
  },
  mounted() {
    this.pipeListData = this.g_Project.pipeListData;
    this.project = this.g_Project.project;
    let self = this;
    let urlSearch = this.g_Project.FieldMap;
    if (urlSearch == "") {
      self.$message({
        message: "当前工程没有管线配置信息",
        type: "warning",
      });
      return;
    }
    getFiledCfgXml(urlSearch, self).then((res) => {
      self.$filedCfgJson = res;
    });
    //解决鼠标移出el-table表头鼠标样式丢失问题
    this.$nextTick(function () {
      var doms = document.querySelectorAll("th");
      doms.forEach((item) => {
        var cursorstyle = "";
        item.addEventListener("mouseenter", function () {
          cursorstyle = document.body.style.cursor;
        });
        item.addEventListener("mouseout", function () {
          document.body.style.cursor = cursorstyle;
        });
      });
    });
  },
  methods: {
    getRowClass() {
      return "background:#3f5c6d2c;color:#ffffff;";
    },
    finalCellStyle: function ({ row, column, rowIndex, columnIndex }) {
      if (row.class == "bgRed" && columnIndex == 2) {
        return {
          background: "#f7b1b180",
        };
      }
    },
    pickTubulation() {
      var application = this.stampAPI.usearth.application;
      if (
        application._selectedEntityChanged._listeners &&
        application._selectedEntityChanged._listeners.length > 0
      ) {
        application._selectedEntityChanged._listeners.length = 0;
      }
      application.pickingEnable = true;
      const self = this;
      if (this.$pickChange) {
        this.$pickChange();
        this.$pickChange = null;
      }
      this.$pickChange = application._selectedEntityChanged.addEventListener(
        function (res) {
          if (!res) {
            return;
          }
          if (Array.isArray(res) && res.length == 0) {
            return;
          }
          if (self.$pickChange) {
            self.$pickChange();
            self.$pickChange = null;
          }
          application.pickingEnable = false;
          if (Array.isArray(res) && res.length > 0 && res[0].layer) {
            if (res[0].properties && res[0].properties.properties) {
              const earth = self.stampAPI.usearth;
              self.tubulation = res[0].properties.properties.Key; //SE_ID;
              self.$selObjKey = res[0].properties.properties.Key;
              let layerId = res[0].layer._id;
              self.$layerGuid = layerId.split("_")[0];
              self.$layer = earth.LayerManager.GetLayerByGUID(self.$layerGuid);
              let gisServer = self.$layer._gis_server_connection;
              self.$pipelineType = self.$layer.pipeline_type;
              self.$pipelID =
                self.$pipelID ||
                getNameNoIgnoreCase(self.$filedCfgJson, "US_KEY", "1", true);
              self.$pipepID =
                self.$pipepID ||
                getNameNoIgnoreCase(self.$filedCfgJson, "US_KEY", "0", true);
              //   var postDataParam = `service=${self.$layerGuid}&qt=17&dt=line&pc=(and,equal,${self.$pipelID},${self.$selObjKey})&pg=0,10&encoding=utf-8&`;
              var postDataParam = {
                service: self.$layerGuid,
                qt: 17,
                dt: "line",
                pc: `(and,equal,${self.$pipelID},${self.$selObjKey})`,
                pg: "0,10",
                encoding: "utf-8",
              };
              postDataQuery(postDataParam, gisServer).then(function (res) {
                var json = self.$x2js.xml2js(res.data).Xml;
                if (json && json.Result._num == 1) {
                  self.disabledAnalysis = false;
                  var US_SALT = getNameNoIgnoreCase(
                    self.$filedCfgJson,
                    "US_SALT",
                    "1",
                    true
                  ); //'S_HEIGHT';//parent.getName("US_SALT", 1, true);
                  var US_EALT = getNameNoIgnoreCase(
                    self.$filedCfgJson,
                    "US_EALT",
                    "1",
                    true
                  ); //'E_HEIGHT';//parent.getName("US_EALT", 1, true);
                  var jsonShap = json.Result.Record.SHAPE;
                  self.selectedObjStr = jsonShap.Polyline.Coordinates;
                  if (jsonShap.Polyline.OriginalCoordinates) {
                    self.selectedObjStr = jsonShap.Polyline.OriginalCoordinates;
                  }
                  var xyz = self.selectedObjStr.split(",");
                  self.selectedObjStr =
                    xyz[0] +
                    "," +
                    xyz[1] +
                    "," +
                    json.Result.Record[US_SALT.toLowerCase()] +
                    "," +
                    xyz[3] +
                    "," +
                    xyz[4] +
                    "," +
                    json.Result.Record[US_EALT.toLowerCase()];
                  var ds = getNameNoIgnoreCase(
                    self.$filedCfgJson,
                    "US_SIZE",
                    "1",
                    true
                  );
                  var type = getNameNoIgnoreCase(
                    self.$filedCfgJson,
                    "US_LTTYPE",
                    "1",
                    true
                  );
                  var ppressure = getNameNoIgnoreCase(
                    self.$filedCfgJson,
                    "US_PRESSUR",
                    "1",
                    true
                  );
                  var ppsvalue = getNameNoIgnoreCase(
                    self.$filedCfgJson,
                    "US_PSVALUE",
                    "1",
                    true
                  );
                  self.pdiam = json.Result.Record[ds.toLowerCase()]; //parent.getName("US_SIZE", 1, true)
                  self.plttype = json.Result.Record[type.toLowerCase()]; //parent.getName("US_LTTYPE", 1, true)
                  self.ppressure = json.Result.Record[ppressure.toLowerCase()];
                  self.ppsvalue = json.Result.Record[ppsvalue.toLowerCase()];
                  //---水平净距、垂直净距、碰撞分析中要用到压力和埋设方式字段 START---//
                  if (self.ppressure == "低压") {
                    self.ppressure = 0;
                  } else if (self.ppressure == "中压") {
                    self.ppressure = 1;
                  } else if (self.ppressure == "高压") {
                    self.ppressure = 2;
                  } else {
                    self.ppressure = -1;
                  }
                  if (self.plttype == undefined || self.plttype == "") {
                    self.plttype = -1;
                  }
                  if (self.ppsvalue == undefined || self.ppsvalue == "") {
                    self.ppsvalue = -1;
                  }
                  //---水平净距、垂直净距、碰撞分析中要用到压力和埋设方式字段 END---//
                  var coords = jsonShap.Polyline.Coordinates.split(",");
                  self.$linePoints = [];
                  for (var i = 0; i < coords.length; i += 3) {
                    self.$linePoints.push({
                      longitude: Number(coords[i]),
                      latitude: Number(coords[i + 1]),
                      height: Number(coords[i + 2]),
                    });
                  }
                  self.createBuffer();
                  setTimeout(
                    () => (self.$layer.container._highlight_objs = []),
                    STAMP_config.highLightTime
                  );
                }
              });
            }
          }
        }
      );
    },
    createBuffer(value) {
      if (value == 0) {
        this.disabledAnalysis = true;
        return;
      }
      this.disabledAnalysis = false;
      var earth = this.stampAPI.usearth;
      if (lastPolygon_analysisCollision) {
        earth.document.elementRoot.detach_object(lastPolygon_analysisCollision);
      }
      var polygonArray =
        earth.GeometryAlgorithm.CreatePolygonBufferFromPolyline(
          this.$linePoints,
          Number(this.analysisRadius),
          0,
          36
        );
      var polygon = earth.Factory.CreateElementPolygon({
        name: "testPolygon",
        doc: earth.document,
      });
      polygon.BeginUpdate();
      polygon.SetExteriorRing(polygonArray, false);
      polygon.set_altitude_type(1);
      polygon.lineColor = 0xffff0000;
      polygon.lineWidth = 1.0;
      polygon.fillColor = 0x2500ff00;
      polygon.EndUpdate();
      earth.document.elementRoot.attach_object(polygon);
      earth.document.register_object(polygon);
      lastPolygon_analysisCollision = polygon;
    },
    async analysisCollision() {
      this.$pipelID =
        this.$pipelID ||
        getNameNoIgnoreCase(this.$filedCfgJson, "US_KEY", "1", true);
      this.tableData = [];
      var self = this;
      this.$hightLightArr = [];
      if (this.showResult) {
        this.showResult = false;
      }
      self.disabled = false;
      for (var ni = 0; ni < this.pipeListData.length; ni++) {
        self.$hightLightArr.push({
          guid: this.pipeListData[ni].guid,
          hightLight: [],
        });
        var params = {
          rt: "collision",
          service: this.pipeListData[ni].guid,
          aparam: `0,${this.selectedObjStr},${this.pdiam},${this.analysisRadius},${this.$pipelineType},${this.ppressure},${this.plttype},${this.ppsvalue}`,
          gisServer: this.$layer._gis_server_connection,
        };
        var res = await pipelineGet(params);
        var json = self.$x2js.xml2js(res.data).Xml;
        if (json == null || !json.CollisionResult) {
          continue;
        }
        var type = "line";
        var records = json.CollisionResult.Record;
        if (json.CollisionResult._num <= 0) {
          continue;
        } else if (json.CollisionResult._num == 1) {
          //当只有一个结果时处理为数组
          records = [records];
        }
        for (var i = 0; i < records.length; i++) {
          var tempid =
            records[i][self.$pipelID] ||
            records[i][self.$pipelID.toLowerCase()];
          if (tempid == self.$selObjKey) {
            //去除跟选取的管段一样的管段 parent.getNameNoIgnoreCase("US_KEY", 1, true)
            continue;
          }
          var thisClass = "bgNone";
          var thisTitle = "净距符合标准";
          var thisFlag = true;
          if (parseFloat(records[i].HorizonDistance) < 0) {
            thisTitle = "净距为负";
            thisClass = "bgRed";
            thisFlag = false;
          } else if (
            parseFloat(records[i].HorizonDistance) <
            parseFloat(records[i].HorizonISO)
          ) {
            thisTitle = "净距<标准值";
            thisClass = "bgRed";
            thisFlag = false;
          }
          // if (parseFloat(records[i].HorizonDistance) != -999) {
          self.tableData.push({
            id: tempid, //getNameNoIgnoreCase("US_KEY", 1, true)
            layer: self.pipeListData[ni].name,
            horizonDistance:
              parseFloat(records[i].HorizonDistance) == -999
                ? "-"
                : parseFloat(records[i].HorizonDistance).toFixed(2),
            horizonISO:
              parseFloat(records[i].HorizonISO) == -999
                ? "-"
                : parseFloat(records[i].HorizonISO).toFixed(2),
            layerID: self.pipeListData[ni].guid,
            class: thisClass,
          });

          if (!thisFlag) {
            //如果水平净距或者垂直净距不符合要求,那么push进显示结果的数组
            self.$hightLightArr.forEach((el) => {
              if (el.guid == self.pipeListData[ni].guid) {
                el.hightLight.push(tempid);
              }
            });
          }
          // }
        }
      }
    },
    getDetailInfo(row, col, e) {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      if (this.lastLayer) {
        this.lastLayer.container._highlight_objs = [];
        this.lastLayer = null;
      }

      let layer = this.stampAPI.usearth.LayerManager.GetLayerByGUID(
        row.layerID
      );
      this.lastLayer = layer;

      let gisServer = layer._gis_server_connection;
      this.$pipelID =
        this.$pipelID ||
        getNameNoIgnoreCase(this.$filedCfgJson, "US_KEY", "1", true);
      const self = this;
      let searchParam = `rd=&t=container&c=${row.layerID}&pk=${row.id}&rt=1&mesh=0&detail=0&p=0&pl=100`;
      //   let postDataParam = `service=${row.layerID}&qt=16&dt=line&pc=(and,equal,${this.$pipelID},${row.id})&pg=0,10&encoding=utf-8&`;
      let postDataParam = {
        service: row.layerID,
        qt: 16,
        dt: "line",
        pc: `(and,equal,${this.$pipelID},${row.id})`,
        pg: "0,10",
        encoding: "utf-8",
      };

      axios
        .all([postSearch(searchParam), postDataQuery(postDataParam, gisServer)])
        .then(
          axios.spread(function (search, dataQuery) {
            let modelData = self.$x2js.xml2js(search.data).Xml.SearchResult
              .ModelResult.ModelData;
            if (modelData) {
              let arr = modelData.LonLatBox.split(",");
              var north = Number(arr[0]);
              var south = Number(arr[1]);
              var east = Number(arr[2]);
              var west = Number(arr[3]);
              var topHeight = Number(arr[4]);
              var bottomHeight = Number(arr[5]);
              var lon = (east + west) / 2;
              var lat = (south + north) / 2;
              var alt = (topHeight + bottomHeight) / 2;
              var width = Math.abs(north - south) / 2;
              var heigth = Math.abs(east - west) / 2;
              var range =
                ((width / 180) * Math.PI * 6378137) /
                Math.tan((22.5 / 180) * Math.PI);
              var range1 =
                ((heigth / 180) * Math.PI * 6378137) /
                Math.tan((22.5 / 180) * Math.PI);
              var pos = StampGis.Cartesian3.fromDegrees(
                lon,
                lat,
                alt + Math.max(range, range1)
              );
              self.stampAPI.usearth.application.observer.flyTo({
                destination: pos,
                orientation: {
                  heading: StampGis.StampMath.toRadians(0),
                  pitch: StampGis.StampMath.toRadians(-90),
                  roll: 0.0,
                },
              });

              //获取图层
              let layer = self.stampAPI.usearth.LayerManager.GetLayerByGUID(
                row.layerID
              );

              layer.container._highlight_objs.push(modelData["SE_ID"]);

              self.timer = setTimeout(
                () => (layer.container._highlight_objs = []),
                STAMP_config.highLightTime
              );
            }
            let dataJson = self.$x2js.xml2js(dataQuery.data).Xml.Result.Record;
            self.detailInfo = [];
            for (var key in dataJson) {
              if (
                key != "LonLatBox" &&
                key != "ParentLayer" &&
                key != "SHAPE"
              ) {
                var tempKey = getNameNoIgnoreCase1(
                  self.$filedCfgJson,
                  key,
                  "1",
                  false
                );
                self.detailInfo.push({
                  name: tempKey,
                  value: dataJson[key],
                });
              }
            }
          })
        )
        .catch((e) => {});
      this.detailInfoShow = this.detailCheckbox;
    },
    download() {
      this.downloadLoading = true;
      import("@/vendor/Export2Excel").then((excel) => {
        const tHeader = ["编号", "图层", "水平净距", "标准"];
        const filterVal = ["id", "layer", "horizonDistance", "horizonISO"];
        const data = convertExcelData(filterVal, this.tableData);
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: "水平净距分析",
          autoWidth: true,
          bookType: "xlsx",
        });
        this.downloadLoading = false;
      });
    },
    showHightlight(isShow) {
      const self = this;
      let earth = this.stampAPI.usearth;
      if (this.$hightLightArr.length > 0) {
        this.$hightLightArr.forEach((layer) => {
          let queryLayer = earth.LayerManager.GetLayerByGUID(layer.guid);
          if (isShow && layer.hightLight.length > 0) {
            let params = `rd=&t=container&c=${
              layer.guid
            }&pk=${layer.hightLight.join(
              ","
            )}&rt=1&mesh=0&detail=1&p=0&pl=60000`;
            postSearch(params).then((res) => {
              let modelData = self.$x2js.xml2js(res.data).Xml.SearchResult
                .ModelResult.ModelData;
              if (modelData && !Array.isArray(modelData)) {
                modelData = [modelData];
              }
              if (modelData.length > 0) {
                for (let n = 0; n < modelData.length; n++) {
                  queryLayer.container._highlight_objs.push(
                    modelData[n]["SE_ID"]
                  );
                }
              }
            });
          } else {
            queryLayer.container._highlight_objs = [];
          }
        });
      }
    },
    handleClose() {
      this.$router.push("/");
    },
  },
  beforeRouteLeave(to, from, next) {
    next();
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.lastLayer) {
      this.lastLayer.container._highlight_objs = [];
      this.lastLayer = null;
    }
    if (lastPolygon_analysisCollision) {
      this.stampAPI.usearth.document.elementRoot.detach_object(
        lastPolygon_analysisCollision
      );
      lastPolygon_analysisCollision = null;
    }
    if (this.showResult && this.$hightLightArr.length > 0) {
      this.showHightlight(false);
    }

    if (this.$pickChange) {
      const application = this.stampAPI.usearth.application;
      if (
        application._selectedEntityChanged._listeners &&
        application._selectedEntityChanged._listeners.length > 0
      ) {
        application._selectedEntityChanged.removeEventListener(
          this.$pickChange
        );
      }
      application.pickingEnable = false;
      this.$pickChange = null;
    }
    this.$parent.$refs.functionPanel.curSelMenu.name = "";
  },
  watch: {
    showResult(newV, oldV) {
      this.showHightlight(newV);
    },
  },
};
</script>

<style lang="less" scoped>
.analysishorizon {
  width: 18.625vw;
  font-size: 16px;
}

.el-row {
  margin-bottom: 5px;

  &:last-child {
    margin-bottom: 0px;
  }
}

.el-table .warning-row {
  background: oldlace;
}

.analysishorizon-container {
  height: 550px;

  .analysishorizon-container-text {
    height: 30px;
    line-height: 30px;
    font-size: 14px;
    text-align: left;
    padding-left: 5px;
  }

  .analysishorizon-container-result {
    height: 30px;
    line-height: 30px;
    font-weight: 700;
    text-align: left;
    padding-left: 10px;
    // background: rgba(1, 76, 91, 1);
  }

  .analysishorizon-container-table {
    margin-bottom: 0px;
  }
}

.text {
  text-align: right;
  padding-right: 5px;
}
</style>
