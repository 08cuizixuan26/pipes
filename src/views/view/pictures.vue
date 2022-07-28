<template>
  <Popover
    :visible.sync="dialogVisible"
    :show-header="true"
    title="2.5D出图"
    custom-class="pictures"
    :beforeClose="handleClose"
  >
    <div class="pictures-container">
      <el-row>
        <el-col :span="24">
          <el-form :label-width="labelWidth" size="small">
            <el-form-item label="相机朝向：">
              <el-input
                v-model="inputHeading"
                :disabled="isDisabled"
                size="mini"
                class="picker-input"
                v-input-focus
                v-only-number="{
                  max: 360,
                  min: 0,
                  precision: 2,
                }"
              ></el-input>
              <span style="color: white; margin-left: 10px">度</span>
            </el-form-item>
            <el-form-item label="相机俯仰：">
              <el-input
                v-model="inputTilt"
                :disabled="isDisabled"
                size="small"
                class="picker-input"
                v-input-focus
                v-only-number="{
                  max: 90,
                  min: -90,
                  precision: 2,
                }"
              ></el-input>
              <span style="color: white; margin-left: 10px">度</span>
            </el-form-item>
            <el-form-item label="相机距离：">
              <el-input
                v-model="inputRange"
                :disabled="isDisabled"
                size="small"
                class="picker-input"
                v-input-focus
                v-only-number="{
                  max: 999999,
                  min: 0,
                  precision: 2,
                }"
              ></el-input>
              <span style="color: white; margin-left: 10px">米</span>
            </el-form-item>
            <el-form-item label="经度范围：">
              <el-input
                v-model="inputLon1"
                :disabled="isDisabled"
                size="small"
                class="picker-input"
                v-input-focus
                v-only-number="{
                  max: 180,
                  min: -180,
                  precision: 2,
                }"
              ></el-input>
              <span style="color: white; margin-left: 10px">度</span>
            </el-form-item>
            <el-form-item label="至">
              <el-input
                v-model="inputLon2"
                :disabled="isDisabled"
                size="small"
                class="picker-input"
                v-input-focus
                v-only-number="{
                  max: 180,
                  min: -180,
                  precision: 2,
                }"
              ></el-input>
              <span style="color: white; margin-left: 10px">度</span>
            </el-form-item>
            <el-form-item label="纬度范围：">
              <el-input
                v-model="inputAlt1"
                :disabled="isDisabled"
                size="small"
                class="picker-input"
                v-input-focus
                v-only-number="{
                  max: 90,
                  min: -90,
                  precision: 2,
                }"
              ></el-input>
              <span style="color: white; margin-left: 10px">度</span>
            </el-form-item>
            <el-form-item label="至">
              <el-input
                v-model="inputAlt2"
                :disabled="isDisabled"
                size="small"
                class="picker-input"
                v-input-focus
                v-only-number="{
                  max: 90,
                  min: -90,
                  precision: 2,
                }"
              ></el-input>
              <span style="color: white; margin-left: 10px">度</span>
            </el-form-item>
            <el-form-item label="出图进度：">
              <span style="color: white">{{ outputProcess }}</span>
            </el-form-item>
            <div class="btnDiv">
              <el-button
                type="primary"
                size="mini"
                :disabled="isDisabled"
                @click="handleGetCameraPoseClick"
                ><span>获取姿态</span></el-button
              >
              <el-button
                type="primary"
                size="mini"
                :disabled="isDisabled"
                @click="handleSelectAreaClick"
                ><span>选择范围</span></el-button
              >
            </div>
            <div class="btnDiv" style="margin-top: 10px">
              <el-button
                type="primary"
                size="mini"
                :disabled="isConfirmDisabled"
                @click="handleStartClick"
                ><span>{{ btnText }}</span></el-button
              >
              <el-button
                type="primary"
                size="mini"
                :disabled="isDisabled && isMiddleDisabled"
                @click="handleMiddleClick"
                ><span>断点出图</span></el-button
              >
              <input
                ref="middleFile"
                style="display: none"
                name="file"
                type="file"
                accept=".xml"
                @change="selectMiddleFile"
              />
            </div>
          </el-form>
        </el-col>
      </el-row>
    </div>
  </Popover>
</template>

<script>
import localStorage from "@/stamplib/LocalStorage";
import onlyNumber from "@/directives/el-only-number";
import Popover from "@/components/Popover";

export default {
  name: "pictures",
  directives: {
    onlyNumber,
  },
  data() {
    this.cur_num = 0;
    this.totoal_count = 0;
    this.screenshot = undefined;
    this.interval = 6000;
    this.polygon = undefined;
    this.stopFlag = false;
    this.currentScreen = null;
    this.currentPose = null;
    this.logStr = "";
    return {
      dialogVisible: true,
      inputHeading: "",
      inputTilt: "",
      inputRange: "",
      inputLon1: "",
      inputLon2: "",
      inputAlt1: "",
      inputAlt2: "",
      isDisabled: false,
      outputProcess: "0/0",
      isConfirmDisabled: false,
      btnText: "开始",
      isMiddleDisabled: false,
      labelWidth: (98 / 1920) * window.innerWidth + "px",
    };
  },
  components: {
    Popover,
  },
  computed: {
    location() {
      return this.$store.state.location;
    },
    analysis() {
      return this.$store.state.analysis;
    },
  },
  methods: {
    checkIsStartEnable() {
      if (
        this.inputHeading == "" ||
        this.inputTilt == "" ||
        this.inputRange == "" ||
        this.inputLon1 == "" ||
        this.inputLon2 == "" ||
        this.inputAlt1 == "" ||
        this.inputAlt2 == ""
      ) {
        this.isConfirmDisabled = true;
      } else {
        this.isConfirmDisabled = false;
      }
    },
    handleGetCameraPoseClick() {
      var heading =
        this.stampAPI.usearth.GlobeObserver.globe_observer.pose.heading *
        StampGis.StampMath.DEGREES_PER_RADIAN;
      var tilt =
        -this.stampAPI.usearth.GlobeObserver.globe_observer.pose.tilt *
        StampGis.StampMath.DEGREES_PER_RADIAN;
      var range = this.stampAPI.usearth.GlobeObserver.globe_observer.pose.range;

      this.inputHeading = heading.toFixed(2);
      this.inputTilt = tilt.toFixed(2);
      this.inputRange = range.toFixed(2);
      this.checkIsStartEnable();
    },
    handleSelectAreaClick() {
      if (this.polygon) {
        this.stampAPI.usearth.document.elementRoot.detach_object(this.polygon);
        this.polygon = undefined;
      }
      var self = this;
      this.stampAPI.usearth.ShapeCreator.CreatePolygon({
        custom_excute_finish: function (result) {
          if (result.data != undefined && result.data.length >= 2) {
            self.polygon = self.stampAPI.usearth.Factory.CreateElementPolygon({
              name: "testPolygon",
              doc: self.stampAPI.usearth.document,
            });
            self.polygon.BeginUpdate();
            self.polygon.SetExteriorRing(result.data);
            self.polygon.set_altitude_type(1);
            self.polygon.lineColor = 0xaaffff00;
            self.polygon.lineWidth = 1.0;
            self.polygon.fillColor = 0x10ffff00;
            self.polygon.EndUpdate();
            self.stampAPI.usearth.document.elementRoot.attach_object(
              self.polygon
            );
            self.stampAPI.usearth.document.register_object(self.polygon);
            self.stampAPI.usearth.ShapeCreator.Clear();

            var conner_points = result.data;
            var points_count = conner_points.length;
            var maxLon = 0;
            var maxLat = 0;
            var minLon = 0;
            var minLat = 0;
            var sphr = StampGis.Cartographic.fromCartesian(conner_points[0]);
            maxLon = minLon = sphr.longitude;
            maxLat = minLat = sphr.latitude;
            for (var ni = 1; ni < points_count; ni++) {
              sphr = StampGis.Cartographic.fromCartesian(conner_points[ni]);
              if (sphr.longitude > maxLon) {
                maxLon = sphr.longitude;
              }
              if (sphr.longitude < minLon) {
                minLon = sphr.longitude;
              }
              if (sphr.latitude > maxLat) {
                maxLat = sphr.latitude;
              }
              if (sphr.latitude < minLat) {
                minLat = sphr.latitude;
              }
            }
            self.inputLon1 = StampGis.StampMath.toDegrees(minLon);
            self.inputLon2 = StampGis.StampMath.toDegrees(maxLon);
            self.inputAlt1 = StampGis.StampMath.toDegrees(minLat);
            self.inputAlt2 = StampGis.StampMath.toDegrees(maxLat);

            self.checkIsStartEnable();
          } else {
            self.stampAPI.usearth.ShapeCreator.Clear();
          }
        },
      });
    },
    generate_pic() {
      if (this.stopFlag) {
        this.stopFlag = false;
        return;
      }

      var active_request_count =
        this.stampAPI.usearth.application.active_request_count;
      var last_time =
        this.stampAPI.usearth.application._downloader._mission_heap
          ._lastest_time;
      var new_time =
        this.stampAPI.usearth.application.frameState.lastSystemTime;
      var diff = new_time - last_time;
      var download_count =
        this.stampAPI.usearth.application._downloader._mission_heap._missions.size();
      if (download_count > 0 || active_request_count > 0 || diff < 100) {
        setTimeout(this.generate_pic, this.interval);
      } else {
        var temp = this.screenshot.get_log();
        if (temp && temp.row_column_str && temp.array) {
          this.logStr += temp.row_column_str + ":";
          for (var i = 0; i < temp.array.length; i++) {
            this.logStr +=
              "    " +
              temp.array[i].longitude +
              "," +
              temp.array[i].latitude +
              "    ";
          }
          this.logStr += "\r\n";
        }

        this.screenshot.generate_one();
        this.cur_num++;
        this.outputProcess = this.cur_num + "/" + this.totoal_count;
        if (this.cur_num < this.totoal_count) {
          this.screenshot.goto_image(this.cur_num);
          setTimeout(this.generate_pic, this.interval);
        } else {
          this.$message({
            message: "截屏结束",
            type: "success",
          });
          this.screenshot.end();
          this.outputProcess = "0/0";
          this.btnText = "开始";
          this.isDisabled = false;
          this.isMiddleDisabled = false;
          this.cur_num = 0;
          this.currentPose = null;

          const url = window.URL.createObjectURL(new Blob([this.logStr]));
          const link = document.createElement("a");
          let fname = "log.txt";
          link.href = url;
          link.setAttribute("download", fname);
          document.body.appendChild(link);
          link.click();
        }
      }
    },
    handleStartClick() {
      if (this.polygon) {
        this.stampAPI.usearth.document.elementRoot.detach_object(this.polygon);
        this.polygon = undefined;
      }
      if (this.btnText == "开始") {
        this.currentScreen = null;
        this.logStr = "";

        var pose =
          this.stampAPI.usearth.GlobeObserver.globe_observer.pose.position;
        pose = StampGis.Cartographic.fromCartesian(pose);
        var longitude = StampGis.StampMath.toDegrees(pose.longitude);
        var latitude = StampGis.StampMath.toDegrees(pose.latitude);
        var roll = this.stampAPI.usearth.GlobeObserver.globe_observer.pose.roll;

        this.currentPose = {
          X: longitude,
          Y: latitude,
          Z: pose.height,
          roll: roll,
        };
        //this.location.FlyTo(longitude,latitude,pose.height,Number(this.inputHeading),-Number(this.inputTilt),roll);

        var maxLon = StampGis.StampMath.toRadians(Number(this.inputLon2));
        var maxLat = StampGis.StampMath.toRadians(Number(this.inputAlt2));
        var minLon = StampGis.StampMath.toRadians(Number(this.inputLon1));
        var minLat = StampGis.StampMath.toRadians(Number(this.inputAlt1));

        var conner_points = [];
        conner_points.push(new StampGis.Cartographic(minLon, maxLat, 0));
        conner_points.push(new StampGis.Cartographic(maxLon, maxLat, 0));
        conner_points.push(new StampGis.Cartographic(maxLon, minLat, 0));
        conner_points.push(new StampGis.Cartographic(minLon, minLat, 0));
        // for(var i=0; i<4; i++){
        //    conner_points[i].height = this.stampAPI.usearth.document.get_dem_height( conner_points[i] ) || this.stampAPI.usearth.document.get_dem_height_from_server( conner_points[i] );
        // }

        //批量获取高程
        var promise =
          this.stampAPI.usearth.document.get_batch_dem_height_from_server(
            conner_points
          );
        if (promise == undefined) {
          this.$message({
            message: "获取高程值失败",
            type: "error",
          });
          return;
        }

        var self = this;
        StampGis.when(promise, function () {}).then(function () {
          //设置定时器，刷新及更新进度
          self.screenshot = new StampGis.ScreenShotOf2Dot5(
            self.stampAPI.usearth.application
          );
          self.cur_num = 0;
          self.totoal_count = self.screenshot.begin(conner_points);

          if (self.totoal_count > 0) {
            self.outputProcess = "0/" + self.totoal_count;
            self.btnText = "停止";
            self.isDisabled = true;
            self.isMiddleDisabled = true;

            self.screenshot.goto_image(self.cur_num);
            setTimeout(self.generate_pic, self.interval);
          } else {
            self.$message({
              message: "当前姿态不可出图，请重新设置",
              type: "error",
            });
            return;
          }
        });
      } else if (this.btnText == "继续") {
        if (!this.currentScreen) {
          this.$message({
            message: "读取文件不正确",
            type: "error",
          });
          return;
        }

        var longitude = Number(this.currentPose.X);
        var latitude = Number(this.currentPose.Y);
        var altitude = Number(this.currentPose.Z);
        var roll = Number(this.currentPose.roll);
        this.location.FlyTo(
          longitude,
          latitude,
          altitude,
          Number(this.inputHeading),
          -Number(this.inputTilt),
          roll
        );

        var width = Number(this.currentScreen.X);
        var height = Number(this.currentScreen.Y);

        var heading =
          Number(this.inputHeading) / StampGis.StampMath.DEGREES_PER_RADIAN;
        var tilt =
          Number(this.inputTilt) / StampGis.StampMath.DEGREES_PER_RADIAN;
        var range = Number(this.inputRange);

        var maxLon = StampGis.StampMath.toRadians(Number(this.inputLon2));
        var maxLat = StampGis.StampMath.toRadians(Number(this.inputAlt2));
        var minLon = StampGis.StampMath.toRadians(Number(this.inputLon1));
        var minLat = StampGis.StampMath.toRadians(Number(this.inputAlt1));

        var conner_points = [];
        conner_points.push(new StampGis.Cartographic(minLon, maxLat, 0));
        conner_points.push(new StampGis.Cartographic(maxLon, maxLat, 0));
        conner_points.push(new StampGis.Cartographic(maxLon, minLat, 0));
        conner_points.push(new StampGis.Cartographic(minLon, minLat, 0));

        //批量获取高程
        var promise =
          this.stampAPI.usearth.document.get_batch_dem_height_from_server(
            conner_points
          );
        if (promise == undefined) {
          this.$message({
            message: "获取高程值失败",
            type: "error",
          });
          return;
        }

        var self = this;
        StampGis.when(promise, function () {}).then(function () {
          self.screenshot = new StampGis.ScreenShotOf2Dot5(
            self.stampAPI.usearth.application
          );
          self.screenshot.resume(
            conner_points,
            width,
            height,
            heading,
            tilt,
            range
          );

          self.outputProcess = self.cur_num + "/" + self.totoal_count;
          self.btnText = "停止";
          self.isDisabled = true;
          self.isMiddleDisabled = true;
          if (self.totoal_count > 0) {
            self.screenshot.goto_image(self.cur_num);
            setTimeout(self.generate_pic, self.interval);
          }
        });
      } else if (this.btnText == "停止") {
        this.stopFlag = true;
        this.screenshot.end();

        var width = this.screenshot._original_client_width;
        var height = this.screenshot._orginal_client_height;

        this.saveMiddleFile(width, height);
        this.cur_num = 0;
        this.outputProcess = "0/0";
        this.btnText = "开始";
        this.isDisabled = false;
        this.isMiddleDisabled = false;
        this.currentPose = null;

        const url = window.URL.createObjectURL(new Blob([this.logStr]));
        const link = document.createElement("a");
        let fname = "log.txt";
        link.href = url;
        link.setAttribute("download", fname);
        document.body.appendChild(link);
        link.click();
      }
    },
    saveMiddleFile(width, height) {
      var lon1 = Number(this.inputLon1);
      var lon2 = Number(this.inputLon2);
      var lat1 = Number(this.inputAlt1);
      var lat2 = Number(this.inputAlt2);

      var heading = Number(this.inputHeading);
      var tilt = Number(this.inputTilt);
      var range = Number(this.inputRange);

      var xmlString = "<xml>";
      xmlString += "<currentPose>";
      xmlString += "<X>" + this.currentPose.X + "</X>";
      xmlString += "<Y>" + this.currentPose.Y + "</Y>";
      xmlString += "<Z>" + this.currentPose.Z + "</Z>";
      xmlString += "<roll>" + this.currentPose.roll + "</roll>";
      xmlString += "</currentPose>";
      xmlString += "<currentScreen>";
      xmlString += "<X>" + width + "</X>";
      xmlString += "<Y>" + height + "</Y>";
      xmlString += "</currentScreen>";
      xmlString += "<minLon>" + lon1 + "</minLon>";
      xmlString += "<maxLon>" + lon2 + "</maxLon>";
      xmlString += "<minLat>" + lat1 + "</minLat>";
      xmlString += "<maxLat>" + lat2 + "</maxLat>";
      xmlString += "<currentNum>" + this.cur_num + "</currentNum>";
      xmlString += "<totalNum>" + this.totoal_count + "</totalNum>";
      xmlString += "<heading>" + heading + "</heading>";
      xmlString += "<tilt>" + tilt + "</tilt>";
      xmlString += "<range>" + range + "</range>";
      xmlString += "<log>" + this.logStr + "</log>";
      xmlString += "</xml>";

      const url = window.URL.createObjectURL(new Blob([xmlString]));
      const link = document.createElement("a");
      let fname = "pictureFile.xml";
      link.href = url;
      link.setAttribute("download", fname);
      document.body.appendChild(link);
      link.click();
    },
    selectMiddleFile() {
      var self = this;
      var fileInput = self.$refs["middleFile"];
      if (!fileInput || fileInput.files.length <= 0) {
        return;
      }
      var file = fileInput.files[0];
      var name = file.name;
      localStorage.readFileToText(file, function (fileinfo) {
        if (fileinfo) {
          var d = self.$x2js.xml2js(fileinfo.data);
          if (
            d &&
            d.xml &&
            d.xml.currentScreen &&
            d.xml.currentPose &&
            d.xml.heading &&
            d.xml.tilt &&
            d.xml.range &&
            d.xml.currentNum &&
            d.xml.totalNum &&
            d.xml.log &&
            d.xml.minLon &&
            d.xml.minLat &&
            d.xml.maxLat &&
            d.xml.maxLon
          ) {
            self.currentScreen = d.xml.currentScreen;

            var heading = Number(d.xml.heading);
            var tilt = Number(d.xml.tilt);
            var range = Number(d.xml.range);
            self.inputHeading = heading;
            self.inputTilt = tilt;
            self.inputRange = range;

            self.cur_num = Number(d.xml.currentNum);
            self.totoal_count = Number(d.xml.totalNum);
            self.logStr = d.xml.log;

            self.inputLon1 = Number(d.xml.minLon);
            self.inputLon2 = Number(d.xml.maxLon);
            self.inputAlt1 = Number(d.xml.minLat);
            self.inputAlt2 = Number(d.xml.maxLat);

            var longitude = Number(d.xml.currentPose.X);
            var latitude = Number(d.xml.currentPose.Y);
            var height = Number(d.xml.currentPose.Z);
            var roll = Number(d.xml.currentPose.roll);
            self.currentPose = {
              X: longitude,
              Y: latitude,
              Z: height,
              roll: roll,
            };
            self.location.FlyTo(
              longitude,
              latitude,
              height,
              heading,
              -tilt,
              roll
            );

            self.outputProcess = self.cur_num + "/" + self.totoal_count;
            self.btnText = "继续";
            self.isDisabled = true;
            self.isMiddleDisabled = false;
            self.checkIsStartEnable();
          } else {
            self.$message({
              message: "文件内容错误，请重新选择",
              type: "error",
            });
          }
        }
      });
    },
    handleMiddleClick() {
      this.$refs["middleFile"].click();
    },
    handleClose() {
      this.$router.push("/");
    },
  },
  beforeRouteLeave(to, from, next) {
    next();
    if (this.polygon) {
      this.stampAPI.usearth.document.elementRoot.detach_object(this.polygon);
      this.polygon = undefined;
    }
    this.$parent.$refs.functionPanel.curSelMenu.name = "";
  },
};
</script>

<style lang="less" scoped>
.pictures {
  width: 300px;
}

.el-row {
  margin-bottom: 5px;

  &:last-child {
    margin-bottom: 0px;
  }
}

.pictures-container {
  //   height: 550px;
  font-size: 16px;

  .pictures-container-text {
    height: 30px;
    line-height: 30px;
  }

  .pictures-container-result {
    height: 30px;
    line-height: 30px;
    font-weight: 700;
    text-align: left;
    padding-left: 10px;
    // background: rgba(1, 76, 91, 1);
  }

  .pictures-container-table {
    margin-bottom: 0px;
  }

  .pictures-container-pagination {
    margin-bottom: 0px;
  }
  .picker-input {
    width: 130px;
  }
}
</style>
