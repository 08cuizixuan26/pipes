import { deepCopy, createGuid } from '@/utils'
import drawConfig from '../drawConfig'
import Mark from '@/stamplib/Mark'
import localStorage from '@/stamplib/LocalStorage'

export default {
    createElement: function (self, elmentArr, options) {
        var earth = self.stampAPI.usearth;
        var obj = Mark.createElementCircle(earth, options);
        if (obj) {
            elmentArr.push(obj);
        }
    },
    create: function (self) {
        var that = this;
        var earth = self.stampAPI.usearth;
        Mark.createCircle(earth, function (retData) {
            if (!retData || !retData.data || !retData.radius) {
                self.$message({
                    message: '请至少绘制两个点创建圆',
                    type: 'warning',
                    center: true
                });
                return;
            }

            //var circleObj = Mark.createElementCircleByPoints(earth, retData);
            var dataConf = deepCopy(drawConfig["createcircle"]);
            //dataConf["lineLength"].value = circleObj.get_perimeter_3d().toFixed(2);
            //dataConf["polygonArea"].value = circleObj.get_area_3d().toFixed(2);
            //dataConf["radius"].value = circleObj.radius.toFixed(2);
            self.$refs.objectDialog.show({
                title: "添加圆",
                data: dataConf,
                elementManager: that,
                callbackOK: function () {
                    var options = {};
                    for (var item in dataConf) {
                        options[item] = dataConf[item].value;
                    }
                    options.type = "createcircle";
                    options.guid = createGuid();//circleObj.get_guid();
                    options.visibility = true;
                    options.points = retData.data;
                    options.radius = retData.radius;
                    var obj = Mark.createElementCircle(earth, options);
                    if (obj) {
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
    edit: function (self, data) {
        var that = this;
        var earth = self.stampAPI.usearth;
        var dataConf = deepCopy(drawConfig["createcircle"]);
        for (var item in dataConf) {
            dataConf[item].value = data[item];
        }
        self.$refs.objectDialog.show({
            title: "编辑圆",
            data: dataConf,
            elementManager: that,
            callbackOK: function () {
                var options = {};
                options.type = "createcircle";
                options.guid = data.guid;//createGuid();
                options.visibility = data.visibility;
                options.points = data.points;
                for (var item in dataConf) {
                    options[item] = dataConf[item].value;
                }

                var selIndex = 0;
                for (var i = 0; i < self.elementArr.length; i++) {
                    if (self.elementArr[i].get_guid() == data.guid) {
                        selIndex = i;
                        break;
                    }
                }
                var obj = Mark.editElementCircle(self.elementArr[selIndex], options);
                if (obj) {//保存对象到全局
                    self.elementArr[selIndex] = obj;

                    for (var i = 0; i < self.data[0].children.length; i++) {
                        if (self.data[0].children[i].guid == options.guid) {
                            // self.data[0].children[i] = deepCopy(options);
                            for (var item in self.data[0].children[i]) {
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
    validate: function (data) {
        return true;
    }
}