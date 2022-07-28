<template>
  <div>
    <popover
      :visible.sync="dialogVisible"
      :title="titleName"
      :before-close="handleClose"
      custom-class="searchResult"
    >
      <el-table
        v-loading="tableLoading"
        :data="data"
        @row-dblclick="dbClickRow"
      >
        <el-table-column label="序号" type="index" width="60" />
        <el-table-column
          :prop="fieldName"
          :label="fieldLabel"
          show-overflow-tooltip
        />
        <el-table-column
          v-if="pipeId && searchType == 'pipe'"
          :prop="pipeId"
          label="编号"
          show-overflow-tooltip
        />
        <el-table-column
          v-if="searchType == 'pipe'"
          prop="layername"
          label="图层"
          show-overflow-tooltip
        />
      </el-table>
      <el-footer>
        <el-pagination
          :current-page="pageIndex"
          :page-size="pageSize"
          :pager-count="5"
          :total="totalCount"
          layout="total, prev, pager, next"
          @current-change="handleCurrentChange"
        />
      </el-footer>
    </popover>
  </div>
</template>

<script>
import popover from "@/components/Popover";
import {
  postDataQuery,
  postSearch,
  getFiledCfgXml,
  getNameNoIgnoreCase,
  getNameNoIgnoreCaseByCaptionName,
  postGeoServer,
} from "@/api/query";
import markObj from "@/stamplib/Mark";
import { createGuid } from "@/utils";
import location from "@/stamplib/Location";
import pageHelper from "@/utils/pageHelper";
export default {
  name: "SearchResult",
  components: {
    popover,
  },
  data() {
    this.$lastElementObj = null;
    this.$pageHelper = null;
    this.$filedCfgJson = null;
    this.$lastHighlight_layer = [];
    this.$timeoutVal = null;
    return {
      titleName: "查询结果",
      dialogVisible: true,
      data: [],
      searchType: "",
      searchItem: "",
      searchText: "",
      fieldName: "",
      key: "",
      pipeId: "",
      fieldLabel: "",
      pageSize: 10,
      pageIndex: 1,
      totalCount: 0,
      tableLoading: false,
      isFirst: false,
    };
  },
  mounted: function () {
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
  computed: {
    curProject() {
      return this.g_Project.project;
    },
    pipelineLayerList() {
      return this.g_Project.pipeListData;
    },
  },
  beforeDestroy() {
    this.clearHighLightObj();
  },
  methods: {
    show(params) {
      var self = this;
      this.searchType = params.searchType;
      this.searchItem = params.searchItem;
      this.searchText = params.searchText;
      this.key = params.key;

      self.pageIndex = 1;
      self.totalCount = 0;
      self.data = [];
      self.$pageHelper = null;
      self.isFirst = true;
      this.query(self.pageIndex);
    },
    query(pageIndex) {
      var self = this;
      self.tableLoading = true;

      if (self.searchType == "quickquery") {
        // 快速查询
        self.fieldName = "name";
        self.fieldLabel = "名称";
        postDataQuery({
          service: this.searchItem,
          qt: 17,
          pg: pageIndex - 1 + "," + self.pageSize,
          project: self.curProject.guid,
          pc: self.searchText
            ? "(and,like," + self.fieldName + "," + self.searchText + ")"
            : "",
          ResType: 1,
        })
          .then((res) => {
            if (
              res &&
              res.data &&
              res.data.Json &&
              res.data.Json.Result &&
              res.data.Json.Result.Record
            ) {
              if (!Array.isArray(res.data.Json.Result.Record)) {
                self.data = [res.data.Json.Result.Record];
              } else {
                self.data = res.data.Json.Result.Record;
              }
            }
            if (pageIndex == 1) {
              self.totalCount = Number(res.data.Json.Result["@num"]);
            }
            self.tableLoading = false;
          })
          .catch((_err) => {
            self.$message({
              message: "查询服务异常",
              type: "error",
            });
            self.tableLoading = false;
          });
      } else if (self.searchType == "pipe") {
        // 管线管点管面查询
        if (!self.$pageHelper) {
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
            var linetype = 0;
            var dt = "";
            if (self.searchItem == "line") {
              linetype = 1;
              dt = "line";
            } else if (self.searchItem == "point") {
              linetype = 0;
              dt = "point";
            } else {
              linetype = 2;
              dt = "polygon";
            }
            self.fieldLabel = getNameNoIgnoreCase(
              self.$filedCfgJson,
              self.key,
              linetype,
              false
            );
            self.fieldName = getNameNoIgnoreCase(
              self.$filedCfgJson,
              self.key,
              linetype,
              true
            );
            self.pipeId = getNameNoIgnoreCase(
              self.$filedCfgJson,
              "US_KEY",
              linetype,
              true
            );
            var queryLayers = [];
            for (var i = 0; i < self.pipelineLayerList.length; i++) {
              let layer = self.stampAPI.usearth.LayerManager.GetLayerByGUID(
                self.pipelineLayerList[i].guid
              );
              let gisServer = layer._gis_server_connection;
              queryLayers.push({
                guid: self.pipelineLayerList[i].guid,
                name: self.pipelineLayerList[i].name,
                pc: self.searchText
                  ? "(and,like," + self.fieldName + "," + self.searchText + ")"
                  : "",
                dt: dt,
                gisServer: gisServer,
              });
            }

            self.$pageHelper = new pageHelper({
              queryLayers: queryLayers,
              pageSize: self.pageSize,
              qt: 16,
            });
            self.$pageHelper.init(function (resultList) {
              self.tableLoading = false;
              self.data = resultList;
              self.totalCount = self.$pageHelper.totalCount;
            });
          });
        } else {
          self.$pageHelper.showPage(pageIndex, function (resultList) {
            self.tableLoading = false;
            self.data = resultList;
          });
        }
      } else if (self.searchType == "model") {
        var queryLayer = this.stampAPI.usearth.LayerManager.GetLayerByGUID(
          this.searchItem
        );
        if (queryLayer && queryLayer.query_param) {
          queryLayer.query_param.clear_search_parameter();
          queryLayer.query_param._record_count_by_page = this.pageSize;
          queryLayer.query_param.set_keyword_value(this.searchText);
          queryLayer._search_callback = function (options) {
            self.tableLoading = false;

            self.fieldName = "SE_NAME";
            self.fieldLabel = "名字";
            if (options.result) {
              if (self.isFirst) {
                self.totalCount = options.layer.query_param._record_count;
              }
              var record = options.result;
              Array.isArray(record) || (record = [record]);

              self.data = record;
            }
          };
          queryLayer.query_param.execute_search(
            pageIndex - 1,
            queryLayer._search_callback,
            0
          );
        }
      } else if (self.searchType == "GISServer") {
        var queryLayer = this.stampAPI.usearth.LayerManager.GetLayerByGUID(
          this.searchItem
        );
        var postDataParam = `service=${this.searchItem}&qt=17&&pc=(and,like,${this.key},${this.searchText})&pg=${pageIndex},${this.pageSize}`;
        postGeoServer(postDataParam, queryLayer._gis_server_connection)
          .then(function (res) {
            self.fieldName = self.key;
            self.fieldLabel = "";
            var json = self.$x2js.xml2js(res.data).Xml;
            var record = json.Result.Record;
            Array.isArray(record) || (record = [record]);

            self.data = record;
          })
          .finally(() => {
            self.tableLoading = false;
          });
      } else {
        self.tableLoading = false;
      }
    },
    handleCurrentChange(pageNum) {
      this.pageIndex = pageNum;
      this.isFirst = false;
      this.query(pageNum);
    },
    dbClickRow(row) {
      if (this.searchType == "quickquery" || this.searchType == "GISServer") {
        var shape = row.SHAPE;
        var coordinatesType = "";
        var pointType = "";
        if (shape.hasOwnProperty("Polygon")) {
          coordinatesType = row.SHAPE.Polygon;
          pointType = "Polygon";
        } else if (shape.hasOwnProperty("Polyline")) {
          coordinatesType = row.SHAPE.Polyline;
          pointType = "Polyline";
        } else if (shape.hasOwnProperty("Point")) {
          coordinatesType = row.SHAPE.Point;
          pointType = "Point";
        }
        var coordinates = coordinatesType.Coordinates;
        if (!Array.isArray(coordinates)) {
          coordinates = [coordinates];
        }
        this.flyToBuffer(pointType, coordinates);
      } else if (this.searchType == "pipe") {
        this.flyToPipeline(row);
      } else if (this.searchType == "model") {
        this.flyToModel(row);
      }
    },
    getPipePointDeep(layerid, keyValue) {
      var self = this;
      let layer = this.stampAPI.usearth.LayerManager.GetLayerByGUID(layerid);
      let gisServer = layer._gis_server_connection;
      return new Promise((resolve, reject) => {
        var US_SPT_KEY = getNameNoIgnoreCase(
          self.$filedCfgJson,
          "US_SPT_KEY",
          1,
          true
        );
        var US_EPT_KEY = getNameNoIgnoreCase(
          self.$filedCfgJson,
          "US_EPT_KEY",
          1,
          true
        );
        var deep = 0;
        // var postDataParam = `service=${layerid}&qt=17&dt=line&pc=(and,equal,${US_SPT_KEY},${keyValue})&pg=0,10&ResType=1`;
        var postDataParam = {
          service: layerid,
          qt: 17,
          dt: "line",
          pc: `(and,equal,${US_SPT_KEY},${keyValue})`,
          pg: "0,10",
          ResType: 1,
        };
        postDataQuery(postDataParam, gisServer).then(function (res) {
          if (
            res &&
            res.data &&
            res.data.Json &&
            res.data.Json.Result &&
            res.data.Json.Result.Record
          ) {
            //找到了
            var record = res.data.Json.Result.Record;
            if (Array.isArray(record)) {
              record = record[0];
            }
            var pointHeight =
              record[
                getNameNoIgnoreCase(self.$filedCfgJson, "US_SIZE", 1, true)
              ];
            deep =
              record[
                getNameNoIgnoreCase(self.$filedCfgJson, "US_SDEEP", 1, true)
              ];
            resolve({ deep, pointHeight });
          } else {
            // var postDataParam = `service=${layerid}&qt=17&dt=line&pc=(and,equal,${US_EPT_KEY},${keyValue})&pg=0,10&ResType=1`;
            var postDataParam = {
              service: layerid,
              qt: 17,
              dt: "line",
              pc: `(and,equal,${US_EPT_KEY},${keyValue})`,
              pg: "0,10",
              ResType: 1,
            };
            postDataQuery(postDataParam, gisServer).then(function (res) {
              if (
                res &&
                res.data &&
                res.data.Json &&
                res.data.Json.Result &&
                res.data.Json.Result.Record
              ) {
                //找到了
                var record = res.data.Json.Result.Record;
                if (Array.isArray(record)) {
                  record = record[0];
                }
                var pointHeight =
                  record[
                    getNameNoIgnoreCase(self.$filedCfgJson, "US_SIZE", 1, true)
                  ];
                deep =
                  record[
                    getNameNoIgnoreCase(self.$filedCfgJson, "US_EDEEP", 1, true)
                  ];
                resolve({ deep, pointHeight });
              } else {
                resolve(null);
              }
            });
          }
        });
      });
    },
    flyToPipeline(row) {
      var self = this;
      const layerid = row["layerid"];
      var searchLayer =
        self.stampAPI.usearth.LayerManager.GetLayerByGUID(layerid);
      var gisServer = searchLayer._gis_server_connection;
      const searchParamArr = [];
      if (self.searchItem == "line") {
        // 管线
        if (searchLayer.container && self.pipeId) {
          searchParamArr.push(
            `rd=&t=container&c=${layerid}&pk=${
              row[self.pipeId]
            }&rt=1&mesh=0&detail=0&p=0&pl=100`
          );
        }
        if (searchLayer.container_og && self.pipeId) {
          searchParamArr.push(
            `rd=&t=container_og&c=${layerid}&pk=${
              row[self.pipeId]
            }&rt=1&mesh=0&detail=0&p=0&pl=100`
          );
        }
      } else {
        if (searchLayer.equipment && self.pipeId) {
          searchParamArr.push(
            `rd=&t=equipment&c=${layerid}&pk=${
              row[self.pipeId]
            }&rt=1&mesh=0&detail=0&p=0&pl=100`
          );
        }
        if (searchLayer.joint && self.pipeId) {
          searchParamArr.push(
            `rd=&t=joint&c=${layerid}&pk=${
              row[self.pipeId]
            }&rt=1&mesh=0&detail=0&p=0&pl=100`
          );
        }
        if (searchLayer.joint_og && self.pipeId) {
          searchParamArr.push(
            `rd=&t=joint_og&c=${layerid}&pk=${
              row[self.pipeId]
            }&rt=1&mesh=0&detail=0&p=0&pl=100`
          );
        }
        if (searchLayer.plate && self.pipeId) {
          searchParamArr.push(
            `rd=&t=plate&c=${layerid}&pk=${
              row[self.pipeId]
            }&rt=1&mesh=0&detail=0&p=0&pl=100`
          );
        }
        if (searchLayer.well && self.pipeId) {
          searchParamArr.push(
            `rd=&t=well&c=${layerid}&pk=${
              row[self.pipeId]
            }&rt=1&mesh=0&detail=0&p=0&pl=100`
          );
        }
      }

      self.clearHighLightObj();
      Promise.all(searchParamArr.map(postSearch)).then((res) => {
        debugger;
        var posLonLat = {};
        var posArr = null;
        for (let i = 0; i < res.length; i++) {
          var json = self.$x2js.xml2js(res[i].data);
          if (
            json &&
            json.Xml &&
            json.Xml.SearchResult &&
            json.Xml.SearchResult.ModelResult &&
            json.Xml.SearchResult.ModelResult.ModelData
          ) {
            var data = json.Xml.SearchResult.ModelResult.ModelData;
            Array.isArray(data) || (data = [data]);

            const tempStr = res[i].config.data.substr(6);
            const tempIndex = tempStr.indexOf("&");
            const subLayerName = tempStr.substr(0, tempIndex);

            const tempHighlight = searchLayer[subLayerName];
            tempHighlight._highlight_objs = [];
            self.$lastHighlight_layer.push(tempHighlight);
            for (let k = 0; k < data.length; k++) {
              tempHighlight._highlight_objs.push(data[k]["SE_ID"]);
            }

            self.$timeoutVal = setTimeout(function () {
              self.stopHighlightObj();
            }, STAMP_config.highLightTime);

            var posArr = data[0]["LonLatBox"].split(",");
          }
        }
        if (posArr) {
          var lon = (Number(posArr[2]) + Number(posArr[3])) / 2;
          var lat = (Number(posArr[0]) + Number(posArr[1])) / 2;
          var alt = Number(posArr[4]);
          var width = Math.abs(Number(posArr[2]) - Number(posArr[3])) / 2;
          var range =
            ((width / 180) * Math.PI * 6378137) /
            Math.tan((22.5 / 180) * Math.PI);
          var width = Math.abs(Number(posArr[2]) - Number(posArr[3])) / 2;
          var heigth = Math.abs(Number(posArr[0]) - Number(posArr[1])) / 2;
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
        } else {
          if (self.searchItem == "point") {
            // 管点
            self.getPipePointDeep(layerid, row[self.fieldName]).then((res) => {
              if (res) {
                var pointHeight = res.pointHeight;
                var deep = res.deep;
                if (pointHeight.indexOf("X") == -1) {
                  //圆管半径
                  pointHeight = parseFloat(pointHeight) / 1000 / 2;
                } else {
                  // 方管半径
                  pointHeight =
                    parseFloat(pointHeight.split("X")[1]) / 1000 / 2;
                }
                var intLayerCode = searchLayer.PipeLineType;
                var msValue = 0;
                if (intLayerCode >= 4000 && intLayerCode < 5000) {
                  // 排水
                  msValue = Number(deep) - Number(pointHeight);
                } else {
                  // 非排水
                  msValue = Number(deep) + Number(pointHeight);
                }
                var postDataParam = `service=${layerid}&qt=1&dt=point&pc=(and,equal,${
                  self.fieldName
                },${row[self.fieldName]})&pg=0,10&ResType=1`;
                var postDataParam = {
                  service: layerid,
                  qt: 1,
                  dt: "point",
                  pc: `(and,equal,${self.fieldName},${row[self.fieldName]})`,
                  pg: "0",
                };

                postDataQuery(postDataParam, gisServer).then(function (res) {
                  if (
                    res &&
                    res.data &&
                    res.data.Json &&
                    res.data.Json.Result &&
                    res.data.Json.Result.Record
                  ) {
                    var record = res.data.Json.Result.Record;
                    if (Array.isArray(record)) {
                      record = record[0];
                    }
                    if (
                      record.SHAPE &&
                      record.SHAPE.Point &&
                      record.SHAPE.Point.Coordinates
                    ) {
                      var coordinates = record.SHAPE.Point.Coordinates;
                      if (Array.isArray(coordinates)) {
                        coordinates = coordinates[0];
                      }
                      var lon = coordinates.split(",")[0];
                      var lat = coordinates.split(",")[1];
                      var points = [
                        new StampGis.Cartographic(
                          StampGis.StampMath.toRadians(lon),
                          StampGis.StampMath.toRadians(lat),
                          0
                        ),
                      ];
                      var promise =
                        self.stampAPI.usearth.document.get_batch_dem_height_from_server(
                          points
                        );
                      if (promise == undefined) {
                        return;
                      }
                      StampGis.when(promise, function () {}).then(function () {
                        var locationDegree = new StampGis.Cartographic(
                          parseFloat(lon),
                          parseFloat(lat),
                          Number(points[0].height) - msValue - 0.3
                        );
                        self.$lastElementObj = markObj.createElementSphere(
                          self.stampAPI.usearth,
                          {
                            guid: createGuid(),
                            name: "Point",
                            locationDegree: locationDegree,
                            radius: 0.3,
                            color: "#CCCCCC",
                            transparent: 208,
                            visibility: true,
                          }
                        );
                        self.$lastElementObj.set_is_underground(true);
                        self.$lastElementObj.show_high_light();
                        self.stampAPI.usearth.application.observer.flyTo({
                          destination: StampGis.Cartesian3.fromDegrees(
                            lon,
                            lat,
                            points[0].height - msValue + 50
                          ),
                          orientation: {
                            heading: StampGis.StampMath.toRadians(0),
                            pitch: StampGis.StampMath.toRadians(-90),
                            roll: 0.0,
                          },
                        });
                        self.$timeoutVal = setTimeout(function () {
                          self.stopHighlightObj();
                        }, STAMP_config.highLightTime);
                      });
                    }
                  }
                });
              }
            });
          } else {
            self.$message({
              message: "未搜索到模型数据",
              type: "warning",
            });
          }
        }
      });
    },
    flyToModel(row) {
      this.clearHighLightObj();

      var queryLayer = this.stampAPI.usearth.LayerManager.GetLayerByGUID(
        this.searchItem
      );

      queryLayer._highlight_objs = [];
      queryLayer._highlight_objs.push(row["SE_ID"]);
      this.$lastHighlight_layer.push(queryLayer);

      let self = this;
      this.$timeoutVal = setTimeout(function () {
        self.stopHighlightObj();
      }, STAMP_config.highLightTime);
      var lonLatBox = row.LonLatBox;
      var arr = lonLatBox.split(",");
      var north = Number(arr[0]);
      var south = Number(arr[1]);
      var east = Number(arr[2]);
      var west = Number(arr[3]);
      var topHeight = Number(arr[4]);
      var bottomHeight = Number(arr[5]);

      var lon = (east + west) / 2;
      var lat = (south + north) / 2;
      var alt = (topHeight + bottomHeight) / 2;
      var width = (parseFloat(north) - parseFloat(south)) / 2;
      var range =
        ((width / 180) * Math.PI * 6378137) / Math.tan((22.5 / 180) * Math.PI);
      var pos = StampGis.Cartesian3.fromDegrees(lon, lat, alt + range + 100);
      this.stampAPI.usearth.application.observer.flyTo({
        destination: pos,
        orientation: {
          heading: StampGis.StampMath.toRadians(0),
          pitch: StampGis.StampMath.toRadians(-90),
          roll: 0.0,
        },
      });
    },
    stopHighlightObj() {
      var self = this;
      if (this.$lastElementObj) {
        this.$lastElementObj.stop_high_light();
      }
      for (let m = 0; m < self.$lastHighlight_layer.length; m++) {
        self.$lastHighlight_layer[m]._highlight_objs = [];
      }
      self.$lastHighlight_layer = [];
    },
    clearHighLightObj() {
      var self = this;
      if (this.$lastElementObj) {
        if (this.$lastElementObj.parentLayer) {
          this.$lastElementObj.parentLayer.detach_object(this.$lastElementObj);
        } else {
          this.stampAPI.usearth.document.elementRoot.detach_object(
            this.$lastElementObj
          );
        }
        this.$lastElementObj = null;
      }
      for (let m = 0; m < self.$lastHighlight_layer.length; m++) {
        self.$lastHighlight_layer[m]._highlight_objs = [];
      }
      self.$lastHighlight_layer = [];
      if (self.$timeoutVal) {
        clearTimeout(self.$timeoutVal);
        self.$timeoutVal = null;
      }
    },
    flyToBuffer(pointType, coordinates) {
      var self = this;
      self.clearHighLightObj();
      var lonlatBox = {
        East: 0,
        West: 0,
        South: 0,
        North: 0,
      };
      for (let i = 0; i < coordinates.length; i++) {
        var coordinateArr = coordinates[i].split(",");
        var points = [];
        for (var j = 0; j < coordinateArr.length; j += 3) {
          points.push(
            StampGis.Cartesian3.fromDegrees(
              coordinateArr[j],
              coordinateArr[j + 1],
              coordinateArr[j + 2]
            )
          );
          lonlatBox.East = lonlatBox.East
            ? Math.max(
                StampGis.StampMath.toRadians(parseFloat(coordinateArr[j])),
                lonlatBox.East
              )
            : StampGis.StampMath.toRadians(parseFloat(coordinateArr[j]));
          lonlatBox.West = lonlatBox.West
            ? Math.min(
                StampGis.StampMath.toRadians(parseFloat(coordinateArr[j])),
                lonlatBox.West
              )
            : StampGis.StampMath.toRadians(parseFloat(coordinateArr[j]));
          lonlatBox.North = lonlatBox.North
            ? Math.max(
                StampGis.StampMath.toRadians(parseFloat(coordinateArr[j + 1])),
                lonlatBox.North
              )
            : StampGis.StampMath.toRadians(parseFloat(coordinateArr[j + 1]));
          lonlatBox.South = lonlatBox.South
            ? Math.min(
                StampGis.StampMath.toRadians(parseFloat(coordinateArr[j + 1])),
                lonlatBox.South
              )
            : StampGis.StampMath.toRadians(parseFloat(coordinateArr[j + 1]));
        }
        if (pointType == "Point") {
          // 认为是点，绘制一个半径为3米的圆形
          self.$lastElementObj = markObj.createElementCircle(
            self.stampAPI.usearth,
            {
              guid: createGuid(),
              name: "Point",
              points: points,
              radius: 3,
              lineColor: "#FF0000",
              fillColor: "#00FF00",
              visibility: true,
            }
          );
          self.$lastElementObj.show_high_light();
          location.flyToRadians(
            self.stampAPI.usearth,
            lonlatBox.East,
            lonlatBox.North,
            parseFloat(coordinateArr[2]) + 200,
            0,
            -90,
            0
          ); // 根据中心点定位
        } else if (pointType == "Polyline") {
          self.$lastElementObj = markObj.createElementLinebuffer(
            self.stampAPI.usearth,
            {
              guid: createGuid(),
              name: "Polygon",
              points: points,
              way: 1,
              radius: 3,
              lineColor: "#FF0000",
              fillColor: "#00FF00",
              visibility: true,
            }
          );
          self.$lastElementObj.show_high_light();
          location.flyToLonLat(self.stampAPI.usearth, lonlatBox); // 根据多边形范围定位
        } else if (pointType == "Polygon") {
          self.$lastElementObj = markObj.createElementPolygon(
            self.stampAPI.usearth,
            {
              guid: createGuid(),
              name: "Polygon",
              points: points,
              lineColor: "#FF0000",
              fillColor: "#00FF00",
              visibility: true,
            }
          );
          self.$lastElementObj.show_high_light();
          location.flyToLonLat(self.stampAPI.usearth, lonlatBox); // 根据多边形范围定位
        }
      }
    },
    handleClose() {
      this.clearHighLightObj();
      this.$parent.closeSearchResult();
    },
  },
};
</script>

<style lang="less" scoped>
.searchResult {
  width: 100%;
  max-width: 380px;
  height: 68vh;
  position: fixed;
  top: 17vh;
  left: 10px;
  z-index: 100;
}
</style>
