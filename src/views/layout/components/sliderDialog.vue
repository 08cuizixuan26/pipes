<template>
    <div class="sliderDiv">
        <popover
            :visible.sync="visible"
            :popover-fade="transitionName"
            :title="titleName"
            @on-close="closeSliderDiv"
            custom-class="dailog-customclass"
        >
            <div class="block">
                <el-slider
                    v-model="showValue"
                    @input="changeSli"
                    :min="min"
                    :max="max"
                />
            </div>
        </popover>
    </div>
</template>

<script>
import popover from "@/components/Popover";
import { mapActions, mapState } from "vuex";

export default {
    name: "sliderDialog",
    components: { popover },
    data() {
        this.Data = [];
        return {
            transitionName: "el-zoom-in-center",
            min: 1,
            visible: true,
        };
    },
    computed: {
        selectLayerID() {
            return this.$store.state.selectLayer;
        },
        titleName() {
            var titleName = "";
            switch (this.sliderType) {
                case "transparent":
                    titleName = "地形透明";
                    break;
                case "layerTrans":
                    titleName = "模型透明";
                    break;
                case "vector":
                    titleName = "图斑透明";
                    break;
                case "demExagger":
                    titleName = "地形夸张";
                    break;
                case "EffectRain":
                    titleName = "雨";
                    break;
                case "EffectSnow":
                    titleName = "雪";
                    break;
                case "EffectFog":
                    titleName = "雾";
                    break;
            }

            return titleName;
        },
        max() {
            var max = 100;
            switch (this.sliderType) {
                case "demExagger":
                    max = 20;
                    break;
            }

            return max;
        },
        showValue: {
            get() {
                return this.$store.state.sliderValue;
            },
            set(val) {
                this.changeSliderValue(val);
            },
        },
        // visible: {
        //   get() {
        //     var temp = this.$store.state.sliderDialogVisible;
        //     return temp;
        //   },
        //   set(flag) {
        //     this.changeSliderDialogShow(flag);
        //   },
        // },
        ...mapState(["sliderType"]),
    },
    methods: {
        closeSliderDiv() {
            this.$parent.closePanel();
        },
        closelayerTrans() {
            var self = this;
            if (!!self.stage.rain_stage) {
                self.stampAPI.usearth.view.postProcessStages.remove(
                    self.stage.rain_stage
                );
                self.stage.rain_stage = null;
            }
            if (!!self.stage.snow_stage) {
                self.stampAPI.usearth.view.postProcessStages.remove(
                    self.stage.snow_stage
                );
                self.stage.snow_stage = null;
            }
            if (!!self.stage.fog_stage) {
                self.stampAPI.usearth.view.postProcessStages.remove(
                    self.stage.fog_stage
                );
                self.stage.fog_stage = null;
            }
            if (!!self.stage.night_stage) {
                self.stampAPI.usearth.view.postProcessStages.remove(
                    self.stage.night_stage
                );
                self.stage.night_stage = null;
            }
        },
        changeSli(val) {
            switch (this.sliderType) {
                case "transparent":
                    this.stampAPI.usearth.document.terrain_transparency =
                        val / 100;
                    break;
                case "layerTrans":
                    if (this.Data.length == 0) {
                        var rootLayer =
                            this.stampAPI.usearth.document.rootFolder;
                        this.getModelLayerData(rootLayer);
                    }

                    for (var i = 0; i < this.Data.length; i++) {
                        var layer =
                            this.stampAPI.usearth.LayerManager.GetLayerByGUID(
                                this.Data[i]
                            );
                        layer.set_transparency(val / 100);
                    }
                    this.$store.state.modelLayerTrans = val;
                    break;
                case "vector":
                    var id = this.selectLayerID;
                    var layer =
                        this.stampAPI.usearth.LayerManager.GetLayerByGUID(id);
                    layer._transparency = val / 100;
                    break;
                case "demExagger":
                    this.stampAPI.usearth.document.terrain_altitude_scale = val;
                    break;
                case "EffectRain":
                    this.stage.rain_stage.uniforms.rain_level = val / 100;
                    break;
                case "EffectSnow":
                    this.stage.snow_stage.uniforms.snow_level = val / 100;
                    break;
                case "EffectFog":
                    this.stage.fog_stage.uniforms.fog_level = val / 100;
                    break;
            }
        },
        getModelLayerData(root) {
            for (var i = 0; i < root.getChildCount(); i++) {
                var subLayer = root.getChildAt(i);
                if (subLayer.getChildCount === undefined) {
                    if (
                        subLayer.data_type &&
                        subLayer.data_type == "Building"
                    ) {
                        this.Data.push(subLayer.get_guid());
                    }
                } else {
                    this.getModelLayerData(subLayer);
                }
            }
            return this.Data;
        },
        ...mapActions([
            "changeSliderDialogShow",
            "changeSliderValue",
            "changeSliderType",
        ]),
    },
    mounted() {},
    updated() {
        switch (this.sliderType) {
            case "EffectRain":
                if (!this.stage.rain_stage) {
                    this.stage.rain_stage =
                        StampGis.PostProcessStageLibrary.createRainStage(1);
                    this.stampAPI.usearth.view.postProcessStages.add(
                        this.stage.rain_stage
                    );
                }
                break;
            case "EffectSnow":
                if (!this.stage.snow_stage) {
                    this.stage.snow_stage =
                        StampGis.PostProcessStageLibrary.createSnowStage(1);
                    this.stampAPI.usearth.view.postProcessStages.add(
                        this.stage.snow_stage
                    );
                }
                break;
            case "EffectFog":
                if (!this.stage.fog_stage) {
                    this.stage.fog_stage =
                        StampGis.PostProcessStageLibrary.createFogStage(1);
                    this.stampAPI.usearth.view.postProcessStages.add(
                        this.stage.fog_stage
                    );
                }
                break;
        }
    },
};
</script>

<style lang="less" scoped>
.sliderDiv {
    /deep/ .dailog-customclass {
        width: 240px;
        color: #fff;
        left: 0px;
        top: auto;
        bottom: 58px;
    }
    /deep/ .el-dialog__title {
        color: #fff;
    }
    /deep/ .el-dialog__header {
        padding: 1vw;
        text-align: left;
    }
    /deep/ .el-dialog__body {
        padding: 0px 20px;
    }
}
.sliderDiv1 {
    width: 158px;
    margin-left: -60px;
    margin-top: -50px;

    > div {
        background-color: rgba(55, 57, 40, 0.7);
        border-radius: 5px;
        border: 1px solid rgba(255, 174, 3, 0.5);
        padding: 5px 12px;
    }
}
.el-dialog__headerbtn {
    top: 10px !important;
}
.el-dialog__header {
    padding-top: 10px !important;
}

/deep/ .el-slider__bar {
    background-color: rgba(255, 174, 3, 0.6);
}

/deep/ .el-slider__button {
    background-color: rgba(255, 174, 3, 0.6);
    border-color: rgba(255, 174, 3, 0.5);
}
</style>
