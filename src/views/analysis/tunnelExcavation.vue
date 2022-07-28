<template>
    <div class="bodyDiv">
        <el-form>
            <el-form-item label="隧道形状：" label-width="98px">
                <el-select
                    v-model="selectType"
                    size="small"
                    placeholder="请选择"
                    @change="handleSelectChange"
                    class="picker-input"
                >
                    <el-option
                        v-for="item in selectTypeOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    >
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item :label="text" label-width="98px">
                <el-input
                    v-model="inputWidth"
                    size="small"
                    class="picker-input"
                    v-input-focus
                    v-only-number="{ max: 999999, min: 0, precision: 2 }"
                ></el-input>
                <span style="color: white; margin-left: 10px">米</span>
            </el-form-item>
            <el-form-item label="高度：" label-width="98px" v-if="showHeight">
                <el-input
                    v-model="inputHeight"
                    size="small"
                    class="picker-input"
                    v-input-focus
                    v-only-number="{ max: 999999, min: 0, precision: 2 }"
                ></el-input>
                <span style="color: white; margin-left: 10px">米</span>
            </el-form-item>
            <el-form-item label="深度：" label-width="98px">
                <el-input
                    v-model="inputDeep"
                    size="small"
                    class="picker-input"
                    v-input-focus
                    v-only-number="{ max: 999999, min: 0, precision: 2 }"
                ></el-input>
                <span style="color: white; margin-left: 10px">米</span>
            </el-form-item>
            <el-form-item label="基准高程：" label-width="98px">
                <el-input
                    v-model="inputAltitude"
                    size="small"
                    class="picker-input"
                    v-input-focus
                    v-only-number="{ max: 999999, min: 0, precision: 2 }"
                ></el-input>
                <span style="color: white; margin-left: 10px">米</span>
            </el-form-item>
            <div class="btnDiv">
                <el-button
                    type="primary"
                    size="mini"
                    @click="handleGetHeightClick"
                    ><span>获取高程</span></el-button
                >
                <el-button
                    type="primary"
                    size="mini"
                    :disabled="isConfirmDisabled"
                    @click="handleConfirmClick"
                    style="width: 78px"
                    ><span>分析</span></el-button
                >
            </div>
        </el-form>
    </div>
</template>

<script>
import onlyNumber from "@/directives/el-only-number";
import analysis from "@/stamplib/AnalysisControl";

export default {
    name: "tunnelExcavation",
    directives: { onlyNumber },
    data() {
        return {
            selectTypeOptions: [
                {
                    label: "圆形",
                    value: 0,
                },
                {
                    label: "拱形",
                    value: 1,
                },
                {
                    label: "方形",
                    value: 2,
                },
                {
                    label: "半圆",
                    value: 3,
                },
            ],
            selectType: 2,
            text: "宽度：",
            inputWidth: 6,
            showHeight: true,
            inputHeight: 6,
            inputDeep: 5,
            inputAltitude: "",
            isConfirmDisabled: false,
        };
    },
    methods: {
        handleSelectChange() {
            if (this.selectType == 2) {
                this.text = "宽度：";
            } else {
                this.text = "半径：";
            }
            if (this.selectType == 0 || this.selectType == 3) {
                this.showHeight = false;
            } else {
                this.showHeight = true;
            }
        },
        handleConfirmClick() {
            analysis.clear_tunnel_excavation(this.stampAPI.usearth);

            if (this.inputWidth == "" || isNaN(this.inputWidth)) {
                if (selectType == 2) {
                    this.$message({
                        message: "无效宽度值",
                        type: "warning",
                        center: true,
                    });
                    return;
                } else {
                    this.$message({
                        message: "无效半径值",
                        type: "warning",
                        center: true,
                    });
                    return;
                }
            }
            if (
                this.showHeight &&
                (this.inputHeight == "" || isNaN(this.inputHeight))
            ) {
                this.$message({
                    message: "无效高度值",
                    type: "warning",
                    center: true,
                });
                return;
            }
            if (this.inputDeep == "" || isNaN(this.inputDeep)) {
                this.$message({
                    message: "无效埋深值",
                    type: "warning",
                    center: true,
                });
                return;
            }
            if (this.inputAltitude == "" || isNaN(this.inputAltitude)) {
                this.$message({
                    message: "无效基准高程",
                    type: "warning",
                    center: true,
                });
                return;
            }

            analysis.tunnel_excavation(
                this.stampAPI.usearth,
                this.selectType,
                this.inputWidth,
                this.inputHeight,
                this.inputDeep,
                this.inputAltitude
            );
        },
        callback_setHeight(h) {
            this.inputAltitude = h;
        },
        handleGetHeightClick() {
            analysis.getAltitude(
                this.stampAPI.usearth,
                this.callback_setHeight
            );
        },
    },
    beforeRouteLeave(to, from, next) {
        next();
        analysis.clear_tunnel_excavation(this.stampAPI.usearth);
        this.$parent.$refs.functionPanel.curSelMenu.name = "";
    },
};
</script>

<style lang="less" scoped>
.bodyDiv {
    text-align: left;
}
.btnDiv {
    text-align: center;
}
.picker-input {
    width: calc(100% - 38px);
}
</style>

