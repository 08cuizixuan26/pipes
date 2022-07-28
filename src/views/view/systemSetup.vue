<template>
  <popover
    :visible.sync="viewSettingShow"
    :show-header="true"
    :before-close="handleClose"
    :title="titleName"
    custom-class="layerPanel"
  >
    <el-form
      ref="form"
      :model="data"
      style="margin-right: 20px; text-align: left"
    >
      <el-form-item label="当前工程：" :label-width="labelWidth">
        <el-select
          class="inputClass"
          v-model="data.curProject"
          size="small"
          placeholder="请选择"
          @change="handleSelectChange()"
        >
          <el-option
            v-for="item in selectOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="初始视点：" :label-width="labelWidth">
        <el-input v-model="inputViewPoint" class="inputClass"></el-input>
        <el-button
          @click="handleGetViewPointClick"
          size="mini"
          class="unit viewBtn"
          ><i class="el-icon-view"></i
        ></el-button>
      </el-form-item>
      <el-form-item label="管线高亮时长：" :label-width="labelWidth">
        <el-input-number
          v-model="data.highLightTime"
          :controls="false"
          :precision="0"
          class="inputClass"
        ></el-input-number>
        <label class="unit">秒</label>
      </el-form-item>
      <el-form-item label="管线闪烁时间：" :label-width="labelWidth">
        <el-input-number
          v-model="data.highlight_interval_time"
          class="inputClass"
          :controls="false"
          :precision="1"
        ></el-input-number>
        <label class="unit">/秒</label>
      </el-form-item>
      <el-form-item label="管线颜色选择：" :label-width="labelWidth">
        <el-input v-model="data.highLightColor" class="inputClass"></el-input>
        <el-color-picker
          v-model="data.highLightColor"
          size="mini"
          class="unit"
        ></el-color-picker>
      </el-form-item>
    </el-form>
    <div class="footer">
      <el-button type="primary" size="mini" @click="handleSaveClick"
        ><span>保存</span>
      </el-button>
      <el-button
        type="primary"
        size="mini"
        class="btnQueryClass"
        @click="handleSettingClick"
        ><span>快速查询配置</span>
      </el-button>
    </div>
    <setting-query ref="settingQuery"></setting-query>
  </popover>
</template>

<script>
import { mapActions } from "vuex";
import popover from "@/components/Popover";
import localStorage from "@/stamplib/LocalStorage";
import { deepCopy } from "@/utils";
import SettingQuery from "./components/settingQuery.vue";
import {
  postDataQuery,
  getFiledCfgXml,
  getNameNoIgnoreCase,
} from "@/api/query";
import location from "@/stamplib/Location";
export default {
  data() {
    this.curProject = null;
    return {
      titleName: "系统设置",
      viewSettingShow: true,
      inputViewPoint: "", //输入框的视点字符串
      // selectValue: "",
      selectOptions: [],
      data: {
        curProject: STAMP_config.pipeline.curProject,
        location: [],
        highLightTime: 10,
        highlight_interval_time: 1,
        highLightColor: "#ff2323",
      },
      labelWidth: (120 / 1920) * window.innerWidth + "px",
    };
  },
  computed: {
    pipelineLayers() {
      return this.$store.state.pipelineLayers;
    },
    projectInfo() {
      return this.$store.state.projectInfo;
    },
    pipeListDataAll() {
      return this.$store.state.pipeListDataAll;
    },
  },
  components: {
    popover,
    SettingQuery,
  },
  mounted() {
    var self = this;
    var earth = this.stampAPI.usearth;

    this.selectOptions = [];
    for (var key in this.pipelineLayers) {
      this.selectOptions.push({
        label: this.pipelineLayers[key].name,
        value: this.pipelineLayers[key].name,
      });
    }

    localStorage.readFromDB(earth, "systemSetup", function (data) {
      if (data) {
        self.data = data;
        self.data.highLightTime = data.highLightTime / 1000;
        self.data.highLightColor = "#" + data.highLightColor.substr(0, 6);
      } else {
        // "0524AF99",
        self.data.highLightTime = STAMP_config.highLightTime / 1000;
        self.data.highlight_interval_time =
          STAMP_config.highlight_interval_time;
        self.data.highLightColor =
          "#" + STAMP_config.highLightColor.substr(0, 6);
      }
    });
  },
  methods: {
    handleSelectChange() {
      this.data.selectGeologyLayer = null;
    },
    handleGetViewPointClick() {
      let pose = this.stampAPI.usearth.GlobeObserver.globe_observer.pose;
      let position = pose.position;
      position = StampGis.Cartographic.fromCartesian(position);
      let longitude = StampGis.StampMath.toDegrees(position.longitude);
      let latitude = StampGis.StampMath.toDegrees(position.latitude);

      let heading = pose.heading * StampGis.StampMath.DEGREES_PER_RADIAN;
      let tilt = pose.tilt * StampGis.StampMath.DEGREES_PER_RADIAN;

      this.inputViewPoint =
        longitude +
        "," +
        latitude +
        "," +
        position.height +
        "," +
        heading +
        "," +
        tilt +
        "," +
        pose.roll;
      if (this.inputViewPoint.trim() != "") {
        let arr = this.inputViewPoint.trim().split(",");
        if (arr.length == 6) {
          for (var item in arr) {
            var num = Number(arr[item]);
            if (!isNaN(num)) {
              arr[item] = num;
            } else {
              this.$message({
                message: "初始视点格式错误！",
                type: "error",
              });
              return;
            }
          }
          this.data.location = arr;
        } else {
          this.$message({
            message: "初始视点格式错误！",
            type: "error",
          });
          return;
        }
      }
    },
    handleClose() {
      this.$router.push("/");
    },
    // 取消
    handleBackClick() {
      this.handleClose();
    },
    // 保存
    handleSaveClick() {
      var self = this;
      if (self.data.highLightTime === "") {
        self.$message({
          message: "管线高亮时长不能为空",
          type: "warning",
          center: true,
        });
        return;
      }
      if (self.data.highlight_interval_time === "") {
        self.$message({
          message: "管线闪烁时间不能为空",
          type: "warning",
          center: true,
        });
        return;
      }
      var dataDB = deepCopy(self.data);
      //颜色值拼接
      var str = self.data.highLightColor.slice(
        1,
        self.data.highLightColor.length
      );
      str += 99;
      dataDB.highLightColor = str; //把颜拼接好的色值重新付给dataDB这个对象,然后再保存起来
      dataDB.highLightTime = self.data.highLightTime * 1000;
      StampGis.SystemEnvironment.highlight_continue_time = dataDB.highLightTime;
      StampGis.SystemEnvironment.highlight_interval_time =
        dataDB.highlight_interval_time;
      StampGis.SystemEnvironment.highlight_color = parseInt(
        dataDB.highLightColor,
        16
      ); // '0xc8ffd699';
      localStorage.saveToDB(
        self.stampAPI.usearth,
        "systemSetup",
        dataDB,
        function () {
          for (let i = 0; i < self.pipelineLayers.length; i++) {
            if (dataDB.location) {
              STAMP_config.pipeline.location = dataDB.location;
            }

            if (dataDB.curProject == self.pipelineLayers[i].name) {
              self.changePipelineData([self.pipelineLayers[i]]);
              self.curProject = self.pipelineLayers[i].id.replace(
                "pipeline",
                ""
              );

              self.checkData = [];

              var layerData = self.getLayerData(
                self.stampAPI.usearth.document.rootFolder,
                false
              );

              self.changeLayerData(layerData);
              self.changeCheckData(self.checkData);

              self.getPipeProjectInfo();

              self.getAreaTable().then(() => {
                self.initSearchItemData();
              });
              break;
            }
          }
          self.$message({
            message: "保存成功",
            type: "success",
            center: true,
          });
        }
      );
      self.handleClose();
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
    getPipeProjectInfo() {
      var self = this;
      if (self.curProject) {
        // this.$store.state.pipelineCheckData =
        //     this.pipelineCheckData[this.curProject];
        this.$store.state.pipelineExpandData = self.curProject + "pipeline";

        self.g_Project.project = self.curProject;

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

        self.$store.state.pipelineCheckData = [];
        self.g_Project.pipeListData.map((item) => {
          var layer = self.stampAPI.usearth.LayerManager.GetLayerByGUID(
            item.guid
          );
          if (!item.src) {
            layer.container.GetBlockLayerTextures(function (res) {
              item.src = res[0];
            });
          }
          if (layer.get_is_visible()) {
            self.$store.state.pipelineCheckData.push(layer.get_guid());
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
          if (
            subLayer.container ||
            subLayer.well ||
            subLayer.plate ||
            subLayer.joint ||
            subLayer.equipment ||
            subLayer.room ||
            subLayer.equipment_og ||
            subLayer.joint_og ||
            subLayer.container_og
          ) {
            if (flag) {
              continue;
            }

            treeData.push({
              name: subLayer._name,
              id: subLayer.get_guid(),
              children: [],
            });
            treeData[treeData.length - 1].children.push({
              name: "管线",
              id: subLayer.container._id,
              parentId: subLayer.get_guid(),
            });
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
      if (this.$store.state.areaTable.indexOf("road") != -1) {
        this.updateFuncDisable("road");
      }
      if (this.$store.state.areaTable.indexOf("canton") != -1) {
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
    handleSettingClick() {
      this.$refs.settingQuery.show();
    },
    ...mapActions(["changeLayerData", "changeCheckData", "changePipelineData"]),
  },
  beforeRouteLeave(to, from, next) {
    this.stampAPI.usearth.ShapeCreator.Clear();
    this.$parent.$refs.functionPanel.curSelMenu.name = "";
    next();
  },
};
</script>

<style lang="less" scoped>
.layerPanel {
  width: 360px;
  text-align: left;
}

/deep/.el-form-item .el-color-picker {
  margin-right: 4px;
  top: 9px;
  left: 0;
}
.unit {
  margin-left: 8px;
}

/deep/ .el-input-number.is-without-controls .el-input__inner {
  text-align: left;
}
.viewBtn {
  width: 30px;
}
.btnQueryClass {
  width: 110px;
}
.inputClass {
  width: 160px;
}
</style>