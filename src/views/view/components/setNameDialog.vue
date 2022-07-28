<template>
  <div class="dialogDiv">
    <el-dialog
      center
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      :before-close="handleClose"
      :close-on-click-modal="false"
      :append-to-body="true"
    >
      <el-form>
        <hr />
        <el-form-item label="名称：" labelWidth="65px">
          <el-input
            size="mini"
            v-model="newViewName"
            placeholder="请输入内容"
            class="inputclass"
            v-input-focus
          ></el-input>
        </el-form-item>
        <el-form-item label="描述：" labelWidth="65px">
          <el-input
            size="mini"
            v-model="newDescribe"
            placeholder="请输入内容"
            class="inputclass"
            v-input-focus
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="clickOK">确 定</el-button>
        <el-button type="primary" @click="clickCancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "setName",
  data() {
    this._callbackOK = null;
    this._callbackCancel = null;
    this.list = [];
    this.errorMsg = "已存在同名热点";
    return {
      dialogVisible: false,
      dialogTitle: "",
      newViewName: "",
      newDescribe: "",
      oldName: "",
    };
  },
  computed: {},
  mounted() {},
  beforeDestroy() {},
  methods: {
    show(options) {
      this._callbackOK = options.callbackOK;
      this._callbackCancel = options.callbackCancel;
      this.dialogVisible = true;
      this.dialogTitle = options.title;
      if (options.name) {
        this.newViewName = options.name;
        this.oldName = options.name;
      } else {
        this.newViewName = "";
        this.oldName = "";
      }
      if (options.des) {
        this.newDescribe = options.des;
      } else {
        this.newDescribe = "";
      }
      this.list = options.list;
      if (options.msg) {
        this.errorMsg = options.msg;
      }
    },
    handleClose() {
      this.dialogVisible = false;
      if (typeof this._callbackCancel == "function") {
        this._callbackCancel();
      }
    },
    validate() {
      if (this.newViewName.trim() == "") {
        this.$message({
          message: "名称不能为空",
          type: "warning",
          center: true,
        });
        return false;
      }
      if (this.list && this.list.length > 0) {
        for (var i = 0; i < this.list.length; i++) {
          if (this.list[i].label == this.oldName) {
            continue;
          }
          if (this.newViewName == this.list[i].label) {
            this.$message({
              message: this.errorMsg,
              type: "warning",
              center: true,
            });
            return false;
          }
        }
      }
      return true;
    },
    clickOK: function () {
      var self = this;
      var earth = self.stampAPI.usearth;
      if (this.validate() && typeof self._callbackOK == "function") {
        self._callbackOK(this.newViewName, this.newDescribe);
        self.dialogVisible = false;
      }
    },
    clickCancel: function () {
      this.dialogVisible = false;
      if (typeof this._callbackCancel == "function") {
        this._callbackCancel();
      }
    },
    ...mapActions([]),
  },
};
</script>

<style lang="less" scoped>
@transparentColor: transparent;
@textColor: #fff;
@headbackgroundcolor:rgba (	255, 174, 3, 0.4);
@hoverBackgroundColor: rgba(255, 255, 255, 0.3);
@borderColor: rgba(255, 174, 3, 0.5);

/deep/ .el-dialog {
  width: 20%;
  margin-top: 0 !important;
  top: 50%;
  transform: translateY(-50%);
  border: 1px solid @borderColor;
}

/deep/ .el-form-item__label {
  color: @textColor;
}

/deep/ .el-dialog__body {
  padding: 0px !important;
}

.el-button {
  margin-left: 1vh;
  margin-right: 1vh;
}

.inputclass {
  width: calc(100% - 10px);
}
</style>
