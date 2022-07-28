<template>
    <transition
        :name="popoverFade"
        @after-enter="afterEnter"
        @after-leave="afterLeave"
    >
        <div
            v-el-drag-dialog
            v-show="visible"
            :class="['el-dialog', 'popover', customClass]"
            :dragable="dragable"
            class="wrapper"
            role="dialog"
        >
            <div
                v-if="showHeader"
                :class="['el-dialog__header', { backPaddingClass: isBack }]"
                @dblclick="handleDblclick"
            >
                <div
                    :class="[
                        'el-dialog__headerDiv',
                        { backPaddingClass2: isBack },
                    ]"
                >
                    <slot name="title">
                        <span
                            :class="[
                                'el-dialog__title',
                                { backPaddingClass3: isBack },
                            ]"
                            >{{ title }}</span
                        >
                    </slot>
                    <div
                        v-if="!isBack"
                        class="el-dialog__headerbtn"
                        @click="handleClose"
                    ></div>
                </div>
                <div class="line"></div>
            </div>
            <div class="el-dialog__body">
                <slot />
            </div>
            <div v-if="$slots.footer" class="el-dialog__footer">
                <slot name="footer" />
            </div>
            <div class="footer"></div>
        </div>
    </transition>
</template>

<script>
import elDragDialog from "@/directives/el-drag-dialog/drag";
export default {
    name: "Popover",
    directives: {
        elDragDialog,
    },
    props: {
        showHeader: {
            type: Boolean,
            default: true,
        },
        visible: {
            type: Boolean,
            default: false,
        },
        popoverFade: {
            type: String,
            default: null,
        },
        title: {
            type: String,
            required: false,
            default: null,
        },
        showClose: {
            type: Boolean,
            default: true,
        },
        isBack: {
            type: Boolean,
            default: false,
        },
        dragable: {
            // 是否可拖动
            type: Boolean,
            default: false,
        },
        customClass: {
            type: String,
            default: "",
        },
        top: {
            type: String,
            default: "15vh",
        },
        wideScale: {
            type: String,
            default: "2", //默认中号背景
        },
        beforeClose: Function,
        dblClick: Function,
    },
    data() {
        return {
            closed: false,
            key: 0,
            isHover: false,
        };
    },
    computed: {
        style() {
            const style = {};
            if (!this.fullscreen) {
                style.marginTop = this.top;
                if (this.width) {
                    style.width = this.width;
                }
            }
            return style;
        },
        bgClass() {
            return "bgClass" + this.wideScale;
        },
    },
    mounted() {},
    methods: {
        handleClose() {
            this.$emit("on-close");
            if (typeof this.beforeClose === "function") {
                this.beforeClose();
                this.hide();
            } else {
                this.hide();
            }
        },
        handleDblclick() {
            if (typeof this.dblClick === "function") {
                this.dblClick();
            }
        },
        hide(cancel) {
            this.$emit("update:visible", false);
        },
        afterEnter() {
            this.$emit("opened");
        },
        afterLeave() {
            this.$emit("closed");
        },
    },
};
</script>

<style lang="less" scoped>
.popover {
    position: fixed;
    z-index: 2001;
    top: calc(7.77vh + 1.8vw);
    right: calc(20vw - 2px);
    margin: 0;
    color: #d3f7ff;
    font-size: 1vw;
    background: transparent;
}

.closeClass {
    width: 1.77vw;
    height: 1.77vw;
    cursor: pointer;
}

.backClass {
    cursor: pointer;
}

.el-dialog__body {
    padding: 0;
    color: white;
    text-align: center;
    font-size: 14px;
    background: url(../../../public/images/popover/thirdly_bg_body.png) repeat-y;
    background-size: 100% auto;
    padding-top: 10px;
    padding-left: 5px;
    padding-right: 5px;
}

.el-dialog__header {
    // padding: 0px 0px 0px;
    text-align: left;
    // min-height: 1.5vw;
    // height: 35px;
    background: url(../../../public/images/popover/thirdly_bg_head.png) no-repeat;
    background-size: 100% 100%;
    padding: 1.4vw 1.042vw 0.521vw;
}

.el-dialog__title {
    font-family: ShiShangZhongHeiJianTi;
    font-size: 0.9375vw;
    padding-left: 25px;
    font-weight: bold;
    min-height: 1.5vw;
    line-height: 35px;
    line-height: 35px;
    background-clip: text;
    background-color: #fff;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.el-dialog__footer {
    text-align: center;
}

.el-dialog__headerbtn {
    width: 24px;
    height: 24px;
    top: -2px;
    right: 4px;
    background: url(../../../public/images/popover/close-normal.png) no-repeat;
    background-size: 100% 100%;
    z-index: 10;
}

.el-dialog__headerDiv {
    display: flex;
    align-content: center;
}

.backPaddingClass {
    padding-top: 0px;
}

.backPaddingClass2 {
    padding: 10px;
}

.backPaddingClass3 {
    padding-left: 5px;
}

.popoverClose {
    font-size: 1vw;
    color: white;
}

.closeBtn {
    width: 15px;
    height: 15px;
}

.footer {
    background: url(../../../public/images/popover/thirdly_bg_foot.png) no-repeat;
    background-size: 100% 100%;
    min-height: 40px;
    max-height: 60px;
}

.line {
    margin: auto;
    width: 98%;
    height: 1px;
    background-color: rgba(255, 174, 3, 0.3);
    transform: scale(1, 0.5);
}
</style>
