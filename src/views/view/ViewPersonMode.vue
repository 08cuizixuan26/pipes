<template>
  <Popover
    :visible.sync="dialogVisible"
    :show-header="true"
    title="场景漫游"
    custom-class="viewflymodel"
    :beforeClose="handleClose"
  >
    <div class="viewPersonMode">
      <el-row>
        <label>运动对象:</label>
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
          ></el-option>
        </el-select>
      </el-row>
      <el-row type="flex" justify="center">
        <!-- <el-button type="primary">室内</el-button> -->
        <el-button
          type="primary"
          @click="startView"
          :disabled="!viewModeDisabled"
          >开始</el-button
        >
        <el-button type="primary" :disabled="noStartRoamed" @click="stopRoaming"
          >退出</el-button
        >
      </el-row>
      <el-row type="flex" justify="center">
        <el-radio v-model="angleView" label="1" :disabled="viewModeDisabled"
          >第一人称</el-radio
        >
        <el-radio v-model="angleView" label="2" :disabled="viewModeDisabled"
          >第三人称</el-radio
        >
      </el-row>
      <hr />
      <div class="direction">
        <div>
          <span>朝向</span>
        </div>
        <div>
          <el-radio v-model="direction" label="180" :disabled="viewModeDisabled"
            >前方</el-radio
          >
          <el-radio v-model="direction" label="0" :disabled="viewModeDisabled"
            >后方</el-radio
          >
        </div>
        <div>
          <el-radio v-model="direction" label="90" :disabled="viewModeDisabled"
            >左方</el-radio
          >
          <el-radio v-model="direction" label="-90" :disabled="viewModeDisabled"
            >右方</el-radio
          >
        </div>
      </div>
      <el-row>
        <el-col :span="24">
          <div class="title-name">操作提示</div>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <span>W :</span>
          <span>前进</span>
        </el-col>
        <el-col :span="12">
          <span>S :</span>
          <span>后退</span>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <span>A :</span>
          <span>左转</span>
        </el-col>
        <el-col :span="12">
          <span>D :</span>
          <span>右转</span>
        </el-col>
      </el-row>
    </div>
  </Popover>
</template>

<script>
import Popover from "@/components/Popover";
export default {
  name: "viewPersonMode",
  data() {
    this.$trackLayer = null;
    this.$trackingObj = null;
    this.rotOffset = null;
    this.isAnimation = false;
    this.dynamicName = "";
    return {
      options: [],
      modelUrl: "",
      angleView: "1",
      direction: "180",
      isSelectDisabled: false,
      noStartRoamed: true,
      viewModeDisabled: true,
      dialogVisible: true,
    };
  },
  components: {
    Popover,
  },
  computed: {
    dynamicList() {
      return this.$store.state.dynamicList;
    },
  },
  methods: {
    handleClose() {
      this.$router.push("/");
    },
    getOptions() {
      this.options = this.dynamicList.filter((item) => {
        return item.type != "FlyObject";
      });
      if (this.options.length > 0) {
        this.modelUrl = this.options[0].value;
        this.dynamicName = this.options[0].label;
        this.rotOffset = this.options[0].rot;
      }
    },
    changeDynamic(value) {
      for (var i = 0; i < this.options.length; i++) {
        if (this.options[i].value == value) {
          this.dynamicName = this.options[i].label;
          this.rotOffset = this.options[i].rot;
        }
      }
    },
    initTrackLayer() {
      const earth = this.stampAPI.usearth;
      this.$trackLayer = window.g_DynamicLayer;
    },
    startView() {
      const earth = this.stampAPI.usearth;
      earth.ShapeCreator.CreatePoint({
        custom_excute_finish: (result) => {
          debugger;
          if (result.data != undefined) {
            let cartographic = StampGis.Cartographic.fromCartesian(result.data);
            let model = earth.Factory.CreateDynamicModel({
              name: this.dynamicName,
              longitude: cartographic.longitude,
              latitude: cartographic.latitude,
              altitude: cartographic.height,
              heading: earth.application.observer.heading,
              tilt: StampGis.StampMath.toRadians(0),
              roll: StampGis.StampMath.toRadians(0),
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
            StampGis.when(model.readyPromise).then((model) => {
              earth.application.observer.flyTo({
                destination: StampGis.Cartesian3.fromRadians(
                  cartographic.longitude,
                  cartographic.latitude,
                  cartographic.height + 2
                ),
                orientation: {
                  heading: earth.application.observer.heading,
                  pitch: StampGis.StampMath.toRadians(0),
                  roll: StampGis.StampMath.toRadians(0),
                },
              });
            });
            this.viewModeDisabled = false;
            if (this.$trackingObj) {
              this.$trackLayer.detach_object(this.$trackingObj);
              this.$trackingObj = null;
            }
            this.$trackLayer.attach_object(model);
            earth.document.register_object(model);
            this.$trackingObj = model;

            this.isSelectDisabled = true;
            this.noStartRoamed = false;
            earth.application.roaming_control.start_globe_tracking(
              this.$trackingObj.get_guid(),
              +this.angleView
            );
          }

          earth.ShapeCreator.Clear();
        },
      });
    },
    stopRoaming() {
      this.angleView = "1";
      this.viewModeDisabled = true;
      if (this.$trackingObj) {
        this.$trackLayer.detach_object(this.$trackingObj);
        this.$trackingObj = null;
      }
      this.noStartRoamed = true;
      this.isSelectDisabled = false;
      this.stampAPI.usearth.application.roaming_control.stop_tracking();
    },
  },
  watch: {
    angleView(val) {
      if (this.$trackingObj) {
        this.stampAPI.usearth.application.roaming_control.start_globe_tracking(
          this.$trackingObj.get_guid(),
          +this.angleView
        );
      }
    },
    direction(val) {
      this.stampAPI.usearth.application.roaming_control.stop_tracking();
      this.stampAPI.usearth.application.roaming_control.set_third_person_track_param(
        +val,
        0
      );
      this.stampAPI.usearth.application.roaming_control.start_globe_tracking(
        this.$trackingObj.get_guid(),
        +this.angleView
      );
    },
  },
  mounted() {
    this.$trackingObj = null;
    this.getOptions();
    this.initTrackLayer();
    if (window.onkeydown) {
      this.$keyDown = window.onkeydown;
    }
    if (window.onkeyup) {
      this.$keyUp = window.onkeyup;
    }
    const earth = this.stampAPI.usearth;
    window.onkeydown = (event) => {
      if (this.angleView != 0) {
        if (event.shiftKey && event.which === 87) {
          earth.application.roaming_control.set_velocity(0.0, 0.0, 20);
          if (!this.isAnimation) {
            this.isAnimation = true;
            this.$trackingObj && this.$trackingObj.playAll(true);
          }
        } else {
          switch (event.keyCode) {
            case 87:
              earth.application.roaming_control.set_velocity(0.0, 0.0, 10);
              if (!this.isAnimation) {
                this.isAnimation = true;
                this.$trackingObj && this.$trackingObj.playAll(true);
              }
              break;
            case 65:
              earth.application.roaming_control.set_rotation_velocity(-60);
              if (!this.isAnimation) {
                this.isAnimation = true;
                this.$trackingObj && this.$trackingObj.playAll(true);
              }
              break;
            case 68:
              earth.application.roaming_control.set_rotation_velocity(60);
              if (!this.isAnimation) {
                this.isAnimation = true;
                this.$trackingObj && this.$trackingObj.playAll(true);
              }
              break;
            case 83:
              earth.application.roaming_control.set_velocity(0.0, 0.0, -10);
              if (!this.isAnimation) {
                this.isAnimation = true;
                this.$trackingObj && this.$trackingObj.playAll(true);
              }
              break;
          }
        }
      }
    };
    window.onkeyup = (event) => {
      if (this.angleView != 0) {
        this.stampAPI.usearth.application.roaming_control.set_velocity(
          0.0,
          0.0,
          0.0
        );
        this.stampAPI.usearth.application.roaming_control.set_rotation_velocity(
          0.0
        );
        if (this.isAnimation) {
          this.isAnimation = false;
          this.$trackingObj && this.$trackingObj.stop();
        }
      }
    };
  },
  beforeDestroy() {
    const earth = this.stampAPI.usearth;
    if (this.$trackingObj) {
      this.$trackLayer.detach_object(this.$trackingObj);
      this.$trackingObj = null;
    }
    this.stampAPI.usearth.application.roaming_control.stop_tracking();
    window.onkeydown = this.$keyDown;
    window.onkeyup = this.$keyUp;
  },
};
</script>

<style lang="less" scoped>
.viewflymodel {
  width: 300px;
}
.viewPersonMode {
  color: #ffffff;
  .el-select {
    width: 150px;
    padding: 0 4px;
    margin-left: 8px;
    display: inline-block;
  }
  .el-row {
    padding-bottom: 16px;
  }
  .el-radio {
    color: #ffffff;
  }
  hr {
    width: 90%;
  }
  .direction > div {
    margin-bottom: 10px;
    span {
      font-weight: 700;
    }
  }
  .title-name {
    line-height: 36px;
    padding-left: 13px;
    font-size: 14px;
    font-weight: 700;
    text-align: left;
  }
}
</style>