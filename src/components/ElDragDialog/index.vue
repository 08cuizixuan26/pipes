<template>
  <div class="earthtool-container">
    <el-dialog
      v-el-drag-dialog
      :visible.sync = "dialogTableVisible"
      :close-on-click-modal="false"
      :show-close="false"
      top="200px"
      custom-class="dailog-customclass">
      <div slot="title" style="background-color:#102378">
        <el-row type="flex" justify="end">
          <el-col :span="9" >
            <el-button size="mini" type="primary" icon="el-icon-close" circle/>
          </el-col>
        </el-row>
      </div>
      <div slot="footer"/>
    </el-dialog>
  </div>
</template>

<script>
import elDragDialog from '@/directives/el-drag-dialog'

export default {
  name: 'DragDialogDemo',
  directives: { elDragDialog },
  data() {
    return {
      dialogTableVisible: true,
      tools: {

      }

    }
  }
}
</script>

<style  scoped>
.earthtool-container >>> .el-dialog__header{
      padding: 0px
    }

  .earthtool-container >>> .el-dialog.dailog-customclass{
    width: 65px;
    height: 470px;
    border:1px solid #3e8eb6;
    margin-right: 42px;
  }

  .earthtool-container >>> .el-button--mini.is-circle{
    padding: 4px;
  }

  .earthtool-container >>> .el-dialog__footer{
    display: none;
  }
</style>
