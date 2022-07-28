import { deepCopy, createGuid } from '@/utils'
import drawConfig from '../drawConfig'
import Mark from '@/stamplib/Mark'
import localStorage from '@/stamplib/LocalStorage'

export default {
    createElement: function (self, elmentArr, options) {
        var earth = self.stampAPI.usearth;
        var obj = Mark.createElementMoveIcon(earth, window.g_VideoLayer, options);
        if (obj) {
            elmentArr.push(obj);
        }
    },
    create: function (self) {
        var that = this;
        var earth = self.stampAPI.usearth;
        Mark.CreateCurve(earth, function (retData) {
            if (!retData || retData.length < 3) {
                self.$message({
                    message: '请至少绘制三个点创建运动路径',
                    type: 'warning',
                    center: true
                });
                return;
            }

            var dataConf = deepCopy(drawConfig["moveIcon"]);
            // var dynamicList = self.$store.state.dynamicList;
            // for(var i=0;i<dynamicList.length;i++){
            //     dataConf.dynamicObj.content.push({
            //         value: dynamicList[i].value,
            //         label: dynamicList[i].label,
            //         rot: dynamicList[i].rot
            //     });                                
            // }
            // if(dataConf.dynamicObj.content.length>0){
            //     dataConf.dynamicObj.value = dataConf.dynamicObj.content[0].value;
            // }

            self.$refs.objectDialog.show({
                title: "添加运动标注",
                data: dataConf,
                elementManager: that,
                callbackOK: function () {
                    var options = {};
                    options.type = "moveIcon";
                    options.guid = createGuid();
                    options.visibility = true;
                    options.points = retData;
                    for (var item in dataConf) {
                        options[item] = dataConf[item].value;

                        // if (item == "dynamicObj") {
                        //     for (var i = 0; i < dataConf.dynamicObj.content.length; i++) {
                        //         if (dataConf[item].value == dataConf.dynamicObj.content[i].value) {
                        //             options.dynamicRot = dataConf.dynamicObj.content[i].rot;
                        //             break;
                        //         }
                        //     }
                        // }
                    }
                    that.createElementObj(self, options);
                }
            });
        });
    },
    /**
     * 创建标绘对象和导入SHP线时调用
     * @param {*} self 左侧面板组件
     * @param {*} options 节点信息
     * @param {*} lineObj 绘制时由于要先创建对象，获取长度等信息，对象是提前创建好了的，传进去即可
     * @param {*} parentInfo 导入时放到一个统一的节点里面
     */
    createElementObj: function (self, options) {
        var earth = self.stampAPI.usearth;
        var obj = Mark.createElementMoveIcon(earth, window.g_VideoLayer, options);
        if (obj) {
            self.elementArr.push(obj);
            self.data[0].children.push(options);
            self.checkData.push(options.guid);
            self.expandData.push(options.guid);
            localStorage.saveElementToDB(earth, self.drawType, self.data);
        }
    },
    edit: function (self, data) {
        var that = this;
        var earth = self.stampAPI.usearth;
        var dataConf = deepCopy(drawConfig["moveIcon"]);
        for (var item in dataConf) {
            dataConf[item].value = data[item];
        }
        // var dynamicList = self.$store.state.dynamicList;
        // for (var i = 0; i < dynamicList.length; i++) {
        //     dataConf.dynamicObj.content.push({
        //         value: dynamicList[i].value,
        //         label: dynamicList[i].label,
        //         rot: dynamicList[i].rot
        //     });
        // }
        // if (dataConf.dynamicObj.content.length > 0) {
        //     dataConf.dynamicObj.value = dataConf.dynamicObj.content[0].value;
        // }

        self.$refs.objectDialog.show({
            title: "编辑运动标注",
            data: dataConf,
            elementManager: that,
            callbackOK: function () {
                var options = {};
                options.type = "moveIcon";
                options.guid = data.guid;//createGuid();
                options.visibility = data.visibility;
                options.points = data.points;
                for (var item in dataConf) {
                    options[item] = dataConf[item].value;

                    // if (item == "dynamicObj") {
                    //     for (var i = 0; i < dataConf.dynamicObj.content.length; i++) {
                    //         if (dataConf[item].value == dataConf.dynamicObj.content[i].value) {
                    //             options.dynamicRot = dataConf.dynamicObj.content[i].rot;
                    //             break;
                    //         }
                    //     }
                    // }
                }

                var selIndex = 0;
                for (var i = 0; i < self.elementArr.length; i++) {
                    if (self.elementArr[i].get_guid() == data.guid) {
                        selIndex = i;
                        break;
                    }
                }
                var obj = Mark.editElementMoveIcon(self.elementArr[selIndex], options, earth, window.g_VideoLayer);
                if (obj) {//保存对象到全局
                    self.elementArr[selIndex] = obj;

                    for (var i = 0; i < self.data[0].children.length; i++) {
                        if (self.data[0].children[i].guid == options.guid) {
                            for (var item in self.data[0].children[i]) {
                                self.data[0].children[i][item] = options[item];
                            }
                            break;
                        }
                    }
                }
                localStorage.saveElementToDB(earth, self.drawType, self.data);
            }
        });
    },
    validate: function (data) {
        return true;
    }
}