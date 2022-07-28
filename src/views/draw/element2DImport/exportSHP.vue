<template>
    <div>
        <popover :visible.sync="isPopoverShow" custom-class="popover-class">
            <div slot="title">导出SHP</div>
            <el-form class="content-class">
                <el-form-item label="类型：" label-width="85px">
                    <el-radio-group v-model="exportType"
                        @change="handleRadioChange">
                        <el-radio label="point">点</el-radio>
                        <el-radio label="line">线</el-radio>
                        <el-radio label="polygon">面</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="空间参考：" label-width="85px">
                    <el-input v-model="data.spatialFile" class="input-class" :disabled="true" v-input-focus>
                    </el-input>
                    <el-button type="primary" size="mini" class="mini-button" @click="handleSpatialFileClick()"><i class="el-icon-folder" style="margin-left: -5px"></i></el-button>
                    <input ref="spatialFile" style="display:none" name="fileSpatial" type="file" accept=".spatial" @change="selectSpatialFile()">
                </el-form-item>
                <el-form-item label="文件名：" label-width="85px">
                    <el-input v-model="exportName" size="small" v-input-focus class="input-class"></el-input>
                </el-form-item>
                <div class="btn-div">
                    <el-button type="primary" class="btn-class" @click="handleSelectObj">选择对象</el-button>
                    <el-button type="primary" class="btn-class" @click="handleExport">导出</el-button>
                </div>
            </el-form>
        </popover>
    </div>
</template>

<script>
import Popover from "../../../components/Popover/index";
import localStorage from '@/stamplib/LocalStorage'

export default {
    name: 'exportSHP',
    components: {Popover},
    data() {
        return {
            isPopoverShow: false,
            exportType: 'polygon',
            exportName: '',
            data: {
                spatialFile: ''
            }
        }
    },
    watch: {
        isPopoverShow(value) {
            if (value) {
                
            } else {
                this.stampAPI.usearth.ToolManager.ObjectEditTool.Browse();
            }
        }
    },
    methods: {
        show(options) {
            this.isPopoverShow = true;

            this.clearSpatialFile();
            this.data.spatialFile = '';
            this.exportType = 'polygon';
            this.exportName = '';
        },
        handleRadioChange(){
            this.stampAPI.usearth.ToolManager.ObjectEditTool.Browse();
        },
        handleSpatialFileClick(){
            this.$refs["spatialFile"].click();
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
                    self.data["spatialFile_info"] = fileinfo.data;
                }
            });
        },
        clearSpatialFile(){
            var self = this;
            var fileInput = self.$refs["spatialFile"];
            if(fileInput){
                fileInput.value = "";
            }
        },
        handleSelectObj(){
            var earth = this.stampAPI.usearth;
            var self = this;
            earth.ToolManager.ObjectEditTool.Select();
            earth.SelectSet.on_select_changed = function(){
                var count = earth.SelectSet.GetTotalCount();
                for(var i=0; i<count; i++){
                    var selectObj = earth.SelectSet.GetOverallObject(i);
                    if(selectObj){
                        if(self.exportType == 'polygon' && (selectObj._rtti == 211 || selectObj._rtti == 227)){

                        }else if(self.exportType == 'point' && selectObj._rtti == 209){

                        }else if(self.exportType == 'line' && selectObj._rtti == 220){

                        }else{
                            earth.SelectSet.Remove(selectObj._id);
                            i--;
                            count--;
                        }
                    }
                }
            }            
        },
        handleExport(){
            var earth = this.stampAPI.usearth;
            var count = earth.SelectSet.GetTotalCount();
            if(count === 0){
                this.$message({
                    message: '请选择导出对象',
                    type: 'warning'
                });
                return;
            }
            var _features = this.createFeatures();
            var shpwrite = (this.exportType == "line")?require('@gpcboekema/shp-write'):require('@aleffabricio/shp-write');
            var options = {
                folder: this.exportName?this.exportName:'shpfile',
                types: {
                    point: this.exportName?this.exportName:'mypoints',
                    polygon: this.exportName?this.exportName:'mypolygons',
                    polyline: this.exportName?this.exportName:'mylines'
                }
            };
            shpwrite.download({
                type: 'FeatureCollection',
                features: _features
            }, options);
            earth.ToolManager.ObjectEditTool.Browse();
        },
        createFeatures(){
            var features = [];
            var earth = this.stampAPI.usearth;
            var count = earth.SelectSet.GetTotalCount();
            for(var i = 0 ; i < count; i++){
                var selectObj = earth.SelectSet.GetOverallObject(i);
                var pointArr = selectObj.get_control_geometry_data && selectObj.get_control_geometry_data().get_coordinates_geo()[0];
                var _pro = {name:selectObj.name,id:selectObj._id};
                if(this.exportType == 'polygon'){
                    var _polygon = this.getPolygonCoord(pointArr);
                    features.push({
                        type: 'Feature',
                        geometry: {
                            type: 'Polygon',
                            coordinates: _polygon
                        },
                        properties: _pro
                    })
                } else if(this.exportType == 'line'){
                    var _line = this.getLineCoord(pointArr);
                    features.push({
                        type: 'Feature',
                        geometry: {
                            type: 'LineString',
                            coordinates: _line
                        },
                        properties: _pro
                    })
                } else if(this.exportType == 'point'){
                    var transform = selectObj.transform;
                    var _point = this.getPointCoord(transform);
                    features.push({
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: _point
                        },
                        properties: _pro
                    })
                }
            }
            return features;
        },
        getPolygonCoord(points){
            var polygon = [];
            var line = [];
            var self = this;
            var earth = self.stampAPI.usearth;
            var spatialData = self.data["spatialFile_info"];
            var option = {
                array: spatialData
            };
            var datum = earth.Factory.CreateDatum(option);
            for(var i = 0 ; i < points.length ; i++){
                var point = StampGis.Cartographic.fromCartesian(points[i]);
                var lon = StampGis.StampMath.toDegrees(point.longitude);
                var lat = StampGis.StampMath.toDegrees(point.latitude);
                var pt = datum.des_BLH_to_src_xy(lon, lat, 0);
                var pt1 = [];
                pt1.push(pt.x.toFixed(3));
                pt1.push(pt.y.toFixed(3));
                line.push(pt1);
            }
            polygon.push(line);
            return polygon;
        },
        getLineCoord(points){
            var line = [];
            var self = this;
            var earth = self.stampAPI.usearth;
            var spatialData = self.data["spatialFile_info"];
            var option = {
                array: spatialData
            };
            var datum = earth.Factory.CreateDatum(option);
            for(var i = 0 ; i < points.length ; i++){
                var point = StampGis.Cartographic.fromCartesian(points[i]);
                var lon = StampGis.StampMath.toDegrees(point.longitude);
                var lat = StampGis.StampMath.toDegrees(point.latitude);
                var pt = datum.des_BLH_to_src_xy(lon, lat, 0);
                var pt1 = [];
                pt1.push(pt.x.toFixed(3));
                pt1.push(pt.y.toFixed(3));
                line.push(pt1);
            }
            return line;
        },
        getPointCoord(transform){
            var self = this;
            var earth = self.stampAPI.usearth;
            var spatialData = self.data["spatialFile_info"];
            var option = {
                array: spatialData
            };
            var datum = earth.Factory.CreateDatum(option);
            var pt1 = [];
            var lon = StampGis.StampMath.toDegrees(transform.longitude);
            var lat = StampGis.StampMath.toDegrees(transform.latitude);
            var pt = datum.des_BLH_to_src_xy(lon, lat, 0);
            pt1.push(pt.x.toFixed(3));
            pt1.push(pt.y.toFixed(3));
            return pt1;
        }
    }
}
</script>

<style lang="less" scoped>
    
    /deep/ .el-dialog.popover-class {
        left:300px;
        top:200px;
        width:300px;
    }

    .content-class {
        text-align: left;
    }

    .el-radio {
        color: #fff;
    }

    .input-class {
        width: calc(100% - 38px)
    }

    .btn-div {
        text-align: center;
    }

    .btn-class {
        width: 80px;
    }
</style>