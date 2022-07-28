<template>
    <div class="dialogDiv">
        <el-dialog
            center
            :title="dialogTitle"
            :visible.sync="dialogVisible"
            :before-close="handleClose"
            :close-on-click-modal="false"
            @closed="
                () => {
                    this.$refs['objectForm'].clearValidate();
                }
            "
            :append-to-body="true"
        >
            <el-form :model="data" status-icon ref="objectForm">
                <hr />
                <el-form-item
                    v-for="(item, key) in data"
                    :key="item.key"
                    :label="item.label"
                    :label-width="labelWidth"
                    :prop="key + '.value'"
                    :rules="item.validator"
                >
                    <!-- 输入框 -->
                    <el-input
                        v-if="
                            item.type == 1 ||
                            item.type == 4 ||
                            item.type == 5 ||
                            item.type == 7 ||
                            item.type == 8
                        "
                        v-model="item.value"
                        :disabled="
                            item.disabled ||
                            item.type == 5 ||
                            item.type == 7 ||
                            item.type == 8
                        "
                        autocomplete="off"
                        v-input-focus
                    >
                    </el-input>

                    <!-- 下拉框 -->
                    <el-select
                        v-if="item.type == 2"
                        v-model="item.value"
                        :disabled="item.disabled"
                        @change="selectChange(item)"
                    >
                        <el-option
                            v-for="item2 in item.content"
                            :key="item2.value"
                            :label="item2.label"
                            :value="item2.value"
                        ></el-option>
                    </el-select>

                    <!-- 多行文本框 -->
                    <el-input
                        v-if="item.type == 3"
                        type="textarea"
                        v-model="item.value"
                        :disabled="item.disabled"
                        v-input-focus
                    ></el-input>

                    <!-- 颜色拾取按钮 -->
                    <el-color-picker
                        v-if="item.type == 4"
                        v-model="item.value"
                        size="mini"
                        :disabled="item.disabled"
                    ></el-color-picker>

                    <!-- 多少 到 多少 的输入框 -->
                    <el-input
                        v-if="item.type == 6"
                        v-model="item.minValue"
                        class="smallInput"
                        :disabled="item.disabled"
                        autocomplete="off"
                        v-input-focus
                    >
                    </el-input>
                    <label v-if="item.type == 6" class="middle-label">{{
                        item.middleText
                    }}</label>
                    <el-input
                        v-if="item.type == 6"
                        v-model="item.maxValue"
                        class="smallInput"
                        :disabled="item.disabled"
                        autocomplete="off"
                        v-input-focus
                    >
                    </el-input>

                    <!-- 文件选择按钮（本地或服务器） -->
                    <el-button
                        v-if="
                            item.type == 5 || item.type == 7 || item.type == 8
                        "
                        type="primary"
                        size="mini"
                        style="width: 28px; margin-left: 8px"
                        :disabled="item.disabled"
                        @click="handleFilePathClick(item)"
                        :title="item.toolTip || ''"
                        ><i class="el-icon-folder" style="margin-left: -5px"></i
                    ></el-button>
                    <!-- 文件选择器file控件 -->
                    <input
                        v-if="item.type == 5"
                        :ref="item.field"
                        style="display: none"
                        name="file"
                        type="file"
                        :multiple="item.isMultiSel"
                        :accept="item.fileExt"
                        @change="selectFile(item)"
                    />
                    <input
                        v-if="item.type == 8"
                        :ref="item.field"
                        style="display: none"
                        name="file"
                        type="file"
                        @change="selectFolder(item)"
                        webkitdirectory
                    />
                    <label v-if="item.afterText != ''" class="after-label">{{
                        item.afterText
                    }}</label>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="clickOK">确 定</el-button>
                <el-button @click="clickCancel">取 消</el-button>
            </div>
        </el-dialog>

        <FileSelectDialog ref="FileSelectDialog" />
    </div>
</template>

<script>
import $ from "jquery";
import { mapActions } from "vuex";
import { addClass, removeClass, check2N } from "@/utils";
import localStorage from "@/stamplib/LocalStorage";
import FileSelectDialog from "@/components/FileSelectDialog";

export default {
    name: "showDialog",
    components: {
        FileSelectDialog,
    },
    data() {
        this._elementManager = null; //对象管理
        this._callbackOK = null;
        this._callbackCancel = null;
        return {
            labelWidth: "100px",
            dialogVisible: false,
            dialogTitle: "添加",
            data: [],
        };
    },
    methods: {
        initFiles() {
            for (var item in this.$refs) {
                if (Array.isArray(this.$refs[item])) {
                    for (var i = 0; i < this.$refs[item].length; i++) {
                        this.$refs[item][i].value = "";
                    }
                } else {
                    this.$refs[item].value = "";
                }
            }
        },
        show(options) {
            this.initFiles();
            this.dialogTitle = options.title || "";
            this.data = options.data;
            this._elementManager = options.elementManager;
            this._callbackOK = options.callbackOK;
            this._callbackCancel = options.callbackCancel;
            this.dialogVisible = true;
        },
        // handleServerPathClick(fieldName){//选择服务器上面的文件
        //     var self = this;
        //     self.$refs["FileSelectDialog"].show({
        //         dialogTitle: "选择文件(" + self.data[fieldName].fileExt + ")",
        //         fileExt: self.data[fieldName].fileExt,
        //         callbackOK: function(filePath){
        //             self.data[fieldName].value = filePath;
        //         }
        //     });
        // },
        handleFilePathClick(item) {
            //选择本地文件
            var self = this;
            if (item.type == "5" || item.type == "8") {
                //文件或文件夹选择器
                console.log(self.$refs[item.field][0]);
                self.$refs[item.field][0].click();
            } else if (item.type == "7") {
                //服务器选择器
                self.$refs["FileSelectDialog"].show({
                    dialogTitle:
                        "选择文件(" + self.data[item.field].fileExt + ")",
                    fileExt: self.data[item.field].fileExt,
                    callbackOK: function (filePath) {
                        self.data[item.field].value = filePath;
                    },
                });
            }
        },
        selectFile(item) {
            var self = this;
            var fileInput = self.$refs[item.field][0];
            if (!fileInput || fileInput.files.length <= 0) {
                return;
            }
            let url = window.URL || window.webkitURL;
            if (
                self._elementManager &&
                typeof self._elementManager.fileSelectFinished == "function"
            ) {
                //文件选择后事件，用于一些需要特殊处理的对象
                self._elementManager.fileSelectFinished(self, item);
            } else if (item.b2NSize) {
                //选中的是图片，且必须为2的N次方大小
                var img = new Image(); //构造JS的Image对象
                img.src = url.createObjectURL(fileInput.files[0]); //将本地图片赋给image对象
                img.onload = function () {
                    if (img.width != img.height || !check2N(img.width)) {
                        self.$message({
                            message: item.toolTip,
                            type: "warning",
                        });
                        fileInput.value = "";
                        return;
                    }
                    readFileToData();
                };
            } else {
                //一般情况
                readFileToData();
            }

            function readFileToData() {
                var file = fileInput.files[0];
                localStorage.readFileToArrayBuffer(file, function (fileinfo) {
                    for (var dataKey in self.data) {
                        if (self.data[dataKey].field == item.field) {
                            self.data[dataKey].value = file.name;
                            self.data[dataKey].fileinfo = fileinfo;
                            break;
                        }
                    }
                });
            }
        },
        selectFolder(item) {
            var self = this;
            var fileInput = self.$refs[item.field][0];
            if (!fileInput || !fileInput.value) {
                return;
            }
            if (fileInput.files.length <= 0) {
                self.$message({
                    message: "文件夹为空，请重新选择",
                    type: "warning",
                });
                return;
            }
            self.data[item.field].value =
                fileInput.files[0].webkitRelativePath.split("/")[0];
            self.data[item.field].files = fileInput.files;
        },
        selectChange(item) {
            if (
                this._elementManager &&
                typeof this._elementManager.selChangeEvent == "function"
            ) {
                return this._elementManager.selChangeEvent(this.data, item);
            } else {
                return true;
            }
        },
        handleClose() {
            this.dialogVisible = false;
            if (typeof this._callbackCancel == "function") {
                this._callbackCancel();
            }
        },
        validate() {
            if (
                this._elementManager &&
                typeof this._elementManager.validate == "function"
            ) {
                return this._elementManager.validate(this.data, this);
            } else {
                return true;
            }
        },
        clickOK: function () {
            this.$refs["objectForm"].validate((valid) => {
                if (valid) {
                    let failed = this._callbackOK();
                    this.dialogVisible = false;
                    this.$refs["objectForm"].clearValidate();
                } else {
                    this.$message({
                        type: "error",
                        message: "请检查输入值是否符合要求",
                    });
                    return;
                    // this.dialogVisible = true;
                }
            });
            // if(this.validate() && typeof this._callbackOK == "function"){
            //     // this.dialogVisible = false;
            //    let failed = this._callbackOK();
            //    if(!failed){
            //        this.dialogVisible = false;
            //    }
            // }
        },
        clickCancel: function () {
            this.dialogVisible = false;
            if (typeof this._callbackCancel == "function") {
                this._callbackCancel();
            }
            this.$refs["objectForm"].clearValidate();
        },
        ...mapActions([]),
    },
};
</script>

<style lang="less" scoped>
/deep/ .el-form-item__content {
    margin-right: 10px;
}
/deep/ .el-dialog {
    width: 33.33%;
    margin-top: 0 !important;
    top: 50%;
    transform: translateY(-50%);
    min-width: 325px;
    max-width: 450px;
}
.el-input,
.el-select,
.el-textarea {
    width: calc(100% - 80px);
}

.smallInput {
    width: calc((100% - 108px) / 2) !important;
}
/deep/ .el-form-item__error {
    margin-top: -6px;
}
</style>
