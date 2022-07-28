
import { createGuid } from '@/utils'
import line from "../element2D/line"
import shapeManager from '@/utils/shapeManager';
export default {
    lineData: null,
    initData: function () {
        this.lineData = {
            vectorFile: "",
            spatialFile: "",
            fieldName: "",
            fieldNameArr: [],

            lineTransparent: "255",
            lineWidth: 1,
            lineColor: "#FFFF00",

            propertyFieldName: "",
            propertyColorData: []
        }
    },
    create: function (self) {
        var that = this;
        that.initData();
        self.$refs.importVectorLine.show({
            title: "导入矢量线",
            data: that.lineData,
            threeMenuPanel: self,
            elementManager: that,
            callbackOK: that.createElements
        });
    },
    createElements(data, threeMenuPanel, fileName) {
        var configData = this.data;
        var earth = this.stampAPI.usearth;

        fileName = fileName.substr(0, fileName.lastIndexOf("."));
        var pNode = {
            guid: createGuid(),
            name: fileName,
            children: []
        }
        threeMenuPanel.data[0].children.push(pNode);
        threeMenuPanel.expandData.push(pNode.guid);
        threeMenuPanel.checkData.push(pNode.guid);

        if (configData.styleSet == 2) {
            var fieldValueMap = {};
            for (var i = 0; i < configData.propertyColorData.length; i++) {
                var item = configData.propertyColorData[i];
                fieldValueMap[item.fieldName] = item;
            }
        }

        var datum
        if (configData["spatialFile_info"]) {
            var option = {
                array: configData["spatialFile_info"].data
            };
            datum = earth.Factory.CreateDatum(option);
        }

        for (var iIndex = 0; iIndex < data.length; iIndex++) {
            (function (i) {
                var coordinates = data[i].geometry.coordinates;
                var property = data[i].properties;
                var name = property[configData["fieldName"]];
                var fieldValue = property[configData["propertyFieldName"]];
                if (data[i].geometry.type == shapeManager.geometryType.Line) {//单条线的话，放到数组里面
                    coordinates = [coordinates];
                }
                for (var jIndex = 0; jIndex < coordinates.length; jIndex++) {
                    (function (j) {
                        var points = [];
                        //批量获取高程
                        for (var m = 0; m < coordinates[j].length; m++) {
                            if (datum) {
                                var coord = datum.src_xy_to_des_BLH(coordinates[j][m][0], coordinates[j][m][1], 0);
                            } else {
                                var coord = {
                                    x: coordinates[j][m][0],
                                    y: coordinates[j][m][1]
                                }
                            }
                            //TODO:需要将coordinates[j][m][0]和coordinates[j][m][1]坐标转成经纬度坐标，然后继续下面的
                            var point = new StampGis.Cartographic(StampGis.StampMath.toRadians(coord.x), StampGis.StampMath.toRadians(coord.y), 0);
                            points.push(point);
                        }
                        //批量获取高程
                        var promise = earth.document.get_batch_dem_height_from_server(points);
                        if (promise == undefined) {
                            return;
                        }

                        StampGis.when(promise, function () {
                        }).then(function () {
                            for (var i = 0; i < points.length; i++) {
                                points[i] = StampGis.Cartesian3.fromRadians(points[i].longitude, points[i].latitude, points[i].height);
                            };
                            var options = {};
                            options["type"] = "createline";
                            options["guid"] = createGuid();
                            options["visibility"] = true;
                            options["points"] = points;
                            options["name"] = name;
                            options["lineColor"] = configData["styleSet"] == 1 ? configData["lineColor"] : fieldValueMap[fieldValue].lineColor;
                            options["lineWidth"] = configData["styleSet"] == 1 ? configData["lineWidth"] : fieldValueMap[fieldValue].lineWidth;
                            options["lineColorTransparent"] = configData["lineTransparent"];
                            options["arrowType"] = "0";
                            options["altitudeType"] = "1";//贴地
                            options["drawOrder"] = "0";
                            options["lineLength"] = 0;
                            options["description"] = "";
                            line.createElementObj(threeMenuPanel, options, null, pNode);
                        });
                    })(jIndex);
                }
            })(iIndex);
        }
    },
    validate: function (data) {
        var retMsg = {
            bSuccess: true,
            message: ""
        }
        if (!data.vectorFile) {
            retMsg.bSuccess = false;
            retMsg.message = "请选择矢量线文件";
            return retMsg;
        }
        if (!data.spatialFile) {
            retMsg.bSuccess = false;
            retMsg.message = "请选择空间参考文件";
            return retMsg;
        }
        if (!data.fieldName) {
            retMsg.bSuccess = false;
            retMsg.message = "请选择名称字段";
            return retMsg;
        }
        if (!data.lineTransparent) {
            retMsg.bSuccess = false;
            retMsg.message = "请设置线透明度";
            return retMsg;
        }
        if (!data.lineWidth) {
            retMsg.bSuccess = false;
            retMsg.message = "请设置线宽";
            return retMsg;
        }
        if (!data.lineColor) {
            retMsg.bSuccess = false;
            retMsg.message = "请设置线颜色";
            return retMsg;
        }
        if (data.styleSet == 1) {
            if (!data.lineColor) {
                retMsg.bSuccess = false;
                retMsg.message = "请设置统一线颜色";
                return retMsg;
            }
        } else {
            if (data.propertyColorData && data.propertyColorData.length > 0) {
                for (var i = 0; i < data.propertyColorData.length; i++) {
                    if (!data.propertyColorData[i].lineWidth || !data.propertyColorData[i].lineColor) {
                        retMsg.bSuccess = false;
                        retMsg.message = "请设置属性线宽和线颜色";
                        return retMsg;
                    }
                }
            } else {
                retMsg.bSuccess = false;
                retMsg.message = "请设置属性线宽和线颜色";
                return retMsg;
            }
        }
        return retMsg;
    }
}