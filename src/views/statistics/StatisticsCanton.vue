<template>
  <popoverStat
    :visible.sync="dialogVisible"
    :show-header="true"
    title="行政统计"
    custom-class="QuerySpatial"
    :beforeClose="handleClose"
    :dblClick="handleDblclick"
  >
    <el-row
      v-loading="loading"
      element-loading-background="rgba(0, 0, 0, 0.6)"
      element-loading-text="正在查询"
      element-loading-spinner="el-icon-loading"
      element-loading-custom-class="loading_color"
    >
      <el-col :span="10">
        <el-row>
          <el-form>
            <el-form-item label="行政区划：">
              <el-input v-model="tubulation" v-input-focus></el-input>
              <el-button
                @click.prevent="pickTubulation"
                type="primary"
                size="mini"
                class="afterUnit"
                >查询</el-button
              >
            </el-form-item>
          </el-form>
        </el-row>
        <el-row class="leftDiv">
          <el-col :span="12">
            <span>行政区划：</span>
          </el-col>
          <el-col :span="12">
            <span style="margin-left: 5px">图层：</span>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-row class="layer_container" style="padding-left: 0">
              <el-scrollbar style="height: 100%" wrap-class="scrollbar-wrapper">
                <el-tree
                  :data="treeData"
                  :props="defaultProps"
                  highlight-current
                  @node-click="handleNodeClick"
                >
                </el-tree>
              </el-scrollbar>
            </el-row>
          </el-col>
          <el-col :span="12">
            <el-row class="layer_container">
              <el-scrollbar style="height: 100%" wrap-class="scrollbar-wrapper">
                <el-checkbox-group v-model="checklist">
                  <el-checkbox
                    v-for="item in layerList"
                    :key="item.id"
                    :label="item.id"
                    >{{ item.name }}</el-checkbox
                  >
                </el-checkbox-group>
              </el-scrollbar>
            </el-row>
          </el-col>
        </el-row>
        <el-row class="centerDiv">
          <el-button
            type="primary"
            size="mini"
            @click="query"
            :disabled="checklist.length == 0 || !sc"
            >统计</el-button
          >
        </el-row>
      </el-col>
      <el-col :span="14">
        <el-row style="padding-right: 5px">
          <el-table
            :data="tableData"
            :span-method="objectSpanMethod"
            border
            stripe
          >
            <el-table-column
              prop="layerName"
              label="图层"
              :show-overflow-tooltip="true"
              header-align="center"
              align="center"
            ></el-table-column>
            <el-table-column
              prop="TIMES"
              label="数量"
              :show-overflow-tooltip="true"
              header-align="center"
              align="center"
            ></el-table-column>
            <el-table-column
              prop="LENGTH"
              label="长度(km)"
              :show-overflow-tooltip="true"
              header-align="center"
              align="center"
            ></el-table-column>
          </el-table>
        </el-row>
        <el-row>
          <div id="pieChart" class="chartContainerClass" />
        </el-row>
        <el-row class="rightDiv">
          <el-button
            type="primary"
            size="mini"
            @click="exportResult"
            :disabled="isExportDisabled"
            :loading="isExportLoading"
            >导出</el-button
          >
        </el-row>
      </el-col>
    </el-row>
  </popoverStat>
</template>

<script>
import popoverStat from "@/components/popoverStat";
import onlyNumber from "@/directives/el-only-number";
import {
  getPipeList,
  getField,
  queryFunc,
  statisticsSpatialCondition,
  staticResultByMutilLayer,
  exportFile,
  showPieChart,
} from "./StatisticsCommon";
import { getNameNoIgnoreCase } from "@/api/query";

let lastPolygon = null;

export default {
  directives: { onlyNumber },
  components: {
    popoverStat,
  },
  data() {
    return {
      dialogVisible: true,
      treeData: [],
      defaultProps: {
        children: "children",
        label: "name",
      },
      checklist: [],
      layerList: [],
      tableData: [],
      tubulation: "",
      inputRadius: "10",
      checkLayerList: [],
      isExportDisabled: true,
      isExportLoading: false,
      field: "US_ATTACHMENT",
      lineField: "US_PMATER",
      fieldLabel: "类型",
      spanArr: [],
      sc: "",
      pc: "",
      typeId: "all",
      statusField: "US_BD_TIME",
      statusLineField: "US_BD_TIME",
      project: "",
      loading: false,
    };
  },
  computed: {
    pipelineData() {
      return this.$store.state.pipelineLayerData;
    },
  },
  mounted() {
    this.layerList = [];
    getPipeList(this, this.pipelineData);

    this.project = this.g_Project.project;

    let self = this;
    getField(this, function (res) {
      self.lineField = getNameNoIgnoreCase(res, self.lineField, "1", true);
      self.field = getNameNoIgnoreCase(res, self.field, "0", true);
      self.statusLineField = getNameNoIgnoreCase(
        res,
        self.statusLineField,
        "1",
        true
      );
      self.statusField = getNameNoIgnoreCase(res, self.statusField, "0", true);
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
    handleClose() {
      this.$router.push("/");
    },
    handleDblclick() {},
    pickTubulation() {
      this.sc = "";
      let params = {
        service: "canton3",
        qt: 17,
        fd: "name",
        project: this.project,
        encoding: "utf-8",
        pg: "0,1000",
      };
      if (this.tubulation !== "") {
        params.pc = `(and,like,name,${this.tubulation})`;
      }

      let self = this;
      self.loading = true;
      queryFunc(params)
        .then(function (res) {
          var json = self.$x2js.xml2js(res.data).Xml;
          if (json && json.Result && json.Result.Record) {
            var records = json.Result.Record;
            Array.isArray(records) || (records = [records]);

            let roadArr = [];
            self.treeData = [];
            for (let i = 0; i < records.length; i++) {
              if (roadArr.indexOf(records[i].name) == -1) {
                roadArr.push(records[i].name);
                self.treeData.push(records[i]);
              }
            }
          }
        })
        .finally(() => {
          self.loading = false;
        });
    },
    handleNodeClick(data) {
      var jsonShap = data.SHAPE;

      var coords = jsonShap.Polygon.Coordinates.split(",");
      let linePoints = [];
      for (var i = 0; i < coords.length; i += 3) {
        linePoints.push({
          longitude: Number(coords[i]),
          latitude: Number(coords[i + 1]),
          height: Number(coords[i + 2]),
        });
      }
      this.sc = "";
      this.createBuffer(linePoints);
    },
    createBuffer(polygonArray) {
      var earth = this.stampAPI.usearth;
      if (lastPolygon) {
        earth.document.elementRoot.detach_object(lastPolygon);
        lastPolygon = null;
      }

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
      lastPolygon = polygon;

      let minX, maxX, minY, maxY;

      var pointString = "";
      for (let i = 0; i < polygonArray.length; i++) {
        if (pointString !== "") {
          pointString += ",";
        }
        pointString +=
          polygonArray[i].longitude + "," + polygonArray[i].latitude + ",0";

        if (!minX || minX > polygonArray[i].longitude) {
          minX = polygonArray[i].longitude;
        }
        if (!maxX || maxX < polygonArray[i].longitude) {
          maxX = polygonArray[i].longitude;
        }
        if (!minY || minY > polygonArray[i].latitude) {
          minY = polygonArray[i].latitude;
        }
        if (!maxY || maxY < polygonArray[i].latitude) {
          maxY = polygonArray[i].latitude;
        }
      }
      this.sc = "(2" + "," + polygonArray.length + "," + pointString + ")";

      var width = (maxX - minX) / 2;
      var heigth = (maxY - minY) / 2;
      var range =
        ((width / 180) * Math.PI * 6378137) / Math.tan((22.5 / 180) * Math.PI);
      var range1 =
        ((heigth / 180) * Math.PI * 6378137) / Math.tan((22.5 / 180) * Math.PI);

      var tmpPoints = [];
      var tempPoint = new StampGis.Cartographic(
        polygon.transform.longitude,
        polygon.transform.latitude,
        0
      );
      tmpPoints.push(tempPoint);

      var promise = earth.document.get_batch_dem_height_from_server(tmpPoints);
      if (promise == undefined) {
        return;
      }

      StampGis.when(promise, function () {}).then(() => {
        var pos = StampGis.Cartesian3.fromRadians(
          tmpPoints[0].longitude,
          tmpPoints[0].latitude,
          tmpPoints[0].height + Math.max(range, range1)
        );
        earth.application.observer.flyTo({
          destination: pos,
          orientation: {
            heading: StampGis.StampMath.toRadians(0),
            pitch: StampGis.StampMath.toRadians(-90),
            roll: 0.0,
          },
        });
      });
    },
    clearChart() {
      var chartElement = document.getElementById("pieChart");
      var myChart = this.$echarts.init(chartElement);
      myChart.setOption({}, true);
    },
    query() {
      let self = this;

      self.tableData = [];
      self.isExportDisabled = true;
      self.sc = "";
      self.pc = "";
      self.clearChart();

      statisticsSpatialCondition(self, 0, function () {
        let postArr = [];
        for (let i = 0; i < self.checklist.length; i++) {
          postArr.push({
            service: self.checklist[i],
            qt: 2,
            dt: "line",
            sc: self.sc ? self.sc : "",
            encoding: "utf-8",
          });
        }
        staticResultByMutilLayer(self, postArr);
      });
    },
    getSpanArr(tableData) {
      var kIndex = 0;
      var tmpValue = "";
      this.spanArr = [];
      for (var i = 0; i < tableData.length; i++) {
        if (tableData[i].layerName != tmpValue) {
          this.spanArr.push(0);
          kIndex = this.spanArr.length - 1;
          tmpValue = tableData[i].layerName;
        } else {
          this.spanArr.push(0);
        }
        this.spanArr[kIndex]++;
      }
    },
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex == 0) {
        const _row = this.spanArr[rowIndex];
        const _col = _row > 0 ? 1 : 0;
        return {
          rowspan: _row,
          colspan: _col,
        };
      }
    },
    handlePieChange() {
      var legendData = [];
      var seriesData = [];

      for (let i = 0; i < this.tableData.length; i++) {
        if (legendData.indexOf(this.tableData[i].layerName) == -1) {
          legendData.push(this.tableData[i].layerName);
          seriesData.push({
            name: this.tableData[i].layerName,
            value: Number(this.tableData[i].TIMES),
          });
        }
      }

      showPieChart(this, legendData, seriesData);
    },
    exportResult() {
      this.isExportLoading = true;
      exportFile(this);
    },
  },
  beforeRouteLeave(to, from, next) {
    var earth = this.stampAPI.usearth;
    if (lastPolygon) {
      earth.document.elementRoot.detach_object(lastPolygon);
      lastPolygon = null;
    }
    this.$parent.$refs.functionPanel.curSelMenu.name = "";
    next();
  },
};
</script>

<style lang="less" scoped src="../../style/query.less" ></style>
<style lang="less" scoped>
.chartContainerClass {
  height: 258px;
}

.layer_container {
  height: 494px;
}
.el-tree {
  padding: 0;
}
/deep/ .el-tree-node__content > .el-tree-node__expand-icon {
  padding: 0;
}
/deep/ .el-tree-node__content {
  height: 19px;
  line-height: 19px;
}
</style>