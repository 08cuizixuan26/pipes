import { deepCopy, createGuid } from '@/utils'
import drawConfig from '../drawConfig'
import Mark from '@/stamplib/Mark'
import localStorage from '@/stamplib/LocalStorage'

export default {
    createElement: function(self, elmentArr, options){
        var earth = self.stampAPI.usearth;
        var obj = Mark.createElementWarnWall(earth, window.g_VideoLayer, options);
        if(obj){
            elmentArr.push(obj);
        }
    },
    create: function(self){
        var earth = self.stampAPI.usearth;
        Mark.createLine(earth, function(retData){
            if(!retData || retData.length < 2){
                self.$message({
                    message: '请至少绘制两个点创建动态墙体',
                    type: 'warning',
                    center: true
                });
                return;
            }
            var points = new Array();
            for (var i = 0; i < retData.length; i++) {
                points[i] = StampGis.Cartographic.fromCartesian(retData[i]);
                points[i].longitude = StampGis.StampMath.toDegrees(points[i].longitude);
                points[i].latitude = StampGis.StampMath.toDegrees(points[i].latitude);
            }
            var dataConf = deepCopy(drawConfig["warnWall"]);
            self.$refs.objectDialog.show({
                title: "添加警告墙体",
                data: dataConf,
                callbackOK: function(){
                    var options = {};
                    for(var item in dataConf){
                        options[item] = dataConf[item].value;
                    }
                    options.type = "warnWall";
                    options.guid = createGuid();
                    options.visibility = true;
                    options.points = points;
                    var obj = Mark.createElementWarnWall(earth, window.g_VideoLayer, options);
                    if(obj){
                        self.elementArr.push(obj);
                        self.data[0].children.push(options);
                        self.checkData.push(options.guid);
                        self.expandData.push(options.guid);
                        localStorage.saveElementToDB(earth, self.drawType, self.data);
                    }
                }
            });
        });
    },
    edit: function(self, data){
        var earth = self.stampAPI.usearth;
        var dataConf = deepCopy(drawConfig["warnWall"]);
        for(var item in dataConf){
            dataConf[item].value = data[item];
        }
        self.$refs.objectDialog.show({
            title: "编辑警告墙体",
            data: dataConf,
            callbackOK: function(){
                var options = {};
                for(var item in dataConf){
                    options[item] = dataConf[item].value;
                }
                options.type = "warnWall";
                options.guid = data.guid;
                options.visibility = data.visibility;
                options.points = data.points;
                var selIndex = 0;
                for(var i = 0; i < self.elementArr.length; i++){
                    if(self.elementArr[i].get_guid() == data.guid){
                        selIndex = i;
                        break;
                    }
                }
                var obj = Mark.editElementWarnWall(self.elementArr[selIndex], options, earth, window.g_VideoLayer);
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

                    localStorage.saveElementToDB(earth, self.drawType, self.data);
                }
            }
        });
    },
    validate: function(data){
        return true;
    }
}