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
                <el-form-item label="名称" label-width="100px">
                    <el-input v-model="data.name" class="normal-input" v-input-focus>
                    </el-input>
                </el-form-item>
                <el-form-item label="矢量点文件" label-width="100px">
                    <el-input v-model="data.vectorFile" class="normal-input" :disabled="true" v-input-focus>
                    </el-input>
                    <el-button type="primary" size="mini" class="mini-button" @click="handleFilePathClick('vectorFile')"><i class="el-icon-folder" style="margin-left: -5px"></i></el-button>
                    <input ref="vectorFile" style="display:none" name="fileVector" type="file" multiple="multiple" accept=".shp,.dbf" @change="selectFile('vectorFile')">
                </el-form-item>
                <el-form-item label="空间参考" label-width="100px">
                    <el-input v-model="data.spatialFile" class="normal-input" :disabled="true" v-input-focus>
                    </el-input>
                    <el-button type="primary" size="mini" class="mini-button" @click="handleFilePathClick('spatialFile')"><i class="el-icon-folder" style="margin-left: -5px"></i></el-button>
                    <input ref="spatialFile" style="display:none" name="fileSpatial" type="file" accept=".spatial" @change="selectFile('spatialFile')">
                </el-form-item>
                <el-form-item label="名称字段" label-width="100px">
                    <el-select v-model="data.weightField" class="normal-input">
                        <el-option v-for="(item,index) in data.fieldNameArr" :key="index" :label="item" :value="item"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="影响半径" label-width="100px">
                    <el-input v-model="data.radius" class="normal-input" v-input-focus>
                    </el-input>
                </el-form-item>
                 <!-- <el-form-item label="显示高度" label-width="100px">
                    <el-input v-model="data.altitude" class="normal-input" v-input-focus>
                    </el-input>
                    <el-button type="primary" size="mini" class="mini-button" @click="handleQueryAltitude()"><i class="el-icon-search" style="margin-left: -5px"></i></el-button>
                </el-form-item> -->
                <el-form-item label="颜色分段" label-width="100px">
                    <el-input v-model="data.colorNum" class="normal-input" v-input-focus>
                    </el-input>
                    <el-button type="primary" size="mini" class="mini-button" @click="handleColorNumClick()"><i class="el-icon-search" style="margin-left: -5px"></i></el-button>
                </el-form-item>
                <el-table
                    :data="data.colorArr"
                    max-height = "240"
                    border
                    >
                    <el-table-column
                        prop="weight"
                        label="权重"
                        min-width='50%'>
                    </el-table-column>
                    <el-table-column
                        prop="color"
                        label="颜色"
                        min-width='50%'>
                        <template slot-scope="scope">
                            <el-input v-model="scope.row.color" class="inner-input" style="width:100px;" v-input-focus></el-input>
                            <el-color-picker v-model="scope.row.color" class="inner-color-btn" style="left:115px;" size="mini"></el-color-picker>
                        </template>
                    </el-table-column>
                </el-table>
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
import $ from "jquery";
import markObj from "@/stamplib/Mark";

export default {
  name: 'showDialog',
  data() {
    this._elementManager = null;//对象管理
    this._callbackOK = null;
    this._callbackCancel = null;
    return {
        labelWidth: "100px",
        dialogVisible: false,
        dialogTitle: "",
        data: {}
    }
  },
  computed: {
  },
  watch: {
  },
  mounted() {
    //解决鼠标移出el-table表头鼠标样式丢失问题
    this.$nextTick(function(){
        var doms = document.querySelectorAll('th');
        doms.forEach(item =>{
            var cursorstyle = "";
            item.addEventListener("mouseenter",function(){
                cursorstyle = document.body.style.cursor;
            });
            item.addEventListener("mouseout",function(){
                document.body.style.cursor = cursorstyle;
            })
        })
    })
  },
  beforeDestroy() {
  },
  methods: {
    initFiles(){
        for(var item in this.$refs){
            this.$refs[item].value = "";
        }
    },
    show(options){
        this.initFiles();
        this.dialogTitle = options.title||"";
        this.data = options.data;
        this._elementManager = options.elementManager;
        this._callbackOK = options.callbackOK;
        this._callbackCancel = options.callbackCancel;
        this.dialogVisible = true;
    },
    handleFilePathClick(fieldName){
        this.$refs[fieldName].click();
    },
    selectFile(fieldName){
        var self = this;
        var fileInput = self.$refs[fieldName];
        if(!fileInput || fileInput.files.length <= 0){
            return;
        }
        if(self._elementManager && typeof self._elementManager.fileSelectFinished == "function"){//文件选择后事件，用于一些需要特殊处理的对象
            self._elementManager.fileSelectFinished(self, fieldName);
        }else{//一般情况
            var file = fileInput.files[0];
            localStorage.readFileToText(file, function(fileinfo){
                self.data[fieldName].value = file.name;
                self.data[fieldName].fileinfo = fileinfo;
            });
        }
    },
    randomColor16(){//十六进制颜色随机
        var r = Math.floor(Math.random()*256).toString(16).toUpperCase();
        var g = Math.floor(Math.random()*256).toString(16).toUpperCase();
        var b = Math.floor(Math.random()*256).toString(16).toUpperCase();
        var color = '#'+ (r.length == 1?("0"+r):r) + (g.length == 1?("0"+g):g) + (b.length == 1?("0"+b):b);
        return color;
    },
    handleColorNumClick(){
        var colorNum = this.data.colorNum;
        var colorArr = [];
        var colorIndex = parseFloat(1 / colorNum);
        for(var i = 1; i <= colorNum; i++){
            colorArr.push({
                weight: (colorIndex * i).toFixed(2),
                color: this.randomColor16()
            });
        }
        this.data.colorArr = colorArr;
    },
    // handleQueryAltitude(){
    //     var self = this;
    //     markObj.createPoint(self.stampAPI.usearth, function(result){
    //         if(result){
    //             var jwd = StampGis.Cartographic.fromCartesian(result.data);
    //             self.data.altitude = jwd.height.toFixed(2);
    //         }
    //     });
    // },
    handleClose(){
        this.dialogVisible = false;
        if(typeof this._callbackCancel == "function"){
            this._callbackCancel();
        }
    },
    validate(){
        if(this._elementManager && typeof this._elementManager.validate == "function"){
            var valInfo = this._elementManager.validate(this.data);
            if(!valInfo.bSuccess){//失败
                this.$message({
                    message: valInfo.message,
                    type: 'warning',
                    center: true
                });
            }
            return valInfo.bSuccess;
        }else{
            return true;
        }
    },
    clickOK: function(){
        if(this.validate() && typeof this._callbackOK == "function"){
            this.dialogVisible = false;
            this._callbackOK();
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

<style lang="less" scoped src="../../../style/importVector.less" ></style>
<style lang="less" scoped>
    /deep/ .el-dialog{
        width: 33.3%;
    }
    /deep/ .el-table{
        width: 90% !important;
        left: 5%;
        position:relative;
    }
</style>