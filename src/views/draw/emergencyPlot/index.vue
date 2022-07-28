<template>
    <div class="military">
        <el-row type="flex">
            <el-col v-for="item in toolItem" :key="item.id">
                <button
                    :class="{ selectedBtn: curSel == item.id }"
                    @click="changeClick(item.id)"
                >
                    {{ item.name }}
                </button>
            </el-col>
        </el-row>
        <div class="tabContainer">
            <el-scrollbar wrap-class="tab-scrollbar-wrapper">
                <div
                    v-for="item in toolItem"
                    v-show="curSel == item.id"
                    :key="item.id"
                    class="itemDiv"
                >
                    <div
                        v-for="val in symlibcfg[item.id]"
                        :key="val.id"
                        :class="[
                            { imageSelected: curActive == val.name },
                            'imgDiv',
                        ]"
                        @click.prevent="startDraw(val)"
                    >
                        <div
                            style="
                                width: 40px;
                                height: 40px;
                                background: white;
                                margin-top: 5px;
                            "
                        >
                            <el-image
                                :src="val.img"
                                fit="fit"
                                class="img"
                            ></el-image>
                        </div>
                        <span style="margin-top: 5px">{{ val.name }}</span>
                    </div>
                </div>
            </el-scrollbar>
        </div>
        <div class="treeContainer">
            <el-scrollbar wrap-class="tree-scrollbar-wrapper">
                <el-tree
                    ref="tree"
                    :data="treeData"
                    :props="defaultProps"
                    :default-checked-keys="checkData"
                    :default-expanded-keys="expandData"
                    node-key="guid"
                    show-checkbox
                    @node-click="handleNodeClick"
                    @node-contextmenu="rightClick"
                    @check-change="handleCheckChange"
                ></el-tree>
            </el-scrollbar>
        </div>
        <rightMenu ref="rightMenu" />
        <objectDialog ref="objectDialog" />
        <editNameDialog ref="editNameDialog" />
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import rightMenu from "@/views/common/rightMenu";
import editNameDialog from "@/views/common/editName";
import localStorage from "@/stamplib/LocalStorage";
import location from "@/stamplib/Location";
import { createGuid } from "@/utils";
import emergencyPlot from "./emergencyPlot";
import drawObj from "../index";
import objectDialog from "../object";

export default {
    name: "emergencyPlot",
    components: {
        editNameDialog,
        rightMenu,
        objectDialog,
    },
    data() {
        return {
            curSel: "point",
            defaultProps: Object.freeze({
                children: "children",
                label: "name",
            }),
            curActive: "",
            checkData: [],
            symlibcfg: {},
            expandData: [-1],
        };
    },
    watch: {
        checkData(newV, oldV) {
            var self = this;
            self.$nextTick(function () {
                self.$refs.tree.setCheckedKeys(self.checkData);
            });
        },
    },
    methods: {
        changeClick(val) {
            this.curSel = val;
        },
        startDraw(active) {
            this.curActive = active.name;
            const self = this;
            emergencyPlot.create(self, active);
        },
        handleNodeClick(data) {
            if (!data) {
                return;
            }
            if (data.children) {
                //父节点，忽略
                return;
            }
            for (var i = 0; i < this.elementArr.length; i++) {
                if (this.elementArr[i].get_guid() == data.guid) {
                    var pos = this.elementArr[i].transform;
                    location.flyToRadians(
                        this.stampAPI.usearth,
                        pos.longitude,
                        pos.latitude,
                        pos.altitude + 200,
                        0,
                        -90,
                        0
                    ); //目前暂定为200
                    // this.elementArr[i].show_high_light();
                    break;
                }
            }
        },
        rightClick(e, data, node, comp) {
            const self = this;
            let topHeight = self.$store.state.topHeight;
            let level = node.level;
            self.$refs.rightMenu.show({
                x: e.pageX,
                y: e.pageY,
                width: self.$el.clientWidth,
                height: self.$el.clientHeight,
                data: [
                    {
                        label: "编辑",
                        iconClass: "el-icon-edit",
                        hiddenClass:
                            level == 1 || level == 2 ? "hiddenClass" : "",
                        callback: function () {
                            if (level != 1 && level != 2 && data.children) {
                                self.editFolder(data);
                            } else {
                                if (
                                    drawObj[data.type] &&
                                    typeof drawObj[data.type].edit == "function"
                                ) {
                                    drawObj[data.type].edit(self, data);
                                }
                            }
                        },
                    },
                    {
                        label: "删除",
                        iconClass: "el-icon-delete",
                        hiddenClass: "",
                        callback: function () {
                            var texttip = data.children
                                ? "确定要删除该节点下所有子节点吗?"
                                : "确定要删除吗?";
                            self.$confirm(texttip, "提示", {
                                confirmButtonText: "确定",
                                cancelButtonText: "取消",
                                type: "warning",
                            })
                                .then(() => {
                                    self.removeElement(level, data);
                                    if (
                                        drawObj[data.type] &&
                                        typeof drawObj[data.type].delete ==
                                            "function"
                                    ) {
                                        drawObj[data.type].delete(self, data);
                                    }
                                    self.stampAPI.usearth.ToolManager.ObjectEditTool.Browse();
                                })
                                .catch((e) => {
                                    console.log(e, e.message);
                                });
                        },
                    },
                ],
            });
        },
        editFolder(data) {
            var self = this;
            self.$refs.editNameDialog.show({
                title: "编辑",
                data: data.name,
                callbackOK: function (name) {
                    data.name = name;
                    localStorage.saveElementToDB(
                        self.stampAPI.usearth,
                        "emergencyPlot",
                        self.treeData
                    );
                },
            });
        },
        removeElement(level, data) {
            //删除节点
            var self = this;
            var earth = self.stampAPI.usearth;
            self.removeNodeElement(data);
            if (level == 1) {
                self.treeData[0].children[0].children = [];
                self.treeData[0].children[1].children = [];
                self.treeData[0].children[2].children = [];
                self.checkData = [];
            } else if (level == 2) {
                if (data.name == "点符号") {
                    self.treeData[0].children[0].children = [];
                    for (
                        var i = 0;
                        i < self.treeData[0].children[0].children.length;
                        i++
                    ) {
                        var dataItem = self.treeData[0].children[0].children[i];
                        if (self.checkData.indexOf(dataItem.guid) != -1) {
                            self.checkData.splice(
                                self.checkData.indexOf(dataItem.guid),
                                1
                            );
                        }
                    }
                    if (self.checkData.indexOf("-11") != -1) {
                        self.checkData.splice(self.checkData.indexOf("-11"), 1);
                    }
                } else if (data.name == "线符号") {
                    self.treeData[0].children[1].children = [];
                    for (
                        var i = 0;
                        i < self.treeData[0].children[1].children.length;
                        i++
                    ) {
                        var dataItem = self.treeData[0].children[1].children[i];
                        if (self.checkData.indexOf(dataItem.guid) != -1) {
                            self.checkData.splice(
                                self.checkData.indexOf(dataItem.guid),
                                1
                            );
                        }
                    }
                    if (self.checkData.indexOf("-12") != -1) {
                        self.checkData.splice(self.checkData.indexOf("-12"), 1);
                    }
                } else if (data.name == "面符号") {
                    self.treeData[0].children[2].children = [];
                    for (
                        var i = 0;
                        i < self.treeData[0].children[2].children.length;
                        i++
                    ) {
                        var dataItem = self.treeData[0].children[2].children[i];
                        if (self.checkData.indexOf(dataItem.guid) != -1) {
                            self.checkData.splice(
                                self.checkData.indexOf(dataItem.guid),
                                1
                            );
                        }
                    }
                    if (self.checkData.indexOf("-13") != -1) {
                        self.checkData.splice(self.checkData.indexOf("-13"), 1);
                    }
                }
            } else {
                if (data.class == "point") {
                    self.removeNodeData(self.treeData[0].children[0], data);
                    if (self.treeData[0].children[0].children.length == 0) {
                        if (self.checkData.indexOf("-11") != -1) {
                            self.checkData.splice(
                                self.checkData.indexOf("-11"),
                                1
                            );
                        }
                    }
                } else if (data.class == "line") {
                    self.removeNodeData(self.treeData[0].children[1], data);
                    if (self.treeData[0].children[1].children.length == 0) {
                        if (self.checkData.indexOf("-12") != -1) {
                            self.checkData.splice(
                                self.checkData.indexOf("-12"),
                                1
                            );
                        }
                    }
                } else if (data.class == "polygon") {
                    self.removeNodeData(self.treeData[0].children[2], data);
                    if (self.treeData[0].children[2].children.length == 0) {
                        if (self.checkData.indexOf("-13") != -1) {
                            self.checkData.splice(
                                self.checkData.indexOf("-13"),
                                1
                            );
                        }
                    }
                }
            }
            localStorage.saveElementToDB(earth, "emergencyPlot", self.treeData); //存库DB
        },
        removeNodeElement(dataItem) {
            //删除球上Element对象
            var self = this;
            var earth = self.stampAPI.usearth;
            var children = dataItem.children;
            if (children && children.length > 0) {
                for (var i = 0; i < children.length; i++) {
                    var item = children[i];
                    self.removeNodeElement(item);
                }
            } else {
                for (var i = 0; i < self.elementArr.length; i++) {
                    var item = self.elementArr[i];
                    if (item.get_guid() == dataItem.guid) {
                        try {
                            if (item.parentLayer) {
                                item.parentLayer.detach_object(item);
                            } else {
                                if (dataItem.class == "point") {
                                    earth.document.elementRoot3D.detach_object(
                                        item
                                    );
                                } else {
                                    earth.document.elementRoot.detach_object(
                                        item
                                    );
                                }
                            }
                        } catch (ex) {}
                        self.elementArr.splice(i, 1);
                        break;
                    }
                }
                if (self.checkData.indexOf(dataItem.guid) != -1) {
                    self.checkData.splice(
                        self.checkData.indexOf(dataItem.guid),
                        1
                    );
                }
            }
        },
        removeNodeData(sdata, dataItem) {
            //删除节点数据
            var self = this;
            var scdata = sdata.children;
            if (sdata.children) {
                for (var i = 0; i < sdata.children.length; i++) {
                    if (sdata.children[i].guid == dataItem.guid) {
                        sdata.children.splice(i, 1);
                        break;
                    } else {
                        self.removeNodeData(sdata.children[i], dataItem);
                    }
                }
            }
        },
        handleCheckChange(data, checked, indeterminate) {
            if (
                data.guid == -1 ||
                data.guid == -11 ||
                data.guid == -12 ||
                data.guid == -13
            ) {
                return;
            }
            for (var i = 0; i < this.elementArr.length; i++) {
                var item = this.elementArr[i];
                if (item.get_guid() == data.guid) {
                    item.set_is_visible(checked);
                    break;
                }
            }

            this.setElementVisible(this.treeData[0], data.guid, checked);

            if (checked && this.checkData.indexOf(data.guid) == -1) {
                this.checkData.push(data.guid);
            } else if (!checked && this.checkData.indexOf(data.guid) != -1) {
                this.checkData.splice(this.checkData.indexOf(data.guid), 1);
            }
        },
        setElementVisible(data, guid, checked) {
            //设置对象显隐属性，并保存到DB
            if (!data) {
                return;
            }
            if (data.children && data.children.length) {
                for (var i = 0; i < data.children.length; i++) {
                    this.setElementVisible(data.children[i], guid, checked);
                }
            } else {
                if (data.guid == guid) {
                    data.visibility = checked;
                    localStorage.saveElementToDB(
                        this.stampAPI.usearth,
                        "emergencyPlot",
                        this.treeData
                    );
                }
            }
        },
        CreatePreviewByStyle(symbol, style, width, height, type) {
            var preview = null;
            try {
                var symbolStyle =
                    this.stampAPI.usearth.Factory.createSymbolStyle();
                symbolStyle.libraryName = style.libraryName;
                symbolStyle.symbolId = style.symbolId;
                symbolStyle.color = style.color;
                symbolStyle.size = style.size;
                symbolStyle.width = style.width;
                symbolStyle.outlineWidth = style.outlineWidth;
                symbolStyle.outlineColor = style.outlineColor;

                preview = symbol.createPreview(width, height, symbolStyle);
            } catch (e) {}

            return preview;
        },
    },
    computed: {
        treeData() {
            return this.g_ElementData["emergencyPlot"]["elementJson"];
        },
        toolItem() {
            return this.$store.state.toolItem.item;
        },
        elementArr() {
            if (this.g_ElementData["emergencyPlot"]) {
                return this.g_ElementData["emergencyPlot"].elementArr;
            } else {
                return [];
            }
        },
    },
    mounted() {
        this.$nextTick(() => {
            var libname = emergencyPlot.libraryName; //config.baseUrlString + "Assets/emergencyPlotting.symlib";
            var templib = libname; //.indexOf("sde?");
            //templib = libname.substr(templib+4);
            var slib =
                this.stampAPI.usearth.Factory.createSymbolLibrary(libname);

            var self = this;
            var count = 0;
            var interv = setInterval(function () {
                if (slib.styleParseState) {
                    clearInterval(interv);
                    var symbolMap = null;
                    self.symlibcfg = {};
                    self.symlibcfg["point"] = [];

                    for (var key in slib.markMap) {
                        var s = slib.markMap[key];
                        if (s) {
                            var style = {
                                libraryName: templib,
                                symbolId: s.id,
                                color: s.editColor,
                                size: s.editWidth,
                                width: s.editWidth,
                                outlineWidth: s.editOutlineWidth,
                                outlineColor: s.editOutlineColor,
                            };
                            var preview = self.CreatePreviewByStyle(
                                s,
                                style,
                                40,
                                40
                            );
                            if (preview) {
                                var strDataURI = preview.toDataURL("image/png");
                                self.symlibcfg["point"].push({
                                    id: s.id,
                                    name: s.name,
                                    img: strDataURI,
                                    index: self.symlibcfg["point"].length,
                                    color: s.editColor,
                                    size: s.editWidth,
                                    width: s.editWidth,
                                    outlineWidth: s.editOutlineWidth,
                                    outlineColor: s.editOutlineColor,
                                });
                            }
                        }
                    }
                    self.symlibcfg["line"] = [];
                    for (var key in slib.lineMap) {
                        var s = slib.lineMap[key];
                        if (s) {
                            var style = {
                                libraryName: templib,
                                symbolId: s.id,
                                color: s.editColor,
                                size: s.editWidth,
                                width: s.editWidth,
                                outlineWidth: s.editOutlineWidth,
                                outlineColor: s.editOutlineColor,
                            };
                            var preview = self.CreatePreviewByStyle(
                                s,
                                style,
                                40,
                                40
                            );
                            if (preview) {
                                var strDataURI = preview.toDataURL("image/png");
                                self.symlibcfg["line"].push({
                                    id: s.id,
                                    name: s.name,
                                    img: strDataURI,
                                    index: self.symlibcfg["line"].length,
                                    color: s.editColor,
                                    size: s.editWidth,
                                    width: s.editWidth,
                                    outlineWidth: s.editOutlineWidth,
                                    outlineColor: s.editOutlineColor,
                                });
                            }
                        }
                    }
                    self.symlibcfg["polygon"] = [];
                    for (var key in slib.fillMap) {
                        var s = slib.fillMap[key];
                        if (s) {
                            var style = {
                                libraryName: templib,
                                symbolId: s.id,
                                color: s.editColor,
                                size: s.editWidth,
                                width: s.editWidth,
                                outlineWidth: s.editOutlineWidth,
                                outlineColor: s.editOutlineColor,
                            };
                            var preview = self.CreatePreviewByStyle(
                                s,
                                style,
                                40,
                                40
                            );
                            if (preview) {
                                var strDataURI = preview.toDataURL("image/png");
                                self.symlibcfg["polygon"].push({
                                    id: s.id,
                                    name: s.name,
                                    img: strDataURI,
                                    index: self.symlibcfg["polygon"].length,
                                    color: s.editColor,
                                    size: s.editWidth,
                                    width: s.editWidth,
                                    outlineWidth: s.editOutlineWidth,
                                    outlineColor: s.editOutlineColor,
                                });
                            }
                        }
                    }
                }

                if (count > 5) {
                    clearInterval(interv);
                    self.symlibcfg = {};
                    self.symlibcfg["point"] = [];
                    self.symlibcfg["line"] = [];
                    self.symlibcfg["polygon"] = [];
                }
                count++;
            });
        });

        for (var i = 0; i < this.elementArr.length; i++) {
            if (
                this.elementArr[i] &&
                this.elementArr[i].get_is_visible &&
                this.elementArr[i].get_is_visible()
            ) {
                this.checkData.push(this.elementArr[i].get_guid());
            }
        }
    },
};
</script>

<style lang="less" scoped>
.military {
    .el-row {
        margin-top: 0.5vh;
    }
    .el-col {
        button {
            color: #ffffff;
            background-color: #99d9ea;
            outline: none;
            border: none;
            font-weight: 400;
            margin-top: 0.5vh;
            width: 66px;
            height: 30px;
            &.selectedBtn {
                background-color: #00a2e8;
            }
        }
    }
    .tabContainer {
        height: calc(50vh - 76px);
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
        background-color: #4b96ed;
    }

    .treeContainer {
        height: calc(50vh - 76px);
        .tree-scrollbar-wrapper {
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

        /deep/ .el-tree-node__content:hover {
            background-color: rgba(24, 144, 255, 0.7);
        }
        /deep/ .el-tree-node:focus > .el-tree-node__content {
            background-color: rgba(24, 144, 255, 0.7);
        }

        /deep/ .el-dialog__title,
        /deep/ .el-dialog__body {
            color: #fff;
        }
    }
    .itemDiv {
        margin: 10px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        .imgDiv {
            height: 78px;
            width: 33.3%;
            display: flex;
            flex-direction: column;
            // justify-content: center;
            align-items: center;
            box-sizing: border-box;
            .img {
                width: 40px;
                height: 40px;
            }
            span {
                color: #ffffff;
                font-size: 10px;
                font-family: "Helvetica Neue", Helvetica, "PingFang SC",
                    "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial,
                    sans-serif;
            }
        }
    }
}
</style>