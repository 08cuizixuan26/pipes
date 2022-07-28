<template>
  <Popover
    :visible.sync="dialogVisible"
    :show-header="true"
    title="爆管分析"
    custom-class="analysisburst"
    :beforeClose="handleClose"
  >
    <div class="analysisburst-container">
      <el-row>
        <el-col :span="4" class="analysisburst-container-text">
          <div class="text">管段:</div>
        </el-col>
        <el-col :span="19">
          <el-input v-input-focus v-model="tubulation" class="input" disabled />
        </el-col>
      </el-row>
      <el-row>
        <el-button type="primary" size="mini" @click.prevent="pickTubulation"
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
        <el-col :span="12" class="analysisburst-container-result">
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
      <el-row class="analysisburst-container-table">
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
                :show-overflow-tooltip="true"
                prop="id"
                label="编号"
              />
              <el-table-column prop="type" label="类型" />
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
import { convertExcelData, createGuid } from "@/utils";
import axios from "axios";
import Popover from "@/components/Popover";
let particleObj;
export default {
  name: "BurstAnalysis",
  data() {
    return {
      dialogVisible: true,
      disabled: true,
      disabledAnalysis: true,
      tubulation: "",
      tableData: [],
      $respData: null,
      $layerGuid: null,
      downloadLoading: false,
      detailCheckbox: false,
      detailInfoShow: false,
      detailInfo: [],
      $layer: null,
      $pickChange: null,
      $hightLightArr: null, // 高亮对象guid
      showResult: false, // 是否显示结果
      $selObjKey: "",
      $filedCfgJson: "", // 管线字段映射文件
      analyis: true,
      timeoutId: null,
    };
  },
  components: {
    Popover,
  },
  computed: {
    tableHeight() {
      return (410 / 1920) * window.innerWidth;
    },
  },
  watch: {
    showResult(newV) {
      if (newV) {
        const self = this;
        if (!this.$hightLightArr.length) {
          let idsArr = this.tableData.map((v) => v.id);
          //
          if (idsArr.length < 6) {
            this.$layer.well.query_param.clear_search_parameter();
            this.$layer.well.query_param.set_pkeyword_value(idsArr);
            self.$layer.well.query_param.execute_search(0, searchCallback, 0);
          } else {
            for (let i = 0; i < Math.ceil(idsArr.length / 6); i++) {
              let idsArr2 = idsArr.slice(i * 6, i * 6 + 6);
              this.$layer.well.query_param.clear_search_parameter();
              this.$layer.well.query_param.set_pkeyword_value(idsArr2);
              self.$layer.well.query_param.execute_search(0, searchCallback, 0);
            }
          }
          // eslint-disable-next-line no-inner-declarations
          function searchCallback(options) {
            let result = options.result;
            if (result) {
              if (!Array.isArray(result)) {
                result = [result];
              }
              for (const item of result) {
                self.$hightLightArr.push(item["SE_ID"]);
              }
              Array.prototype.push.apply(
                self.$layer.well._highlight_objs,
                self.$hightLightArr
              );
            }
          }
        } else {
          Array.prototype.push.apply(
            this.$layer.well._highlight_objs,
            this.$hightLightArr
          );
        }
      } else {
        this.$layer.well._highlight_objs = [];
      }
    },
  },
  mounted() {
    const self = this;
    const urlSearch = self.g_Project.FieldMap;
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
  beforeRouteLeave(to, from, next) {
    next();
    if (this.$layer) this.$layer.container._highlight_objs = [];
    this.clear();
    this.$parent.$refs.functionPanel.curSelMenu.name = "";
  },
  methods: {
    getRowClass() {
      return "background:#3f5c6d2c;color:#ffffff;";
    },
    pickTubulation() {
      const application = this.stampAPI.usearth.application;
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
          if (Array.isArray(res) && res.length > 0 && res[0].layer) {
            if (self.$pickChange) {
              self.$pickChange();
              self.$pickChange = null;
            }
            application.pickingEnable = false;
            // 判断管线类型是否支持爆管分析
            const earth = self.stampAPI.usearth;
            const layerId = res[0].layer._id;
            self.$layerGuid = layerId.split("_")[0];
            self.$layer = earth.LayerManager.GetLayerByGUID(self.$layerGuid);
            if (
              (self.$layer.pipeline_type >= 1000 &&
                self.$layer.pipeline_type < 3000) ||
              (self.$layer.pipeline_type >= 8100 &&
                self.$layer.pipeline_type < 8200) ||
              self.$layer.pipeline_type == 4000
            ) {
              self.$message({
                message: "此类管线不支持爆管分析功能.",
                type: "warning",
                center: true,
              });
              self.analyis = true;
              self.$layer.container._highlight_objs = [];
              return;
            }
            self.disabledAnalysis = false;
            if (res[0].properties && res[0].properties.properties) {
              self.analyis = false;
              self.$respData = res[0];
              self.tubulation = res[0].properties.properties.Key; // SE_ID;
              self.$selObjKey = res[0].properties.properties.Key;
              setTimeout(
                () => (self.$layer.container._highlight_objs.length = 0),
                STAMP_config.highLightTime
              );
            }
          }
        }
      );
    },
    allAnalysis() {
      this.tableData = [];
      this.$hightLightArr = [];
      this.clear();
      const params = {
        rt: "burst",
        service: this.$layerGuid,
        aparam: `0,${this.$selObjKey}`,
      };
      this.createBurstrObject();
      var self = this;
      networkGet(params)
        .then((res) => {
          const jsonData = self.$x2js.xml2js(res.data);
          const resData = jsonData.Xml.BurstResult;
          let lineData = resData.LineResult.Record;
          Array.isArray(lineData) || (lineData = [lineData]);
          let pointData = resData.PointResult.Record;
          Array.isArray(pointData) || (pointData = [pointData]);
          self.toTableData([], pointData);
          self.disabled = false;
        })
        .catch((e) => {});
    },

    toTableData(lineData = [], pointData = []) {
      const lFiled = getNameNoIgnoreCase(
        this.$filedCfgJson,
        "US_KEY",
        "1",
        true
      );
      const pFiled = getNameNoIgnoreCase(
        this.$filedCfgJson,
        "US_KEY",
        "0",
        true
      );
      for (const lobj of lineData) {
        this.tableData.push(
          Object.freeze({
            id: lobj[lFiled] || lobj[lFiled.toLowerCase()],
            type: "管线",
          })
        );
      }
      for (const pobj of pointData) {
        this.tableData.push({
          id: pobj[pFiled] || pobj[pFiled.toLowerCase()],
          type: "阀门",
        });
      }
    },
    getDetailInfo(row, col, e) {
      let layer = this.stampAPI.usearth.LayerManager.GetLayerByGUID(
        this.$layerGuid
      );
      let gisServer = layer._gis_server_connection;
      const self = this;
      if (row.type == "管线") {
        const PIPEID = getNameNoIgnoreCase(
          this.$filedCfgJson,
          "US_KEY",
          "1",
          true
        );
        const searchParam = `rd=&t=container&c=${this.$layerGuid}&pk=${row.id}&rt=1&mesh=0&detail=0&p=0&pl=100`;
        // const postDataParam = `service=${this.$layerGuid}&qt=16&dt=line&pc=(and,equal,${PIPEID},${row.id})&pg=0,10&encoding=utf-8&`;
        let postDataParam = {
          service: this.$layerGuid,
          qt: 16,
          dt: "line",
          pc: `(and,equal,${PIPEID},${row.id})`,
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
              self.$layer.container._highlight_objs = [];
              const modelData = self.$x2js.xml2js(search.data).Xml.SearchResult
                .ModelResult.ModelData;
              let arr = [];
              if (modelData) {
                arr = modelData.LonLatBox.split(",");
                const north = Number(arr[0]);
                const south = Number(arr[1]);
                const east = Number(arr[2]);
                const west = Number(arr[3]);
                const topHeight = Number(arr[4]);
                const bottomHeight = Number(arr[5]);

                const lon = (east + west) / 2;
                const lat = (south + north) / 2;
                const alt = (topHeight + bottomHeight) / 2;
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
                const dataJson = self.$x2js.xml2js(dataQuery.data).Xml.Result
                  .Record;
                for (const item in dataJson) {
                  const tempKey = getNameNoIgnoreCase1(
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
              // self.detailInfo.freeObj = Object.freeze(dataJson);
            })
          )
          .catch((e) => {});
      } else {
        const PIPEID = getNameNoIgnoreCase(
          this.$filedCfgJson,
          "US_KEY",
          "0",
          true
        );
        const searchParam = `rd=&t=well&c=${this.$layerGuid}&pk=${row.id}&rt=1&mesh=0&detail=0&p=0&pl=100`;
        const searchParam1 = `rd=&t=joint&c=${this.$layerGuid}&pk=${row.id}&rt=1&mesh=0&detail=0&p=0&pl=100`;
        const searchParam2 = `rd=&t=equipment&c=${this.$layerGuid}&pk=${row.id}&rt=1&mesh=0&detail=0&p=0&pl=100`;
        // const postDataParam = `service=${this.$layerGuid}&qt=16&dt=point&pc=(and,equal,${PIPEID},${row.id})&pg=0,10&encoding=utf-8&`;
        let postDataParam = {
          service: this.$layerGuid,
          qt: 17,
          dt: "point",
          pc: `(and,equal,${PIPEID},${row.id})`,
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
              self.$layer.container._highlight_objs = [];
              self.$layer.well._highlight_objs = [];
              self.$layer.joint._highlight_objs = [];
              self.$layer.equipment._highlight_objs = [];
              const modelData = self.$x2js.xml2js(search.data).Xml.SearchResult
                .ModelResult.ModelData;
              const modelData1 = self.$x2js.xml2js(search1.data).Xml
                .SearchResult.ModelResult.ModelData;
              const modelData2 = self.$x2js.xml2js(search2.data).Xml
                .SearchResult.ModelResult.ModelData;
              let arr = [];
              if (modelData) {
                arr = modelData.LonLatBox.split(",");
              } else if (modelData1) {
                arr = modelData1.LonLatBox.split(",");
              } else if (modelData2) {
                arr = modelData2.LonLatBox.split(",");
              }

              if (arr && arr.length > 0) {
                debugger;
                const north = Number(arr[0]);
                const south = Number(arr[1]);
                const east = Number(arr[2]);
                const west = Number(arr[3]);
                const topHeight = Number(arr[4]);
                const bottomHeight = Number(arr[5]);

                const lon = (east + west) / 2;
                const lat = (south + north) / 2;
                const alt = topHeight;
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
                    heading: StampGis.StampMath.toRadians(90),
                    pitch: StampGis.StampMath.toRadians(-90),
                    roll: 0.0,
                  },
                });
              } else {
                const dataJson = self.$x2js.xml2js(dataQuery.data).Xml.Result
                  .Record;
                let coorArr = dataJson.SHAPE.Point.Coordinates.split(",");

                var cartographic1 = new StampGis.Cartographic(
                  StampGis.StampMath.toRadians(coorArr[0]),
                  StampGis.StampMath.toRadians(coorArr[1]),
                  0
                );

                var points = [cartographic1];

                var promise =
                  earth.document.get_batch_dem_height_from_server(points);

                if (promise == undefined) {
                  var pos = StampGis.Cartesian3.fromDegrees(
                    Number(coorArr[0]),
                    Number(coorArr[1]),
                    Number(coorArr[2]) + 10
                  );

                  self.stampAPI.usearth.application.observer.flyTo({
                    destination: pos,
                    orientation: {
                      heading: StampGis.StampMath.toRadians(90),
                      pitch: StampGis.StampMath.toRadians(-90),
                      roll: 0.0,
                    },
                  });
                  return;
                }
                StampGis.when(promise, function () {}).then(function () {
                  var pos = StampGis.Cartesian3.fromRadians(
                    points[0].longitude,
                    points[0].latitude,
                    points[0].heigth + 10
                  );

                  self.stampAPI.usearth.application.observer.flyTo({
                    destination: pos,
                    orientation: {
                      heading: StampGis.StampMath.toRadians(90),
                      pitch: StampGis.StampMath.toRadians(-90),
                      roll: 0.0,
                    },
                  });
                });
              }

              self.$layer.well.query_param.clear_search_parameter();
              self.$layer.well.query_param.set_keyword_value(row.id);
              self.$layer.joint.query_param.clear_search_parameter();
              self.$layer.joint.query_param.set_keyword_value(row.id);
              self.$layer.equipment.query_param.clear_search_parameter();
              self.$layer.equipment.query_param.set_keyword_value(row.id);

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
                  self.$layer.equipment._highlight_objs = [];
                }, STAMP_config.highLightTime);
              }
              self.$layer.well.query_param.execute_search(0, searchCallback, 0);
              self.$layer.joint.query_param.execute_search(
                0,
                searchCallback,
                0
              );
              self.$layer.equipment.query_param.execute_search(
                0,
                searchCallback,
                0
              );
              if (self.detailCheckbox) {
                self.detailInfo = [];
                const dataJson = self.$x2js.xml2js(dataQuery.data).Xml.Result
                  .Record;
                for (const item in dataJson) {
                  const tempKey = getNameNoIgnoreCase1(
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
              // self.detailInfo.freeObj = Object.freeze(dataJson);
            })
          )
          .catch((e) => {});
      }

      this.detailInfoShow = this.detailCheckbox;
    },
    createBurstrObject() {
      const earth = this.stampAPI.usearth;
      const properties = this.$respData.properties.properties;

      const self = this;

      debugger;
      self.clear();
      // console.log('开始查询管线位置')
      self.$layer.container.query_param.clear_search_parameter();
      self.$layer.container.query_param.set_keyword_value(properties.Key);

      function searchCallback(options) {
        if (options.result && options.result && options.result.LonLatBox) {
          const arr = options.result.LonLatBox.split(",");
          const north = Number(arr[0]);
          const south = Number(arr[1]);
          const east = Number(arr[2]);
          const west = Number(arr[3]);
          const topHeight = Number(arr[4]);
          const bottomHeight = Number(arr[5]);
          const longitude = (east + west) / 2;
          const latitude = (south + north) / 2;
          const altitude = (topHeight + bottomHeight) / 2;

          let type = "";
          if (self.$layer == null) {
            return;
          }
          if (
            self.$layer.pipeline_type >= 5000 &&
            self.$layer.pipeline_type < 6000
          ) {
            // fire 燃气类管线
            self.createSmoke(longitude, latitude, altitude);
          } else if (
            self.$layer.pipeline_type >= 3000 &&
            self.$layer.pipeline_type < 4000
          ) {
            // water 给水
            self.createFountain(longitude, latitude, altitude, 1);
          } else if (
            self.$layer.pipeline_type >= 6000 &&
            self.$layer.pipeline_type < 6100
          ) {
            //  //热力/蒸汽
            self.createSmoke(longitude, latitude, altitude);
          } else if (
            self.$layer.pipeline_type >= 6100 &&
            self.$layer.pipeline_type < 7000
          ) {
            // 热水
            self.createFountain(longitude, latitude, altitude, 1);
          } else if (
            self.$layer.pipeline_type >= 7000 &&
            self.$layer.pipeline_type < 7200
          ) {
            // 工业类
            self.createSmoke(longitude, latitude, altitude);
          } else if (self.$layer.pipeline_type >= 7200) {
            self.createFire(longitude, latitude, altitude);
          } else {
            return;
          }

          // var tempPoint = new StampGis.Cartographic(
          //   StampGis.StampMath.toRadians(longitude),
          //   StampGis.StampMath.toRadians(latitude),
          //   altitude
          // )
          // var tmpPoints = [tempPoint]
          // var promise = earth.document.get_batch_dem_height_from_server(
          //   tmpPoints
          // )
          // StampGis.when(promise, function() { }).then(function() {

          //   //console.log('查询管线位置完成，开始创建')
          // })
        }
      }
      self.$layer.container.query_param.execute_search(0, searchCallback, 0);
    },
    createParticle(longitude, latitude, altitude, type) {
      const earth = this.stampAPI.usearth;
      var start_color = {
        red: 1.0,
        green: 1.0,
        blue: 1.0,
        alpha: 1.0,
      };
      var end_color = {
        red: 1.0,
        green: 1.0,
        blue: 1.0,
        alpha: 0.0,
      };
      var obj = {
        guid: createGuid(),
        longitude,
        latitude,
        altitude,
        width: 20,
        imageSize: {
          x: 0.5,
          y: 0.5,
        },
        startColor: start_color,
        endColor: end_color,
        emissionRate: 5,
        emitter: earth.Factory.CreateCircleEmitter(1.0),
        image: stamp_core_config.baseUrlString + type,
        startScale: 1.3,
        endScale: 1.8,
        minimumSpeed: 1.0,
        maximumSpeed: 1.8,
        minimumParticleLife: 1.5,
        maximumParticleLife: 1.5,
        lifetime: 16,
        sizeInMeters: true,
        loop: true,
        parentLayer: earth.document.elementRoot,
      };
      particleObj = earth.Factory.CreateParticleSystem(obj);
      window.g_VideoLayer.attach_object(particleObj);
      // console.log('添加particle到球上')
    },
    createSmoke(longitude, latitude, altitude) {
      const earth = this.stampAPI.usearth;
      var start_color = {
        red: 1.0,
        green: 1.0,
        blue: 1.0,
        alpha: 1.0,
      };
      var end_color = {
        red: 1.0,
        green: 1.0,
        blue: 1.0,
        alpha: 0.0,
      };
      var obj = {
        guid: createGuid(),
        longitude,
        latitude,
        altitude,
        width: 10,
        imageSize: {
          x: 0.5,
          y: 0.5,
        },
        startColor: start_color,
        endColor: end_color,
        emissionRate: 5,
        emitter: earth.Factory.CreateCircleEmitter(0.2),
        image: stamp_core_config.baseUrlString + "Assets/Textures/smoke1.png",
        startScale: 1.3,
        endScale: 1.8,
        minimumSpeed: 1.0,
        maximumSpeed: 1.8,
        minimumParticleLife: 1.5,
        maximumParticleLife: 1.5,
        lifetime: 16,
        sizeInMeters: true,
        loop: true,
        parentLayer: earth.document.elementRoot,
      };
      particleObj = earth.Factory.CreateParticleSystem(obj);
      earth.document.elementRoot.attach_object(particleObj);
      // console.log('添加particle到球上')
    },
    createFire(longitude, latitude, altitude) {
      const earth = this.stampAPI.usearth;
      var start_color = {
        red: 1.0,
        green: 1.0,
        blue: 1.0,
        alpha: 1.0,
      };
      var end_color = {
        red: 1.0,
        green: 1.0,
        blue: 1.0,
        alpha: 0.0,
      };
      var obj = {
        guid: createGuid(),
        longitude,
        latitude,
        altitude,
        width: 20,
        imageSize: {
          x: 2,
          y: 2,
        },
        startColor: start_color,
        endColor: end_color,
        emissionRate: 5,
        emitter: earth.Factory.CreateCircleEmitter(1.0),
        image: stamp_core_config.baseUrlString + "Assets/Textures/fire1.png",
        startScale: 3.0,
        endScale: 1.5,
        minimumSpeed: 7.0,
        maximumSpeed: 9.0,
        minimumParticleLife: 1.5,
        maximumParticleLife: 1.8,
        lifetime: 10,
        sizeInMeters: true,
        loop: true,
        parentLayer: earth.document.elementRoot,
      };
      particleObj = earth.Factory.CreateParticleSystem(obj);
      earth.document.elementRoot.attach_object(particleObj);
      // console.log('添加particle到球上')
    },
    createFountain(longitude, latitude, altitude, type) {
      const earth = this.stampAPI.usearth;
      var gravityScratch = new StampGis.Cartesian3();
      var start_color = {
        red: 1.0,
        green: 1.0,
        blue: 1.0,
        alpha: 0.8,
      };
      var end_color = {
        red: 1.0,
        green: 1.0,
        blue: 1.0,
        alpha: 0.4,
      };
      var obj;
      if (type == 1) {
        obj = {
          guid: createGuid(),
          longitude,
          latitude,
          altitude,
          width: 10,
          imageSize: {
            x: 0.5,
            y: 0.5,
          },
          startColor: start_color,
          endColor: end_color,
          emissionRate: 80,
          emitter: earth.Factory.CreateCircleEmitter(0.2),
          image:
            stamp_core_config.baseUrlString + "Assets/Textures/fountain.png",
          startScale: 0.5,
          endScale: 1.5,
          minimumSpeed: 5.0,
          maximumSpeed: 5.5,
          minimumParticleLife: 2,
          maximumParticleLife: 3,
          lifetime: 3,
          sizeInMeters: true,
          loop: true,
          parentLayer: earth.document.elementRoot,
          updateCallback: (p, dt) => {
            StampGis.Cartesian3.normalize(p.position, gravityScratch);
            StampGis.Cartesian3.fromElements(
              0.32 * dt,
              -2.5 * dt,
              0.22 * dt,
              gravityScratch
            );
            p.velocity = StampGis.Cartesian3.add(
              p.velocity,
              gravityScratch,
              p.velocity
            );
          },
        };
      } else {
        obj = {
          guid: createGuid(),
          longitude,
          latitude,
          altitude,
          width: 10,
          imageSize: { x: 0.5, y: 0.5 },
          startColor: start_color,
          endColor: end_color,
          emissionRate: 40,
          emitter: earth.Factory.CreateCircleEmitter(0.2),
          image:
            stamp_core_config.baseUrlString + "Assets/Textures/fountain.png",
          startScale: 1,
          endScale: 7,
          minimumSpeed: 9,
          maximumSpeed: 9.5,
          minimumParticleLife: 6,
          maximumParticleLife: 7,
          lifetime: 16,
          sizeInMeters: true,
          loop: true,
          parentLayer: earth.document.elementRoot,
          updateCallback: (p, dt) => {
            StampGis.Cartesian3.normalize(p.position, gravityScratch);
            StampGis.Cartesian3.multiplyByScalar(
              gravityScratch,
              -3.5 * dt,
              gravityScratch
            );
            p.velocity = StampGis.Cartesian3.add(
              p.velocity,
              gravityScratch,
              p.velocity
            );
          },
        };
      }

      particleObj = earth.Factory.CreateParticleSystem(obj);
      earth.document.elementRoot.attach_object(particleObj);
      // console.log('添加particle到球上')
    },
    createNozzle(longitude, latitude, altitude) {
      const earth = this.stampAPI.usearth;
      var obj = {
        guid: createGuid(),
        longitude: longitude,
        latitude: latitude,
        altitude: altitude,
        width: 20,
      };
      particleObj = earth.Factory.CreateWaterCannonElement(obj);

      window.g_VideoLayer.attach_object(particleObj);
    },
    download() {
      this.downloadLoading = true;
      import("@/vendor/Export2Excel").then((excel) => {
        const tHeader = ["编号", "类型"];
        const filterVal = ["id", "type"];
        const data = convertExcelData(filterVal, this.tableData);
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: "爆管分析",
          autoWidth: true,
          bookType: "xlsx",
        });
        this.downloadLoading = false;
      });
    },
    clear() {
      if (particleObj) {
        this.stampAPI.usearth.document.elementRoot.detach_object(particleObj);
        particleObj = null;
      }
    },
    handleClose() {
      this.$router.push("/");
    },
  },
  beforeRouteLeave(to, from, next) {
    next();
    let self = this;
    self.clear();

    if (self.$layer) {
      self.$layer.container._highlight_objs = [];
      self.$layer.well._highlight_objs = [];
      self.$layer.joint._highlight_objs = [];
    }

    if (self.timeoutId) {
      clearTimeout(self.timeoutId);
      self.timeoutId = null;
    }

    if (self.$pickChange) {
      const application = self.stampAPI.usearth.application;
      if (
        application._selectedEntityChanged._listeners &&
        application._selectedEntityChanged._listeners.length > 0
      ) {
        application._selectedEntityChanged.removeEventListener(
          self.$pickChange
        );
      }
      application.pickingEnable = false;
      self.$pickChange = null;
    }
  },
};
</script>

<style lang="less" scoped>
.analysisburst {
  width: 300px;
}

.el-row {
  margin-bottom: 5px;

  &:last-child {
    margin-bottom: 0px;
  }
}

.analysisburst-container {
  height: 550px;
  font-size: 16px;

  .analysisburst-container-text {
    height: 30px;
    line-height: 30px;
    font-size: 16px;
  }

  .analysisburst-container-result {
    height: 30px;
    line-height: 30px;
    font-weight: 700;
    text-align: left;
    padding-left: 10px;
    // background: rgba(1, 76, 91, 1);
  }

  .analysisburst-container-table {
    margin-bottom: 10px;
  }
}

.text {
  text-align: right;
  padding-right: 5px;
}
</style>
