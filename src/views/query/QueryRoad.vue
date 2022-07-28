<template>
  <popoverStat
    :visible.sync="dialogVisible"
    :show-header="true"
    title="道路查询"
    custom-class="QuerySpatial"
    :beforeClose="handleClose"
    :dblClick="handleDblclick"
  >
    <el-row
      v-show="!detailInfoShow"
      v-loading="loading"
      element-loading-background="rgba(0, 0, 0, 0.6)"
      element-loading-text="正在查询"
      element-loading-spinner="el-icon-loading"
      element-loading-custom-class="loading_color"
    >
      <el-col :span="10">
        <el-row>
          <el-form>
            <el-form-item label="道路名称：">
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
            <span>道路：</span>
          </el-col>
          <el-col :span="12">
            <span style="margin-left: 5px">图层：</span>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-row class="layer_container" style="padding-left: 0px">
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
          <el-form>
            <el-form-item label="半径：">
              <el-input
                v-model="inputRadius"
                class="inputR"
                :disabled="checklist.length == 0"
                v-input-focus
                v-only-number="{
                  max: 999999,
                  min: 0,
                  precision: 2,
                }"
              ></el-input>
              <span class="afterUnit">米</span>
              <el-button
                type="primary"
                size="mini"
                class="afterUnit"
                @click="query"
                :disabled="checklist.length == 0 || !sc"
                >查询</el-button
              >
            </el-form-item>
          </el-form>
        </el-row>
      </el-col>
      <el-col :span="14">
        <el-row>
          <div id="chart" class="chartContainerClass" />
        </el-row>
        <el-row class="centerDiv">
          <el-button
            type="primary"
            size="mini"
            @click="detailClick()"
            :disabled="isExportDisabled"
            >详细信息</el-button
          >
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

    <el-row v-show="detailInfoShow">
      <div class="static-menu-border">
        <div class="static-menu">
          <div
            :class="[
              'static-menu-item',
              { 'static-menu-item-active': typeId == 'line' },
            ]"
            @click="switchType('line')"
          >
            <span class="static-menu-inner"> 管线信息 </span>
          </div>
          <div
            :class="[
              'static-menu-item',
              { 'static-menu-item-active': typeId == 'point' },
            ]"
            @click="switchType('point')"
          >
            <span class="static-menu-inner"> 管点信息 </span>
          </div>
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
        </div>
      </div>
      <el-table
        :data="tableData[typeId]"
        @row-dblclick="getDetailInfo"
        highlight-current-row
        border
        stripe
      >
        <el-table-column
          v-for="(item, i) in tableHeader[typeId]"
          :key="i"
          :prop="item.name"
          :label="item.label"
          :show-overflow-tooltip="true"
          header-align="center"
          align="center"
          :min-width="colWidth"
        ></el-table-column>
      </el-table>
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :total="recordNum[typeId]"
        layout="total, prev, pager, next"
        @current-change="handleCurrentChange"
      />
    </el-row>
  </popoverStat>
</template>

<script>
import popoverStat from "@/components/popoverStat";
import onlyNumber from "@/directives/el-only-number";
import {
  getPipeList,
  queryFunc,
  querySpatialCondition,
  pageClick,
  searchResultByMutilLayer,
  exportFile,
  getDetailData,
  getTableHeader,
} from "./QueryCommon";
let lastPolygon = null;
export default {
  directives: { onlyNumber },
  components: {
    popoverStat,
  },
  data() {
    this.lastHighlight_layer = [];
    return {
      dialogVisible: true,
      treeData: [],
      defaultProps: {
        children: "children",
        label: "name",
      },
      checklist: [],
      layerList: [],
      tableHeader: { line: [], point: [] },
      tableData: { line: [], point: [] },
      tubulation: "",
      inputRadius: "10",
      detailInfoShow: false,
      detailInfo: [],
      currentPage: 1,
      pageObj: { line: 1, point: 1 },
      recordNum: { line: 0, point: 0 },
      detailCheckbox: false,
      isExportDisabled: true,
      isExportLoading: false,
      sc: "",
      numArr: { line: [], point: [] },
      typeId: "line",
      project: "",
      linePoints: [],
      loading: false,
      colWidth: 0.06 * window.window.innerWidth,
    };
  },
  computed: {
    pageSize() {
      return Math.floor(295 / 36 - 1);
    },
    pipelineData() {
      return this.$store.state.pipelineLayerData;
    },
  },
  mounted() {
    this.layerList = [];
    getPipeList(this, this.pipelineData);

    this.project = this.g_Project.project;

    this.tableHeader = { line: [], point: [] };
    getTableHeader(this);
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
        service: "road",
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

      var coords = jsonShap.Polyline.Coordinates.split(",");
      this.linePoints = [];
      for (var i = 0; i < coords.length; i += 3) {
        this.linePoints.push({
          longitude: Number(coords[i]),
          latitude: Number(coords[i + 1]),
          height: Number(coords[i + 2]),
        });
      }
      this.sc = "";
      this.createBuffer(this.linePoints);
    },
    createBuffer(linePoints) {
      var earth = this.stampAPI.usearth;
      if (lastPolygon) {
        earth.document.elementRoot.detach_object(lastPolygon);
        lastPolygon = null;
      }
      var polygonArray =
        earth.GeometryAlgorithm.CreatePolygonBufferFromPolyline(
          linePoints,
          Number(this.inputRadius),
          1,
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

      var width = (maxX - minX) / 2;
      var heigth = (maxY - minY) / 2;
      var range =
        ((width / 180) * Math.PI * 6378137) / Math.tan((22.5 / 180) * Math.PI);
      var range1 =
        ((heigth / 180) * Math.PI * 6378137) / Math.tan((22.5 / 180) * Math.PI);

      this.sc = "(2" + "," + polygonArray.length + "," + pointString + ")";

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
      var chartElement = document.getElementById("chart");
      var myChart = this.$echarts.init(chartElement);
      myChart.setOption({}, true);
    },
    query() {
      let self = this;
      self.clearChart();
      self.tableData = { line: [], point: [] };
      self.recordNum = { line: 0, point: 0 };
      self.pageObj = { line: 1, point: 1 };
      self.currentPage = 1;
      self.isExportDisabled = true;
      self.detailInfoShow = false;

      this.sc = "";
      this.createBuffer(this.linePoints);

      querySpatialCondition(this, 0, function () {
        let postArr = [];
        for (let i = 0; i < self.checklist.length; i++) {
          postArr.push({
            service: self.checklist[i],
            qt: 17,
            dt: "line",
            sc: self.sc,
            pg: "0," + self.pageSize,
            encoding: "utf-8",
          });
          postArr.push({
            service: self.checklist[i],
            qt: 17,
            dt: "point",
            sc: self.sc,
            pg: "0," + self.pageSize,
            encoding: "utf-8",
          });
        }
        searchResultByMutilLayer(self, postArr);
      });
    },
    backToList() {
      this.detailInfoShow = false;
    },
    getDetailInfo(row) {
      getDetailData(this, row);
    },
    handleCurrentChange(currentPage) {
      let self = this;
      self.currentPage = currentPage;
      self.pageObj[self.typeId] = currentPage;
      pageClick(self);
    },
    exportResult() {
      this.isExportLoading = true;
      let postArr = [];
      for (let i = 0; i < this.checklist.length; i++) {
        postArr.push({
          service: this.checklist[i],
          qt: 16,
          dt: "line",
          sc: this.sc,
          pg: "0,10000",
          encoding: "utf-8",
        });
        postArr.push({
          service: this.checklist[i],
          qt: 16,
          dt: "point",
          sc: this.sc,
          pg: "0,10000",
          encoding: "utf-8",
        });
      }
      exportFile(this, postArr);
    },
    detailClick() {
      this.detailInfoShow = true;
    },
    switchType(type) {
      this.typeId = type;
      this.currentPage = this.pageObj[this.typeId];

      pageClick(this);
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
.layer_container {
  height: 253px;
}

.inputR {
  width: calc(100% - 150px);
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