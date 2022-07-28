<template>
  <Popover
    :visible.sync="dialogVisible"
    :show-header="true"
    title="设施搜索"
    custom-class="analysisattachment"
    :beforeClose="handleClose"
  >
    <div class="analysisattachment-container">
      <el-row>
        <el-col :span="5" class="analysisattachment-container-text">
          <div class="text">图层：</div>
        </el-col>
        <el-col :span="11">
          <el-select v-model="searchLayer" size="mini" @change="changeLayer">
            <el-option
              v-for="item in pipeData"
              :key="item.name"
              :label="item.name"
              :value="item.guid"
            ></el-option>
          </el-select>
        </el-col>
        <el-col :span="8">
          <el-button type="primary" size="mini" @click="searchAttachMentByLayer"
            >获取附属物</el-button
          >
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="5" class="analysisattachment-container-text">
          <div class="text">附属物:</div>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <div class="analysisattachment-container-checkboxs">
            <el-scrollbar style="height: 100%" wrap-class="scrollbar-wrapper">
              <el-checkbox-group v-model="checklist" @change="changeChekList">
                <el-checkbox
                  v-for="(item, index) in attachMentData"
                  :key="index"
                  :label="item"
                ></el-checkbox>
              </el-checkbox-group>
            </el-scrollbar>
          </div>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8" class="analysisattachment-container-text">
          <div class="text">分析半径:</div>
        </el-col>
        <el-col :span="12">
          <el-input
            v-model.number="txtBufferDist"
            class="input"
            @input="changetxtBufferDist"
            v-input-focus
          ></el-input>
        </el-col>
        <el-col :span="4" class="analysisattachment-container-text">
          <div>米</div>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8" class="analysisattachment-container-text">
          <div class="text">等值线间隔:</div>
        </el-col>
        <el-col :span="12">
          <el-input
            v-model.number="BufferDist"
            class="input"
            v-input-focus
            @input="changeBuffDist"
          ></el-input>
        </el-col>
        <el-col :span="4" class="analysisattachment-container-text">
          <div>米</div>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-button
            type="primary"
            size="mini"
            :disabled="btnDisable1"
            @click="selectBtn"
            >获取半径</el-button
          >
          <el-button
            type="primary"
            size="mini"
            :disabled="btnDisable2"
            @click="btnAnalyze"
            >分析</el-button
          >
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12" class="analysisattachment-container-result">
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
      <el-row class="analysisattachment-container-table">
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
                prop="name"
                label="图层"
                :show-overflow-tooltip="true"
              ></el-table-column>
              <el-table-column
                prop="distance"
                label="距离"
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
import { DownloadFileWithoutIp } from "@/api/common";
import {
  convertExcelData,
  regExpValidation,
  colorToHex,
  createGuid,
} from "@/utils";
import axios from "axios";
import { checkNum } from "../../utils";
import Popover from "@/components/Popover";
export default {
  data() {
    this.pipeData = [];
    this.project = null;
    this.$queryParam = {};
    this.$filedCfgJson = "";
    this.$_Datum = ""; //坐标转换
    this.$pipelID = ""; //管线编号字段
    this.$pipepID = ""; //管点编号字段
    this.$hightLightArr = []; //高亮对象guid
    this.$buffArr = []; // 圆
    this.$bufferDisk = []; //间隔圆
    this.timer = null;
    this.lastLayer = null;
    return {
      dialogVisible: true,
      disabled: true,
      searchLayer: "", //当前选中图层
      detailInfoShow: false, //是否显示详情
      detailInfo: [], //详情信息
      tableData: [], //结果集合
      attachMentData: [], //附属物字段集合
      checklist: [], //选中的附属物字段合集
      detailCheckbox: false,
      txtBufferDist: "", //半径
      BufferDist: 10, //等值线间隔
      circleInfo: {}, //空间属性
      btnDisable1: true, //获取半径按钮状态
      btnDisable2: true, //分析按钮状态
      center: "", //中心点
      mVec: "", //中心点平面
      showResult: false, //显示结果
      downloadLoading: false, //导出
    };
  },
  components: {
    Popover,
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
    var spaialUrl = this.g_Project.SpatialReference;
    DownloadFileWithoutIp(spaialUrl, "arraybuffer")
      .then((res) => {
        var array_data = res.data;
        var option = {
          array: array_data,
        };

        self.$_Datum = self.stampAPI.usearth.Factory.CreateDatum(option);
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
  computed: {
    tableHeight() {
      return (230 / 1920) * window.innerWidth;
    },
  },
  watch: {
    showResult(newV, oldV) {
      this.showHightlight(newV);
    },
  },
  methods: {
    getRowClass() {
      return "background:#3f5c6d2c;color:#ffffff;";
    },
    changeChekList(value) {
      if (this.checklist.length > 0) {
        this.btnDisable1 = false;
      } else {
        this.btnDisable1 = true;
        this.btnDisable2 = true;
      }
    },
    searchAttachMentByLayer() {
      let self = this;
      let dataType = "point";
      let mFieldName = getNameNoIgnoreCase(
        self.$filedCfgJson,
        "US_ATTACHMENT",
        "0",
        true
      );

      let layer = self.stampAPI.usearth.LayerManager.GetLayerByGUID(
        self.searchLayer
      );
      let gisServer = layer._gis_server_connection;
      //   let postDataParam = `service=${self.searchLayer}&qt=256&fd=${mFieldName}&dt=${dataType}&encoding=utf-8&`;
      let postDataParam = {
        service: self.searchLayer,
        qt: 256,
        fd: mFieldName,
        dt: dataType,
        encoding: "utf-8",
      };
      postDataQuery(postDataParam, gisServer).then(function (res) {
        let json = self.$x2js.xml2js(res.data).Xml;
        if (json == null || !json.ValueRangeResult) {
          self.$message({
            message: "查询结果不存在",
            type: "warning",
          });
          return;
        }
        let valueRangeResult = json.ValueRangeResult.ValueRange.Value;
        if (!Array.isArray(valueRangeResult)) {
          //只有一个结果时，结果为对象转换为数组与数组统一处理
          valueRangeResult = [valueRangeResult];
        }
        self.attachMentData = [];
        valueRangeResult.forEach((element) => {
          if (element) {
            self.attachMentData.push(element);
          }
        });
      });
    },
    selectBtn() {
      let self = this;
      self.tableData = [];
      self.$hightLightArr = [];
      self.showResult = false;
      self.clearBuffer();
      self.stampAPI.usearth.ShapeCreator.CreateCircle({
        custom_excute_finish: function (result) {
          if (!result || !result.data || !result.radius) {
            self.$message({
              message: "请至少绘制两个点创建圆",
              type: "warning",
              center: true,
            });
            self.stampAPI.usearth.ShapeCreator.Clear();
            return;
          }
          self.center = result.data[0];
          self.btnDisable2 = false;
          let jwd = StampGis.Cartographic.fromCartesian(result.data[0]);
          self.txtBufferDist = result.radius;
          self.circleInfo = {
            lon: StampGis.StampMath.toDegrees(jwd.longitude),
            lat: StampGis.StampMath.toDegrees(jwd.latitude),
            r: result.radius,
          };
          self.mVec = self.$_Datum.des_BLH_to_src_xy(
            self.circleInfo.lon,
            self.circleInfo.lat,
            jwd.height
          );
          self.createBufferFromLine(result.radius, true, true);
        },
      });
    },
    btnAnalyze() {
      let self = this;
      self.tableData = [];
      self.$hightLightArr = [];
      self.showResult = false;
      if (!regExpValidation(self.txtBufferDist)) {
        self.$message({
          message: "请设置分析半径",
          type: "warning",
          center: true,
        });
        return;
      }
      if (!regExpValidation(self.BufferDist)) {
        self.$message({
          message: "请设置等值线间隔",
          type: "warning",
          center: true,
        });
        return;
      }
      let US_ATTACHMENT = getNameNoIgnoreCase(
        self.$filedCfgJson,
        "US_ATTACHMENT",
        "0",
        true
      ).toLowerCase();
      let pc = "";
      let dataType = "point";
      let sc = "";
      sc = "(3,0,";
      sc += self.txtBufferDist + ",";
      sc += self.circleInfo.lon + "," + self.circleInfo.lat;
      sc += ")";
      self.checklist.forEach((element) => {
        pc += "(or,equal," + US_ATTACHMENT + ",";
        pc += element;
        pc += ")";
      });

      let layer = self.stampAPI.usearth.LayerManager.GetLayerByGUID(
        self.searchLayer
      );
      let gisServer = layer._gis_server_connection;

      let params = {
        service: self.searchLayer,
        qt: 17,
        dt: dataType,
        sc: sc,
        pc: pc,
        pg: "0,100",
        encoding: "utf-8",
      };
      postDataQuery(params, gisServer).then(function (res) {
        let json = self.$x2js.xml2js(res.data).Xml;
        self.parseData(json);
      });
    },
    //解析结果
    parseData(json) {
      let self = this;
      let records = "";
      if (json && json.Result && json.Result.Record) {
        records = json.Result.Record;
        Array.isArray(records) || (records = [records]);
      } else {
        self.$message({
          message: "查询结果不存在",
          type: "warning",
        });
        return;
      }
      self.disabled = false;
      self.greenCircle();
      let type = json.Result._geometry;
      type = type === "point" ? "point" : "line";
      for (let i = 0; i < records.length; i++) {
        let distance = 0;
        let Coordinates = records[i].SHAPE.Point.OriCoordinates;
        let coord = Coordinates.split(" ");
        let coordinate1 = coord[0].split(",");
        if (coordinate1.length > 2) {
          distance = parseFloat(
            Math.sqrt(
              (coordinate1[0] - self.mVec.x) * (coordinate1[0] - self.mVec.x) +
                (coordinate1[1] - self.mVec.y) * (coordinate1[1] - self.mVec.y)
            )
          ).toFixed(3);
        }
        records[i].distance = distance;
      }
      records.sort(function (a, b) {
        return parseFloat(a.distance) > parseFloat(b.distance) ? 1 : -1;
      });
      let us_id_field = getNameNoIgnoreCase(
        self.$filedCfgJson,
        "US_KEY",
        "0",
        true
      ).toLowerCase();
      let us_attachment_field = getNameNoIgnoreCase(
        self.$filedCfgJson,
        "US_ATTACHMENT",
        "0",
        true
      ).toLowerCase();
      for (let i = 0; i < records.length; i++) {
        self.tableData.push({
          id: records[i][us_id_field],
          name: records[i][us_attachment_field],
          type: type,
          distance: records[i].distance,
        });
        self.$hightLightArr.push(records[i][us_id_field]);
      }
    },
    //绘制间隔圆形
    greenCircle() {
      this.stampAPI.usearth.ShapeCreator.Clear();
      let circleCount = parseInt(this.txtBufferDist / this.BufferDist);
      if (this.txtBufferDist >= this.BufferDist) {
        for (let i = 0; i < circleCount; i++) {
          let bGreen = i % 2 == 0 ? 0xcc009900 : 0xccffff00;
          let radius = this.BufferDist * (i + 1);
          this.createBufferFromLine(radius, false, false, bGreen);
        }
      }
    },
    //绘制缓冲区
    createBufferFromLine(radius, bDist, fillcolorTag, lineColor) {
      let self = this;
      const earth = self.stampAPI.usearth;
      const circle = earth.Factory.CreateElementCircle({
        guid: createGuid(),
        name: "circle",
        doc: earth.document,
      });
      circle.BeginUpdate();
      circle.setRadiusAndCenter(radius, self.center);
      if (fillcolorTag) {
        circle.fillColor = 0x2500ff00;
      } else {
        circle.fillColor = 0x00ffffff;
      }
      if (bDist) {
        circle.lineColor = 0xccff0000;
      } else {
        if (lineColor) {
          circle.lineColor = lineColor;
        } else {
          circle.lineColor = 0xcc009900;
        }
      }
      circle.set_altitude_type(1);
      circle.EndUpdate();
      earth.document.elementRoot.attach_object(circle);
      earth.document.register_object(circle);
      if (bDist) {
        self.$buffArr.push(circle);
      } else {
        self.$bufferDisk.push(circle);
      }
    },
    clearBuffer() {
      this.stampAPI.usearth.ShapeCreator.Clear();
      for (let i = 0; i < this.$buffArr.length; i++) {
        this.stampAPI.usearth.document.elementRoot.detach_object(
          this.$buffArr[i]
        );
      }
      for (let j = 0; j < this.$bufferDisk.length; j++) {
        this.stampAPI.usearth.document.elementRoot.detach_object(
          this.$bufferDisk[j]
        );
      }
      this.$buffArr = [];
      this.$bufferDisk = [];
    },
    getDetailInfo(row, col, e) {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      if (this.lastLayer) {
        this.lastLayer.container._highlight_objs = [];
        this.lastLayer.well._highlight_objs = [];
        this.lastLayer.joint._highlight_objs = [];
        this.lastLayer.equipment._highlight_objs = [];
        this.lastLayer = null;
      }

      const self = this;
      let layer = self.stampAPI.usearth.LayerManager.GetLayerByGUID(
        this.searchLayer
      );
      this.lastLayer = layer;

      let gisServer = layer._gis_server_connection;
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

              layer.container.query_param.clear_search_parameter();
              layer.container.query_param.set_keyword_value(row.id);

              function searchCallback(options) {
                layer.container._highlight_objs.push(
                  options.result && options.result["SE_ID"]
                );
                self.timer = setTimeout(
                  () => (self.$layer.container._highlight_objs = []),
                  STAMP_config.highLightTime
                );
              }
              layer.container.query_param.execute_search(0, searchCallback, 0);
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
        let pipeId = getNameNoIgnoreCase(
          self.$filedCfgJson,
          "US_KEY",
          "0",
          true
        ).toLowerCase();
        let searchParam = `rd=&t=well&c=${this.searchLayer}&pk=${row.id}&rt=1&mesh=0&detail=0&p=0&pl=100`;
        let searchParam1 = `rd=&t=joint&c=${this.searchLayer}&pk=${row.id}&rt=1&mesh=0&detail=0&p=0&pl=100`;
        let searchParam2 = `rd=&t=equipment&c=${this.searchLayer}&pk=${row.id}&rt=1&mesh=0&detail=0&p=0&pl=100`;
        // let postDataParam = `service=${this.searchLayer}&qt=16&dt=point&pc=(and,equal,${pipeId},${row.id})&pg=0,10&encoding=utf-8&`;

        let postDataParam = {
          service: this.searchLayer,
          qt: 16,
          dt: "point",
          pc: `(and,equal,${pipeId},${row.id})`,
          pg: "0,10",
          encoding: "utf-8",
        };
        axios
          .all([
            postSearch(searchParam),
            postDataQuery(postDataParam, gisServer),
            postSearch(searchParam1),
            postSearch(searchParam2),
          ])
          .then(
            axios.spread(function (search, dataQuery, search1, search2) {
              let modelData = self.$x2js.xml2js(search.data).Xml.SearchResult
                .ModelResult.ModelData;
              let modelData1 = self.$x2js.xml2js(search1.data).Xml.SearchResult
                .ModelResult.ModelData;
              let modelData2 = self.$x2js.xml2js(search2.data).Xml.SearchResult
                .ModelResult.ModelData;
              let arr = [];
              if (modelData) {
                arr = modelData.LonLatBox.split(",");
                layer.well._highlight_objs.push(modelData["SE_ID"]);
              } else if (modelData1) {
                arr = modelData1.LonLatBox.split(",");
                layer.joint._highlight_objs.push(modelData1["SE_ID"]);
              } else if (modelData2) {
                arr = modelData2.LonLatBox.split(",");
                layer.equipment._highlight_objs.push(modelData2["SE_ID"]);
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

              self.timer = setTimeout(() => {
                layer.well._highlight_objs = [];
                layer.joint._highlight_objs = [];
                layer.equipment._highlight_objs = [];
              }, STAMP_config.highLightTime);

              // layer.well.query_param.clear_search_parameter();
              // layer.well.query_param.set_keyword_value(row.id);
              // layer.joint.query_param.clear_search_parameter();
              // layer.joint.query_param.set_keyword_value(row.id);
              // layer.equipment.query_param.clear_search_parameter();
              // layer.equipment.query_param.set_keyword_value(row.id);

              // function searchCallback(options) {
              //     layer.well._highlight_objs.push(
              //         options.result && options.result["SE_ID"]
              //     );
              //     layer.joint._highlight_objs.push(
              //         options.result && options.result["SE_ID"]
              //     );
              //     layer.equipment._highlight_objs.push(
              //         options.result && options.result["SE_ID"]
              //     );
              //     setTimeout(() => {
              //         layer.well._highlight_objs = [];
              //         layer.joint._highlight_objs = [];
              //         layer.equipment._highlight_objs = [];
              //     }, STAMP_config.highLightTime);
              // }
              // layer.well.query_param.execute_search(
              //     0,
              //     searchCallback,
              //     0
              // );
              // layer.joint.query_param.execute_search(
              //     0,
              //     searchCallback,
              //     0
              // );
              // layer.equipment.query_param.execute_search(
              //     0,
              //     searchCallback,
              //     0
              // );
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
    changeBuffDist(val) {
      if (regExpValidation(this.BufferDist)) {
        this.clearBuffer();
        this.createBufferFromLine(this.txtBufferDist, true, true);
        this.greenCircle();
      } else {
        this.btnDisable2 = true;
      }
    },
    changetxtBufferDist() {
      if (regExpValidation(this.txtBufferDist)) {
        this.clearBuffer();
        this.createBufferFromLine(this.txtBufferDist, true, true);
        this.greenCircle();
      } else {
        this.btnDisable2 = true;
      }
    },
    changeLayer() {
      this.btnDisable1 = true;
      this.btnDisable2 = true;
    },
    download() {
      this.downloadLoading = true;
      import("@/vendor/Export2Excel").then((excel) => {
        const tHeader = ["编号", "图层", "距离"];
        const filterVal = ["id", "name", "distance"];
        const data = convertExcelData(filterVal, this.tableData);
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: "设施搜索",
          autoWidth: true,
          bookType: "xlsx",
        });
        this.downloadLoading = false;
      });
    },
    handleClose() {
      this.$router.push("/");
    },
    showHightlight(newV) {
      const self = this;
      let queryLayer = this.stampAPI.usearth.LayerManager.GetLayerByGUID(
        self.searchLayer
      );
      if (newV) {
        if (this.$hightLightArr.length) {
          var idsArr = this.$hightLightArr;
          if (idsArr.length < 6) {
            queryLayer.well.query_param.clear_search_parameter();
            queryLayer.well.query_param.set_pkeyword_value(idsArr);
            queryLayer.well.query_param.execute_search(0, searchCallback, 0);
          } else {
            for (let i = 0; i < Math.ceil(idsArr.length / 6); i++) {
              let idsArr2 = idsArr.slice(i * 6, i * 6 + 6);
              queryLayer.well.query_param.clear_search_parameter();
              queryLayer.well.query_param.set_pkeyword_value(idsArr2);
              queryLayer.well.query_param.execute_search(0, searchCallback, 0);
            }
          }

          function searchCallback(options) {
            let result = options.result;
            if (result) {
              if (!Array.isArray(result)) {
                result = [result];
              }
              for (let item of result) {
                queryLayer.well._highlight_objs.push(item["SE_ID"]);
              }
            }
          }
        }
      } else {
        queryLayer.well._highlight_objs = [];
      }
    },
  },
  beforeRouteLeave(to, from, next) {
    next();
    this.clearBuffer();
    if (this.showResult && this.$hightLightArr.length > 0) {
      this.showHightlight(false);
    }

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.lastLayer) {
      this.lastLayer.container._highlight_objs = [];
      this.lastLayer.well._highlight_objs = [];
      this.lastLayer.joint._highlight_objs = [];
      this.lastLayer.equipment._highlight_objs = [];
      this.lastLayer = null;
    }

    this.$parent.$refs.functionPanel.curSelMenu.name = "";
  },
};
</script>

<style lang="less" scoped>
.el-checkbox {
  width: 80%;
  color: #ffffff;
  margin-left: 5px;
  display: block;
  text-align: left;
}

.analysisattachment {
  width: 300px;
}

.el-row {
  margin-bottom: 5px;

  &:last-child {
    margin-bottom: 0px;
  }
}

.analysisattachment-container {
  height: 550px;

  .analysisattachment-container-text {
    height: 30px;
    line-height: 30px;
    font-size: 14px;
    text-align: left;
    padding-left: 5px;
  }

  .analysisattachment-container-result {
    height: 30px;
    line-height: 30px;
    font-weight: 700;
    text-align: left;
    padding-left: 10px;
  }

  .analysisattachment-container-table {
    margin-bottom: 0px;
  }

  .analysisattachment-container-pagination {
    margin-bottom: 0px;
  }

  .analysisattachment-container-checkboxs {
    height: 80px;
    margin: 0 5px;
    border: solid rgba(255, 174, 3, 0.5) 1px;
  }
}

.text {
  padding-right: 5px;
  text-align: right;
}
</style>
