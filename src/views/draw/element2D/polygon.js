import { deepCopy } from '@/utils'
import drawConfig from '../drawConfig'
import Mark from '@/stamplib/Mark'
import localStorage from '@/stamplib/LocalStorage'

export default {
    drawType: "element2D",
    createElement: function(self, elmentArr, options){//初始化调用
        var earth = self.stampAPI.usearth;
        var obj = Mark.createElementPolygon(earth, options);
        if(obj){
            elmentArr.push(obj);
        }
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
            
            var polygonObj = Mark.createElementPolygonByPoints(earth, retData);
            var dataConf = deepCopy(drawConfig["createpolygon"]);
            dataConf["lineLength"].value = polygonObj.get_perimeter_3d().toFixed(2);
            dataConf["polygonArea"].value = polygonObj.get_area_3d().toFixed(2);
            self.$refs.objectDialog.show({
                title: "添加多边形",
                data: dataConf,
                elementManager: that,
                callbackOK: function(){
                    var options = {};
                    options.type = "createpolygon";
                    options.guid = polygonObj.get_guid();
                    options.visibility = true;
                    options.points = retData;
                    for(var item in dataConf){
                        options[item] = dataConf[item].value;
                    }
                    that.createElementObj(self, options, polygonObj);
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
        var obj = Mark.createElementPolygon(earth, options, polygonObj);
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
        var earth = self.stampAPI.usearth;
        var dataConf = deepCopy(drawConfig["createpolygon"]);
        for(var item in dataConf){
            dataConf[item].value = data[item];
        }
        self.$refs.objectDialog.show({
            title: "编辑多边形",
            data: dataConf,
            elementManager: that,
            callbackOK: function(){
                var options = {};
                options.type = "createpolygon";
                options.guid = data.guid;
                options.visibility = data.visibility;
                options.points = data.points;
                for(var item in dataConf){
                    options[item] = dataConf[item].value;
                }
                
                var selIndex = 0;
                for(var i = 0; i < self.elementArr.length; i++){
                    if(self.elementArr[i].get_guid() == data.guid){
                        selIndex = i;
                        break;
                    }
                }
                var obj = Mark.editElementPolygon(self.elementArr[selIndex], options);
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
                            for(var item in self.data[0].children[i]){
                                self.data[0].children[i][item] = options[item];
                            }
                            break;
                        }
                    }

                    localStorage.saveElementToDB(earth, self.drawType, self.data);
                }
            }
        });
    },
    validate: function(data){
        return true;
    }
}