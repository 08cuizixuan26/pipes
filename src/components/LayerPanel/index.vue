<template>
  <popover
    :visible.sync="dialogVisible"
    :show-header="true"
    :before-close="handleClose"
    :title="titleName"
    custom-class="layerPanel"
  >
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-tree
        ref="tree"
        :data="layerData"
        :props="defaultProps"
        :default-checked-keys="checkData"
        :expand-on-click-node="false"
        show-checkbox
        node-key="id"
        highlight-current
        @check-change="handleCheckChange"
        @node-click="handleNodeClick"
      />
    </el-scrollbar>
  </popover>
</template>

<script>
import { mapActions } from 'vuex'
import { debounce } from 'lodash'
import location from '@/stamplib/Location'
import popover from '@/components/Popover'

export default {
  name: 'LayerPanel',
  components: {
    popover
  },
  data() {
    return {
      dialogVisible: true,
      titleName: '基础图层',
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      clickCount: 0
    }
  },
  computed: {
    theme() {
      return this.$store.state.theme
    },
    layerPanelShow() {
      return this.$store.state.layerPanelShow
    },
    layerData() {
      return this.$store.state.layerData
    },
    pipelineData() {
      return this.$store.state.pipelineLayerData
    },
    checkData() {
      return this.$store.state.checkData
    },
    expandData() {
      return this.$store.state.expandData
    },
    pipelineCheckData() {
      return this.$store.state.pipelineCheckData
    },
    pipelineExpandData() {
      return this.$store.state.pipelineExpandData
    }
  },
  mounted() {},
  beforeDestroy() {
  },
  updated: function() {
    if (this.$refs.tree) {
      this.$refs.tree.setCheckedKeys(this.checkData)
    }
  },
  methods: {
    handleClose() {
      this.$parent.closeLayerBasic()
    },
    handleNodeClick(data) {
      this.clickCount++
      this.treeNodeClick(data)
      const fnEmitDbClick = debounce(() => {
        if (this.clickCount > 1) {
          this.treeNodeDbClick(data)
        }
        this.clickCount = 0
      }, 200)
      fnEmitDbClick()
    },
    treeNodeClick(data) {
      var layer = this.stampAPI.usearth.LayerManager.GetLayerByGUID(data.id)
      if (layer) {
        this.changeSelectLayer(layer.get_guid())
      }
    },
    treeNodeDbClick(data) {
      if (!data.children || data.children.length === 0) {
        var layer = this.stampAPI.usearth.LayerManager.GetLayerByGUID(data.id)
        if (layer) {
          location.FlyToLayer(this.stampAPI.usearth, data.id, 1000)
        } else {
          location.FlyToLayer(this.stampAPI.usearth, data.parentId, 1000)
        }
      } else {
        var layer = this.stampAPI.usearth.LayerManager.GetLayerByGUID(data.id)
        if (layer) {
          location.FlyToLayer(this.stampAPI.usearth, data.id, 1000)
        }
      }
    },
    handleCheckChange(data, checked, indeterminate) {
      var tempArr = data.id.split('_')
      var layer = this.stampAPI.usearth.LayerManager.GetLayerByGUID(tempArr[0])
      if (layer) {
        if (tempArr.length > 1) {
          if (data.type) {
            layer[data.type].set_is_visible(checked)
          } else {
            let temp = ''
            for (let i = 1; i < tempArr.length; i++) {
              if (temp !== '') {
                temp += '_'
              }
              temp += tempArr[i]
            }
            layer[temp].set_is_visible(checked)
          }
        } else {
          if (!layer.container || !indeterminate) {
            layer.set_is_visible(checked)
          }
        }
      } else if (!indeterminate) {
        this.setIsVisibleFunc(data, checked)
      }

      this.changeCheckData(this.$refs.tree.getCheckedKeys())
    },
    setIsVisibleFunc(data, checked) {
      var layer = this.stampAPI.usearth.LayerManager.GetLayerByGUID(data.id)
      if (layer) {
        layer.set_is_visible(checked)
      } else if (data.children.length > 0) {
        for (var i = 0; i < data.children.length; i++) {
          this.setIsVisibleFunc(data.children[i], checked)
        }
      }
    },
    ...mapActions([
      'changeLayerPanelShow',
      'changeoperPanelShow',
      'changeSelectLayer',
      'changeCheckData'
    ])
  }
}
</script>

<style lang="less" scoped>
.layerPanel {
  width: 100%;
  max-width: 300px;
  height: 68vh;
  position: fixed;
  top: 17vh;
  left: 10px;
  z-index: 100;
}

/deep/.el-dialog__body {
    height: calc(100% - 62px);
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
    height: 100%;
}

/deep/ .el-scrollbar__bar.is-horizontal {
    display: none;
}
</style>
