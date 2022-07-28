<template>
    <el-row class="functionToolDiv">
        <div
            v-for="menuItem in menuItems"
            :key="menuItem.name"
            class="menu"
            @click="clickToolMenu(menuItem)"
        >
            <el-tooltip
                :content="menuItem.name"
                popper-class="tooltipColor"
                effect="dark"
                placement="top"
            >
                <img
                    :src="menuItem.selected ? menuItem.srch : menuItem.src"
                    alt=""
                    class="menuImg"
                />
            </el-tooltip>
        </div>
    </el-row>
</template>

<script>
export default {
    name: "FunctionTool",
    components: {},
    data() {
        return {
            menuItems: [
                {
                    id: "query",
                    name: "查询统计",
                    src: "images/tool/query.png",
                    srch: "images/tool/query-active.png",
                    selected: false,
                },
                {
                    id: "analysis",
                    name: "辅助决策",
                    src: "images/tool/analysis.png",
                    srch: "images/tool/analysis-active.png",
                    selected: false,
                },
                {
                    id: "mark",
                    name: "管线标注",
                    src: "images/tool/mark.png",
                    srch: "images/tool/mark-active.png",
                    selected: false,
                },
                {
                    id: "views",
                    name: "浏览测量",
                    src: "images/tool/views.png",
                    srch: "images/tool/views-active.png",
                    selected: false,
                },
            ],
        };
    },
    computed: {},
    watch: {},
    methods: {
        setSelected(item) {
            item.selected = !item.selected;
            for (let i = 0; i < this.menuItems.length; i++) {
                if (item.id != this.menuItems[i].id) {
                    this.menuItems[i].selected = false;
                }
            }
        },
        clickToolMenu(item) {
            this.setSelected(item);
            if (!item.selected) {
                this.$parent.$refs.functionPanel.cancelClick();
            } else {
                this.$parent.$refs.functionPanel.show(item.id);
            }
        },
    },
    mounted() {},
};
</script>

<style lang="less" scoped>
.functionToolDiv {
    z-index: 1;
    position: fixed;
    width: 17.5vw;
    height: 2.2vw;
    top: 11vh;
    right: 2vw;
    text-align: right;
}

.logo {
    position: relative;
    bottom: -3px;
    margin: 0px 5px;
}

.title {
    position: relative;
    bottom: 12px;
    font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB",
        "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
    color: rgba(255, 255, 255, 1);
    opacity: 1;
    font-size: 28px;
}

.el-menu-item-style {
    width: 30% !important;
    height: 48px !important;
    line-height: 48px !important;
    padding: 0px !important;
    margin-left: 2% !important;
    background-color: rgba(34, 54, 100, 0.9) !important;
}

.el-menu.el-menu--horizontal {
    border-bottom: none;
}
.menu {
    position: relative;
    width: 25%;
    height: 100%;
    color: white;
    display: inline-block;
    cursor: pointer;
    text-align: center;
}
.menuImg {
    width: 100%;
    height: 100%;
}
</style>
