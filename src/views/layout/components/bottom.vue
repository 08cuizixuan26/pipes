<template>
  <div class="bottomDiv">
    <div class="menuDiv">
      <div v-for="item in menus" :key="item.name" class="menuBox">
        <!-- <div
          class="block sliderDiv"
          v-if="showSlider && item.name == '地形透明'"
          @mouseenter="imgHover(item)"
          @mouseleave="imgUnHover(item)"
        >
          <div>
            <el-slider v-model="showValue" @input="changeSli" />
          </div>
        </div> -->
        <!-- <img
                    v-if="item.name == '地形透明'"
                    :src="showSlider ? item.srch : item.src"
                    alt=""
                    class="menuImg"
                    @mouseenter="imgHover(item)"
                    @mouseleave="imgUnHover(item)"
                /> -->
        <el-tooltip
          :content="item.name"
          popper-class="tooltipColor"
          effect="dark"
          placement="bottom"
        >
          <img
            :src="item.selected ? item.srch : item.src"
            alt=""
            class="menuImg"
            @click="menuClick(item)"
          />
        </el-tooltip>
      </div>
    </div>
    <layerPipeline
      v-if="selectMenu && selectMenu.name == '管线图层'"
      ref="layerPipeline"
    />
    <legendPanel
      v-if="selectMenu && selectMenu.name == '图例'"
      ref="legendPanel"
    />
    <sliderDialog
      v-if="selectMenu && selectMenu.name == '地形透明'"
      ref="sliderDialog"
    ></sliderDialog>
  </div>
</template>

<script>
import layerPipeline from "@/components/LayerPipeline";
import legendPanel from "./legendPanel";
import sliderDialog from "./sliderDialog";
import { mapActions, mapState } from "vuex";
import cone from "../../draw/element3D/cone";
export default {
  name: "Bottom",
  components: {
    layerPipeline,
    legendPanel,
    sliderDialog,
  },
  data() {
    return {
      menus: [
        {
          name: "管线图层",
          srch: "images/bottom/jctc-active.png",
          src: "images/bottom/jctc-normal.png",
          selected: false,
        },
        {
          name: "地形透明",
          srch: "images/bottom/dxtm-active.png",
          src: "images/bottom/dxtm-normal.png",
          selected: false,
        },
        {
          name: "地下浏览",
          srch: "images/bottom/dxll-active.png",
          src: "images/bottom/dxll-normal.png",
          selected: false,
        },
        {
          name: "碰撞",
          srch: "images/bottom/gxtc-active.png",
          src: "images/bottom/gxtc-normal.png",
          selected: false,
        },
        {
          name: "图例",
          srch: "images/bottom/tl-active.png",
          src: "images/bottom/tl-normal.png",
          selected: false,
        },
      ],
      selectMenu: null,
      layerPipelineShow: false,
      legendPanelShow: false,
      viewSettingShow: false, //场景效果
      showSlider: false,
    };
  },
  // watch: {
  //     // 监听 vuex 里面的 sliderDialogVisible 的状态,根据状态来判断是否让按钮高亮
  //     sliderDialogVisible: {
  //         handler: function (newVal, oldVal) {
  //             if (newVal == false) {
  //                 for (let i = 0; i < this.menus.length; i++) {
  //                     if (this.menus[i].name == "地形透明") {
  //                         this.menus[i].selected = newVal;
  //                     }
  //                 }
  //             } else {
  //                 for (let i = 0; i < this.menus.length; i++) {
  //                     if (this.menus[i].name == "管线图层") {
  //                         this.menus[i].selected = oldVal;
  //                     }
  //                 }
  //             }
  //         },
  //         deep: true,
  //         immediate: true,
  //     },
  // },
  computed: {
    heading() {
      return this.$store.state.heading;
    },
    showValue: {
      get() {
        return this.$store.state.sliderValue;
      },
      set(val) {
        this.changeSliderValue(val);
      },
    },
    toolItem() {
      return this.$store.state.toolItem;
    },
    ...mapState(["sliderDialogVisible"]),
  },
  methods: {
    closePanel(val) {
      if (val == "transparent") {
        this.changeSliderValue(100);
        this.stampAPI.usearth.document.terrain_transparency = 1;
        if (this.selectMenu && this.selectMenu.name !== "地形透明") {
          return;
        }
      }
      if (this.selectMenu) {
        this.selectMenu.selected = false;
        this.selectMenu = null;
      }
    },
    locateNorth() {
      this.stampAPI.usearth.GlobeObserver.NorthView();
    },
    menuClick(item) {
      if (
        item.name == "地形透明" ||
        item.name == "管线图层" ||
        item.name == "图例"
      ) {
        for (let index = 0; index < this.menus.length; index++) {
          if (
            this.menus[index].name == item.name ||
            this.menus[index].name == "地下浏览" ||
            this.menus[index].name == "碰撞"
          ) {
            continue;
          }

          this.menus[index].selected = false;
        }
      }

      switch (item.name) {
        case "地下浏览":
          item.selected = !item.selected;
          this.stampAPI.usearth.setUndergroundMode(item.selected);
          break;
        case "碰撞":
          item.selected = !item.selected;
          this.stampAPI.usearth.GlobeObserver.IntersectModel = item.selected;
          break;
        case "地形透明":
          //   if (this.toolItem != null && this.toolItem.id == "ViewFlyMode") {
          //     this.$router.push("/");
          //   }
          item.selected = !item.selected;
          if (item.selected) {
            this.selectMenu = item;
          } else {
            this.selectMenu = "";
          }
          break;
        case "管线图层":
          item.selected = !item.selected;
          if (item.selected) {
            this.selectMenu = item;
          } else {
            this.selectMenu = "";
          }
          break;
        case "图例":
          item.selected = !item.selected;
          if (item.selected) {
            this.selectMenu = item;
          } else {
            this.selectMenu = "";
          }
          break;
      }
      this.$parent.$refs.searchTool.closeSearchResult();
    },
    // imgHover(item) {
    //   if (item.name == "地形透明") {
    //     this.showSlider = true;
    //   } else {
    //     this.showSlider = false;
    //   }
    // },
    // imgUnHover() {
    //   this.showSlider = false;
    // },
    // changeSli(val) {
    //   this.stampAPI.usearth.document.terrain_transparency = val / 100;
    // },
    ...mapActions([
      "changeSliderValue",
      "changeSliderType",
      "changeSliderDialogShow",
    ]),
  },
};
</script>

<style lang="less" scoped>
.bottomDiv {
  // z-index: 1;
  position: fixed;
  width: 100%;
  height: 9vh;
  bottom: 0;
  background: url("../../../../public/images/bottom/bottom-mask.png") no-repeat;
  background-size: 100% 100%;
}
.moveImage {
  position: absolute;
  height: 100%;
  bottom: 0px;
  left: 3.56vw;
  transform: rotate(30deg);
}
.menuDiv {
  z-index: 1;
  position: fixed;
  left: 19px;
  bottom: 2vh;
  //   width: 158px;
  height: 38px;
  display: flex;
  justify-content: space-around;
}
.sliderDiv {
  width: 158px;
  margin-left: -60px;
  margin-top: -50px;

  > div {
    background-color: rgba(55, 57, 40, 0.7);
    border-radius: 5px;
    border: 1px solid rgba(255, 174, 3, 0.5);
    padding: 5px 12px;
  }
}
.menuBox {
  width: 38px;
  font-size: 14px;
  text-align: center;
}
.menuBox + .menuBox {
  padding-left: 10px;
}
.menuImg {
  width: 100%;
  height: 100%;
  cursor: pointer;
  object-fit: contain;
}
</style>
