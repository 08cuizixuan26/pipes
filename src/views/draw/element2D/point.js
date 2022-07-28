import { deepCopy, createGuid } from '@/utils'
import drawConfig from '../drawConfig'
import Mark from '@/stamplib/Mark'
import localStorage from '@/stamplib/LocalStorage'

export default {
    createElement: function(self, elmentArr, options){
        var earth = self.stampAPI.usearth;
        //取图片
        localStorage.readFromDB(earth, options.iconPath_Key, function(iconPathData){
            options["iconPath_Data"] = iconPathData;
            //取图片
            localStorage.readFromDB(earth, options.highlightIconPath_Key, function(highlightIconPathData){
                options["highlightIconPath_Data"] = highlightIconPathData;
                var obj = Mark.createElementPoint(earth, options);
                if(obj){
                    elmentArr.push(obj);
                }
            });
        });
    },
    create: function(self){
        var that = this;
        var earth = self.stampAPI.usearth;
        Mark.createPoint(earth, function(retData){
            if(!retData){
                self.$message({
                    message: '请至少选择一个点创建标注点',
                    type: 'warning',
                    center: true
                });
                return;
            }
            var dataConf = deepCopy(drawConfig["createpoint"]);
            self.$refs.objectDialog.show({
                title: "添加符号标注",
                data: dataConf,
                elementManager: that,
                callbackOK: function(){
                    var options = {};
                    options.type = "createpoint";
                    options.guid = createGuid();
                    options.visibility = true;
                    options.points = retData;
                    for(var item in dataConf){
                        if(item == "visibleRange"){
                            options[item] = dataConf[item].minValue + "," + dataConf[item].maxValue;
                        }else{
                            options[item] = dataConf[item].value;
                        }
                    }
                    if(dataConf["iconPath"].fileinfo){
                        options["iconPath_Key"] = dataConf["iconPath"].fileinfo.name;
                        options["iconPath_Data"] = dataConf["iconPath"].fileinfo.data;
                    }
                    if(dataConf["highlightIconPath"].fileinfo){
                        options["highlightIconPath_Key"] = dataConf["highlightIconPath"].fileinfo.name;
                        options["highlightIconPath_Data"] = dataConf["highlightIconPath"].fileinfo.data;
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
     * @param {*} parentInfo 导入时放到一个统一的节点里面
     */
    createElementObj: function(self, options, parentInfo){
        var earth = self.stampAPI.usearth;
        var obj = Mark.createElementPoint(earth, options);
        if(obj){
            self.elementArr.push(obj);
            //保存成功后，去存储图片文件到db
            localStorage.addToDB(earth, options["iconPath_Key"], options["iconPath_Data"]);
            delete options["iconPath_Data"];

            localStorage.addToDB(earth, options["highlightIconPath_Key"], options["highlightIconPath_Data"]);
            delete options["highlightIconPath_Data"];
            
            var parentItem = parentInfo?parentInfo:self.data[0];
            parentItem.children.push(options);
            self.checkData.push(options.guid);
            self.expandData.push(options.guid);
            localStorage.saveElementToDB(earth, self.drawType, self.data);
        }
    },
    edit: function(self, data){
        var earth = self.stampAPI.usearth;
        var that = this;
        var dataConf = deepCopy(drawConfig["createpoint"]);
        for(var item in dataConf){
            dataConf[item].value = data[item];
            that.selChangeEvent(dataConf, dataConf[item]);
        }
        self.$refs.objectDialog.show({
            title: "编辑符号标注",
            data: dataConf,
            elementManager: that,
            callbackOK: function(){
                var options = {};
                options.type = "createpoint";
                options.guid = data.guid;//createGuid();
                options.visibility = data.visibility;
                options.points = data.points;
                for(var item in dataConf){
                    if(item == "visibleRange"){
                        options[item] = dataConf[item].minValue + "," + dataConf[item].maxValue;
                    }else{
                        options[item] = dataConf[item].value;
                    }
                }
                options["iconPath_Key"] = data["iconPath_Key"];
                options["highlightIconPath_Key"] = data["highlightIconPath_Key"];
                if(dataConf["iconPath"].fileinfo){//编辑时有变化
                    options["iconPath_Key"] = dataConf["iconPath"].fileinfo.name;
                    options["iconPath_Data"] = dataConf["iconPath"].fileinfo.data;
                }
                if(dataConf["highlightIconPath"].fileinfo){//编辑时有变化
                    options["highlightIconPath_Key"] = dataConf["highlightIconPath"].fileinfo.name;
                    options["highlightIconPath_Data"] = dataConf["highlightIconPath"].fileinfo.data;
                }
                
                var selIndex = 0;
                for(var i = 0; i < self.elementArr.length; i++){
                    if(self.elementArr[i].get_guid() == data.guid){
                        selIndex = i;
                        break;
                    }
                }
                function toEdit(){//读取图片资源，然后去编辑
                    function toEdit2(){//读取高亮图片资源，然后去编辑
                        var obj = Mark.editElementPoint(self.elementArr[selIndex], options);
                        if(obj){//保存对象到全局
                            self.elementArr[selIndex] = obj;
                            for(var i = 0; i < self.data[0].children.length; i++){
                                if(self.data[0].children[i].children){//有子节点
                                    var nodeData = self.data[0].children[i].children;
                                    for(var j = 0; j < nodeData.length; j++){
                                        if(nodeData[j].guid == options.guid){
                                            for(var item in nodeData[j]){
                                                nodeData[j][item] = options[item];
                                            }
                                            break;
                                        }
                                    }
                                }else if(self.data[0].children[i].guid == options.guid){//无子节点
                                    // self.data[0].children[i] = deepCopy(options);
                                    for(var item in self.data[0].children[i]){
                                        self.data[0].children[i][item] = options[item];
                                    }
                                    break;
                                }
                            }
                        }
                        localStorage.addToDB(earth, options["iconPath_Key"], options["iconPath_Data"]);
                        delete options["iconPath_Data"];

                        localStorage.addToDB(earth, options["highlightIconPath_Key"], options["highlightIconPath_Data"]);
                        delete options["highlightIconPath_Data"];
                        localStorage.saveElementToDB(earth, self.drawType, self.data);
                    }
                    if(!options["highlightIconPath_Data"]){//高亮图标资源不存在时从db里面读取
                        //取图片
                        localStorage.readFromDB(earth, options.highlightIconPath_Key, function(highlightIconPathData){
                            options["highlightIconPath_Data"] = highlightIconPathData;
                            toEdit2();
                        });
                    }else{//高亮图标资源存在，直接下一步
                        toEdit2();
                    }
                }

                if(!options["iconPath_Data"]){//图标资源不存在时从db里面读取
                    //取图片
                    localStorage.readFromDB(earth, options.iconPath_Key, function(iconPathData){
                        options["iconPath_Data"] = iconPathData;
                        toEdit();
                    });
                }else{//图标资源存在，直接下一步
                    toEdit();
                }
                
            }
        });
    },
    // /**
    //  * 删除图标调用，需要去删除对应的图片资源
    //  * @param {*} self 
    //  * @param {*} data 
    //  */
    // delete(self, data){
    //     var that = this;
    //     if(!data){
    //         return;
    //     }
    //     if(data.children && data.children.length > 0){
    //         for(var i = 0; i < data.children.length; i++){
    //             var item = data.children[i];
    //             that.delete(self, item);
    //         }
    //     }else{
    //         var bHasIconArr = that.hasSameIcon(self.g_ElementData["element2D"].elementJson[0], data);
    //         if(!bHasIconArr.bIconPath){//不存在其他对象引用该KEY时才去删除资源
    //             localStorage.deleteFromDB(self.stampAPI.usearth, data["iconPath_Key"]);
    //         }
    //         if(!bHasIconArr.bHighlightIconPath){//不存在其他对象引用该KEY时才去删除资源
    //             localStorage.deleteFromDB(self.stampAPI.usearth, data["highlightIconPath_Key"]);
    //         }
    //     }
    // },
    // hasSameIcon(data, item){
    //     var that = this;
    //     if(data){
    //         return true;
    //     }
    //     var bReturn = {
    //         bIconPath: false,
    //         bHighlightIconPath: false
    //     };
    //     if(data.children && data.children.length > 0){
    //         for(var i = 0; i < data.children.length; i++){
    //             var dItem = data.children[i];
    //             bReturn = that.hasSameIcon(dItem, item);
    //             if(bReturn.bIconPath && bReturn.bHighlightIconPath){
    //                 break;
    //             }
    //         }
    //     }else{
    //         if(data.guid != item.guid && data["iconPath_Key"] == item["iconPath_Key"]){
    //             bReturn.bIconPath = true;
    //         }
    //         if(data.guid != item.guid && data["highlightIconPath_Key"] == item["highlightIconPath_Key"]){
    //             bReturn.bHighlightIconPath = true;
    //         }
    //     }
    //     return bReturn;
    // },
    // showSelDialog(self, selFieldName){
    //     self.$refs["FileSelectDialog"].show({
    //         dialogTitle: "选择图标(" + self.data[selFieldName].fileExt + ")",
    //         fileExt: self.data[selFieldName].fileExt,
    //         callbackOK: function(filePath){
    //             self.data[selFieldName].value = filePath;
    //         }
    //     });
    // },
    validate: function(data){
        return true;
    },
    selChangeEvent: function(dataItem, item){
        if(item.field == "showHandle"){
            if(item.value == true){
                dataItem["handleHeight"].disabled = false;
                dataItem["handleLineColor"].disabled = false;
            }else{
                dataItem["handleHeight"].disabled = true;
                dataItem["handleLineColor"].disabled = true;
            }
        }
    }
}