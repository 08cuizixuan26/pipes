<template>
    <popoverStat
        :visible.sync="dialogVisible"
        :show-header="true"
        title="管径分段"
        custom-class="QuerySpatial"
        :beforeClose="handleClose"
        :dblClick="handleDblclick"
    >
        <el-row
            v-loading="loading"
            element-loading-background="rgba(0, 0, 0, 0.6)"
            element-loading-text="正在查询"
            element-loading-spinner="el-icon-loading"
            element-loading-custom-class="loading_color"
        >
            <el-col :span="10">
                <el-row>
                    <el-form>
                        <el-form-item label="图层：">
                            <el-select
                                v-model="selectLayer"
                                @change="handleLayerChange"
                            >
                                <el-option
                                    v-for="(item, index) in layerList"
                                    :key="index"
                                    :label="item.name"
                                    :value="item.id"
                                ></el-option>
                            </el-select>
                            <el-button
                                @click.prevent="getEquipment"
                                type="primary"
                                size="mini"
                                class="afterUnit"
                                :disabled="!selectLayer"
                                >获取管径</el-button
                            >
                        </el-form-item>
                    </el-form>
                </el-row>
                <el-row class="leftDiv">
                    <el-col :span="10">
                        <span>管径：</span>
                    </el-col>
                    <el-col :span="14">
                        <span style="margin-left: 5px">分段：</span>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="10">
                        <el-row class="layer_container">
                            <el-scrollbar
                                style="height: 100%"
                                wrap-class="scrollbar-wrapper"
                            >
                                <el-tree
                                    :data="treeData"
                                    :props="defaultProps"
                                    highlight-current
                                    @node-click="handleNodeClick"
                                >
                                </el-tree>
                            </el-scrollbar>
                        </el-row>
                    </el-col>
                    <el-col :span="14">
                        <div class="rangeTableDiv">
                            <el-table
                                :data="rangeTableData"
                                highlight-current-row
                                border
                                stripe
                                size="mini"
                                @current-change="handleCurrentChange"
                            >
                                <el-table-column
                                    prop="min"
                                    label="下限"
                                    min-width="1"
                                    :show-overflow-tooltip="true"
                                    header-align="center"
                                    align="center"
                                ></el-table-column>
                                <el-table-column
                                    prop="max"
                                    label="上限"
                                    min-width="1"
                                    :show-overflow-tooltip="true"
                                    header-align="center"
                                    align="center"
                                ></el-table-column>
                            </el-table>
                        </div>
                        <div class="centerDiv">
                            <el-button
                                type="primary"
                                size="mini"
                                class="btnClass"
                                @click="updateMin"
                                :disabled="minBtnDisabled"
                                >下限</el-button
                            >
                            <el-button
                                type="primary"
                                size="mini"
                                class="btnClass"
                                @click="updateMax"
                                :disabled="maxBtnDisabled"
                                >上限</el-button
                            >
                        </div>
                        <div class="centerDiv">
                            <el-button
                                type="primary"
                                size="mini"
                                class="btnClass"
                                @click="addRow"
                                :disabled="addBtnDisable"
                                >添加行</el-button
                            >
                            <el-button
                                type="primary"
                                size="mini"
                                class="btnClass"
                                @click="deleteRow"
                                :disabled="deleteBtnDistabled"
                                >删除行</el-button
                            >
                        </div>
                    </el-col>
                </el-row>
                <el-row class="centerDiv">
                    <el-button
                        type="primary"
                        size="mini"
                        @click="query(0)"
                        :disabled="rangeTableData.length == 0"
                        >全部</el-button
                    >
                    <el-button
                        type="primary"
                        size="mini"
                        @click="query(1)"
                        :disabled="rangeTableData.length == 0"
                        >圆域</el-button
                    >
                    <el-button
                        type="primary"
                        size="mini"
                        @click="query(2)"
                        :disabled="rangeTableData.length == 0"
                        >多边形</el-button
                    >
                </el-row>
            </el-col>
            <el-col :span="14">
                <el-row style="padding-right: 5px">
                    <el-table :data="tableData" border stripe>
                        <el-table-column
                            prop="type"
                            :label="fieldLabel"
                            :show-overflow-tooltip="true"
                            header-align="center"
                            align="center"
                        ></el-table-column>
                        <el-table-column
                            prop="TIMES"
                            label="数量"
                            :show-overflow-tooltip="true"
                            header-align="center"
                            align="center"
                        ></el-table-column>
                        <el-table-column
                            prop="LENGTH"
                            label="长度(km)"
                            :show-overflow-tooltip="true"
                            header-align="center"
                            align="center"
                        ></el-table-column>
                    </el-table>
                </el-row>
                <el-row>
                    <div id="pieChart" class="chartContainerClass" />
                </el-row>
                <el-row class="rightDiv">
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
    </popoverStat>
</template>

<script>
import popoverStat from "@/components/popoverStat";
import onlyNumber from "@/directives/el-only-number";
import {
    getPipeList,
    getField,
    queryFunc,
    statisticsSpatialCondition,
    exportFile,
    showPieChart,
} from "./StatisticsCommon";
import { getNameNoIgnoreCase } from "@/api/query";

export default {
    directives: { onlyNumber },
    components: {
        popoverStat,
    },
    data() {
        return {
            dialogVisible: true,
            selectLayer: "",
            treeData: [],
            defaultProps: {
                children: "children",
                label: "name",
            },
            currentDeep: null,
            rangeTableData: [],
            deleteBtnDistabled: true,
            currentRowIndex: -1,
            checklist: [],
            layerList: [],
            tableData: [],
            tubulation: "",
            inputRadius: "10",
            checkLayerList: [],
            isExportDisabled: true,
            isExportLoading: false,
            lineField: "US_SIZE",
            fieldLabel: "管径",
            spanArr: [],
            sc: "",
            pc: "",
            typeId: "line",
            loading: false,
            minBtnDisabled: true,
            maxBtnDisabled: true,
            addBtnDisable: true,
        };
    },
    computed: {
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

        let self = this;
        getField(this, function (res) {
            self.lineField = getNameNoIgnoreCase(
                res,
                self.lineField,
                "1",
                true
            );
        });
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
        handleLayerChange() {},
        getDiameterValueMap() {
            let self = this;
            let params = {
                service: self.selectLayer,
                qt: 256,
                dt: self.typeId,
                fd: self.lineField,
                pg: "0,10000",
                encoding: "utf-8",
            };
            self.treeData = [];
            self.rangeTableData = [];

            self.loading = true;
            queryFunc(params)
                .then(function (res) {
                    let tempArr = [];

                    var json = self.$x2js.xml2js(res.data).Xml;
                    if (
                        json &&
                        json.ValueRangeResult &&
                        json.ValueRangeResult.ValueRange &&
                        json.ValueRangeResult.ValueRange.Value
                    ) {
                        let typeArr = json.ValueRangeResult.ValueRange.Value;
                        Array.isArray(typeArr) || (typeArr = [typeArr]);

                        for (let i = 0; i < typeArr.length; i++) {
                            let tempValue = typeArr[i];
                            if (tempValue && tempValue.split("X").length > 1) {
                                tempValue = tempValue.split("X")[0];
                            } else if (
                                tempValue &&
                                tempValue.split("x").length > 1
                            ) {
                                tempValue = tempValue.split("x")[0];
                            } else if (
                                tempValue &&
                                tempValue.split("*").length > 1
                            ) {
                                tempValue = tempValue.split("*")[0];
                            }
                            if (tempValue && tempArr.indexOf(tempValue) == -1) {
                                tempArr.push(tempValue);
                            }
                        }
                    }

                    tempArr.sort((a, b) => {
                        return Number(a) - Number(b);
                    });

                    let min, max;
                    for (let m = 0; m < tempArr.length; m++) {
                        let tempValue = Number(tempArr[m]);
                        self.treeData.push({ name: tempValue });

                        if (!min || min > tempValue) {
                            min = tempValue;
                        }
                        if (!max || max < tempValue) {
                            max = tempValue;
                        }
                    }

                    if (min && max) {
                        let gap = Math.floor((max - min) / 4);

                        for (let i = 0; i < 4; i++) {
                            self.rangeTableData.push({
                                min: min + gap * i,
                                max: min + gap * (i + 1),
                                index: self.rangeTableData.length,
                            });
                        }
                        self.rangeTableData.push({
                            min: min + gap * 4,
                            max: max,
                            index: self.rangeTableData.length,
                        });
                    }
                })
                .finally(() => {
                    self.loading = false;
                });
        },
        getEquipment() {
            this.clearChart();
            this.getDiameterValueMap();
            this.rangeTableData = [];
            this.currentDeep = null;
        },
        handleNodeClick(data) {
            this.currentDeep = data.name;

            if (this.currentRowIndex > -1 && this.currentDeep) {
                if (
                    this.currentDeep <
                        this.rangeTableData[this.currentRowIndex].max &&
                    this.currentDeep >
                        this.rangeTableData[this.currentRowIndex].min
                ) {
                    this.minBtnDisabled = false;
                    this.maxBtnDisabled = false;
                } else {
                    this.minBtnDisabled = true;
                    this.maxBtnDisabled = true;
                }
            } else {
                this.minBtnDisabled = true;
                this.maxBtnDisabled = true;
            }

            if (this.currentDeep) {
                this.addBtnDisable = false;
                for (let i = 0; i < this.rangeTableData.length; i++) {
                    if (
                        this.currentDeep == this.rangeTableData[i].min ||
                        this.currentDeep == this.rangeTableData[i].max
                    ) {
                        this.addBtnDisable = true;
                        break;
                    }
                }
            }
        },
        handleCurrentChange(currentRow, oldCurrentRow) {
            if (currentRow) {
                this.deleteBtnDistabled = false;
                this.currentRowIndex = currentRow.index;

                if (this.currentDeep) {
                    if (
                        this.currentDeep <
                            this.rangeTableData[this.currentRowIndex].max &&
                        this.currentDeep >
                            this.rangeTableData[this.currentRowIndex].min
                    ) {
                        this.minBtnDisabled = false;
                        this.maxBtnDisabled = false;
                    } else {
                        this.minBtnDisabled = true;
                        this.maxBtnDisabled = true;
                    }
                } else {
                    this.minBtnDisabled = true;
                    this.maxBtnDisabled = true;
                }
            } else {
                this.deleteBtnDistabled = true;
                this.currentRowIndex = -1;
                this.minBtnDisabled = true;
                this.maxBtnDisabled = true;
            }
        },
        updateMin() {
            if (this.currentRowIndex > -1) {
                if (
                    Number(this.currentDeep) >
                    Number(this.rangeTableData[this.currentRowIndex].max)
                ) {
                    this.$message({
                        type: "warning",
                        message: "下限值必须小于等于上限值",
                    });
                    return;
                }
                this.rangeTableData[this.currentRowIndex].min =
                    this.currentDeep;

                if (this.currentRowIndex > 0) {
                    this.rangeTableData[this.currentRowIndex - 1].max =
                        this.currentDeep;
                }
            }
        },
        updateMax() {
            if (this.currentRowIndex > -1) {
                if (
                    Number(this.currentDeep) <
                    Number(this.rangeTableData[this.currentRowIndex].min)
                ) {
                    this.$message({
                        type: "warning",
                        message: "上限值必须大于等于下限值",
                    });
                    return;
                }
                this.rangeTableData[this.currentRowIndex].max =
                    this.currentDeep;

                if (this.currentRowIndex < this.rangeTableData.length - 1) {
                    this.rangeTableData[this.currentRowIndex + 1].min =
                        this.currentDeep;
                }
            }
        },
        addRow() {
            if (
                this.currentDeep >
                this.rangeTableData[this.rangeTableData.length - 1].max
            ) {
                this.rangeTableData.push({
                    min: this.rangeTableData[this.rangeTableData.length - 1]
                        .max,
                    max: this.currentDeep,
                });
            } else {
                for (let i = this.rangeTableData.length - 1; i >= 0; i--) {
                    if (
                        this.currentDeep > this.rangeTableData[i].min &&
                        this.rangeTableData[i].max
                    ) {
                        let obj = {
                            min: this.rangeTableData[i].min,
                            max: this.currentDeep,
                            index: i,
                        };
                        this.rangeTableData[i].min = this.currentDeep;
                        this.rangeTableData[i].index++;
                        this.rangeTableData.splice(i, 0, obj);
                        break;
                    } else if (
                        i == 0 &&
                        this.currentDeep < this.rangeTableData[i].min
                    ) {
                        this.rangeTableData[0].index++;
                        this.rangeTableData.splice(0, 0, {
                            min: this.currentDeep,
                            max: this.rangeTableData[0].min,
                            index: 0,
                        });
                    } else {
                        this.rangeTableData[i].index++;
                    }
                }
            }
            this.addBtnDisable = true;
        },
        deleteRow() {
            if (this.currentRowIndex > -1) {
                for (let i = this.rangeTableData.length - 1; i >= 0; i--) {
                    if (this.currentRowIndex == i) {
                        if (i > 0) {
                            this.rangeTableData[i - 1].max =
                                this.rangeTableData[i].max;
                        }

                        this.rangeTableData.splice(i, 1);
                        break;
                    } else {
                        this.rangeTableData[i].index--;
                    }
                }
            }
        },
        clearChart() {
            this.tableData = [];
            this.isExportDisabled = true;
            this.sc = "";
            this.pc = "";

            var chartElement = document.getElementById("pieChart");
            var myChart = this.$echarts.init(chartElement);
            myChart.setOption({}, true);
        },
        query(index) {
            let self = this;

            self.clearChart();

            let rangeValue = "(";
            for (let i = 0; i < this.rangeTableData.length; i++) {
                rangeValue +=
                    this.rangeTableData[i].min +
                    "," +
                    this.rangeTableData[i].max +
                    ";";
            }
            rangeValue += ")";

            statisticsSpatialCondition(self, index, function () {
                let postArr = [];
                postArr.push({
                    service: self.selectLayer,
                    qt: 3,
                    dt: self.typeId,
                    sc: self.sc ? self.sc : "",
                    cf: self.lineField,
                    range: rangeValue,
                    encoding: "utf-8",
                });
                postArr.push({
                    service: self.selectLayer,
                    qt: 2,
                    dt: self.typeId,
                    sc: self.sc ? self.sc : "",
                    cf: self.lineField,
                    encoding: "utf-8",
                });

                self.loading = true;
                Promise.all(postArr.map(queryFunc))
                    .then((result) => {
                        var tableData = [];
                        self.checkLayerList = [];

                        if (result.length < 2) {
                            return;
                        }

                        let num = 0;
                        let length = 0;

                        let layerObj =
                            self.stampAPI.usearth.LayerManager.GetLayerByGUID(
                                self.selectLayer
                            );
                        let layername = layerObj ? layerObj._name : "";

                        var json = self.$x2js.xml2js(result[0].data).Xml;
                        if (json && json.Item) {
                            let record = json.Item;
                            Array.isArray(record) || (record = [record]);

                            for (let n = 0; n < record.length; n++) {
                                let typeValue = record[n][self.lineField];
                                let lenValue = (
                                    Number(record[n]["LENGTH"]) / 1000
                                ).toFixed(3);

                                num += Number(record[n]["TIMES"]);
                                length += Number(record[n]["LENGTH"]);

                                record[n]["layerName"] = layername;
                                record[n]["type"] = typeValue;
                                record[n]["LENGTH"] = lenValue;
                                record[n]["TIMES"] = Number(record[n]["TIMES"]);

                                tableData.push(record[n]);
                            }
                        }

                        var json1 = self.$x2js.xml2js(result[1].data).Xml;
                        if (json1 && json1.Item) {
                            let record = json1.Item;
                            Array.isArray(record) || (record = [record]);

                            for (let k = 0; k < record.length; k++) {
                                let tempValue = record[k][self.lineField];
                                if (
                                    tempValue &&
                                    tempValue.split("X").length > 1
                                ) {
                                    tempValue = tempValue.split("X")[0];
                                } else if (
                                    tempValue &&
                                    tempValue.split("x").length > 1
                                ) {
                                    tempValue = tempValue.split("x")[0];
                                } else if (
                                    tempValue &&
                                    tempValue.split("*").length > 1
                                ) {
                                    tempValue = tempValue.split("*")[0];
                                } else {
                                    continue;
                                }

                                for (let m = 0; m < tableData.length; m++) {
                                    let min = tableData[m].type.split(",")[0];
                                    let max = tableData[m].type.split(",")[1];
                                    if (
                                        Number(tempValue) >= Number(min) &&
                                        Number(tempValue) < Number(max)
                                    ) {
                                        tableData[m].TIMES =
                                            Number(tableData[m].TIMES) +
                                            Number(record[k]["TIMES"]);
                                        tableData[m].LENGTH = (
                                            Number(tableData[m].LENGTH) +
                                            Number(record[k]["LENGTH"]) / 1000
                                        ).toFixed(3);

                                        num += Number(record[k]["TIMES"]);
                                        length += Number(record[k]["LENGTH"]);
                                    }
                                }
                            }
                        }

                        let obj = {
                            layerName: layername,
                            type: "小计",
                            TIMES: num,
                            LENGTH: (length / 1000).toFixed(3),
                        };
                        tableData.push(obj);

                        if (tableData.length > 0) {
                            self.getSpanArr(tableData);
                            self.tableData = tableData;
                            self.isExportDisabled = false;

                            self.handlePieChange();
                            // self.handleBarChange();
                        }
                    })
                    .finally(() => {
                        self.loading = false;
                    });
            });
        },
        getSpanArr(tableData) {
            var kIndex = 0;
            var tmpValue = "";
            this.spanArr = [];
            for (var i = 0; i < tableData.length; i++) {
                if (tableData[i].layerName != tmpValue) {
                    this.spanArr.push(0);
                    kIndex = this.spanArr.length - 1;
                    tmpValue = tableData[i].layerName;
                } else {
                    this.spanArr.push(0);
                }
                this.spanArr[kIndex]++;
            }
        },
        objectSpanMethod({ row, column, rowIndex, columnIndex }) {
            if (columnIndex == 0) {
                const _row = this.spanArr[rowIndex];
                const _col = _row > 0 ? 1 : 0;
                return {
                    rowspan: _row,
                    colspan: _col,
                };
            }
        },
        handlePieChange() {
            var legendData = [];
            var seriesData = [];

            for (let i = 0; i < this.tableData.length; i++) {
                if (this.tableData[i].type !== "小计") {
                    legendData.push(this.tableData[i].type);
                    seriesData.push({
                        name: this.tableData[i].type,
                        value: Number(this.tableData[i].LENGTH),
                    });
                }
            }

            showPieChart(this, legendData, seriesData);
        },
        exportResult() {
            this.isExportLoading = true;
            exportFile(this);
        },
    },
    beforeRouteLeave(to, from, next) {
        this.stampAPI.usearth.ShapeCreator.Clear();
        this.$parent.$refs.functionPanel.curSelMenu.name = "";
        next();
    },
};
</script>

<style lang="less" scoped src="../../style/query.less" ></style>
<style lang="less" scoped>
.chartContainerClass {
    height: 258px;
}

.layer_container {
    height: 490px;
    padding-left: 0px;
}

.btnClass {
    width: 60px;
    height: 25px;
    line-height: 25px;
    padding: 0;
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
</style>