import Mark from '@/stamplib/Mark'
import { deepCopy, createGuid } from '@/utils'
import drawConfig from '../drawConfig'
import localStorage from '@/stamplib/LocalStorage'
export default {
    createElement(_self, _elmentArr, options) {
        var self = _self
        var earth = self.stampAPI.usearth;
        var elmentArr = _elmentArr;
        var option = options.options;
        let lineObj = options.lineObj
        if (option.create) {
            let icon = Mark.createElementPoint1(earth, option);
            self.g_ElementData['elementLabel'].elementArr.push(icon)
            if(option.p1 && option.p2){
                let height = Math.max(option.p2.Altitude,option.p1.Altitude)
                let firstPoint = StampGis.Cartesian3.fromDegrees(option.p2.Longitude, option.p2.Latitude, height);
                let secondPoint = StampGis.Cartesian3.fromDegrees(option.p1.Longitude, option.p1.Latitude, height);
                var retData = [firstPoint, secondPoint];
                var lineObj1 = earth.Factory.CreateElementLine({
                    guid: options.guidArr[1],
                    name: '',
                    doc: earth.document
                  })
                  lineObj1.BeginUpdate()
                  lineObj1.SetPointArray(retData)
                  lineObj1.set_altitude_type(1)
                  lineObj1.EndUpdate()
                earth.document.elementRoot.attach_object(lineObj1)
                earth.document.register_object(lineObj1)
                self.g_ElementData['elementLabel'].elementArr.push(lineObj1)
            }
            if (lineObj) {
                let line = Mark.createElementLine(earth, lineObj);
                self.g_ElementData['elementLabel'].elementArr.push(line)
            }
        } else {
            let icon = Mark.createElementPoint(earth, option);
            self.g_ElementData['elementLabel'].elementArr.push(icon)
        }
    },
    edit: function (self, data) {
        var earth = self.stampAPI.usearth;
        var dataConf = deepCopy(drawConfig["label"]);
        for (var item in dataConf) {
            dataConf[item].value = data[item];
        }
        self.$refs.objectDialog.show({
            title: "编辑管线标高",
            data: dataConf,
            callbackOK: function () {
                var options = {};
                for (var item in dataConf) {
                    options[item] = dataConf[item].value;
                }
                options.type = "label";
                options.guid = data.guid;
                options.visibility = data.visibility;
                options.options = data.options;
                options.lineObj = data.lineObj
                var selIndex = 0;
                for (var i = 0; i < self.elementArr.length; i++) {
                    if (self.elementArr[i].get_guid() == data.guid) {
                        selIndex = i;
                        break;
                    }
                }
                var obj = Mark.createElementPoint(self.stampAPI.usearth, options.options);;
                if (obj) {//保存对象到全局
                    self.elementArr[selIndex] = obj;
                    for (let j = 0; j < self.labelData[0].children.length; j++) {
                        for (let i = 0; i < self.labelData[0].children[j].children.length; i++) {
                            if (self.labelData[0].children[j].children[i].guid == options.guid) {
                                for (var item in self.labelData[0].children[j].children[i]) {
                                    self.labelData[0].children[j].children[i][item] = options[item];
                                }
                                break;
                            }
                        }
                    }


                    localStorage.saveElementToDB(earth, 'elementLabel', self.labelData);
                }
            }
        });
    },
}