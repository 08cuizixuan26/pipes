
import { createGuid } from '@/utils'
import polygon from "../element2D/polygon"
import shapeManager from '@/utils/shapeManager';
export default {
    polygonData: null,
    initData: function () {
        this.polygonData = {
            vectorFile: "",
            spatialFile: "",
            fieldName: "",
            fieldNameArr: [],

            lineTransparent: "255",
            lineWidth: 1,
            lineColor: "#FFFF00",

            fillTransparent: "255",

            fillColor: "#FFFF00",

            propertyFieldName: "",
            propertyColorData: []
        }
    },
    create: function (self) {
        var that = this;
        that.initData();
        var earth = self.stampAPI.usearth;
        self.$refs.importVectorPolygon.show({
            title: "导入矢量面",
            data: that.polygonData,
            threeMenuPanel: self,
            elementManager: that,
            callbackOK: that.createElements
        });
    },
    createElements(data, threeMenuPanel, fileName) {
        var configData = this.data;
        var earth = this.stampAPI.usearth;
        if (configData.styleSet == 2) {
            var fieldValueMap = {};
            for (var i = 0; i < configData.propertyColorData.length; i++) {
                var item = configData.propertyColorData[i];
                fieldValueMap[item.fieldName] = item.colorValue;
            }
        }

        fileName = fileName.substr(0, fileName.lastIndexOf("."));
        var pNode = {
            guid: createGuid(),
            name: fileName,
            children: []
        }
        threeMenuPanel.data[0].children.push(pNode);
        threeMenuPanel.expandData.push(pNode.guid);
        threeMenuPanel.checkData.push(pNode.guid);

        var datum;
        if (configData["spatialFile_info"]) {
            var option = {
                array: configData["spatialFile_info"].data
            };
            datum = earth.Factory.CreateDatum(option);
        }

        for (var iIndex = 0; iIndex < data.length; iIndex++) {//记录数
            (function (i) {
                var coordinates = data[i].geometry.coordinates;
                var geometryType = data[i].geometry.type;
                var property = data[i].properties;
                var name = property[configData["fieldName"]];
                var fieldValue = property[configData["propertyFieldName"]];
                if (geometryType == shapeManager.geometryType.Polygon) {//单点的话，放到数组里面
                    coordinates = [coordinates];
                }
                for (var jIndex = 0; jIndex < coordinates.length; jIndex++) {//一条记录的多个面
                    (function (j) {
                        var pointsArr = [];
                        for (var kIndex = 0; kIndex < coordinates[j].length; kIndex++) {//面的外环和带洞总数
                            (function (k) {
                                var points = [];
                                //批量获取高程
                                for (var m = 0; m < coordinates[j][k].length; m++) {//一条记录的其中一个面的带洞多边形其中一个多边形
                                    if (datum) {
                                        var coord = datum.src_xy_to_des_BLH(coordinates[j][k][m][0], coordinates[j][k][m][1], 0);
                                    } else {
                                        var coord = {
                                            x: coordinates[j][k][m][0],
                                            y: coordinates[j][k][m][1]
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
                                    for (var p = 0; p < points.length; p++) {
                                        points[p] = StampGis.Cartesian3.fromRadians(points[p].longitude, points[p].latitude, points[p].height);
                                    };
                                    pointsArr.push(points);
                                    if (geometryType == shapeManager.geometryType.Polygon && coordinates[j].length > 1) {//单面类型，且有多个polygon，说明是带洞多边形
                                        if (pointsArr.length == coordinates[j].length) {//说明是最后一个面，开始创建多边形
                                            createPolygonObj();
                                        }
                                    } else {
                                        createPolygonObj();
                                    }

                                    function createPolygonObj() {
                                        var options = {};
                                        options["points"] = pointsArr[0];
                                        if (pointsArr.length > 1) {
                                            options["innerPoints"] = []
                                            for (var i = 1; i < pointsArr.length; i++) {
                                                options["innerPoints"].push(pointsArr[i]);
                                            }
                                        }

                                        options["type"] = "createpolygon";
                                        options["guid"] = createGuid();
                                        options["visibility"] = true;
                                        options["name"] = name;
                                        options["lineColor"] = configData["lineColor"];
                                        options["lineWidth"] = configData["lineWidth"];
                                        options["lineColorTransparent"] = configData["lineTransparent"];
                                        options["fillColor"] = configData["styleSet"] == 1 ? configData["fillColor"] : fieldValueMap[fieldValue]
                                        options["fillColorTransparent"] = configData["fillTransparent"];
                                        options["altitudeType"] = "1";
                                        options["drawOrder"] = "0";
                                        options["lineLength"] = 0;
                                        options["polygonArea"] = 0;
                                        options["description"] = "";
                                        polygon.createElementObj(threeMenuPanel, options, null, pNode);
                                    }
                                });
                            })(kIndex);
                        }
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
            retMsg.message = "请选择矢量面文件";
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
        if (!data.fillTransparent) {
            retMsg.bSuccess = false;
            retMsg.message = "请设置填充透明度";
            return retMsg;
        }
        if (data.styleSet == 1) {
            if (!data.fillColor) {
                retMsg.bSuccess = false;
                retMsg.message = "请设置统一填充色";
                return retMsg;
            }
        } else {
            if (data.propertyColorData && data.propertyColorData.length > 0) {
                for (var i = 0; i < data.propertyColorData.length; i++) {
                    if (!data.propertyColorData[i].colorValue) {
                        retMsg.bSuccess = false;
                        retMsg.message = "请设置属性填充色";
                        return retMsg;
                    }
                }
            } else {
                retMsg.bSuccess = false;
                retMsg.message = "请设置属性填充色";
                return retMsg;
            }
        }
        return retMsg;
    }
}