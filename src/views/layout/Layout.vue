<template>
    <div class="app-wrapper">
        <div class="main-container">
            <navbar />
            <earth />
            <tool-panel />
            <search-tool ref="searchTool" />
            <function-panel ref="functionPanel" />
            <!-- <oper-dialog /> -->
            <router-view />
            <bottom ref="bottomTool" />
        </div>
    </div>
</template>
<script>
import navbar from "./components/Navbar";
import toolPanel from "./components/functionTool";
import earth from "./components/Earth";
import searchTool from "./components/searchTool.vue";
import FunctionPanel from "./components/functionPanel.vue";
import operDialog from "@/components/OperDialog";
import Bottom from "./components/bottom.vue";

export default {
    name: "Layout",
    components: {
        navbar,
        toolPanel,
        earth,
        searchTool,
        FunctionPanel,
        operDialog,
        Bottom,
    },
    created() {
        if (this.$router.path != "/") {
            this.$router.replace("/");
        }
    },
    methods: {},
};
</script>
<style lang="less" scoped>
</style>
