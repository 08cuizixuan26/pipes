<template>
    <!-- <div class="sliderDiv"> -->
    <popover
        :visible.sync="viewSettingShow"
        :show-header="true"
        :before-close="handleClose"
        :title="titleName"
        custom-class="layerPanel"
    >
        <div class="bodyDiv">
            <el-form>
                <el-form-item label="去锯齿：" :label-width="labelWidth">
                    <el-switch
                        v-model="fxaa"
                        style="margin: 10px auto 10px 15px"
                        active-text="开"
                        inactive-text="关"
                        @change="handlefxaaEnable"
                    />
                </el-form-item>
            </el-form>
            <el-form>
                <el-form-item label="场景效果：" :label-width="labelWidth">
                    <el-switch
                        v-model="enableValue"
                        style="margin: 10px auto 10px 15px"
                        active-text="开"
                        inactive-text="关"
                        @change="handleEnable"
                    />
                </el-form-item>
            </el-form>
            <el-form :disabled="!enableValue">
                <el-form-item label="明亮：" :label-width="labelWidth">
                    <el-slider
                        v-model="viewSetting.brightness"
                        :max="3"
                        :step="0.1"
                        class="picker-input"
                        @change="handleBrightnessChange"
                    />
                </el-form-item>
                <el-form-item label="对比：" :label-width="labelWidth">
                    <el-slider
                        v-model="viewSetting.contrast"
                        :max="3"
                        :step="0.1"
                        class="picker-input"
                        @change="handleContrastChange"
                    />
                </el-form-item>
                <el-form-item label="色度：" :label-width="labelWidth">
                    <el-slider
                        v-model="viewSetting.hue"
                        :max="3"
                        :step="0.1"
                        class="picker-input"
                        @change="handleHueChange"
                    />
                </el-form-item>
                <el-form-item label="饱和：" :label-width="labelWidth">
                    <el-slider
                        v-model="viewSetting.saturation"
                        :max="3"
                        :step="0.1"
                        class="picker-input"
                        @change="handleSaturationChange"
                    />
                </el-form-item>
                <el-form-item label="伽马：" :label-width="labelWidth">
                    <el-slider
                        v-model="viewSetting.gamma"
                        :max="3"
                        :step="0.1"
                        class="picker-input"
                        @change="handleGammaChange"
                    />
                </el-form-item>
            </el-form>
            <div class="btnDiv">
                <el-button type="primary" size="mini" @click="handleBackClick"
                    ><span>恢复</span></el-button
                >
                <el-button
                    :disabled="!btnEnable"
                    type="primary"
                    size="mini"
                    @click="handleSaveClick"
                    ><span>保存</span></el-button
                >
            </div>
        </div>
    </popover>
    <!-- </div> -->
</template>

<script>
import popover from "@/components/Popover";
import onlyNumber from "@/directives/el-only-number";
import localStorage from "@/stamplib/LocalStorage";

export default {
    name: "viewSetting",
    directives: { onlyNumber },
    data() {
        return {
            viewSettingShow: true,
            titleName: "场景效果",
            enableValue: STAMP_config.viewEnable,
            viewSetting: {
                brightness: STAMP_config.viewSetting.brightness,
                contrast: STAMP_config.viewSetting.contrast,
                hue: STAMP_config.viewSetting.hue,
                saturation: STAMP_config.viewSetting.saturation,
                gamma: STAMP_config.viewSetting.gamma,
            },
            fxaa: STAMP_config.fxaa,
            labelWidth: (90 / 1920) * window.innerWidth + "px",
            btnEnable: false,
        };
    },
    components: {
        popover,
    },
    computed: {},
    mounted() {
        this.fxaa = this.stampAPI.usearth.view.postProcessStages.fxaa.enabled;

        this.enableValue = this.stage.adjustment_stage
            ? this.stage.adjustment_stage.enabled
            : false;

        if (this.enableValue) {
            this.viewSetting.brightness =
                this.stage.adjustment_stage.uniforms.properties.brightness_contrast_hue_saturation.red;
            this.viewSetting.contrast =
                this.stage.adjustment_stage.uniforms.properties.brightness_contrast_hue_saturation.green;
            this.viewSetting.hue =
                this.stage.adjustment_stage.uniforms.properties.brightness_contrast_hue_saturation.blue;
            this.viewSetting.saturation =
                this.stage.adjustment_stage.uniforms.properties.brightness_contrast_hue_saturation.alpha;
            this.viewSetting.gamma =
                this.stage.adjustment_stage.uniforms.properties.gamma;
        }
    },
    methods: {
        handleClose() {
            this.$router.push("/");
        },
        handleEnable(val) {
            if (!this.stage.adjustment_stage) {
                this.stage.adjustment_stage =
                    StampGis.PostProcessStageLibrary.createAdjustmentStage();
                this.stampAPI.usearth.view.postProcessStages.add(
                    this.stage.adjustment_stage
                );
            }
            this.stage.adjustment_stage.enabled = val;

            if (val) {
                var self = this;
                self.stage.adjustment_stage.uniforms.properties.brightness_contrast_hue_saturation.red =
                    self.viewSetting.brightness;
                self.stage.adjustment_stage.uniforms.properties.brightness_contrast_hue_saturation.green =
                    self.viewSetting.contrast;
                self.stage.adjustment_stage.uniforms.properties.brightness_contrast_hue_saturation.blue =
                    self.viewSetting.hue;
                self.stage.adjustment_stage.uniforms.properties.brightness_contrast_hue_saturation.alpha =
                    self.viewSetting.saturation;
                self.stage.adjustment_stage.uniforms.properties.gamma =
                    self.viewSetting.gamma;
            }
            this.btnEnable = true;
        },
        handleBrightnessChange(value) {
            if (
                this.stage.adjustment_stage &&
                this.stage.adjustment_stage.enabled
            ) {
                this.stage.adjustment_stage.uniforms.properties.brightness_contrast_hue_saturation.red =
                    value;
            }
            this.btnEnable = true;
        },
        handleContrastChange(value) {
            if (
                this.stage.adjustment_stage &&
                this.stage.adjustment_stage.enabled
            ) {
                this.stage.adjustment_stage.uniforms.properties.brightness_contrast_hue_saturation.green =
                    value;
            }
            this.btnEnable = true;
        },
        handleHueChange(value) {
            if (
                this.stage.adjustment_stage &&
                this.stage.adjustment_stage.enabled
            ) {
                this.stage.adjustment_stage.uniforms.properties.brightness_contrast_hue_saturation.blue =
                    value;
            }
            this.btnEnable = true;
        },
        handleSaturationChange(value) {
            if (
                this.stage.adjustment_stage &&
                this.stage.adjustment_stage.enabled
            ) {
                this.stage.adjustment_stage.uniforms.properties.brightness_contrast_hue_saturation.alpha =
                    value;
            }
            this.btnEnable = true;
        },
        handleGammaChange(value) {
            if (
                this.stage.adjustment_stage &&
                this.stage.adjustment_stage.enabled
            ) {
                this.stage.adjustment_stage.uniforms.properties.gamma = value;
            }
            this.btnEnable = true;
        },
        handlefxaaEnable() {
            this.stampAPI.usearth.view.postProcessStages.fxaa.enabled =
                !this.stampAPI.usearth.view.postProcessStages.fxaa.enabled;
            this.btnEnable = true;
        },
        handleBackClick() {
            this.fxaa = STAMP_config.fxaa;
            this.enableValue = STAMP_config.viewEnable;
            this.viewSetting.brightness = STAMP_config.viewSetting.brightness;
            this.viewSetting.contrast = STAMP_config.viewSetting.contrast;
            this.viewSetting.hue = STAMP_config.viewSetting.hue;
            this.viewSetting.saturation = STAMP_config.viewSetting.saturation;
            this.viewSetting.gamma = STAMP_config.viewSetting.gamma;

            this.stampAPI.usearth.view.postProcessStages.fxaa.enabled =
                this.fxaa;
            if (!this.stage.adjustment_stage) {
                this.stage.adjustment_stage =
                    StampGis.PostProcessStageLibrary.createAdjustmentStage();
                this.stampAPI.usearth.view.postProcessStages.add(
                    this.stage.adjustment_stage
                );
            }
            this.stage.adjustment_stage.enabled = this.enableValue;

            if (this.enableValue) {
                this.stage.adjustment_stage.uniforms.properties.brightness_contrast_hue_saturation.red =
                    this.viewSetting.brightness;
                this.stage.adjustment_stage.uniforms.properties.brightness_contrast_hue_saturation.green =
                    this.viewSetting.contrast;
                this.stage.adjustment_stage.uniforms.properties.brightness_contrast_hue_saturation.blue =
                    this.viewSetting.hue;
                this.stage.adjustment_stage.uniforms.properties.brightness_contrast_hue_saturation.alpha =
                    this.viewSetting.saturation;
                this.stage.adjustment_stage.uniforms.properties.gamma =
                    this.viewSetting.gamma;
            }
            this.handleSaveClick();
        },
        handleSaveClick() {
            var self = this;

            let temp = {
                fxaa: this.fxaa,
                viewEnable: this.enableValue,
                viewSetting: this.viewSetting,
            };
            localStorage.saveToDB(
                this.stampAPI.usearth,
                "adjustmen_stage",
                temp,
                function () {
                    self.$message({
                        message: "保存成功",
                        type: "success",
                        center: true,
                    });
                }
            );
            this.btnEnable = false;
        },
    },
    beforeRouteLeave(to, from, next) {
        this.stampAPI.usearth.ShapeCreator.Clear();
        this.$parent.$refs.functionPanel.curSelMenu.name = "";
        next();
    },
};
</script>

<style lang="less" scoped>
// .sliderDiv {
//   /deep/ .dailog-customclass {
//     width: 300px;
//     color: #fff;
//     left: 0vw;
//     top: 78vh;
//   }
//   /deep/ .el-dialog__title {
//     color: #fff;
//   }
//   /deep/ .el-dialog__header {
//     padding: 5px;
//     text-align: left;
//     padding-left: 10px;
//   }
//   /deep/ .el-dialog__body {
//     padding: 0px 20px;
//   }
// }
.layerPanel {
    width: 300px;
    // max-width: 300px;
    // height: 68vh;
    // position: fixed;
    // top: 17vh;
    // left: 10px;
    // z-index: 100;
}
.bodyDiv {
    text-align: left;
}
.btnDiv {
    text-align: center;
}
.picker-input {
    width: calc(100% - 10px);
}
/deep/ .el-switch__label {
    color: white;
}
</style>
