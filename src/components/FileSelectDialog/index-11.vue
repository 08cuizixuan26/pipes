<template>
    <div class="fileDialogDiv">
        <el-dialog
            width="30%"
            :title="dialogTitle"
            :visible.sync="dialogShow"
            :before-close="handleSelectPathClose"
            :close-on-click-modal="false"
            append-to-body>
            <hr/>
            <el-container style="height:450px">
                <el-header style="height:35px">
                    <el-col :span="4">
                        <span style="color:white;line-height:32px">目录：</span>
                    </el-col>
                    <el-col :span="20">
                        <el-input v-model="reqPath" size="small" :disabled="true" v-input-focus></el-input>
                    </el-col>
                </el-header>
                <el-main>
                    <el-table
                        ref="singleTable"
                        :data="tableData"
                        height="315"
                        size="mini"
                        highlight-current-row
                        @row-dblclick="handleRowDblclick"
                        @row-click="handleRowclick"
                        style="width: 100%">
                        <el-table-column
                        property="name"
                        label="路径">
                            <template slot-scope="scope">
                                <div onselectstart='javascript:return false;' :class="(selRow&&scope.row.name==selRow.name)?'highlightColor':'normalColor'">{{scope.row.name}}</div>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-main>
                <el-footer style="text-align: center;margin-left: 0px !important;">
                    <el-col>
                        <el-button type="primary" size="mini" @click="handlePathConfirmClick"><span>确定</span></el-button>
                        <el-button type="primary" size="mini" @click="handlePathUpClick"><span>向上</span></el-button>
                    </el-col>
                </el-footer>
            </el-container>
        </el-dialog>
    </div>
</template>

<script>
    import { mapState, mapActions, mapGetters } from 'vuex'
    import { GetFilePath } from '@/api/stampManagerService'
    export default {
        name: 'FileSelectDialog',
        data() {
            this._isSelPath = false;
            this._fileExt = ".png,.jpg,.jpeg,.bmp,.gif";
            this._callbackOK = null;
            this._callbackCancel = null;
            return {
                reqPath: "/home/",
                selRow: null,
                tableData: [],
                dialogShow: false,
                dialogTitle: "选择文件"                
            }
        },
        computed: {
           
        },
        mounted() {
        },
        methods: {
            show(options){
                var self = this;
                self.dialogShow = true;
                self.dialogTitle = options.dialogTitle || self._dialogTitle;
                self._callbackOK = options.callbackOK;
                self._callbackCancel = options.callbackCancel;
                self._fileExt = options.fileExt;
                self._isSelPath = options.isSelPath || self._isSelPath;
                if(options.reqPath){
                    this.reqPath = options.reqPath;
                }
                self.getFilePathList(this.reqPath);
            },
            close(){
                var tempPath = this.reqPath + this.selRow.name;
                this.dialogShow = false;
                if(this._callbackOK && typeof this._callbackOK == "function"){
                    this._callbackOK(tempPath);
                }
            },
            getFilePathList(tempPath){
                var self = this;
                var temp1 = "batpath";
                if(self._fileExt && self._fileExt != ""){
                    temp1 = self._fileExt.replace(/\./g,'');
                }
                GetFilePath(tempPath,temp1).then(resp => {
                    var temp = resp.data;
                    var index1 = temp.indexOf("<xml>");
                    var index2 = temp.indexOf("</xml>");
                    var str = temp.substring(index1,index2+6);
                    self.selRow = null;
                    self.tableData = [];
                    var d = self.$x2js.xml2js(str);
                    self.reqPath = tempPath;
                    if(d && d.xml){ 
                        if(d.xml.folder){
                            var value = d.xml.folder;
                            Array.isArray(value) || (value = [value]);
                            for(var i=0;i<value.length;i++){
                                self.tableData.push({
                                    name:value[i],
                                    type:'path'
                                });
                            }
                        }
                        if(d.xml.file){
                            var files = d.xml.file;
                            Array.isArray(files) || (files = [files]);
                            for(var i=0; i<files.length;i++){
                                var fileExt = files[i].split(".");
                                fileExt = fileExt[fileExt.length - 1];
                                if(self._fileExt.toLowerCase().indexOf(fileExt.toLowerCase()) > -1){
                                    self.tableData.push({
                                        name:files[i],
                                        type:'file'
                                    });
                                }
                            }
                        }
                    }
                    
                }).catch(err => {
                    self.$message({
                        message: err,
                        type: 'warning',
                        center: true
                    });
                });
            },
            handleSelectPathClose(){
                this.dialogShow = false;
                if(typeof this.callbackCancel == "function"){
                    this.callbackCancel();
                }
            },
            handleRowDblclick(row, column, event){
                this.selRow = row;
                if(row.type == 'path'){
                    var tempPath = this.reqPath + row.name + '/';
                    this.getFilePathList(tempPath);
                }else{
                    this.close();
                }
            },
            handleRowclick(row, column, event){
                this.selRow = row;
            },
            handlePathConfirmClick(){
                if(this.selRow && ((!this._isSelPath && this.selRow.type == "file") || (this._isSelPath && this.selRow.type == "path"))){
                    this.close();
                }else{//没选中文件
                    if(this.selRow && !this._isSelPath && this.selRow.type == "path"){
                        var tempPath = this.reqPath + this.selRow.name + '/';
                        this.getFilePathList(tempPath);
                    }else{
                        if(this._isSelPath){
                            this.$message({
                                message: "请先选择文件夹",
                                type: 'warning',
                                center: true
                            });
                        }else{
                            this.$message({
                                message: "请先选择指定格式的文件",
                                type: 'warning',
                                center: true
                            });
                        }
                    }
                }
            },
            handlePathUpClick(){
                var self = this;
                if(self.reqPath == '/'){
                     self.$message({
                        message: "已到配置根目录",
                        type: 'warning',
                        center: true
                    });
                    return;
                }
                var tempPath = self.reqPath.substr(0, self.reqPath.length-1);
                var index = tempPath.lastIndexOf('/');
                tempPath = self.reqPath.substr(0,index+1);

                self.getFilePathList(tempPath);
            },
            ...mapActions([])
        }

    }
</script>

<style lang="less" scoped>
    /deep/ .el-table td, .el-table th{
        padding: 0px !important;
    }
    .highlightColor{
        background-color: rgba(24,144,255,0.6);
        width:100%;
        height:100%;
        color: white;
        height: 30px;
        line-height: 30px;
        -moz-user-select:-moz-none;
    }
    .normalColor{
        width:100%;
        height:100%;
        color: black;
        height: 30px;
        line-height: 30px;
        -moz-user-select:-moz-none;
    }
</style>
