import { deepCopy, createGuid } from '@/utils'
import drawConfig from '../drawConfig'
import Mark from '@/stamplib/Mark'
import localStorage from '@/stamplib/LocalStorage'

export default {
    drawType: "element2D",
    createElement: function(self, elmentArr, options){//初始化调用
        var earth = self.stampAPI.usearth;
            //取图片
            localStorage.readFromDB(earth, options.picture_Key, function(pictureData){
                options["picture_Data"] = pictureData;
                var obj = Mark.createElementTexturePolygon(earth, options);
                if(obj){
                    elmentArr.push(obj);
                }
            });
    },
    create: function(self){
        var that = this;
        var earth = self.stampAPI.usearth;
        Mark.createPolygon(earth, function(retData){
            if(!retData || retData.length < 3){
                self.$message({
                    message: '请至少绘制三个点创建多边形',
                    type: 'warning',
                    center: true
                });
                return;
            }
            // var polygonObj = Mark.createElementPolygonByPoints(earth, retData);
            var dataConf = deepCopy(drawConfig["TexturePolygon"]);
            // dataConf["lineLength"].value = polygonObj.get_perimeter_3d().toFixed(2);
            // dataConf["polygonArea"].value = polygonObj.get_area_3d().toFixed(2);
            self.$refs.objectDialog.show({
                title: "添加纹理多边形",
                data: dataConf,
                elementManager: that,
                callbackOK: function(){
                    var options = {};
                    options.type = "texturePolygon";
                    options.guid = createGuid();
                    options.visibility = true;
                    options.points = retData;
                    for(var item in dataConf){
                        options[item] = dataConf[item].value;
                    }
                    if(dataConf["picture"].fileinfo){
                        options["picture_Key"] = dataConf["picture"].fileinfo.name;
                        options["picture_Data"] = dataConf["picture"].fileinfo.data;
                    }else{
                        self.$message({
                            message: '请选择图片',
                            type: 'warning',
                            center: true
                        });
                        return true;
                    }
                    that.createElementObj(self, options);
                }
            });
        });
    },
    /**
     * 创建标绘对象和导入SHP面时调用
     * @param {*} self 左侧面板组件
     * @param {*} options 节点信息
     * @param {*} polygonObj 绘制时由于要先创建对象，获取周长、面积等信息，对象是提前创建好了的，传进去即可
     * @param {*} parentInfo 导入时放到一个统一的节点里面
     */
    createElementObj: function(self, options, polygonObj, parentInfo){//导入时调用
        var earth = self.stampAPI.usearth;
        var obj = Mark.createElementTexturePolygon(earth, options);
        if(obj){
            self.elementArr.push(obj);
            //保存成功后，去存储图片文件到db
            localStorage.addToDB(earth, options["picture_Key"], options["picture_Data"]);
            delete options["picture_Data"];
            var parentItem = parentInfo?parentInfo:self.data[0];
            parentItem.children.push(options);
            self.checkData.push(options.guid);
            self.expandData.push(options.guid);
            localStorage.saveElementToDB(earth, self.drawType, self.data);
        }
    },
    edit: function(self, data){
        var that = this;
        var earth = self.stampAPI.usearth;
        var dataConf = deepCopy(drawConfig["TexturePolygon"]);
        for(var item in dataConf){
            dataConf[item].value = data[item];
        }
        self.$refs.objectDialog.show({
            title: "编辑纹理多边形",
            data: dataConf,
            elementManager: that,
            callbackOK: function(){
                var options = {};
                options.type = "texturePolygon";
                options.guid = data.guid;//createGuid();
                options.visibility = data.visibility;
                options.points = data.points;
                for(var item in dataConf){
                    options[item] = dataConf[item].value;
                }
                options["picture_Key"] = data["picture_Key"];
                if(dataConf["picture"].fileinfo){//编辑时有变化
                    options["picture_Key"] = dataConf["picture"].fileinfo.name;
                    options["picture_Data"] = dataConf["picture"].fileinfo.data;
                }
                var selIndex = 0;
                for(var i = 0; i < self.elementArr.length; i++){
                    if(self.elementArr[i].get_guid() == data.guid){
                        selIndex = i;
                        break;
                    }
                }
                // var obj = Mark.editElementTexturePolygon(self.elementArr[selIndex], options);
                // if(obj){//保存对象到全局
                //     self.elementArr[selIndex] = obj;
                    
                //     for(var i = 0; i < self.data[0].children.length; i++){
                //         if(self.data[0].children[i].guid == options.guid){
                //             // self.data[0].children[i] = deepCopy(options);
                //             for(var item in self.data[0].children[i]){
                //                 self.data[0].children[i][item] = options[item];
                //             }
                //             break;
                //         }
                //     }

                //     localStorage.saveElementToDB(earth, self.drawType, self.data);
                // }
                    function toEdit(){//读取高亮图片资源，然后去编辑
                        var obj = Mark.editElementTexturePolygon(self.elementArr[selIndex], options);
                        if(obj){//保存对象到全局
                            self.elementArr[selIndex] = obj;
                            for(var i = 0; i < self.data[0].children.length; i++){
                                if(self.data[0].children[i].guid == options.guid){
                                    // self.data[0].children[i] = deepCopy(options);
                                    for(var item in self.data[0].children[i]){
                                        self.data[0].children[i][item] = options[item];
                                        // self.data[0].children[i]["picture_Data"] = options["picture_Data"];
                                    }
                                    break;
                                }
                            }
                        }
                        localStorage.addToDB(earth, options["picture_Key"], options["picture_Data"]);
                        delete options["picture_Data"];
                        localStorage.saveElementToDB(earth, self.drawType, self.data);
                    }
                    if(!options["picture_Data"]){//高亮图标资源不存在时从db里面读取
                        //取图片
                        localStorage.readFromDB(earth, options.picture_Key, function(pictureData){
                            options["picture_Data"] = pictureData;
                            toEdit();
                        });
                    }else{//高亮图标资源存在，直接下一步
                        toEdit();
                    }
            }
        });
    },
    update(earth, guid, location, rotation, scale){
        var that = this;
        if(location || rotation || scale){
            localStorage.readFromDB(earth, that.drawType, function(jsonData){
                if(!jsonData){
                    return;
                }
                jsonData = JSON.parse(jsonData);
                var obj = getElementObj(jsonData[0].children, guid);
                if(obj){
                    if(location){
                        obj.location = location;
                    }
                    if(rotation){
                        obj.rotation = rotation;
                    }
                    if(scale){
                        obj.scale = scale;
                    }
                    localStorage.saveElementToDB(earth, that.drawType, jsonData);
                }
            });
        }
        function getElementObj(data, guid){
            for(var i = 0; i < data.length; i++){
                if(data[i].children){
                    var item = getElementObj(data[i].children, guid); 
                    if(item){
                        return item;
                    }
                }else if(data[i].guid == guid){
                    return data[i];
                }
            }
            return null;
        }
    },
    validate: function(data){
        return true;
    }
}