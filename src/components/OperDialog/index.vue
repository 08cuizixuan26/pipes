<template>
    <div class="OperDialogDiv">
        <el-dialog
            :width="funWidth"
            :title="funName"
            :visible.sync="operDialogShow"
            :before-close="handleClose"
            :close-on-click-modal="false"
        >
            <div class="block">
                <router-view :key="key" />
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "OperDialog",
    data() {
        return {};
    },
    computed: {
        key() {
            return this.$route.path !== undefined
                ? this.$route.path + +new Date()
                : this.$route + +new Date();
        },
        cachedViews() {
            return this.$store.state.cachedViews;
        },
        operDialogShow() {
            return this.$store.state.operDialogShow;
        },
        funName() {
            var item = this.$store.state.toolItem;
            if (item) {
                return item.name;
            } else {
                return "";
            }
        },
        funWidth() {
            var item = this.$store.state.toolItem;
            if (
                item &&
                (item.id === "sceneColor" || item.id === "blockColor")
            ) {
                return "700px";
            } else if (item && item.id === "AnalysisTranSection") {
                return "1025px";
            } else {
                return "50%";
            }
        },
    },
    methods: {
        handleClose() {
            this.changeOperDialogShow(false);
            if (typeof this.callbackCancel == "function") {
                this.callbackCancel();
            }
        },
        ...mapActions(["changeOperDialogShow"]),
    },
};
</script>

<style lang="less" scoped>
.OperDialogDiv {
    left: 300px;
    top: 100px;

    /deep/ .el-dialog {
        margin-top: 0 !important;
        top: 50%;
        transform: translateY(-50%);
    }

    /deep/ .el-dialog__title {
        color: #fff;
    }
    /deep/ .el-dialog__header {
        padding: 5px;
        text-align: left;
        padding-left: 10px;
    }
}
</style>
