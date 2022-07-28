<template>
  <Popover
    :visible.sync="dialogVisible"
    :show-header="true"
    title="纵断面分析"
    custom-class="analysisversection"
    :beforeClose="handleClose"
  >
    <div class="analysisversection-container">
      <el-row>
        <el-col :span="24">
          <el-button type="primary" size="mini" @click="addPipe"
            >添加管段</el-button
          >
          <el-button type="primary" size="mini" @click="deletePipe"
            >删除</el-button
          >
          <el-button type="primary" size="mini" @click="pipeAnalysis"
            >分析</el-button
          >
        </el-col>
      </el-row>
      <el-row class="analysisversection-container-table">
        <el-col :span="24">
          <el-scrollbar>
            <el-table
              :height="tableHeight"
              :data="tableData"
              ref="selectPipeTable"
              :row-style="getRowClass"
              @row-dblclick="getDetailInfo"
            >
              <el-table-column type="selection"></el-table-column>
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
          </el-scrollbar>
        </el-col>
      </el-row>
    </div>
    <popoverStat
      :visible.sync="isResultShow"
      title="纵断面分析结果"
      custom-class="svgpopover"
      style="width: 1010px"
    >
      <el-row>
        <el-col :span="24"> 地下管线纵断面图 </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <svg
            width="100%"
            height="500px"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g id="gCanvas"></g>
          </svg>
          <div
            id="divHover"
            ref="divHover"
            style="
              position: absolute;
              top: 0px;
              left: 0px;
              z-index: 9999;
              color: black;
              background: #fff;
              width: 300px;
              min-height: 180px;
              display: none;
            "
          ></div>
        </el-col>
      </el-row>
    </popoverStat>
  </Popover>
</template>

<script>
import { pipelineGet } from "@/api/analysis";
import { DownloadFileWithoutIp } from "@/api/common";
import { getFiledCfgXml, getNameNoIgnoreCase } from "@/api/query";
import PipelineStandard from "@/utils/PipelineStandard";
import Popover from "@/components/Popover";
import popoverStat from "@/components/popoverStat";
import $ from "jquery";

var groundAltitudeList = [];
var pipeLineAltitudeList = [];
var gCanvas = null;
var minX = null;
var maxX = null;
var minY = null;
var maxY = null;
var ratioX = null;
var ratioY = null;
var bLastPoint = 0;
var yyy = 0;
export default {
  name: "AnalysisVerSection",
  components: {
    Popover,
    popoverStat,
  },
  data() {
    this.project = null;
    this.$_Datum = null;
    this.$searchCallback = null;
    this.$pickChange = null;
    this.$filedCfgJson = "";
    this.$pipelID = ""; //管线编号字段
    this.$pipepID = ""; //管点编号字段
    this.$_PipelineStandard = null;
    this.listPipelineShow = [];
    return {
      dialogVisible: true,
      tableData: [],
      currLayerGuid: null,
      flag: true,
      strGuidList: [],
      width: 0,
      flow: true,
      IsConnect: true,
      minGroundAltitude: 0,
      maxGroundAltitude: 0,
      minPipeLineAltitude: 0,
      maxPipeLineAltitude: 0,
      isResultShow: false,
    };
  },
  computed: {
    tableHeight() {
      return (530 / 1920) * window.innerWidth;
    },
  },
  created() {
    this.$nextTick(function () {
      this.$_PipelineStandard = new PipelineStandard();
    });
  },
  mounted() {
    gCanvas = document.getElementById("gCanvas");
    var earth = this.stampAPI.usearth;
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

    var spaialUrl = this.g_Project.SpatialReference;
    DownloadFileWithoutIp(spaialUrl, "arraybuffer")
      .then((res) => {
        var array_data = res.data;
        var option = {
          array: array_data,
        };

        self.$_Datum = earth.Factory.CreateDatum(option);
      })
      .catch((err) => {});
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
    clear() {
      this.flag = true;
      this.strGuidList = [];
      this.width = 0;
      this.flow = true;
      this.IsConnect = true;
      this.minGroundAltitude = 0;
      this.maxGroundAltitude = 0;
      this.minPipeLineAltitude = 0;
      this.maxPipeLineAltitude = 0;
      this.listPipelineShow = [];
      groundAltitudeList = [];
      pipeLineAltitudeList = [];
      minX = null;
      maxX = null;
      minY = null;
      maxY = null;
      ratioX = null;
      ratioY = null;
      bLastPoint = 0;
      yyy = 0;
    },
    addPipe() {
      const earth = this.stampAPI.usearth;
      const application = earth.application;
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

          let parentLayer = res[0] ? res[0].layer : null;
          if (!parentLayer) {
            return;
          }
          let parentLayerNameTemp = parentLayer._id;
          let parentLayerName = parentLayerNameTemp.split("_")[1];
          if (parentLayerName == "" || parentLayerName == "null") {
            return;
          }
          let PObjGUID = parentLayerNameTemp.split("_")[0];
          let newLayer = earth.LayerManager.GetLayerByGUID(PObjGUID);
          let newLayerID = newLayer.get_guid();
          if (parentLayerName.indexOf("container") == -1) {
            //不是线
            self.$message({
              type: "warning",
              message: "选择对象为非管段,请重新选择!",
            });
            return;
          }
          if (self.currLayerGuid == null) {
            self.currLayerGuid = newLayerID;
          } else if (newLayerID != self.currLayerGuid) {
            self.$message({
              type: "warning",
              message: "所选管道不在同一图层,请重新选择!",
            });
            return;
          }
          if (res[0].properties && res[0].properties.properties) {
            if (self.checkInTbale(res[0].properties.properties.Key)) {
              self.$message({
                type: "warning",
                message: "选中的管道已经添加，请重新选择。",
              });
              return;
            }
            let obj = {
              id: res[0].properties.properties.Key,
              type: "管段",
              layer: newLayer._name,
            };
            self.tableData.push(obj);

            self.$nextTick(function () {
              self.$refs.selectPipeTable.toggleRowSelection(obj);
            });
          }
        }
      );
    },
    checkInTbale(data) {
      for (let i = 0; i < this.tableData.length; i++) {
        if (this.tableData[i].id == data) {
          return true;
        }
      }
      return false;
    },
    getDetailInfo() {},
    deletePipe() {
      let selectList = this.$refs.selectPipeTable.selection;
      if (!selectList || selectList.length == 0) {
        this.$message({
          type: "warning",
          message: "请先勾选需要删除的管线",
        });
      }
      for (let i = 0; i < selectList.length; i++) {
        let item = selectList[i];
        for (let j = 0; j < this.tableData.length; j++) {
          if (this.tableData[j].id == item.id) {
            this.tableData.splice(j, 1);
          }
        }
      }
      if (this.tableData.length == 0) {
        this.currLayerGuid = null;
      }
    },
    getValueByCode(type, code) {
      //临时，需要根据映射文件来
      code = (Math.floor(code / 1000) * 1000).toString();
      var str = "";
      switch (code) {
        case "1000":
          str = "电力管线";
          break;
        case "2000":
          str = "电信管线";
          break;
        case "3000":
          str = "给水管线";
          break;
        case "4000":
          str = "排水管线";
          break;
        case "5000":
          str = "燃气管线";
          break;
        case "6000":
          str = "热力管线";
          break;
        case "7000":
          str = "工业管线";
          break;
        default:
          break;
      }
      return str;
    },
    pipeAnalysis() {
      this.clear();

      let self = this;
      let earth = this.stampAPI.usearth;
      let selectList = this.$refs.selectPipeTable.selection;
      if (!selectList || selectList.length == 0) {
        this.$message({
          type: "warning",
          message: "请选中要分析的对象后再进行此操作",
        });
      } else {
        let pipeStr = "";
        selectList.forEach((item) => {
          pipeStr += "," + item.id;
        });

        let layer = earth.LayerManager.GetLayerByGUID(this.currLayerGuid);
        let params = {
          rt: "verticalsect",
          service: this.currLayerGuid,
          aparam: `0${pipeStr}`,
          gisServer: layer._gis_server_connection,
        };

        self.$pipelID =
          self.$pipelID ||
          getNameNoIgnoreCase(self.$filedCfgJson, "US_KEY", "1", true);
        self.$pipepID =
          self.$pipepID ||
          getNameNoIgnoreCase(self.$filedCfgJson, "US_KEY", "0", true);
        pipelineGet(params).then((res) => {
          let json = self.$x2js.xml2js(res.data).Xml;
          if (json == null || !json.VerticalSectionResult) {
            return;
          }
          let count = parseInt(json.VerticalSectionResult._num);
          if (count < 1) {
            return;
          }
          let pipeLineObjectList = [];
          let tempList = [];
          for (let i = 0; i < count; i++) {
            (function (i) {
              let Record = null;
              if (count == 1) {
                Record = json.VerticalSectionResult.Record;
              } else {
                Record = json.VerticalSectionResult.Record[i];
              }
              //除去重复数据
              let guid =
                Record[self.$pipelID] || Record[self.$pipelID.toLowerCase()]; //parent.getNameNoIgnoreCase("US_KEY", 1, true)
              if (self.strGuidList.length > 0) {
                if ($.inArray(guid, self.strGuidList) > -1) {
                  return;
                }
              }
              self.strGuidList.push(guid);
              let ID =
                Record[self.$pipelID] || Record[self.$pipelID.toLowerCase()]; //管线ID parent.getNameNoIgnoreCase("US_KEY", 1, true)
              var material = getNameNoIgnoreCase(
                self.$filedCfgJson,
                "US_PMATER",
                "1",
                true
              );
              let mater = Record[material] || Record[material.toLowerCase()]; //材质 parent.getNameNoIgnoreCase("US_PMATER", 1, true)
              let dataType = self.getValueByCode(
                "PIPECODE",
                layer.pipeline_type
              ); //数据类型
              var s_deep = getNameNoIgnoreCase(
                self.$filedCfgJson,
                "US_SDEEP",
                "1",
                true
              );
              let startDeep = Record[s_deep] || Record[s_deep.toLowerCase()]; //开始埋深 parent.getNameNoIgnoreCase("US_SDEEP", 1, true)
              startDeep = parseFloat(startDeep).toFixed(2);
              var e_deep = getNameNoIgnoreCase(
                self.$filedCfgJson,
                "US_EDEEP",
                "1",
                true
              );
              let endDeep = Record[e_deep] || Record[e_deep.toLowerCase()]; //结束埋深 parent.getNameNoIgnoreCase("US_EDEEP", 1, true)
              endDeep = parseFloat(endDeep).toFixed(2);
              var ds = getNameNoIgnoreCase(
                self.$filedCfgJson,
                "US_SIZE",
                "1",
                true
              );
              let specification = Record[ds] || Record[ds.toLowerCase()]; //规格 parent.getNameNoIgnoreCase("US_SIZE", 1, true)
              var s_point = getNameNoIgnoreCase(
                self.$filedCfgJson,
                "US_SPT_KEY",
                "1",
                true
              );
              let startID = Record[s_point] || Record[s_point.toLowerCase()]; //管线开始端点ID parent.getNameNoIgnoreCase("US_SPT_KEY", 1, true)
              var e_point = getNameNoIgnoreCase(
                self.$filedCfgJson,
                "US_EPT_KEY",
                "1",
                true
              );
              let endID = Record[e_point] || Record[e_point.toLowerCase()]; //管线结束端点ID parent.getNameNoIgnoreCase("US_EPT_KEY", 1, true)

              let coordinates = Record.Coordinates.split(" ");
              let coordinate1 = coordinates[0].split(",");
              let coordinate2 = coordinates[1].split(",");

              let color = "000000";
              color = self.$_PipelineStandard.getStandardLineColor(
                layer.pipeline_type
              ); // 按材质来

              let tmp = "000000".substring(color.length, 6);
              color = "#" + color + tmp;

              var s_height = getNameNoIgnoreCase(
                self.$filedCfgJson,
                "US_SALT",
                "1",
                true
              );
              var e_height = getNameNoIgnoreCase(
                self.$filedCfgJson,
                "US_EALT",
                "1",
                true
              );
              let pipeLineStartAlt =
                Record[s_height] || Record[s_height.toLowerCase()]; //parent.getNameNoIgnoreCase("US_SALT", 1, true)
              let pipeLineEndAlt =
                Record[e_height] || Record[e_height.toLowerCase()]; // parent.getNameNoIgnoreCase("US_EALT", 1, true)
              let dataStartAlt, dataEndAlt;
              dataStartAlt =
                parseFloat(pipeLineStartAlt) + parseFloat(startDeep); //地面开始高程
              dataStartAlt = parseFloat(dataStartAlt).toFixed(2);
              dataEndAlt = parseFloat(pipeLineEndAlt) + parseFloat(endDeep); //地面结束高程
              dataEndAlt = parseFloat(dataEndAlt).toFixed(2);
              let dxPipeLineStartAlt = parseFloat(pipeLineStartAlt).toFixed(2); //add by zhangd 20170829 保证按地形高程显示时下面的数字（地面高程、管线高程等）都显示数据库数据
              let dxPipeLineEndAlt = parseFloat(pipeLineEndAlt).toFixed(2); //add by zhangd 20170829 保证按地形高程显示时下面的数字（地面高程、管线高程等）都显示数据库数据

              if (STAMP_config.profileAlt == "0") {
                var groundStartAlt =
                  parseFloat(pipeLineStartAlt) + parseFloat(startDeep); //地面开始高程
                groundStartAlt = parseFloat(groundStartAlt).toFixed(2);
                var groundEndAlt =
                  parseFloat(pipeLineEndAlt) + parseFloat(endDeep); //地面结束高程
                groundEndAlt = parseFloat(groundEndAlt).toFixed(2);
                pipeLineStartAlt = parseFloat(pipeLineStartAlt).toFixed(2);
                pipeLineEndAlt = parseFloat(pipeLineEndAlt).toFixed(2);

                let v3s1 = self.$_Datum.des_BLH_to_src_xy(
                  Number(coordinate1[0]),
                  Number(coordinate1[1]),
                  Number(coordinate1[2])
                );
                let v3s2 = self.$_Datum.des_BLH_to_src_xy(
                  Number(coordinate2[0]),
                  Number(coordinate2[1]),
                  Number(coordinate2[2])
                );
                let length = Math.sqrt(
                  Math.abs(v3s1.x - v3s2.x) * Math.abs(v3s1.x - v3s2.x) +
                    Math.abs(v3s1.y - v3s2.y) * Math.abs(v3s1.y - v3s2.y)
                ); //间距
                length = parseFloat(length.toFixed(5)); //截取3位小数位
                var tempMinGroundAltitude = Math.min(
                  groundStartAlt,
                  groundEndAlt
                );
                var tempMaxGroundAltitude = Math.max(
                  groundStartAlt,
                  groundEndAlt
                );
                var tempMinPipeLineAltitude = Math.min(
                  pipeLineStartAlt,
                  pipeLineEndAlt
                );
                var tempMaxPipeLineAltitude = Math.max(
                  pipeLineStartAlt,
                  pipeLineEndAlt
                );
                if (self.flag) {
                  self.minGroundAltitude = tempMinGroundAltitude;
                  self.maxGroundAltitude = tempMaxGroundAltitude;
                  self.minPipeLineAltitude = tempMinPipeLineAltitude;
                  self.maxPipeLineAltitude = tempMaxPipeLineAltitude;
                  self.flag = false;
                }
                if (self.minGroundAltitude >= tempMinGroundAltitude) {
                  self.minGroundAltitude = tempMinGroundAltitude;
                }
                if (self.maxGroundAltitude < tempMaxGroundAltitude) {
                  self.minGroundAltitude = tempMinGroundAltitude;
                }
                if (self.minPipeLineAltitude >= tempMinPipeLineAltitude) {
                  self.minPipeLineAltitude = tempMinPipeLineAltitude;
                }
                if (self.maxPipeLineAltitude < tempMaxPipeLineAltitude) {
                  self.maxPipeLineAltitude = tempMaxPipeLineAltitude;
                }
                let pipeLineObj = {};
                pipeLineObj.dataType = dataType;
                pipeLineObj.ID = ID;
                pipeLineObj.startID = startID;
                pipeLineObj.endID = endID;
                pipeLineObj.mater = mater;
                pipeLineObj.width = self.width;
                pipeLineObj.length = length;
                pipeLineObj.flow = self.flow;
                pipeLineObj.startCoordX = v3s1.x.toFixed(2);
                pipeLineObj.startCoordY = v3s1.y.toFixed(2);
                pipeLineObj.endCoordX = v3s2.x.toFixed(2);
                pipeLineObj.endCoordY = v3s2.y.toFixed(2);
                pipeLineObj.fillcolor = color;
                pipeLineObj.pipeLineStartAlt = pipeLineStartAlt;
                pipeLineObj.dxPipeLineStartAlt = dxPipeLineStartAlt;
                pipeLineObj.pipeLineEndAlt = pipeLineEndAlt;
                pipeLineObj.dxPipeLineEndAlt = dxPipeLineEndAlt;
                pipeLineObj.groundStartAlt = groundStartAlt;
                pipeLineObj.dataStartAlt = dataStartAlt;
                pipeLineObj.dataEndAlt = dataEndAlt;
                pipeLineObj.groundEndAlt = groundEndAlt;
                pipeLineObj.specification = specification;
                pipeLineObj.startDeep = startDeep;
                pipeLineObj.endDeep = endDeep;
                tempList.push(pipeLineObj);
                if (i == count - 1) {
                  let selectList = self.$refs.selectPipeTable.selection;
                  for (var index = 0; index < selectList.length; index++) {
                    for (var num = 0; num < tempList.length; num++) {
                      if (tempList[num].ID == selectList[index].id) {
                        pipeLineObjectList.push(tempList[num]);
                      }
                    }
                  }
                  self.verSectionPipeLine(pipeLineObjectList);
                  self.getCoordData(self.listPipelineShow);
                  // if (!self.IsConnect)
                  self.createVerSectionChat();
                }
              } else {
                //地形高程
                let points = [];
                let cartographic1 = new StampGis.Cartographic(
                  StampGis.StampMath.toRadians(coordinate1[0]),
                  StampGis.StampMath.toRadians(coordinate1[1]),
                  0
                );
                let cartographic2 = new StampGis.Cartographic(
                  StampGis.StampMath.toRadians(coordinate2[0]),
                  StampGis.StampMath.toRadians(coordinate2[1]),
                  0
                );
                points.push(cartographic1);
                points.push(cartographic2);
                var promise =
                  earth.document.get_batch_dem_height_from_server(points);
                if (promise == undefined) {
                  return;
                }
                StampGis.when(promise, function () {}).then(function () {
                  var groundStartAlt = points[0].height;
                  groundStartAlt = parseFloat(groundStartAlt).toFixed(2);
                  var groundEndAlt = points[1].height;
                  groundEndAlt = parseFloat(groundEndAlt).toFixed(2);
                  pipeLineStartAlt = parseFloat(
                    groundStartAlt - startDeep
                  ).toFixed(2); //管线开始高程
                  pipeLineEndAlt = parseFloat(groundEndAlt - endDeep).toFixed(
                    2
                  ); //管线结束高程
                  let v3s1 = self.$_Datum.des_BLH_to_src_xy(
                    Number(coordinate1[0]),
                    Number(coordinate1[1]),
                    Number(coordinate1[2])
                  );
                  let v3s2 = self.$_Datum.des_BLH_to_src_xy(
                    Number(coordinate2[0]),
                    Number(coordinate2[1]),
                    Number(coordinate2[2])
                  );
                  let length = Math.sqrt(
                    Math.abs(v3s1.x - v3s2.x) * Math.abs(v3s1.x - v3s2.x) +
                      Math.abs(v3s1.y - v3s2.y) * Math.abs(v3s1.y - v3s2.y)
                  ); //间距
                  length = parseFloat(length.toFixed(5)); //截取3位小数位
                  var tempMinGroundAltitude = Math.min(
                    groundStartAlt,
                    groundEndAlt
                  );
                  var tempMaxGroundAltitude = Math.max(
                    groundStartAlt,
                    groundEndAlt
                  );
                  var tempMinPipeLineAltitude = Math.min(
                    pipeLineStartAlt,
                    pipeLineEndAlt
                  );
                  var tempMaxPipeLineAltitude = Math.max(
                    pipeLineStartAlt,
                    pipeLineEndAlt
                  );
                  if (self.flag) {
                    self.minGroundAltitude = tempMinGroundAltitude;
                    self.maxGroundAltitude = tempMaxGroundAltitude;
                    self.minPipeLineAltitude = tempMinPipeLineAltitude;
                    self.maxPipeLineAltitude = tempMaxPipeLineAltitude;
                    self.flag = false;
                  }
                  if (self.minGroundAltitude >= tempMinGroundAltitude) {
                    self.minGroundAltitude = tempMinGroundAltitude;
                  }
                  if (self.maxGroundAltitude < tempMaxGroundAltitude) {
                    self.minGroundAltitude = tempMinGroundAltitude;
                  }
                  if (self.minPipeLineAltitude >= tempMinPipeLineAltitude) {
                    self.minPipeLineAltitude = tempMinPipeLineAltitude;
                  }
                  if (self.maxPipeLineAltitude < tempMaxPipeLineAltitude) {
                    self.maxPipeLineAltitude = tempMaxPipeLineAltitude;
                  }
                  let pipeLineObj = {};
                  pipeLineObj.dataType = dataType;
                  pipeLineObj.ID = ID;
                  pipeLineObj.startID = startID;
                  pipeLineObj.endID = endID;
                  pipeLineObj.mater = mater;
                  pipeLineObj.width = self.width;
                  pipeLineObj.length = length;
                  pipeLineObj.flow = self.flow;
                  pipeLineObj.startCoordX = v3s1.x.toFixed(2);
                  pipeLineObj.startCoordY = v3s1.y.toFixed(2);
                  pipeLineObj.endCoordX = v3s2.x.toFixed(2);
                  pipeLineObj.endCoordY = v3s2.y.toFixed(2);
                  pipeLineObj.fillcolor = color;
                  pipeLineObj.pipeLineStartAlt = pipeLineStartAlt;
                  pipeLineObj.dxPipeLineStartAlt = dxPipeLineStartAlt;
                  pipeLineObj.pipeLineEndAlt = pipeLineEndAlt;
                  pipeLineObj.dxPipeLineEndAlt = dxPipeLineEndAlt;
                  pipeLineObj.groundStartAlt = groundStartAlt;
                  pipeLineObj.dataStartAlt = dataStartAlt;
                  pipeLineObj.dataEndAlt = dataEndAlt;
                  pipeLineObj.groundEndAlt = groundEndAlt;
                  pipeLineObj.specification = specification;
                  pipeLineObj.startDeep = startDeep;
                  pipeLineObj.endDeep = endDeep;
                  tempList.push(pipeLineObj);
                  if (i == count - 1) {
                    let selectList = self.$refs.selectPipeTable.selection;
                    for (var index = 0; index < selectList.length; index++) {
                      for (var num = 0; num < tempList.length; num++) {
                        if (tempList[num].ID == selectList[index].id) {
                          pipeLineObjectList.push(tempList[num]);
                        }
                      }
                    }
                    self.verSectionPipeLine(pipeLineObjectList);
                    self.getCoordData(self.listPipelineShow);
                    // if (!self.IsConnect)
                    self.createVerSectionChat();
                  }
                });
              }
            })(i);
          }
        });
      }
    },
    createVerSectionChat() {
      gCanvas.innerHTML = "";
      let size = 1;
      gCanvas.setAttribute(
        "transform",
        "rotate(270) translate(-" + 500 * size + ",-10)"
      );
      gCanvas.appendChild(this.createRect(0, 20, 500 * size, 980 * size, 3, 0));
      gCanvas.appendChild(this.createGroup());

      var params = {
        pipeLineObjList: this.listPipelineShow,
        gAltList: groundAltitudeList,
        pAltList: pipeLineAltitudeList,
        minG: this.minGroundAltitude,
        maxG: this.maxGroundAltitude,
        minP: this.minPipeLineAltitude,
        maxP: this.maxPipeLineAltitude,
        profileAlt: STAMP_config.profileAlt,
      };
      this.isResultShow = true;
      var pipeLineObjList = params.pipeLineObjList;
      var groundAltList = params.gAltList;
      var pipeLineAltList = params.pAltList;
      var minGroundAltitude = params.minG;
      var maxGroundAltitude = params.maxG;
      var minPipeLineAltitude = params.minP;
      var maxPipeLineAltitude = params.maxP;
      minX = Math.min(minPipeLineAltitude, minGroundAltitude);
      maxX = Math.max(maxPipeLineAltitude, maxGroundAltitude);
      minY = 0;
      maxY = pipeLineAltList[pipeLineAltList.length - 1];
      ratioX = null;
      ratioY = null;
      this.createYLine();
      this.createYTick();
      this.createTableTitle();
      var groundCoordList = this.convertCoordList(groundAltList);
      var pipeLineCoordList = this.convertCoordList(pipeLineAltList);
      this.createTerrainProfile(groundCoordList); //创建地面切面
      this.createPipeLineProfile(pipeLineCoordList, pipeLineObjList); //创建管线切面
      this.createPipeProfiles(pipeLineObjList, minX, maxX, minY, maxY);
      this.createYTickValue(maxX, minX);
    },
    createRect(left, top, width, height, strokeweight, zindex) {
      var rectBox = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      rectBox.setAttribute("x", left);
      rectBox.setAttribute("y", top);
      rectBox.setAttribute("width", width);
      rectBox.setAttribute("height", height);
      rectBox.setAttribute("fill", "rgb(255,255,255)");
      rectBox.setAttribute("stroke", "rgb(0,0,0)");
      rectBox.setAttribute("stroke-width", strokeweight);
      if (zindex != 0) {
        rectBox.setAttribute("zIndex", zindex);
      }
      return rectBox;
    },
    createGroup() {
      let size = 1;
      var group = document.createElementNS("http://www.w3.org/2000/svg", "g");
      group.setAttribute("transform", "translate(0," + 20 * size + ")");
      group.appendChild(this.createRect(0, 0, 200 * size, 950 * size, 1, 4));
      group.appendChild(
        this.createLine(40 * size, 0, 40 * size, 950 * size, 1, 5)
      );
      group.appendChild(
        this.createLine(80 * size, 0, 80 * size, 950 * size, 1, 5)
      );
      group.appendChild(
        this.createLine(120 * size, 0, 120 * size, 950 * size, 1, 5)
      );
      group.appendChild(
        this.createLine(160 * size, 0, 160 * size, 950 * size, 1, 5)
      );
      return group;
    },
    createLine(x1, y1, x2, y2, strokeweight, zindex) {
      var newLine = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      newLine.setAttribute("zIndex", zindex);
      newLine.setAttribute("stroke-width", strokeweight);
      newLine.style.stroke = "black";
      newLine.setAttribute("x1", x1);
      newLine.setAttribute("x2", x2);
      newLine.setAttribute("y1", y1);
      newLine.setAttribute("y2", y2);
      return newLine;
    },
    getCoordData(listPipeline) {
      for (var i = 0; i < this.listPipelineShow.length; i++) {
        var pipeLineObject = this.listPipelineShow[i];
        pipeLineObject.width = this.width;
        var flow = pipeLineObject.flow;
        var specification = 0;
        if (
          "" != pipeLineObject.specification &&
          pipeLineObject.specification.toString().indexOf("X") < 0
        ) {
          specification = pipeLineObject.specification / 1000; //管径
        }
        if (flow) {
          groundAltitudeList.push(pipeLineObject.groundStartAlt); //地面高程起始点x轴坐标
          groundAltitudeList.push(pipeLineObject.width); //地面高程起始点Y轴坐标

          if (STAMP_config.profileAlt == "0") {
            pipeLineAltitudeList.push(pipeLineObject.pipeLineStartAlt);
          } else {
            pipeLineAltitudeList.push(
              pipeLineObject.groundStartAlt - pipeLineObject.startDeep
            ); //管线高程起始点x轴坐标
          }

          pipeLineAltitudeList.push(pipeLineObject.width); //管线高程起始点Y轴坐标
          this.width = pipeLineObject.width + pipeLineObject.length;
          groundAltitudeList.push(pipeLineObject.groundEndAlt); //地面高程结束点x轴坐标
          groundAltitudeList.push(this.width); //地面高程结束点Y轴坐标
          if (STAMP_config.profileAlt == "0") {
            pipeLineAltitudeList.push(pipeLineObject.pipeLineEndAlt);
          } else {
            pipeLineAltitudeList.push(
              pipeLineObject.groundEndAlt - pipeLineObject.endDeep
            ); //管线高程结束点x轴坐标
          }

          pipeLineAltitudeList.push(this.width); //管线高程结束点Y轴坐标
        } else {
          groundAltitudeList.push(pipeLineObject.groundEndAlt); //地面高程起始点x轴坐标
          groundAltitudeList.push(pipeLineObject.width); //地面高程起始点Y轴坐标

          if (STAMP_config.profileAlt == "0") {
            pipeLineAltitudeList.push(pipeLineObject.pipeLineEndAlt);
          } else {
            pipeLineAltitudeList.push(
              pipeLineObject.groundEndAlt - pipeLineObject.endDeep
            ); //管线高程起始点x轴坐标
          }
          pipeLineAltitudeList.push(pipeLineObject.width); //管线高程起始点Y轴坐标
          this.width =
            Number(pipeLineObject.width) + Number(pipeLineObject.length);
          groundAltitudeList.push(pipeLineObject.groundStartAlt); //地面高程结束点x轴坐标
          groundAltitudeList.push(this.width); //地面高程结束点Y轴坐标
          if (STAMP_config.profileAlt == "0") {
            pipeLineAltitudeList.push(pipeLineObject.pipeLineStartAlt);
          } else {
            pipeLineAltitudeList.push(
              pipeLineObject.groundStartAlt - pipeLineObject.startDeep
            ); //管线高程结束点x轴坐标
          }
          pipeLineAltitudeList.push(this.width); //管线高程结束点Y轴坐标
        }
      }
    },
    verSectionPipeLine(listPipeline) {
      var startArr = [];
      var endArr = [];
      for (var i = 0; i < listPipeline.length; i++) {
        this.listPipelineShow.push(listPipeline[i]);
        if (i > 0) {
          this.IsConnect = false;
          for (var j = 0; j < startArr.length; j++) {
            if (startArr[j] == listPipeline[i].endID) {
              //坐标全反过来
              this.IsConnect = true;
              listPipeline[j].flow = false;
              listPipeline[i].flow = false;
            } else if (startArr[j] == listPipeline[i].startID) {
              //第一个反过来
              this.IsConnect = true;
              listPipeline[j].flow = false;
              listPipeline[i].flow = true;
            } else if (endArr[j] == listPipeline[i].startID) {
              //不用反
              this.IsConnect = true;
              listPipeline[j].flow = true;
              listPipeline[i].flow = true;
            } else if (endArr[j] == listPipeline[i].endID) {
              //第二个反过来
              this.IsConnect = true;
              listPipeline[j].flow = true;
              listPipeline[i].flow = false;
            }
          }
        }
        var sStart = listPipeline[i].startID;
        var sEnd = listPipeline[i].endID;
        startArr.push(sStart);
        endArr.push(sEnd);
      }
    },
    // Y轴竖线
    createYLine() {
      var yLine = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      yLine.setAttribute("zIndex", "5");
      yLine.setAttribute("stroke-width", "1");
      yLine.style.stroke = "black";
      yLine.setAttribute("x1", "0");
      yLine.setAttribute("x2", "450");
      yLine.setAttribute("y1", "125");
      yLine.setAttribute("y2", "125");
      yLine.style.position = "absolute";
      gCanvas.appendChild(yLine);
    },
    // Y轴竖线刻度
    createYTick() {
      var start = 150,
        step = 50,
        iTick = 0,
        yTick = null;
      while (iTick <= 4) {
        yTick = document.createElementNS("http://www.w3.org/2000/svg", "line");
        yTick.style.zIndex = 5;
        yTick.setAttribute("stroke-width", "1");
        yTick.style.stroke = "black";
        yTick.setAttribute("x1", 100 + start + iTick * step);
        yTick.setAttribute("x2", 100 + start + iTick * step);
        yTick.setAttribute("y1", "125");
        yTick.setAttribute("y2", "130");
        // yTick.setAttribute('stroke-dasharray',"10");
        yTick.style.position = "absolute";
        gCanvas.appendChild(yTick);
        iTick += 1;
      }
    },
    // Y轴竖线刻度值
    createYTickValue(maxGroundAltitude, minPipeLineAltitude) {
      var textPoint = 0;
      var altitude = parseFloat(
        Math.abs((maxGroundAltitude - minPipeLineAltitude) / 4)
      ).toFixed(2);
      //altitude=Math.round(altitude);
      var minValue = parseFloat(minPipeLineAltitude).toFixed(2);
      for (var i = 0; i <= 4; i++) {
        var py = -i * 50 - 250;
        textPoint = parseFloat(altitude) * i + parseFloat(minValue);
        textPoint = textPoint.toFixed(2);
        var label = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        label.setAttribute("x", 100 - 10);
        label.setAttribute("y", py);
        label.setAttribute("transform", "rotate(90)");
        label.setAttribute("font-size", "13");
        label.textContent = textPoint;
        gCanvas.appendChild(label);
      }
    },
    // 表格标题
    createTableTitle() {
      var titles = ["埋深(m)", "规格(mm)", "间距(m)", "管线高程", "地面高程"];
      var i = 0,
        py = -9;
      var salle = "green";
      while (i < titles.length) {
        var txtPath = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        txtPath.setAttribute("x", 30);
        txtPath.setAttribute("y", py);
        txtPath.setAttribute("font-size", "18");
        txtPath.setAttribute("transform", "rotate(90)");
        gCanvas.appendChild(txtPath);
        txtPath.textContent = titles[i];
        i += 1;
        py = py - 40;
      }
    },
    //将坐标变换
    convertCoordList(altitudeList) {
      var temp = null;
      var coordList = [];
      for (var i = 0; i < altitudeList.length; i++) {
        if (maxX - minX != 0) {
          ratioX = 200 / (maxX - minX);
          temp = ratioX * (altitudeList[i] - minX) + 250;
        } else {
          temp = altitudeList[i] + 250;
        }
        if (temp > 450) {
          temp = 450;
        } else if (temp < 250) {
          temp = 250;
        }
        coordList.push(temp);
        i++;
        if (maxY - minY != 0) {
          ratioY = 800 / (maxY - minY);
          temp = ratioY * (altitudeList[i] - minY) + 150;
        } else {
          temp = altitudeList[i] + 150;
        }
        if (temp > 950) {
          temp = 950;
        } else if (temp < 150) {
          temp = 150;
        }
        coordList.push(temp);
      }
      return coordList;
    },
    // 地形剖面线
    createTerrainProfile(pts) {
      var tempPts = pts.toString().split(",");
      //pts=tempPts[0]+","+tempPts[1]+","+tempPts[tempPts.length-2]+","+tempPts[tempPts.length-1]
      for (var i = 0; i < tempPts.length; i++) {
        if (i == 0) {
          pts = tempPts[i];
        } else {
          pts += "," + tempPts[i];
        }
      }
      var a = pts.toString();
      var polyline = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "polyline"
      );
      polyline.setAttribute("points", a);
      polyline.setAttribute("stroke-width", "1");
      polyline.setAttribute("stroke", "black");
      polyline.setAttribute("fill", "white");
      gCanvas.appendChild(polyline);
    },
    // 管线剖面线
    createPipeLineProfile(pipeLineCoordList, pipeLineObjList) {
      var j = 0;
      for (var i = j; i < pipeLineCoordList.length; i += 4) {
        var p1 = (parseFloat(pipeLineCoordList[i].toString()) + 5).toString();
        var p2 = pipeLineCoordList[i + 1].toString();
        var p3 = (
          parseFloat(pipeLineCoordList[i + 2].toString()) + 5
        ).toString();
        var p4 = pipeLineCoordList[i + 3].toString();
        this.createPipeLineProfileTemp(p1, p2, p3, p4, pipeLineObjList[j]); //创建管线切面
        j = j + 1;
      }
    },
    //创建管线切面
    createPipeLineProfileTemp(p1, p2, p3, p4, pipeLineObj) {
      var a = p1 + "," + p2 + "," + p3 + "," + p4;
      var polyline = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "polyline"
      );
      polyline.setAttribute("points", a);
      polyline.setAttribute("stroke-width", "1");
      polyline.setAttribute("stroke", "red");
      polyline.setAttribute("fill", "white");
      polyline.setAttribute("zIndex", "1");
      polyline.onclick = function () {
        //弹出线信息
        var x = event.screenX - 80;
        var y = event.screenY - 150;
        // newWin = window.showModalDialog("MessageBox1.html?t=" + pipeLineObj.dataType + "&i=" + pipeLineObj.ID + "&m=" + pipeLineObj.mater + "&s=" + pipeLineObj.specification,
        //     "_blank", "dialogHeight=110px;dialogWidth=200px,top=" + y + ",left=" + x + ",toolbar=no,menubar=no,scrollbars=yes, resizable=yes,location=no,status=no");
      };

      gCanvas.appendChild(polyline);
    },
    //创建所有管线剖面
    createPipeProfiles(pipeLineObjList, minX, maxX, minY, maxY) {
      var i = 0;
      var x = 0;
      var y = 0;
      var yy = 0;
      var tempStart = 0;
      var tempEnd = 0;

      while (i < pipeLineObjList.length) {
        var specification = 0;
        if (
          "" != pipeLineObjList[i].specification &&
          pipeLineObjList[i].specification.toString().indexOf("X") == -1
        ) {
          specification = pipeLineObjList[i].specification / 1000; //管径
        }
        if (pipeLineObjList[i].flow) {
          if (STAMP_config.profileAlt == "0") {
            tempStart = pipeLineObjList[i].pipeLineStartAlt;
            tempEnd = pipeLineObjList[i].pipeLineEndAlt;
          } else {
            tempStart =
              pipeLineObjList[i].groundStartAlt - pipeLineObjList[i].startDeep;
            tempEnd =
              pipeLineObjList[i].groundEndAlt - pipeLineObjList[i].endDeep;
          }
        } else {
          if (STAMP_config.profileAlt == "0") {
            tempEnd = pipeLineObjList[i].pipeLineStartAlt;
            tempStart = pipeLineObjList[i].pipeLineEndAlt;
          } else {
            tempEnd =
              pipeLineObjList[i].groundStartAlt - pipeLineObjList[i].startDeep;
            tempStart =
              pipeLineObjList[i].groundEndAlt - pipeLineObjList[i].endDeep;
          }
        }
        if (maxX - minX != 0) {
          ratioX = 200 / (maxX - minX);
          x = (tempStart - minX) * ratioX + 250;
        } else {
          x = tempStart - minX + 250;
        }
        if (x > 450) {
          x = 450;
        } else if (x < 250) {
          x = 250;
        }
        if (maxY - minY != 0) {
          ratioY = 800 / (maxY - minY);
          y = (pipeLineObjList[i].width - minY) * ratioY + 150;
          if (y > 950) {
            y = 950;
          } else if (y < 150) {
            y = 150;
          }
          yy = (pipeLineObjList[i].width - minY) * ratioY + 150;
          if (yy > 950) {
            yy = 950;
          } else if (yy < 150) {
            yy = 150;
          }
        } else {
          y = pipeLineObjList[i].width - minY + 150;
          if (y > 950) {
            y = 950;
          } else if (y < 150) {
            y = 150;
          }
          yy = pipeLineObjList[i].width - minY + 150;
          if (yy > 950) {
            yy = 950;
          } else if (yy < 150) {
            yy = 150;
          }
        }
        var lineType = "circle";
        var tag = pipeLineObjList[i].specification; //.split("X");
        if (isNaN(pipeLineObjList[i].specification)) {
          lineType = "polygon";
        } else {
          lineType = "circle";
        }
        //创建SVG起点数据显示
        this.createPipeStartProfile(pipeLineObjList[i], x, y, yy, lineType, i);

        if (maxX - minX != 0) {
          ratioX = 200 / (maxX - minX);
          x = (tempEnd - minX) * ratioX + 250;
        } else {
          x = tempEnd - minX + 250;
        }
        if (x > 450) {
          x = 450;
        } else if (x < 250) {
          x = 250;
        }
        if (maxY - minY != 0) {
          ratioY = 800 / (maxY - minY);
          y =
            (pipeLineObjList[i].width + pipeLineObjList[i].length - minY) *
              ratioY +
            150;
          if (y > 950) {
            y = 950;
          } else if (y < 150) {
            y = 150;
          }
          yy =
            (pipeLineObjList[i].width + pipeLineObjList[i].length - minY) *
              ratioY +
            150;
          if (yy > 950) {
            yy = 950;
          } else if (yy < 150) {
            yy = 150;
          }
        } else {
          y = pipeLineObjList[i].width + pipeLineObjList[i].length - minY + 150;
          if (y > 950) {
            y = 950;
          } else if (y < 150) {
            y = 150;
          }
          yy =
            pipeLineObjList[i].width + pipeLineObjList[i].length - minY + 150;
          if (yy > 950) {
            yy = 950;
          } else if (yy < 150) {
            yy = 150;
          }
        }
        if (i == pipeLineObjList.length - 1) {
          bLastPoint = 1;
        }
        //创建SVG终点数据显示
        this.createPipeEndProfile(pipeLineObjList[i], x, y, yy, lineType, i);
        i += 1;
      }
    },
    // 管线剖面点1
    createPipeStartProfile(pipeLineObj, x, y, yy, type, i) {
      var r = 5;
      var circle = null;
      if (type === "circle") {
        circle = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle"
        );
        circle.setAttribute("cx", x + r);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", r);
      } else {
        circle = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        circle.setAttribute("x", x);
        circle.setAttribute("y", y - r);
        circle.setAttribute("width", r * 2);
        circle.setAttribute("height", r * 2);
      }
      circle.setAttribute("cursor", "pointer");
      circle.setAttribute("fill", pipeLineObj.fillcolor);
      circle.setAttribute("stroke", "false");
      var divHover = this.$refs.divHover;
      circle.onmouseover = function () {
        var divStr = '<table align="right">';
        divStr +=
          '<tr class="colClass1"><td class="rightTd">数据类型：</td><td>' +
          pipeLineObj.dataType +
          "</td></tr>";
        divStr +=
          '<tr class="colClass2"><td class="rightTd">编号：</td><td id="id">' +
          pipeLineObj.ID +
          "</td></tr>";
        divStr +=
          '<tr class="colClass1"><td class="rightTd">规格：</td><td>' +
          pipeLineObj.specification +
          "</td></tr>";
        divStr +=
          '<tr class="colClass2"><td class="rightTd">材质：</td><td>' +
          pipeLineObj.mater +
          "</td></tr>";
        divStr +=
          '<tr class="colClass1"><td class="rightTd">横坐标：</td><td>' +
          pipeLineObj.startCoordX +
          "</td></tr>";
        divStr +=
          '<tr class="colClass2"><td class="rightTd">纵坐标：</td><td>' +
          pipeLineObj.startCoordY +
          "</td></tr>";
        divStr +=
          '<tr class="colClass1"><td class="rightTd">管线高程：</td><td>' +
          pipeLineObj.dxPipeLineStartAlt +
          "</td></tr>";
        divStr +=
          '<tr class="colClass2"><td class="rightTd">地面高程：</td><td>' +
          pipeLineObj.dataStartAlt +
          "</td></tr>";
        divStr += "</table>";
        divHover.innerHTML = divStr;
        divHover.style.display = "block";

        var _left = this.getAttribute("cy")
          ? this.getAttribute("cy")
          : this.getAttribute("y");
        _left = Number(_left);
        if (_left + 25 + parseInt(divHover.clientWidth) > 980 + 35) {
          divHover.style.left =
            _left - 35 - parseInt(divHover.clientWidth) + "px";
        } else {
          divHover.style.left = _left + 5 + 35 + "px";
        }
        var _top = this.getAttribute("cx")
          ? this.getAttribute("cx")
          : this.getAttribute("x");
        _top = Number(_top);
        if (400 - _top < 116) {
          divHover.style.top = "116px";
        } else if (400 - _top + 100 + parseInt(divHover.clientHeight) > 400) {
          divHover.style.top = 400 - parseInt(divHover.clientHeight) + "px";
        } else {
          divHover.style.top = 400 - _top + 100 + "px";
        }
      };
      circle.onmouseout = function () {
        $("#divHover").hide();
      };
      // circle.onclick = function () {
      //     var x = event.screenX - 100;
      //     var y = event.screenY - 250;
      //     newWin = window.showModalDialog("MessageBox.html?t=" + pipeLineObj.dataType + "&i=" + pipeLineObj.ID + "&s=" + pipeLineObj.specification + "&m=" + pipeLineObj.mater +
      //         "&x=" + pipeLineObj.startCoordX + "&y=" + pipeLineObj.startCoordY + "&p=" + pipeLineObj.dxPipeLineStartAlt + "&g=" + pipeLineObj.dataStartAlt
      //         , "_blank", "dialogWidth=220px;dialogHeight=220px,top=" + y + ",left=" + x + ",toolbar=no,menubar=no,scrollbars=no, resizable=no,location=no,status=no");
      // }
      gCanvas.appendChild(circle);

      //创建点与地面连线
      var plotLine = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      plotLine.setAttribute("stroke", "true");
      plotLine.setAttribute("stroke-width", "1");
      plotLine.setAttribute("x1", 0);
      plotLine.setAttribute("y1", y);
      plotLine.setAttribute("x2", x);
      plotLine.setAttribute("y2", y);
      plotLine.setAttribute("stroke-dasharray", "5 3");
      plotLine.style.stroke = "black";
      gCanvas.appendChild(plotLine);
      //默认起点为数组数目减1，所以应该给起点设定变量用以加大间距
      if (i % 2 == 0) {
        var ttp = 10;
        this.insertStartDataToTable(pipeLineObj, y, yy, ttp);
      } else {
        var ttp = 0;
        this.insertStartDataToTable(pipeLineObj, y, yy, ttp);
      }
    },
    insertStartDataToTable(pipeLineObj, y, yy, ttp) {
      //地面高程
      var groundAlt = pipeLineObj.groundStartAlt;
      var dataAlt = pipeLineObj.dataStartAlt;
      var pipeLineAlt = pipeLineObj.dxPipeLineStartAlt;
      var deep = pipeLineObj.startDeep;
      if (!pipeLineObj.flow) {
        groundAlt = pipeLineObj.groundEndAlt;
        dataAlt = pipeLineObj.dataEndAlt;
        pipeLineAlt = pipeLineObj.dxPipeLineEndAlt;
        deep = pipeLineObj.endDeep;
      }
      var newText = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      newText.setAttribute("x", y - 25);
      newText.setAttribute("y", -170 + ttp);
      newText.setAttribute("font-size", "11");
      newText.setAttribute("transform", "rotate(90)");
      gCanvas.appendChild(newText);
      newText.textContent = dataAlt;

      //管线高程
      var newText = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      newText.setAttribute("x", y - 25);
      newText.setAttribute("y", -135 + ttp);
      newText.setAttribute("font-size", "11");
      newText.setAttribute("transform", "rotate(90)");
      gCanvas.appendChild(newText);
      newText.textContent = pipeLineAlt;

      //规格
      var specification = pipeLineObj.specification;
      specification = specification.toString();
      if (specification.indexOf("X") == -1) {
        var newText = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        newText.setAttribute("x", y - 25);
        newText.setAttribute("y", -55 + ttp);
        newText.setAttribute("font-size", "13");
        newText.setAttribute("transform", "rotate(90)");

        gCanvas.appendChild(newText);
        newText.textContent = specification;
      } else if (specification.indexOf("X") > -1) {
        var newText = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        newText.setAttribute("x", y - 25);
        newText.setAttribute("y", -55);
        newText.setAttribute("font-size", "13");
        newText.setAttribute("transform", "rotate(90)");
        gCanvas.appendChild(newText);
        newText.textContent = specification;
      }
      //埋深
      var newText = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      newText.setAttribute("x", y - 25);
      newText.setAttribute("y", -25 + ttp);
      newText.setAttribute("font-size", "13");
      newText.setAttribute("transform", "rotate(90)");
      gCanvas.appendChild(newText);
      newText.textContent = deep;
    },
    // 管线剖面点2
    createPipeEndProfile(pipeLineObj, x, y, yy, type, i) {
      var r = 5;
      var circle = null;
      if (type === "circle") {
        circle = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle"
        );
        circle.setAttribute("cx", x + r);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", r);
      } else {
        circle = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        circle.setAttribute("x", x);
        circle.setAttribute("y", y - r);
        circle.setAttribute("width", r * 2);
        circle.setAttribute("height", r * 2);
      }
      circle.setAttribute("cursor", "pointer");
      circle.setAttribute("fill", pipeLineObj.fillcolor);
      circle.setAttribute("stroke", "false");
      var divHover = this.$refs.divHover;
      circle.onmouseover = function () {
        var divStr = '<table align="right">';
        divStr +=
          '<tr class="colClass1"><td class="rightTd">数据类型：</td><td>' +
          pipeLineObj.dataType +
          "</td></tr>";
        divStr +=
          '<tr class="colClass2"><td class="rightTd">编号：</td><td id="id">' +
          pipeLineObj.ID +
          "</td></tr>";
        divStr +=
          '<tr class="colClass1"><td class="rightTd">规格：</td><td>' +
          pipeLineObj.specification +
          "</td></tr>";
        divStr +=
          '<tr class="colClass2"><td class="rightTd">材质：</td><td>' +
          pipeLineObj.mater +
          "</td></tr>";
        divStr +=
          '<tr class="colClass1"><td class="rightTd">横坐标：</td><td>' +
          pipeLineObj.endCoordX +
          "</td></tr>";
        divStr +=
          '<tr class="colClass2"><td class="rightTd">纵坐标：</td><td>' +
          pipeLineObj.endCoordY +
          "</td></tr>";
        divStr +=
          '<tr class="colClass1"><td class="rightTd">管线高程：</td><td>' +
          pipeLineObj.dxPipeLineEndAlt +
          "</td></tr>";
        divStr +=
          '<tr class="colClass2"><td class="rightTd">地面高程：</td><td>' +
          pipeLineObj.dataEndAlt +
          "</td></tr>";
        divStr += "</table>";
        divHover.innerHTML = divStr;
        divHover.style.display = "block";

        var _left = this.getAttribute("cy")
          ? this.getAttribute("cy")
          : this.getAttribute("y");
        _left = Number(_left);
        if (_left + 25 + parseInt(divHover.clientWidth) > 980 + 35) {
          divHover.style.left =
            _left - 35 - parseInt(divHover.clientWidth) + "px";
        } else {
          divHover.style.left = _left + 5 + 35 + "px";
        }
        var _top = this.getAttribute("cx")
          ? this.getAttribute("cx")
          : this.getAttribute("x");
        _top = Number(_top);
        if (400 - _top < 116) {
          divHover.style.top = "116px";
        } else if (400 - _top + 100 + parseInt(divHover.clientHeight) > 400) {
          divHover.style.top = 400 - parseInt(divHover.clientHeight) + "px";
        } else {
          divHover.style.top = 400 - _top + 100 + "px";
        }
      };
      circle.onmouseout = function () {
        $("#divHover").hide();
      };
      // circle.onclick = function () {
      //     var x = event.screenX - 100;
      //     var y = event.screenY - 250;
      //     newWin = window.showModalDialog("MessageBox.html?t=" + pipeLineObj.dataType + "&i=" + pipeLineObj.ID + "&s=" + pipeLineObj.specification + "&m=" + pipeLineObj.mater +
      //         "&x=" + pipeLineObj.endCoordX + "&y=" + pipeLineObj.endCoordY + "&p=" + pipeLineObj.dxPipeLineEndAlt + "&g=" + pipeLineObj.dataEndAlt
      //         , "_blank", "dialogWidth=220px;dialogHeight=220px,top=" + y + ",left=" + x + ",toolbar=no,menubar=no,scrollbars=no, resizable=no,location=no,status=no");
      // }
      gCanvas.appendChild(circle);

      //创建点与地面连线
      var plotLine = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      plotLine.setAttribute("stroke", "true");
      plotLine.setAttribute("stroke-width", "1");
      plotLine.setAttribute("x1", 0);
      plotLine.setAttribute("y1", y);
      plotLine.setAttribute("x2", x);
      plotLine.setAttribute("y2", y);
      plotLine.setAttribute("stroke-dasharray", "5 3");
      plotLine.style.stroke = "black";
      gCanvas.appendChild(plotLine);

      var ttp = 0;
      this.insertEndDataToTable(pipeLineObj, y, yy, ttp);
    },
    insertEndDataToTable(pipeLineObj, y, yy, ttp) {
      //间距
      var length = pipeLineObj.length.toFixed(2);
      var newText = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      newText.setAttribute("x", (yy + yyy) / 2 - 10);
      newText.setAttribute("y", -90 + ttp);
      newText.setAttribute("font-size", "13");
      newText.setAttribute("transform", "rotate(90)");
      newText.textContent = length;
      gCanvas.appendChild(newText);
      yyy = yy;

      if (bLastPoint == 0) {
        return;
      }

      //地面高程
      var groundAlt = pipeLineObj.groundEndAlt;
      var dataAlt = pipeLineObj.dataEndAlt;
      var pipeLineAlt = pipeLineObj.dxPipeLineEndAlt;
      var deep = pipeLineObj.endDeep;
      if (!pipeLineObj.flow) {
        groundAlt = pipeLineObj.groundStartAlt;
        dataAlt = pipeLineObj.dataStartAlt;
        pipeLineAlt = pipeLineObj.dxPipeLineStartAlt;
        deep = pipeLineObj.startDeep;
      }
      var newText = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      newText.setAttribute("x", y - 25);
      newText.setAttribute("y", -170 + ttp);
      newText.setAttribute("font-size", "11");
      newText.setAttribute("transform", "rotate(90)");
      gCanvas.appendChild(newText);
      newText.textContent = dataAlt;

      //管线高程
      var newText = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      newText.setAttribute("x", y - 25);
      newText.setAttribute("y", -135 + ttp);
      newText.setAttribute("font-size", "11");
      newText.setAttribute("transform", "rotate(90)");
      gCanvas.appendChild(newText);
      newText.textContent = pipeLineAlt;

      //规格
      var specification = pipeLineObj.specification;
      specification = specification.toString();
      if (specification.indexOf("X") == -1) {
        var newText = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        newText.setAttribute("x", y - 25);
        newText.setAttribute("y", -55 + ttp);
        newText.setAttribute("font-size", "13");
        newText.setAttribute("transform", "rotate(90)");
        gCanvas.appendChild(newText);
        newText.textContent = specification;
      } else if (specification.indexOf("X") > -1) {
        var newText = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        newText.setAttribute("x", y - 25);
        newText.setAttribute("y", -55 + ttp);
        newText.setAttribute("font-size", "13");
        newText.setAttribute("transform", "rotate(90)");
        gCanvas.appendChild(newText);
        newText.textContent = specification;
      }

      //埋深
      var newText = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      newText.setAttribute("x", y - 25);
      newText.setAttribute("y", -25 + ttp);
      newText.setAttribute("font-size", "13");
      newText.setAttribute("transform", "rotate(90)");
      gCanvas.appendChild(newText);
      newText.textContent = deep;
    },
    handleClose() {
      this.$router.push("/");
    },
  },
  beforeRouteLeave(to, from, next) {
    next();
    this.stampAPI.usearth.application.pickingEnable = false;
    this.stampAPI.usearth.application._selectedEntityChanged.removeEventListener(
      this.$searchCallback
    );
    this.clear();
    this.$parent.$refs.functionPanel.curSelMenu.name = "";
  },
};
</script>

<style lang="less" scoped>
.analysisversection {
  // width: 300px;
  width: 18.625vw;
}

// .svgpopover {
//     width: 1210px;
// }

.el-row {
  margin-bottom: 5px;

  &:last-child {
    margin-bottom: 0px;
  }
}

.analysisversection-container {
  height: 550px;
  font-size: 16px;

  .analysisversection-container-text {
    height: 30px;
    line-height: 30px;
  }

  .analysisversection-container-result {
    height: 30px;
    line-height: 30px;
    font-weight: 700;
    text-align: left;
    padding-left: 10px;
    // background: rgba(1, 76, 91, 1);
  }

  .analysisversection-container-table {
    margin-bottom: 0px;
  }

  .analysisversection-container-pagination {
    margin-bottom: 0px;
  }
}
</style>
