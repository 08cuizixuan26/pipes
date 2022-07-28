<template>
    <popoverStat
        :visible.sync="dialogVisible"
        :show-header="true"
        title="埋设统计"
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
            <el-row class="leftDiv">
                <el-col :span="12">
                    <el-form>
                        <el-form-item label="起始时间：" label-width="75px">
                            <el-date-picker
                                v-model="dateValueStart"
                                type="month"
                                placeholder="选择月"
                            >
                            </el-date-picker>
                        </el-form-item>
                    </el-form>
                </el-col>
                <el-col :span="12">
                    <el-form>
                        <el-form-item label="图层：" label-width="60px">
                            <el-select v-model="selectLayer">
                                <el-option
                                    v-for="(item, index) in layerList"
                                    :key="index"
                                    :label="item.name"
                                    :value="item.id"
                                ></el-option>
                            </el-select>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
            <el-row class="leftDiv">
                <el-col :span="12">
                    <el-form>
                        <el-form-item label="结束时间：" label-width="75px">
                            <el-date-picker
                                v-model="dateValueEnd"
                                type="month"
                                placeholder="选择月"
                            >
                            </el-date-picker>
                        </el-form-item>
                    </el-form>
                </el-col>
                <el-col :span="12" class="centerDiv">
                    <el-button
                        type="primary"
                        size="mini"
                        @click="query(0)"
                        :disabled="!selectLayer"
                        >全部</el-button
                    >
                    <el-button
                        type="primary"
                        size="mini"
                        @click="query(1)"
                        :disabled="!selectLayer"
                        >圆域</el-button
                    >
                    <el-button
                        type="primary"
                        size="mini"
                        @click="query(2)"
                        :disabled="!selectLayer"
                        >多边形</el-button
                    >
                </el-col>
            </el-row>
            <el-row>
                <div class="title-name">统计图表</div>
            </el-row>
            <el-row>
                <el-col :span="12" class="staticTableDiv">
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
                </el-col>
                <el-col :span="12">
                    <div id="pieChart" class="chartContainerClass" />
                </el-col>
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
        </el-row>
    </popoverStat>
</template>

<script>
import popoverStat from "@/components/popoverStat";
import {
    getPipeList,
    getField,
    statisticsSpatialCondition,
    staticResultByMutilLayer,
    exportFile,
    showPieChart,
} from "./StatisticsCommon";
import { getNameNoIgnoreCase } from "@/api/query";

export default {
    components: {
        popoverStat,
    },
    data() {
        return {
            dialogVisible: true,
            dateValueStart: "",
            dateValueEnd: "",
            selectLayer: "",
            layerList: [],
            tableData: [],
            checkLayerList: [],
            isExportDisabled: true,
            isExportLoading: false,
            field: "US_ATTACHMENT",
            lineField: "US_PMATER",
            fieldLabel: "材质",
            spanArr: [],
            sc: "",
            pc: "",
            typeId: "line",
            statusField: "US_BD_TIME",
            statusLineField: "US_BD_TIME",
            loading: false,
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
            self.field = getNameNoIgnoreCase(res, self.field, "0", true);
            self.statusLineField = getNameNoIgnoreCase(
                res,
                self.statusLineField,
                "1",
                true
            );
            self.statusField = getNameNoIgnoreCase(
                res,
                self.statusField,
                "0",
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
        clearChart() {
            var chartElement = document.getElementById("pieChart");
            var myChart = this.$echarts.init(chartElement);
            myChart.setOption({}, true);
        },
        getDaysInMonth(date) {
            let month = date.getMonth() + 2;

            let year = date.getFullYear();

            if (month > 12) {
                month = 1;
                year += 1;
            }

            let temp = new Date(year + "/" + month);
            temp = new Date(temp.getTime() - 24 * 60 * 60 * 1000);
            return temp.toLocaleDateString();
        },
        query(index) {
            let self = this;

            self.tableData = [];
            self.isExportDisabled = true;
            self.sc = "";
            self.pc = "";
            self.clearChart();

            if (this.dateValueEnd.getTime() < this.dateValueStart.getTime()) {
                this.$message({
                    type: "warning",
                    message: "起始时间小于结束时间，请重新选择",
                });
                return;
            }

            let start = this.dateValueStart.toLocaleDateString();
            let end = this.getDaysInMonth(this.dateValueEnd);

            statisticsSpatialCondition(self, index, function () {
                let postArr = [];

                postArr.push({
                    service: self.selectLayer,
                    qt: 2,
                    dt: "line",
                    sc: self.sc ? self.sc : "",
                    pc: `(and,greaterequal,${self.statusLineField},${start})(and,lessequal,${self.statusLineField},${end})`,
                    cf: self.lineField,
                    encoding: "utf-8",
                });

                staticResultByMutilLayer(self, postArr);
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
.layer_container {
    height: 162px;
}
.chartContainerClass {
    height: 293px;
}
.backbutton {
    top: 10px;
}
.el-date-editor {
    width: calc(100% - 10px);
}
.el-select {
    width: calc(100% - 10px);
}
</style>