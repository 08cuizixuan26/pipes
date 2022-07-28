import { deepCopy, createGuid } from "@/utils";
import drawConfig from "../drawConfig";
import Mark from '@/stamplib/Mark'
import localStorage from '@/stamplib/LocalStorage'
/**
 * 曲面旗标
 */
export default {
  createElement: function(self, elmentArr, options) {
    var earth = self.stampAPI.usearth;
    var obj = Mark.createElementAssemblyArea(earth, options);
    if (obj) {
      elmentArr.push(obj);
    }
  },
  create: function(self) {
    var that = this;
    var earth = self.stampAPI.usearth;
    Mark.createAssemblyArea(earth, function(retData) {
      
      if (!retData || retData.length < 3) {
        self.$message({
          message: "请至少绘制三个点创建集结地",
          type: "warning",
          center: true
        });
        return;
      }
      var dataConf = deepCopy(drawConfig["assemblyArea"]);
      // dataConf["lineLength"] = retData.length;
      self.$refs.objectDialog.show({
        title: "添加集结地",
        data: dataConf,
        elementManager: that,
        callbackOK: function() {
          var options = {};
          options.type = "assemblyArea";
          options.guid = createGuid();
          options.visibility = true;
          options.points = retData;
          options.rtti = StampGis.rtti_type. SE_RTTI_ELEMENT_PLOT_ASSEMBLY_AREA
          for (var item in dataConf) {
            options[item] = dataConf[item].value;
          }
          var obj = Mark.createElementAssemblyArea(earth, options);
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
  edit: function(self, data) {
    var that = this;
    var earth = self.stampAPI.usearth;
    var dataConf = deepCopy(drawConfig["assemblyArea"]);
    for (var item in dataConf) {
      dataConf[item].value = data[item];
    }
    self.$refs.objectDialog.show({
      title: "编辑集结地",
      data: dataConf,
      elementManager: that,
      callbackOK: function() {
        var options = {};
        options.type = "assemblyArea";
        options.guid = data.guid; //createGuid();
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
        var obj = Mark.editTextureSymbol(
          self.elementArr[selIndex],
          options
        );
        if (obj) {
          //保存对象到全局
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
  validate: function(data) {
    return true;
  }
};
