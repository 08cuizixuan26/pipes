<template>
  <Popover
    :visible.sync="dialogVisible"
    :show-header="true"
    title="视点管理"
    custom-class="viewpointmanagement"
    :beforeClose="handleClose"
  >
    <div class="viewpointmanagement-container">
      <el-row>
        <el-col :span="24" class="viewpointmanagement-container-result">
          设置
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <div class="setting">
            <el-row type="flex" justify="center">
              <el-col :span="5">
                <div class="divBtn">
                  <div
                    class="new btnImg"
                    id="btnNew"
                    :disabled="isNewDisabled"
                    @click="handleNew"
                  ></div>
                  <span :class="[isNewDisabled ? 'fontStyleDis' : 'fontStyle']"
                    >新建</span
                  >
                </div>
              </el-col>
              <el-col :span="5">
                <div class="divBtn">
                  <div
                    class="view btnImg"
                    id="btnView"
                    :disabled="isViewDisabled"
                    @click="handleView"
                  ></div>
                  <span
                    :class="[isViewDisabled ? 'fontStyleDis' : 'fontStyle']"
                    >{{ viewText }}</span
                  >
                </div>
              </el-col>
              <el-col :span="5">
                <div class="divBtn">
                  <div
                    class="import btnImg"
                    id="btnImport"
                    :disabled="isImportDisabled"
                    @click="handleImport"
                  ></div>
                  <span
                    :class="[isImportDisabled ? 'fontStyleDis' : 'fontStyle']"
                    >导入</span
                  >
                </div>
              </el-col>
              <el-col :span="5">
                <div class="divBtn">
                  <div
                    class="export btnImg"
                    id="btnExport"
                    :disabled="isExportDisabled"
                    @click="handleExport"
                  ></div>
                  <span
                    :class="[isExportDisabled ? 'fontStyleDis' : 'fontStyle']"
                    >导出</span
                  >
                </div>
              </el-col>
              <input
                ref="importFile"
                style="display: none"
                name="file"
                type="file"
                accept=".xml"
                @change="selectImportFile"
              />
            </el-row>
          </div>
        </el-col>
      </el-row>
      <hr />
      <el-row>
        <div :class="[isViewStatus ? 'divStyleNone' : 'divStyle']">
          <el-table
            :height="tableHeight"
            size="mini"
            :data="tableData"
            style="width: 99%"
            @row-contextmenu="handleContextMenu"
            @row-dblclick="handleRowDbclick"
          >
            <el-table-column prop="label" label="名称" width="120">
            </el-table-column>
            <el-table-column prop="des" label="描述"> </el-table-column>
          </el-table>
        </div>
        <div
          :class="[isViewStatus ? 'divStyle' : 'divStyleNone', 'tabContainer']"
        >
          <el-scrollbar wrap-class="tab-scrollbar-wrapper">
            <div class="itemDiv">
              <div
                v-for="val in tableData"
                :key="val.label"
                :class="[{ imageSelected: curActive == val.label }, 'imgDiv']"
                @click.prevent="startDraw(val)"
                @contextmenu.prevent="rightClick(val)"
              >
                <div>
                  <el-image :src="val.img" fit="fit" class="img"></el-image>
                </div>
                <span style="margin-top: 5px">{{ val.label }}</span>
              </div>
            </div>
          </el-scrollbar>
        </div>
      </el-row>
      <setName ref="setName"></setName>
      <rightMenu ref="rightMenu" />
    </div>
  </Popover>
</template>

<script>
import setName from "./components/setNameDialog";
import LocalStorage from "@/stamplib/LocalStorage";
import location from "@/stamplib/Location";
import rightMenu from "../common/rightMenu";
import $ from "jquery";
import { createGuid } from "@/utils";
import Popover from "@/components/Popover";
export default {
  name: "ViewPointManagement",
  data() {
    return {
      dialogVisible: true,
      isNewDisabled: false,
      isViewDisabled: false,
      isImportDisabled: false,
      isExportDisabled: false,
      isViewStatus: false,
      viewText: "视图",
      tableData: [],
      tableHeight: (420 / 1920) * window.innerWidth,
      curActive: "",
    };
  },
  components: {
    Popover,
    setName,
    rightMenu,
  },
  methods: {
    startDraw(active) {
      this.curActive = active.label;
      location.FlyTo(
        this.stampAPI.usearth,
        active.pose.longitude,
        active.pose.latitude,
        active.pose.height,
        active.pose.heading,
        active.pose.tilt,
        active.pose.roll
      );
    },
    rightClick(active) {
      this.curActive = active.label;
      var self = this;
      self.$refs.rightMenu.show({
        x: event.pageX,
        y: event.pageY,
        width: self.$el.clientWidth,
        height: self.$el.clientHeight,
        data: [
          {
            label: "编辑",
            iconClass: "el-icon-edit",
            hiddenClass: "",
            callback: function (node) {
              self.$refs.setName.show({
                title: "编辑视点",
                list: self.tableData,
                name: active.label,
                des: active.des,
                callbackOK: function (name, des) {
                  for (var i = self.tableData.length - 1; i >= 0; i--) {
                    if (self.tableData[i].guid === active.guid) {
                      self.tableData[i].label = name;
                      self.tableData[i].des = des;
                      break;
                    }
                  }
                  LocalStorage.saveToDB(
                    self.stampAPI.usearth,
                    "viewPointList",
                    self.tableData
                  );
                },
              });
            },
          },
          {
            label: "删除",
            iconClass: "el-icon-delete",
            hiddenClass: "",
            callback: function () {
              for (var i = self.tableData.length - 1; i >= 0; i--) {
                if (self.tableData[i].guid === active.guid) {
                  self.tableData.splice(i, 1);
                  break;
                }
              }
              LocalStorage.saveToDB(
                self.stampAPI.usearth,
                "viewPointList",
                self.tableData
              );
            },
          },
        ],
      });
    },
    handleNew() {
      var self = this;
      this.$refs.setName.show({
        title: "新建视点",
        list: self.tableData,
        callbackOK: function (name, des) {
          var pose = self.stampAPI.usearth.GlobeObserver.globe_observer.pose;
          var position = pose.position;
          position = StampGis.Cartographic.fromCartesian(position);
          var longitude = StampGis.StampMath.toDegrees(position.longitude);
          var latitude = StampGis.StampMath.toDegrees(position.latitude);

          var heading = pose.heading * StampGis.StampMath.DEGREES_PER_RADIAN;
          var tilt = pose.tilt * StampGis.StampMath.DEGREES_PER_RADIAN;

          var screenshot = new StampGis.ScreenShot();
          var i = document.createElement("canvas");
          i.width = this.stampAPI.usearth.application.canvas.clientWidth;
          i.height = this.stampAPI.usearth.application.canvas.clientHeight;
          screenshot.screen_shot_without_save(
            i,
            this.stampAPI.usearth.application
          );
          var strDataURI = i.toDataURL("image/png");

          var guid = createGuid();
          self.tableData.push({
            guid: guid,
            label: name,
            des: des,
            img: strDataURI,
            pose: {
              longitude: longitude,
              latitude: latitude,
              height: position.height,
              heading: heading,
              tilt: tilt,
              roll: pose.roll,
            },
          });

          LocalStorage.saveToDB(
            self.stampAPI.usearth,
            "viewPointList",
            self.tableData
          );
        },
      });
    },
    handleView() {
      if (this.isViewStatus) {
        this.viewText = "视图";
        this.isViewStatus = false;
      } else {
        this.viewText = "列表";
        this.isViewStatus = true;
      }
    },
    handleContextMenu(row, column, event) {
      var self = this;
      self.$refs.rightMenu.show({
        x: event.pageX,
        y: event.pageY,
        width: self.$el.clientWidth,
        height: self.$el.clientHeight,
        data: [
          {
            label: "编辑",
            iconClass: "el-icon-edit",
            hiddenClass: "",
            callback: function (node) {
              self.$refs.setName.show({
                title: "编辑视点",
                list: self.tableData,
                name: row.label,
                des: row.des,
                callbackOK: function (name, des) {
                  for (var i = self.tableData.length - 1; i >= 0; i--) {
                    if (self.tableData[i].guid === row.guid) {
                      self.tableData[i].label = name;
                      self.tableData[i].des = des;
                      break;
                    }
                  }
                  LocalStorage.saveToDB(
                    self.stampAPI.usearth,
                    "viewPointList",
                    self.tableData
                  );
                },
              });
            },
          },
          {
            label: "删除",
            iconClass: "el-icon-delete",
            hiddenClass: "",
            callback: function () {
              for (var i = self.tableData.length - 1; i >= 0; i--) {
                if (self.tableData[i].guid === row.guid) {
                  self.tableData.splice(i, 1);
                  break;
                }
              }
              LocalStorage.saveToDB(
                self.stampAPI.usearth,
                "viewPointList",
                self.tableData
              );
            },
          },
        ],
      });
    },
    handleRowDbclick(row, column, event) {
      location.FlyTo(
        this.stampAPI.usearth,
        row.pose.longitude,
        row.pose.latitude,
        row.pose.height,
        row.pose.heading,
        row.pose.tilt,
        row.pose.roll
      );
    },
    selectImportFile() {
      var self = this;
      var fileInput = self.$refs["importFile"];
      if (!fileInput || fileInput.files.length <= 0) {
        return;
      }
      var file = fileInput.files[0];
      var name = file.name;
      LocalStorage.readFileToText(file, function (fileinfo) {
        if (fileinfo) {
          var d = self.$x2js.xml2js(fileinfo.data);
          if (d && d.xml && d.xml.ViewList && d.xml.ViewList.ViewPoint) {
            self.tableData = [];
            var viewArr = d.xml.ViewList.ViewPoint;
            if (Object.prototype.toString.call(viewArr) === "[object Object]") {
              var arr = [];
              arr.push(viewArr);
              viewArr = arr;
            }
            for (var i = 0; i < viewArr.length; i++) {
              self.tableData.push({
                guid: viewArr[i].ID,
                label: viewArr[i].Name,
                des: viewArr[i].Description,
                img: viewArr[i].Image,
                pose: {
                  longitude: parseFloat(viewArr[i].Longitude),
                  latitude: parseFloat(viewArr[i].Latitude),
                  height: parseFloat(viewArr[i].Height),
                  heading: parseFloat(viewArr[i].Heading),
                  tilt: parseFloat(viewArr[i].Tilt),
                  roll: StampGis.StampMath.toRadians(
                    parseFloat(viewArr[i].Roll)
                  ),
                },
              });
            }
          } else {
            self.$message({
              message: "文件内容错误，请重新选择",
              type: "error",
            });
          }
        }
      });
    },
    handleImport() {
      this.$refs["importFile"].click();
    },
    handleExport() {
      var xmlString = "<xml><ViewList>";
      for (var i = 0; i < this.tableData.length; i++) {
        xmlString += "<ViewPoint>";
        xmlString += "<ID>" + this.tableData[i].guid + "</ID>";
        xmlString += "<Name>" + this.tableData[i].label + "</Name>";
        xmlString +=
          "<Longitude>" + this.tableData[i].pose.longitude + "</Longitude>";
        xmlString +=
          "<Latitude>" + this.tableData[i].pose.latitude + "</Latitude>";
        xmlString += "<Height>" + this.tableData[i].pose.height + "</Height>";
        xmlString +=
          "<Heading>" + this.tableData[i].pose.heading + "</Heading>";
        xmlString += "<Tilt>" + this.tableData[i].pose.tilt + "</Tilt>";
        xmlString +=
          "<Roll>" +
          this.tableData[i].pose.roll * StampGis.StampMath.DEGREES_PER_RADIAN +
          "</Roll>";
        xmlString += "<Image>" + this.tableData[i].img + "</Image>";
        xmlString += "<Description>" + this.tableData[i].des + "</Description>";
        xmlString += "</ViewPoint>";
      }
      xmlString += "</ViewList></xml>";

      const url = window.URL.createObjectURL(new Blob([xmlString]));
      const link = document.createElement("a");
      let fname = "ViewPointList.xml";
      link.href = url;
      link.setAttribute("download", fname);
      document.body.appendChild(link);
      link.click();
    },
    handleClose() {
      this.$router.push("/");
    },
  },
  mounted() {
    $(".tabContainer").height(window.innerHeight - 300);
    this.$refs.rightMenu.close({});
    var self = this;
    self.tableData = [];
    LocalStorage.readFromDB(
      self.stampAPI.usearth,
      "viewPointList",
      function (data) {
        if (data) {
          self.tableData = data;
        }
      }
    );
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
  beforeRouteLeave(to, from, next) {
    this.$parent.$refs.functionPanel.curSelMenu.name = "";
    next();
  },
};
</script>

<style lang="less" scoped>
.viewpointmanagement {
  width: 300px;
}

.el-row {
  margin-bottom: 5px;

  &:last-child {
    margin-bottom: 0px;
  }
}

.viewpointmanagement-container {
  height: 550px;
  font-size: 16px;

  .viewpointmanagement-container-text {
    height: 30px;
    line-height: 30px;
  }

  .viewpointmanagement-container-result {
    height: 30px;
    line-height: 30px;
    font-weight: 700;
    text-align: left;
    padding-left: 10px;
  }
}

.setting {
  padding: 14px 5px;
  font-size: 12px;
}

.divBtn {
  width: 45px;
  text-align: center;
  cursor: pointer;
}

.btnImg {
  width: 34px;
  height: 32px;
  margin: 5px;
}

.new {
  background: url("../../images/view/新建.png") no-repeat;
  background-size: 100% 100%;
}

.new:hover {
  background: url("../../images/view/新建.png") no-repeat;
  background-size: 100% 100%;
}

.view {
  background: url("../../images/view/视图.png") no-repeat;
  background-size: 100% 100%;
}

.view:hover {
  background: url("../../images/view/视图.png") no-repeat;
  background-size: 100% 100%;
}

.import {
  background: url("../../images/view/导入.png") no-repeat;
  background-size: 100% 100%;
}

.import:hover {
  background: url("../../images/view/导入.png") no-repeat;
  background-size: 100% 100%;
}

.export {
  background: url("../../images/view/导出.png") no-repeat;
  background-size: 100% 100%;
}
.export:hover {
  background: url("../../images/view/导出.png") no-repeat;
  background-size: 100% 100%;
}

.fontStyle {
  color: white;
}

.fontStyleDis {
  color: grey;
}

.divStyle {
  display: block;
}

.divStyleNone {
  display: none;
}

.tabContainer {
  .tab-scrollbar-wrapper {
    overflow-x: hidden !important;
  }

  .el-scrollbar__bar.is-vertical {
    right: 0px;
  }

  .el-scrollbar {
    height: 100%;
  }

  /deep/ .el-scrollbar__wrap {
    height: calc(100% + 8px);
  }

  .is-horizontal {
    display: none;
  }
}

.imageSelected {
  background-color: rgba(1, 76, 91, 0.6);
}

.itemDiv {
  display: flex;
  //justify-content: center;
  flex-direction: row;
  flex-wrap: wrap;
  height: 420px;
  overflow-y: auto;

  .imgDiv {
    height: 100px;
    width: 50%;
    padding: 20px;
    display: inline-block;
    box-sizing: border-box;

    .img {
      width: 92px;
      height: 62px;
    }
  }

  span {
    color: #ffffff;
    display: block;
    font-size: 10px;
    font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB",
      "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
  }
}

.el-table {
  background-color: transparent;

  /deep/ tr {
    background-color: transparent;
    color: #ffffff;

    &:hover td {
      background-color: transparent;
    }
  }

  /deep/ th {
    background-color: transparent;
  }

  /deep/ thead {
    color: #ffffff;
    text-align: center;
  }
}
</style>
