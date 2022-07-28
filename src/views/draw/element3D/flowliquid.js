import { deepCopy, createGuid } from "@/utils";
import Mark from '@/stamplib/Mark'
import localStorage from '@/stamplib/LocalStorage'

const drawConfig = {
  name: {
    label: "名称",
    field: "name",
    value: "flowliquid",
    type: "1", //代表普通输入框
    afterText: "",
  },
  radius: {
    label: "半径",
    field: "radius",
    value: "5",
    type: "1",
    afterText: "米",
  },
  speed: {
    label: "速度",
    field: "speed",
    value: "1",
    type: "1", //代表普通输入框
    afterText: "米",
  },
};

export default {
  createElement: function(self, elmentArr, options) {
    var earth = self.stampAPI.usearth;
    var obj = Mark.createFlowLiquid(earth, window.g_VideoLayer, options);
    if (obj) {
      elmentArr.push(obj);
    }
  },
  create: function(self) {
    var that = this;
    var earth = self.stampAPI.usearth;
    Mark.createLine(earth, function(retData) {
      if (!retData || retData.length < 2) {
        self.$message({
          message: "请至少绘制两个点创建折线",
          type: "warning",
          center: true,
        });
        return;
      }
      var dataConf = deepCopy(drawConfig);
      self.$refs.objectDialog.show({
        title: "流动液体",
        data: dataConf,
        elementManager: that,
        callbackOK: function() {
          var options = {};
          options.type = "flowliquid";
          options.guid = createGuid();
          options.visibility = true;
          options.points = retData;
          for (var item in dataConf) {
            options[item] = dataConf[item].value;
          }

          var obj = Mark.createFlowLiquid(earth, window.g_VideoLayer, options);
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
  
  edit: function(self, data) {
    var earth = self.stampAPI.usearth;
    var dataConf = deepCopy(drawConfig);
    for (var item in dataConf) {
      dataConf[item].value = data[item];
    }
    let dataNameConf = {name: dataConf.name}
    self.$refs.objectDialog.show({
      title: "编辑流动液体",
      data: dataNameConf,
      callbackOK: function() {
        var options = {};
        options.type = "flowliquid";
        options.guid = data.guid; //createGuid();
        options.visibility = data.visibility;
        options.points = data.points;
        for (var item in dataConf) {
          options[item] = dataConf[item].value;
        }
        options.name = dataNameConf.name.value
        var selIndex = 0;
        for (var i = 0; i < self.elementArr.length; i++) {
          if (self.elementArr[i].get_guid() == data.guid) {
            selIndex = i;
            break;
          }
        }
       
          //保存对象到全局
         
          for (var i = 0; i < self.data[0].children.length; i++) {
            if (self.data[0].children[i].guid == options.guid) {
              for (var item in self.data[0].children[i]) {
                self.data[0].children[i][item] = options[item];
              }
              break;
            }
          }
        
        localStorage.saveElementToDB(earth, self.drawType, self.data);
      },
    });
  },
  validate: function(data) {
    return true;
  },
};
