import { createGuid } from "@/utils";
import Mark from "@/stamplib/Mark";
import localStorage from '@/stamplib/LocalStorage'

const dataMould = {
  emissionRate: 0,
  imageSize: 0.5,
  minLife: 5.0,
  maxLife: 5.0,
  minSpeed: 1.0,
  maxSpeed: 1.0,
  startScale: 1.0,
  endScale: 0.5,
  name: "fireSmoke"
};
export default {
  createElement(self, elmentArr, options) {
    var earth = self.stampAPI.usearth;
    
    var obj = Mark.createSmokeFire(earth, options);
    if (obj) {
      elmentArr.push(obj);
    }
  },
  create(self) {
    const earth = self.stampAPI.usearth;
    Mark.createPoint(earth, retData => {
      if (!retData) {
        self.$message({
          message: "请选择一个点",
          type: "warning",
          center: true
        });
        return;
      }
      const child = self.$refs.particular
      const options = JSON.parse(JSON.stringify(dataMould));
      child.dataOptions = options;
      var position = StampGis.Cartographic.fromCartesian(retData);
      options.lon = StampGis.StampMath.toDegrees(position.longitude);
      options.lat = StampGis.StampMath.toDegrees(position.latitude);
      options.alt = position.height;
      const earth = self.stampAPI.usearth;
      options.guid = createGuid();
      options.type = "smokeFire";
      options.visibility = true;
      const obj = Mark.createSmokeFire(earth, options);
      self.$particleObj = obj;
      
      child.callbackOk = function(){
        if (self.$particleObj) {
          self.elementArr.push(self.$particleObj)
          self.data[0].children.push(options)
          self.checkData.push(options.guid)
          self.expandData.push(options.guid)
          localStorage.saveElementToDB(earth, self.drawType, self.data)
          child.particularVisisble = false;
        }
      }
      child.callbackCancel = function(){
        child.particularVisisble = false;
        if(self.$particleObj){
          earth.document.elementRoot.detach_object(self.$particleObj)
        }
      }
      child.particularVisisble = true;
    });
  },
  edit(self, data) {
    const that = this;
    const child = self.$refs.particular
    const originalData = JSON.parse(JSON.stringify(data));
    child.dataOptions = originalData;
    let selIndex = 0;
    for (let i = 0; i < self.elementArr.length; i++) {
      if (self.elementArr[i].get_guid() == data.guid) {
        selIndex = i;
        break;
      }
    }
    self.$particleObj = self.elementArr[selIndex]
    child.particularVisisble = true;
    
    child.callbackOk = function(){      
      for (let i = 0; i < self.data[0].children.length; i++) {
        if (self.data[0].children[i].guid == originalData.guid) {
          for (let item in self.data[0].children[i]) {
            self.data[0].children[i][item] = originalData[item];
          }
          break;
        }
      }
      localStorage.saveElementToDB(self.stampAPI.usearth, self.drawType, self.data);
    }
    child.callbackCancel = function(){
      child.dataOptions = data
    }
  }
  
};
