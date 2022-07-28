<template>
  <Popover
    :visible.sync="dialogVisible"
    :show-header="true"
    title="开挖分析"
    custom-class="analysisexcave"
    :beforeClose="handleClose"
  >
    <div class="analysisexcave-container">
      <el-row>
        <el-col :span="8" class="analysisexcave-container-text">
          <div>缓冲半径：</div>
        </el-col>
        <el-col :span="12">
          <el-input
            v-model.number="radius"
            v-input-focus
            v-only-number="{ max: 50, min: 0, precision: 0 }"
          ></el-input>
        </el-col>
        <el-col :span="4" class="analysisexcave-container-text">
          <div>米</div>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8" class="analysisexcave-container-text">
          <div>基准高程：</div>
        </el-col>
        <el-col :span="12">
          <el-input
            v-model.number="inputAltitude"
            v-input-focus
            v-only-number="{ max: 999999, min: 0, precision: 2 }"
          ></el-input>
        </el-col>
        <el-col :span="4" class="analysisexcave-container-text">
          <div>米</div>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8" class="analysisexcave-container-text">
          <div>开挖深度：</div>
        </el-col>
        <el-col :span="12">
          <el-input
            v-model.number="deep"
            v-input-focus
            v-only-number="{ max: 999999, min: 0, precision: 2 }"
          ></el-input>
        </el-col>
        <el-col :span="4" class="analysisexcave-container-text">
          <div>米</div>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8" class="analysisexcave-container-text">
          <div>挖方容量：</div>
        </el-col>
        <el-col :span="12">
          <el-input
            v-model.number="inputExca"
            v-input-focus
            disabled
          ></el-input>
        </el-col>
        <el-col :span="4" class="analysisexcave-container-text">
          <div>平方米</div>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24" class="analysisexcave-container-text">
          <el-checkbox v-model="fuzhuModel">生成辅助模型</el-checkbox>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-button type="primary" size="mini" @click="getAltitude"
            >获取高程</el-button
          >

          <el-button
            type="primary"
            size="mini"
            @click="roadClip"
            :disabled="btnDisabled"
            >沿路开挖</el-button
          >

          <el-button
            type="primary"
            size="mini"
            @click="customClip"
            :disabled="btnDisabled"
            >自定义开挖</el-button
          >
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12" class="analysisexcave-container-result">
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
      <el-row class="analysisexcave-container-table">
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
                prop="type"
                label="类型"
                :show-overflow-tooltip="true"
              ></el-table-column>
              <el-table-column
                prop="layer"
                label="图层"
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
import analysis from "@/stamplib/AnalysisControl";
import onlyNumber from "@/directives/el-only-number";
export default {
  name: "AnalysisCovering",
  directives: {
    onlyNumber,
  },
  data() {
    this.transparent = 1;
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
      btnDisabled: true,
      disabled: true,
      radius: 5, //缓冲半径
      inputAltitude: "", //基准高程
      deep: 3, //开挖深度
      fuzhuModel: true, //辅助模型
      inputExca: 0, //挖方容量
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
    };
  },
  components: {
    Popover,
  },
  computed: {
    tableHeight() {
      return (280 / 1920) * window.innerWidth;
    },
  },
  mounted() {
    this.transparent = this.stampAPI.usearth.document.terrain_transparency;
    this.$parent.$refs.bottomTool.closePanel("transparent");
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

    getFiledCfgXml(urlValueMap, this).then((res) => {
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
    //获取高程
    getAltitude() {
      let self = this;
      analysis.getAltitude(this.stampAPI.usearth, function (val) {
        self.inputAltitude = val;
        self.btnDisabled = false;
      });
    },
    roadClip() {
      let self = this;
      //先清除一遍辅助模型
      analysis.clear_clip(this.stampAPI.usearth);
      let alt = this.inputAltitude - this.deep;
      analysis.clip(
        this.stampAPI.usearth,
        alt,
        this.fuzhuModel,
        2,
        this.radius,
        function (exca, fill, points) {
          self.inputExca = exca;
          self.analysis(points);
        },
        this
      );
    },
    customClip() {
      let self = this;
      //先清除一遍辅助模型
      analysis.clear_clip(this.stampAPI.usearth);
      let alt = this.inputAltitude - this.deep;
      analysis.clip(
        this.stampAPI.usearth,
        alt,
        this.fuzhuModel,
        1,
        null,
        function (exca, fill, points) {
          self.inputExca = exca;
          self.analysis(points);
        },
        this
      );
    },
    analysis(points) {
      const self = this;
      this.tableData = [];
      self.$hightLightArr = [];
      //循环范围内管线管点
      this.pipeData.forEach((curLayer) => {
        let name = curLayer.name;
        let layer = self.stampAPI.usearth.LayerManager.GetLayerByGUID(
          curLayer.guid
        );
        let pipelnType = 0;
        let pipeTypeName = "";
        let params = "";
        let childrenLayer = [];
        self.$hightLightArr.push({
          guid: curLayer.guid,
          layer: curLayer.name,
          hightLight: [],
        });
        layer.container && childrenLayer.push("container");
        layer.equipment && childrenLayer.push("equipment");
        layer.joint && childrenLayer.push("joint");
        layer.well && childrenLayer.push("well");
        layer.room && childrenLayer.push("room");
        for (let i = 0; i < childrenLayer.length; i++) {
          const element = childrenLayer[i];
          if (element == "container") {
            pipeTypeName = "管线";
            pipelnType = 1;
            params = `rd=&t=container&c=${layer._id}&r=${points}&rt=1&mesh=1&detail=1&p=0&pl=1000`;
          } else if (element == "equipment") {
            pipeTypeName = "附属物";
            pipelnType = 0;
            params = `rd=&t=equipment&c=${layer._id}&r=${points}&rt=1&mesh=1&detail=1&p=0&pl=10000`;
          } else if (element == "joint") {
            pipeTypeName = "特征点";
            pipelnType = 0;
            params = `rd=&t=joint&c=${layer._id}&r=${points}&rt=1&mesh=1&detail=1&p=0&pl=10000`;
          } else if (element == "well") {
            pipeTypeName = "井";
            pipelnType = 0;
            params = `rd=&t=well&c=${layer._id}&r=${points}&rt=1&mesh=1&detail=1&p=0&pl=10000`;
          } else if (element == "room") {
            pipeTypeName = "井室";
            pipelnType = 0;
            params = `rd=&t=room&c=${layer._id}&r=${points}&rt=1&mesh=1&detail=1&p=0&pl=10000`;
          }
          self.requestData(params, pipelnType, pipeTypeName, curLayer.guid);
        }
      });
    },
    requestData(params, type, pipeTypeName, guid) {
      postSearch(params).then((res) => {
        let attrData = this.$x2js.xml2js(res.data).Xml;
        let jsonRecords = null;
        if (
          attrData &&
          attrData.SearchResult &&
          attrData.SearchResult._total > 0 &&
          attrData.SearchResult.ModelResult != null
        ) {
          jsonRecords = attrData.SearchResult.ModelResult.ModelData;
        }
        if (attrData && attrData.SearchResult._total == 1) {
          jsonRecords = [jsonRecords];
        }
        if (jsonRecords == null) {
          return;
        } else {
          this.disabled = false;
        }
        type = type == 0 ? "point" : "line";
        var displayType = type === "point" ? "管点" : "管线";
        for (let i = 0; i < jsonRecords.length; i++) {
          const element = jsonRecords[i];
          this.tableData.push({
            id: element.SE_NAME,
            type: displayType,
            layer: element.ParentLayer,
            guid,
          });
          this.$hightLightArr.forEach((el) => {
            if (el.layer == element.ParentLayer) {
              el.hightLight.push(element.SE_NAME);
            }
          });
        }
      });
    },
    allAnalysis() {
      if (this.showResult) {
        this.showResult = false;
      }
      this.$hightLightArr = [];
      this.requestData();
    },
    backToList() {
      this.detailInfoShow = false;
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
      let layer = this.stampAPI.usearth.LayerManager.GetLayerByGUID(row.guid);
      this.lastLayer = layer;
      let gisServer = layer._gis_server_connection;
      const self = this;
      this.$pipelID =
        this.$pipelID ||
        getNameNoIgnoreCase(this.$filedCfgJson, "US_KEY", "1", true);
      let searchParam = `rd=&t=container&c=${row.guid}&pk=${row.id}&rt=1&mesh=0&detail=0&p=0&pl=100`;
      //   let postDataParam = `service=${row.guid}&qt=16&dt=line&pc=(and,equal,${this.$pipelID},${row.id})&pg=0,10&encoding=utf-8&`;
      let postDataParam = {
        service: row.guid,
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
              row.guid
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
    },
    download() {
      this.downloadLoading = true;
      import("@/vendor/Export2Excel").then((excel) => {
        const tHeader = ["编号", "类型", "图层"];
        const filterVal = ["id", "type", "layer"];
        const data = convertExcelData(filterVal, this.tableData);
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: "开挖分析",
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
          if (isShow) {
            let params = `rd=&t=container&c=${
              layer.guid
            }&pk=${layer.hightLight.join(
              ","
            )}&rt=1&mesh=0&detail=1&p=0&pl=60000`;
            postSearch(params).then((res) => {
              let modelData = self.$x2js.xml2js(res.data).Xml.SearchResult
                .ModelResult.ModelData;
              if (modelData && modelData.length > 0) {
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
      } else {
        return;
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
    analysis.clear_clip(this.stampAPI.usearth);
    this.$parent.$refs.functionPanel.curSelMenu.name = "";
    if (this.stampAPI.usearth.document.terrain_transparency == 1) {
      this.stampAPI.usearth.document.terrain_transparency = this.transparent;
    }

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.lastLayer) {
      this.lastLayer.container._highlight_objs = [];
      this.lastLayer = null;
    }
  },
  watch: {
    showResult(newV, oldV) {
      this.showHightlight(newV);
    },
  },
};
</script>

<style lang="less" scoped>
.analysisexcave {
  width: 300px;
}

.el-row {
  margin-bottom: 5px;

  &:last-child {
    margin-bottom: 0px;
  }
}

.analysisexcave-container {
  height: 550px;

  .analysisexcave-container-text {
    height: 30px;
    line-height: 30px;
    font-size: 14px;
  }

  .analysisexcave-container-result {
    height: 30px;
    line-height: 30px;
    font-weight: 700;
    text-align: left;
    padding-left: 10px;
  }

  .analysisexcave-container-table {
    margin-bottom: 0px;
  }

  .analysisexcave-container-pagination {
    margin-bottom: 0px;
  }
}

/deep/ .el-table--scrollable-x .el-table__body-wrapper {
  overflow-x: hidden;
}
</style>
