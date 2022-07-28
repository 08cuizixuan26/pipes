<template>
  <popoverStat
    :visible.sync="isResultShow"
    title="横断面分析结果"
    custom-class="svgpopover"
    style="width: 980px"
    :beforeClose="handleClose"
  >
    <el-row>
      <el-col :span="24">
        <i
          class="el-icon-printer"
          style="
            font-size: 20px;
            margin-left: 50px;
            color: black;
            cursor: pointer;
          "
          onclick="javascript:window.print();"
        ></i>
        地下管线横断面图
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <svg
          width="100%"
          height="500px"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g
            ref="gCanvas"
            id="gCanvas"
            style="position: relative; left: 0px; top: 0px"
          ></g>
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
</template>

<script>
import { pipelineGet } from "@/api/analysis";
import { DownloadFileWithoutIp } from "@/api/common";
import PipelineStandard from "@/utils/PipelineStandard";
import { getFiledCfgXml, getNameNoIgnoreCase } from "@/api/query";
import $ from "jquery";
import axios from "axios";
import popoverStat from "@/components/popoverStat";
var groundAltList = []; //地面高程数组
var pipeLineAltList = []; //管线高程数组
var dataGroundAltList = []; //如果是地形高程，需要数据高程去绘制线
var thisSearchLayer = null; //当前分析的图层
var isShowAllObjects = false;
var needResetHightlingObjects = [];
var minGroundAltitude = 0; //最小地形高程
var maxGroundAltitude = 0; //最大地形高程
var minLength = 0; //最小间距
var maxLength = 0; //最大间距
var minPipeLineAltitude = 0; //最小管线高程
var maxPipeLineAltitude = 0; //最大管线高程
var flag = true;
var pVectorsNew = {};
var pVectors = {};
var profileAlt = STAMP_config.profileAlt;
var gCanvas = null;
var sizeX = 1;
var sizeY = 1;
var size = 1;
var tmpLength = 0;
var yyy = 0;
var groundCoordList = [];
var groundAlt = null;
var ratioX = null;
var ratioY = null;
var minX = null;
var maxX = null;
var minY = null;
var maxY = null;
var palist = [];
var coordListArr = [];
var lengthListArray = [];
export default {
  name: "AnalysisTranSection",
  data() {
    this.pipeListData = [];
    this.project = null;
    this.$_Datum = null;
    this.$filedCfgJson = "";
    this.$pipelID = ""; //管线编号字段
    this.$pipepID = ""; //管点编号字段
    this.$_PipelineStandard = null;
    return {
      isResultShow: true,
    };
  },
  components: {
    popoverStat,
  },
  created() {
    this.$nextTick(function () {
      this.$_PipelineStandard = new PipelineStandard();
    });
  },
  mounted() {
    gCanvas = this.$refs.gCanvas;
    this.clear();
    var earth = this.stampAPI.usearth;
    this.pipeListData = this.g_Project.pipeListData;
    this.project = this.g_Project.project;
    let self = this;
    var spaialUrl = this.g_Project.SpatialReference;
    if (spaialUrl == "") {
      self.$message({
        message: "当前工程没有管线配置信息",
        type: "warning",
      });
      return;
    }
    DownloadFileWithoutIp(spaialUrl, "arraybuffer")
      .then((res) => {
        var array_data = res.data;
        var option = {
          array: array_data,
        };
        self.$_Datum = earth.Factory.CreateDatum(option);
      })
      .catch((err) => {});
    this.getData();
  },
  computed: {
    lineData() {
      return this.$route.query.info;
    },
  },
  methods: {
    clear() {
      groundAltList = [];
      pipeLineAltList = [];
      dataGroundAltList = [];
      thisSearchLayer = null;
      isShowAllObjects = false;
      needResetHightlingObjects = [];
      minGroundAltitude = 0;
      maxGroundAltitude = 0;
      minLength = 0; //最小间距
      maxLength = 0; //最大间距
      minPipeLineAltitude = 0; //最小管线高程
      maxPipeLineAltitude = 0; //最大管线高程
      flag = true;
      pVectorsNew = {};
      pVectors = {};
      profileAlt = STAMP_config.profileAlt;
      sizeX = 1;
      sizeY = 1;
      size = 1;
      tmpLength = 0;
      yyy = 0;
      groundCoordList = [];
      groundAlt = null;
      ratioX = null;
      ratioY = null;
      minX = null;
      maxX = null;
      minY = null;
      maxY = null;
      palist = [];
      coordListArr = [];
      lengthListArray = [];
    },
    getStrPoints() {
      var result = this.lineData;
      var strPoints = "";
      var jwd1 = StampGis.Cartographic.fromCartesian(result[0]);
      var jwd2 = StampGis.Cartographic.fromCartesian(result[1]);
      jwd1.longitude = StampGis.StampMath.toDegrees(jwd1.longitude);
      jwd1.latitude = StampGis.StampMath.toDegrees(jwd1.latitude);
      jwd2.longitude = StampGis.StampMath.toDegrees(jwd2.longitude);
      jwd2.latitude = StampGis.StampMath.toDegrees(jwd2.latitude);
      pVectors.Longitude = jwd1.longitude;
      pVectors.Latitude = jwd1.latitude;
      pVectors.Altitude = jwd1.height;
      if (jwd1.longitude < jwd2.longitude) {
        strPoints =
          strPoints +
          "," +
          jwd1.longitude +
          "," +
          jwd1.latitude +
          "," +
          jwd1.height +
          "," +
          jwd2.longitude +
          "," +
          jwd2.latitude +
          "," +
          jwd2.height;
        pVectorsNew.Longitude = jwd1.longitude - 0.00045;
        pVectorsNew.latitude = jwd1.latitude;
        pVectorsNew.Altitude = jwd1.height;
      } else {
        strPoints =
          strPoints +
          "," +
          jwd2.longitude +
          "," +
          jwd2.latitude +
          "," +
          jwd2.height +
          "," +
          jwd1.longitude +
          "," +
          jwd1.latitude +
          "," +
          jwd1.height;
        pVectorsNew.Longitude = jwd2.longitude - 0.00045;
        pVectorsNew.Latitude = jwd2.latitude;
        pVectorsNew.Altitude = jwd2.height;
      }
      return strPoints;
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
    async getData() {
      var self = this;
      var earth = this.stampAPI.usearth;
      var strPoints = this.getStrPoints();
      var urlList = [];

      this.pipeListData.forEach((item) => {
        let layer = self.stampAPI.usearth.LayerManager.GetLayerByGUID(
          item.guid
        );
        let gisServer = layer._gis_server_connection;

        urlList.push({
          rt: "transect",
          service: item.guid,
          aparam: `0${strPoints}`,
          gisServer: gisServer,
        });
      });
      if (this.pipeListData.length > 0) {
        let urlSearch = this.g_Project.FieldMap;
        getFiledCfgXml(urlSearch, self).then((res) => {
          self.$filedCfgJson = res;
          self.$pipelID =
            self.$pipelID ||
            getNameNoIgnoreCase(self.$filedCfgJson, "US_KEY", "1", true);
          self.$pipepID =
            self.$pipepID ||
            getNameNoIgnoreCase(self.$filedCfgJson, "US_KEY", "0", true);

          var material = getNameNoIgnoreCase(
            self.$filedCfgJson,
            "US_PMATER",
            "1",
            true
          );
          var ds = getNameNoIgnoreCase(
            self.$filedCfgJson,
            "US_SIZE",
            "1",
            true
          );
          axios.all(urlList.map(pipelineGet)).then(
            axios.spread(function () {
              let totalResult = [];
              for (var i = 0; i < arguments.length; i++) {
                let result = self.$x2js.xml2js(arguments[i].data).Xml;
                totalResult.push(result);
              }
              var allRecords = [];
              for (let i = 0; i < totalResult.length; i++) {
                var item = totalResult[i];
                if (
                  item == null ||
                  !item.TransectResult ||
                  item.TransectResult._num < 1
                ) {
                  continue;
                }
                var layer = earth.LayerManager.GetLayerByGUID(
                  self.pipeListData[i].guid
                );
                if (!Array.isArray(item.TransectResult.Record)) {
                  item.TransectResult.Record = [item.TransectResult.Record];
                }

                for (let n = 0; n < item.TransectResult._num; n++) {
                  item.TransectResult.Record[n].pipeline_type =
                    layer.pipeline_type;
                  allRecords.push(item.TransectResult.Record[n]);
                }
              }
              for (let j = 0; j < allRecords.length; j++) {
                (function (j) {
                  var Record = allRecords[j];
                  try {
                    var ID =
                      Record[self.$pipelID] ||
                      Record[self.$pipelID.toLowerCase()]; //ID
                    var mater =
                      Record[material] || Record[material.toLowerCase()]; //材质
                    // mater = getCaptionByCustomValue(type, "MaterialType", mater);
                  } catch (e) {
                    //var ID = Record[self.$pipepID]; //ID
                    //var mater = Record[material]; //材质
                    // mater = getCaptionByCustomValue(type, "MaterialType", mater);
                  }

                  var dataType = self.getValueByCode(
                    "PipeCode",
                    Record.pipeline_type
                  ); //数据类型 需要根据映射文件，暂时先固定

                  var color = "000000";
                  color = self.$_PipelineStandard.getStandardLineColor(
                    Record.pipeline_type
                  ); // 按材质来

                  var tmp = "000000".substring(color.length, 6);
                  color = "#" + color + tmp;
                  var specification = Record[ds] || Record[ds.toLowerCase()]; //规格

                  var intersectPoint = Record.IntersectPoint; // 横切点
                  var intersectPointArr = intersectPoint.split(",");
                  var intersectDeep = parseFloat(Record.IntersectDeep).toFixed(
                    2
                  ); // 横切深度
                  var intersectAltitude = parseFloat(Record.IntersectAltitude); // 横切高程=地面高程 不需要加上埋深
                  intersectAltitude = parseFloat(intersectAltitude).toFixed(2);

                  var intersectPointZ = parseFloat(intersectPointArr[2]); // + parseFloat(intersectDeep);//管线高程 横切点的Z值就是管线高程
                  intersectPointZ = parseFloat(intersectPointZ).toFixed(2);
                  var vecBegin = self.$_Datum.des_BLH_to_src_xy(
                    pVectors.Longitude,
                    pVectors.Latitude,
                    pVectors.Altitude
                  );
                  intersectPointArr[2] = pVectorsNew.Altitude;
                  var vecEnd = self.$_Datum.des_BLH_to_src_xy(
                    intersectPointArr[0],
                    intersectPointArr[1],
                    intersectPointArr[2]
                  );
                  var lengthl = Math.sqrt(
                    Math.abs(vecBegin.x - vecEnd.x) *
                      Math.abs(vecBegin.x - vecEnd.x) +
                      Math.abs(vecBegin.y - vecEnd.y) *
                        Math.abs(vecBegin.y - vecEnd.y)
                  ); // 间距
                  lengthl = parseFloat(lengthl).toFixed(6);

                  if (profileAlt == "0") {
                    if (flag) {
                      minLength = maxLength = lengthl; //间距

                      //数据高程
                      minGroundAltitude = maxGroundAltitude = intersectAltitude;
                      minPipeLineAltitude = maxPipeLineAltitude =
                        intersectPointZ; //管线高程

                      flag = false;
                    }
                    if (parseFloat(maxLength) < parseFloat(lengthl)) {
                      maxLength = lengthl;
                    }
                    if (parseFloat(minLength) >= parseFloat(lengthl)) {
                      minLength = lengthl;
                    }

                    //数据高程
                    if (
                      parseFloat(maxGroundAltitude) <
                      parseFloat(intersectAltitude)
                    ) {
                      maxGroundAltitude = intersectAltitude;
                    } else if (
                      parseFloat(minGroundAltitude) >=
                      parseFloat(intersectAltitude)
                    ) {
                      minGroundAltitude = intersectAltitude;
                    }

                    if (
                      parseFloat(maxPipeLineAltitude) <
                      parseFloat(intersectPointZ)
                    ) {
                      maxPipeLineAltitude = intersectPointZ;
                    } else if (
                      parseFloat(minPipeLineAltitude) >=
                      parseFloat(intersectPointZ)
                    ) {
                      minPipeLineAltitude = intersectPointZ;
                    }

                    var pipeLineObj = {};

                    groundAltList.push(intersectAltitude); //数据高程
                    pipeLineObj.groundAltitude = intersectAltitude;

                    groundAltList.push(lengthl);
                    pipeLineObj.dataType = dataType;
                    pipeLineObj.ID = ID;
                    pipeLineObj.mater = mater;
                    pipeLineObj.x = intersectPointZ;
                    pipeLineObj.y = lengthl;
                    pipeLineObj.coordX = vecEnd.x.toFixed(2);
                    pipeLineObj.coordY = vecEnd.y.toFixed(2);
                    pipeLineObj.fillcolor = color;
                    pipeLineObj.specification = specification;
                    pipeLineObj.deep = intersectDeep;
                    pipeLineAltList.push(pipeLineObj);
                    if (j == allRecords.length - 1) {
                      self.createTranSectionChat();
                    }
                  } else {
                    var cartographic1 = new StampGis.Cartographic(
                      StampGis.StampMath.toRadians(intersectPointArr[0]),
                      StampGis.StampMath.toRadians(intersectPointArr[1]),
                      0
                    );
                    var points = [cartographic1];
                    var promise =
                      earth.document.get_batch_dem_height_from_server(points);
                    StampGis.when(promise, function () {}).then(function () {
                      var vAltitude = points[0].height;
                      vAltitude = parseFloat(vAltitude).toFixed(2); //算出地形高程

                      if (flag) {
                        minLength = maxLength = lengthl; //间距

                        minGroundAltitude = maxGroundAltitude = vAltitude; //地形高程
                        minPipeLineAltitude = maxPipeLineAltitude =
                          vAltitude - intersectDeep; //管线高程

                        flag = false;
                      }
                      if (parseFloat(maxLength) < parseFloat(lengthl)) {
                        maxLength = lengthl;
                      }
                      if (parseFloat(minLength) >= parseFloat(lengthl)) {
                        minLength = lengthl;
                      }

                      if (
                        parseFloat(maxGroundAltitude) < parseFloat(vAltitude)
                      ) {
                        maxGroundAltitude = vAltitude;
                      } else if (
                        parseFloat(minGroundAltitude) >= parseFloat(vAltitude)
                      ) {
                        minGroundAltitude = vAltitude;
                      }

                      let tempAlt = vAltitude - intersectDeep;
                      if (
                        parseFloat(maxPipeLineAltitude) < parseFloat(tempAlt)
                      ) {
                        maxPipeLineAltitude = tempAlt;
                      } else if (
                        parseFloat(minPipeLineAltitude) >= parseFloat(tempAlt)
                      ) {
                        minPipeLineAltitude = tempAlt;
                      }

                      var pipeLineObj = {};

                      groundAltList.push(vAltitude); //地形高程
                      dataGroundAltList.push(intersectAltitude);
                      pipeLineObj.groundAltitude = vAltitude;
                      pipeLineObj.dataAltitude = intersectAltitude; //地形高程也显示数据高程

                      groundAltList.push(lengthl);
                      pipeLineObj.dataType = dataType;
                      pipeLineObj.ID = ID;
                      pipeLineObj.mater = mater;
                      pipeLineObj.x = intersectPointZ;
                      pipeLineObj.y = lengthl;
                      pipeLineObj.coordX = vecEnd.x.toFixed(2);
                      pipeLineObj.coordY = vecEnd.y.toFixed(2);
                      pipeLineObj.fillcolor = color;
                      pipeLineObj.specification = specification;
                      pipeLineObj.deep = intersectDeep;
                      pipeLineAltList.push(pipeLineObj);
                      if (j == allRecords.length - 1) {
                        self.createTranSectionChat();
                      }
                    });
                  }
                })(j);
              }
            })
          );
        });
      }
    },
    //根据length重新排序
    orderGroundCoordListByLength(groundCoordList) {
      var gCoordList = [];
      var coordListArr = [];
      for (var i = 0; i < groundCoordList.length; i++) {
        var temp;
        for (var j = i + 1; j < groundCoordList.length; j++) {
          if (
            parseFloat(groundCoordList[i][1]) >=
            parseFloat(groundCoordList[j][1])
          ) {
            temp = groundCoordList[i];
            groundCoordList[i] = groundCoordList[j];
            groundCoordList[j] = temp;
          }
        }
        gCoordList.push(groundCoordList[i]);
      }
      for (var k = 0; k < gCoordList.length; k++) {
        coordListArr.push(gCoordList[k][0]);
        coordListArr.push(gCoordList[k][1]);
      }
      return coordListArr;
    },
    //将坐标变换后的地面高程坐标转换成数组形式
    turnGroundCoordListToArray(groundAltList) {
      for (var i = 0; i < groundAltList.length; i++) {
        var groundCoord = [];
        if (maxX - minX != 0) {
          ratioX = 200 / (maxX - minX);
          groundAlt = ratioX * (groundAltList[i] - minX) + 250;
          if (groundAlt > 450) {
            groundAlt = 450;
          } else if (groundAlt < 250) {
            groundAlt = 250;
          }
        } else {
          groundAlt = groundAltList[i] + 250;
          if (groundAlt > 450) {
            groundAlt = 450;
          } else if (groundAlt < 250) {
            groundAlt = 250;
          }
        }
        groundCoord.push(groundAlt);
        i++;
        if (maxY - minY != 0) {
          ratioY = 800 / (maxY - minY);
          groundAlt = ratioY * (groundAltList[i] - minY) + 150;
          if (groundAlt > 950) {
            groundAlt = 950;
          } else if (groundAlt < 150) {
            groundAlt = 150;
          }
        } else {
          groundAlt = groundAltList[i] + 150;
          if (groundAlt > 950) {
            groundAlt = 950;
          } else if (groundAlt < 150) {
            groundAlt = 150;
          }
        }
        groundCoord.push(groundAlt);
        groundCoordList.push(groundCoord);
      }
      return groundCoordList;
    },
    //将高程坐标字符串转换成数组
    getAllLengthArray(groundAltList) {
      var tempArray = [];
      for (var i = 1; i < groundAltList.length; i = i + 2) {
        tempArray.push(parseFloat(groundAltList[i]));
      }
      var tmp = null;
      for (var j = 0; j < tempArray.length; j++) {
        for (var k = 0; k < tempArray.length; k++) {
          if (parseFloat(tempArray[j]) < parseFloat(tempArray[k])) {
            tmp = tempArray[j];
            tempArray[j] = tempArray[k];
            tempArray[k] = tmp;
          }
        }
      }
      //两条管线之间间距值
      for (var k = tempArray.length - 1; k > 0; k--) {
        tempArray[k] = tempArray[k] - tempArray[k - 1];
      }
      return tempArray;
    },
    //通过间距给管线排序 由近及远
    getAllPipelineSort(pipelineList) {
      var arr = pipelineList;
      var tempArray = [];
      for (var i = 0; i < pipelineList.length; i++) {
        tempArray.push(parseFloat(pipelineList[i].y));
      }
      for (var j = 0; j < tempArray.length - 1; j++) {
        var tmp = null;
        var temp2 = null;
        for (var k = j + 1; k < tempArray.length; k++) {
          if (tempArray[j] > tempArray[k]) {
            tmp = arr[j];
            arr[j] = arr[k];
            arr[k] = tmp;

            temp2 = tempArray[j];
            tempArray[j] = tempArray[k];
            tempArray[k] = temp2;
          }
        }
      }
      return arr;
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
    createGroup() {
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
    zoom() {
      // $("#gCanvas").empty();
      gCanvas.innerHTML = "";
      gCanvas.setAttribute(
        "transform",
        "rotate(270) translate(-" + 500 * size + ",-10)"
      );
      // $("#gCanvas").attr("transform", "rotate(270) translate(-" + (600 * size) + ",30)");
      // $("#mainTable").css("width", (1000 * size + 60) + "px");
      // $("#mainTable").css("height", 600 * size + "px");
      // $("#mainTD").css("width", 1000 * size + "px");
      // $("#mainTD").css("height", 600 * size + "px");
      gCanvas.appendChild(this.createRect(0, 20, 500 * size, 950 * size, 3, 0));
      gCanvas.appendChild(this.createGroup());

      tmpLength = 0;
      this.createYTick();
      this.createYLine();
      this.createTableTitle();
      if (palist.length > 1) {
        var coordListArr2 = [];
        for (var i = 0; i < coordListArr.length; i++) {
          coordListArr2.push(coordListArr[i] * size);
        }
        this.createTerrainProfile(coordListArr2);
      } else if (palist.length == 1) {
        var coordListArr2 = [];
        for (var i = 0; i < coordListArr.length; i++) {
          coordListArr2.push(coordListArr[i] * size);
        }
        coordListArr2.push(coordListArr2[0]);
        coordListArr2.push(750);
        this.createTerrainProfile(coordListArr2);
      }
      this.createPipeProfiles(palist, minX, maxX, minY, maxY, lengthListArray);
      this.createYTickValue(maxX, minX);
    },
    createTranSectionChat() {
      minX = Math.min(minPipeLineAltitude, minGroundAltitude); //高程最小值 绘制X注
      maxX = Math.max(maxPipeLineAltitude, maxGroundAltitude); //高程最大值
      minY = minLength; //间距作为Y注绘图
      maxY = maxLength;
      this.turnGroundCoordListToArray(groundAltList);
      coordListArr = this.orderGroundCoordListByLength(groundCoordList);
      palist = this.getAllPipelineSort(pipeLineAltList);
      lengthListArray = this.getAllLengthArray(groundAltList); //间距
      this.zoom();
      $("#btnZoomBig").click(function () {
        // if (size >= 3) {
        //     alert("已是最大比例，无法放大");
        //     return;
        // }
        // size += 0.5;
        // this.zoom();
        alert(1);
      });

      $("#btnZoomSmall").click(function () {
        if (size <= 1) {
          alert("已是最小比例，无法缩小");
          return;
        }
        size -= 0.5;
        this.zoom();
      });
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
      yLine.setAttribute("x2", 450 * size);
      yLine.setAttribute("y1", 125 * size);
      yLine.setAttribute("y2", 125 * size);
      yLine.style.position = "absolute";
      gCanvas.appendChild(yLine);
    },
    // Y轴竖线刻度
    createYTick() {
      var start = 250 * size,
        step = 50 * size,
        iTick = 0,
        yTick = null;
      while (iTick <= 4) {
        yTick = document.createElementNS("http://www.w3.org/2000/svg", "line");
        yTick.style.zIndex = 5;
        yTick.setAttribute("stroke-width", "1");
        yTick.style.stroke = "black";
        yTick.setAttribute("x1", start + iTick * step);
        yTick.setAttribute("x2", start + iTick * step);
        yTick.setAttribute("y1", 125 * size);
        yTick.setAttribute("y2", 130 * size);
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
      var minValue = parseFloat(minPipeLineAltitude).toFixed(2);
      for (var i = 0; i <= 4; i++) {
        var py = -i * 50 - 250;
        textPoint = parseFloat(altitude) * i + parseFloat(minValue);
        textPoint = textPoint.toFixed(2);
        var label = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        label.setAttribute("x", 100 * size - 10);
        label.setAttribute("y", py * size);
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
        txtPath.setAttribute("x", 30 * size);
        txtPath.setAttribute("y", py * size);
        txtPath.setAttribute("font-size", "18");
        txtPath.setAttribute("transform", "rotate(90)");
        gCanvas.appendChild(txtPath);
        txtPath.textContent = titles[i];
        i += 1;
        py = py - 40;
      }
    },
    // 管线剖面点
    createPipeProfile(pipeLineObj, x, y, lengthValue, yy, type) {
      var r = 5;
      var circle = null;
      if (type === "circle") {
        circle = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle"
        );
        circle.setAttribute("cx", x * size + r);
        circle.setAttribute("cy", y * size);
        circle.setAttribute("r", r);
      } else {
        circle = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        circle.setAttribute("x", x * size);
        circle.setAttribute("y", y * size - r);
        circle.setAttribute("width", r * 2);
        circle.setAttribute("height", r * 2);
      }
      circle.setAttribute("cursor", "pointer");
      circle.setAttribute("fill", pipeLineObj.fillcolor);
      circle.setAttribute("stroke", "false");
      var divHover = this.$refs.divHover;
      circle.onmouseover = function () {
        if (profileAlt != "0") {
          var boxGroundAlt = pipeLineObj.dataAltitude;
        } else {
          var boxGroundAlt = pipeLineObj.groundAltitude;
        }
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
          pipeLineObj.coordX +
          "</td></tr>";
        divStr +=
          '<tr class="colClass2"><td class="rightTd">纵坐标：</td><td>' +
          pipeLineObj.coordY +
          "</td></tr>";
        divStr +=
          '<tr class="colClass1"><td class="rightTd">管线高程：</td><td>' +
          pipeLineObj.x +
          "</td></tr>";
        divStr +=
          '<tr class="colClass2"><td class="rightTd">地面高程：</td><td>' +
          boxGroundAlt +
          "</td></tr>";
        divStr += "</table>";
        divHover.innerHTML = divStr;
        divHover.style.display = "block";
        var _left = this.getAttribute("cx")
          ? this.getAttribute("cx")
          : this.getAttribute("x");
        _left = Number(_left);
        if (_left + 25 + parseInt(divHover.clientWidth) > 980 * size + 35) {
          divHover.style.left =
            _left - 35 - parseInt(divHover.clientWidth) + "px";
        } else {
          divHover.style.left = _left + 5 + 35 + "px";
        }
        var _top = this.getAttribute("cy")
          ? this.getAttribute("cy")
          : this.getAttribute("y");
        _top = Number(_top);
        if (550 * size - _top - 15 < 85) {
          divHover.style.top = "85px";
        } else if (
          550 * size - _top - 15 + parseInt(divHover.clientHeight) >
          550 * size + 80
        ) {
          divHover.style.top =
            550 * size + 80 - parseInt(divHover.clientHeight) + "px";
        } else {
          divHover.style.top = 550 * size - _top - 15 + "px";
        }

        // var _left = this.getAttribute("cx")
        //     ? this.getAttribute("cx")
        //     : this.getAttribute("x");
        // _left = Number(_left);
        // if (
        //     _left + 15 + parseInt(divHover.style.width) >
        //     1000 * size + 60
        // ) {
        //     divHover.style.left =
        //         _left - 5 - parseInt(divHover.style.width) + "px";
        // } else {
        //     divHover.style.left = _left + 15 + "px";
        // }
        // var _top = this.getAttribute("cy")
        //     ? this.getAttribute("cy")
        //     : this.getAttribute("y");
        // _top = Number(_top);
        // divHover.style.top = "230px";
      };
      circle.onmouseout = function () {
        divHover.style.display = "none";
        // $("#divHover").hide();
      };
      circle.onclick = function () {
        // var x = event.screenX - 100;
        // var y = event.screenY - 250;
        // if (profileAlt != "0") {
        //     var boxGroundAlt = pipeLineObj.dataAltitude;
        // } else {
        //     var boxGroundAlt = pipeLineObj.groundAltitude;
        // }
        // window.showModalDialog("MessageBox.html?t=" + pipeLineObj.dataType + "&i=" + pipeLineObj.ID + "&s=" + pipeLineObj.specification + "&m=" + pipeLineObj.mater +
        //     "&x=" + pipeLineObj.coordX + "&y=" + pipeLineObj.coordY + "&p=" + pipeLineObj.x + "&g=" + boxGroundAlt
        //     , "_blank", "dialogWidth=220px;dialogHeight=220px,top=" + y + ",left=" + x + ",toolbar=no,menubar=no,scrollbars=no, resizable=no,location=no,status=no");
      };
      gCanvas.appendChild(circle);

      //创建点与地面连线
      var plotLine = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      plotLine.setAttribute("stroke", "true");
      plotLine.setAttribute("stroke-width", "1");
      plotLine.setAttribute("x1", 0);
      plotLine.setAttribute("y1", y * size);
      plotLine.setAttribute("x2", x * size);
      plotLine.setAttribute("y2", y * size);
      plotLine.setAttribute("stroke-dasharray", "5 3");
      plotLine.style.stroke = "black";
      gCanvas.appendChild(plotLine);

      this.insertDataToTable(pipeLineObj, y, lengthValue, yy);
    },
    insertDataToTable(pipeLineObj, y, lengthValue, yy) {
      //地面高程
      var groundAlt = pipeLineObj.groundAltitude;
      var newText = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      newText.setAttribute("x", 160 * size);
      newText.setAttribute("y", (y - 5) * size);
      newText.setAttribute("font-size", "11");
      gCanvas.appendChild(newText);
      if (profileAlt != "0") {
        //修改如果是地形高程显示方式也同样使用数据高程
        newText.textContent = pipeLineObj.dataAltitude;
      } else {
        newText.textContent = groundAlt;
      }

      //管线高程
      var pipeLineAlt = pipeLineObj.x;
      var newText = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      newText.setAttribute("x", 120 * size);
      newText.setAttribute("y", (y - 5) * size);
      newText.setAttribute("font-size", "11");
      gCanvas.appendChild(newText);
      newText.textContent = pipeLineAlt;

      //间距
      if (tmpLength == 0) {
        tmpLength = 1;
      } else {
        var length = Math.abs(parseFloat(lengthValue));
        length = length.toFixed(2);
        var newText = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        newText.setAttribute("x", ((y + yyy) / 2 - 10) * size);
        newText.setAttribute("y", -90 * size);
        newText.setAttribute("font-size", "13");
        newText.setAttribute("transform", "rotate(90)");
        newText.textContent = length;
        gCanvas.appendChild(newText);
      }
      yyy = y;
      //规格
      var specification = pipeLineObj.specification;
      specification = specification || "";
      if (specification.indexOf("X") == -1) {
        var newText = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        newText.setAttribute("x", 45 * size);
        newText.setAttribute("y", (y - 5) * size);
        newText.setAttribute("font-size", "13");
        gCanvas.appendChild(newText);
        newText.textContent = specification;
      } else if (specification.indexOf("X") > -1) {
        var newText = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        newText.setAttribute("x", (y - 25) * size);
        newText.setAttribute("y", -65 * size);
        newText.setAttribute("font-size", "13");
        newText.setAttribute("transform", "rotate(90)");
        gCanvas.appendChild(newText);
        newText.textContent = specification;
      }
      //埋深
      var deep = pipeLineObj.deep;
      var newText = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      newText.setAttribute("x", 5);
      newText.setAttribute("y", (y - 5) * size);
      newText.setAttribute("font-size", "13");
      gCanvas.appendChild(newText);
      newText.textContent = deep;
    },
    //创建所有管线剖面
    createPipeProfiles(ptsWithColor, minX, maxX, minY, maxY, lengthListArray) {
      var i = 0;
      var x = null;
      var y = null;
      var yy = null;
      var lineColor = null;
      var lineType = null;
      while (i < ptsWithColor.length) {
        var specification = 0;
        if (
          ptsWithColor[i].specification &&
          ptsWithColor[i].specification.toString().indexOf("X") < 0
        ) {
          specification = ptsWithColor[i].specification / 1000; //管径
        }
        if (maxX - minX != 0) {
          ratioX = 200 / (maxX - minX);
          if (profileAlt == "0") {
            //数据高程
            x = (ptsWithColor[i].x - minX) * ratioX + 250;
          } else {
            //地形高程
            x =
              (groundAltList[i * 2] - ptsWithColor[i].deep - minX) * ratioX +
              250;
          }
          if (x > 450) {
            x = 450;
          } else if (x < 250) {
            x = 250;
          }
        } else {
          if (profileAlt == "0") {
            //数据高程
            x = ptsWithColor[i].x - minX + 250;
          } else {
            //地形高程
            x = groundAltList[i * 2] - ptsWithColor[i].deep - minX + 250;
          }
          if (x > 450) {
            x = 450;
          } else if (x < 250) {
            x = 250;
          }
        }
        if (maxY - minY != 0) {
          ratioY = 800 / (maxY - minY);
          y = (ptsWithColor[i].y - minY) * ratioY + 150;
          if (y > 950) {
            y = 950;
          } else if (y < 150) {
            y = 150;
          }
          yy = (ptsWithColor[i] - minY) * ratioY + 150;
          if (yy > 950) {
            yy = 950;
          } else if (yy < 150) {
            yy = 150;
          }
        } else {
          y = ptsWithColor[i].y - minY + 150;
          if (y > 950) {
            y = 950;
          } else if (y < 150) {
            y = 150;
          }
          yy = ptsWithColor[i] - minY + 150;
          if (yy > 950) {
            yy = 950;
          } else if (yy < 150) {
            yy = 150;
          }
        }
        //lineColor = lengthListArray[i].fillcolor ;
        var tag = ptsWithColor[i].specification; //.split("X");
        if (isNaN(ptsWithColor[i].specification)) {
          lineType = "polygon";
        } else {
          lineType = "circle";
          //tag = ptsWithColor[i].specification.split("X");
        }
        var ll = 0;
        if (i !== 0) {
          // ll=ptsWithColor[i].y-ptsWithColor[i-1].y;
        }
        this.createPipeProfile(
          ptsWithColor[i],
          x,
          y,
          lengthListArray[i],
          yy,
          lineType
        );
        i += 1;
      }
    },
    // 地形剖面线
    createTerrainProfile(pts) {
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
    handleClose() {
      this.$router.push("/");
    },
  },
  beforeRouteLeave(to, from, next) {
    next();
    this.stampAPI.usearth.ShapeCreator.Clear();
    this.clear();
    this.$parent.$refs.functionPanel.curSelMenu.name = "";
  },
};
</script>

<style lang="less" scoped>
// .svgpopover {
//     width: 1180px;
// }
</style>
