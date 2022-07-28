<template>
  <Popover
    :visible.sync="dialogVisible"
    :show-header="true"
    title="预警分析"
    custom-class="AnalysisWarning"
    :beforeClose="handleClose"
  >
    <div class="analysiswarning-container">
      <el-row>
        <el-col :span="8" class="analysiswarning-container-text">
          <div class="text">图层：</div>
        </el-col>
        <el-col :span="16">
          <el-select v-model="searchLayer" size="mini" style="width: 75%">
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
        <el-col :span="8" class="analysiswarning-container-text">
          <div class="text">剩余年限：</div>
        </el-col>
        <el-col :span="12">
          <el-input v-model.number="years" v-input-focus></el-input>
        </el-col>
        <el-col :span="4" class="analysiswarning-container-text">
          <div>年</div>
        </el-col>
      </el-row>
      <el-row>
        <el-button type="primary" size="mini" @click="allAnalysis"
          >分析</el-button
        >
      </el-row>
      <el-row>
        <el-col :span="12" class="analysiswarning-container-result">
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
      <el-row class="analysiswarning-container-table">
        <el-col :span="24">
          <el-scrollbar>
            <el-table
              :height="tableHeight"
              :data="tableData"
              :row-style="getRowClass"
              @row-dblclick="getDetailInfo"
              v-show="!detailInfoShow"
            >
              <el-table-column
                prop="id"
                label="编号"
                :show-overflow-tooltip="true"
              ></el-table-column>
              <el-table-column
                prop="time"
                label="埋设日期"
                :show-overflow-tooltip="true"
              ></el-table-column>
              <el-table-column
                prop="year"
                label="设计年限"
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
        <el-col :span="24" class="analysiswarning-container-pagination">
          <el-pagination
            v-if="isPaginationVisible"
            layout="prev, pager, next"
            :total="recordNum"
            :page-size="pageSize"
            small
            @current-change="handleCurrentChange"
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
  getValueCfgXml,
  getNameNoIgnoreCase,
  getNameNoIgnoreCase1,
  getUseYear,
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
    this.$valueCfgJson = "";
    this.$pipelID = ""; //管线编号字段
    this.$pipepID = ""; //管点编号字段
    this.$hightLightArr = []; //高亮对象guid
    this.timer = null;
    this.lastLayer = null;
    return {
      dialogVisible: true,
      searchLayer: null,
      disabled: true,
      analysisRadius: 10,
      tableData: [],
      downloadLoading: false,
      detailCheckbox: false,
      detailInfoShow: false,
      detailInfo: [],
      years: 5,
      showResult: false, //是否显示结果
      isPaginationVisible: false,
      recordNum: 0,
      currentPage: 1,
      pageSize: 20,
    };
  },
  components: {
    Popover,
  },
  computed: {
    tableHeight() {
      return (380 / 1920) * window.innerWidth;
    },
  },
  mounted() {
    this.pipeData = this.g_Project.pipeListData;
    this.project = this.g_Project.project;
    this.searchLayer = this.pipeData.length > 0 ? this.pipeData[0].guid : null;
    let urlSearch = this.g_Project.FieldMap;
    let urlValueMap = this.g_Project.ValueMap;
    if (urlSearch == "") {
      this.$message({
        message: "当前工程没有管线配置信息",
        type: "warning",
      });
      return;
    }

    getFiledCfgXml(urlSearch, this).then((res) => {
      this.$filedCfgJson = res;
    });

    getValueCfgXml(urlValueMap, this).then((res) => {
      this.$valueCfgJson = res;
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
  methods: {
    getRowClass() {
      return "background:#3f5c6d2c;color:#ffffff;";
    },
    allAnalysis() {
      if (this.showResult) {
        this.showResult = false;
      }
      this.$hightLightArr = [];
      this.currentPage = 1;
      this.requestData(this.currentPage);
    },
    requestData(pageNumber) {
      this.tableData = [];
      let earth = this.stampAPI.usearth;
      const date = new Date();
      const yearNow = date.getFullYear();
      const layer = earth.LayerManager.GetLayerByGUID(this.searchLayer);
      const startYear = yearNow + this.years + "-01-01";
      const endYear = yearNow + this.years + "-12-31";
      let params = {
        rt: "life",
        service: this.searchLayer,
        year1: startYear,
        year2: endYear,
        pg: `${pageNumber - 1}, 20`,
        gisServer: layer._gis_server_connection,
      };
      pipelineGet(params).then((res) => {
        let json = this.$x2js.xml2js(res.data).Xml;
        if (json == null || !json.LifeMgrResult.Result) {
          this.$message("数据服务出错！");
          return;
        }
        if (
          json.LifeMgrResult.count == 0 ||
          json.LifeMgrResult.TotalLength <= 0
        ) {
          this.$message("分析结果为空！");
          return;
        }
        let type = "line";
        let analysisResult = json.LifeMgrResult.Pipeline;
        if (pageNumber === 1) {
          this.recordNum = Number(json.LifeMgrResult.Result._total);
        }
        this.isPaginationVisible = true;
        this.disabled = false;
        if (this.recordNum < 1) {
          this.$message("无该图层分析数据");
          return;
        }
        if (this.recordNum == 1) {
          analysisResult = [analysisResult];
        }
        getNameNoIgnoreCase(
          this.$filedCfgJson,
          "US_PMATER",
          "1",
          true
        ).toLowerCase();
        for (let i = 0; i < analysisResult.length; i++) {
          let id =
            analysisResult[i][
              getNameNoIgnoreCase(
                this.$filedCfgJson,
                "US_KEY",
                "1",
                true
              ).toLowerCase()
            ];
          let time =
            analysisResult[i][
              getNameNoIgnoreCase(
                this.$filedCfgJson,
                "US_BD_TIME",
                "1",
                true
              ).toLowerCase()
            ];
          let year = getUseYear(
            this.$valueCfgJson,
            analysisResult[i][
              getNameNoIgnoreCase(
                this.$filedCfgJson,
                "US_PMATER",
                "1",
                true
              ).toLowerCase()
            ]
          );
          this.tableData.push({
            id,
            time,
            year,
          });
          this.$hightLightArr.push(id);
        }
      });
    },
    handleCurrentChange(curPage) {
      this.requestData(curPage);
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
      this.$pipelID =
        this.$pipelID ||
        getNameNoIgnoreCase(this.$filedCfgJson, "US_KEY", "1", true);
      let searchParam = `rd=&t=container&c=${this.searchLayer}&pk=${row.id}&rt=1&mesh=0&detail=0&p=0&pl=100`;
      //   let postDataParam = `service=${this.searchLayer}&qt=16&dt=line&pc=(and,equal,${this.$pipelID},${row.id})&pg=0,10&encoding=utf-8&`;
      let postDataParam = {
        service: this.searchLayer,
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
            }
            var layer = self.stampAPI.usearth.LayerManager.GetLayerByGUID(
              self.searchLayer
            );
            layer.container._highlight_objs.push(modelData["SE_ID"]);
            self.timer = setTimeout(
              () => (layer.container._highlight_objs = []),
              STAMP_config.highLightTime
            );
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
        const tHeader = ["编号", "埋设日期", "设计年限"];
        const filterVal = ["id", "time", "year"];
        const data = convertExcelData(filterVal, this.tableData);
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: "预警分析",
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
        let queryLayer = earth.LayerManager.GetLayerByGUID(self.searchLayer);
        if (isShow) {
          if (this.$hightLightArr.length) {
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
      }
    },
    handleClose() {
      this.$router.push("/");
    },
  },
  beforeRouteLeave(to, from, next) {
    next();
    if (this.showResult && this.$hightLightArr.length > 0) {
      this.showHightlight(false);
    }
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.lastLayer) {
      this.lastLayer.container._highlight_objs = [];
      this.lastLayer = null;
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
.AnalysisWarning {
  width: 300px;
}

.el-row {
  margin-bottom: 5px;

  &:last-child {
    margin-bottom: 0px;
  }
}

.analysiswarning-container {
  height: 550px;

  .analysiswarning-container-text {
    height: 30px;
    line-height: 30px;
    font-size: 14px;
    text-align: left;
    padding-left: 5px;
  }

  .analysiswarning-container-result {
    height: 30px;
    line-height: 30px;
    font-weight: 700;
    text-align: left;
    padding-left: 10px;
    // background: rgba(1, 76, 91, 1);
  }

  .analysiswarning-container-table {
    margin-bottom: 0px;
  }

  .analysiswarning-container-pagination {
    margin-bottom: 0px;
  }
}

.text {
  text-align: right;
  padding-right: 5px;
}
</style>
