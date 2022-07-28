import { deepCopy, createGuid, transformPoint } from '@/utils'
import Mark from '@/stamplib/Mark'
import localStorage from '@/stamplib/LocalStorage'
import shapeManager from '@/utils/shapeManager'

export default {
    objType: "heatmap",
    shpDbf: null,
    spatialFile: null,
    heatmapData: {},
    weightField: "",//临时存储
    createElement: function(self, elmentArr, options){
        var earth = self.stampAPI.usearth;
        var obj = Mark.createElementHeatmap(earth, window.g_VideoLayer, options);
        if(obj){
            elmentArr.push(obj);
        }
    },
    initData: function(){
        this.shpDbf = null;
        this.spatialFile = null;
        this.weightField = "";
        this.heatmapData = {
            name: "heatmap",
            vectorFile: "",
            spatialFile: "",
            weightField: "",
            fieldNameArr: [],
            radius: 20,
            altitude: 50,
            colorNum: 4,
            colorArr: [{
                weight: 0.25,
                color: "#0000FF" 
            },{
                weight: 0.5,
                color: "#00FF00" 
            },{
                weight: 0.75,
                color: "#FFFF00" 
            },{
                weight: 1,
                color: "#FF0000" 
            }]
        }
    },
    create: function(self){
        var that = this;
        that.initData();
        that.weightField = "";
        var earth = self.stampAPI.usearth;
        self.$refs.heatmapIndex.show({
            title: "添加热力图",
            data: that.heatmapData,
            elementManager: that,
            callbackOK: function(){
                var options = {};
                options.type = that.objType;
                options.guid = createGuid();
                options.visibility = true;
                //注意shp和dbf数据是直接解析了存库的，为了不用二次读取
                if(that.shpDbf){//保存文件存DB的key
                    options["vectorFile_Key"] = localStorage.getFileKey(that.shpDbf.shpFile);
                }
                options["spatialFile_Key"] = that.spatialFile.name;
                for(var item in that.heatmapData){
                    options[item] = that.heatmapData[item];
                }
                
                var weightField = options["weightField"];
                that.readShapePoints(self, that.shpDbf, options["vectorFile_Key"], that.spatialFile, options["spatialFile_Key"], weightField, function(points){
                    if(points){
                        options.points = points;
                    }
                    that.weightField = weightField;
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
        var obj = Mark.createElementHeatmap(earth, window.g_VideoLayer, options);
        if(obj){
            self.elementArr.push(obj);
            var parentItem = parentInfo?parentInfo:self.data[0];
            parentItem.children.push(options);
            self.checkData.push(options.guid);
            localStorage.saveElementToDB(earth, self.drawType, self.data);
        }
    },
    edit: function(self, data){
        var that = this;
        that.initData();
        // var earth = self.stampAPI.usearth;
        var dataConf = deepCopy(data);
        that.weightField = data["weightField"];
        self.$refs.heatmapIndex.show({
            title: "编辑热力图",
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
                    options[item] = dataConf[item];
                }
                var weightField = options["weightField"];
                that.readShapePoints(self, that.shpDbf, options["vectorFile_Key"], that.spatialFile, options["spatialFile_Key"], weightField, function(points){
                    var isCreate = true;
                    if(points){
                        options.points = points;
                    }
                    that.weightField = weightField;
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
        
        //由于目前没有修改点串的接口，修改操作其实就是删掉了重新创建
        var obj = Mark.editElementHeatmap(earth, self.elementArr[selIndex], window.g_VideoLayer, options, isCreate);
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
    readShapePoints2(earth, shpDbf, shpData, callback){
        if(!shpDbf){//只是字段不一样，文件未变化，直接取data
            localStorage.readFromDB(earth, shpData, function(data){
                var retData = [];
                if(data){
                    retData = JSON.parse(data);
                }
                callback(retData);
            });
        }else{
            shapeManager.readShapeFile(shpDbf.shpFile, shpDbf.dbfFile, null, function(data){
                callback(data);
            });
        }
    },
    readShapePoints(self, shpDbf, shpDataKey, spatialFileInfo, spatialDataKey, weightField, callback){
        var that = this;
        if(!shpDbf && !spatialFileInfo && that.weightField == weightField){//文件和字段都相同时，不需要再去解析
            if(callback && typeof callback == "function"){
                callback();
            }
        }else{//shpDbf有数据，说明是重新选择的数据，且权重字段发生变化时，需要重新解析
            var points = [];
            var earth = self.stampAPI.usearth;
            that.readShapePoints2(earth, shpDbf, shpDataKey, function(data){
                localStorage.saveToDB(earth, shpDataKey, JSON.stringify(data));

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
                    var tmpPoints = [];
                    var option = {
                        array: spatialData
                    };
                    var datum = earth.Factory.CreateDatum(option);
                    for(var i = 0; i < data.length; i++){
                        var coordinates = data[i].geometry.coordinates;
                        var property = data[i].properties;
                        var weightValue = property[weightField];
                        if(!weightValue){
                            weightValue = 0;
                        }else if(isNaN(weightValue)){
                            self.$message({
                                message: '选择的权重字段必须为数字',
                                type: 'warning',
                                center: true
                            });
                            return;
                        }else{
                            weightValue = Math.floor(parseFloat(weightValue));
                        }
                        if(data[i].geometry.type == shapeManager.geometryType.Point){//单点的话，放到数组里面
                            coordinates = [coordinates];
                        }
                        for(var j = 0; j < coordinates.length; j++){
                            var coord = transformPoint(datum, coordinates[j][0], coordinates[j][1]);
                            points.push({
                                longitude: coord.x,
                                latitude:  coord.y,
                                weight: weightValue
                            });
                            var tempPoint = new StampGis.Cartographic(StampGis.StampMath.toRadians(coord.x), StampGis.StampMath.toRadians(coord.y), 0);
                            tmpPoints.push(tempPoint);
                        }
                    }

                    var promise = earth.document.get_batch_dem_height_from_server(tmpPoints);
                    if (promise == undefined){
                        return;
                    }
                    StampGis.when(promise, function(){
                    }).then(function(){
                        self.data.altitude = 0;
                        for(var i = 0; i < tmpPoints.length; i++){
                            self.data.altitude = self.data.altitude==0?tmpPoints[i].height:Math.max(self.data.altitude, tmpPoints[i].height);
                        }
                        self.data.altitude += 10;
                        if(callback && typeof callback == "function"){
                            callback(points);
                        }
                    });
                }
            });
        }
    },
    //选择文件后，需要解析文件，然后
    fileSelectFinished: function(self, item){
        if(item == "vectorFile"){
            this.selectVectorFile(self, item);
        }else if(item == "spatialFile"){
            this.selectSpatialFile(self, item);
        }
    },
    selectSpatialFile: function(self, item){
        var that = this;
        var fileInput = self.$refs[item];
        var file = fileInput.files[0];
        localStorage.readFileToArrayBuffer(file, function(fileinfo){
            self.data[item] = file.name;
            that.spatialFile = fileinfo;
        });
    },
    //选择文件后，需要解析文件，然后
    selectVectorFile: function(self, item){
        var that = this;
        var fileInput = self.$refs[item];
        var _shpDbf = shapeManager.checkShpDbf(fileInput.files);
        if(_shpDbf == null){//选择文件不符合规范
            self.$message({
                message: '请同时选择一组对应的shp文件和dbf文件',
                type: 'warning',
                center: true
            });
            fileInput.value = "";
            self.data[item] = "";
            that.shpDbf = null;
            self.data["weightField"] = "";
            self.data["fieldNameArr"] = [];
        }else{
            shapeManager.readShapeInfo(_shpDbf.shpFile, _shpDbf.dbfFile, null, function(feature){
                if(feature.geometry.type == shapeManager.geometryType.Point || feature.geometry.type == shapeManager.geometryType.MultiPoint){
                    self.data[item] = _shpDbf.shpFile.name + "," + _shpDbf.dbfFile.name;
                    that.shpDbf = _shpDbf;
                    var property = feature.properties;
                    self.data["fieldNameArr"] = [];
                    for(var key in property){
                        self.data["fieldNameArr"].push(key);
                    }
                    self.data["weightField"] = self.data["fieldNameArr"][0];
                }else{
                    self.$message({
                        message: '选择的shp文件不是点数据，请重新选择矢量点文件',
                        type: 'warning',
                        center: true
                    });
                    fileInput.value = "";
                    self.data[item] = "";
                    that.shpDbf = null;
                    self.data["weightField"] = "";
                    self.data["fieldNameArr"] = [];
                }
            });
        }
    },
    validate: function(data){
        var retMsg = {
            bSuccess: true,
            message: ""
        }
        if(!data.name){
            retMsg.bSuccess = false;
            retMsg.message = "请设置热力图名称";
            return retMsg;
        }
        if(!data.vectorFile){
            retMsg.bSuccess = false;
            retMsg.message = "请选择矢量点文件";
            return retMsg;
        }
        if(!data.spatialFile){
            retMsg.bSuccess = false;
            retMsg.message = "请选择空间参考文件";
            return retMsg;
        }
        if(!data.weightField){
            retMsg.bSuccess = false;
            retMsg.message = "请选择权值字段";
            return retMsg;
        }
        if(!data.radius){
            retMsg.bSuccess = false;
            retMsg.message = "请设置影响半径";
            return retMsg;
        }
        // if(!data.altitude){
        //     retMsg.bSuccess = false;
        //     retMsg.message = "请设置显示高度";
        //     return retMsg;
        // }
        if(data.colorArr && data.colorArr.length > 0){
            for(var i= 0; i < data.colorArr.length; i++){
                if(!data.colorArr[i].color){
                    retMsg.bSuccess = false;
                    retMsg.message = "请设置权值和颜色";
                    return retMsg;
                }
            }
        }else{
            retMsg.bSuccess = false;
            retMsg.message = "请设置权值和颜色";
            return retMsg;
        }
        return retMsg;
    }
}