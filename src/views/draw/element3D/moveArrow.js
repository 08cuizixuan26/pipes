import { deepCopy, createGuid } from "@/utils";
import Mark from '@/stamplib/Mark'
import localStorage from '@/stamplib/LocalStorage'
const config = {
  name: {
    label: "名称",
    field: "name",
    value: "move Arrow",
    type: "1", //代表普通输入框
    afterText: "",
  },
  lineWidth: {
    label: "线宽",
    field: "lineWidth",
    value: "2",
    type: "1", //代表颜色输入框
    afterText: "",
  },
  lineColor: {
    label: "线颜色",
    field: "lineColor",
    value: "#FFFF00",
    type: "4", //代表颜色输入框
    afterText: "",
  },
  lineColorTransparent: {
    label: "线透明度",
    field: "lineColorTransparent",
    value: "204",
    type: "1",
    afterText: "(0~255)",
  },
  arrowLenght: {
    label: "箭头长度",
    field: "arrowLenght",
    value: 32,
    type: "1",
    afterText: "",
  },
  interValue: {
    label: "插值距离",
    field: "interValue",
    value: "3",
    type: "1",
    afterText: "",
  },
  stepSpeed: {
    label: "运动速度",
    field: "stepSpeed",
    value: "5",
    type: "1", //代表普通输入框
    afterText: "米/秒",
  }
};

export default {
  createElement(self, elmentArr, options) {
    var earth = self.stampAPI.usearth;
    var obj = Mark.createEleMoveArrow(earth, window.g_VideoLayer, options);
    if (obj) {
      elmentArr.push(obj);
    }
  },
  create(self) {
    const that = this;
    const earth = self.stampAPI.usearth;
    Mark.createPolyline(earth, function(retData) {
      if (!retData || retData.length < 2) {
        self.$message({
          message: "请至少绘制两个点创建运动箭头",
          type: "warning",
          center: true,
        });
        return;
      }
      var dataConf = deepCopy(config);
      self.$refs.objectDialog.show({
        title: "添加运动箭头",
        data: dataConf,
        elementManager: that,
        callbackOK: function() {
          var options = {};
          options.type = "moveArrow";
          options.guid = createGuid();
          options.visibility = true;
          options.points = retData;
          for (var item in dataConf) {
            options[item] = dataConf[item].value;
          }
      
          var obj = Mark.createEleMoveArrow(
            earth,
            window.g_VideoLayer,
            options
          );
          if (obj) {
            self.elementArr.push(obj);
            self.data[0].children.push(options);
            self.checkData.push(options.guid);
            self.expandData.push(options.guid);
            localStorage.saveElementToDB(earth, self.drawType, self.data);
          }
        },
      });
    });
  },
  edit(self, data) {
    let earth = self.stampAPI.usearth;
    var dataConf = deepCopy(config);
    for (var item in dataConf) {
      dataConf[item].value = data[item];
    }
    let dataNameConf = {name:dataConf.name}
    self.$refs.objectDialog.show({
      title: "编辑运动箭头",
      data: dataNameConf,
      callbackOK: function() {
        var options = {};
        for (var item in dataConf) {
          options[item] = dataConf[item].value;
        }
        options.name = dataNameConf.name.value
        options.type = "moveArrow";
        options.guid = data.guid;
        options.visibility = data.visibility;
        options.points = data.points;
        var selIndex = 0;
        for (var i = 0; i < self.elementArr.length; i++) {
          if (self.elementArr[i].get_guid() == data.guid) {
            selIndex = i;
            break;
          }
        }
        // var obj = Mark.editEleMoveSolLine(self.elementArr[selIndex], options);
        // if (obj) {
        //   //保存对象到全局
        //   self.elementArr[selIndex] = obj;

          for (var i = 0; i < self.data[0].children.length; i++) {
            if (self.data[0].children[i].guid == options.guid) {
              for (var item in self.data[0].children[i]) {
                self.data[0].children[i][item] = options[item];
              }
              break;
            }
          }

          localStorage.saveElementToDB(earth, self.drawType, self.data);
        }
      // },
    });
  },
};
