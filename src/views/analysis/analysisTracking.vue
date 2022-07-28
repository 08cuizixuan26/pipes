<template>
  <Popover
    :visible.sync="dialogVisible"
    :show-header="true"
    title="追踪分析"
    custom-class="analysistracking"
    :beforeClose="handleClose"
  >
    <div class="analysistracking-container">
      <el-row>
        <el-col :span="6" class="analysistracking-container-text">
          <div class="text">管段:</div>
        </el-col>
        <el-col :span="14">
          <el-input
            v-model="tubulation"
            class="input"
            v-input-focus
            style="width: 85%"
          ></el-input>
        </el-col>
        <el-col :span="4"> </el-col>
      </el-row>
      <el-row>
        <el-col :span="6" class="analysistracking-container-text">
          <div class="text">半径:</div>
        </el-col>
        <el-col :span="14">
          <el-input
            v-model="radios"
            class="input"
            v-input-focus
            style="width: 85%"
          ></el-input>
        </el-col>
        <el-col :span="4" class="analysistracking-container-text">
          <div>米</div>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8" class="analysistracking-container-radio">
          <el-radio v-model="direction" label="0">正向</el-radio>
        </el-col>
        <el-col :span="8" class="analysistracking-container-radio">
          <el-radio v-model="direction" label="1">逆向</el-radio>
        </el-col>
        <el-col :span="8" class="analysistracking-container-radio">
          <el-radio v-model="direction" label="2">双向</el-radio>
        </el-col>
      </el-row>
      <el-row>
        <el-button
          @click.prevent="pickTubulation"
          type="primary"
          size="mini"
          class="pickBtn"
          >选择管段</el-button
        >
        <el-button
          type="primary"
          size="mini"
          @click="allAnalysis"
          :disabled="disabledAnalysis"
          >分析</el-button
        >
      </el-row>
      <el-row>
        <el-col :span="12" class="analysistracking-container-result">
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
      <el-row class="analysistracking-container-table">
        <el-col :span="24">
          <el-scrollbar>
            <el-table
              :height="tableHeight"
              :data="tableData.freezeObj"
              :row-style="getRowClass"
              @row-dblclick="getDetailInfo"
              v-show="!detailInfoShow"
            >
              <el-table-column
                prop="id"
                label="编号"
                :show-overflow-tooltip="true"
              ></el-table-column>
              <el-table-column prop="type" label="类型"></el-table-column>
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
import { networkGet } from "@/api/analysis";
import {
  postSearch,
  postDataQuery,
  getFiledCfgXml,
  getNameNoIgnoreCase,
  getNameNoIgnoreCase1,
} from "@/api/query";
import { convertExcelData } from "@/utils";
import axios from "axios";
import Popover from "@/components/Popover";
export default {
  name: "burstAnalysis",
  data() {
    return {
      dialogVisible: true,
      disabled: true,
      disabledAnalysis: true,
      tubulation: "",
      direction: "2",
      tableData: {
        freezeObj: [],
      },
      radios: 100,
      $layerGuid: null,
      downloadLoading: false,
      detailCheckbox: false,
      detailInfoShow: false,
      detailInfo: [],
      $layer: null,
      $pickChange: null,
      $Cartographic: null,
      $longitude: "",
      $latitude: "",
      analysisLoading: false,
      showResult: false,
      $resultGuidArr: [],
      $hightLightArr: [], //高亮数组
      $filedCfgJson: "",
      $pipelID: "", //管线编号字段
      $pipepID: "", //管点编号字段
      timeoutId: null,
    };
  },
  components: {
    Popover,
  },
  computed: {
    tableHeight() {
      return (370 / 1920) * window.innerWidth;
    },
  },
  methods: {
    getRowClass() {
      return "background:#3f5c6d2c;color:#ffffff;";
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
      this.$pickChange = application.selectedEntityChanged.addEventListener(
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
              self.disabledAnalysis = false;
              self.tubulation = res[0].properties.properties.Key; //SE_ID;
              let layerID = res[0].layer._id;
              self.$layerGuid = layerID.split("_")[0];
              let layer = self.stampAPI.usearth.LayerManager.GetLayerByGUID(
                self.$layerGuid
              );
              self.$layer = layer;
              self.$layer.container.query_param.clear_search_parameter();
              self.$layer.container.query_param.set_keyword_value(
                res[0].properties.properties.Key
              );

              function searchCallback(options) {
                if (
                  options.result &&
                  options.result &&
                  options.result.LonLatBox
                ) {
                  let arr = options.result.LonLatBox.split(",");
                  let north = Number(arr[0]);
                  let south = Number(arr[1]);
                  let east = Number(arr[2]);
                  let west = Number(arr[3]);
                  self.$longitude = (east + west) / 2;
                  self.$latitude = (south + north) / 2;
                }
              }
              self.$layer.container.query_param.execute_search(
                0,
                searchCallback,
                0
              );
              setTimeout(
                () => (self.$layer.container._highlight_objs = []),
                STAMP_config.highLightTime
              );
              self.$layerKey = res[0].properties.properties.Key;
              setTimeout(
                () => (self.$layer.container._highlight_objs = []),
                3000
              );
            }
          }
        }
      );
      // this.$pickChange = pickChange;
    },
    allAnalysis() {
      this.$hightLightArr = [];
      this.$layer.container._highlight_objs = [];
      this.analysisLoading = true;
      let respData = this.$respData;
      const earth = this.stampAPI.usearth;
      const self = this;
      let tracingRadius = parseFloat(this.radios);

      let gisServer = this.$layer._gis_server_connection;
      let params = {
        rt: "tracing",
        service: this.$layerGuid,
        aparam: `0,${this.$layerKey},${this.direction},${tracingRadius * 2}`,
      };

      networkGet(params)
        .then((res) => {
          this.analysisLoading = false;
          const jsonData = this.$x2js.xml2js(res.data);
          let resData = jsonData.Xml.TracingResult;
          let lineData = resData.LineResult.Record;
          let pointData = resData.PointResult.Record;
          // this.toTableData(lineData, pointData);
          return [lineData, pointData];
        })
        .then((res) => {
          //   let lineParam = `service=${this.$layerGuid}&qt=16&dt=line&sc=(3,1,${tracingRadius},${this.$longitude},${this.$latitude})&pg=0,200&encoding=utf-8&`;
          let lineParam = {
            service: this.$layerGuid,
            qt: 16,
            dt: "line",
            sc: `(3,1,${tracingRadius},${this.$longitude},${this.$latitude})`,
            pg: "0,200",
            encoding: "utf-8",
          };
          //   let pointParam = `service=${this.$layerGuid}&qt=16&dt=point&sc=(3,1,${tracingRadius},${this.$longitude},${this.$latitude})&pg=0,200&encoding=utf-8&`;
          let pointParam = {
            service: this.$layerGuid,
            qt: 16,
            dt: "point",
            sc: `(3,1,${tracingRadius},${this.$longitude},${this.$latitude})`,
            pg: "0,200",
            encoding: "utf-8",
          };
          axios
            .all([
              postDataQuery(pointParam, gisServer),
              postDataQuery(lineParam, gisServer),
            ])
            .then(
              axios.spread(function (pointData, lineData) {
                self.disabled = false;
                self.$pipelID =
                  self.$pipelID ||
                  getNameNoIgnoreCase(self.$filedCfgJson, "US_KEY", "1", true);
                self.$pipepID =
                  self.$pipepID ||
                  getNameNoIgnoreCase(self.$filedCfgJson, "US_KEY", "0", true);
                let pointJson = self.$x2js.xml2js(pointData.data).Xml.Result
                  .Record;
                let lineJson = self.$x2js.xml2js(lineData.data).Xml.Result
                  .Record;
                let pointArr = [],
                  lineArr = [];
                const allLineData = res[0];
                const allPointData = res[1];
                for (var l of allLineData) {
                  if (
                    lineJson.some((v) =>
                      Object.is(v[self.$pipelID], l[self.$pipelID])
                    )
                  ) {
                    lineArr.push({
                      id: l[self.$pipelID] || l[self.$pipelID.toLowerCase()],
                      type: "管线",
                    });
                    // self.$resultGuidArr.push("");
                  }
                }
                for (var l of allPointData) {
                  if (
                    lineJson.some((v) =>
                      Object.is(v[self.$pipepID], l[self.$pipepID])
                    )
                  ) {
                    pointArr.push({
                      id: l[self.$pipepID] || l[self.$pipepID.toLowerCase()],
                      type: "管点",
                    });
                  }
                }
                self.tableData.freezeObj = Object.freeze(
                  pointArr.concat(lineArr)
                );
              })
            );
        })
        .catch((e) => {});
    },
    getDetailInfo(row, col, e) {
      const self = this;
      // 清除定时器
      // if(self.timeId){
      //   window.clearInterval(self.timeId);
      // }
      let layer = self.stampAPI.usearth.LayerManager.GetLayerByGUID(
        this.$layerGuid
      );
      let gisServer = layer._gis_server_connection;

      self.$layer.container._highlight_objs = [];
      self.$layer.well._highlight_objs = [];
      self.$layer.joint._highlight_objs = [];

      if (row.type == "管线") {
        let searchParam = `rd=&t=container&c=${this.$layerGuid}&pk=${row.id}&rt=1&mesh=0&detail=0&p=0&pl=100`;
        // let postDataParam = `service=${this.$layerGuid}&qt=16&dt=line&pc=(and,equal,${this.$pipelID},${row.id})&pg=0,10&encoding=utf-8&`;
        let postDataParam = {
          service: this.$layerGuid,
          qt: 16,
          dt: "line",
          pc: `(and,equal,${this.$pipelID},${row.id})`,
          pg: "0,10",
          encoding: "utf-8",
        };
        axios
          .all([
            postSearch(searchParam),
            postDataQuery(postDataParam, gisServer),
          ])
          .then(
            axios.spread(function (search, dataQuery) {
              let modelData = self.$x2js.xml2js(search.data).Xml.SearchResult
                .ModelResult.ModelData;
              let arr = [];
              if (modelData) {
                arr = modelData.LonLatBox.split(",");
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
              }

              self.$layer.container.query_param.clear_search_parameter();
              self.$layer.container.query_param.set_keyword_value(row.id);

              function searchCallback(options) {
                self.$layer.container._highlight_objs.push(
                  options.result && options.result["SE_ID"]
                );
                // self.timeId =
                if (self.timeoutId) {
                  clearTimeout(self.timeoutId);
                  self.timeoutId = null;
                }
                self.timeoutId = setTimeout(
                  () => (self.$layer.container._highlight_objs = []),
                  STAMP_config.highLightTime
                );
              }
              self.$layer.container.query_param.execute_search(
                0,
                searchCallback,
                0
              );
              if (self.detailCheckbox) {
                self.detailInfo = [];
                let dataJson = self.$x2js.xml2js(dataQuery.data).Xml.Result
                  .Record;
                for (let item in dataJson) {
                  let tempKey = getNameNoIgnoreCase1(
                    self.$filedCfgJson,
                    item,
                    "1",
                    false
                  );
                  self.detailInfo.push({
                    name: tempKey,
                    value: dataJson[item],
                  });
                }
              }
            })
          )
          .catch((e) => {});
      } else {
        let searchParam = `rd=&t=well&c=${this.$layerGuid}&pk=${row.id}&rt=1&mesh=0&detail=0&p=0&pl=100`;
        let searchParam1 = `rd=&t=joint&c=${this.$layerGuid}&pk=${row.id}&rt=1&mesh=0&detail=0&p=0&pl=100`;
        // let postDataParam = `service=${this.$layerGuid}&qt=16&dt=point&pc=(and,equal,${this.$pipepID},${row.id})&pg=0,10&encoding=utf-8&`;
        let postDataParam = {
          service: this.$layerGuid,
          qt: 16,
          dt: "point",
          pc: `(and,equal,${this.$pipelID},${row.id})`,
          pg: "0,10",
          encoding: "utf-8",
        };
        axios
          .all([
            postSearch(searchParam),
            postDataQuery(postDataParam, gisServer),
            postSearch(searchParam1),
          ])
          .then(
            axios.spread(function (search, dataQuery, search1) {
              let modelData = self.$x2js.xml2js(search.data).Xml.SearchResult
                .ModelResult.ModelData;
              let modelData1 = self.$x2js.xml2js(search1.data).Xml.SearchResult
                .ModelResult.ModelData;
              let arr = [];
              if (modelData) {
                arr = modelData.LonLatBox.split(",");
              } else if (modelData1) {
                arr = modelData1.LonLatBox.split(",");
              }

              if (arr && arr.length > 0) {
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
              }

              self.$layer.well.query_param.clear_search_parameter();
              self.$layer.well.query_param.set_keyword_value(row.id);
              self.$layer.joint.query_param.clear_search_parameter();
              self.$layer.joint.query_param.set_keyword_value(row.id);

              function searchCallback(options) {
                self.$layer.well._highlight_objs.push(
                  options.result && options.result["SE_ID"]
                );
                self.$layer.joint._highlight_objs.push(
                  options.result && options.result["SE_ID"]
                );

                if (self.timeoutId) {
                  clearTimeout(self.timeoutId);
                  self.timeoutId = null;
                }
                self.timeoutId = setTimeout(() => {
                  self.$layer.well._highlight_objs = [];
                  self.$layer.joint._highlight_objs = [];
                }, STAMP_config.highLightTime);
              }
              self.$layer.well.query_param.execute_search(0, searchCallback, 0);
              self.$layer.joint.query_param.execute_search(
                0,
                searchCallback,
                0
              );
              if (self.detailCheckbox) {
                self.detailInfo = [];
                let dataJson = self.$x2js.xml2js(dataQuery.data).Xml.Result
                  .Record;
                for (let item in dataJson) {
                  let tempKey = getNameNoIgnoreCase1(
                    self.$filedCfgJson,
                    item,
                    "0",
                    false
                  );
                  self.detailInfo.push({
                    name: tempKey,
                    value: dataJson[item],
                  });
                }
              }
            })
          )
          .catch((e) => {});
      }

      this.detailInfoShow = this.detailCheckbox;
    },
    download() {
      this.downloadLoading = true;
      import("@/vendor/Export2Excel").then((excel) => {
        const tHeader = ["编号", "类型"];
        const filterVal = ["id", "type"];
        const data = convertExcelData(filterVal, this.tableData.freezeObj);
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: "追踪分析",
          autoWidth: true,
          bookType: "xlsx",
        });
        this.downloadLoading = false;
      });
    },
    handleClose() {
      this.$router.push("/");
    },
  },
  mounted() {
    let self = this;
    let urlSearch = self.g_Project.FieldMap;
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
    this.$nextTick(function(){
        var doms = document.querySelectorAll('th');
        doms.forEach(item =>{
            var cursorstyle = "";
            item.addEventListener("mouseenter",function(){
                cursorstyle = document.body.style.cursor;
            });
            item.addEventListener("mouseout",function(){
                document.body.style.cursor = cursorstyle;
            })
        })
    })
  },
  watch: {
    showResult(newV) {
      if (newV) {
        const self = this;
        if (!this.$hightLightArr.length) {
          var idsArr = this.tableData.freezeObj.map((v) => v.id);
          if (idsArr.length < 6) {
            this.$layer.container.query_param.clear_search_parameter();
            this.$layer.container.query_param.set_pkeyword_value(idsArr);
            this.$layer.container.query_param.execute_search(
              0,
              searchCallback,
              0
            );
          } else {
            for (let i = 0; i < Math.ceil(idsArr.length / 6); i++) {
              let idsArr2 = idsArr.slice(i * 6, i * 6 + 6);
              this.$layer.container.query_param.clear_search_parameter();
              this.$layer.container.query_param.set_pkeyword_value(idsArr2);
              self.$layer.container.query_param.execute_search(
                0,
                searchCallback,
                0
              );
            }
          }
          function searchCallback(options) {
            let result = options.result;
            if (!Array.isArray(result)) {
              result = [result];
            }
            for (let item of result) {
              self.$hightLightArr.push(item["SE_ID"]);
            }
            Array.prototype.push.apply(
              self.$layer.container._highlight_objs,
              self.$hightLightArr
            );
          }
        } else {
          Array.prototype.push.apply(
            this.$layer.container._highlight_objs,
            this.$hightLightArr
          );
        }
      } else {
        this.$layer.container._highlight_objs = [];
      }
    },
  },
  beforeRouteLeave(to, from, next) {
    next();
    if (this.$layer && this.$layer.container) {
      this.$layer.container._highlight_objs = [];
      this.$layer.well._highlight_objs = [];
      this.$layer.joint._highlight_objs = [];
    }

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
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
};
</script>

<style lang="less" scoped>
.analysistracking {
  width: 300px;
}

.el-row {
  margin-bottom: 5px;

  &:last-child {
    margin-bottom: 0px;
  }
}

.analysistracking-container {
  height: 550px;

  .analysistracking-container-text {
    height: 30px;
    line-height: 30px;
    font-size: 14px;
    text-align: left;
  }

  .analysistracking-container-result {
    height: 30px;
    line-height: 30px;
    font-weight: 700;
    text-align: left;
    padding-left: 10px;
    // background: rgba(1, 76, 91, 1);
  }

  .analysistracking-container-table {
    margin-bottom: 0px;
  }
}
.text {
  text-align: right;
  padding-right: 5px;
}
</style>
