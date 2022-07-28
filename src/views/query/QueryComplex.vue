<template>
    <popoverStat
        :visible.sync="dialogVisible"
        :show-header="true"
        title="SQL查询"
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
                        </el-form-item>
                    </el-form>
                </el-row>
                <el-row class="leftDiv">
                    <el-col :span="12">
                        <span>字段：</span>
                        <el-button
                            @click.prevent="getFields"
                            type="primary"
                            size="mini"
                            :disabled="!selectLayer"
                            >获取字段</el-button
                        >
                    </el-col>
                    <el-col :span="12">
                        <span style="margin-left: 5px">值域：</span>
                        <el-button
                            @click.prevent="getValues"
                            type="primary"
                            size="mini"
                            :disabled="!selectField"
                            >获取值域</el-button
                        >
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
                                    :data="fieldTreeData"
                                    :props="defaultProps"
                                    highlight-current
                                    @node-click="handleNodeClick"
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
                                    :data="valueTreeData"
                                    :props="defaultProps"
                                    highlight-current
                                    @node-click="handleNodeClick1"
                                >
                                </el-tree>
                            </el-scrollbar>
                        </el-row>
                    </el-col>
                </el-row>
                <el-row class="leftDiv">
                    <span>关系符：</span>
                </el-row>
                <el-row class="btnDiv">
                    <el-button
                        type="primary"
                        size="mini"
                        class="btnClass"
                        @click="handleBtnClick('=')"
                        >=</el-button
                    >
                    <el-button
                        type="primary"
                        size="mini"
                        class="btnClass"
                        @click="handleBtnClick('<')"
                        >&lt;</el-button
                    >
                    <el-button
                        type="primary"
                        size="mini"
                        class="btnClass"
                        @click="handleBtnClick('>')"
                        >&gt;</el-button
                    >
                    <el-button
                        type="primary"
                        size="mini"
                        class="btnClass"
                        @click="handleBtnClick('or')"
                        >or</el-button
                    >
                    <el-button
                        type="primary"
                        size="mini"
                        class="btnClass"
                        style="margin-left: 0px"
                        @click="handleBtnClick('!=')"
                        >!=</el-button
                    >
                    <el-button
                        type="primary"
                        size="mini"
                        class="btnClass"
                        @click="handleBtnClick('<=')"
                        >&lt;=</el-button
                    >
                    <el-button
                        type="primary"
                        size="mini"
                        class="btnClass"
                        @click="handleBtnClick('>=')"
                        >&gt;=</el-button
                    >
                    <el-button
                        type="primary"
                        size="mini"
                        class="btnClass"
                        @click="handleBtnClick('and')"
                        >and</el-button
                    >
                </el-row>
                <el-row class="leftDiv">
                    <span>SQL语句：</span>
                </el-row>
                <el-row style="margin: 0 5px 5px">
                    <el-input type="textarea" :rows="2" v-model="textarea">
                    </el-input>
                </el-row>
                <el-row class="centerDiv">
                    <el-button
                        type="primary"
                        size="mini"
                        @click="query(0)"
                        :disabled="!textarea"
                        >全部</el-button
                    >
                    <el-button
                        type="primary"
                        size="mini"
                        @click="query(1)"
                        :disabled="!textarea"
                        >圆域</el-button
                    >
                    <el-button
                        type="primary"
                        size="mini"
                        @click="query(2)"
                        :disabled="!textarea"
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
                                                (staticTotalSize != ''
                                                    ? '6'
                                                    : '7') +
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
                                            {{ staticTotalSize }}
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
    staticResultBySingle,
    searchResultBySingle,
    exportFile,
    getDetailData,
    getTableHeader,
    getNameNoIgnoreCase,
} from "./QueryCommon";
import { debounce } from "lodash";

let mFieldList = [];
export default {
    components: {
        popoverStat,
    },
    data() {
        this.lastHighlight_layer = [];
        return {
            dialogVisible: true,
            selectField: null,
            fieldTreeData: [],
            valueTreeData: [],
            defaultProps: {
                children: "children",
                label: "label",
            },
            selectLayer: "",
            layerList: [],
            tableHeader: { line: [], point: [] },
            tableData: [],
            textarea: "",
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
            clickCount: 0,
            clickCount1: 0,
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
        let tempList = [];
        for (let i = 0; i < this.layerList.length; i++) {
            tempList.push({
                name: this.layerList[i].name + "线",
                id: this.layerList[i].id + "_line",
            });
            tempList.push({
                name: this.layerList[i].name + "点",
                id: this.layerList[i].id + "_point",
            });
        }
        this.layerList = tempList;
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
            this.pc = "";
            this.fieldTreeData = [];
            this.valueTreeData = [];
            this.textarea = "";
            this.typeId = this.selectLayer.split("_")[1];

            this.clearChart();
        },
        getFields() {
            this.selectField = null;
            let params = {
                service: this.selectLayer.split("_")[0],
                qt: 0,
                dt: this.selectLayer.split("_")[1],
            };

            let self = this;
            self.loading = true;
            queryFunc(params)
                .then(function (res) {
                    var json = self.$x2js.xml2js(res.data).Xml;
                    if (
                        json &&
                        json.MetaData &&
                        json.MetaData.Table &&
                        json.MetaData.Table.Field
                    ) {
                        var records = json.MetaData.Table.Field;
                        Array.isArray(records) || (records = [records]);

                        mFieldList = [];
                        self.valueTreeData = [];
                        self.fieldTreeData = [];
                        for (let i = 0; i < records.length; i++) {
                            let label = getNameNoIgnoreCase(
                                self.tableHeader[self.typeId],
                                records[i].Name,
                                false
                            );
                            if (!label) {
                                continue;
                            }
                            self.fieldTreeData.push({
                                name: records[i].Name,
                                type: records[i].Type,
                                label: label,
                            });
                            mFieldList.push(records[i].Name);
                        }
                    }
                })
                .finally(() => {
                    self.loading = false;
                });
        },
        handleNodeClick(nodeData) {
            this.selectField = nodeData;
            this.valueTreeData = [];

            this.clickCount++;
            const fnEmitDbClick = debounce(() => {
                if (this.clickCount > 1) {
                    this.treeNodeDbClick(nodeData);
                }
                this.clickCount = 0;
            }, 200);
            fnEmitDbClick();
        },
        treeNodeDbClick(nodeData) {
            this.textarea += `''${nodeData.name}''`;
        },
        getValues() {
            let params = {
                service: this.selectLayer.split("_")[0],
                qt: 256,
                fd: this.selectField ? this.selectField.name : "",
                dt: this.selectLayer.split("_")[1],
                encoding: "utf-8",
            };

            let self = this;
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

                        self.valueTreeData = [];
                        for (let i = 0; i < records.length; i++) {
                            if (records[i]) {
                                self.valueTreeData.push({
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
        handleNodeClick1(nodeData) {
            this.clickCount1++;
            const fnEmitDbClick = debounce(() => {
                if (this.clickCount1 > 1) {
                    this.treeNodeDbClick1(nodeData);
                }
                this.clickCount1 = 0;
            }, 200);
            fnEmitDbClick();
        },
        treeNodeDbClick1(nodeData) {
            this.textarea += `'${nodeData.name}'`;
        },
        handleBtnClick(type) {
            this.textarea += ` ${type} `;
        },
        filter() {
            var strSQL = this.textarea;
            if (strSQL.length < 2) {
                this.$message({
                    type: "warning",
                    message: "非法查询语句，请修改！",
                });
                return;
            }
            var strArr = strSQL.split(" ");
            for (var m = 0; m < strArr.length; m++) {
                var thisStrArr = strArr[m].split("''");
                if (
                    thisStrArr.length > 1 &&
                    thisStrArr[0] &&
                    isNaN(thisStrArr[0])
                ) {
                    this.$message({
                        type: "warning",
                        message: "非法查询语句，请修改！",
                    });
                    return;
                }
            }
            var strPara = "";
            var key = 0;
            var andor = "and";
            for (var i = 0; i < strSQL.length; i++) {
                if (i + 2 < strSQL.length && strSQL.substr(i, 2) == "or") {
                    var temp = strSQL.substr(key, i - 1 - key);
                    var arrTemp = temp.split(" ");
                    if (arrTemp.length != 3) {
                        this.$message({
                            type: "warning",
                            message: "非法查询语句，请修改！",
                        });
                        return;
                    }
                    var temp0 = arrTemp[0];
                    if (
                        temp0.length < 4 ||
                        !(
                            temp0.substr(0, 2) == "''" &&
                            temp0.substr(temp0.length - 2, 2) == "''"
                        )
                    ) {
                        this.$message({
                            type: "warning",
                            message: "非法查询语句，请修改！",
                        });
                        return;
                    }
                    var bKey = true;
                    for (var j = 0; j < mFieldList.length; j++) {
                        if (temp0.substr(2, temp0.length - 4) == mFieldList[j])
                            bKey = false;
                    }
                    if (bKey) {
                        this.$message({
                            type: "warning",
                            message: "关键字不在列表中！",
                        });
                        break;
                    }
                    var temp1 = arrTemp[1];
                    if (
                        !(
                            temp1 == "=" ||
                            temp1 == ">" ||
                            temp1 == "<" ||
                            temp1 == ">=" ||
                            temp1 == "<=" ||
                            temp1 == "!="
                        )
                    )
                        break;
                    var temp2 = arrTemp[2];
                    if (
                        temp2.length < 2 ||
                        !(
                            temp2.substr(0, 1) == "'" &&
                            temp2.substr(temp2.length - 1, 1) == "'"
                        )
                    ) {
                        this.$message({
                            type: "warning",
                            message: "非法查询语句，请修改！",
                        });
                        return;
                    }
                    key = i + 3;
                    var aa = "";
                    if (temp1 == "=") aa = "equal";
                    else if (temp1 == ">") aa = "greater";
                    else if (temp1 == "<") aa = "less";
                    else if (temp1 == "<=") aa = "lessequal";
                    else if (temp1 == ">=") aa = "greaterequal";
                    else if (temp1 == "!=") aa = "unequal";

                    strPara +=
                        "(" +
                        andor +
                        "," +
                        aa +
                        "," +
                        temp0.substr(2, temp0.length - 4) +
                        ",'" +
                        temp2.substr(1, temp2.length - 2) +
                        "')";
                    andor = "or";
                } else if (
                    i + 3 < strSQL.length &&
                    strSQL.substr(i, 3) == "and"
                ) {
                    var temp = strSQL.substr(key, i - 1 - key);
                    var arrTemp = temp.split(" ");
                    if (arrTemp.length != 3) {
                        this.$message({
                            type: "warning",
                            message: "非法查询语句，请修改！",
                        });
                        return;
                    }
                    var temp0 = arrTemp[0];
                    if (
                        temp0.length < 4 ||
                        !(
                            temp0.substr(0, 2) == "''" &&
                            temp0.substr(temp0.length - 2, 2) == "''"
                        )
                    ) {
                        this.$message({
                            type: "warning",
                            message: "非法查询语句，请修改！",
                        });
                        return;
                    }
                    var bKey = true;
                    for (var j = 0; j < mFieldList.length; j++) {
                        if (temp0.substr(2, temp0.length - 4) == mFieldList[j])
                            bKey = false;
                    }
                    if (bKey) {
                        this.$message({
                            type: "warning",
                            message: "关键字不在列表中！",
                        });
                        break;
                    }
                    var temp1 = arrTemp[1];
                    if (
                        !(
                            temp1 == "=" ||
                            temp1 == ">" ||
                            temp1 == "<" ||
                            temp1 == ">=" ||
                            temp1 == "<=" ||
                            temp1 == "!="
                        )
                    ) {
                        this.$message({
                            type: "warning",
                            message: "非法查询语句，请修改！",
                        });
                        return;
                    }
                    var temp2 = arrTemp[2];
                    var a = temp2.substr(0, 2);
                    var b = temp2.substr(temp2.length - 2, 2);
                    var c = temp2.substr(0, 1);
                    var d = temp2.substr(temp2.length - 1, 1);
                    if (
                        temp2.length < 2 ||
                        !(
                            temp2.substr(0, 1) == "'" &&
                            temp2.substr(temp2.length - 1, 1) == "'"
                        )
                    ) {
                        this.$message({
                            type: "warning",
                            message: "非法查询语句，请修改！",
                        });
                        return;
                    }
                    key = i + 4;
                    var aa = "";
                    if (temp1 == "=") aa = "equal";
                    else if (temp1 == ">") aa = "greater";
                    else if (temp1 == "<") aa = "less";
                    else if (temp1 == "<=") aa = "lessequal";
                    else if (temp1 == ">=") aa = "greaterequal";
                    else if (temp1 == "!=") aa = "unequal";

                    strPara +=
                        "(" +
                        andor +
                        "," +
                        aa +
                        "," +
                        temp0.substr(2, temp0.length - 4) +
                        ",'" +
                        temp2.substr(1, temp2.length - 2) +
                        "')";
                    andor = "and";
                }
            }
            if (key < strSQL.length) {
                var temp = strSQL.substr(key);
                var arrTemp = temp.split(" ");
                if (arrTemp.length != 3) {
                    this.$message({
                        type: "warning",
                        message: "非法查询语句，请修改！",
                    });
                    return;
                }
                var temp0 = arrTemp[0];
                if (
                    temp0.length < 4 ||
                    !(
                        temp0.substr(0, 2) == "''" &&
                        temp0.substr(temp0.length - 2, 2) == "''"
                    )
                ) {
                    this.$message({
                        type: "warning",
                        message: "非法查询语句，请修改！",
                    });
                    return;
                }
                var bKey = true;
                for (var j = 0; j < mFieldList.length; j++) {
                    if (temp0.substr(2, temp0.length - 4) == mFieldList[j])
                        bKey = false;
                }
                if (bKey) {
                    this.$message({
                        type: "warning",
                        message: "关键字不在列表中！",
                    });
                    return;
                }
                var temp1 = arrTemp[1];
                if (
                    !(
                        temp1 == "=" ||
                        temp1 == ">" ||
                        temp1 == "<" ||
                        temp1 == ">=" ||
                        temp1 == "<=" ||
                        temp1 == "!="
                    )
                ) {
                    this.$message({
                        type: "warning",
                        message: "非法查询语句，请修改！",
                    });
                    return;
                }
                var temp2 = arrTemp[2];
                try {
                    if (
                        (temp2.substr(0, 2) == "''" &&
                            temp2.substr(temp2.length - 2, 2) == "''") ||
                        temp2.length < 2 ||
                        !(
                            temp2.substr(0, 1) == "'" &&
                            temp2.substr(temp2.length - 1, 1) == "'"
                        )
                    ) {
                        this.$message({
                            type: "warning",
                            message: "非法查询语句，请修改！",
                        });
                        return;
                    }
                    var aa = "";
                    if (temp1 == "=") aa = "equal";
                    else if (temp1 == ">") aa = "greater";
                    else if (temp1 == "<") aa = "less";
                    else if (temp1 == "<=") aa = "lessequal";
                    else if (temp1 == ">=") aa = "greaterequal";
                    else if (temp1 == "!=") aa = "unequal";

                    strPara +=
                        "(" +
                        andor +
                        "," +
                        aa +
                        "," +
                        temp0.substr(2, temp0.length - 4) +
                        ",'" +
                        temp2.substr(1, temp2.length - 2) +
                        "')";
                } catch (e) {
                    this.$message({
                        type: "warning",
                        message: "非法查询语句，请修改！",
                    });
                    return;
                }
            }
            return strPara;
        },
        clearChart() {
            this.staticTotalCount = 0;
            this.staticTotalSize = "";
            this.staticTotalHover = "";
        },
        query(index) {
            let self = this;
            self.clearChart();
            self.tableData = [];
            self.recordNum = 0;
            self.currentPage = 1;
            self.isExportDisabled = true;
            self.detailInfoShow = false;

            self.sc = "";
            self.pc = self.filter();

            querySpatialCondition(this, index, function () {
                staticResultBySingle(self, true);
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
                service: this.selectLayer.split("_")[0],
                qt: 16,
                dt: this.typeId,
                sc: this.sc ? this.sc : "",
                pc: this.pc ? this.pc : "",
                encoding: "utf-8",
                pg: "0,10000",
            });
            exportFile(this, postArr, this.typeId);
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
    height: 110px;
    padding-left: 0px;
}

.btnClass {
    width: 50px;
    height: 25px;
    line-height: 25px;
    padding: 0;
}

.btnDiv {
    display: flex;
    flex-wrap: wrap;
    margin: 0 40px;
}

.el-select {
    width: calc(100% - 55px);
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