<template>
    <div class="legendDiv">
        <popover
            :visible.sync="visible"
            :title="titleName"
            custom-class="dailog-customclass"
            @on-close="closePanel"
        >
            <div v-if="showMode == 'material'" class="all-items">
                <div
                    v-for="(item, index) in pipelineLayerList"
                    :key="index"
                    class="item-div"
                >
                    <img class="item-img" :src="item.src" />
                    <span class="item-txt" v-text="item.name" />
                </div>
            </div>
            <div v-else-if="showMode == 'custom'" class="all-items">
                <div
                    v-for="(item, index) in pipelineLayerList"
                    :key="index"
                    class="item-div"
                >
                    <div
                        class="item-img"
                        :style="
                            'float:left;background-color:' + getLayerColor(item)
                        "
                    />
                    <span class="item-txt" v-text="item.name" />
                </div>
            </div>
        </popover>
    </div>
</template>

<script>
import popover from "@/components/Popover";

export default {
    name: "LegendPanel",
    components: { popover },
    data() {
        this.Data = [];
        return {
            titleName: "图例",
            showMode: "material",
            visible: true,
        };
    },
    computed: {
        pipelineLayerList() {
            return this.g_Project.pipeListData;
        },
    },
    mounted() {},
    methods: {
        closePanel() {
            this.$parent.closePanel();
        },
        getBlockLayerSymbol(item) {
            return (
                custom_config.server_ip +
                "/sde?layerID=" +
                item.guid +
                "&file=container/display/common/0/8000000000000000.t_sde&"
            );
        },
        getLayerColor(item) {
            return "#FF0000";
        },
    },
};
</script>

<style lang="less" scoped>
.legendDiv {
    /deep/ .dailog-customclass {
        width: 350px;
        color: #fff;
        left: 0px;
        bottom: 58px;
        top: auto;
    }
    /deep/ .el-dialog__title {
        color: #fff;
    }
    /deep/ .el-dialog__header {
        padding: 1.5vw 0;
        text-align: left;
    }
    /deep/ .el-dialog__body {
        padding: 0 1vw;
    }
    .all-items {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
    }
    .item-div {
        display: flex;
        width: 125px;
        margin: 5px 0 5px 25px;
    }
    .item-img {
        width: 60px;
        height: 30px;
    }
    .item-txt {
        width: 90px;
        height: 30px;
        line-height: 30px;
        text-align: left;
        padding-left: 5px;
    }
}
</style>
