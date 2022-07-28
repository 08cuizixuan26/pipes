<template>
  <Popover
    :visible.sync="dialogVisible"
    :show-header="true"
    title="智能排管"
    custom-class="analysispipeline"
    :beforeClose="handleClose"
  >
    <div class="analysispipeline-container">
      <el-row>
        <el-col :span="4" class="analysispipeline-container-text">
          <div class="text">管段:</div>
        </el-col>
        <el-col :span="11" style="text-align: -webkit-center">
          <el-select v-model="pipelineType" size="mini">
            <el-option
              v-for="item in pipelineTypes"
              :key="item.name"
              :label="item.name"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-col>
        <el-col :span="1" class="analysispipeline-container-text"> </el-col>
        <el-col :span="8">
          <el-button
            type="primary"
            size="mini"
            @click.prevent="createLine"
            :disabled="disableCreate"
            >创建</el-button
          >
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="4" class="analysispipeline-container-text">
          <div class="text">规格:</div>
        </el-col>
        <el-col :span="11">
          <el-input
            v-model="specification"
            @change="checkSpecification"
          ></el-input>
        </el-col>
        <el-col :span="1" class="analysispipeline-container-text"> </el-col>
        <el-col :span="8">
          <!-- <el-button type="primary" size="mini">坐标</el-button> -->
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="4" class="analysispipeline-container-text">
          <div class="text">埋深:</div>
        </el-col>
        <el-col :span="11">
          <el-input
            v-model="deep"
            v-input-focus
            v-only-number="{ max: 100, min: 0, precision: 0 }"
          ></el-input>
        </el-col>
        <el-col :span="1" class="analysispipeline-container-text"> 米 </el-col>
        <el-col :span="8">
          <el-button
            type="primary"
            size="mini"
            @click="move"
            :disabled="disabled2"
            >平移</el-button
          >
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="4" class="analysispipeline-container-text">
          <div class="text">深度:</div>
        </el-col>
        <el-col :span="11">
          <el-input
            v-model="depth"
            v-input-focus
            v-only-number="{ max: 50, min: 0, precision: 0 }"
          ></el-input>
        </el-col>
        <el-col :span="1" class="analysispipeline-container-text"> 米 </el-col>
        <el-col :span="8">
          <el-button
            type="primary"
            size="mini"
            @click="rotate"
            :disabled="disabled2"
            >旋转</el-button
          >
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="4" class="analysispipeline-container-text">
          <div class="text">半径:</div>
        </el-col>
        <el-col :span="11">
          <el-input
            v-model="analysisRadius"
            @input="createBuffer"
            v-input-focus
            v-only-number="{ max: 100, min: 0, precision: 0 }"
          ></el-input>
        </el-col>
        <el-col :span="1" class="analysispipeline-container-text"> 米 </el-col>
        <el-col :span="8"> </el-col>
      </el-row>
      <el-row>
        <el-col :span="24" style="text-align: right; padding-right: 5px">
          <el-checkbox v-model="fuzhuModel">生成辅助模型</el-checkbox>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-button
            @click.prevent="customClip"
            type="primary"
            size="mini"
            class="pickBtn"
            :disabled="clipDisable"
            >地形开挖</el-button
          >
          <el-button
            @click.prevent="analysis"
            type="primary"
            size="mini"
            :disabled="analysisDisable"
            >水平净距</el-button
          >
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12" class="analysispipeline-container-result">
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
      <el-row class="analysispipeline-container-table">
        <el-col :span="24">
          <el-scrollbar>
            <el-table
              :height="tableHeight"
              :data="tableData"
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

            <el-row></el-row>
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
import Mark from "@/stamplib/Mark";
import axios from "axios";
import onlyNumber from "@/directives/el-only-number";
import Popover from "@/components/Popover";
import PipelineStandard from "@/utils/PipelineStandard";
import point from "../draw/element2D/point";

export default {
  name: "AnalysisHorizontalDis",
  data() {
    this.pipeListData = [];
    this.project = null;
    this.$_PipelineStandard = null;
    this.$hightLightArr = null;
    this.pipelineObjs = null;
    this.clip_guid = null;
    this.lastPolygon_analysisCollision = null;
    this.timer = null;
    this.lastLayer = null;
    return {
      dialogVisible: true,
      disabled: true,
      disabled2: true,
      searchLayer: null,
      clipDisable: false,
      specification: "1000X2000", //规格
      deep: 5, //埋深
      depth: 3, //深度
      analysisRadius: 10, //分析半径
      fuzhuModel: false,
      analysisDisable: true, //水平净距
      pipelineTypes: [
        {
          name: "电力管线",
          value: "Electricity",
        },
        {
          name: "电信管线",
          value: "Telegraphy",
        },
        {
          name: "供水管线",
          value: "FeedWater",
        },
        {
          name: "排水管线",
          value: "Sewage",
        },
        {
          name: "燃气管线",
          value: "Gas",
        },
        {
          name: "热力管线",
          value: "Energetics",
        },
        {
          name: "工业管线",
          value: "Industry",
        },
        {
          name: "电视管线",
          value: "Television",
        },
        {
          name: "雨水管线",
          value: "Rain",
        },
        {
          name: "未定义管线",
          value: "Unknown",
        },
      ],
      startCoord: "", //起点
      endCoord: "", //终点
      tableData: [], //分析结果
      detailInfo: [], //详细结果
      downloadLoading: false,
      detailCheckbox: false,
      detailInfoShow: false,
      disableCreate: false, //创建按钮状态
      startPoint: null,
      endPoint: null,
      showResult: false, //是否显示结果
      linePoints: null, //管线点集合
      pipelineType: "Electricity",
    };
  },
  watch: {
    showResult(newV, oldV) {
      this.showHightlight(newV);
    },
    depth(newV) {
      if (newV == 0) {
        this.clipDisable = true;
      } else {
        this.clipDisable = false;
      }
    },
  },
  components: {
    Popover,
  },
  directives: {
    onlyNumber,
  },
  computed: {
    tableHeight() {
      return (250 / 1920) * window.innerWidth;
    },
    pipelineData() {
      return this.$store.state.pipelineLayerData;
    },
  },
  created() {
    this.$nextTick(function () {
      this.$_PipelineStandard = new PipelineStandard();
    });
  },
  mounted() {
    this.pipeListData = this.g_Project.pipeListData;
    this.searchLayer =
      this.pipeListData.length > 0 ? this.pipeListData[0].guid : null;
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
    handleClose() {
      this.$router.push("/");
    },
    move() {
      const self = this;
      const earth = self.stampAPI.usearth;
      earth.ToolManager.ObjectEditTool.Move({
        axis_status: 7,
        custom_excute_finish: function (result) {
          if (result.spherical_offset !== undefined) {
            var totalCount = earth.SelectSet.GetTotalCount();
            for (var i = 0; i < totalCount; ++i) {
              if (earth.SelectSet.GetOverallObject(i)._rtti == 236) {
                let pipeline = earth.SelectSet.GetOverallObject(i);
                let points = pipeline
                  .get_control_geometry_data()
                  .get_coordinates_geo();
                //起点坐标
                self.startPoint = StampGis.Cartographic.fromCartesian(
                  points[0][0]
                );
                self.startCoord = `${
                  self.startPoint.longitude *
                  StampGis.StampMath.DEGREES_PER_RADIAN
                },${
                  self.startPoint.latitude *
                  StampGis.StampMath.DEGREES_PER_RADIAN
                },${self.startPoint.height}`;
                //终点坐标
                self.endPoint = StampGis.Cartographic.fromCartesian(
                  points[0][1]
                );
                self.endCoord = `${
                  self.endPoint.longitude *
                  StampGis.StampMath.DEGREES_PER_RADIAN
                },${
                  self.endPoint.latitude * StampGis.StampMath.DEGREES_PER_RADIAN
                },${self.endPoint.height}`;
                self.linePoints = points[0];
                //清除缓冲面对象
                if (self.lastPolygon_analysisCollision) {
                  earth.document.elementRoot.detach_object(
                    self.lastPolygon_analysisCollision
                  );
                  self.lastPolygon_analysisCollision = null;
                }
                //创建缓存面
                self.createBuffer();
              }
            }
          }
        },
      });
    },
    rotate() {
      const self = this;
      const earth = self.stampAPI.usearth;
      earth.ToolManager.ObjectEditTool.Rotate({
        axis_status: 7,
        custom_excute_finish: function (result) {
          if (result.rotation_offset !== undefined) {
            var totalCount = earth.SelectSet.GetTotalCount();
            for (var i = 0; i < totalCount; ++i) {
              if (earth.SelectSet.GetOverallObject(i)._rtti == 236) {
                let pipeline = earth.SelectSet.GetOverallObject(i);
                let points = pipeline
                  .get_control_geometry_data()
                  .get_coordinates_geo();
                //起点坐标
                self.startPoint = StampGis.Cartographic.fromCartesian(
                  points[0][0]
                );
                self.startCoord = `${
                  self.startPoint.longitude *
                  StampGis.StampMath.DEGREES_PER_RADIAN
                },${
                  self.startPoint.latitude *
                  StampGis.StampMath.DEGREES_PER_RADIAN
                },${self.startPoint.height}`;
                //终点坐标
                self.endPoint = StampGis.Cartographic.fromCartesian(
                  points[0][1]
                );
                self.endCoord = `${
                  self.endPoint.longitude *
                  StampGis.StampMath.DEGREES_PER_RADIAN
                },${
                  self.endPoint.latitude * StampGis.StampMath.DEGREES_PER_RADIAN
                },${self.endPoint.height}`;
                self.linePoints = points[0];
                //清除缓冲面对象
                if (self.lastPolygon_analysisCollision) {
                  earth.document.elementRoot.detach_object(
                    self.lastPolygon_analysisCollision
                  );
                  self.lastPolygon_analysisCollision = null;
                }
                //创建缓存面
                self.createBuffer();
              }
            }
          }
        },
      });
    },
    checkSpecification(value) {
      const reg = /^\d+(X\d+)?$/;
      reg.test(parseInt(value))
        ? (this.disableCreate = false)
        : (this.disableCreate = true);
    },
    finalCellStyle: function ({ row, column, rowIndex, columnIndex }) {
      if (row.class == "bgRed" && columnIndex == 2) {
        return {
          background: "#f7b1b180",
        };
      }
    },
    //清除创建的临时对象
    clearObj() {
      const self = this;
      const earth = self.stampAPI.usearth;
      //先清除一遍辅助模型
      if (self.clip_guid) {
        earth.TerrainManager.Clear(self.clip_guid);
        self.clip_guid = "";
      }
      //清楚管线对象
      if (self.pipelineObjs) {
        this.stampAPI.usearth.document.elementRoot.detach_object(
          self.pipelineObjs
        );
        self.pipelineObjs = null;
      }
      //清除缓冲面对象
      if (self.lastPolygon_analysisCollision) {
        this.stampAPI.usearth.document.elementRoot.detach_object(
          self.lastPolygon_analysisCollision
        );
        self.lastPolygon_analysisCollision = null;
      }
    },
    //绘制折线
    createLine() {
      const self = this;
      const earth = self.stampAPI.usearth;
      self.disabled2 = true;
      self.analysisDisable = true;
      this.clearObj();
      //绘制线段
      earth.ShapeCreator.CreatePolyline({
        custom_excute_finish: function (result) {
          if (result.data != undefined && result.data.length >= 2) {
            let points = [];
            //根据埋深绘制管线对象
            for (let i = 0; i < result.data.length; i++) {
              const point = StampGis.Cartographic.fromCartesian(result.data[i]);
              const newPoint = StampGis.Cartesian3.fromDegrees(
                point.longitude * StampGis.StampMath.DEGREES_PER_RADIAN,
                point.latitude * StampGis.StampMath.DEGREES_PER_RADIAN,
                point.height - self.deep
              );
              points.push(newPoint);
            }
            self.linePoints = result.data;
            let texture_url =
              stamp_core_config.baseUrlString +
              "images/pipeline/" +
              self.pipelineType +
              ".jpg";
            let pipeline = Mark.createGenerateTunnel(earth, {
              name: "pipeline",
              data: points,
              texture_url: texture_url,
              specification: self.specification,
            });
            //起点坐标
            self.startPoint = StampGis.Cartographic.fromCartesian(
              result.data[0]
            );
            self.startCoord = `${
              self.startPoint.longitude * StampGis.StampMath.DEGREES_PER_RADIAN
            },${
              self.startPoint.latitude * StampGis.StampMath.DEGREES_PER_RADIAN
            },${self.startPoint.height}`;
            //终点坐标
            self.endPoint = StampGis.Cartographic.fromCartesian(result.data[1]);
            self.endCoord = `${
              self.endPoint.longitude * StampGis.StampMath.DEGREES_PER_RADIAN
            },${
              self.endPoint.latitude * StampGis.StampMath.DEGREES_PER_RADIAN
            },${self.endPoint.height}`;
            self.pipelineObjs = pipeline;
            earth.ShapeCreator.Clear();
            self.createBuffer();
            self.disabled2 = false;
          }
        },
      });
    },
    //自定义开挖
    customClip() {
      const self = this;
      const earth = self.stampAPI.usearth;
      //先清除一遍辅助模型
      if (self.clip_guid) {
        earth.TerrainManager.Clear(self.clip_guid);
        self.clip_guid = "";
      }

      //计算
      earth.ShapeCreator.CreatePolygon({
        custom_excute_finish: function (result) {
          if (result.data != undefined && result.data.length >= 2) {
            let inPointArrays = [];
            inPointArrays.push(result.data);
            //创建多边形对象计算高程
            const polygon = earth.Factory.CreateElementPolygon({
              // guid: options.guid,
              name: "polygon",
              doc: earth.document,
            });
            polygon.BeginUpdate();
            polygon.SetExteriorRing(result.data);
            polygon.altitudeType = 1;
            polygon.lineColor = 0xaaffff00;
            polygon.lineWidth = 1.0;
            polygon.fillColor = 0xaa00ff00;
            polygon.drawOrder = 0;
            polygon.EndUpdate();
            let points = [
              {
                height: 0,
                latitude: polygon.transform.latitude,
                longitude: polygon.transform.longitude,
              },
            ];
            let promise =
              earth.document.get_batch_dem_height_from_server(points);
            StampGis.when(promise, function () {}).then(function () {
              let alt = parseFloat(points[0].height).toFixed(2);
              let height = alt - self.depth;
              self.clip_guid = earth.TerrainManager.ClipTerrainByPolygon(
                inPointArrays,
                height,
                self.fuzhuModel
              );
              self.analysisDisable = false;
            });
            earth.ShapeCreator.Clear();
          } else {
            earth.ShapeCreator.Clear();
          }
        },
      });
    },
    //水平净距分析
    async analysis() {
      let self = this;
      self.tableData = [];
      self.$hightLightArr = [];
      if (this.showResult) {
        this.showResult = false;
      }
      //压力字段
      let ppressure = "";
      if (
        self.$_PipelineStandard.PipelineType &&
        self.$_PipelineStandard.PipelineType[self.pipelineType] >= 5000 &&
        self.$_PipelineStandard.PipelineType[self.pipelineType] < 6000
      ) {
        //燃气管线统一传低压：0
        ppressure = 0;
      } else {
        //非燃气管线统一传-1
        ppressure = -1;
      }
      //
      let ppsvalue = "";
      if (
        self.$_PipelineStandard.PipelineType &&
        self.$_PipelineStandard.PipelineType[self.pipelineType] >= 1000 &&
        self.$_PipelineStandard.PipelineType[self.pipelineType] < 2000
      ) {
        //电力管线需传入电压值，统一传：0.1kV
        ppsvalue = "0.1kV";
      } else {
        //非电力管线统一传-1
        ppsvalue = -1;
      }
      //管线分析
      for (let ni = 0; ni < self.pipeListData.length; ni++) {
        self.$hightLightArr.push({
          guid: this.pipeListData[ni].guid,
          hightLight: [],
        });
        let layer = self.stampAPI.usearth.LayerManager.GetLayerByGUID(
          self.pipeListData[ni].guid
        );
        let gisServer = layer._gis_server_connection;
        let params = {
          rt: "collision",
          service: self.pipeListData[ni].guid,
          aparam: `0,${self.startCoord},${self.endCoord},${
            self.specification
          },${self.analysisRadius},${
            self.$_PipelineStandard.PipelineType[self.pipelineType]
          },${ppressure},0,${ppsvalue}`,
          gisServer: gisServer,
        };
        let res = await pipelineGet(params);
        let json = self.$x2js.xml2js(res.data).Xml;
        self.disabled = false;
        let records = json.CollisionResult.Record;
        if (json.CollisionResult._num <= 0) {
          continue;
        } else if (json.CollisionResult._num == 1) {
          //当只有一个结果时处理为数组
          records = [records];
        }
        for (var i = 0; i < records.length; i++) {
          let id = getNameNoIgnoreCase(self.$filedCfgJson, "US_KEY", "1", true);
          var tempid = records[i][id] || records[i][id.toLowerCase()];
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
          self.tableData.push({
            id: tempid,
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

      const self = this;
      let layer = self.stampAPI.usearth.LayerManager.GetLayerByGUID(
        row.layerID
      );
      this.lastLayer = layer;
      let gisServer = layer._gis_server_connection;
      let id = getNameNoIgnoreCase(this.$filedCfgJson, "US_KEY", "1", true);

      let searchParam = `rd=&t=container&c=${row.layerID}&pk=${row.id}&rt=1&mesh=0&detail=0&p=0&pl=100`;
      //   let postDataParam = `service=${row.layerID}&qt=16&dt=line&pc=(and,equal,${id},${row.id})&pg=0,10&encoding=utf-8&`;
      let postDataParam = {
        service: row.layerID,
        qt: 16,
        dt: "line",
        pc: `(and,equal,${id},${row.id})`,
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
    createBuffer(value) {
      let self = this;
      if (value == 0) {
        this.disabledAnalysis = true;
        return;
      }
      this.disabledAnalysis = false;
      var earth = this.stampAPI.usearth;
      if (self.lastPolygon_analysisCollision) {
        earth.document.elementRoot.detach_object(
          self.lastPolygon_analysisCollision
        );
      }
      let points = [];
      for (let i = 0; i < this.linePoints.length; i++) {
        const point = StampGis.Cartographic.fromCartesian(this.linePoints[i]);
        points.push({
          longitude: point.longitude * StampGis.StampMath.DEGREES_PER_RADIAN,
          latitude: point.latitude * StampGis.StampMath.DEGREES_PER_RADIAN,
          height: point.height - this.deep,
        });
      }
      var polygonArray =
        earth.GeometryAlgorithm.CreatePolygonBufferFromPolyline(
          points,
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
      self.lastPolygon_analysisCollision = polygon;
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
  },

  beforeRouteLeave(to, from, next) {
    next();
    if (this.showResult && this.$hightLightArr.length > 0) {
      this.showHightlight(false);
    }
    this.clearObj();

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.lastLayer) {
      this.lastLayer.container._highlight_objs = [];
      this.lastLayer = null;
    }
    this.$parent.$refs.functionPanel.curSelMenu.name = "";
  },
};
</script>

<style lang="less" scoped>
.analysispipeline {
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

.analysispipeline-container {
  height: 550px;

  .analysispipeline-container-text {
    height: 30px;
    line-height: 30px;
    font-size: 14px;
    text-align: left;
    padding-left: 5px;
  }

  .analysispipeline-container-result {
    height: 30px;
    line-height: 30px;
    font-weight: 700;
    text-align: left;
    padding-left: 10px;
  }

  .analysispipeline-container-table {
    margin-bottom: 0px;
  }

  .text {
    text-align: right;
    padding-right: 5px;
  }
}
</style>
