<template>
    <div v-show="toolPanelShow" class="toolManager">
        <div class="topDiv"></div>
        <div class="middleDiv">
            <div
                v-for="(item, index) in currentMenus"
                :key="index"
                class="menuDiv"
            >
                <div v-show="currentMenus.length > 1" class="menuTitle">
                    <span>{{ item.name }}</span>
                </div>
                <div
                    v-for="(subitem, key) in item.item"
                    :key="key"
                    :class="[
                        'menuBox',
                        {
                            activeMenu:
                                subitem.selected ||
                                (curSelMenu.name == subitem.id &&
                                    !subitem.disabled),
                        },
                        { disabledMenu: subitem.disabled },
                    ]"
                    :disabled="subitem.disabled"
                    @click="clickMenu(subitem)"
                >
                    <img
                        :src="subitem.src"
                        alt=""
                        class="menuImg"
                        :disabled="subitem.disabled"
                    />
                    <span>{{ subitem.name }}</span>
                </div>
            </div>
            <markedManagement v-if="currentName == 'mark'"></markedManagement>
        </div>
        <div class="bottomDiv"></div>
        <customAnnotations ref="customAnnotations"></customAnnotations>
    </div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import Measure from "@/stamplib/Measure";
import PickLabel from "@/stamplib/PickLabel";
import Label from "@/stamplib/Label";
import { saveAs } from "file-saver";
import customAnnotations from "@/views/mark/customAnnotations";
import markedManagement from "@/views/mark/MarkedManagement";
export default {
    name: "ToolManager",
    components: {},
    data() {
        this.$_measure = null;
        this.$_label = null;
        this.$_pickLabel = null;
        return {
            myComponent: null,
            componentObj: {},
            toolPanelShow: false,
            dialogVisible: true,
            curSelMenu: {
                name: "",
            },
            viewType: "",
            currentName: "",
            currentMenus: [],
            defaultProps: {
                children: "children",
                label: "name",
            },
            clickCount: 0,
            showCheck: true,
        };
    },
    components: {
        customAnnotations,
        markedManagement,
    },
    computed: {
        showSliderDialog: {
            get() {
                return this.$store.state.sliderDialogVisible;
            },
            set(val) {
                this.changeSliderDialogShow(val);
            },
        },
        showValue: {
            get() {
                return this.$store.state.sliderValue;
            },
            set(val) {
                this.changeSliderValue(val);
            },
        },

        // ...mapState(['sliderDialogVisible'])
    },
    watch: {},
    mounted() {},
    methods: {
        clickMenu(subitem) {
            if (subitem.disabled) {
                return;
            }
            this.curSelMenu.name = "";
            if (!this.$_measure) {
                this.$_measure = new Measure(this.stampAPI.usearth, this);
            }
            if (!this.$_label) {
                this.$_label = new Label(this.stampAPI.usearth, this);
            }
            if (subitem.toolType == 2 || subitem.toolType == 3) {
                //   控制飞行路径和地形透明同时存在,互斥.
                if (this.showSliderDialog && subitem.id == "ViewFlyMode") {
                    this.stampAPI.usearth.document.terrain_transparency =
                        this.showValue = 100;
                    this.changeSliderDialogShow(false);
                }
                this.$store.state.toolItem = subitem;
                this.changeOperDialogShow(true);
                this.$router.push("/" + subitem.id);
                this.curSelMenu.name = subitem.id;
            } else if (
                subitem.toolType == 5 &&
                this.$_measure[subitem.id] &&
                typeof this.$_measure[subitem.id] == "function"
            ) {
                if (subitem.id === "lineSpacing") {
                    // 平面间距
                    this.$_measure.notify && this.$_measure.notify.close();
                    this.stampAPI.usearth.Measure.Clear(); //清楚线
                    this.$_measure[subitem.id](subitem.id);
                } else if (subitem.id == "verticalDistance") {
                    // 垂直距离
                    this.$_measure.notify && this.$_measure.notify.close();
                    this.stampAPI.usearth.Measure.Clear(); //清楚线
                    this.$_measure[subitem.id](subitem.id);
                } else if (subitem.id == "spaceDistance") {
                    // 空间间距
                    this.$_measure.notify && this.$_measure.notify.close();
                    this.stampAPI.usearth.Measure.Clear(); //清楚线
                    this.$_measure[subitem.id](subitem.id);
                } else {
                    this.$_measure.notify && this.$_measure.notify.close();
                    this.stampAPI.usearth.Measure.Clear(); //清楚线
                    this.$_measure[subitem.id]();
                }
            } else if (
                this.$_label[subitem.id] &&
                typeof this.$_label[subitem.id] == "function"
            ) {
                var self = this;
                if (subitem.id == "MarkedAngleAndLength") {
                    self.$_label[subitem.id]("", "true", self);
                } else if (subitem.id == "MarkedComplex") {
                    self.$_label[subitem.id]("", "true", self);
                } else {
                    self.$_pickLabel = new PickLabel(
                        self,
                        callback,
                        subitem.id
                    );
                }
            } else if (subitem.toolType == 4) {
                if (subitem.id === "AnalysisTranSection") {
                    var self = this;
                    var earth = this.stampAPI.usearth;
                    var callback = function (_data) {
                        self.$router.push({
                            path: "/" + subitem.id,
                            query: {
                                info: _data,
                            },
                        });
                        self.$store.state.toolItem = subitem;
                        self.changeOperDialogShow(true);
                    };
                    earth.ShapeCreator.CreateLine({
                        custom_excute_finish: function (result) {
                            if (!result || result.data.length < 2) {
                                self.$message({
                                    message: "请至少绘制两个点",
                                    type: "warning",
                                    center: true,
                                });
                                earth.ShapeCreator.Clear();
                                return;
                            }
                            callback(result.data);
                            earth.ShapeCreator.Clear();
                        },
                    });
                } else if (subitem.id == "mScreenShot") {
                    let screenshot = new StampGis.ScreenShot();
                    //获取视窗大小方法API.usearth.application.canvas.clientWidth, API.usearth.application.canvas.clientHeight
                    const { clientWidth, clientHeight } =
                        this.stampAPI.usearth.application.canvas;
                    let earth = this.stampAPI.usearth;
                    earth.application.render(); //需要执行render方法，不然会是黑屏
                    const canvas = earth.application.canvas; //获取画布 dom元素
                    canvas.toBlob(function (blob) {
                        saveAs(blob, `截图 ${clientWidth}x${clientHeight}`);
                    });
                } 
                // else if (subitem.id == "clipScene") {
                //     this.stampAPI.usearth.Measure.Clear();
                //     this.stampAPI.usearth.Measure.ClipScene({
                //         vertical: true,
                //         clipType: 31,
                //         custom_excute_finish: function (result) {
                //             if (result != undefined) {
                //             } else {
                //                 this.stampAPI.usearth.Measure.Clear();
                //             }
                //         },
                //     });
                // } 
                else if (subitem.id == "AnalysisFlowShowing") {
                    for (
                        let num = 0;
                        num < this.g_Project.pipeListData.length;
                        num++
                    ) {
                        let guid = this.g_Project.pipeListData[num].guid;
                        var layer =
                            this.stampAPI.usearth.LayerManager.GetLayerByGUID(
                                guid
                            );
                        if (Math.floor(layer.pipeline_type / 1000) * 1000 == 4000) {
                            layer.container.flow_texture_url =
                                stamp_core_config.baseUrlString +
                                "images/flow/flow.jpg";
                            layer.container._enable_flow = !subitem.selected;
                        }
                    }
                    subitem.selected = !subitem.selected;
                    subitem.name = subitem.selected ? "取消显示" : "流向显示";
                }
            }
        },
        show(id) {
            this.toolPanelShow = true;
            this.currentMenus = [];
            switch (id) {
                case "query":
                    this.currentMenus.push(STAMP.menuConfig.menu[0]);
                    this.currentMenus.push(STAMP.menuConfig.menu[1]);
                    break;
                case "analysis":
                    this.currentMenus.push(STAMP.menuConfig.menu[2]);
                    break;
                case "mark":
                    this.currentMenus.push(STAMP.menuConfig.menu[3]);
                    break;
                case "views":
                    this.currentMenus.push(STAMP.menuConfig.menu[4]);
                    this.currentMenus.push(STAMP.menuConfig.menu[5]);
                    break;
            }
            this.currentName = id;
        },
        cancelClick() {
            this.toolPanelShow = false;
        },
        //                                           控制透明度显影       控制透明度的进度条
        ...mapActions([
            "changeOperDialogShow",
            "changeSliderDialogShow",
            "changeSliderValue",
        ]),
    },
};
</script>

<style lang="less" scoped>
.toolManager {
    position: fixed;
    width: 17.5vw;
    right: 2vw;
    top: calc(12vh + 2.2vw);
    font-size: 0.6vw;
}
.topDiv {
    width: 100%;
    height: 20px;
    background: url(../../../../public/images/tool/top-bg.png) no-repeat;
    background-size: 100% 100%;
}
.middleDiv {
    width: 100%;
    background: url(../../../../public/images/tool/middle-bg.png) repeat-y;
    background-size: 100%;
}
.bottomDiv {
    width: 100%;
    height: 20px;
    background: url(../../../../public/images/tool/bottom-bg.png) no-repeat;
    background-size: 100% 100%;
}

.scrollbar-wrapper {
    overflow-x: hidden !important;
}

/deep/ .el-scrollbar__bar.is-vertical {
    right: 0px;
    //   display: none;
}

/deep/ .el-scrollbar__wrap {
    height: calc(100% + 8px);
}

/deep/ .el-scrollbar__bar.is-horizontal {
    display: none;
}

/deep/ .el-dialog__body {
    height: calc(100% - 5.925vh);
    padding: 0px;
    font-size: 0.833vw;
}

.menuDiv {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
}

.menuBox {
    width: 3.975vw;
    font-size: 0.7vw;
    color: #ffffff;
    padding: 0.5vw 0.1vw;
    margin: 0 0.1vw 0.5vw;
    cursor: pointer;

    &:hover {
        background: url("../../../../public/images/tool/menu-active.png")
            no-repeat;
        background-size: 100% 100%;
    }
}

.menuImg {
    display: block;
    width: 1.975vw;
    height: 1.975vw;
    margin: 0 1vw 0.6vw;
    object-fit: contain;
}

.menuTitle {
    width: 100%;
    height: 3.6vh;
    text-align: left;
    background: url("../../../../public/images/tool/header-bg.png") no-repeat;
    background-size: 100% 100%;
    margin-bottom: 0.5vw;
}

.menuTitle span {
    margin-left: 1vw;
    line-height: 3.6vh;
    color: white;
    font-size: 0.8vw;
}

.activeMenu {
    background: url("../../../../public/images/tool/menu-active.png") no-repeat;
    background-size: 100% 100%;
}

.trans {
    background-color: transparent !important;

    &:hover {
        background-color: transparent !important;
    }
}

.disabledMenu {
    cursor: not-allowed;
    &:hover {
        background: none;
    }

    img {
        opacity: 0.5;
    }

    span {
        color: grey;
    }
}
.tree {
    width: 100%;
    max-width: 280px;
    height: 40vh;
    z-index: 100;
    color: #ffffff;
    //   background-color: red;
    .tree_title {
        width: 100%;
        height: 40px;
        line-height: 40px;
        text-align: left;
        font-size: 14px;
        text-indent: 1rem;
        border-top: 1px solid rgba(255, 174, 3, 0.5);
        border-bottom: 1px solid rgba(255, 174, 3, 0.5);
    }
}
</style>
