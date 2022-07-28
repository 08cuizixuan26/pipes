<template>
    <div class="dialogDiv">
        <el-dialog 
            center
            :title="dialogTitle" 
            :visible.sync="dialogVisible" 
            :before-close="handleClose"
            :close-on-click-modal="false"
            :append-to-body="true">
            <el-form>
                <hr/>
                <el-form-item label="名称" :label-width="labelWidth">
                    <!-- 输入框 -->
                    <el-input v-model="name" autocomplete="off" v-input-focus>
                    </el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="clickOK">确 定</el-button>
                <el-button @click="clickCancel">取 消</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { addClass, removeClass } from '@/utils'
import { mapActions } from 'vuex'
import localStorage from "@/stamplib/LocalStorage"
import $ from "jquery"

export default {
  name: 'editName',
  data() {
    this._callbackOK = null;
    this._callbackCancel = null;
    return {
        name: "",
        labelWidth: "100px",
        dialogVisible: false,
        dialogTitle: "编辑",
    }
  },
  computed: {
  },
  watch: {
  },
  mounted() {
  },
  beforeDestroy() {
  },
  methods: {
    show(options){
        this.dialogTitle = options.title||"";
        this.name = options.data;
        this._callbackOK = options.callbackOK;
        this._callbackCancel = options.callbackCancel;
        this.dialogVisible = true;
    },
    handleClose(){
        this.dialogVisible = false;
        if(typeof this._callbackCancel == "function"){
            this._callbackCancel();
        }
    },
    validate(){
        if(this.name == ""){
            this.$message({
                message: "请输入名称",
                type: 'warning',
                center: true
            });
            return false;
        }
        return true;
    },
    clickOK: function(){
        if(this.validate() && typeof this._callbackOK == "function"){
            this.dialogVisible = false;
            this._callbackOK(this.name);
        }
    },
    clickCancel: function(){
        this.dialogVisible = false;
        if(typeof this._callbackCancel == "function"){
            this._callbackCancel();
        }
    },
    ...mapActions([]),
  }
}
</script>

<style lang="less" scoped>
    /deep/ .el-form-item__content{
        margin-right: 10px;
    }
    /deep/ .el-dialog{
        width: 33.33%;
        margin-top:0 !important;
        top: 50%;
        transform: translateY(-50%);
    }
    .el-input, .el-select,.el-textarea{
        width: calc(100% - 80px);
    }

    .smallInput{
        width: calc((100% - 108px)/2) !important;
    }
    
</style>
