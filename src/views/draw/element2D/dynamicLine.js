import { deepCopy, createGuid } from '@/utils'
import drawConfig from '../drawConfig'
import mark3D from '@/stamplib/Mark'
import localStorage from '@/stamplib/LocalStorage'

export default {
    createElement: function(self, elmentArr, options){
        var earth = self.stampAPI.usearth;
        //取图片
        localStorage.readFromDB(earth, options.texture_Key, function(textureData){
            options["texture_Data"] = textureData;
            var obj =  mark3D .createElementdynamicLine(earth, options);
            if(obj){
                elmentArr.push(obj);
            }
        });
    },
    create: function(self){
        var that = this;
        var earth = self.stampAPI.usearth;
        mark3D.createPolyline(earth, function(retData){
            if(!retData || retData.length < 2){
                self.$message({
                    message: '请至少绘制两个点创建动态线',
                    type: 'warning',
                    center: true
                });
                return;
            }
            var dataConf = deepCopy(drawConfig["dynamicLine"]);
            self.$refs.objectDialog.show({
                title: "添加动态线",
                data: dataConf,
                elementManager: that,
                callbackOK: function(){
                    var options = {};
                    options.type = "dynamicLine";
                    options.guid = createGuid();
                    options.visibility = true;
                    options.points = retData;
                    options.points2 = retData;
                    for(var item in dataConf){
                        options[item] = dataConf[item].value;
                    }
                    if(dataConf["texture"].fileinfo){
                        options["texture_Key"] = dataConf["texture"].fileinfo.name;
                        options["texture_Data"] = dataConf["texture"].fileinfo.data;
                    }else{
                        self.$message({
                            message: '请选择图片',
                            type: 'warning',
                            center: true
                        });
                        return true;
                    }
                
                    that.createElementObj(self,options);
                // }
                }
            });
        });
    },
    /**
     * 创建标绘对象和导入SHP线时调用
     * @param {*} self 左侧面板组件
     * @param {*} options 节点信息
     * @param {*} parentInfo 导入时放到一个统一的节点里面
     */
    createElementObj: function(self, options, points, parentInfo){
        var earth = self.stampAPI.usearth;
        var obj = mark3D.createElementdynamicLine(earth, options);
        if(obj){
            self.elementArr.push(obj);
            //保存成功后，去存储图片文件到db
            localStorage.addToDB(earth, options["texture_Key"], options["texture_Data"]);
            delete options["texture_Data"];
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
        var dataConf = deepCopy(drawConfig["dynamicLine"]);
        for(var item in dataConf){
            dataConf[item].value = data[item];
        }
        self.$refs.objectDialog.show({
            title: "编辑动态线",
            data: dataConf,
            elementManager: that,
            callbackOK: function(){
                var options = {};
                options.type = "dynamicLine";
                options.guid = data.guid;//createGuid();
                options.visibility = data.visibility;
                options.points = data.points;
                options.points2 = data.points2;
                for(var item in dataConf){
                    options[item] = dataConf[item].value;
                }
                options["texture_Key"] = data["texture_Key"];
                if(dataConf["texture"].fileinfo){//编辑时有变化
                    options["texture_Key"] = dataConf["texture"].fileinfo.name;
                    options["texture_Data"] = dataConf["texture"].fileinfo.data;
                }
                var selIndex = 0;
                for(var i = 0; i < self.elementArr.length; i++){
                    if(self.elementArr[i].get_guid() == data.guid){
                        selIndex = i;
                        break;
                    }
                }
                // var obj = mark3D.editElementdynamicLine(self.elementArr[selIndex], options);
                // if(obj){//保存对象到全局
                //     self.elementArr[selIndex] = obj;
                    
                //     for(var i = 0; i < self.data[0].children.length; i++){
                //         if(self.data[0].children[i].guid == options.guid){
                //             for(var item in self.data[0].children[i]){
                //                 self.data[0].children[i][item] = options[item];
                //             }
                //             break;
                //         }
                //     }
                // }
                // localStorage.saveElementToDB(earth, self.drawType, self.data);
                function toEdit(){//读取高亮图片资源，然后去编辑
                    var obj = mark3D.editElementdynamicLine(earth,self.elementArr[selIndex], options);
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
                    localStorage.addToDB(earth, options["texture_Key"], options["texture_Data"]);
                    delete options["texture_Data"];
                    localStorage.saveElementToDB(earth, self.drawType, self.data);
                }
                if(!options["texture_Data"]){//高亮图标资源不存在时从db里面读取
                    //取图片
                    localStorage.readFromDB(earth, options.texture_Key, function(textureData){
                        options["texture_Data"] = textureData;
                        toEdit();
                    });
                }else{//高亮图标资源存在，直接下一步
                    toEdit();
                }
            }
        });
    },
    validate: function(data){
        return true;
    }
}