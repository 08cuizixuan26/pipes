<template>
  <Popover
    :visible.sync="dialogVisible"
    :show-header="true"
    title="连通分析"
    custom-class="analysisconnect"
    :beforeClose="handleClose"
  >
    <div class="analysisconnect-container">
      <el-row>
        <el-col :span="8" class="analysisconnect-container-text">
          <div class="text">开始管段:</div>
        </el-col>
        <el-col :span="14">
          <el-input
            v-model="startTubulation"
            class="input"
            disabled
            v-input-focus
            style="width: 90%"
          ></el-input>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8" class="analysisconnect-container-text">
          <div class="text">结束管段:</div>
        </el-col>
        <el-col :span="14">
          <el-input
            v-model="endTubulation"
            class="input"
            disabled
            v-input-focus
            style="width: 90%"
          ></el-input>
        </el-col>
      </el-row>
      <el-row>
        <el-button @click.prevent="pickTubulation(1)" type="primary" size="mini"
          >开始管段</el-button
        >
        <el-button @click.prevent="pickTubulation(2)" type="primary" size="mini"
          >结束管段</el-button
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
        <el-col :span="12" class="analysisconnect-container-result">
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
          <div
            v-show="flag"
            class="analysisconnect-container-result"
            style="color: red; text-align: right; margin-right: 5px"
          >
            管线不连通
          </div>
        </el-col>
      </el-row>
      <el-row class="analysisconnect-container-table">
        <el-col :span="24">
          <el-scrollbar>
            <el-table
              :height="tableHeight"
              :data="tableData.freeObj"
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
  name: "analysisConnective",
  data() {
    return {
      dialogVisible: true,
      disabled: true,
      disabledAnalysis: true,
      startTubulation: null,
      layerGUID1: null,
      endTubulation: null,
      layerGUID2: null,
      $layerGuid: null,
      analysisLoading: false,
      downloadLoading: false, //是否正在导出excel
      detailCheckbox: false, //详细信息checkbox是否选中
      detailInfoShow: false, //控制详情框显示
      detailInfo: [],
      $selChange: null, //清除抓取事件回调
      tableData: {
        freeObj: [],
      }, //分析结果数据
      showResult: false, //是否展示详情
      $filedCfgJson: "", //管线字段映射文件
      $pipelID: "", //管线编号字段
      $pipepID: "", //管点编号字段
      flag: false, //管线是否连通
    };
  },
  components: {
    Popover,
  },
  computed: {
    tableHeight() {
      return (390 / 1920) * window.innerWidth;
    },
  },
  methods: {
    getRowClass() {
      return "background:rgba(16, 34, 119, 0.1);color:#ffffff;";
    },
    pickTubulation(index) {
      var application = this.stampAPI.usearth.application;
      if (
        application._selectedEntityChanged._listeners &&
        application._selectedEntityChanged._listeners.length > 0
      ) {
        application._selectedEntityChanged._listeners.length = 0;
      }
      application.pickingEnable = true;
      const self = this;
      if (this.$selChange) {
        this.$selChange();
        this.$selChange = null;
      }
      this.$selChange = application._selectedEntityChanged.addEventListener(
        function (res) {
          if (!res) {
            return;
          }
          if (Array.isArray(res) && res.length == 0) {
            return;
          }
          self.$selChange();
          self.$selChange = null;
          // application._selectedEntityChanged._listeners =[]
          application.pickingEnable = false;
          if (Array.isArray(res) && res.length > 0 && res[0].layer) {
            let guid = res[0].layer._id;
            if (guid.indexOf("container") < 0) {
              self.$message({
                message: "选择对象为非管段，请重新选择!",
                type: "warning",
              });
              return;
            }
            if (index == 1) {
              self.startTubulation = res[0].properties.properties.Key;
              self.layerGUID1 = guid;
              self.$layer = self.stampAPI.usearth.LayerManager.GetLayerByGUID(
                self.layerGUID1.split("_")[0]
              );
            } else {
              self.endTubulation = res[0].properties.properties.Key;
              self.layerGUID2 = guid;
              self.$layerGuid = self.layerGUID2.split("_")[0];
              self.$layer = self.stampAPI.usearth.LayerManager.GetLayerByGUID(
                self.$layerGuid
              );
              setTimeout(
                () => (self.$layer.container._highlight_objs = []),
                STAMP_config.highLightTime
              );
            }
            if (self.startTubulation && self.endTubulation) {
              self.disabledAnalysis = false;
            }
          }
        }
      );
    },
    allAnalysis() {
      this.tableData.freeObj = [];
      this.$hightLightArr = [];
      this.$layer.container._highlight_objs = [];
      this.analysisLoading = true;
      if (!Object.is(this.layerGUID1, this.layerGUID2)) {
        this.$message({
          message: "管线不在同一个图层!",
          type: "warning",
        });
        return false;
      }

      const params = {
        rt: "connection",
        service: this.layerGUID1.split("_")[0],
        aparam: `0,${this.startTubulation},${this.endTubulation}`,
      };
      networkGet(params)
        .then((res) => {
          this.analysisLoading = false;
          this.disabled = false;
          this.flag = false;
          let jsonObj = this.$x2js.xml2js(res.data).Xml;
          if (Object.is(jsonObj.ConnectionResult._conn, "false")) {
            this.flag = true;
            this.tableData = [];
            this.$message({
              message: "管线不连通!",
              type: "warning",
            });
          }
          this.toTableData(
            jsonObj.ConnectionResult.LineResult.Record,
            // jsonObj.ConnectionResult.PointResult.Record
            []
          );
        })
        .catch((e) => {});
    },
    toTableData(lineData, pointData) {
      this.$pipelID =
        this.$pipelID ||
        getNameNoIgnoreCase(this.$filedCfgJson, "US_KEY", "1", true);
      this.$pipepID =
        this.$pipepID ||
        getNameNoIgnoreCase(this.$filedCfgJson, "US_KEY", "0", true);
      let tempArr = [];
      Array.isArray(lineData) || (lineData = [lineData]);
      for (let lobj of lineData) {
        tempArr.push({
          id:
            lobj[this.$pipelID] ||
            lobj[this.$pipelID.toLowerCase()] ||
            lobj["us_key"],
          type: "管线",
        });
      }
      Array.isArray(pointData) || (pointData = [pointData]);
      for (let pobj of pointData) {
        tempArr.push({
          id:
            pobj[this.$pipepID] ||
            pobj[this.$pipepID.toLowerCase()] ||
            lobj["us_key"],
          type: "管点",
        });
      }
      this.tableData.freeObj = Object.freeze(tempArr);
    },
    getDetailInfo(row, col, e) {
      const self = this;

      self.$layer.container._highlight_objs = [];
      self.$layer.well._highlight_objs = [];
      self.$layer.joint._highlight_objs = [];

      if (self.timeoutId) {
        clearTimeout(self.timeoutId);
        self.timeoutId = null;
      }

      let gisServer = self.$layer._gis_server_connection;

      if (row.type == "管线") {
        this.$pipelID =
          this.$pipelID ||
          getNameNoIgnoreCase(this.$filedCfgJson, "US_KEY", "1", true);
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
                self.flag = false;
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
        this.$pipepID =
          this.$pipepID ||
          getNameNoIgnoreCase(this.$filedCfgJson, "US_KEY", "0", true);
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
        const data = convertExcelData(filterVal, this.tableData.freeObj);
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: "连通分析",
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
    showResult(newV, oldV) {
      if (newV) {
        const self = this;
        if (!this.$hightLightArr.length) {
          var idsArr = this.tableData.freeObj.map((v) => v.id);
          if (idsArr.length < 6) {
            this.$layer.container.query_param.clear_search_parameter();
            this.$layer.container.query_param.set_pkeyword_value(idsArr);
            self.$layer.container.query_param.execute_search(
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
            if (result) {
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
  beforeDestroy() {},
  beforeRouteLeave(to, from, next) {
    this.$parent.$refs.functionPanel.curSelMenu.name = "";
    if (this.$layer) {
      this.$layer.container._highlight_objs = [];
      this.$layer.well._highlight_objs = [];
      this.$layer.joint._highlight_objs = [];
    }

    if (this.$selChange) {
      const application = this.stampAPI.usearth.application;
      if (
        application._selectedEntityChanged._listeners &&
        application._selectedEntityChanged._listeners.length > 0
      ) {
        application._selectedEntityChanged.removeEventListener(this.$selChange);
      }
      application.pickingEnable = false;
      this.$selChange = null;
    }
    next();
  },
};
</script>

<style lang="less" scoped>
.analysisconnect {
  width: 300px;
}

.el-row {
  margin-bottom: 5px;

  &:last-child {
    margin-bottom: 0px;
  }
}

.analysisconnect-container {
  height: 550px;

  .analysisconnect-container-text {
    height: 30px;
    line-height: 30px;
    font-size: 14px;
  }

  .analysisconnect-container-result {
    height: 30px;
    line-height: 30px;
    font-weight: 700;
    text-align: left;
    padding-left: 10px;
    // background: rgba(1, 76, 91, 1);
  }

  .analysisconnect-container-table {
    margin-bottom: 0px;
  }

  .analysisconnect-container-pagination {
    margin-bottom: 0px;
  }
}

.text {
  padding-right: 5px;
  text-align: right;
}
</style>
