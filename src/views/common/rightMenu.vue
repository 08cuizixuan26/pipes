<template>
    <div
        id="rightMenu"
        v-if="rightMenuShow"
        class="tree_menu"
        :style="{ ...rightMenuStyle }"
    >
        <ul>
            <li
                v-for="item in data"
                @click="item.callback"
                :class="item.hiddenClass"
                :key="item.id"
            >
                <i v-if="item.iconClass" :class="item.iconClass"></i>
                {{ item.label }}
            </li>
        </ul>
    </div>
</template>

<script>
const topHeight = 70;

export default {
    name: "rightMenu",
    data() {
        return {
            rightMenuShow: false,
            rightMenuStyle: {},
            data: [],
        };
    },
    computed: {},
    watch: {},
    mounted() {},
    beforeDestroy() {
        document.onclick = function () {};
    },
    methods: {
        show(options) {
            var self = this;
            self.data = options.data;
            self.rightMenuShow = true;

            self.$nextTick(function () {
                var y = Number(options.y);
                // y = y - topHeight;
                options.y = y;
                if (options.width && options.height) {
                    if (y + self.$el.clientHeight > options.height) {
                        options.y = y - self.$el.clientHeight;
                    }
                }
                self.rightMenuStyle = {
                    top: options.y + "px",
                    left: options.x + "px",
                };
            });

            document.onclick = function (ev) {
                self.rightMenuShow = false;
            };
        },
        close(options) {
            this.rightMenuShow = false;
            this.data = [];
            document.onclick = function () {};
        },
    },
};
</script>

<style lang="less" scoped>
.tree_menu {
    position: fixed;
    display: block;
    z-index: 20000;
    background-color: #fff;
    padding: 5px 0;
    border: 1px solid #aec1ee;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    width: 100px;

    ul {
        margin: 0;
        padding: 0;
    }
    ul li {
        list-style: none;
        margin: 0px 5px;
        padding: 0px 20px;
        font-size: 14px;
        line-height: 30px;
        cursor: pointer;
        color: black;
    }
    ul li:hover {
        background-color: #aec1ee;
    }
}
.hiddenClass {
    display: none;
}
</style>