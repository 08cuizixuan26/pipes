<template>
  <Popover
    :visible.sync="dialogVisible"
    :show-header="true"
    title="飞行路径"
    custom-class="viewflymodel"
    :beforeClose="handleClose"
  >
    <div class="viewflymodel-container">
      <el-row>
        <el-col :span="24" class="viewflymodel-container-result">设置</el-col>
      </el-row>
      <el-row>
        <el-col :span="8" class="viewflymodel-container-text">
          <div>运动对象:</div>
        </el-col>
        <el-col :span="8">
          <el-select
            v-model="modelUrl"
            :disabled="isSelectDisabled"
            placeholder="请选择"
            size="mini"
            @change="changeDynamic"
          >
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-col>
        <el-col :span="8">
          <el-button
            id="btnSaveObj"
            :disabled="isSaveDisabled"
            type="primary"
            size="mini"
            @click="saveObject"
            >保存对象</el-button
          >
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12" class="flex-center">
          <div class="divBtn">
            <div
              id="btnNew"
              :class="[isNewDisabled ? 'newdis' : 'new', 'btnImg']"
              :disabled="isNewDisabled"
              @click="createRoute"
            />
            <span>新建</span>
          </div>
        </el-col>
        <el-col :span="12" class="flex-center">
          <div class="divBtn">
            <div
              id="btnStationPass"
              :class="[isPassDisabled ? 'passdis' : 'pass', 'btnImg']"
              :disabled="isPassDisabled"
              @click="addPass"
            />
            <span>飞行点</span>
          </div>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-button
            :disabled="isFlyDisabled"
            type="primary"
            size="mini"
            style="width: 80px; margin: 5px"
            @click="startFly"
            >{{ flyButtontext }}</el-button
          >
        </el-col>
        <el-col :span="12">
          <el-button
            :disabled="isAllFlyDisabled"
            type="primary"
            size="mini"
            style="width: 80px; margin: 5px"
            @click="allFly"
            >全部飞行</el-button
          >
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-button
            :disabled="isVideoDisabled"
            type="primary"
            size="mini"
            style="width: 80px; margin: 5px"
            @click="createVideo"
            >{{ videoBtnTxt }}</el-button
          >
        </el-col>
        <el-col :span="12">
          <el-button
            :disabled="isStopDisabled"
            type="primary"
            size="mini"
            style="width: 80px; margin: 5px"
            @click="stop"
            >停止</el-button
          >
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-radio-group
            v-model="obverseType"
            :disabled="isRadioDisabled"
            @change="changeObverse"
          >
            <el-radio :label="1">第一人称</el-radio>
            <el-radio :label="3">第三人称</el-radio>
            <el-radio :label="4">自由跟随</el-radio>
          </el-radio-group>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24" class="checkboxstyle">
          <el-checkbox
            v-model="isShowTrackPath"
            :disabled="isSTPDisabled"
            @change="setTrackPathVisisble"
            >显示轨迹</el-checkbox
          >
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24" class="viewflymodel-container-result">路径</el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-scrollbar wrap-class="scrollbar-wrapper">
            <el-tree
              ref="trackTree"
              :data="treeData"
              :default-expanded-keys="[1]"
              :expand-on-click-node="false"
              :render-content="renderContent"
              node-key="id"
              highlight-current
              class="tree"
              @node-click="onSelectTrackNode"
              @node-contextmenu="rightClick"
            />
          </el-scrollbar>
        </el-col>
      </el-row>
    </div>
    <popover
      :visible.sync="isCreatePopoverShow"
      :title="createTitleName"
      custom-class="popover_1"
    >
      <label>名称:</label>
      <el-input
        v-input-focus
        v-model="newTrackName"
        size="mini"
        placeholder="请输入内容"
        style="width: 170px; margin-left: 8px"
      />
      <div class="btngroup">
        <el-button
          id="confirm"
          type="primary"
          size="mini"
          style="width: 80px; margin: 5px"
          @click="confirmClick"
          >确定</el-button
        >
        <el-button
          id="cancel"
          type="primary"
          size="mini"
          style="width: 80px; margin: 5px"
          @click="cancelClick"
          >取消</el-button
        >
      </div>
    </popover>
    <popover
      :visible.sync="isPassPopoverShow"
      :title="passTitleName"
      custom-class="popover_2"
    >
      <el-form
        ref="passform"
        :model="passForm"
        label-width="50px"
        size="mini"
        class="passform"
      >
        <el-form-item label="名称:">
          <el-input v-input-focus v-model="passForm.name" />
        </el-form-item>
        <el-form-item label="朝向:">
          <el-input v-input-focus v-model="passForm.yaw" />
          <label class="unit">(0°~360°)</label>
        </el-form-item>
        <el-form-item label="俯仰:">
          <el-input v-input-focus v-model="passForm.pitch" />
          <label class="unit">(-90°~90°)</label>
        </el-form-item>
        <el-form-item label="高度:">
          <el-input v-input-focus v-model="passForm.height" />
          <label class="unit">米</label>
        </el-form-item>
        <el-form-item label="速度:">
          <el-input v-input-focus v-model="passForm.speed" />
          <label class="unit">米/秒</label>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="mini" @click="_addPass"
            >确定</el-button
          >
          <el-button type="primary" size="mini" @click="closePassPopover"
            >取消</el-button
          >
        </el-form-item>
      </el-form>
    </popover>
    <rightMenu ref="rightMenu_vfm" />
  </Popover>
</template>

<script>
import Popover from "@/components/Popover";
import rightMenu from "../common/rightMenu";
import localStorage from "@/stamplib/LocalStorage";
import { deepCopy } from "@/utils";
import { mapActions } from "vuex";
export default {
  name: "viewflymodel",
  data() {
    this.transparent = 1;
    this.trackingObjectMap = {}; // 放在外面，减少内存消耗
    this.tracksMap = {};
    this.tracksData = {}; // 存储用
    this.trackLayer = null;
    this.currentTrack = null;
    this.videoRecord = undefined;
    this.videoCurNum = 0;
    this.outVideoRadio = {
      width: 1920,
      height: 1080,
    };
    return {
      dialogVisible: true,
      createTitleName: "名称",
      newTrackName: "",
      isCreatePopoverShow: false,
      isPassPopoverShow: false,
      passTitleName: "飞行点设置",
      passForm: {
        name: "飞行点",
        yaw: 0,
        pitch: 0,
        height: 50,
        speed: 10,
      },
      passPoints: null,
      flyButtontext: "飞行",
      isSelectDisabled: false,
      isSaveDisabled: true, // 控制按钮的禁用状态
      isNewDisabled: false,
      isPassDisabled: true,
      isLookatDisabled: true,
      isSurroundDisabled: true,
      isFlyDisabled: true,
      isAllFlyDisabled: true,
      isVideoDisabled: true,
      isStopDisabled: true,
      isRadioDisabled: true,
      isSTPDisabled: true,
      options: [],
      dynamicName: "",
      modelUrl: "",
      rotOffset: null,
      obverseType: 1,
      isShowTrackPath: true,
      treeData: [
        {
          id: 1,
          label: "漫游路径",
          children: [],
        },
      ],
      rightClickNode: null,
      isAllFly: false,
      isEdit: false, // 记录是否是编辑状态
      videoBtnTxt: "视频",
      videoVisible: false,
      videoRatio: 0,
      videoName: "",
      frameRate: 15,
    };
  },
  components: {
    Popover,
    rightMenu,
  },
  computed: {
    dynamicList() {
      return this.$store.state.dynamicList;
    },
  },
  mounted: function () {
    this.transparent = this.stampAPI.usearth.document.terrain_transparency;
    this.$parent.$refs.bottomTool.closePanel("transparent");
    this.getOptions();
    this.initTrackLayer();
    var self = this;
    var earth = this.stampAPI.usearth;
    localStorage.readFromDB(earth, "track", function (data) {
      for (var key in data) {
        var _data = data[key];
        var track = earth.Factory.CreateTrack({
          name: _data.name,
          visibility: true,
          custom_track_finished: function (_result) {
            for (var item in self.trackingObjectMap) {
              if (self.trackingObjectMap[item].get_guid() === _result.bind_id) {
                self.trackingObjectMap[item].stop();
                self.trackingObjectMap[item].set_is_visible(false);

                var curData = self.$refs.trackTree.getCurrentNode();
                var curNode = self.$refs.trackTree.getNode(curData);
                if (curNode.level == 1) {
                  for (var i = 0; i < curData.children.length; i++) {
                    if (curData.children[i].label === item) {
                      self.$set(curData.children[i], "status", false);
                    }
                  }
                  for (var key in self.tracksMap) {
                    if (self.tracksMap[key].status != 0) {
                      return;
                    }
                  }
                  self.flyButtontext = "飞行";
                  self.isAllFlyDisabled = false;
                  self.isStopDisabled = true;
                } else if (curNode.level === 2 && curData.label === item) {
                  self.flyButtontext = "飞行";
                  self.isFlyDisabled = false;
                  self.isStopDisabled = true;
                  self.isVideoDisabled = false;
                  self.$set(curNode.data, "status", false);
                } else if (
                  curNode.level === 3 &&
                  curNode.parent.data.label === item
                ) {
                  self.flyButtontext = "飞行";
                  self.$set(curNode.parent.data, "status", false);
                }
              }
            }
          },
        });
        var newChild = {
          id: track._id,
          label: _data.name,
          status: false,
          children: [],
        };
        self.$refs.trackTree.append(newChild, 1);
        self.tracksMap[_data.name] = track;
        self.tracksData[_data.name] = _data;
        if (_data.points && _data.points.length > 0) {
          var cartographic = StampGis.Cartographic.fromCartesian(
            _data.points[0]
          );
          var model = earth.Factory.CreateDynamicModel({
            name: _data.modelName,
            longitude: cartographic.longitude,
            latitude: cartographic.latitude,
            altitude: cartographic.height,
            url: _data.url,
          });
          if (_data.rotOffset) {
            var offsetArr = _data.rotOffset.split(",");
            model.rot_offset.x =
              Number(offsetArr[0]) * StampGis.StampMath.RADIANS_PER_DEGREE;
            model.rot_offset.y =
              Number(offsetArr[1]) * StampGis.StampMath.RADIANS_PER_DEGREE;
            model.rot_offset.z =
              Number(offsetArr[2]) * StampGis.StampMath.RADIANS_PER_DEGREE;
          }
          if (_data.url) {
            // StampGis.when(model.readyPromise).then(function(model) {

            // })
            self.trackLayer.attach_object(model);
            self.stampAPI.usearth.document.register_object(model);
          }
          self.trackingObjectMap[_data.name] = model;
          track.bind_object = model;
          var route = earth.Factory.CreateStationRoute({
            name: _data.passInfo.name,
            yaw: Number(_data.passInfo.yaw),
            pitch: Number(_data.passInfo.pitch),
            fly_height: Number(_data.passInfo.height),
            speed: Number(_data.passInfo.speed),
            rate: 0.01,
          });
          track.add_station(route);
          var curData = self.$refs.trackTree.getNode(track._id);
          for (var ni = 0; ni < _data.points.length; ni++) {
            var pass = earth.Factory.CreateStationPass({
              name: "pass" + ni,
              position_geo: _data.points[ni],
              fly_height: Number(_data.passInfo.height),
              speed: Number(_data.passInfo.speed),
            });
            var newChild = {
              id: pass._id,
              label: "pass" + ni,
              position_geo: _data.points[ni],
              info: _data.passInfo,
            };
            self.$refs.trackTree.append(newChild, curData);
            route.add_station(pass);
          }
          track.commit_changes(true);
        }
      }
    });
  },

  methods: {
    getOptions() {
      this.options = [];
      for (var i = 0; i < this.dynamicList.length; i++) {
        // if(this.dynamicList[i].type == "FlyObject"){
        this.options.push({
          value: this.dynamicList[i].value,
          label: this.dynamicList[i].label,
          rot: this.dynamicList[i].rot,
        });
        // }
      }
      if (this.options.length > 0) {
        this.modelUrl = this.options[0].value;
        this.dynamicName = this.options[0].label;
        this.rotOffset = this.options[0].rot;
      }
    },
    renderContent(h, { node, data, store }) {
      var srcStr = "";
      if (node.level == 1 || node.level == 2) {
        if (data.status) {
          srcStr = "images/treeIcons/loading.gif";
        } else {
          srcStr = "images/treeIcons/folder.png";
        }
      } else if (node.level == 3) {
        srcStr = "images/treeIcons/飞行点.png";
      }
      return (
        <span>
          <img class="treeImgSrcClass" src={srcStr} />
          <span>{node.label}</span>
        </span>
      );
    },
    onSelectTrackNode(data, node) {
      if (node.level === 1) {
        // 点漫游路径时
        this.isAllFly = true;
        this.isSelectDisabled = false;
        this.isSaveDisabled = true;
        this.isNewDisabled = false;
        this.isPassDisabled = true;
        this.isLookatDisabled = true;
        this.isSurroundDisabled = true;
        this.isFlyDisabled = true;

        this.isVideoDisabled = true;
        this.isStopDisabled = true;
        this.isRadioDisabled = true;
        this.isSTPDisabled = true;

        var flag = false;
        for (var key in this.tracksMap) {
          const curtrack = this.tracksMap[key];
          if (curtrack.status === 1 || curtrack.status === 2) {
            this.isStopDisabled = false;
          } else {
            flag = true;
          }
        }
        if (flag && node.childNodes.length > 0) {
          this.isAllFlyDisabled = false;
        } else {
          this.isAllFlyDisabled = true;
        }
      } else if (node.level === 2) {
        // 某一个具体路径
        this.isAllFly = false;
        this.isSelectDisabled = false;
        this.isSaveDisabled = true;
        this.isNewDisabled = false;
        this.isPassDisabled = false;
        this.isLookatDisabled = false;
        this.isSurroundDisabled = false;
        this.isAllFlyDisabled = true;

        this.isRadioDisabled = true;
        if (node.childNodes.length == 0) {
          this.isFlyDisabled = true;
          this.isSTPDisabled = true;
        } else {
          this.isFlyDisabled = false;
          this.isSTPDisabled = false;
        }
        this.flyToNode2(node);

        var trackDataTemp = this.tracksData[data.label];
        if (trackDataTemp) {
          this.passPoints = trackDataTemp.points;
        }
        if (trackDataTemp && trackDataTemp.modelName) {
          this.dynamicName = trackDataTemp.modelName;
          this.modelUrl = trackDataTemp.url;
          this.rotOffset = trackDataTemp.rotOffset;
        }
        const curtrack = this.tracksMap[data.label];
        if (curtrack) {
          this.isShowTrackPath = curtrack.get_is_visible();

          if (curtrack.status === 1) {
            this.flyButtontext = "暂停";
          } else if (curtrack.status === 2) {
            this.flyButtontext = "继续";
          } else {
            this.flyButtontext = "飞行";
          }
        }

        if (this.flyButtontext != "飞行") {
          this.isStopDisabled = false;
          this.isVideoDisabled = true;
        } else {
          this.isStopDisabled = true;
          this.isVideoDisabled = false;
        }
      } else if (node.level === 3) {
        // 飞行点
        this.isAllFly = false;
        this.isSelectDisabled = false;
        this.isSaveDisabled = true;
        this.isNewDisabled = false;
        this.isPassDisabled = true;
        this.isLookatDisabled = true;
        this.isSurroundDisabled = true;
        this.isFlyDisabled = true;
        this.isAllFlyDisabled = true;
        this.isVideoDisabled = true;
        this.isStopDisabled = true;
        this.isRadioDisabled = true;
        this.isSTPDisabled = true;
        this.flyToNode3(node);
      }
    },
    flyToNode2(node) {
      if (node.childNodes[0]) {
        var data = node.childNodes[0].data;
        var jwd = StampGis.Cartographic.fromCartesian(data.position_geo);
        var pos = StampGis.Cartesian3.fromRadians(
          jwd.longitude,
          jwd.latitude,
          1000
        );
        this.stampAPI.usearth.application.observer.flyTo({
          destination: pos,
          orientation: {
            heading: StampGis.StampMath.toRadians(0),
            pitch: StampGis.StampMath.toRadians(-90),
            roll: 0.0,
          },
        });
      }
    },
    flyToNode3(node) {
      var data = node.data;
      var jwd = StampGis.Cartographic.fromCartesian(data.position_geo);
      var pos = StampGis.Cartesian3.fromRadians(
        jwd.longitude,
        jwd.latitude,
        1000
      );
      this.stampAPI.usearth.application.observer.flyTo({
        destination: pos,
        orientation: {
          heading: StampGis.StampMath.toRadians(0),
          pitch: StampGis.StampMath.toRadians(-90),
          roll: 0.0,
        },
      });
    },
    changeDynamic(value) {
      for (var i = 0; i < this.options.length; i++) {
        if (this.options[i].value == value) {
          this.dynamicName = this.options[i].label;
          this.rotOffset = this.options[i].rot;
        }
      }
      var tree = this.$refs.trackTree;
      var node = tree.getNode(tree.getCurrentKey());
      if (node.level == 2) {
        this.isSaveDisabled = false;
      }
    },
    // 新建路径
    createRoute() {
      if (this.isNewDisabled) {
        return;
      }
      this.isCreatePopoverShow = true;
    },
    cancelClick() {
      this.isCreatePopoverShow = false;
      this.isEdit = false;
    },
    initTrackLayer() {
      this.trackLayer = window.g_DynamicLayer;
    },
    confirmClick() {
      if (this.newTrackName.trim() == "") {
        this.$message({
          message: "路径名称不能为空",
          type: "warning",
        });
        return;
      }
      for (var i = 0; i < this.treeData[0].children.length; i++) {
        var item = this.treeData[0].children[i];
        if (item.label == this.newTrackName) {
          this.$message({
            message: "路径名称已存在",
            type: "warning",
          });
          return;
        }
      }
      this.isCreatePopoverShow = false;
      if (this.isEdit) {
        if (this.rightClickNode.label != this.newTrackName) {
          var thisTrack = this.tracksMap[this.rightClickNode.label];
          delete this.tracksMap[this.rightClickNode.label];
          thisTrack.name = this.newTrackName;
          this.tracksMap[this.newTrackName] = thisTrack;
          this.tracksData[this.newTrackName] = deepCopy(
            this.tracksData[this.rightClickNode.label]
          );
          delete this.tracksData[this.rightClickNode.label];
          this.tracksData[this.newTrackName].name = this.newTrackName;
          localStorage.saveToDB(
            this.stampAPI.usearth,
            "track",
            this.tracksData
          );
          for (var i = 0; i < this.treeData[0].children.length; i++) {
            var item = this.treeData[0].children[i];
            if (item.id == this.rightClickNode.data.id) {
              item.label = this.newTrackName;
            }
          }
        }
        this.newTrackName = ""; // 置空防止再次新建name为上一次的值
        this.isEdit = false;
      } else {
        // 创建路径
        var self = this;
        var track = this.stampAPI.usearth.Factory.CreateTrack({
          name: this.newTrackName,
          visibility: true,
          custom_track_finished: function (_result) {
            for (var item in self.trackingObjectMap) {
              if (self.trackingObjectMap[item].get_guid() === _result.bind_id) {
                self.trackingObjectMap[item].stop();
                self.trackingObjectMap[item].set_is_visible(false);

                var curData = self.$refs.trackTree.getCurrentNode();
                var curNode = self.$refs.trackTree.getNode(curData);
                if (curNode.level == 1) {
                  for (var i = 0; i < curData.children.length; i++) {
                    if (curData.children[i].label === item) {
                      self.$set(curData.children[i], "status", false);
                    }
                  }
                  for (var key in self.tracksMap) {
                    if (self.tracksMap[key].status != 0) {
                      return;
                    }
                  }
                  self.flyButtontext = "飞行";
                  self.isAllFlyDisabled = false;
                  self.isStopDisabled = true;
                } else if (curNode.level === 2 && curData.label === item) {
                  self.flyButtontext = "飞行";
                  self.isFlyDisabled = false;
                  self.isStopDisabled = true;
                  self.isVideoDisabled = false;
                  self.$set(curNode.data, "status", false);
                } else if (
                  curNode.level === 3 &&
                  curNode.parent.data.label === item
                ) {
                  self.flyButtontext = "飞行";
                  self.$set(curNode.parent.data, "status", false);
                }
              }
            }
          },
        });
        var newChild = {
          id: track._id,
          label: this.newTrackName,
          status: false,
          children: [],
        };
        this.$refs.trackTree.append(newChild, 1);
        this.tracksMap[this.newTrackName] = track;
        this.tracksData[this.newTrackName] = {
          name: this.newTrackName,
        };
        localStorage.saveToDB(this.stampAPI.usearth, "track", this.tracksData);
        this.newTrackName = ""; // 置空防止再次新建name为上一次的值
      }
    },
    // 飞行点
    addPass() {
      if (this.isPassDisabled) {
        return;
      }
      this.passForm = {
        name: "飞行点",
        yaw: 0,
        pitch: 0,
        height: 50,
        speed: 10,
      }; // 重置值为默认
      var that = this;
      var curData = this.$refs.trackTree.getCurrentNode();
      var curNode = this.$refs.trackTree.getNode(curData);
      if (curNode.data.children.length >= 3) {
        this.stampAPI.usearth.ShapeCreator.CreateCurve({
          custom_excute_finish: function (result) {
            that.stampAPI.usearth.ShapeCreator.Clear();
            if (result.data != undefined && result.data.length >= 1) {
              that.isPassPopoverShow = true;
              that.passPoints = result.data;
            }
          },
        });
      } else {
        this.stampAPI.usearth.ShapeCreator.CreateCurve({
          custom_excute_finish: function (result) {
            that.stampAPI.usearth.ShapeCreator.Clear();
            if (result.data != undefined && result.data.length >= 3) {
              that.isPassPopoverShow = true;
              that.passPoints = result.data;
            } else {
              that.$message({
                message: "路径点不能少于3个",
                type: "warning",
              });
            }
          },
        });
      }
    },
    closePassPopover() {
      this.isPassPopoverShow = false;
      this.isEdit = false;
    },
    checkFormChanged() {
      var flag = true;
      var obj1 = this.rightClickNode.data.info;
      var obj2 = this.passForm;
      for (var key in obj2) {
        if (obj1[key] == obj2[key]) {
          flag = true;
        } else {
          return false;
        }
      }
      return flag; // true表格没变，false变了
    },
    _addPass() {
      this.isPassPopoverShow = false;
      if (this.isEdit) {
        if (!this.checkFormChanged()) {
          var curData = this.$refs.trackTree.getCurrentNode();
          var curNode = this.$refs.trackTree.getNode(curData);

          for (var i = 0; i < this.treeData[0].children.length; i++) {
            var item = this.treeData[0].children[i];
            if (item.id == this.rightClickNode.parent.data.id) {
              for (var j = 0; j < item.children.length; j++) {
                var _item = item.children[j];
                if (_item.id == this.rightClickNode.data.id) {
                  _item.info = this.passForm;
                }
              }
            }
          }
        }
        this.isEdit = false;
      } else {
        var curData = this.$refs.trackTree.getCurrentNode();
        var curNode = this.$refs.trackTree.getNode(curData);
        var thisTrack = this.tracksMap[curData.label];
        var curRoute = thisTrack.station_array[0];
        if (curNode.data.children.length >= 3) {
          // 有问题
          for (var ni = 0; ni < this.passPoints.length; ni++) {
            var pass = this.stampAPI.usearth.Factory.CreateStationPass({
              name: "pass" + curNode.data.children.length,
              position_geo: this.passPoints[ni],
              fly_height: Number(this.passForm.height),
              speed: Number(this.passForm.speed),
            });
            var newChild = {
              id: pass._id,
              label: "pass" + curNode.data.children.length,
              position_geo: this.passPoints[ni],
              info: this.passForm,
            };
            this.$refs.trackTree.append(newChild, curData);
            curRoute.add_station(pass);

            this.tracksData[curData.label].points.push(this.passPoints[ni]);
          }
          thisTrack.commit_changes(true);
          localStorage.saveToDB(
            this.stampAPI.usearth,
            "track",
            this.tracksData
          );
          return;
        }
        // 因为创建模型需要绑定初始坐标，所以放这里
        var cartographic = StampGis.Cartographic.fromCartesian(
          this.passPoints[0]
        );
        var model = this.stampAPI.usearth.Factory.CreateDynamicModel({
          name: this.dynamicName,
          longitude: cartographic.longitude,
          latitude: cartographic.latitude,
          altitude: cartographic.height,
          url: this.modelUrl,
        });

        if (this.rotOffset) {
          var offsetArr = this.rotOffset.split(",");
          model.rot_offset.x =
            Number(offsetArr[0]) * StampGis.StampMath.RADIANS_PER_DEGREE;
          model.rot_offset.y =
            Number(offsetArr[1]) * StampGis.StampMath.RADIANS_PER_DEGREE;
          model.rot_offset.z =
            Number(offsetArr[2]) * StampGis.StampMath.RADIANS_PER_DEGREE;
        }

        var route = this.stampAPI.usearth.Factory.CreateStationRoute({
          name: this.passForm.name,
          yaw: Number(this.passForm.yaw),
          pitch: Number(this.passForm.pitch),
          fly_height: Number(this.passForm.height),
          speed: Number(this.passForm.speed),
          rate: 0.01,
        });
        // 创建树节点加入树中
        thisTrack.add_station(route);
        this.tracksData[curData.label].passInfo = this.passForm;
        this.tracksData[curData.label].points = this.passPoints;

        for (var ni = 0; ni < this.passPoints.length; ni++) {
          var pass = this.stampAPI.usearth.Factory.CreateStationPass({
            name: "pass" + ni,
            position_geo: this.passPoints[ni],
            fly_height: Number(this.passForm.height),
            speed: Number(this.passForm.speed),
          });
          var newChild = {
            id: pass._id,
            label: "pass" + ni,
            position_geo: this.passPoints[ni],
            info: this.passForm,
          };
          this.$refs.trackTree.append(newChild, curData);
          route.add_station(pass);
        }
        thisTrack.commit_changes(true);
        var self = this;
        if (this.modelUrl) {
          // 有模型时需要attach到球上，无模型时不需要attach到球上
          // StampGis.when(model.readyPromise).then(function(model) {

          // })
          this.trackLayer.attach_object(model);
          this.stampAPI.usearth.document.register_object(model);
        }

        self.trackingObjectMap[curData.label] = model;
        self.tracksData[curData.label].url = self.modelUrl;
        self.tracksData[curData.label].modelName = self.dynamicName;
        self.tracksData[curData.label].rotOffset = self.rotOffset;
        thisTrack.bind_object = model;

        localStorage.saveToDB(self.stampAPI.usearth, "track", self.tracksData);
        self.isVideoDisabled = false;
        self.isFlyDisabled = false;
        self.isSTPDisabled = false;
        self.isEdit = false;
      }
    },
    saveObject() {
      this.isSaveDisabled = true;
      var curData = this.$refs.trackTree.getCurrentNode();
      var curtrack = this.tracksMap[curData.label];
      var oldModel = this.trackingObjectMap[curData.label];
      this.trackLayer.detach_object(oldModel);

      var model = this.stampAPI.usearth.Factory.CreateDynamicModel({
        name: this.dynamicName,
        longitude: this.passPoints[0].x,
        latitude: this.passPoints[0].y,
        altitude: this.passPoints[0].z,
        url: this.modelUrl,
      });
      if (this.rotOffset) {
        var offsetArr = this.rotOffset.split(",");
        model.rot_offset.x =
          Number(offsetArr[0]) * StampGis.StampMath.RADIANS_PER_DEGREE;
        model.rot_offset.y =
          Number(offsetArr[1]) * StampGis.StampMath.RADIANS_PER_DEGREE;
        model.rot_offset.z =
          Number(offsetArr[2]) * StampGis.StampMath.RADIANS_PER_DEGREE;
      }
      if (this.modelUrl) {
        this.trackLayer.attach_object(model);
        this.stampAPI.usearth.document.register_object(model);
      }

      this.trackingObjectMap[curData.label] = model;
      this.tracksData[curData.label].url = this.modelUrl;
      this.tracksData[curData.label].modelName = this.dynamicName;
      this.tracksData[curData.label].rotOffset = this.rotOffset;
      curtrack.bind_object = model;
      localStorage.saveToDB(this.stampAPI.usearth, "track", this.tracksData);
    },
    // 飞行按钮点击事件
    startFly() {
      var curData = this.$refs.trackTree.getCurrentNode();
      var curNode = this.$refs.trackTree.getNode(curData);
      var curtrack = this.tracksMap[curData.label];
      var curModel = this.trackingObjectMap[curData.label];
      if (curModel) {
        curModel.set_is_visible(true);
      }

      if (this.flyButtontext === "飞行") {
        this.$set(curNode.data, "status", true);
        this.stampAPI.usearth.TrackControl.SetMainTrack(
          curtrack.get_guid(),
          this.obverseType
        );
        curtrack.bind_object = curModel;
        curtrack.play(true);
        if (curModel) {
          curModel.playAll(true);
          StampGis.when(curModel.readyPromise).then(function (model) {
            model.playAll(true);
          });
        }

        this.currentTrack = curtrack;
        this.isSelectDisabled = true;
        this.isSaveDisabled = true;
        this.isNewDisabled = true;
        this.isPassDisabled = true;
        this.isLookatDisabled = true;
        this.isSurroundDisabled = true;
        this.isFlyDisabled = false;
        this.isAllFlyDisabled = true;
        this.isVideoDisabled = true;
        this.isStopDisabled = false;
        this.isRadioDisabled = false;
        this.isSTPDisabled = false;
        this.flyButtontext = "暂停";
      } else if (this.flyButtontext === "暂停") {
        curtrack.pause();
        curModel && curModel.pause();
        this.flyButtontext = "继续";
        this.isRadioDisabled = true;
      } else if (this.flyButtontext === "继续") {
        curtrack.resume();
        curModel && curModel.resume();
        this.flyButtontext = "暂停";
        this.isRadioDisabled = false;
      }
    },
    allFly() {
      this.isAllFlyDisabled = true;
      this.isStopDisabled = false;
      var trackNodes = this.$refs.trackTree.getCurrentNode().children;
      for (var i = 0; i < trackNodes.length; i++) {
        var curtrack = this.tracksMap[trackNodes[i].label];
        var curModel = this.trackingObjectMap[trackNodes[i].label];
        curModel.set_is_visible(true);
        if (curtrack.status == 0) {
          this.stampAPI.usearth.TrackControl.SetMainTrack(
            curtrack.get_guid(),
            3
          );
          curtrack.bind_object = curModel;
          curtrack.play(true);
          curModel && curModel.playAll(true);
        } else if (curtrack.status == 2) {
          curtrack.resume();
          curModel && curModel.resume();
        }
        this.$set(trackNodes[i], "status", true);
      }
      this.flyButtontext = "暂停";
    },
    stop() {
      if (!this.isVideoDisabled && this.isFlyDisabled) {
        this.videoRecord.end_capture();
        this.videoBtnTxt = "视频";
        this.videoRatio = 0;
        this.frameRate = 15;
        this.videoName = "";
        this.isStopDisabled = true;
        return;
      }
      if (this.isAllFly) {
        for (var key in this.tracksMap) {
          this.tracksMap[key].stop();
        }
        var trackNodes = this.$refs.trackTree.getCurrentNode().children;
        for (var i = 0; i < trackNodes.length; i++) {
          this.$set(trackNodes[i], "status", false);
        }
        this.isAllFlyDisabled = false;
        this.isFlyDisabled = true;
        this.flyButtontext = "飞行";
        this.isStopDisabled = true;
      } else {
        var curData = this.$refs.trackTree.getCurrentNode();
        var curNode = this.$refs.trackTree.getNode(curData);
        var curtrack = this.tracksMap[curData.label];
        curtrack.stop();
        this.currentTrack = null;
        this.$set(curNode.data, "status", false);
        this.flyButtontext = "飞行";
        this.isSelectDisabled = false;
        this.isSaveDisabled = true;
        this.isNewDisabled = false;
        this.isPassDisabled = false;
        this.isLookatDisabled = false;
        this.isSurroundDisabled = false;
        this.isAllFlyDisabled = true;
        this.isStopDisabled = true;
        this.isRadioDisabled = true;
        this.isVideoDisabled = false;
        this.isFlyDisabled = false;
        this.isSTPDisabled = false;
      }
    },
    changeObverse(type) {
      var curData = this.$refs.trackTree.getCurrentNode();
      var curtrack = this.tracksMap[curData.label];
      this.stampAPI.usearth.TrackControl.SetMainTrack(
        curtrack.get_guid(),
        type
      );
    },
    setTrackPathVisisble(value) {
      var curData = this.$refs.trackTree.getCurrentNode();
      var curtrack = this.tracksMap[curData.label];
      curtrack.set_is_visible(value);
      for (var i = 0; i < curtrack.station_array.length; i++) {
        var tempStation = curtrack.station_array[i];
        for (var j = 0; j < tempStation.station_array.length; j++) {
          var sta = tempStation.station_array[j];
          sta.set_is_visible(value);
        }
        tempStation.set_is_visible(value);
      }
    },
    createVideo() {
      const earth = this.stampAPI.usearth;
      if (!this.videoRecord) {
        this.videoRecord = new StampGis.VideoRecord(earth.application);
      }
      if (this.videoBtnTxt == "视频" && !this.videoVisible) {
        this.videoVisible = true;
        return;
      } else if (this.videoBtnTxt == "视频" && this.videoVisible) {
        this.isFlyDisabled = true;
        this.videoVisible = false;
        this.videoBtnTxt = "暂停";
        this.isStopDisabled = false;
        this.videoCurNum = 0;
        var curData = this.$refs.trackTree.getCurrentNode();
        earth.application.frameState.always_calculate_matrix = true;
        this.videoRecord.begin_capture(
          this.tracksMap[curData.label] || undefined,
          this.videoName || "stamp",
          { width: 1920, height: 1080 },
          this.frameRate || 15,
          this.videoCallBack,
          5000
        );
      } else if (this.videoBtnTxt == "暂停") {
        this.videoBtnTxt = "继续";
      } else if (this.videoBtnTxt == "继续") {
        this.videoBtnTxt = "暂停";
        this.videoCallBack();
      }
    },
    videoCallBack() {
      const earth = this.stampAPI.usearth;
      const self = this;
      if (this.videoBtnTxt == "继续") {
        return;
      }

      // 在这里处理暂停
      self.videoCurNum++;

      if (self.videoCurNum <= self.videoRecord._frame_count) {
        var interval = 2000;
        var capture = function () {
          var last_time =
            earth.application._downloader._mission_heap._lastest_time;
          var new_time = earth.application.frameState.lastSystemTime;
          var diff = new_time - last_time;
          var download_count =
            earth.application._downloader._mission_heap._missions.size();
          if (download_count > 0 || diff < 1000) {
            setTimeout(capture, interval);
          } else {
            self.videoRecord.capture_frame(
              self.videoCurNum / self.videoRecord._frame_count
            );
          }
        };

        setTimeout(capture, interval);
      } else {
        self.videoRecord.end_capture();
        earth.application.frameState.always_calculate_matrix = false;
      }
    },
    videoConfirmClick() {
      if (this.videoRatio == 0) {
        this.outVideoRadio = { width: 1920, height: 1080 };
      } else if (this.videoRatio == 1) {
        this.outVideoRadio = { width: 1280, height: 720 };
      }
      this.createVideo();
      this.videoVisible = false;
    },
    rightClick(event, object, node) {
      this.rightClickNode = node;
      const self = this;
      var e = event;
      var level = node.level;
      if (level == 1) {
        self.$refs.rightMenu_vfm.show({
          x: e.pageX,
          y: e.pageY,
          data: [
            {
              label: "导入",
              iconClass: "el-icon-document-add",
              hiddenClass: "",
              callback: function () {
                self.importData();
              },
            },
            {
              label: "导出",
              iconClass: "el-icon-document-remove",
              hiddenClass: "",
              callback: function () {
                self.exportData();
              },
            },
          ],
        });
      } else if (level == 3 && node.parent.childNodes.length <= 3) {
        self.$refs.rightMenu_vfm.show({
          x: e.pageX,
          y: e.pageY,
          data: [
            {
              label: "属性",
              iconClass: "el-icon-edit",
              hiddenClass: "",
              callback: function () {
                self.showProperty();
              },
            },
          ],
        });
      } else {
        self.$refs.rightMenu_vfm.show({
          x: e.pageX,
          y: e.pageY,
          data: [
            {
              label: "属性",
              iconClass: "el-icon-edit",
              hiddenClass: "",
              callback: function (node) {
                self.showProperty();
              },
            },
            {
              label: "删除",
              iconClass: "el-icon-delete",
              hiddenClass: "",
              callback: function () {
                self.deleteNode();
              },
            },
          ],
        });
      }
    },
    selectFileClick() {
      const earth = this.stampAPI.usearth;
      var self = this;
      var fileInput = self.$refs["selectFile"];
      if (!fileInput || fileInput.files.length <= 0) {
        return;
      }
      var file = fileInput.files[0];
      var name = file.name;
      localStorage.readFileToText(file, function (fileinfo) {
        if (fileinfo) {
          self.treeData[0].children = [];
          for (var key in self.tracksMap) {
            self.tracksMap[key].Suicide();
          }
          for (var item in self.trackingObjectMap) {
            self.trackLayer.detach_object(self.trackingObjectMap[item]);
          }
          self.tracksMap = {};
          self.trackingObjectMap = {}; // 放在外面，减少内存消耗
          self.tracksData = {};

          var d = self.$x2js.xml2js(fileinfo.data);
          if (d && d.xml && d.xml.track) {
            var data = d.xml.track;
            Array.isArray(data) || (data = [data]);
            for (var i = 0; i < data.length; i++) {
              var _data = data[i];
              var track = earth.Factory.CreateTrack({
                name: _data._name,
                visibility: true,
                custom_track_finished: function (_result) {
                  for (var item in self.trackingObjectMap) {
                    if (
                      self.trackingObjectMap[item].get_guid() ===
                      _result.bind_id
                    ) {
                      self.trackingObjectMap[item].stop();
                      self.trackingObjectMap[item].set_is_visible(false);

                      var curData = self.$refs.trackTree.getCurrentNode();
                      var curNode = self.$refs.trackTree.getNode(curData);
                      if (curNode.level == 1) {
                        for (var i = 0; i < curData.children.length; i++) {
                          if (curData.children[i].label === item) {
                            self.$set(curData.children[i], "status", false);
                          }
                        }
                        for (var key in self.tracksMap) {
                          if (self.tracksMap[key].status != 0) {
                            return;
                          }
                        }
                        self.flyButtontext = "飞行";
                        self.isAllFlyDisabled = false;
                        self.isStopDisabled = true;
                      } else if (
                        curNode.level === 2 &&
                        curData.label === item
                      ) {
                        self.flyButtontext = "飞行";
                        self.isFlyDisabled = false;
                        self.isStopDisabled = true;
                        self.isVideoDisabled = false;
                        self.$set(curNode.data, "status", false);
                      } else if (
                        curNode.level === 3 &&
                        curNode.parent.data.label === item
                      ) {
                        self.flyButtontext = "飞行";
                        self.$set(curNode.parent.data, "status", false);
                      }
                    }
                  }
                },
              });
              var newChild = {
                id: track._id,
                label: _data.name,
                status: false,
                children: [],
              };
              self.$refs.trackTree.append(newChild, 1);
              self.tracksMap[_data.name] = track;
              self.tracksData[_data.name] = _data;
              if (_data.points && _data.points.length > 0) {
                var cartographic = StampGis.Cartographic.fromCartesian(
                  _data.points[0]
                );
                var model = null;
                model = earth.Factory.CreateDynamicModel({
                  name: _data.modelName,
                  longitude: cartographic.longitude,
                  latitude: cartographic.latitude,
                  altitude: cartographic.height,
                  url: _data.url,
                });
                if (_data.rotOffset) {
                  var offsetArr = _data.rotOffset.split(",");
                  model.rot_offset.x =
                    Number(offsetArr[0]) *
                    StampGis.StampMath.RADIANS_PER_DEGREE;
                  model.rot_offset.y =
                    Number(offsetArr[1]) *
                    StampGis.StampMath.RADIANS_PER_DEGREE;
                  model.rot_offset.z =
                    Number(offsetArr[2]) *
                    StampGis.StampMath.RADIANS_PER_DEGREE;
                }
                if (_data.url) {
                  self.trackLayer.attach_object(model);
                  self.stampAPI.usearth.document.register_object(model);
                }

                self.trackingObjectMap[_data.name] = model;
                track.bind_object = model;
                var route = earth.Factory.CreateStationRoute({
                  name: _data.passInfo.name,
                  yaw: Number(_data.passInfo.yaw),
                  pitch: Number(_data.passInfo.pitch),
                  fly_height: Number(_data.passInfo.height),
                  speed: Number(_data.passInfo.speed),
                  rate: 0.01,
                });
                track.add_station(route);
                var curData = self.$refs.trackTree.getNode(track._id);
                for (var ni = 0; ni < _data.points.length; ni++) {
                  var tempPoint = new StampGis.Cartesian3(
                    Number(_data.points[ni].x),
                    Number(_data.points[ni].y),
                    Number(_data.points[ni].z)
                  );
                  self.tracksData[_data.name].points[ni] = tempPoint;
                  var pass = earth.Factory.CreateStationPass({
                    name: "pass" + ni,
                    position_geo: tempPoint,
                    fly_height: Number(_data.passInfo.height),
                    speed: Number(_data.passInfo.speed),
                  });
                  const newChild = {
                    id: pass._id,
                    label: "pass" + ni,
                    position_geo: _data.points[ni],
                    info: _data.passInfo,
                  };
                  self.$refs.trackTree.append(newChild, curData);
                  route.add_station(pass);
                }
                track.commit_changes(true);
              }
            }

            localStorage.saveToDB(
              self.stampAPI.usearth,
              "track",
              self.tracksData
            );
          } else {
            self.$message({
              message: "文件内容错误，请重新选择",
              type: "error",
            });
          }
        }
      });
    },
    importData() {
      this.$refs["selectFile"].click();
    },
    exportData() {
      var str = "<xml>";
      for (var key in this.tracksData) {
        var item = this.tracksData[key];
        str += "<track key='" + key + "'>";
        str += "<modelName>" + item.modelName + "</modelName>";
        str += "<rotOffset>" + item.rotOffset + "</rotOffset>";
        str += "<name>" + item.name + "</name>";
        str += "<passInfo><height>" + item.passInfo.height + "</height>";
        str += "<name>" + item.passInfo.name + "</name>";
        str += "<pitch>" + item.passInfo.pitch + "</pitch>";
        str += "<speed>" + item.passInfo.speed + "</speed>";
        str += "<yaw>" + item.passInfo.yaw + "</yaw></passInfo>";
        for (var j = 0; j < item.points.length; j++) {
          var point = item.points[j];
          str += "<points>";
          str += "<x>" + point.x + "</x>";
          str += "<y>" + point.y + "</y>";
          str += "<z>" + point.z + "</z>";
          str += "</points>";
        }
        str += "<url>" + item.url + "</url>";
        str += "</track>";
      }
      str += "</xml>";

      const url = window.URL.createObjectURL(new Blob([str]));
      const link = document.createElement("a");
      const fname = "trackList.xml";
      link.href = url;
      link.setAttribute("download", fname);
      document.body.appendChild(link);
      link.click();
    },
    showProperty() {
      if (this.rightClickNode.level == 2) {
        this.isCreatePopoverShow = true;
        this.newTrackName = this.rightClickNode.label;
      } else {
        this.isPassPopoverShow = true;
        this.passForm = Object.assign({}, this.rightClickNode.data.info);
      }
      this.isEdit = true;
    },
    deleteNode() {
      if (this.rightClickNode.level == 3) {
        this.$confirm("是否删除该节点?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(() => {
            var trackName = this.rightClickNode.parent.label;
            var curtrack = this.tracksMap[trackName];
            var station = curtrack.get_station(this.rightClickNode.key);
            curtrack.remove_station(station);
            curtrack.commit_changes(true);
            for (var i = 0; i < this.tracksData[trackName].points.length; i++) {
              var item = this.tracksData[trackName].points[i];
              if (item.x == this.rightClickNode.data.position_geo.x) {
                this.tracksData[trackName].points.splice(i, 1);
              }
            }
            localStorage.saveToDB(
              this.stampAPI.usearth,
              "track",
              this.tracksData
            );
            this.$refs.trackTree.remove(this.rightClickNode);
            this.$message({
              type: "success",
              message: "删除成功!",
            });
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "已取消删除",
            });
          });
      } else {
        this.$confirm("是否删除该路径?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(() => {
            var trackName = this.rightClickNode.label;
            var curtrack = this.tracksMap[trackName];
            curtrack.Suicide();
            delete this.tracksMap[trackName];
            delete this.tracksData[trackName];
            localStorage.saveToDB(
              this.stampAPI.usearth,
              "track",
              this.tracksData
            );
            this.$refs.trackTree.remove(this.rightClickNode);
            this.$message({
              type: "success",
              message: "删除成功!",
            });
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "已取消删除",
            });
          });
      }
    },
    handleClose() {
      this.$router.push("/");
    },
    ...mapActions(["changeDialogVisible"]),
  },
  beforeRouteLeave(to, from, next) {
    next();
    for (var key in this.tracksMap) {
      if (this.tracksMap[key].status != 0) {
        this.tracksMap[key].stop();
      }
      this.tracksMap[key].Suicide();
    }
    for (var item in this.trackingObjectMap) {
      this.trackLayer.detach_object(this.trackingObjectMap[item]);
    }
    this.tracksMap = {};
    this.$parent.$refs.functionPanel.curSelMenu.name = "";
    if (this.stampAPI.usearth.document.terrain_transparency == 1) {
      this.stampAPI.usearth.document.terrain_transparency = this.transparent;
    }
  },
};
</script>

<style lang="less" scoped>
.viewflymodel {
  width: 300px;
}

.el-row {
  margin-bottom: 5px;

  &:last-child {
    margin-bottom: 0px;
  }
}

.viewflymodel-container {
  height: 550px;
  font-size: 16px;

  .viewflymodel-container-text {
    height: 30px;
    line-height: 30px;
  }

  .viewflymodel-container-result {
    height: 30px;
    line-height: 30px;
    font-weight: 700;
    text-align: left;
    padding-left: 10px;
  }

  .viewflymodel-container-table {
    margin-bottom: 0px;
  }

  .viewflymodel-container-pagination {
    margin-bottom: 0px;
  }
}

.setting {
  padding: 14px 5px;
  font-size: 12px;
}

.divBtn {
  font-size: 14px;
  width: 50px;
  text-align: center;
  cursor: pointer;
}

.btnImg {
  width: 40px;
  height: 40px;
  margin: 5px;
}

.new {
  background: url("../../images/view/新建按钮-按下.png");
  background-size: 100% 100%;
}

.newdis {
  background: url("../../images/view/新建按钮.png");
  background-size: 100% 100%;
}

.pass {
  background: url("../../images/view/飞行点按钮-按下.png");
  background-size: 100% 100%;
}

.passdis {
  background: url("../../images/view/飞行点按钮.png");
  background-size: 100% 100%;
}

.lookat {
  background: url("../../images/track/lookat.png");
}

.lookatdis {
  background: url("../../images/track/lookatbreak.png");
}

.surround {
  background: url("../../images/track/surround.png");
}

.surrounddis {
  background: url("../../images/track/surroundbreak.png");
}

.flex-center {
  display: flex;
  justify-content: center;
  align-self: center;
}

.btngroup {
  text-align: center;
  margin-top: 10px;
}

.checkboxstyle {
  text-align: right;
  padding-right: 5px;
}

/deep/ .el-dialog.popover_1 {
  left: 400px;
  top: 200px;
  width: 250px;
}
/deep/ .el-dialog.popover_2 {
  left: 550px;
  top: 200px;
  width: 300px;
  color: white;
}
.passform {
  width: 250px;
  height: 400px;
}

.scrollbar-wrapper {
  overflow-x: hidden !important;
}

.el-scrollbar {
  height: 250px;
}

/deep/ .el-radio {
  margin-right: 10px;
}
</style>
