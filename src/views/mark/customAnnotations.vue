<template>
    <popover
        :visible.sync="isShow"
        :show-header="true"
        title="自定义标注"
        custom-class="QuerySpatial"
        :beforeClose="handleClose"
        :dblClick="handleDblclick"
    >
        <el-table
            ref="multipleTable"
            :data="PipelineInformation"
            tooltip-effect="dark"
            style="width: 94%"
            @selection-change="selectionChange"
        >
            <el-table-column type="selection" label="选择" min-width="1">
            </el-table-column>
            <el-table-column prop="key" label="属性字段" min-width="1">
            </el-table-column>
        </el-table>
        <div class="foot" style="margin-top: 20px">
            <el-button
                size="mini"
                @click="toggleSelection1(PipelineInformation)"
            >
                全选
            </el-button>
            <el-button
                size="mini"
                @click="toggleSelection2(PipelineInformation)"
            >
                反选
            </el-button>
            <el-button size="mini" @click="toggleSelection3()">确认</el-button>
            <el-button size="mini" @click="toggleSelection4()">取消</el-button>
        </div>
    </popover>
</template>

<script>
import popover from "@/components/Popover";
import Mark from "@/stamplib/Mark"; //创建点的方法
import { createGuid } from "@/utils";
import localStorage from "@/stamplib/LocalStorage";
export default {
    data() {
        return {
            changeArr: [],
            zidingyi: 1,
        };
    },
    components: {
        popover,
    },
    computed: {
        isShow: {
            set(val) {
                this.$store.state.isShow = val;
            },
            get(val) {
                return this.$store.state.isShow;
            },
        },
        // PipelineInformation:{
        //   set(val){
        //     this.$store.state.PipelineInformation = val;
        //   },
        //   get(val){
        //     return this.$store.state.PipelineInformation
        //   }
        // }
        PipelineInformation() {
            return this.$store.state.PipelineInformation;
        },
    },
    mounted() {
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
        handleClose() {},
        handleDblclick() {},
        toggleSelection1(rows) {
            if (rows) {
                rows.forEach((row) => {
                    this.$refs.multipleTable.toggleRowSelection(row);
                });
            }
        },
        toggleSelection2(rows) {
            if (rows) {
                rows.forEach((row) => {
                    this.$refs.multipleTable.toggleRowSelection(row);
                });
            }
        },
        toggleSelection3() {
            if (this.$store.state.changArr == "") {
                this.$message.error("请选择属性字段");
                return;
            } else {
                var self = this;
                var options = self.$store.state.options;
                var attr = self.$store.state.changArr;
                let tempArr = [];
                for (var i = 0; i < attr.length; i++) {
                    tempArr.push(attr[i].key + ":" + attr[i].value);
                }

                let obj = {
                    guid: createGuid(),
                    name: "自定义标注",
                    children: [],
                };
                let obj1 = {
                    guid: options.guid,
                    type: "label",
                    name: options.name,
                    visibility: true,
                    options,
                };
                if (self.$store.state.labelData[0].children.length > 0) {
                    for (
                        let i = 0;
                        i < self.$store.state.labelData[0].children.length;
                        i++
                    ) {
                        if (
                            self.$store.state.labelData[0].children[i].name ==
                                "自定义标注" &&
                            this.zidingyi !== 1
                        ) {
                            self.$store.state.labelData[0].children[
                                i
                            ].children.push(obj1);
                            self.$store.state.labelCheckData.push(options.guid);
                        } else if (this.zidingyi === 1) {
                            this.zidingyi++;
                            self.$store.state.labelData[0].children.push(obj);
                        }
                    }
                } else {
                    this.zidingyi++;
                    obj.children.push(obj1);
                    self.$store.state.labelData[0].children.push(obj);
                    self.$store.state.labelCheckData.push(options.guid);
                }
                options.name = `${tempArr.join("@")}`;
                let icon = Mark.createElementPoint1(
                    self.stampAPI.usearth,
                    options
                );
                self.g_ElementData["elementLabel"].elementArr.push(icon);
                localStorage.saveElementToDB(
                    self.stampAPI.usearth,
                    "elementLabel",
                    self.$store.state.labelData
                );
                localStorage.saveElementToDB(
                    self.stampAPI.usearth,
                    "labelCheckData",
                    self.$store.state.labelCheckData
                );
                this.$store.state.isShow = false;
            }
        },
        toggleSelection4() {
            this.$store.state.isShow = false;
        },

        selectionChange(selection) {
            // console.log(selection, "selectionChange");
            this.$store.state.changArr = selection;
        },

        // selectionRow(selection, row) {
        //   console.log(selection,'selection');
        //   console.log(row,'row');
        // },
        // selectionRowAll(selection) {
        //   console.log(selection,'selectionRowAll')
        // },
    },
};
</script>

<style lang="less" scoped>
.QuerySpatial {
    width: 400px;
    color: white;
    text-align: left;
    font-size: 14px;
}
.table_box {
    width: 100%;
    background: rgba(21, 97, 113, 0.2);
}
.foot {
    height: 50px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    .btn {
        width: 60px;
        height: 30px;
        line-height: 26px;
        text-align: center;
        font-weight: 400;
        color: #ffff;
        background: rgba(21, 97, 113, 0.2);
    }
}
/deep/ .el-table {
    margin: 0 10px;
}
</style>