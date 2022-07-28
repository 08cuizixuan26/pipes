<template>
  <Popover
    :visible.sync="dialogVisible"
    :show-header="true"
    title="覆土分析"
    custom-class="analysiscoverdepth"
    :beforeClose="handleClose"
  >
    <div class="analysiscoverdepth-container">
      <el-row>
        <el-col :span="6" class="analysiscoverdepth-container-text">
          <div class="text">图层：</div>
        </el-col>
        <el-col :span="15">
          <el-select v-model="searchLayer" size="mini">
            <el-option
              v-for="item in pipeData"
              :key="item.name"
              :label="item.name"
              :value="item.guid"
            ></el-option>
          </el-select>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-button type="primary" size="mini" @click="allAnalysis"
            >全部</el-button
          >
          <el-button type="primary" size="mini" @click="circleAnalysis"
            >圆形</el-button
          >
          <el-button type="primary" size="mini" @click="polygonAnalysis"
            >多边形</el-button
          >
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12" class="analysiscoverdepth-container-result">
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
              @click="backToList"
            />
          </transition>
        </el-col>
      </el-row>
      <el-row class="analysiscoverdepth-container-table">
        <el-col :span="24">
          <el-scrollbar>
            <el-table
              size="mini"
              :height="tableHeight"
              :data="tableData"
              :row-style="getRowClass"
              @row-dblclick="getDetailInfo"
              v-show="!detailInfoShow"
              :cell-style="finalCellStyle"
            >
              <el-table-column
                prop="id"
                width="70"
                label="编号"
                :show-overflow-tooltip="true"
              ></el-table-column>
              <el-table-column
                prop="s_deep"
                width="70"
                label="起点"
                :show-overflow-tooltip="true"
              ></el-table-column>
              <el-table-column
                prop="e_deep"
                width="75"
                label="终点"
                :show-overflow-tooltip="true"
              ></el-table-column>
              <el-table-column
                prop="iso"
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
          </el-scrollbar>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24" class="analysiscoverdepth-container-pagination">
          <!-- v-show="isPaginationVisible" -->
          <el-pagination
            layout="prev, pager, next"
            :total="recordNum"
            :page-size="pageSize"
            small
            @current-change="handleCurrentChange"
            :current-page.sync="currentPage"
          >
          </el-pagination>
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
import Popover from "@/components/Popover";
export default {
  name: "AnalysisCoveringDepth",
  data() {
    this.pipeData = [];
    this.project = null;
    this.$queryParam = {};
    this.$filedCfgJson = "";
    this.$pipelID = ""; //管线编号字段
    this.$pipepID = ""; //管点编号字段
    this.$hightLightArr = []; //高亮对象guid
    this.timer = null;
    this.lastLayer = null;
    return {
      dialogVisible: true,
      disabled: true,
      searchLayer: null,
      analysisRadius: 10,
      tableData: [],
      downloadLoading: false,
      detailCheckbox: false,
      detailInfoShow: false,
      detailInfo: [],
      pageSize: 20,
      showResult: false, //是否显示结果
      isPaginationVisible: false,
      recordNum: 0,
      currentPage: 1,
    };
  },
  components: {
    Popover,
  },
  computed: {
    tableHeight() {
      return (420 / 1920) * window.innerWidth;
    },
  },
  mounted() {
    this.pipeData = this.g_Project.pipeListData;
    this.project = this.g_Project.project;
    this.searchLayer = this.pipeData.length > 0 ? this.pipeData[0].guid : null;

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
    circleAnalysis() {
      let earth = this.stampAPI.usearth;
      let self = this;
      if (this.showResult) {
        this.showResult = false;
      }
      this.$hightLightArr = [];
      earth.ShapeCreator.Clear();
      earth.ShapeCreator.CreateCircle({
        custom_excute_finish: function (result) {
          if (!result || !result.data || !result.radius) {
            self.$message({
              message: "请至少绘制两个点创建圆",
              type: "warning",
              center: true,
            });
            earth.ShapeCreator.Clear();
            return;
          }
          self.$queryParam = {
            data: result,
            type: 1,
          };
          self.requestData(result, 1);
        },
      });
    },
    polygonAnalysis() {
      let earth = this.stampAPI.usearth;
      let self = this;
      if (this.showResult) {
        this.showResult = false;
      }
      this.$hightLightArr = [];
      earth.ShapeCreator.Clear();
      earth.ShapeCreator.CreatePolygon({
        custom_excute_finish: function (result) {
          if (!result || result.data.length < 3) {
            self.$message({
              message: "请至少绘制三个点",
              type: "warning",
              center: true,
            });
            earth.ShapeCreator.Clear();
            return;
          }
          self.$queryParam = {
            data: result,
            type: 2,
          };
          self.requestData(result, 2);
        },
      });
    },
    allAnalysis() {
      if (this.showResult) {
        this.showResult = false;
      }
      this.$hightLightArr = [];
      this.$queryParam = {
        data: null,
        type: 3,
      };
      this.requestData(null, 3);
    },
    requestData(result, type, isTotal) {
      let earth = this.stampAPI.usearth;
      let self = this;
      this.tableData = [];
      let layer = earth.LayerManager.GetLayerByGUID(this.searchLayer);
      let params = {};
      if (type == 1) {
        let jwd = StampGis.Cartographic.fromCartesian(result.data[0]);
        let lon = StampGis.StampMath.toDegrees(jwd.longitude);
        let lat = StampGis.StampMath.toDegrees(jwd.latitude);
        params = {
          rt: "depth",
          service: this.searchLayer,
          sc: `(3,0,${result.radius},${lon},${lat})`,
          pg: isTotal ? "0,10000" : `${this.currentPage - 1},${this.pageSize}`,
          gisServer: layer._gis_server_connection,
        };
      } else if (type == 2) {
        let str = "";
        for (let i = 0; i < result.data.length; i++) {
          let jwd = StampGis.Cartographic.fromCartesian(result.data[i]);
          let lon = StampGis.StampMath.toDegrees(jwd.longitude);
          let lat = StampGis.StampMath.toDegrees(jwd.latitude);
          if (str === "") {
            str = str + lon + "," + lat + "," + 0;
          } else {
            str = str + "," + lon + "," + lat + "," + 0;
          }
        }
        params = {
          rt: "depth",
          service: this.searchLayer,
          sc: `(2,${result.data.length},${str},)`,
          pg: isTotal ? "0,10000" : `${this.currentPage - 1},${this.pageSize}`,
          gisServer: layer._gis_server_connection,
        };
      } else if (type == 3) {
        params = {
          rt: "depth",
          service: this.searchLayer,
          pg: isTotal ? "0,10000" : `${this.currentPage - 1},${this.pageSize}`,
          gisServer: layer._gis_server_connection,
        };
      }

      self.$pipelID =
        self.$pipelID ||
        getNameNoIgnoreCase(self.$filedCfgJson, "US_KEY", "1", true);
      self.$pipepID =
        self.$pipepID ||
        getNameNoIgnoreCase(self.$filedCfgJson, "US_KEY", "0", true);

      pipelineGet(params).then((res) => {
        let json = self.$x2js.xml2js(res.data).Xml;
        if (json == null || !json.depthResult) {
          self.$message("分析结果为空！");
          return;
        }
        let type = "line";
        let analysisResult = json.depthResult;
        let recordsNum = analysisResult._total;
        self.recordNum = Number(recordsNum);
        self.isPaginationVisible = true;
        let firstResults = analysisResult.Record;
        if (self.recordNum < 1) {
          self.$message("无该图层分析数据");
          return;
        }
        if (self.recordNum == 1) {
          firstResults = [firstResults];
        }
        let sclass = "bgNone";
        let eclass = "bgNone";
        self.disabled = false;
        for (let i = 0; i < firstResults.length; i++) {
          var s_deep = getNameNoIgnoreCase(
            self.$filedCfgJson,
            "US_SDEEP",
            "1",
            true
          );
          var e_deep = getNameNoIgnoreCase(
            self.$filedCfgJson,
            "US_EDEEP",
            "1",
            true
          );
          let sd = Number(
            firstResults[i][s_deep] || firstResults[i][s_deep.toLowerCase()]
          ).toFixed(2);
          let ed = Number(
            firstResults[i][e_deep] || firstResults[i][e_deep.toLowerCase()]
          ).toFixed(2);
          let deepIso = firstResults[i].ISO;
          sd < deepIso ? (sclass = "bgRed") : (sclass = "bgNone");
          ed < deepIso ? (eclass = "bgRed") : (eclass = "bgNone");
          !isTotal &&
            self.tableData.push({
              id:
                firstResults[i][self.$pipelID] ||
                firstResults[i][self.$pipelID.toLowerCase()],
              s_deep: sd,
              e_deep: ed,
              iso: deepIso,
              sclass: sclass,
              eclass: eclass,
            });
          if (deepIso > sd || deepIso > ed) {
            self.$hightLightArr.push(
              firstResults[i][self.$pipelID] ||
                firstResults[i][self.$pipelID.toLowerCase()]
            );
          }
        }
      });
    },
    finalCellStyle: function ({ row, column, rowIndex, columnIndex }) {
      if (
        (row.sclass == "bgRed" && columnIndex == 1) ||
        (row.eclass == "bgRed" && columnIndex == 2)
      ) {
        return {
          background: "#f7b1b180",
        };
      }
    },
    handleCurrentChange(val) {
      this.requestData(this.$queryParam.data, this.$queryParam.type);
    },
    backToList() {
      this.detailInfoShow = false;
      this.isPaginationVisible = true;
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
        this.searchLayer
      );
      this.lastLayer = layer;
      let gisServer = layer._gis_server_connection;
      const self = this;
      self.$pipelID =
        self.$pipelID ||
        getNameNoIgnoreCase(self.$filedCfgJson, "US_KEY", "1", true);
      //this.isPaginationVisible = false;
      let searchParam = `rd=&t=container&c=${this.searchLayer}&pk=${row.id}&rt=1&mesh=0&detail=0&p=0&pl=100`;
      //   let postDataParam = `service=${this.searchLayer}&qt=16&dt=line&pc=(and,equal,${self.$pipelID},${row.id})&pg=0,10&encoding=utf-8&`;
      let postDataParam = {
        service: this.searchLayer,
        qt: 16,
        dt: "line",
        pc: `(and,equal,${self.$pipelID},${row.id})`,
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
            }

            var layer = self.stampAPI.usearth.LayerManager.GetLayerByGUID(
              self.searchLayer
            );
            layer.container.query_param.clear_search_parameter();
            layer.container.query_param.set_keyword_value(row.id);

            function searchCallback(options) {
              layer.container._highlight_objs.push(
                options.result && options.result["SE_ID"]
              );
              self.timer = setTimeout(
                () => (layer.container._highlight_objs = []),
                STAMP_config.highLightTime
              );
            }
            layer.container.query_param.execute_search(0, searchCallback, 0);

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
      if (this.detailInfoShow) {
        this.isPaginationVisible = false;
      }
    },
    download() {
      this.downloadLoading = true;
      import("@/vendor/Export2Excel").then((excel) => {
        const tHeader = ["编号", "起点", "终点", "标准"];
        const filterVal = ["id", "s_deep", "e_deep", "iso"];
        const data = convertExcelData(filterVal, this.tableData);
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: "覆土分析",
          autoWidth: true,
          bookType: "xlsx",
        });
        this.downloadLoading = false;
      });
    },
    showHightlight(isShow) {
      const self = this;
      let earth = this.stampAPI.usearth;
      let queryLayer = earth.LayerManager.GetLayerByGUID(this.searchLayer);
      if (isShow) {
        if (this.$hightLightArr.length > 0) {
          var idsArr = this.$hightLightArr;
          if (idsArr.length < 6) {
            queryLayer.container.query_param.clear_search_parameter();
            queryLayer.container.query_param.set_pkeyword_value(idsArr);
            queryLayer.container.query_param.execute_search(
              0,
              searchCallback,
              0
            );
          } else {
            for (let i = 0; i < Math.ceil(idsArr.length / 6); i++) {
              let idsArr2 = idsArr.slice(i * 6, i * 6 + 6);
              queryLayer.container.query_param.clear_search_parameter();
              queryLayer.container.query_param.set_pkeyword_value(idsArr2);
              queryLayer.container.query_param.execute_search(
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
                queryLayer.container._highlight_objs.push(item["SE_ID"]);
              }
            }
          }
        }
      } else {
        queryLayer.container._highlight_objs = [];
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
    if (this.showResult && this.$hightLightArr.length > 0) {
      this.showHightlight(false);
    }
    this.stampAPI.usearth.ShapeCreator.Clear();
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
.analysiscoverdepth {
  width: 18.625vw;
}

.el-row {
  margin-bottom: 5px;

  &:last-child {
    margin-bottom: 0px;
  }
}

.analysiscoverdepth-container {
  height: 570px;

  .analysiscoverdepth-container-text {
    height: 30px;
    line-height: 30px;
    font-size: 14px;
  }

  .analysiscoverdepth-container-result {
    height: 30px;
    line-height: 30px;
    font-weight: 700;
    text-align: left;
    padding-left: 10px;
    // background: rgba(1, 76, 91, 1);
  }

  .analysiscoverdepth-container-table {
    margin-bottom: 0px;
  }

  .analysiscoverdepth-container-pagination {
    margin-bottom: 0px;
  }
}

.text {
  text-align: right;
  padding-right: 5px;
}
</style>
