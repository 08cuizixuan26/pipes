import { deepCopy, createGuid } from '@/utils'
import drawConfig from '../drawConfig'
import Mark from '@/stamplib/Mark'
import localStorage from '@/stamplib/LocalStorage'

export default {
    createElement: function(self, elmentArr, options){
        var earth = self.stampAPI.usearth;
        //取图片
        localStorage.readFromDB(earth, options.columnTexture_Key, function(columnTextureData){
            options["columnTexture_Data"] = columnTextureData;
            //取图片
            localStorage.readFromDB(earth, options.bannerTexture_Key, function(bannerTextureData){
                options["bannerTexture_Data"] = bannerTextureData;
                var obj = Mark.createElementGuardline(earth, options);
                if(obj){
                    elmentArr.push(obj);
                }
            });
        });
    },
    create: function(self){
        var that = this;
        var earth = self.stampAPI.usearth;
        Mark.createPolyline(earth, function(retData){
            if(!retData || retData.length < 2){
                self.$message({
                    message: '请至少绘制两个点创建警戒线',
                    type: 'warning',
                    center: true
                });
                return;
            }
            var dataConf = deepCopy(drawConfig["guardLine"]);
            self.$refs.objectDialog.show({
                title: "添加警戒线",
                data: dataConf,
                elementManager: that,
                callbackOK: function(){
                    var options = {};
                    options.type = "guardLine";
                    options.guid = createGuid();
                    options.visibility = true;
                    options.points = retData;
                    for(var item in dataConf){
                        options[item] = dataConf[item].value;
                    }
                    if(dataConf["columnTexture"].fileinfo){
                        options["columnTexture_Key"] = dataConf["columnTexture"].fileinfo.name;
                        options["columnTexture_Data"] = dataConf["columnTexture"].fileinfo.data;
                    }
                    if(dataConf["bannerTexture"].fileinfo){
                        options["bannerTexture_Key"] = dataConf["bannerTexture"].fileinfo.name;
                        options["bannerTexture_Data"] = dataConf["bannerTexture"].fileinfo.data;
                    }
                    that.createElementObj(self, options);
                }
            });
        });
    },
    /**
     * 创建标绘对象
     * @param {*} self 左侧面板组件
     * @param {*} options 节点信息
     * @param {*} parentInfo 导入时放到一个统一的节点里面
     */
    createElementObj: function(self, options){
        var earth = self.stampAPI.usearth;
        var obj = Mark.createElementGuardline(earth, options);
        if(obj){
            self.elementArr.push(obj);
            //保存成功后，去存储图片文件到db
            localStorage.addToDB(earth, options["columnTexture_Key"], options["columnTexture_Data"]);
            delete options["columnTexture_Data"];
            //保存成功后，去存储图片文件到db
            localStorage.addToDB(earth, options["bannerTexture_Key"], options["bannerTexture_Data"]);
            delete options["bannerTexture_Data"];
            self.data[0].children.push(options);
            self.checkData.push(options.guid);
            self.expandData.push(options.guid);
            localStorage.saveElementToDB(earth, self.drawType, self.data);
        }
    },
    edit: function(self, data){
        var that = this;
        var earth = self.stampAPI.usearth;
        var dataConf = deepCopy(drawConfig["guardLine"]);
        for(var item in dataConf){
            dataConf[item].value = data[item];
        }
        self.$refs.objectDialog.show({
            title: "编辑警戒线",
            data: dataConf,
            elementManager: that,
            callbackOK: function(){
                var options = {};
                options.type = "guardLine";
                options.guid = data.guid;
                options.visibility = data.visibility;
                options.points = data.points;
                for(var item in dataConf){
                    options[item] = dataConf[item].value;
                }
                options["columnTexture_Key"] = data["columnTexture_Key"];
                if(dataConf["columnTexture"].fileinfo){//编辑时有变化
                    options["columnTexture_Key"] = dataConf["columnTexture"].fileinfo.name;
                    options["columnTexture_Data"] = dataConf["columnTexture"].fileinfo.data;
                }
                options["bannerTexture_Key"] = data["bannerTexture_Key"];
                if(dataConf["bannerTexture"].fileinfo){//编辑时有变化
                    options["bannerTexture_Key"] = dataConf["bannerTexture"].fileinfo.name;
                    options["bannerTexture_Data"] = dataConf["bannerTexture"].fileinfo.data;
                }
                var selIndex = 0;
                for(var i = 0; i < self.elementArr.length; i++){
                    if(self.elementArr[i].get_guid() == data.guid){
                        selIndex = i;
                        break;
                    }
                }

                function toEdit(){//读取图片资源，然后去编辑
                    function toEdit2(){//读取图片资源，然后去编辑
                        var obj = Mark.editElementGuardline(self.elementArr[selIndex], options);
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
                        localStorage.addToDB(earth, options["columnTexture_Key"], options["columnTexture_Data"]);
                        delete options["columnTexture_Data"];

                        localStorage.addToDB(earth, options["bannerTexture_Key"], options["bannerTexture_Data"]);
                        delete options["bannerTexture_Data"];
                        localStorage.saveElementToDB(earth, self.drawType, self.data);
                    }
                    if(!options["bannerTexture_Data"]){//高亮图标资源不存在时从db里面读取
                        //取图片
                        localStorage.readFromDB(earth, options.bannerTexture_Key, function(bannerTextureData){
                            options["bannerTexture_Data"] = bannerTextureData;
                            toEdit2();
                        });
                    }else{//高亮图标资源存在，直接下一步
                        toEdit2();
                    }
                }

                if(!options["columnTexture_Data"]){//图标资源不存在时从db里面读取
                    //取图片
                    localStorage.readFromDB(earth, options["columnTexture_Key"], function(columnTextureData){
                        options["columnTexture_Data"] = columnTextureData;
                        toEdit();
                    });
                }else{//图标资源存在，直接下一步
                    toEdit();
                }
            }
        });
    },
    validate: function(data, self){
        if(!data.columnTexture.value){
            self.$message({
                message: '请选择警戒柱纹理图片',
                type: 'warning',
                center: true
            });
            return false;
        }
        if(!data.bannerTexture.value){
            self.$message({
                message: '请选择警戒带纹理图片',
                type: 'warning',
                center: true
            });
            return false;
        }
        return true;
    }
}