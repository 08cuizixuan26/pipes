<template>
    <popoverStat
        :visible.sync="dialogVisible"
        :show-header="true"
        title="关联查询"
        custom-class="QuerySpatial"
        :beforeClose="handleClose"
        :dblClick="handleDblclick"
    >
        <el-row
            v-show="!detailInfoShow"
            v-loading="loading"
            element-loading-background="rgba(0, 0, 0, 0.6)"
            element-loading-text="正在查询"
            element-loading-spinner="el-icon-loading"
            element-loading-custom-class="loading_color"
        >
            <el-col :span="10">
                <el-row>
                    <el-form>
                        <el-form-item label="图层：" label-width="65px">
                            <el-select
                                v-model="selectLayer"
                                @change="handleLayerChange"
                                class="inputAssociate"
                            >
                                <el-option
                                    v-for="(item, index) in layerList"
                                    :key="index"
                                    :label="item.name"
                                    :value="item.id"
                                ></el-option>
                            </el-select>
                            <el-button
                                @click.prevent="getFields"
                                type="primary"
                                size="mini"
                                class="afterUnit"
                                :disabled="layerList.length == 0"
                                >获取字段</el-button
                            >
                        </el-form-item>
                        <el-form-item label="点字段：" label-width="65px">
                            <el-select
                                v-model="selectPoint"
                                class="inputAssociate"
                            >
                                <el-option
                                    v-for="(item, index) in pointList"
                                    :key="index"
                                    :label="item.label"
                                    :value="item.name"
                                ></el-option>
                            </el-select>
                            <el-button
                                @click.prevent="getPointValue"
                                type="primary"
                                size="mini"
                                class="afterUnit"
                                :disabled="pointList.length == 0"
                                >获取值域</el-button
                            >
                        </el-form-item>
                        <el-form-item label="线字段：" label-width="65px">
                            <el-select
                                v-model="selectLine"
                                class="inputAssociate"
                            >
                                <el-option
                                    v-for="(item, index) in lineList"
                                    :key="index"
                                    :label="item.label"
                                    :value="item.name"
                                ></el-option>
                            </el-select>
                            <el-button
                                @click.prevent="getLineValue"
                                type="primary"
                                size="mini"
                                class="afterUnit"
                                :disabled="lineList.length == 0"
                                >获取值域</el-button
                            >
                        </el-form-item>
                    </el-form>
                </el-row>
                <el-row class="leftDiv">
                    <el-col :span="12">
                        <span>点字段值域：</span>
                    </el-col>
                    <el-col :span="12">
                        <span style="margin-left: 5px">线字段值域：</span>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-row class="layer_container">
                            <el-scrollbar
                                style="height: 100%"
                                wrap-class="scrollbar-wrapper"
                            >
                                <el-tree
                                    :data="pointTreeData"
                                    :props="defaultProps"
                                    highlight-current
                                    @node-click="handlePointNodeClick"
                                >
                                </el-tree>
                            </el-scrollbar>
                        </el-row>
                    </el-col>
                    <el-col :span="12">
                        <el-row class="layer_container">
                            <el-scrollbar
                                style="height: 100%"
                                wrap-class="scrollbar-wrapper"
                            >
                                <el-tree
                                    :data="lineTreeData"
                                    :props="defaultProps"
                                    highlight-current
                                    @node-click="handleLineNodeClick"
                                >
                                </el-tree>
                            </el-scrollbar>
                        </el-row>
                    </el-col>
                </el-row>
                <el-row class="centerDiv">
                    <el-radio-group
                        v-model="typeId"
                        @change="handleRadioChange"
                    >
                        <el-radio label="point">查询管点</el-radio>
                        <el-radio label="line">查询管线</el-radio>
                    </el-radio-group>
                </el-row>
                <el-row class="centerDiv">
                    <!-- <el-button
                        type="primary"
                        size="mini"
                        @click="query(0)"
                        :disabled="!selectLineNode || !selectPointNode"
                        >全部</el-button
                    > -->
                    <el-button
                        type="primary"
                        size="mini"
                        @click="query(1)"
                        :disabled="!selectLineNode || !selectPointNode"
                        >圆域</el-button
                    >
                    <el-button
                        type="primary"
                        size="mini"
                        @click="query(2)"
                        :disabled="!selectLineNode || !selectPointNode"
                        >多边形</el-button
                    >
                </el-row>
            </el-col>
            <el-col :span="14">
                <el-row>
                    <div class="chartContainerClass">
                        <div class="chartTotalDiv" v-show="!isExportDisabled">
                            <div class="chartTotalInner">
                                <el-tooltip
                                    :content="staticTotalHover"
                                    popper-class="tooltipColor"
                                    effect="dark"
                                    placement="top"
                                >
                                    <div class="chartTotalValue">
                                        <div
                                            :style="
                                                'line-height:' +
                                                (!staticTotalSize ? '6' : '7') +
                                                'vw;'
                                            "
                                            class="chartTotalCount"
                                        >
                                            {{
                                                staticTotalCount
                                                    ? staticTotalCount
                                                    : ""
                                            }}
                                        </div>
                                        <div class="chartTotalSize">
                                            {{
                                                staticTotalSize
                                                    ? staticTotalSize
                                                    : ""
                                            }}
                                        </div>
                                    </div>
                                </el-tooltip>
                            </div>
                        </div>
                    </div>
                </el-row>
                <el-row class="centerDiv">
                    <el-button
                        type="primary"
                        size="mini"
                        @click="detailClick()"
                        :disabled="isExportDisabled"
                        >详细信息</el-button
                    >
                    <el-button
                        type="primary"
                        size="mini"
                        @click="exportResult"
                        :disabled="isExportDisabled"
                        :loading="isExportLoading"
                        >导出</el-button
                    >
                </el-row>
            </el-col>
        </el-row>

        <el-row v-show="detailInfoShow">
            <el-row>
                <el-col :span="24">
                    <div class="title-name">详细信息</div>
                </el-col>
                <transition name="el-fade-in">
                    <el-button
                        v-show="detailInfoShow"
                        class="backbutton"
                        icon="el-icon-back"
                        size="mini"
                        type="primary"
                        @click="backToList"
                    />
                </transition>
            </el-row>
            <el-table
                :data="tableData"
                @row-dblclick="getDetailInfo"
                highlight-current-row
                border
                stripe
            >
                <el-table-column
                    v-for="(item, i) in tableHeader[typeId]"
                    :key="i"
                    :prop="item.name"
                    :label="item.label"
                    :show-overflow-tooltip="true"
                    header-align="center"
                    align="center"
                    :min-width="colWidth"
                ></el-table-column>
            </el-table>
            <el-pagination
                :current-page="currentPage"
                :page-size="pageSize"
                :total="recordNum"
                layout="total, prev, pager, next"
                @current-change="handleCurrentChange"
            />
        </el-row>
    </popoverStat>
</template>

<script>
import popoverStat from "@/components/popoverStat";
import {
    getPipeList,
    queryFunc,
    querySpatialCondition,
    getDetailData,
    getTableHeader,
    getNameNoIgnoreCase,
    getNameNoIgnoreCaseByStandard,
    getRecordInfo,
} from "./QueryCommon";
import ExcelJS from "exceljs";
import * as FileSaver from "file-saver";

export default {
    components: {
        popoverStat,
    },
    data() {
        this.lastHighlight_layer = [];
        return {
            dialogVisible: true,
            treeData: [],
            defaultProps: {
                children: "children",
                label: "name",
            },
            selectLayer: "",
            checklist: [],
            layerList: [],
            selectPoint: "",
            pointList: [],
            selectLine: "",
            lineList: [],
            pointTreeData: [],
            lineTreeData: [],
            tableHeader: { line: [], point: [] },
            tableData: [],
            detailInfoShow: false,
            detailInfo: [],
            currentPage: 1,
            recordNum: 0,
            detailCheckbox: false,
            isExportDisabled: true,
            isExportLoading: false,
            sc: "",
            pc: "",
            numArr: { line: [], point: [] },
            typeId: "line",
            selectPointNode: null,
            selectLineNode: null,
            resultData: [],
            staticTotalCount: 0,
            staticTotalSize: "",
            staticTotalHover: "",
            loading: false,
            colWidth: 0.06 * window.window.innerWidth,
        };
    },
    computed: {
        pageSize() {
            return Math.floor(295 / 36 - 1);
        },
        pipelineData() {
            return this.$store.state.pipelineLayerData;
        },
    },
    mounted() {
        this.layerList = [];
        getPipeList(this, this.pipelineData);
        if (this.layerList.length > 0) {
            this.selectLayer = this.layerList[0].id;
        }

        this.tableHeader = { line: [], point: [] };
        getTableHeader(this);
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
    methods: {
        handleClose() {
            this.$router.push("/");
        },
        handleDblclick() {},
        handleLayerChange() {
            this.clearChart();
        },
        getFields() {
            this.handleRadioChange();

            let postArr = [];
            postArr.push({
                service: this.selectLayer,
                qt: 0,
                dt: "point",
                encoding: "utf-8",
            });
            postArr.push({
                service: this.selectLayer,
                qt: 0,
                dt: "line",
                encoding: "utf-8",
            });

            let self = this;
            self.selectPointNode = null;
            self.selectLineNode = null;
            self.pointList = [];
            self.lineList = [];
            self.loading = true;
            Promise.all(postArr.map(queryFunc))
                .then((res) => {
                    if (res.length > 0) {
                        var json = self.$x2js.xml2js(res[0].data).Xml;

                        if (
                            json &&
                            json.MetaData &&
                            json.MetaData.Table &&
                            json.MetaData.Table.Field
                        ) {
                            var records = json.MetaData.Table.Field;
                            Array.isArray(records) || (records = [records]);

                            let key = getNameNoIgnoreCaseByStandard(
                                self.tableHeader["point"],
                                "US_KEY",
                                true
                            );
                            for (let i = 0; i < records.length; i++) {
                                if (key == records[i].Name) {
                                    continue;
                                }
                                let label = getNameNoIgnoreCase(
                                    self.tableHeader["point"],
                                    records[i].Name,
                                    false
                                );
                                if (label) {
                                    self.pointList.push({
                                        name: records[i].Name,
                                        type: records[i].Type,
                                        label: label,
                                    });
                                }
                            }
                        }
                    }
                    if (res.length > 1) {
                        var json = self.$x2js.xml2js(res[1].data).Xml;

                        if (
                            json &&
                            json.MetaData &&
                            json.MetaData.Table &&
                            json.MetaData.Table.Field
                        ) {
                            var records = json.MetaData.Table.Field;
                            Array.isArray(records) || (records = [records]);

                            let key = getNameNoIgnoreCaseByStandard(
                                self.tableHeader["line"],
                                "US_KEY",
                                true
                            );
                            for (let i = 0; i < records.length; i++) {
                                if (key == records[i].Name) {
                                    continue;
                                }
                                let label = getNameNoIgnoreCase(
                                    self.tableHeader["line"],
                                    records[i].Name,
                                    false
                                );
                                if (label) {
                                    self.lineList.push({
                                        name: records[i].Name,
                                        type: records[i].Type,
                                        label: label,
                                    });
                                }
                            }
                        }
                    }

                    if (self.pointList.length > 0) {
                        self.selectPoint = self.pointList[0].name;
                    }
                    if (self.lineList.length > 0) {
                        self.selectLine = self.lineList[0].name;
                    }
                })
                .finally(() => {
                    self.loading = false;
                });
        },
        getPointValue() {
            this.handleRadioChange();

            let params = {
                service: this.selectLayer,
                qt: 256,
                fd: this.selectPoint,
                dt: "point",
                encoding: "utf-8",
            };

            let self = this;
            self.selectPointNode = null;
            self.pointTreeData = [];
            self.loading = true;
            queryFunc(params)
                .then(function (res) {
                    var json = self.$x2js.xml2js(res.data).Xml;
                    if (
                        json &&
                        json.ValueRangeResult &&
                        json.ValueRangeResult.ValueRange &&
                        json.ValueRangeResult.ValueRange.Value
                    ) {
                        var records = json.ValueRangeResult.ValueRange.Value;
                        Array.isArray(records) || (records = [records]);

                        self.pointTreeData = [];
                        for (let i = 0; i < records.length; i++) {
                            if (records[i]) {
                                self.pointTreeData.push({
                                    name: records[i],
                                    label: records[i],
                                });
                            }
                        }
                    }
                })
                .finally(() => {
                    self.loading = false;
                });
        },
        getLineValue() {
            this.handleRadioChange();

            let params = {
                service: this.selectLayer,
                qt: 256,
                fd: this.selectLine,
                dt: "line",
                encoding: "utf-8",
            };

            let self = this;
            self.selectLineNode = null;
            self.lineTreeData = [];
            self.loading = true;
            queryFunc(params)
                .then(function (res) {
                    var json = self.$x2js.xml2js(res.data).Xml;
                    if (
                        json &&
                        json.ValueRangeResult &&
                        json.ValueRangeResult.ValueRange &&
                        json.ValueRangeResult.ValueRange.Value
                    ) {
                        var records = json.ValueRangeResult.ValueRange.Value;
                        Array.isArray(records) || (records = [records]);

                        self.lineTreeData = [];
                        for (let i = 0; i < records.length; i++) {
                            if (records[i]) {
                                self.lineTreeData.push({
                                    name: records[i],
                                    label: records[i],
                                });
                            }
                        }
                    }
                })
                .finally(() => {
                    self.loading = false;
                });
        },
        handlePointNodeClick(data) {
            this.selectPointNode = data;
        },
        handleLineNodeClick(data) {
            this.selectLineNode = data;
        },
        handleRadioChange() {
            this.resultData = [];
            this.tableData = [];
            this.staticTotalCount = 0;
            this.staticTotalSize = "";
            this.staticTotalHover = "";
            this.isExportDisabled = true;
        },
        clearChart() {
            this.staticTotalCount = 0;
            this.staticTotalSize = "";
            this.staticTotalHover = "";
        },
        query(index) {
            let self = this;

            self.clearChart();
            self.sc = "";
            self.recordNum = 0;
            self.currentPage = 1;
            self.detailInfoShow = false;

            this.handleRadioChange();

            querySpatialCondition(this, index, function () {
                let postArr = [];
                postArr.push({
                    service: self.selectLayer,
                    qt: 17,
                    dt: "point",
                    sc: self.sc,
                    pc: `(and,equal,${self.selectPoint},${self.selectPointNode.name})`,
                    encoding: "utf-8",
                    pg: "0,10000",
                });
                postArr.push({
                    service: self.selectLayer,
                    qt: 17,
                    dt: "line",
                    sc: self.sc,
                    pc: `(and,equal,${self.selectLine},${self.selectLineNode.name})`,
                    encoding: "utf-8",
                    pg: "0,10000",
                });

                self.loading = true;

                let layerObj =
                    self.stampAPI.usearth.LayerManager.GetLayerByGUID(
                        self.selectLayer
                    );
                let layername = layerObj ? layerObj._name : "";
                Promise.all(postArr.map(queryFunc))
                    .then((res) => {
                        if (res.length > 1) {
                            let json = self.$x2js.xml2js(res[0].data).Xml;

                            let jsonL = self.$x2js.xml2js(res[1].data).Xml;
                            if (
                                json &&
                                json.Result &&
                                json.Result.Record &&
                                jsonL &&
                                jsonL.Result &&
                                jsonL.Result.Record
                            ) {
                                let records = json.Result.Record;
                                Array.isArray(records) || (records = [records]);

                                let recordsL = jsonL.Result.Record;
                                Array.isArray(recordsL) ||
                                    (recordsL = [recordsL]);

                                let pArr = [];
                                let lArr = [];
                                let pNameArr = [];
                                let lNameArr = [];
                                for (let k = 0; k < records.length; k++) {
                                    let pointName =
                                        getNameNoIgnoreCaseByStandard(
                                            self.tableHeader.point,
                                            "US_KEY",
                                            true
                                        );

                                    for (let m = 0; m < recordsL.length; m++) {
                                        let sName =
                                            getNameNoIgnoreCaseByStandard(
                                                self.tableHeader.line,
                                                "US_SPT_KEY",
                                                true
                                            );

                                        let eName =
                                            getNameNoIgnoreCaseByStandard(
                                                self.tableHeader.line,
                                                "US_EPT_KEY",
                                                true
                                            );

                                        let lineName =
                                            getNameNoIgnoreCaseByStandard(
                                                self.tableHeader.line,
                                                "US_KEY",
                                                true
                                            );

                                        if (
                                            recordsL[m][sName] ==
                                                records[k][pointName] ||
                                            recordsL[m][eName] ==
                                                records[k][pointName]
                                        ) {
                                            if (
                                                pNameArr.indexOf(
                                                    records[k][pointName]
                                                ) == -1
                                            ) {
                                                pArr.push(records[k]);
                                                pNameArr.push(
                                                    records[k][pointName]
                                                );
                                            }
                                            if (
                                                lNameArr.indexOf(
                                                    recordsL[m][lineName]
                                                ) == -1
                                            ) {
                                                lArr.push(recordsL[m]);
                                                lNameArr.push(
                                                    recordsL[m][lineName]
                                                );
                                            }
                                        }
                                    }
                                }

                                if (self.typeId == "point" && pArr.length > 0) {
                                    for (let i = 0; i < pArr.length; i++) {
                                        self.resultData.push(
                                            getRecordInfo(
                                                pArr[i],
                                                layername,
                                                self.selectLayer,
                                                "point"
                                            )
                                        );
                                    }
                                }

                                if (self.typeId == "line" && lArr.length > 0) {
                                    for (let i = 0; i < lArr.length; i++) {
                                        self.resultData.push(
                                            getRecordInfo(
                                                lArr[i],
                                                layername,
                                                self.selectLayer,
                                                "line"
                                            )
                                        );
                                    }
                                }

                                self.recordNum = self.resultData.length;
                            }
                        }

                        if (self.recordNum > 0) {
                            self.isExportDisabled = false;

                            self.staticTotalSize = "";
                            self.staticTotalCount = self.recordNum;
                            self.staticTotalHover = self.recordNum.toString();
                        } else {
                            self.$message({
                                type: "warning",
                                message: "查询结果为空",
                            });
                        }
                    })
                    .finally(() => {
                        self.loading = false;
                    });
            });
        },
        backToList() {
            this.detailInfoShow = false;
        },
        getDetailInfo(row) {
            getDetailData(this, row);
        },
        handleCurrentChange(currentPage) {
            this.currentPage = currentPage;
            this.pageInfo();
        },
        exportResult() {
            this.isExportLoading = true;

            let self = this;

            const workbook = new ExcelJS.Workbook();

            if (self.typeId == "line") {
                var sheet = workbook.addWorksheet("管线信息"); //创建一个工作组
                //创建列

                let tempArr = [];
                for (let i = 0; i < self.tableHeader.line.length; i++) {
                    tempArr.push({
                        header: self.tableHeader.line[i].label,
                        key: self.tableHeader.line[i].name,
                        width: 20,
                    });
                }
                sheet.columns = tempArr;

                sheet.addRows(self.resultData); //创建行
            } else if (self.typeId == "point") {
                var sheet = workbook.addWorksheet("管点信息"); //创建一个工作组
                let tempArr1 = [];
                for (let i = 0; i < self.tableHeader.point.length; i++) {
                    tempArr1.push({
                        header: self.tableHeader.point[i].label,
                        key: self.tableHeader.point[i].name,
                        width: 20,
                    });
                }
                //创建列
                sheet.columns = tempArr1;

                sheet.addRows(self.resultData); //创建行
            }

            var filename = "查询结果.xlsx";
            workbook.xlsx.writeBuffer().then((data) => {
                const blob = new Blob([data], {
                    type: "application/octet-stream",
                });
                FileSaver.saveAs(blob, filename); //这里导出的文件名没有自定义
            });
            self.isExportLoading = false;
        },
        detailClick() {
            this.detailInfoShow = true;
            this.currentPage = 1;

            this.pageInfo();
        },
        pageInfo() {
            let minNum = (this.currentPage - 1) * this.pageSize;
            let maxNum = this.currentPage * this.pageSize;

            if (minNum >= this.resultData.length) {
                this.$message({
                    type: "warning",
                    message: "当前分页无数据",
                });
                return;
            }

            this.tableData = [];
            let length =
                maxNum <= this.resultData.length
                    ? maxNum
                    : this.resultData.length;
            for (let i = minNum; i < length; i++) {
                this.tableData.push(this.resultData[i]);
            }
        },
    },
    beforeRouteLeave(to, from, next) {
        var earth = this.stampAPI.usearth;
        earth.ShapeCreator.Clear();
        this.$parent.$refs.functionPanel.curSelMenu.name = "";
        next();
    },
};
</script>

<style lang="less" scoped src="../../style/query.less" ></style>
<style lang="less" scoped>
.layer_container {
    height: 156px;
    padding-left: 0;
}
.inputAssociate {
    width: calc(100% - 85px);
}

.el-tree {
    padding: 0;
}
/deep/ .el-tree-node__content > .el-tree-node__expand-icon {
    padding: 0;
}
/deep/ .el-tree-node__content {
    height: 19px;
    line-height: 19px;
}

.chartTotalDiv {
    border: 0.5vw solid rgb(255, 174, 3);
    width: 9.5vw;
    height: 9.5vw;
    border-radius: 50%;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
}

.chartTotalDiv:hover {
    border: 0.75vw solid rgb(255, 174, 3);
}

.chartTotalInner {
    border: 0.5vw solid rgba(208, 208, 208, 0.37);
    width: 8.5vw;
    height: 8.5vw;
    border-radius: 50%;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
}

.chartTotalValue {
    width: 7vw;
    height: 7vw;
    border-radius: 50%;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(208, 208, 208, 0.2);
    font-family: ShiShangZhongHeiJianTi;
    text-align: center;
    cursor: pointer;
}

.chartTotalCount {
    font-size: 30px;
    color: #fff;
}

.chartTotalSize {
    position: absolute;
    top: 60%;
    font-size: 16px;
    text-align: center;
    width: 100%;
}
</style>