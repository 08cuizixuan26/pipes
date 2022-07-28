<template>
  <popover
    :visible.sync="dialogVisible"
    :show-header="true"
    :before-close="handleClose"
    :title="titleName"
    custom-class="layerPanel"
  >
    <div class="tab_list" :v-model="isShow">
      <div class="tab_div" @click="tabs1" :class="isShow ? 'active' : ''">
        管线图层
      </div>
      <div class="centre"></div>
      <div class="tab_div" @click="tabs1" :class="isShow ? '' : 'active'">
        基础图层
      </div>
    </div>
    <div>
      <!-- <el-tabs type="card" @tab-click="handleClick">
            <el-tab-pane label="管线图层" :class='{active:isactive}' > -->
      <div
        class="height"
        :class="isShow ? 'isHeight' : 'isNone'"
        style="display: block"
      >
        <el-scrollbar wrap-class="scrollbar-wrapper">
          <el-tree
            ref="tree"
            :data="pipelineData"
            :props="defaultProps"
            :default-checked-keys="pipelineCheckData"
            show-checkbox
            :expand-on-click-node="false"
            node-key="id"
            highlight-current
            @check-change="handlePipeCheckChange"
            @node-click="handleNodeClick"
          />
        </el-scrollbar>
      </div>
      <!-- </el-tab-pane>
            <el-tab-pane label="基础图层" :class='{active:isactive}'> -->
      <div class="height" :class="isShow ? 'isNone' : 'isHeight'">
        <el-scrollbar wrap-class="scrollbar-wrapper">
          <el-tree
            ref="tree1"
            :data="layerData"
            :props="defaultProps"
            :default-checked-keys="checkData"
            show-checkbox
            :expand-on-click-node="false"
            node-key="id"
            highlight-current
            @check-change="handleCheckChange"
            @node-click="handleNodeClick"
          />
        </el-scrollbar>
      </div>
      <!-- </el-tab-pane>
        </el-tabs> -->
    </div>
  </popover>
</template>

<script>
import { mapActions } from "vuex";
import { debounce } from "lodash";
import location from "@/stamplib/Location";
import popover from "@/components/Popover";

export default {
  name: "LayerPipeline",
  components: {
    popover,
  },
  data() {
    return {
      isShow: true,
      dialogVisible: true,
      titleName: "图层管理",
      // arr:['管线图层','基础图层'],
      defaultProps: {
        children: "children",
        label: "name",
      },
      clickCount: 0,
    };
  },
  computed: {
    theme() {
      return this.$store.state.theme;
    },
    layerPanelShow() {
      return this.$store.state.layerPanelShow;
    },
    layerData() {
      return this.$store.state.layerData;
    },
    pipelineData() {
      return this.$store.state.pipelineLayerData;
    },
    checkData() {
      return this.$store.state.checkData;
    },
    expandData() {
      return this.$store.state.expandData;
    },
    pipelineCheckData() {
      return this.$store.state.pipelineCheckData;
    },
    pipelineExpandData() {
      return this.$store.state.pipelineExpandData;
    },
  },

  methods: {
    tabs1() {
      this.isShow = !this.isShow;
    },
    // tabs2() {
    //   debugger;
    //   this.isShow = false;
    // },
    handleClose() {
      this.$parent.closePanel();
    },
    handleNodeClick(data) {
      this.clickCount++;
      this.treeNodeClick(data);
      const fnEmitDbClick = debounce(() => {
        if (this.clickCount > 1) {
          this.treeNodeDbClick(data);
        }
        this.clickCount = 0;
      }, 200);
      fnEmitDbClick();
    },
    treeNodeClick(data) {
      var layer = this.stampAPI.usearth.LayerManager.GetLayerByGUID(data.id);
      if (layer && (layer._rtti || layer.pipeline_type)) {
        this.changeSelectLayer(layer.get_guid());
      } else {
        this.changeSelectLayer("");
      }
    },
    treeNodeDbClick(data) {
      if (!data.children || data.children.length === 0) {
        var layer = this.stampAPI.usearth.LayerManager.GetLayerByGUID(data.id);
        if (layer && (layer._rtti || layer.pipeline_type)) {
          if (layer.default_view_point) {
            let heading = StampGis.StampMath.toDegrees(
              layer.default_view_point.heading
            );
            let tilt = StampGis.StampMath.toDegrees(
              layer.default_view_point.tilt
            );

            location.flyToRadians(
              this.stampAPI.usearth,
              layer.default_view_point.longitude,
              layer.default_view_point.latitude,
              layer.default_view_point.altitude,
              heading,
              tilt,
              layer.default_view_point.roll
            );
          } else {
            location.FlyToLayer(this.stampAPI.usearth, data.id, 1000);
          }
        } else {
          location.FlyToLayer(this.stampAPI.usearth, data.parentId, 1000);
        }
      } else {
        var layer = this.stampAPI.usearth.LayerManager.GetLayerByGUID(data.id);
        if (layer && (layer._rtti || layer.pipeline_type)) {
          location.FlyToLayer(this.stampAPI.usearth, data.id, 1000);
        }
      }
    },
    handleCheckChange(data, checked, indeterminate) {
      var tempArr = data.id.split("_");
      var layer = this.stampAPI.usearth.LayerManager.GetLayerByGUID(tempArr[0]);
      if (layer && (layer._rtti || layer.pipeline_type)) {
        if (tempArr.length > 1) {
          if (data.type) {
            layer[data.type].set_is_visible(checked);
          } else {
            let temp = "";
            for (let i = 1; i < tempArr.length; i++) {
              if (temp !== "") {
                temp += "_";
              }
              temp += tempArr[i];
            }
            layer[temp].set_is_visible(checked);
          }
        } else {
          if (!layer.pipeline_type || !indeterminate) {
            layer.set_is_visible(checked);
          }
        }
      } else if (!indeterminate) {
        this.setIsVisibleFunc(data, checked);
      }

      this.changeCheckData(this.$refs.tree1.getCheckedKeys());
    },
    handlePipeCheckChange(data, checked, indeterminate) {
      var tempArr = data.id.split("_");
      var layer = this.stampAPI.usearth.LayerManager.GetLayerByGUID(tempArr[0]);
      if (layer && (layer._rtti || layer.pipeline_type)) {
        if (tempArr.length > 1) {
          if (data.type) {
            layer[data.type].set_is_visible(checked);
          } else {
            let temp = "";
            for (let i = 1; i < tempArr.length; i++) {
              if (temp !== "") {
                temp += "_";
              }
              temp += tempArr[i];
            }
            layer[temp].set_is_visible(checked);
          }
        } else {
          if (!layer.pipeline_type || !indeterminate) {
            layer.set_is_visible(checked);
          }
        }
      } else if (!indeterminate) {
        this.setIsVisibleFunc(data, checked);
      }

      this.changePipeCheckData(this.$refs.tree.getCheckedKeys());
    },
    setIsVisibleFunc(data, checked) {
      var layer = this.stampAPI.usearth.LayerManager.GetLayerByGUID(data.id);
      if (layer && (layer._rtti || layer.pipeline_type)) {
        layer.set_is_visible(checked);
      } else if (data.children.length > 0) {
        for (var i = 0; i < data.children.length; i++) {
          this.setIsVisibleFunc(data.children[i], checked);
        }
      }
    },
    ...mapActions([
      "changeLayerPanelShow",
      "changeoperPanelShow",
      "changeSelectLayer",
      "changeCheckData",
      "changePipeCheckData",
    ]),
    handleClick() {
      this.isactive = !this.isactive;
    },
  },
  updated: function () {
    this.$refs.tree1.setCheckedKeys(this.checkData);
    this.$refs.tree.setCheckedKeys(this.pipelineCheckData);
  },
};
</script>

<style lang="less" scoped>
.layerPanel {
  width: 100%;
  max-width: 270px;
  position: fixed;
  top: 20vh;
  left: 0px;
  z-index: 100;
}

.layerPanel-items {
  height: 100%;
}

.scrollbar-wrapper {
  overflow-x: hidden !important;
}

.el-scrollbar__bar.is-vertical {
  right: 0px;
}
.el-scrollbar {
  height: calc(100% + 20px);
}

/deep/ .el-scrollbar__bar.is-horizontal {
  display: none;
}

.height {
  height: 52vh;
  display: none;
}

/deep/ .el-tabs__item.is-active {
  color: #ffffff;
}

/deep/ .el-tabs--card > .el-tabs__header .el-tabs__nav {
  // border: 1px solid rgba(255, 174, 3, 0.5);
  border: none;
  width: 100%;
}

/deep/ .el-tabs--card > .el-tabs__header {
  border-bottom: 1px solid rgba(255, 174, 3, 0.5);
}

/deep/ .el-tabs--card > .el-tabs__header .el-tabs__item {
  border-bottom: none;
  width: 50%;
}

/deep/ .el-tabs__item:hover {
  color: rgb(255, 174, 3);
}

/deep/ .el-tabs__item {
  color: gray;
}

/deep/ .el-tabs__item:last-child {
  border-left-color: rgba(255, 174, 3, 0.5);
}
.active {
  color: #fff !important;
  background: url("../../../public/images/popover/切换选中.png") no-repeat;
  background-size: 100% 100%;
}

.isHeight {
  display: block !important;
}

.isNone {
  display: none !important;
}

.tab_list {
  display: flex;
  border-bottom: 1px solid rgba(255, 174, 3, 0.5);
}
.tab_div {
  width: 49%;
  padding-bottom: 12px;
  color: gray;
}
.centre {
  width: 0.3%;
  background: url("../../../public/images/popover/popout.png") no-repeat;
  margin-bottom: 8px;
  // margin-bottom: 4px;
  // border-bottom: 1px solid solid rgba(255, 174, 3, 0.5);;
  // background-size: 100% 100%;
  // margin: 0 auto;
  // background-position: center center;
}
</style>
