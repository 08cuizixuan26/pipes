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
                <el-form-item label="矢量点文件" label-width="100px">
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
                <!-- <el-form-item label="显示字段" label-width="100px">
                    <el-select v-model="data.fieldShow" class="normal-input">
                        <el-option v-for="item in data.fieldNameArr" :label="item" :value="item"></el-option>
                    </el-select>
                </el-form-item> -->
                <fieldset style="width:84%;position:relative;left:5%;color:#FFF;overflow:hidden;">
                    <legend>
                        <span>样式设置</span>
                    </legend>
                    <el-form-item label="文字比例" label-width="70px">
                        <el-input v-model="data.textScale" class="inputWidthAfter" v-input-focus>
                        </el-input>
                    </el-form-item>
                    <el-checkbox :disabled="styleSet==0" v-model="data.showHandle">显示指示线</el-checkbox>
                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="线颜色" label-width="70px">
                                <el-input :disabled="!data.showHandle" class="smallInputWidthAfter" v-model="data.handleLineColor" v-input-focus>
                                </el-input>
                                <el-color-picker :disabled="!data.showHandle" v-model="data.handleLineColor" size="mini"></el-color-picker>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="线长度" label-width="70px">
                                <el-input class="smallInputWidthAfter" :disabled="!data.showHandle" v-model="data.handleHeight" v-input-focus>
                                </el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-radio :disabled="styleSet==0" v-model="styleSet" label="1" style="color:#FFF;">统一样式设置</el-radio>
                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="文字颜色" label-width="70px">
                                <el-input :disabled="styleSet!=1" class="smallInputWidthAfter" v-model="data.textColor" v-input-focus>
                                </el-input>
                                <el-color-picker :disabled="styleSet!=1" v-model="data.textColor" size="mini"></el-color-picker>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="显示图标" label-width="70px">
                                <el-input :disabled="styleSet!=1" :readonly="true" class="smallInputWidthAfter" v-model="data.iconPath" v-input-focus>
                                </el-input>
                                <el-button :disabled="styleSet!=1" type="primary" size="mini" class="mini-button" @click="handleIconPathClick()"><i class="el-icon-folder" style="margin-left: -5px"></i></el-button>
                                <input ref="iconPath" style="display:none" name="fileIconPath" type="file" :accept="imgExt" @change="selectIconPathFile()">
                            </el-form-item>
                        </el-col>
                    </el-row>
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
                            min-width='30%'>
                        </el-table-column>
                        <el-table-column
                            prop="textColor"
                            label="文字颜色"
                            min-width='30%'>
                            <template slot-scope="scope">
                                <el-input :disabled="styleSet!=2" v-model="scope.row.textColor" class="inner-input" style="width:80px;" v-input-focus></el-input>
                                <el-color-picker :disabled="styleSet!=2" v-model="scope.row.textColor" class="inner-color-btn" style="left:95px;" size="mini"></el-color-picker>
                            </template>
                        </el-table-column>
                        <el-table-column
                            prop="iconPath"
                            label="显示图标"
                            min-width='40%'>
                            <template slot-scope="scope">
                                <el-input :disabled="styleSet!=2" :readonly="true" v-model="scope.row.iconPath" class="inner-input" style="width:120px;" v-input-focus></el-input>
                                <el-button :disabled="styleSet!=2" type="primary" size="mini" class="mini-button inner-color-btn" style="left:135px;" @click="handlePathFileClick(scope.row.fieldName, scope.$index)"><i class="el-icon-folder" style="margin-left: -5px"></i></el-button>
                                <input :ref="scope.row.fieldName" style="display:none" name="tableIconPath" type="file" :accept="imgExt" @change="selectTableIconPathFile(scope.row.fieldName, scope.$index)">
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
import { mapActions } from 'vuex'
import $ from 'jquery'
import localStorage from '@/stamplib/LocalStorage'

export default {
  name: 'importVectorPoint',
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
      imgExt(){
          return this.$store.state.imgExt;
      }
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
    handleVectorFileClick(){//选择矢量点文件
        this.$refs["vectorFile"].click();
    },
    handleSpatialFileClick(){//选择空间参考文件
        this.$refs["spatialFile"].click();
    },
    handleIconPathClick(){//选择显示图标图片
        this.$refs["iconPath"].click();
    },
    selectIconPathFile(){//选择显示图标图片
        var self = this;
        var files = self.$refs["iconPath"].files;
        if(files.length < 0){
            return;
        }
        var fileName = files[0].name;
        self.data.iconPath = fileName;
        localStorage.readFileToArrayBuffer(files[0], function(fileinfo){
            self.data.fileinfo = fileinfo;
        });
    },
    handlePathFileClick(fieldName, index){//选择显示图标图片-表格中
        this.$refs[fieldName].click();
    },
    selectTableIconPathFile(fieldName, index){//选择显示图标图片-表格中
        var self = this;
        var files = this.$refs[fieldName].files;
        if(files.length < 0){
            return;
        }
        var fileName = files[0].name;
        self.data.propertyColorData[index].iconPath = fileName;
        localStorage.readFileToText(files[0], function(fileinfo){
            self.data.propertyColorData[index].fileinfo = fileinfo;
        });
        // this.data.propertyColorData[index].iconPathFile = files[0];
    },
    clearVectorFile(){//清除矢量文件
        var self = this;
        var fileInput = self.$refs["vectorFile"];
        if(fileInput){
            fileInput.value = "";
        }
        self.data.vectorFile = "";
        self.data.fieldName = "";
        // self.data.fieldShow = "";
        self.data.fieldNameArr = [];
        self.data.propertyFieldName = "";
        self.data.propertyColorData = [];
        // self.$refs["iconPath"].value = "";
        for(var item in self.$refs){
            if(item == "spatialFile"){
                continue;
            }
            self.$refs[item].value = "";
        }
    },
    clearSpatialFile(){//清除空间参考
        var self = this;
        var fileInput = self.$refs["spatialFile"];
        if(fileInput){
            fileInput.value = "";
        }
    },
    selectVectorFile(){//选择矢量文件后解析
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
            if(feature.geometry.type == shapeManager.geometryType.Point || feature.geometry.type == shapeManager.geometryType.MultiPoint){
                self.data.vectorFile = self._shpDbf.shpFile.name + "," + self._shpDbf.dbfFile.name;
                var property = feature.properties;
                self.data.fieldNameArr = [];
                for(var key in property){
                    self.data.fieldNameArr.push(key);
                }
                self.data.propertyFieldName = self.data.fieldName = self.data.fieldNameArr[0];//= self.data.fieldShow 
                self.data.styleSet = self.styleSet = "1";
            }else{
                self.$message({
                    message: '选择的shp文件不是点数据，请重新选择矢量点文件',
                    type: 'warning',
                    center: true
                });
                self.clearVectorFile();
            }
        });
    },
    selectSpatialFile(){//选择空间参考文件
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
                        textColor: "#FFFF00",
                        iconPath: ""
                    });
                }
            }
        });
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
        var self = this;
        if(self.validate() && typeof self._callbackOK == "function"){
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
