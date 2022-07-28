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
                <el-form-item label="矢量面文件" label-width="100px">
                    <el-input v-model="data.vectorFile" class="normal-input" :disabled="true" v-input-focus>
                    </el-input>
                    <el-button type="primary" size="mini" class="mini-button" @click="handleVectorFileClick()"><i class="el-icon-folder" style="margin-left: -5px"></i></el-button>
                    <input ref="vectorFile" style="display:none" name="fileVector" type="file" multiple="multiple" accept=".shp,.dbf" @change="selectVectorFile()">
                </el-form-item>
                <el-form-item label="空间参考" label-width="100px">
                    <el-input v-model="data.spatialFile" class="normal-input" :disabled="true" v-input-focus>
                    </el-input>
                    <el-button type="primary" size="mini" class="mini-button" @click="handleSpatialFileClick()"><i class="el-icon-folder" style="margin-left: -5px"></i></el-button>
                    <input ref="spatialFile" style="display:none" name="fileSpatial" type="file" accept=".spatial" @change="selectSpatialFile()">
                </el-form-item>
                <el-form-item label="名称字段" label-width="100px">
                    <el-select v-model="data.fieldName" class="normal-input">
                        <el-option v-for="(item,index) in data.fieldNameArr" :key="index" :label="item" :value="item"></el-option>
                    </el-select>
                </el-form-item>
                <fieldset style="width:84%;position:relative;left:5%;color:#FFF;">
                    <legend>
                        <span>边线样式设置</span>
                    </legend>
                    <el-form-item @keyup.native="isNumber('lineTransparent', true, 0, 255)" label="透明度" label-width="70px">
                        <el-input v-model="data.lineTransparent" class="inputWidthAfter" v-input-focus>
                        </el-input>
                        <label class="after-label">（0~255,透明至不透明）</label>
                    </el-form-item>
                    <el-row>
                        <el-col :span="12">
                            <el-form-item @keyup.native="isNumber('lineWidth', true, 0)" label="线宽" label-width="70px">
                                <el-input style="width:100%;" v-model="data.lineWidth" v-input-focus>
                                </el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="线颜色" label-width="70px">
                                <el-input class="smallInputWidthAfter" v-model="data.lineColor" v-input-focus>
                                </el-input>
                                <el-color-picker v-model="data.lineColor" size="mini"></el-color-picker>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </fieldset>
                <fieldset style="width:84%;position:relative;left:5%;color:#FFF;overflow:hidden;">
                    <legend>
                        <span>样式设置</span>
                    </legend>
                    <el-form-item @keyup.native="isNumber('fillTransparent', true, 0, 255)" label="透明度" label-width="70px">
                        <el-input class="inputWidthAfter" v-model="data.fillTransparent" v-input-focus>
                        </el-input>
                        <label class="after-label">（0~255,透明至不透明）</label>
                    </el-form-item>
                    <el-radio :disabled="styleSet==0" v-model="styleSet" label="1" style="color:#FFF;">统一样式设置</el-radio>
                    <el-form-item label="填充色" label-width="70px">
                        <el-input :disabled="styleSet!=1" class="inputWidthAfter" v-model="data.fillColor" v-input-focus>
                        </el-input>
                        <el-color-picker :disabled="styleSet!=1" v-model="data.fillColor" size="mini"></el-color-picker>
                    </el-form-item>
                    <el-radio :disabled="styleSet==0" v-model="styleSet" label="2" style="color:#FFF;">按属性设置</el-radio>
                    <div style="height:34px; margin: 10px auto;">
                        <label style="width:70px;height:34px;line-height:34px;float:left;">属性字段</label>
                        <el-select :disabled="styleSet!=2" v-model="data.propertyFieldName" style="float:left;" class="property-select">
                            <el-option v-for="(item,index) in data.fieldNameArr" :key="index" :label="item" :value="item"></el-option>
                        </el-select>
                        <el-button :disabled="styleSet!=2" style="float:left;" type="primary" size="mini" class="mini-button" @click="handleQueryClick()"><i class="el-icon-search" style="margin-left: -5px"></i></el-button>
                    </div>
                    <el-table
                        :data="data.propertyColorData"
                        max-height = "150"
                        border
                        >
                        <el-table-column
                            prop="fieldName"
                            label="属性值"
                            :show-overflow-tooltip="true"
                            min-width='60%'>
                        </el-table-column>
                        <el-table-column
                            prop="colorValue"
                            label="填充色"
                            min-width='40%'>
                            <template slot-scope="scope">
                                <el-input :disabled="styleSet!=2" v-model="scope.row.colorValue" class="inner-input" style="width:100px;" v-input-focus></el-input>
                                <el-color-picker :disabled="styleSet!=2" v-model="scope.row.colorValue" class="inner-color-btn" style="left:115px;" size="mini"></el-color-picker>
                            </template>
                        </el-table-column>
                    </el-table>
                </fieldset>
            </el-form>
            
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="clickOK">确 定</el-button>
                <el-button @click="clickCancel">取 消</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { checkNum } from '@/utils'
import shapeManager from '@/utils/shapeManager'
import localStorage from '@/stamplib/LocalStorage'
import { mapActions } from 'vuex'
import $ from 'jquery'

export default {
  name: 'importVectorPolygon',
  data() {
    this._elementManager = null;//对象管理
    this._threeMenuPanel = null;
    this._callbackOK = null;
    this._callbackCancel = null;
    this._shpDbf = {};
    return {
        styleSet: "0",
        dialogVisible: false,
        dialogTitle: "",
        data: {}
    }
  },
  computed: {
  },
  watch: {
      styleSet(){
          this.data.styleSet = this.styleSet;
      }
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
    isNumber(thisField, isPositive, decimalNum, maxValue){
        var self = this;
        checkNum(self.data[thisField], isPositive, decimalNum, maxValue, function(thisValue){
            self.data[thisField] = thisValue;
        });
    },
    show(options){
        this.dialogTitle = options.title||"";
        this.data = options.data;
        this._elementManager = options.elementManager;
        this._threeMenuPanel = options.threeMenuPanel;
        this._callbackOK = options.callbackOK;
        this._callbackCancel = options.callbackCancel;
        this.dialogVisible = true;
        this.clearVectorFile();
        this.clearSpatialFile();
    },
    handleVectorFileClick(){
        this.$refs["vectorFile"].click();
    },
    handleSpatialFileClick(){
        this.$refs["spatialFile"].click();
    },
    clearVectorFile(){
        var self = this;
        var fileInput = self.$refs["vectorFile"];
        if(fileInput){
            fileInput.value = "";
        }
        self.data.vectorFile = "";
        self.data.fieldName = "";
        self.data.fieldNameArr = [];
        self.data.propertyFieldName = "";
        self.data.propertyColorData = [];
    },
    clearSpatialFile(){
        var self = this;
        var fileInput = self.$refs["spatialFile"];
        if(fileInput){
            fileInput.value = "";
        }
    },
    selectVectorFile(){
        var self = this;
        var fileInput = self.$refs["vectorFile"];
        if(!fileInput || fileInput.files.length <= 0){
            self.clearVectorFile();
            return;
        }
        var files = fileInput.files;
        self._shpDbf = shapeManager.checkShpDbf(files);
        if(self._shpDbf == null){//选择文件不符合规范
            self.$message({
                message: '请选择且仅选择一组对应的shp文件和dbf文件',
                type: 'warning',
                center: true
            });
            self.clearVectorFile();
            return;
        }
        shapeManager.readShapeInfo(self._shpDbf.shpFile, self._shpDbf.dbfFile, null, function(feature){
            if(feature.geometry.type == shapeManager.geometryType.Polygon || feature.geometry.type == shapeManager.geometryType.MultiPolygon){
                self.data.vectorFile = self._shpDbf.shpFile.name + "," + self._shpDbf.dbfFile.name;
                var property = feature.properties;
                self.data.fieldNameArr = [];
                for(var key in property){
                    self.data.fieldNameArr.push(key);
                }
                self.data.propertyFieldName = self.data.fieldNameArr[0];
                self.data.fieldName = self.data.fieldNameArr[0];
                self.data.styleSet = self.styleSet = "1";
            }else{
                self.$message({
                    message: '选择的shp文件不是面数据，请重新选择矢量面文件',
                    type: 'warning',
                    center: true
                });
                self.clearVectorFile();
            }
        });
    },
    selectSpatialFile(){
        var self = this;
        var fileInput = self.$refs["spatialFile"];
        if(!fileInput || fileInput.files.length <= 0){
            return;
        }
        var file = fileInput.files[0];
        self.data.spatialFile = file.name;
        localStorage.readFileToArrayBuffer(file, function(fileinfo){
            if(fileinfo){
                self.data["spatialFile_info"] = fileinfo;
            }
        });
    },
    selectChange(item){
        
    },
    handleClose(){
        this.dialogVisible = false;
        if(typeof this._callbackCancel == "function"){
            this._callbackCancel();
        }
    },
    handleQueryClick(){
        var self = this;
        if(!self.data.propertyFieldName){
            return;
        }
        self.data.propertyColorData = [];
        var fieldName = self.data.propertyFieldName;
        var tempArr = [];
        shapeManager.readShapeFile(null, self._shpDbf.dbfFile, null, function(data){
            for(var i = 0; i < data.length; i++){
                var fieldValue = data[i][fieldName];
                if($.inArray(fieldValue, tempArr) == -1){
                    tempArr.push(fieldValue);
                    self.data.propertyColorData.push({
                        fieldName: fieldValue,
                        colorValue: "#FFFF00"
                    });
                }
            }
        });
    },
    validate(){
        // var self = this;
//         self.$refs["formModel"].validate(function (valid) {
//                     if (valid) {
//                         this.$message({
//                             message: "表单验证失败，请检查必填项和输入项格式是否正确",
//                             type: 'warning',
//                             center: true
//                         });
//                         return true;
//                     } else {
//                         return false;
//                     }
//                 });
        // return true;
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
        var self = this;
        if(this.validate() && typeof self._callbackOK == "function"){
            shapeManager.readShapeFile(self._shpDbf.shpFile, self._shpDbf.dbfFile, null, function(data){
                self._callbackOK(data, self._threeMenuPanel, self._shpDbf.shpFile.name);
            });
            self.dialogVisible = false;
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