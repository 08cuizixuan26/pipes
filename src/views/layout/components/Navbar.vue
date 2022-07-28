<template>
    <el-row class="navBarDiv">
        <el-col class="absoluteClass">
            <img src="images/top/top-bg.png" alt="" class="topImg" />
        </el-col>
        <img src="images/top/right-bg.png" alt="" class="rightImg" />
    </el-row>
</template>

<script>
export default {
    name: "NavBar",
    data() {
        return {};
    },
    computed: {},
    methods: {},
    mounted() {},
};
</script>

<style lang="less" scoped>
.navBarDiv {
    z-index: 1;
    position: fixed;
    width: 100%;
    height: 9.5vh;
}

.absoluteClass {
    position: absolute;
    top: 0px;
    width: 100%;
    height: 9.5vh;
    text-align: center;
    font-size: 2.2vw;
    line-height: 2.9vw;
    color: lightblue;
    background: url("../../../../public/images/top/top-mask.png") no-repeat;
    background-size: 100% 100%;
}
.topImg {
    height: 5.88vh;
    width: 98%;
    margin-top: 2vh;
}
.rightImg {
    position: absolute;
    top: 0;
    right: 0.4vw;
    width: 0.6vw;
    height: 92vh;
    margin-top: 7.7vh;
}
.titleClass {
    position: absolute;
    top: -4px;
    left: 31.3vw;
    width: 37.2vw;
}

.logo {
    position: relative;
    bottom: -3px;
    margin: 0px 5px;
}

.title {
    position: relative;
    left: 5px;
    font-family: "Microsoft YaHei";
    color: rgba(255, 255, 255, 1);
    opacity: 1;
    font-size: 32px;
    line-height: 6.574vh;
}
</style>
