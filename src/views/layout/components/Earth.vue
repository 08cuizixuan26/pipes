<template>
  <div id="earthContainer" style="position: absolute; z-index: 0">
    <div id="earthDiv" class="major-viewer" />
    <div id="earch2dDiv" class="minor-viewer-hide" />
    <div id="earthDiv1" class="minor-viewer-hide" />
  </div>
</template>

<script>
import { mapActions } from "vuex";
import { createGuid } from "@/utils";
import {
  DownloadFile,
  GetDynamicPath,
  DownloadFileWithoutIp,
  getServicePort,
} from "@/api/common";
import {
  postDataQuery,
  getFiledCfgXml,
  getNameNoIgnoreCase,
} from "@/api/query";
import location from "@/stamplib/Location";
import localStorage from "@/stamplib/LocalStorage";
import drawManager from "../../draw/index.js";

export default {
  name: "Earth",
  data() {
    this.checkData = [];
    this.expandData = [];
    this.DateTimeLayers = {};
    this.projectInfo = {};
    this.pipeListDataAll = {};
    this.project = null;
    this.elIconMap = {};
    this.curProject = null;
    return {
      pipelinesId: [],
      // color: "",
    };
  },
  computed: {
    areaTable() {
      return this.$store.state.areaTable;
    },
    pipelineData() {
      return this.$store.state.pipelineLayerData;
    },
    PipelineColor() {
      return this.$store.state.PipelineColor;
    },
  },
  mounted: function () {
    var self = this;
    var APIObj = this.stampAPI;
    (function (initLayerData) {
      function loadEarthFunc() {
        APIObj.loadEarth("earthContainer", "earthDiv", function () {
          initLayerData(APIObj);
          self.setEarthParams(APIObj); // 设置一些三维球参数
          // console.log('init layer finish')
          if (!window.g_VideoLayer) {
            // 动态特效单独处理，放到videolayer里面
            var layer_opt = {
              guid: createGuid(),
            };
            window.g_VideoLayer =
              APIObj.usearth.Factory.CreateVideoLayer(layer_opt);
            APIObj.usearth.document.edit_system.attach_object(
              window.g_VideoLayer
            );
          }
          if (!window.g_DynamicLayer) {
            window.g_DynamicLayer =
              APIObj.usearth.Factory.CreateEditLayerDynamicModel({
                name: "dynamicLayer",
                underground: false,
                max_height: 100000,
              });
            GetDynamicPath()
              .then((res) => {
                DownloadFile(res.data, "text")
                  .then((response) => {
                    var d = self.$x2js.xml2js(response.data);
                    if (d && d.xml && d.xml.ElementLink) {
                      var dynamiclist = [];
                      var value = d.xml.ElementLink;
                      if (value) {
                        Array.isArray(value) || (value = [value]);
                        self.getDynamicFile(0, value, dynamiclist);
                      }
                    } else {
                      self.$message({
                        message: "未配置动态物体列表",
                        type: "warning",
                      });
                    }
                  })
                  .catch((err) => {
                    self.$message({
                      message: err,
                      type: "warning",
                    });
                  });
              })
              .catch((err) => {
                self.$message({
                  message: err,
                  type: "warning",
                });
              });
            APIObj.usearth.document.edit_system.attach_object(
              window.g_DynamicLayer
            );
            APIObj.usearth.document.register_object(window.g_DynamicLayer);
          }
          if (!window.g_ModelLayer) {
            // 动态特效单独处理，放到videolayer里面
            window.g_ModelLayer =
              APIObj.usearth.Factory.CreateEditLayerSingleModel({
                name: "modelLayer",
                underground: false,
              });
            APIObj.usearth.document.edit_system.attach_object(
              window.g_ModelLayer
            );
            APIObj.usearth.document.register_object(window.g_ModelLayer);
          }
          localStorage.readElementFromDB(
            APIObj.usearth,
            self.g_ElementData,
            function (elmentArr, jsondata) {
              self.showElement(elmentArr, jsondata[0]);
            }
          );
          // 视角改变事件--修改指北针图片角度
          const earth = APIObj.usearth;
          earth.GlobeObserver.GetObserverChangedEvent().addEventListener(
            function () {
              var pose = earth.application.observer.pose;
              self.$store.state.heading = (pose.heading * 180) / Math.PI;
            }
          );
          function middleDownEvent(e, earthObj, earthIndex) {
            var world_position = new StampGis.Cartesian3();
            if (!earthObj) {
              return;
            }
            earthObj.application.pickPosition(e.position, world_position);
            if (world_position.x == 0 && world_position.y == 0) {
              return;
            }
            if (self.elIconMap[earthIndex]) {
              earthObj.document.elementRoot.detach_object(
                self.elIconMap[earthIndex]
              );
              self.elIconMap[earthIndex] = null;
            }
            self.elIconMap[earthIndex] = earthObj.Factory.CreateElementIcon({
              name: "",
              doc: earthObj.document,
              parentLayer: earthObj.document.elementRoot,
            });
            self.elIconMap[earthIndex].name = "";
            self.elIconMap[earthIndex].NormalIcon.IconLink =
              stamp_core_config.baseUrlString + "/images/centerPoint.png"; // "http://192.168.10.218/sde?/home/stamp/stampmanager/vector-tile2/icon.png";
            self.elIconMap[earthIndex].HighlightIcon.IconLink =
              stamp_core_config.baseUrlString + "/images/centerPoint.png"; // "http://192.168.10.218/sde?/home/stamp/stampmanager/vector-tile2/poi_default_highlight.png";
            self.elIconMap[earthIndex].NormalIcon.IconIsClip = false;
            self.elIconMap[earthIndex].HighlightIcon.IconIsClip = false;
            self.elIconMap[earthIndex].transform.set_position_geo(
              world_position
            );
            self.elIconMap[earthIndex].ShowHandle = false;
            self.elIconMap[earthIndex].HandleHeight = 0;
            self.elIconMap[earthIndex].RenderMode = 0;
            self.elIconMap[earthIndex].TextColor = parseInt(0x00ffffff);
            self.elIconMap[earthIndex].TextHorizontalScale = 1;
            self.elIconMap[earthIndex].TextVerticalScale = 1;
            self.elIconMap[earthIndex].Text = "";
            self.elIconMap[earthIndex].minVisibleRange = 0;
            self.elIconMap[earthIndex].maxVisibleRange = 100000 * 1000;
            self.elIconMap[earthIndex].Create();
            self.elIconMap[earthIndex].BeginUpdate();
            self.elIconMap[earthIndex].set_is_visible(true);
            self.elIconMap[earthIndex].EndUpdate();
            earthObj.document.elementRoot.attach_object(
              self.elIconMap[earthIndex]
            );
            earthObj.document.register_object(self.elIconMap[earthIndex]);
          }
          function middleUpEvent(_e, earthObj, earthIndex) {
            if (self.elIconMap[earthIndex] && earthObj) {
              earthObj.document.elementRoot.detach_object(
                self.elIconMap[earthIndex]
              );
              self.elIconMap[earthIndex] = null;
            }
          }
          var handler = new StampGis.ScreenSpaceEventHandler(
            document.getElementById("earthDiv").querySelector("canvas")
          );
          var handler2 = new StampGis.ScreenSpaceEventHandler(
            document.getElementById("earthDiv1").querySelector("canvas")
          );
          var handler3 = new StampGis.ScreenSpaceEventHandler(
            document.getElementById("earch2dDiv").querySelector("canvas")
          );
          handler.setInputAction(function (e) {
            if (
              e.position.x > document.getElementById("earthDiv").clientWidth ||
              e.position.y > document.getElementById("earthDiv").clientHeight
            ) {
              // 说明不在earthDiv上
              return;
            }
            middleDownEvent(e, self.stampAPI.usearth, 0);
          }, StampGis.ScreenSpaceEventType.MIDDLE_DOWN);
          handler.setInputAction(function (e) {
            middleUpEvent(e, self.stampAPI.usearth, 0);
          }, StampGis.ScreenSpaceEventType.MIDDLE_UP);
          handler2.setInputAction(function (e) {
            if (
              e.position.x <
                parseInt(document.getElementById("earthDiv1").offsetLeft) ||
              e.position.y <
                parseInt(document.getElementById("earthDiv1").offsetTop)
            ) {
              return;
            }
            if (
              e.position.x >
              parseInt(document.getElementById("earthDiv1").offsetLeft)
            ) {
              e.position.x =
                e.position.x -
                parseInt(document.getElementById("earthDiv1").offsetLeft);
            }
            if (
              e.position.y >
              parseInt(document.getElementById("earthDiv1").offsetTop)
            ) {
              e.position.y =
                e.position.y -
                parseInt(document.getElementById("earthDiv1").offsetTop);
            }
            middleDownEvent(e, self.stampAPI.usearth1, 1);
          }, StampGis.ScreenSpaceEventType.MIDDLE_DOWN);
          handler2.setInputAction(function (e) {
            middleUpEvent(e, self.stampAPI.usearth1, 1);
          }, StampGis.ScreenSpaceEventType.MIDDLE_UP);
          handler3.setInputAction(function (e) {
            if (
              e.position.x <
                parseInt(document.getElementById("earch2dDiv").offsetLeft) ||
              e.position.y <
                parseInt(document.getElementById("earch2dDiv").offsetTop)
            ) {
              return;
            }
            if (
              e.position.x >
              parseInt(document.getElementById("earch2dDiv").offsetLeft)
            ) {
              e.position.x =
                e.position.x -
                parseInt(document.getElementById("earch2dDiv").offsetLeft);
            }
            if (
              e.position.y >
              parseInt(document.getElementById("earch2dDiv").offsetTop)
            ) {
              e.position.y =
                e.position.y -
                parseInt(document.getElementById("earch2dDiv").offsetTop);
            }
            middleDownEvent(e, self.stampAPI.earth2D, 2);
          }, StampGis.ScreenSpaceEventType.MIDDLE_DOWN);
          handler3.setInputAction(function (e) {
            middleUpEvent(e, self.stampAPI.earth2D, 2);
          }, StampGis.ScreenSpaceEventType.MIDDLE_UP);
        });
      }
      getServicePort()
        .then((res) => {
          if (res && res.data) {
            if (res.data.indexOf("404 Not Found") > -1) {
              self.$message({
                message: "未取到多服务端口",
                type: "warning",
              });
            } else {
              var servicePort = res.data.split(",");
              for (var i = 0; i < servicePort.length; i++) {
                StampGis.SystemEnvironment.port_list.push(servicePort[i]);
              }
            }
          } else {
            self.$message({
              message: "未取到多服务端口",
              type: "warning",
            });
          }
          loadEarthFunc();
        })
        .catch((_ex) => {
          loadEarthFunc();
        });
    })(this.initLayerData);

    // 键盘监听事件
    APIObj.customer_key_down_func.push(this.shortcut_key_down_func);
    document.onkeydown = APIObj.key_down_func;
  },
  methods: {
    initLayerData(APIObj) {
      const self = this;
      this.checkData = [];
      this.pipelineCheckData = {};
      this.expandData = [];
      this.pipelineExpandData = {};
      this.projectInfo = {};
      this.pipeListDataAll = {};

      var pipelineLayers = this.getPipelineData(
        APIObj.usearth.document.rootFolder
      );

      this.$store.state.pipelineLayers = pipelineLayers;
      this.$store.state.projectInfo = this.projectInfo;
      this.$store.state.pipeListDataAll = this.pipeListDataAll;

      StampGis.SystemEnvironment.highlight_continue_time =
        STAMP_config.highLightTime;
      StampGis.SystemEnvironment.highlight_interval_time =
        STAMP_config.highlight_interval_time;
      StampGis.SystemEnvironment.highlight_color = parseInt(
        STAMP_config.highLightColor + "99",
        16
      );

      if (pipelineLayers.length > 0 && !STAMP_config.pipeline.curProject) {
        self.changePipelineData([pipelineLayers[0]]);
        self.curProject = pipelineLayers[0].id.replace("pipeline", "");
        STAMP_config.pipeline.curProject = pipelineLayers[0].name;
      } else {
        for (let i = 0; i < pipelineLayers.length; i++) {
          if (STAMP_config.pipeline.curProject == pipelineLayers[i].name) {
            self.changePipelineData([pipelineLayers[i]]);
            self.curProject = pipelineLayers[i].id.replace("pipeline", "");
            break;
          }
        }
      }

      var layerData = this.getLayerData(
        APIObj.usearth.document.rootFolder,
        false
      );

      this.changeLayerData(layerData);
      this.changeCheckData(this.checkData);
      this.changeExpandData(this.expandData);

      self.getPipeProjectInfo();

      self.getAreaTable().then(() => {
        self.initSearchItemData();
      });

      //   // 读取存储到indexDB设置管线颜色的数据
      localStorage.readFromDB(APIObj.usearth, "systemSetup", function (data) {
        if (data) {
          StampGis.SystemEnvironment.highlight_continue_time =
            data.highLightTime;
          StampGis.SystemEnvironment.highlight_interval_time =
            data.highlight_interval_time;
          StampGis.SystemEnvironment.highlight_color = parseInt(
            data.highLightColor,
            16
          );

          STAMP_config.pipeline.curProject = data.curProject;
          if (data.location) {
            STAMP_config.pipeline.location = data.location;
          }

          if (pipelineLayers.length > 0 && !STAMP_config.pipeline.curProject) {
            self.changePipelineData([pipelineLayers[0]]);
            self.curProject = pipelineLayers[0].id.replace("pipeline", "");
          }
          for (let i = 0; i < pipelineLayers.length; i++) {
            if (STAMP_config.pipeline.curProject == pipelineLayers[i].name) {
              self.changePipelineData([pipelineLayers[i]]);
              self.curProject = pipelineLayers[i].id.replace("pipeline", "");
              break;
            }
          }

          var layerData = self.getLayerData(
            APIObj.usearth.document.rootFolder,
            false
          );

          self.changeLayerData(layerData);
          self.changeCheckData(self.checkData);
          self.changeExpandData(self.expandData);

          self.getPipeProjectInfo();

          self.getAreaTable().then(() => {
            self.initSearchItemData();
          });
        }
      });
    },
    backFuncDisable() {
      for (let item in STAMP.menuConfig.menu) {
        if (STAMP.menuConfig.menu[item].id == "query") {
          for (let subItem in STAMP.menuConfig.menu[item].item) {
            let tempItem = STAMP.menuConfig.menu[item].item[subItem];
            if (tempItem.id == "QueryRoad") {
              tempItem.disabled = true;
            } else if (tempItem.id == "QueryCross") {
              tempItem.disabled = true;
            } else if (tempItem.id == "QueryAbandon") {
              tempItem.disabled = true;
            } else if (tempItem.id == "QueryOwner") {
              tempItem.disabled = true;
            }
          }
        } else if (STAMP.menuConfig.menu[item].id == "statistics") {
          for (let subItem in STAMP.menuConfig.menu[item].item) {
            let tempItem = STAMP.menuConfig.menu[item].item[subItem];
            if (tempItem.id == "StatisticsRoad") {
              tempItem.disabled = true;
            } else if (tempItem.id == "StatisticsCanton") {
              tempItem.disabled = true;
            } else if (tempItem.id == "StatisticsAbandon") {
              tempItem.disabled = true;
            } else if (tempItem.id == "StatisticsOwner") {
              tempItem.disabled = true;
            } else if (tempItem.id == "StatisticsInbuilt") {
              tempItem.disabled = true;
            }
          }
        }
      }
    },
    updateFuncDisable(type) {
      switch (type) {
        case "road":
          for (let item in STAMP.menuConfig.menu) {
            if (STAMP.menuConfig.menu[item].id == "query") {
              for (let subItem in STAMP.menuConfig.menu[item].item) {
                let tempItem = STAMP.menuConfig.menu[item].item[subItem];
                if (tempItem.id == "QueryRoad") {
                  tempItem.disabled = false;
                } else if (tempItem.id == "QueryCross") {
                  tempItem.disabled = false;
                }
              }
            }
            if (STAMP.menuConfig.menu[item].id == "statistics") {
              for (let subItem in STAMP.menuConfig.menu[item].item) {
                let tempItem = STAMP.menuConfig.menu[item].item[subItem];
                if (tempItem.id == "StatisticsRoad") {
                  tempItem.disabled = false;
                }
              }
            }
          }
          break;
        case "canton":
          for (let item in STAMP.menuConfig.menu) {
            if (STAMP.menuConfig.menu[item].id == "statistics") {
              for (let subItem in STAMP.menuConfig.menu[item].item) {
                let tempItem = STAMP.menuConfig.menu[item].item[subItem];
                if (tempItem.id == "StatisticsCanton") {
                  tempItem.disabled = false;
                  break;
                }
              }
              break;
            }
          }
          break;
        case "status":
          for (let item in STAMP.menuConfig.menu) {
            if (STAMP.menuConfig.menu[item].id == "query") {
              for (let subItem in STAMP.menuConfig.menu[item].item) {
                let tempItem = STAMP.menuConfig.menu[item].item[subItem];
                if (tempItem.id == "QueryAbandon") {
                  tempItem.disabled = false;
                  break;
                }
              }
            }
            if (STAMP.menuConfig.menu[item].id == "statistics") {
              for (let subItem in STAMP.menuConfig.menu[item].item) {
                let tempItem = STAMP.menuConfig.menu[item].item[subItem];
                if (tempItem.id == "StatisticsAbandon") {
                  tempItem.disabled = false;
                  break;
                }
              }
            }
          }
          break;
        case "owner":
          for (let item in STAMP.menuConfig.menu) {
            if (STAMP.menuConfig.menu[item].id == "query") {
              for (let subItem in STAMP.menuConfig.menu[item].item) {
                let tempItem = STAMP.menuConfig.menu[item].item[subItem];
                if (tempItem.id == "QueryOwner") {
                  tempItem.disabled = false;
                  break;
                }
              }
            }
            if (STAMP.menuConfig.menu[item].id == "statistics") {
              for (let subItem in STAMP.menuConfig.menu[item].item) {
                let tempItem = STAMP.menuConfig.menu[item].item[subItem];
                if (tempItem.id == "StatisticsOwner") {
                  tempItem.disabled = false;
                  break;
                }
              }
            }
          }
          break;
        case "inbuilt":
          for (let item in STAMP.menuConfig.menu) {
            if (STAMP.menuConfig.menu[item].id == "statistics") {
              for (let subItem in STAMP.menuConfig.menu[item].item) {
                let tempItem = STAMP.menuConfig.menu[item].item[subItem];
                if (tempItem.id == "StatisticsInbuilt") {
                  tempItem.disabled = false;
                  break;
                }
              }
              break;
            }
          }
          break;
      }
    },
    initSearchItemData() {
      if (this.areaTable.indexOf("road") != -1) {
        this.updateFuncDisable("road");
      }
      if (this.areaTable.indexOf("canton") != -1) {
        this.updateFuncDisable("canton");
      }
    },
    /**
     * 查看是否配置了单位、道路、行政区划表、测区
     * @param  {[object]} earth [球对象]
     * @return {[type]}       [description]
     */
    getAreaTable() {
      var self = this;
      self.$store.state.areaTable = [];
      return new Promise((resolve, _reject) => {
        var iIndex = 0;
        // 判断道路、行政区、单位、测区
        postDataQuery({
          config: "Road",
          project: self.curProject,
        })
          .then((res) => {
            if (res && res.data != "error") {
              self.$store.state.areaTable.push("road");
            }
            iIndex++;
            if (iIndex >= 4) {
              resolve();
            }
          })
          .catch((_err) => {
            iIndex++;
            if (iIndex >= 4) {
              resolve();
            }
          });

        postDataQuery({
          config: "Canton3",
          project: self.curProject,
        })
          .then((res) => {
            if (res && res.data != "error") {
              self.$store.state.areaTable.push("canton");
            }
            iIndex++;
            if (iIndex >= 4) {
              resolve();
            }
          })
          .catch((_err) => {
            iIndex++;
            if (iIndex >= 4) {
              resolve();
            }
          });

        postDataQuery({
          config: "Company",
          project: self.curProject,
        })
          .then((res) => {
            if (res && res.data != "error") {
              self.$store.state.areaTable.push("company");
            }
            iIndex++;
            if (iIndex >= 4) {
              resolve();
            }
          })
          .catch((_err) => {
            iIndex++;
            if (iIndex >= 4) {
              resolve();
            }
          });
        postDataQuery({
          config: "SurveyArea",
          project: self.curProject,
        })
          .then((res) => {
            if (res && res.data != "error") {
              self.$store.state.areaTable.push("surveyarea");
            }
            iIndex++;
            if (iIndex >= 4) {
              resolve();
            }
          })
          .catch((_err) => {
            iIndex++;
            if (iIndex >= 4) {
              resolve();
            }
          });
      });
    },
    showElement(elmentArr, jsondata) {
      if (jsondata && jsondata.children) {
        if (jsondata.children.length > 0) {
          // 有子节点，说明是文件夹，继续向下搜索
          for (var i = 0; i < jsondata.children.length; i++) {
            this.showElement(elmentArr, jsondata.children[i]);
          }
        }
      } else {
        // 无子节点，说明是Element对象
        var drawType = jsondata.type;
        if (drawManager[drawType]) {
          drawManager[drawType].createElement(this, elmentArr, jsondata);
        }
      }
    },
    getPipeProjectInfo() {
      var self = this;
      if (self.curProject) {
        this.$store.state.pipelineCheckData =
          this.pipelineCheckData[this.curProject];
        this.$store.state.pipelineExpandData =
          this.pipelineExpandData[this.curProject];

        self.g_Project.project = self.curProject;
        if (!self.projectInfo[self.g_Project.project]) {
          const arrKey = Object.keys(self.projectInfo);
          self.g_Project.project = arrKey[0];
        }
        self.g_Project.SpatialReference =
          self.projectInfo[self.g_Project.project].SpatialReference;
        self.g_Project.FieldMap =
          self.projectInfo[self.g_Project.project].FieldMap;
        self.g_Project.PipeConfig =
          self.projectInfo[self.g_Project.project].PipeConfig;
        self.g_Project.ValueMap =
          self.projectInfo[self.g_Project.project].ValueMap;
        self.g_Project.Bounds = self.projectInfo[self.g_Project.project].Bounds;

        self.g_Project.pipeListData =
          self.pipeListDataAll[self.g_Project.project];
        self.g_Project.pipeListData.map((item) => {
          if (!item.src) {
            var layer = self.stampAPI.usearth.LayerManager.GetLayerByGUID(
              item.guid
            );
            if (layer.container) {
              layer.container.GetBlockLayerTextures(function (res) {
                item.src = res[0];
              });
            }
          }
        });

        if (
          STAMP_config.pipeline.location &&
          STAMP_config.pipeline.location.length == 6
        ) {
          location.FlyTo(
            self.stampAPI.usearth,
            ...STAMP_config.pipeline.location
          );
        } else {
          location.flyToBound(
            self.stampAPI.usearth,
            self.g_Project.Bounds,
            STAMP_config.pipeline.locationHeight
          );
        }

        self.backFuncDisable();

        getFiledCfgXml(self.g_Project.FieldMap, self).then((res) => {
          let statusField = getNameNoIgnoreCase(res, "US_STATUS", "1", true);
          if (statusField) {
            self.updateFuncDisable("status");
          }
          let ownerField = getNameNoIgnoreCase(res, "US_OWNER", "1", true);
          if (ownerField) {
            self.updateFuncDisable("owner");
          }

          let timeField = getNameNoIgnoreCase(res, "US_BD_TIME", "1", true);
          if (timeField) {
            self.updateFuncDisable("inbuilt");
          }
        });
      }
    },
    getLayerData(root, flag) {
      var treeData = [];
      for (var i = 0; i < root.getChildCount(); i++) {
        var subLayer = root.getChildAt(i);

        if (subLayer.getChildCount === undefined) {
          if (subLayer.pipeline_type) {
            if (flag) {
              continue;
            }

            treeData.push({
              name: subLayer._name,
              id: subLayer.get_guid(),
              children: [],
            });
            if (subLayer.container) {
              treeData[treeData.length - 1].children.push({
                name: "管线",
                id: subLayer.container._id,
                parentId: subLayer.get_guid(),
              });
            }

            if (subLayer.well) {
              treeData[treeData.length - 1].children.push({
                name: "井",
                id: subLayer.well._id,
                parentId: subLayer.get_guid(),
              });
            }
            if (subLayer.plate) {
              treeData[treeData.length - 1].children.push({
                name: "井盖",
                id: subLayer.plate._id,
                parentId: subLayer.get_guid(),
              });
            }
            if (subLayer.joint) {
              treeData[treeData.length - 1].children.push({
                name: "特征",
                id: subLayer.joint._id,
                parentId: subLayer.get_guid(),
              });
            }
            if (subLayer.equipment) {
              treeData[treeData.length - 1].children.push({
                name: "附属设施",
                id: subLayer.equipment._id,
                parentId: subLayer.get_guid(),
              });
            }
            if (subLayer.equipment_og) {
              treeData[treeData.length - 1].children.push({
                name: "地上附属设施",
                id: subLayer.equipment_og._id,
                parentId: subLayer.get_guid(),
                type: "equipment_og",
              });
            }
            if (subLayer.room) {
              treeData[treeData.length - 1].children.push({
                name: "井室",
                id: subLayer.room._id,
                parentId: subLayer.get_guid(),
              });
            }
            if (subLayer.container_og) {
              treeData[treeData.length - 1].children.push({
                name: "地上管线",
                id: subLayer.container_og._id,
                parentId: subLayer.get_guid(),
              });
            }
            if (subLayer.joint_og) {
              treeData[treeData.length - 1].children.push({
                name: "地上特征",
                id: subLayer.joint_og._id,
                parentId: subLayer.get_guid(),
              });
            }
          } else {
            treeData.push({
              name: subLayer._name,
              id: subLayer.get_guid(),
            });
          }

          if (subLayer.get_is_visible()) {
            this.checkData.push(subLayer.get_guid());
          }
        } else {
          if (subLayer._curProject != undefined) {
            flag = subLayer.get_guid() == this.curProject;
          }
          var childrenData = this.getLayerData(subLayer, flag);
          if (childrenData.length > 0) {
            treeData.push({
              name: subLayer._name,
              id: subLayer.get_guid(),
              children: childrenData,
            });
          }
        }
      }
      return treeData;
    },
    getPipelineData(root) {
      var treeData = [];
      for (var i = 0; i < root.getChildCount(); i++) {
        var subLayer = root.getChildAt(i);
        if (subLayer.getChildCount === undefined) {
          if (subLayer.pipeline_type) {
            if (subLayer.get_is_visible()) {
              this.pipelineCheckData[this.project].push(subLayer.get_guid());
            }
            this.pipelineExpandData[this.project].push(subLayer.get_guid());

            this.pipeListDataAll[this.project].push({
              guid: subLayer.get_guid(),
              name: subLayer._name,
            });
            treeData.push({
              name: subLayer._name,
              id: subLayer.get_guid(),
              children: [],
            });
            if (subLayer.container) {
              treeData[treeData.length - 1].children.push({
                name: "管线",
                id: subLayer.container._id,
                parentId: subLayer.get_guid(),
              });
            }

            if (subLayer.well) {
              treeData[treeData.length - 1].children.push({
                name: "井",
                id: subLayer.well._id,
                parentId: subLayer.get_guid(),
              });
            }
            if (subLayer.plate) {
              treeData[treeData.length - 1].children.push({
                name: "井盖",
                id: subLayer.plate._id,
                parentId: subLayer.get_guid(),
              });
            }
            if (subLayer.joint) {
              treeData[treeData.length - 1].children.push({
                name: "特征",
                id: subLayer.joint._id,
                parentId: subLayer.get_guid(),
              });
            }
            if (subLayer.equipment) {
              treeData[treeData.length - 1].children.push({
                name: "附属设施",
                id: subLayer.equipment._id,
                parentId: subLayer.get_guid(),
              });
            }
            if (subLayer.equipment_og) {
              treeData[treeData.length - 1].children.push({
                name: "地上附属设施",
                id: subLayer.equipment_og._id,
                parentId: subLayer.get_guid(),
                type: "equipment_og",
              });
            }
            if (subLayer.room) {
              treeData[treeData.length - 1].children.push({
                name: "井室",
                id: subLayer.room._id,
                parentId: subLayer.get_guid(),
              });
            }
            if (subLayer.container_og) {
              treeData[treeData.length - 1].children.push({
                name: "地上管线",
                id: subLayer.container_og._id,
                parentId: subLayer.get_guid(),
              });
            }
            if (subLayer.joint_og) {
              treeData[treeData.length - 1].children.push({
                name: "地上特征",
                id: subLayer.joint_og._id,
                parentId: subLayer.get_guid(),
              });
            }
          }
        } else {
          if (subLayer._curProject != undefined) {
            this.project = subLayer.get_guid();

            var index = subLayer.SpatialReference.indexOf("sde?");
            var temp =
              subLayer.SpatialReference.slice(0, index + 4) +
              "projectID=" +
              this.project +
              "&file=";
            this.projectInfo[this.project] = {
              SpatialReference:
                subLayer.SpatialReference != ""
                  ? temp + subLayer.SpatialReference.slice(index + 4)
                  : "",
              FieldMap:
                subLayer.FieldMap != ""
                  ? temp + subLayer.FieldMap.slice(index + 4)
                  : "",
              PipeConfig:
                subLayer.PipeConfig != ""
                  ? temp + subLayer.PipeConfig.slice(index + 4)
                  : "",
              ValueMap:
                subLayer.ValueMap != ""
                  ? temp + subLayer.ValueMap.slice(index + 4)
                  : "",
              Bounds: subLayer.bound,
            };
            if (!this.pipeListDataAll[this.project]) {
              this.pipeListDataAll[this.project] = [];
            }
            if (!this.pipelineCheckData[this.project]) {
              this.pipelineCheckData[this.project] = [];
            }
            if (!this.pipelineExpandData[this.project]) {
              this.pipelineExpandData[this.project] = [];
            }
          }
          var childrenData = this.getPipelineData(subLayer);
          if (childrenData.length > 0) {
            treeData.push({
              name: subLayer._name,
              id: subLayer.get_guid() + "pipeline",
              children: childrenData,
            });
          }
        }
      }
      return treeData;
    },
    setEarthParams(APIObj) {
      var earth = APIObj.usearth;
      earth.application.pickingEnable = false; // 默认设置关闭左键点击事件

      var date = new Date(STAMP_config.lightTime);
      var direction = StampGis.DirectionalLight.calc_direction(date);
      var light = new StampGis.DirectionalLight({
        direction: direction,
      });
      earth.document.environment._light = light;

      var self = this;

      self.setViewSetting(STAMP_config);
      localStorage.readFromDB(earth, "adjustmen_stage", function (data) {
        if (data) {
          self.setViewSetting(data);
        }
      });

      localStorage.readFromDB(earth, "elementLabel", function (data) {
        if (data) {
          self.$store.state.labelData = JSON.parse(data);
        }
      });
      localStorage.readFromDB(earth, "labelCheckData", function (data) {
        if (data) {
          self.$store.state.labelCheckData = JSON.parse(data);
        }
      });

      self.$store.state.searchItemData = STAMP_config.quickQuerySetting;
      if (STAMP_config.quickQuerySetting.length > 0) {
        self.$store.state.searchItem = STAMP_config.quickQuerySetting[0].name;
      }
      localStorage.readFromDB(earth, "quickQuerySetting", function (data) {
        if (data) {
          STAMP_config.quickQuerySetting = data;

          self.$store.state.searchItemData = STAMP_config.quickQuerySetting;
          if (STAMP_config.quickQuerySetting.length > 0) {
            self.$store.state.searchItem =
              STAMP_config.quickQuerySetting[0].name;
          }
        }
      });
    },
    setViewSetting(temp) {
      this.stampAPI.usearth.view.postProcessStages.fxaa.enabled = temp.fxaa;

      if (temp.viewEnable) {
        if (!this.stage.adjustment_stage) {
          this.stage.adjustment_stage =
            StampGis.PostProcessStageLibrary.createAdjustmentStage();
          this.stampAPI.usearth.view.postProcessStages.add(
            this.stage.adjustment_stage
          );
        }
        this.stage.adjustment_stage.enabled = true;

        this.stage.adjustment_stage.uniforms.properties.brightness_contrast_hue_saturation.red =
          temp.viewSetting.brightness;
        this.stage.adjustment_stage.uniforms.properties.brightness_contrast_hue_saturation.green =
          temp.viewSetting.contrast;
        this.stage.adjustment_stage.uniforms.properties.brightness_contrast_hue_saturation.blue =
          temp.viewSetting.hue;
        this.stage.adjustment_stage.uniforms.properties.brightness_contrast_hue_saturation.alpha =
          temp.viewSetting.saturation;
        this.stage.adjustment_stage.uniforms.properties.gamma =
          temp.viewSetting.gamma;
      } else if (this.stage.adjustment_stage) {
        this.stage.adjustment_stage.enabled = false;
      }
    },
    shortcut_key_down_func() {
      if (!window.key_valid) {
        return;
      }
      if (
        window.event.ctrlKey ||
        window.event.shiftKey ||
        window.event.altKey
      ) {
        return;
      }
      const key = window.event.keyCode;

      var APIObj = this.stampAPI;
      switch (key) {
        case 81: // Q
          APIObj.usearth.GlobeObserver.TurnLeft();
          break;
        case 69: // E
          APIObj.usearth.GlobeObserver.TurnRight();
          break;
        case 90: // Z
          APIObj.usearth.GlobeObserver.TiltUp();
          break;
        case 67: // C
          APIObj.usearth.GlobeObserver.TiltDown();
          break;
        case 83: // S
          APIObj.usearth.GlobeObserver.Stop();
          break;
        case 82: // R
          APIObj.usearth.GlobeObserver.Resume();
          break;
        case 84: // T
          APIObj.usearth.GlobeObserver.TopView();
          break;
        case 71: // G
          APIObj.usearth.GlobeObserver.GlobeView();
          break;
        case 87: // W
          APIObj.usearth.GlobeObserver.Forward();
          break;
        case 65: // A
          APIObj.usearth.GlobeObserver.MoveLeft();
          break;
        case 68: // D
          APIObj.usearth.GlobeObserver.MoveRight();
          break;
        case 88: // X
          APIObj.usearth.GlobeObserver.Backward();
          break;
        case 78: // N
          APIObj.usearth.GlobeObserver.NorthView();
          break;
      }
    },
    getDynamicFile(index, value, dynamiclist) {
      if (index >= value.length) {
        this.changeDynamicList(dynamiclist);
        return;
      }
      var self = this;
      var path = value[index].HTTPLink.replace("db", "http");
      DownloadFileWithoutIp(path + "_sde", "text")
        .then((res) => {
          var d = self.$x2js.xml2js(res.data);
          if (
            d &&
            d.XML &&
            d.XML.ElementLink &&
            d.XML.ElementLink.ComponentList &&
            d.XML.ElementLink.ComponentList.Component
          ) {
            // && d.XML.ElementLink.ComponentList.Component.Link
            var name = d.XML.ElementLink.ComponentList.Component.Link;

            if (
              name == undefined ||
              name.toUpperCase().substring(name.length - 4, name.length) ==
                ".GLB"
            ) {
              var ind = value[index].HTTPLink.lastIndexOf("/");
              if (name == undefined) {
                var dynamicObj = null;
              } else {
                var dynamicObj =
                  value[index].HTTPLink.substring(0, ind) +
                  "/dynamic/" +
                  d.XML.ElementLink.ComponentList.Component.Link;
              }

              dynamiclist.push({
                value: dynamicObj,
                label: value[index]._name,
                type: value[index].DynamicType,
                rot:
                  (d.XML.ElementLink.Offset && d.XML.ElementLink.Offset.Rot) ||
                  null,
              });
              if (name !== undefined) {
                var pose =
                  this.stampAPI.usearth.GlobeObserver.globe_observer.pose;
                var position = pose.position;
                position = StampGis.Cartographic.fromCartesian(position);

                var model = this.stampAPI.usearth.Factory.CreateDynamicModel({
                  name: value[index]._name,
                  longitude: position.longitude,
                  latitude: position.latitude,
                  altitude: 30,
                  url: dynamicObj,
                });

                StampGis.when(model.readyPromise).then(function (model) {
                  model.set_is_visible(false);
                });
                if (dynamicObj) {
                  window.g_DynamicLayer.attach_object(model);
                  this.stampAPI.usearth.document.register_object(model);
                }
              }
            }
          }
          index++;
          this.getDynamicFile(index, value, dynamiclist);
        })
        .catch((_err) => {
          index++;
          this.getDynamicFile(index, value, dynamiclist);
        });
    },
    // 删除管线图层
    getDataExceptPipe(root, pipelineIds) {
      var treeData = [];
      for (var i = 0; i < root.getChildCount(); i++) {
        var subLayer = root.getChildAt(i);
        if (subLayer.getChildCount === undefined) {
          if (!pipelineIds.includes(subLayer.get_guid())) {
            treeData.push({
              name: subLayer._name,
              id: subLayer.get_guid(),
            });
          }
        } else {
          var childrenData = this.getDataExceptPipe(subLayer, pipelineIds);
          if (!pipelineIds.includes(subLayer.get_guid())) {
            treeData.push({
              name: subLayer._name,
              id: subLayer.get_guid(),
              children: childrenData,
            });
          }
        }
      }
      return treeData;
    },
    ...mapActions([
      "changeLayerData",
      "changeCheckData",
      "changeExpandData",
      "changeDynamicList",
      "changePipelineData",
    ]),
  },
  destroyed: function () {
    this.stampAPI.unloadEarth();
  },
};
</script>

<style>
#earthContainer {
  height: 100vh;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.info-div {
  font-family: "Franklin Gothic Medium", "Arial Narrow", Arial, sans-serif;
  z-index: 2;
  position: fixed;
  bottom: 0px;
  color: #ffffff;
  background-color: rgba(86, 76, 76, 0.45);
  transform: translateX(260px);
  font-size: 12px;
}

.info-span + .info-span {
  padding-left: 10px;
}

.info-div-transform {
  transform: translateX(0px);
}

.info-div1 {
  visibility: hidden;
  transform: translateX(50vw);
}
</style>
