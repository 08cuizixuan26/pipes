
import { createGuid } from '@/utils'
import pointManager from "../element2D/point"
import shapeManager from '@/utils/shapeManager';
export default {
    pointData: null,
    initData: function () {
        this.pointData = {
            vectorFile: "",
            spatialFile: "",
            fieldName: "",
            // fieldShow: "",//感觉没啥用
            fieldNameArr: [],

            textScale: "1",

            showHandle: false,
            handleLineColor: "#FFFF00",
            handleHeight: 1,

            textColor: "#FFFFFF",
            iconPath: "",

            propertyFieldName: "",
            propertyColorData: []
        }
    },
    create: function (self) {
        var that = this;
        that.initData();
        var earth = self.stampAPI.usearth;
        self.$refs.importVectorPoint.show({
            title: "导入矢量点",
            data: that.pointData,
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
                if (data[i].geometry.type == shapeManager.geometryType.Point) {//单点的话，放到数组里面
                    coordinates = [coordinates];
                }
                for (var jIndex = 0; jIndex < coordinates.length; jIndex++) {
                    (function (j) {
                        var points = [];
                        if (datum) {
                            var coord = datum.src_xy_to_des_BLH(coordinates[j][0], coordinates[j][1], 0);
                        } else {
                            var coord = {
                                x: coordinates[j][0],
                                y: coordinates[j][1]
                            }
                        }

                        //TODO:需要将coordinates[j][0]和coordinates[j][1]坐标转成经纬度坐标，然后继续下面的
                        var point = new StampGis.Cartographic(StampGis.StampMath.toRadians(coord.x), StampGis.StampMath.toRadians(coord.y), 0);
                        points.push(point);
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
                            options["type"] = "createpoint";
                            options["guid"] = createGuid();
                            options["visibility"] = true;
                            options["points"] = points[0];
                            options["name"] = name;
                            options["textScale"] = configData["textScale"];
                            options["showHandle"] = configData["showHandle"];
                            options["handleLineColor"] = configData["handleLineColor"];
                            options["handleHeight"] = configData["handleHeight"];
                            options["visibleRange"] = "0,100";//固定写死
                            options["textColor"] = configData["styleSet"] == 1 ? configData["textColor"] : fieldValueMap[fieldValue]["textColor"];
                            options["highlightIconPath"] = options["iconPath"] = configData["styleSet"] == 1 ? configData["iconPath"] : fieldValueMap[fieldValue]["iconPath"];
                            options["description"] = "";
                            if (configData["styleSet"] == 1) {
                                if (configData.fileinfo) {
                                    options["iconPath_Key"] = configData.fileinfo.name;
                                    options["iconPath_Data"] = configData.fileinfo.data;
                                    options["highlightIconPath_Key"] = configData.fileinfo.name;
                                    options["highlightIconPath_Data"] = configData.fileinfo.data;
                                }
                            } else {
                                options["iconPath_Key"] = fieldValueMap[fieldValue].fileinfo.name;
                                options["iconPath_Data"] = fieldValueMap[fieldValue].fileinfo.data;
                                options["highlightIconPath_Key"] = fieldValueMap[fieldValue].fileinfo.name;
                                options["highlightIconPath_Data"] = fieldValueMap[fieldValue].fileinfo.data;
                            }

                            pointManager.createElementObj(threeMenuPanel, options, pNode);
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
            retMsg.message = "请选择矢量点文件";
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
        if (!data.textScale) {
            retMsg.bSuccess = false;
            retMsg.message = "请设置文字比例";
            return retMsg;
        }
        if (data.showHandle) {//显示指示线
            if (!data.handleLineColor) {
                retMsg.bSuccess = false;
                retMsg.message = "请设置指示线颜色";
                return retMsg;
            }
            if (!data.handleHeight) {
                retMsg.bSuccess = false;
                retMsg.message = "请设置指示线长度";
                return retMsg;
            }
        }
        if (data.styleSet == 1) {
            if (!data.textColor) {
                retMsg.bSuccess = false;
                retMsg.message = "请设置统一文字颜色";
                return retMsg;
            }
            if (!data.iconPath) {
                retMsg.bSuccess = false;
                retMsg.message = "请设置统一显示图标";
                return retMsg;
            }
        } else {
            if (data.propertyColorData && data.propertyColorData.length > 0) {
                for (var i = 0; i < data.propertyColorData.length; i++) {
                    if (!data.propertyColorData[i].textColor || !data.propertyColorData[i].iconPath) {
                        retMsg.bSuccess = false;
                        retMsg.message = "请设置属性颜色和图标";
                        return retMsg;
                    }
                }
            } else {
                retMsg.bSuccess = false;
                retMsg.message = "请设置属性颜色和图标";
                return retMsg;
            }
        }
        return retMsg;
    }
}