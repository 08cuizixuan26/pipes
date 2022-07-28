<template>
    <popoverStat
        :visible.sync="dialogVisible"
        :show-header="true"
        title="空间查询"
        custom-class="QuerySpatial"
        :beforeClose="handleClose"
        :dblClick="handleDblclick"
    >
        <el-row
            v-show="!detailInfoShow"
            v-loading="loading"
            element-loading-background="rgba(0, 0, 0, 0.8)"
            element-loading-text="正在查询"
            element-loading-spinner="el-icon-loading"
            element-loading-custom-class="loading_color"
        >
            <el-col :span="10">
                <el-row class="leftDiv">
                    <span>图层：</span>
                </el-row>
                <el-row class="layer_container">
                    <el-scrollbar
                        style="height: 100%"
                        wrap-class="scrollbar-wrapper"
                    >
                        <el-checkbox-group v-model="checklist">
                            <el-checkbox
                                v-for="item in layerList"
                                :key="item.id"
                                :label="item.id"
                                >{{ item.name }}</el-checkbox
                            >
                        </el-checkbox-group>
                    </el-scrollbar>
                </el-row>
                <el-row class="centerDiv">
                    <el-button
                        type="primary"
                        size="mini"
                        @click="query(1)"
                        :disabled="checklist.length == 0"
                        >圆域</el-button
                    >
                    <el-button
                        type="primary"
                        size="mini"
                        @click="query(2)"
                        :disabled="checklist.length == 0"
                        >多边形</el-button
                    >
                </el-row>
            </el-col>
            <el-col :span="14">
                <el-row>
                    <div id="chart" class="chartContainerClass" />
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
            <div>
                <div
                    v-show="tableData['line'].length > 0"
                    :class="[
                        'static-menu-item',
                        { 'static-menu-item-active': typeId == 'line' },
                    ]"
                    @click="switchType('line')"
                >
                    <span class="static-menu-inner"> 管线信息 </span>
                </div>
                <div
                    v-show="tableData['point'].length > 0"
                    :class="[
                        'static-menu-item',
                        { 'static-menu-item-active': typeId == 'point' },
                    ]"
                    @click="switchType('point')"
                >
                    <span class="static-menu-inner"> 管点信息 </span>
                </div>
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
            </div>
            <el-table
                :data="tableData[typeId]"
                @row-dblclick="getDetailInfo"
                highlight-current-row
                border
                stripe
                ref="table"
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
                :total="recordNum[typeId]"
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
    querySpatialCondition,
    pageClick,
    searchResultByMutilLayer,
    exportFile,
    getDetailData,
    getTableHeader,
} from "./QueryCommon";

export default {
    components: {
        popoverStat,
    },
    data() {
        this.lastHighlight_layer = [];
        return {
            dialogVisible: true,
            checklist: [],
            layerList: [],
            tableHeader: { line: [], point: [] },
            tableData: { line: [], point: [] },
            detailInfoShow: false,
            detailInfo: [],
            currentPage: 1,
            pageObj: { line: 1, point: 1 },
            recordNum: { line: 0, point: 0 },
            detailCheckbox: false,
            isExportDisabled: true,
            isExportLoading: false,
            sc: "",
            numArr: { line: [], point: [] },
            typeId: "line",
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
        clearChart() {
            var chartElement = document.getElementById("chart");
            var myChart = this.$echarts.init(chartElement);
            myChart.setOption({}, true);
        },
        query(index) {
            let self = this;

            self.clearChart();
            self.tableData = { line: [], point: [] };
            self.recordNum = { line: 0, point: 0 };
            self.pageObj = { line: 1, point: 1 };
            self.currentPage = 1;
            self.isExportDisabled = true;
            self.detailInfoShow = false;

            querySpatialCondition(this, index, function () {
                let postArr = [];
                for (let i = 0; i < self.checklist.length; i++) {
                    postArr.push({
                        service: self.checklist[i],
                        qt: 17,
                        dt: "line",
                        sc: self.sc,
                        pg: "0," + self.pageSize,
                        encoding: "utf-8",
                    });
                    postArr.push({
                        service: self.checklist[i],
                        qt: 17,
                        dt: "point",
                        sc: self.sc,
                        pg: "0," + self.pageSize,
                        encoding: "utf-8",
                    });
                }
                searchResultByMutilLayer(self, postArr);
            });
        },
        backToList() {
            this.detailInfoShow = false;
        },
        getDetailInfo(row) {
            getDetailData(this, row);
        },
        handleCurrentChange(currentPage) {
            let self = this;
            self.currentPage = currentPage;
            self.pageObj[self.typeId] = currentPage;
            pageClick(self);
        },
        exportResult() {
            this.isExportLoading = true;

            let postArr = [];
            for (let i = 0; i < this.checklist.length; i++) {
                postArr.push({
                    service: this.checklist[i],
                    qt: 16,
                    dt: "line",
                    sc: this.sc,
                    pg: "0,10000",
                    encoding: "utf-8",
                });
                postArr.push({
                    service: this.checklist[i],
                    qt: 16,
                    dt: "point",
                    sc: this.sc,
                    pg: "0,10000",
                    encoding: "utf-8",
                });
            }
            exportFile(this, postArr);
        },
        detailClick() {
            this.detailInfoShow = true;
        },
        switchType(type) {
            this.$nextTick(() => {
                // 页面加载完成后，重新渲染表格
                // forname 为table的ref
                this.$refs["table"].doLayout();
            });
            this.typeId = type;

            this.currentPage = this.pageObj[this.typeId];
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
</style>