<template>
    <popoverStat
        :visible.sync="dialogVisible"
        :show-header="true"
        title="权属单位查询"
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
                                >获取权属</el-button
                            >
                        </el-form-item>
                    </el-form>
                </el-row>
                <el-row class="leftDiv">
                    <span>权属单位：</span>
                </el-row>
                <el-row class="layer_container">
                    <el-scrollbar
                        style="height: 100%"
                        wrap-class="scrollbar-wrapper"
                    >
                        <el-checkbox-group
                            v-model="checklist"
                            @change="handleCheckChange"
                        >
                            <el-checkbox
                                v-for="(item, index) in typeList"
                                :key="index"
                                :label="item"
                            ></el-checkbox>
                        </el-checkbox-group>
                    </el-scrollbar>
                </el-row>
                <el-row class="centerDiv">
                    <el-button
                        type="primary"
                        size="mini"
                        @click="query(0)"
                        :disabled="checklist.length == 0"
                        >全部</el-button
                    >
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
                    v-for="(item, i) in tableHeader.line"
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
    getQueryValueMap,
    getPipeList,
    querySpatialCondition,
    staticResultBySingle,
    searchResultBySingle,
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
            selectLayer: "",
            layerList: [],
            typeList: [],
            checklist: [],
            tableHeader: { line: [], point: [] },
            tableData: [],
            detailInfoShow: false,
            detailInfo: [],
            currentPage: 1,
            recordNum: 0,
            detailCheckbox: false,
            isExportDisabled: true,
            isExportLoading: false,
            field: "US_OWNER",
            sc: "",
            pc: "",
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
            this.typeList = [];
            this.checklist = [];
            this.clearSetting();
        },
        clearSetting() {
            var chartElement = document.getElementById("chart");
            var myChart = this.$echarts.init(chartElement);
            myChart.setOption({}, true);

            this.tableData = [];
            this.recordNum = 0;
            this.isExportDisabled = true;
        },
        getEquipment() {
            this.clearSetting();
            getQueryValueMap(this);
        },
        handleCheckChange() {
            this.clearSetting();

            let arr = [];
            for (let i = 0; i < this.checklist.length; i++) {
                arr.push(`(or,equal,${this.field},${this.checklist[i]})`);
            }
            this.pc = arr.join("");
        },
        query(index) {
            this.sc = "";
            let self = this;

            self.clearSetting();

            querySpatialCondition(this, index, function () {
                staticResultBySingle(self);
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

            searchResultBySingle(this);
        },
        exportResult() {
            this.isExportLoading = true;
            let postArr = [];
            postArr.push({
                service: this.selectLayer,
                qt: 16,
                dt: "line",
                sc: this.sc ? this.sc : "",
                pc: this.pc ? this.pc : "",
                encoding: "utf-8",
                pg: "0,10000",
            });
            exportFile(this, postArr, "line");
        },
        detailClick() {
            this.detailInfoShow = true;

            this.currentPage = 1;
            this.isExportDisabled = true;

            if (this.recordNum > 0) {
                this.isExportDisabled = false;
            }

            searchResultBySingle(this);
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
    height: 261px;
}
</style>