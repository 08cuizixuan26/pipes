import { deepCopy, createGuid, transformPoint } from '@/utils'
import drawConfig from '../drawConfig'
import Mark from '@/stamplib/Mark'
import localStorage from '@/stamplib/LocalStorage'
import shapeManager from '@/utils/shapeManager'

export default {
    objType: "pointClouds",
    createElement: function(self, elmentArr, options){
        var earth = self.stampAPI.usearth;
        var obj = Mark.createElementPointClouds(earth, window.g_VideoLayer, options);
        if(obj){
            elmentArr.push(obj);
        }
    },
    create: function(self){
        var that = this;
        var earth = self.stampAPI.usearth;
        var dataConf = deepCopy(drawConfig[that.objType]);
        self.$refs.objectDialog.show({
            title: "添加点云",
            data: dataConf,
            elementManager: that,
            callbackOK: function(){
                var options = {};
                options.type = that.objType;
                options.guid = createGuid();
                options.visibility = true;
                //注意shp和dbf数据是直接解析了存库的，为了不用二次读取
                options["vectorFile_Key"] = dataConf["vectorFile"].fileinfo.name;
                options["spatialFile_Key"] = dataConf["spatialFile"].fileinfo.name;
                for(var item in dataConf){
                    options[item] = dataConf[item].value;
                }
                
                that.readShapePoints(self, dataConf["vectorFile"].fileinfo, options["vectorFile_Key"], dataConf["spatialFile"].fileinfo, options["spatialFile_Key"], function(points){
                    options.points = points;
                    that.createElementObj(self, options);
                });
            }
        });
    },
    /**
     * 创建标绘对象和导入SHP线时调用
     * @param {*} self 左侧面板组件
     * @param {*} options 节点信息
     * @param {*} lineObj 绘制时由于要先创建对象，获取长度等信息，对象是提前创建好了的，传进去即可
     * @param {*} parentInfo 导入时放到一个统一的节点里面
     */
    createElementObj: function(self, options, parentInfo){
        var earth = self.stampAPI.usearth;
        var obj = Mark.createElementPointClouds(earth, window.g_VideoLayer, options);
        if(obj){
            self.elementArr.push(obj);
            var parentItem = parentInfo?parentInfo:self.data[0];
            parentItem.children.push(options);
            self.checkData.push(options.guid);
            self.expandData.push(options.guid);
            localStorage.saveElementToDB(earth, self.drawType, self.data);
        }
    },
    edit: function(self, data){
        var that = this;
        var dataConf = deepCopy(drawConfig[that.objType]);
        for(var item in dataConf){
            dataConf[item].value = data[item];
        }
        self.$refs.objectDialog.show({
            title: "编辑点云",
            data: dataConf,
            elementManager: that,
            callbackOK: function(){
                var options = {};
                options.type = that.objType;
                options.guid = data.guid;//createGuid();
                options.visibility = data.visibility;
                options.points = data.points;
                options["vectorFile_Key"] = data["vectorFile_Key"];
                options["spatialFile_Key"] = data["spatialFile_Key"];
                for(var item in dataConf){
                    options[item] = dataConf[item].value;
                }
                
                that.readShapePoints(self, dataConf["vectorFile"].fileinfo, options["vectorFile_Key"], dataConf["spatialFile"].fileinfo, options["spatialFile_Key"], function(points, centerPoint){
                    var isCreate = false;
                    if(dataConf["vectorFile"].fileinfo || dataConf["spatialFile"].fileinfo){//有新文件，则需要读取
                        isCreate = true;
                        options.points = points;
                    }
                    that.editElementObj(self, options, isCreate);
                });
            }
        });
    },
    editElementObj: function(self, options, isCreate){//isCreate如果点串有变化，需要重新创建
        var earth = self.stampAPI.usearth;
        var selIndex = 0;
        for(var i = 0; i < self.elementArr.length; i++){
            if(self.elementArr[i].get_guid() == options.guid){
                selIndex = i;
                break;
            }
        }
        
        // var beforeGuid = options.guid;
        // if(isCreate){//如果是创建，则需要新建GUID
        //     options.guid = createGuid();
        // }
        //由于目前没有修改点串的接口，修改操作其实就是删掉了重新创建
        var obj = Mark.editElementPointClouds(earth, self.elementArr[selIndex], window.g_VideoLayer, options, isCreate);
        if(obj){//保存对象到全局
            self.elementArr[selIndex] = obj;
            
            for(var i = 0; i < self.data[0].children.length; i++){
                if(self.data[0].children[i].guid == options.guid){
                    for(var item in self.data[0].children[i]){
                        self.data[0].children[i][item] = options[item];
                    }
                    break;
                }
            }
        }
        localStorage.saveElementToDB(earth, self.drawType, self.data);
    },
    readShapePoints2(earth, shpFile, shpDataKey, callback){
        if(!shpFile){//只是字段不一样，文件未变化，直接取data
            localStorage.readFromDB(earth, shpDataKey, function(data){
                var retData = [];
                if(data){
                    retData = JSON.parse(data);
                }
                callback(retData);
            });
        }else{
            shapeManager.readShapeFile(shpFile, null, null, function(data){
                callback(data);
            });
        }
    },
    readShapePoints(self, fileinfo, shpDataKey, spatialFileInfo, spatialDataKey, callback){
        var that = this;
        if(!fileinfo && !spatialFileInfo){//文件和字段都相同时，不需要再去解析
            if(callback && typeof callback == "function"){
                callback();
            }
        }else{//有数据，说明是重新选择的数据，且权重字段发生变化时，需要重新解析
            var points = [];
            var earth = self.stampAPI.usearth;
            that.readShapePoints2(earth, fileinfo.data, shpDataKey, function(data){
                localStorage.saveToDB(earth, shpDataKey, JSON.stringify(data));//shp文件以解析后的字符串存放
                var spatialData = null;
                if(spatialFileInfo){
                    localStorage.saveToDB(earth, spatialFileInfo.name, spatialFileInfo.data);//图片以二进制存放
                    spatialData = spatialFileInfo.data;
                    getPoints(earth, data, spatialData);
                }else{
                    //读取spatialFile文件------注意这里是异步
                    localStorage.readFromDB(earth, spatialDataKey, function(sdata){
                        spatialData = sdata;
                        getPoints(earth, data, spatialData);
                    });
                }
                
                function getPoints(earth, data, spatialData){
                    points = [];
                    var option = {
                        array: spatialData
                    };
                    var datum = earth.Factory.CreateDatum(option);
                    //需要去解析spatialFileInfo中的空间参考文件
                    for(var i = 0; i < data.length; i++){
                        var coordinates = data[i].geometry.coordinates;
                        if(data[i].geometry.type == shapeManager.geometryType.Point){//单点的话，放到数组里面
                            coordinates = [coordinates];
                        }
                        //TODO:需要将coordinates[j][0]和coordinates[j][1]坐标转成经纬度坐标，然后继续下面的
                        for(var j = 0; j < coordinates.length; j++){
                            var coord = transformPoint(datum, coordinates[j][0], coordinates[j][1]);
                            var lon = coord.x;
                            var lat = coord.y;
                            var tempPoint = new StampGis.Cartographic(StampGis.StampMath.toRadians(lon), StampGis.StampMath.toRadians(lat), 0);
                            points.push(tempPoint);
                        }
                    }
                    
                    //批量获取高程
                    var promise = earth.document.get_batch_dem_height_from_server(points);
                    if (promise == undefined){
                        return;
                    }
                    StampGis.when(promise, function(){
                    }).then(function(){
                        var tmpPoints = [];
                        for(var i = 0; i < points.length; i++){
                            tmpPoints.push({
                                longitude: StampGis.StampMath.toDegrees(points[i].longitude),
                                latitude: StampGis.StampMath.toDegrees(points[i].latitude),
                                altitude: points[i].height + 10
                            });
                        }
                        if(callback && typeof callback == "function"){
                            callback(tmpPoints);
                        }
                    });
                }
            });
        }
    },
    fileSelectFinished: function(self, item){
        if(item.field == "vectorFile"){
            this.selectVectorFile(self, item);
        }else if(item.field == "spatialFile"){
            this.selectSpatialFile(self, item);
        }
    },
    selectSpatialFile: function(self, item){
        var fileInput = self.$refs[item.field][0];
        var file = fileInput.files[0];
        localStorage.readFileToArrayBuffer(file, function(fileinfo){
            for(var dataKey in self.data){
                if(self.data[dataKey].field == item.field){
                    self.data[dataKey].value = file.name;
                    self.data[dataKey].fileinfo = fileinfo;
                    break;
                }
            }
        });
    },
    //选择文件后，需要解析文件，然后
    selectVectorFile: function(self, item){
        var fileInput = self.$refs[item.field][0];
        var file = fileInput.files[0];
        shapeManager.readShapeType(file, function(type){
            if(type == shapeManager.geometryType.Point || type == shapeManager.geometryType.MultiPoint){
                self.data[item.field].value = file.name;
                self.data[item.field].fileinfo = {
                    data: file,
                    name: localStorage.getFileKey(file)
                };
            }else{
                self.$message({
                    message: '选择的shp文件不是点数据，请重新选择矢量点文件',
                    type: 'warning',
                    center: true
                });
                fileInput.value = "";
                self.data[item.field].value = "";
                self.data[item.field].fileinfo = null;
            }
        });
    },
    validate: function(data, self){
        if(!data["name"].value){
            self.$message({
                message: '请设置点云名称',
                type: 'warning',
                center: true
            });
            return false;
        }
        if(!data["vectorFile"].value){
            self.$message({
                message: '请选择矢量点SHP文件',
                type: 'warning',
                center: true
            });
            return false;
        }
        if(!data["spatialFile"].value){
            self.$message({
                message: '请选择空间参考文件',
                type: 'warning',
                center: true
            });
            return false;
        }
        return true;
    }
}