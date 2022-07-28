<template>
    <div class="tree">
        <el-scrollbar wrap-class="scrollbar-wrapper">
            <el-tree
                ref="tree"
                :data="labelData"
                :props="defaultProps"
                :default-checked-keys="labelCheckData"
                :default-expanded-keys="expandData"
                :expand-on-click-node="false"
                :show-checkbox="showCheck"
                node-key="guid"
                highlight-current
                @check-change="handleCheckChange"
                @node-click="handleNodeClick"
                @node-contextmenu="rightClick"
            />
            <rightMenu ref="rightMenu" />
            <particular ref="particular" @saveParticular="saveParticular" />
            <objectDialog ref="objectDialog" />
            <editNameDialog ref="editNameDialog" />
        </el-scrollbar>
    </div>
</template>
<script>
// import popover from "@/components/Popover";
import localStorage from "@/stamplib/LocalStorage";
import { debounce } from "lodash";
import Location from "@/stamplib/Location";
import rightMenu from "../common/rightMenu.vue";
import particular from "../draw/elementDynamic/particular";
import editNameDialog from "../common/editName.vue"; //编辑图层的编辑模块
import objectDialog from "views/draw/object";
import drawObj from "../draw/index";
import Mark from "@/stamplib/Mark"; //创建点的方法
import { createGuid } from "@/utils";
export default {
    data() {
        return {
            defaultProps: {
                children: "children",
                label: "name",
            },
            expandData: [],
            clickCount: 0,
            showCheck: true,
        };
    },
    components: {
        // popover,
        rightMenu,
        particular,
        editNameDialog,
        objectDialog,
    },
    computed: {
        labelData() {
            return this.$store.state.labelData;
        },
        labelCheckData() {
            return this.$store.state.labelCheckData;
        },
        elementArr() {
            if (this.g_ElementData["elementLabel"]) {
                return this.g_ElementData["elementLabel"].elementArr;
            } else {
                return [];
            }
        },
    },
    // 监听打开标注管理的勾选问题
    watch: {
        labelCheckData(newV, oldV) {
            var self = this;
            if (self.$refs.tree) {
                self.$nextTick(function () {
                    self.$refs.tree.setCheckedKeys(self.labelCheckData);
                    self.expandData = self.labelCheckData; //所有的guid
                });
            }
        },
    },
    mounted() {
        var self = this;
        self.initTreeData();
    },
    methods: {
        saveParticular(options) {},
        initTreeData() {
            let self = this;
            self.expandData = [];
            for (let i = 0; i < self.labelData[0].children.length; i++) {
                let dataItem = self.labelData[0].children[i];
                self.expandData.push(dataItem.guid);
                if (dataItem.children && dataItem.children.length > 0) {
                    for (let j = 0; j < dataItem.children.length; j++) {
                        if (dataItem.children[j].visibility) {
                            self.labelCheckData.push(dataItem.children[j].guid);
                        }
                    }
                } else {
                    if (dataItem.visibility) {
                        self.labelCheckData.push(dataItem.guid);
                    }
                }
            }
            if (this.drawType == "publishObject") {
                this.showCheck = false;

                var inter = setInterval(function () {
                    let flag = true;
                    for (
                        var k = 0;
                        k < self.labelData[0].children.length;
                        k++
                    ) {
                        let option = self.labelData[0].children[i];
                        if (option.value < 100 && option.status == 0) {
                            flag = false;
                            getProcess(option.layerType, option.layerType)
                                .then((res) => {
                                    if (res.data && res.data.result) {
                                        var taskCount = Number(
                                            res.data.result.taskCount
                                        );
                                        var taskIndex = Number(
                                            res.data.result.curTaskIndex
                                        );
                                        if (taskCount == 0) {
                                            return;
                                        }
                                        for (
                                            var ind = 0;
                                            ind < self.data[0].children.length;
                                            ind++
                                        ) {
                                            var item =
                                                self.data[0].children[ind];
                                            if (
                                                item.guid == option.guid &&
                                                item.value < 100
                                            ) {
                                                var tempIndex = taskIndex;
                                                if (taskIndex > 1) {
                                                    tempIndex = taskIndex - 1;
                                                }
                                                var base =
                                                    tempIndex / taskCount;
                                                item.value = Math.ceil(
                                                    base * 100
                                                );
                                                localStorage.saveElementToDB(
                                                    self.stampAPI.usearth,
                                                    self.drawType,
                                                    self.data
                                                );
                                                break;
                                            }
                                        }
                                    } else {
                                    }
                                })
                                .catch((err) => {});
                        }
                    }
                    if (flag) {
                        clearInterval(inter);
                    }
                }, 10000);
            } else {
                this.showCheck = true;
            }
        },
        handleClose() {
            // this.$router.push("/");
        },
        handleCheckChange(data, checked, indeterminate) {
            if (data.guid == -1) {
                return;
            }
            for (var i = 0; i < this.elementArr.length; i++) {
                var item = this.elementArr[i];
                if (item.get_guid() == data.guid) {
                    if (item.track) {
                        item.track.set_is_visible(checked);

                        if (!checked) {
                            item.track.stop();
                        } else if (checked) {
                            this.stampAPI.usearth.TrackControl.SetMainTrack(
                                item.track.get_guid(),
                                3
                            );
                            item.track.bind_object = item.model;
                            item.track.play(true);
                        }
                    }
                    if (item.model) {
                        item.model.set_is_visible(checked);
                    }
                    item.set_is_visible(checked);
                    break;
                }
            }
            this.setElementVisible(this.labelData[0], data.guid, checked);

            if (checked && this.labelCheckData.indexOf(data.guid) == -1) {
                this.labelCheckData.push(data.guid);
            } else if (
                !checked &&
                this.labelCheckData.indexOf(data.guid) != -1
            ) {
                this.labelCheckData.splice(
                    this.labelCheckData.indexOf(data.guid),
                    1
                );
            }
        },
        setElementVisible(data, guid, checked) {
            // 设置对象显隐属性，并保存到DB
            if (!data) {
                return;
            }
            if (data.children && data.children.length) {
                for (var i = 0; i < data.children.length; i++) {
                    this.setElementVisible(data.children[i], guid, checked);
                }
            } else {
                if (data.guid == guid) {
                    if (data.lineObj) {
                        data.visibility = checked;
                        var line_id = data.lineObj.guid;
                        for (let i = 0; i < this.elementArr.length; i++) {
                            if (line_id == this.elementArr[i]._id) {
                                this.elementArr[i].set_is_visible(checked);
                            }
                        }
                    } else {
                        data.visibility = checked;
                    }

                    localStorage.saveElementToDB(
                        this.stampAPI.usearth,
                        "elementLabel",
                        this.labelData
                    );
                }
            }
        },
        handleNodeClick(data) {
            this.clickCount++;
            const fnEmitDbClick = debounce(() => {
                if (this.clickCount > 1) {
                    this.treeNodeDbClick(data);
                }
                this.clickCount = 0;
            }, 200);
            fnEmitDbClick();
        },
        treeNodeDbClick(data) {
            if (!data) {
                return;
            }
            if (data.children) {
                // 父节点，忽略
                return;
            }
            for (var i = 0; i < this.elementArr.length; i++) {
                if (this.elementArr[i].get_guid() == data.guid) {
                    var location = this.elementArr[i].transform;
                    Location.flyToRadians(
                        this.stampAPI.usearth,
                        location.longitude,
                        location.latitude,
                        location.altitude + 200,
                        0,
                        -90,
                        0
                    ); // 目前暂定为200
                    if (
                        this.elementArr[i]._rtti != 569 &&
                        this.elementArr[i]._rtti != 570
                    ) {
                        this.elementArr[i].show_high_light();
                    }

                    if (
                        this.elementArr[i].track &&
                        this.elementArr[i].track.get_is_visible() &&
                        this.elementArr[i].track.status == 0
                    ) {
                        this.stampAPI.usearth.TrackControl.SetMainTrack(
                            this.elementArr[i].track.get_guid(),
                            3
                        );
                        this.elementArr[i].track.bind_object =
                            this.elementArr[i].model;
                        this.elementArr[i].track.play(true);
                    }
                    break;
                }
            }
        },
        // 编辑节点
        editFolder(data) {
            var self = this;
            self.$refs.editNameDialog.show({
                title: "编辑",
                data: data.name,
                callbackOK: function (name) {
                    data.name = name;
                    localStorage.saveElementToDB(
                        self.stampAPI.usearth,
                        "elementLabel",
                        self.labelData
                    );
                },
            });
        },
        // 刪除节点
        removeNodeData(sdata, dataItem) {
            // 删除节点数据
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
        removeElement(level, data) {
            // 删除节点
            var self = this;
            var earth = self.stampAPI.usearth;
            self.removeNodeElement(data);
            if (level == 1) {
                self.labelData[0].children = [];
            } else {
                self.removeNodeData(self.labelData[0], data);
            }
            localStorage.saveElementToDB(earth, "elementLabel", self.labelData); // 存库DB
        },
        removeNodeElement(dataItem) {
            // 删除球上Element对象
            var self = this;
            var earth = self.stampAPI.usearth;
            var children = dataItem.children;
            if (children && children.length > 0) {
                for (var i = 0; i < children.length; i++) {
                    var item = children[i];
                    self.removeNodeElement(item);
                }
            } else {
                if (dataItem.guidArr && dataItem.guidArr.length>0) {
                    for (var i = self.elementArr.length - 1; i >= 0; i--) {
                        var item = self.elementArr[i];
                        if (dataItem.guidArr.indexOf(item.get_guid()) > -1) {
                            try {
                                if (item.parentLayer) {
                                    item.parentLayer.detach_object(item);
                                } else {
                                    earth.document.elementRoot.detach_object(
                                        item
                                    );
                                }
                            } catch (ex) {}
                            self.elementArr.splice(i, 1);
                        }
                    }
                } else {
                    for (var i = 0; i < self.elementArr.length; i++) {
                        var item = self.elementArr[i];
                        if (item.get_guid() == dataItem.guid) {
                            try {
                                if (item.track) {
                                    if (item.track.status != 0) {
                                        item.track.stop();
                                    }
                                    item.track.Suicide();
                                }
                                if (item.model) {
                                    window.g_DynamicLayer.detach_object(
                                        item.model
                                    );
                                }
                                if (item.parentLayer) {
                                    item.parentLayer.detach_object(item);
                                } else {
                                    earth.document.elementRoot.detach_object(
                                        item
                                    );
                                }
                            } catch (ex) {}
                            self.elementArr.splice(i, 1);
                            if (dataItem.lineObj) {
                                for (
                                    let j = 0;
                                    j < self.elementArr.length;
                                    j++
                                ) {
                                    let item1 = self.elementArr[j];
                                    if (dataItem.lineObj.guid == item1._id) {
                                        item1.set_is_visible(false);
                                        self.elementArr.splice(j, 1);
                                        break;
                                    }
                                }
                            }
                            break;
                        }
                    }
                }

                if (self.labelCheckData.indexOf(dataItem.guid) != -1) {
                    self.labelCheckData.splice(
                        self.labelCheckData.indexOf(dataItem.guid),
                        1
                    );
                }
            }
        },
        rightClick(e, data, node, comp) {
            const self = this;
            var level = node.level;
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
                            level == 1 || self.drawType == "publishObject"
                                ? "hiddenClass"
                                : "",
                        callback: function () {
                            if (level != 1 && data.children) {
                                self.editFolder(data);
                            } else {
                                if (
                                    drawObj[data.type] &&
                                    typeof drawObj[data.type].edit ===
                                        "function"
                                ) {
                                    drawObj[data.type].edit(self, data);
                                } else {
                                    self.$refs.particular.particularVisisble = true;
                                    self.$refs.particular.options = data;
                                    for (
                                        var i = 0;
                                        i < self.elementArr.length;
                                        i++
                                    ) {
                                        var item = self.elementArr[i];
                                        if (item.get_guid() == data.guid) {
                                            self.$particleObj = item;
                                        }
                                    }
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
                                        typeof drawObj[data.type].delete ===
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
    },
};
</script>
<style scoped lang="less">
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

/deep/.el-dialog__body {
    height: calc(100% - 62px);
}

.layerPanel-items {
    height: 100%;
}

/deep/ .el-tree-node__content:hover {
    background-color: rgba(255, 174, 3, 0.6);
}
/deep/ .el-tree-node:focus > .el-tree-node__content {
    background-color: rgba(255, 174, 3, 0.6);
}
/deep/ .scrollbar-wrapper {
    overflow-x: hidden !important;
}

.el-scrollbar {
    height: 100%;
}

.is-horizontal {
    display: none;
}
</style>