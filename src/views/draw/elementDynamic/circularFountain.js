import { deepCopy, createGuid } from '@/utils'
import drawConfig from '../drawConfig'
import Mark from '@/stamplib/Mark'
import localStorage from '@/stamplib/LocalStorage'
import $ from 'jquery'

export default {
    createElement: function(self, elmentArr, options){
        var earth = self.stampAPI.usearth;
        var objArr = Mark.createElementCircularFountain(earth, window.g_VideoLayer, options);
        if(objArr && objArr.length){
            for(var i=0;i<objArr.length;i++){
                elmentArr.push(objArr[i]);
            }
        }
    },
    create: function(self){
        var earth = self.stampAPI.usearth;
        Mark.createPoint(earth, function(retData){
            if(!retData){
                self.$message({
                    message: '请至少绘制两个点创建环形喷泉',
                    type: 'warning',
                    center: true
                });
                return;
            }
            var dataConf = deepCopy(drawConfig["circularFountain"]);
            self.$refs.objectDialog.show({
                title: "添加环形喷泉",
                data: dataConf,
                callbackOK: function(){
                    var options = {};
                    for(var item in dataConf){
                        options[item] = dataConf[item].value;
                    }
                    options.type = "circularFountain";
                    options.guid = createGuid();
                    options.visibility = true;
                    options.points = retData;
                    options.guidArr = [];
                    for(var i=0;i<6;i++){
                        options.guidArr.push(createGuid());
                    }
                    var objArr = Mark.createElementCircularFountain(earth, window.g_VideoLayer, options);
                    if(objArr && objArr.length){
                        for(var i=0;i<objArr.length;i++){
                            self.elementArr.push(objArr[i]);
                        }
                        
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
        var dataConf = deepCopy(drawConfig["circularFountain"]);
        for(var item in dataConf){
            dataConf[item].value = data[item];
        }
        self.$refs.objectDialog.show({
            title: "编辑环形喷泉",
            data: dataConf,
            callbackOK: function(){
                var options = {};
                for(var item in dataConf){
                    options[item] = dataConf[item].value;
                }
                options.type = "circularFountain";
                options.guid = data.guid;
                options.visibility = data.visibility;
                options.points = data.points;
                options.guidArr = data.guidArr;
                var tempArr = [];
                for(var i = self.elementArr.length-1; i >= 0; i--){
                    if($.inArray(self.elementArr[i].get_guid(),data.guidArr) > -1){
                        tempArr.push(self.elementArr[i]);
                        self.elementArr.splice(i,1);
                    }
                    
                }
                var objArr = Mark.editElementCircularFountain(tempArr, options, earth, window.g_VideoLayer);
                if(objArr && objArr.length){//保存对象到全局
                    for(var i=0;i<objArr.length;i++){
                        self.elementArr.push(objArr[i]);
                    }
                    
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