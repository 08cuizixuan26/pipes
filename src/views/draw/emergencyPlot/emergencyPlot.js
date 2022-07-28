import { deepCopy, createGuid } from '@/utils'
import drawConfig from '../drawConfig'
import localStorage from "@/stamplib/LocalStorage";

export default {
    createElement: function (self, elementArr, options) {
        const earth = self.stampAPI.usearth;
        const obj = this.createEmergencyPlot(earth, options)
        if (obj) {
            elementArr.push(obj)
        }
    },
    create: function (self, active) {
        var that = this;
        if (self.curSel == "point") {
            self.stampAPI.usearth.ShapeCreator.CreatePoint({
                custom_excute_finish: function (result) {
                    if (result.data != undefined) {
                        var dataConf = deepCopy(drawConfig["emergencyPlot"]);
                        dataConf.name.value = active.name;
                        //dataConf.color.value = that.colorObj2Str(active.color);
                        //dataConf.outlineColor.value = that.colorObj2Str(active.outlineColor);
                        //dataConf.outlineWidth.value = active.outlineWidth;
                        //dataConf.width.value = active.width;
                        //dataConf.width.label = "大小";
                        delete dataConf.altitudeType;
                        //delete dataConf.outlineWidth;
                        //delete dataConf.outlineColor;
                        self.$refs.objectDialog.show({
                            title: "添加点符号应急标绘",
                            data: dataConf,
                            elementManager: that,
                            callbackOK: function () {
                                var options = {};
                                for (var item in dataConf) {
                                    options[item] = dataConf[item].value;
                                }

                                options.guid = createGuid();
                                options.visibility = true;
                                options.points = result.data;
                                options.symbolId = active.name;
                                //options.color = that.colorObj2Str(active.color);
                                options.color = active.color;
                                options.width = active.width;
                                options.type = "emergencyPlot";
                                options.class = self.curSel;
                                const symbol = that.createEmergencyPlot(self.stampAPI.usearth, options);
                                if (symbol) {
                                    self.elementArr.push(symbol);
                                    self.treeData[0].children[0].children.push(
                                        options
                                    );
                                    self.checkData.push(options.guid);
                                    localStorage.saveElementToDB(
                                        self.stampAPI.usearth,
                                        "emergencyPlot",
                                        self.treeData
                                    );
                                }
                            }
                        });
                        self.stampAPI.usearth.ShapeCreator.Clear();
                    } else {
                        self.stampAPI.usearth.ShapeCreator.Clear();
                    }
                }
            });
        } else if (self.curSel == "line") {
            self.stampAPI.usearth.ShapeCreator.CreatePolyline({
                custom_excute_finish: function (result) {
                    if (result.data != undefined && result.data.length >= 2) {
                        var dataConf = deepCopy(drawConfig["emergencyPlot"]);
                        dataConf.name.value = active.name;
                        //dataConf.color.value = that.colorObj2Str(active.color);
                        //dataConf.width.value = active.outlineWidth;
                        //delete dataConf.outlineWidth;
                        //delete dataConf.outlineColor;
                        self.$refs.objectDialog.show({
                            title: "添加线符号应急标绘",
                            data: dataConf,
                            callbackOK: function () {
                                var options = {};
                                for (var item in dataConf) {
                                    options[item] = dataConf[item].value;
                                }

                                options.guid = createGuid();
                                options.visibility = true;
                                options.points = result.data;
                                options.symbolId = active.name;
                                //options.color = that.colorObj2Str(active.color);
                                options.color = active.color;
                                options.width = active.width;
                                options.type = "emergencyPlot";
                                options.class = self.curSel;
                                options.rtti = StampGis.rtti_type.SE_RTTI_ELEMENT_LINE;
                                const symbol = that.createEmergencyPlot(self.stampAPI.usearth, options);
                                if (symbol) {
                                    self.elementArr.push(symbol);
                                    self.treeData[0].children[1].children.push(
                                        options
                                    );
                                    self.checkData.push(options.guid);
                                    localStorage.saveElementToDB(
                                        self.stampAPI.usearth,
                                        "emergencyPlot",
                                        self.treeData
                                    );
                                }
                            }
                        });
                        self.stampAPI.usearth.ShapeCreator.Clear();
                    } else {
                        self.stampAPI.usearth.ShapeCreator.Clear();
                    }
                }
            });
        } else if (self.curSel == "polygon") {
            self.stampAPI.usearth.ShapeCreator.CreatePolygon({
                custom_excute_finish: function (result) {
                    if (result.data != undefined && result.data.length >= 3) {
                        var dataConf = deepCopy(drawConfig["emergencyPlot"]);
                        dataConf.name.value = active.name;
                        //dataConf.color.value = that.colorObj2Str(active.color);
                        //dataConf.outlineColor.value = that.colorObj2Str(active.outlineColor);
                        //dataConf.outlineWidth.value = active.outlineWidth;
                        //dataConf.width.value = active.width;
                        //delete dataConf.outlineWidth;
                        //delete dataConf.outlineColor;
                        self.$refs.objectDialog.show({
                            title: "添加面符号应急标绘",
                            data: dataConf,
                            callbackOK: function () {
                                var options = {};
                                for (var item in dataConf) {
                                    options[item] = dataConf[item].value;
                                }

                                options.guid = createGuid();
                                options.visibility = true;
                                options.points = result.data;
                                options.symbolId = active.name;
                                //options.color = that.colorObj2Str(active.color);
                                options.color = active.color;
                                options.width = active.width;
                                options.type = "emergencyPlot";
                                options.class = self.curSel;
                                options.rtti = StampGis.rtti_type.SE_RTTI_ELEMENT_POLYGON;
                                const symbol = that.createEmergencyPlot(self.stampAPI.usearth, options);
                                if (symbol) {
                                    self.elementArr.push(symbol);
                                    self.treeData[0].children[2].children.push(
                                        options
                                    );
                                    self.checkData.push(options.guid);
                                    localStorage.saveElementToDB(
                                        self.stampAPI.usearth,
                                        "emergencyPlot",
                                        self.treeData
                                    );
                                }
                            }
                        });
                        self.stampAPI.usearth.ShapeCreator.Clear();
                    } else {
                        self.stampAPI.usearth.ShapeCreator.Clear();
                    }
                }
            });
        }
    },
    edit: function (self, data) {
        var that = this;
        var earth = self.stampAPI.usearth;
        var dataConf = deepCopy(drawConfig["emergencyPlot"]);

        var index = 2;
        var title = "编辑面符号应急标绘";
        if (data.class == "point") {
            title = "编辑点符号应急标绘";
            //dataConf.width.label = "大小";
            delete dataConf.altitudeType;
            //delete dataConf.outlineWidth;
            //delete dataConf.outlineColor;

            index = 0;
        } else if (data.class == "line") {
            title = "编辑线符号应急标绘";
            //delete dataConf.outlineWidth;
            //delete dataConf.outlineColor;

            index = 1;
        } else if (data.class == "polygon") {
            title = "编辑面符号应急标绘";
            //delete dataConf.outlineWidth;
            //delete dataConf.outlineColor;

            index = 2;
        }

        for (var item in dataConf) {
            dataConf[item].value = data[item];
        }

        self.$refs.objectDialog.show({
            title: title,
            data: dataConf,
            callbackOK: function () {
                var options = {};
                for (var item in dataConf) {
                    options[item] = dataConf[item].value;
                }
                options.guid = data.guid;
                options.visibility = data.visibility;
                options.points = data.points;
                options.symbolId = data.symbolId;
                options.color = data.color;
                options.width = data.width;
                options.type = data.type;
                options.class = data.class;
                options.rtti = data.rtti;

                var selIndex = 0;
                for (var i = 0; i < self.elementArr.length; i++) {
                    if (self.elementArr[i].get_guid() == data.guid) {
                        selIndex = i;
                        break;
                    }
                }
                const symbol = that.editEmergencyPlot(self.elementArr[selIndex], self.stampAPI.usearth, options);
                if (symbol) {
                    self.elementArr[selIndex] = symbol;

                    for (var i = 0; i < self.treeData[0].children[index].children.length; i++) {
                        if (self.treeData[0].children[index].children[i].guid == options.guid) {
                            for (var item in self.treeData[0].children[index].children[i]) {
                                self.treeData[0].children[index].children[i][item] = options[item];
                            }
                            break;
                        }
                    }

                    localStorage.saveElementToDB(
                        self.stampAPI.usearth,
                        "emergencyPlot",
                        self.treeData
                    );
                }
            }
        });
    },
    createEmergencyPlot(earth, options) {
        if (options.class == "line" || options.class == "polygon") {
            var symbol = earth.Factory.CreateElementTextureSymbol({
                name: options.name,
                doc: earth.document,
                symbolRtti: options.rtti,
                guid: options.guid
            });

            var symbolStyle = symbol.symbolStyle;
            symbolStyle.libraryName = this.libraryName;
            symbolStyle.symbolId = options.symbolId;
            //symbolStyle.color = this.colorStr2Obj(options.color);
            if (options.color) {
                symbolStyle.color = StampGis.Color.clone(options.color);
            }
            //symbolStyle.width = options.width ? Number(options.width):undefined;
            //symbolStyle.outlineColor = this.colorStr2Obj(options.outlineColor);
            //symbolStyle.outlineWidth = options.outlineWidth ? Number(options.outlineWidth):undefined;
            symbol.BeginUpdate();
            symbol.SetControlPoints(options.points, false);
            symbol.set_altitude_type(options.altitudeType);
            symbol.drawOrder = 3;
            symbol.set_is_visible(!!options.visibility);
            symbol.EndUpdate();
            earth.document.elementRoot.attach_object(symbol);
            earth.document.register_object(symbol);

            return symbol;
        } else if (options.class == "point") {
            var symbol = earth.Factory.CreateElementVolumeSymbol({
                name: options.name,
                doc: earth.document,
                guid: options.guid
            });

            var symbolStyle = symbol.symbolStyle;
            symbolStyle.libraryName = this.libraryName;
            symbolStyle.symbolId = options.symbolId;
            //symbolStyle.color = this.colorStr2Obj(options.color);
            if (options.color) {
                symbolStyle.color = StampGis.Color.clone(options.color);
            }
            symbolStyle.size = options.width ? Number(options.width) : undefined;
            //symbolStyle.outlineColor = this.colorStr2Obj(options.outlineColor);
            //symbolStyle.outlineWidth = options.outlineWidth ? Number(options.outlineWidth):undefined;
            symbol.BeginUpdate();
            symbol.transform.set_position_geo(options.points);
            symbol.height = 1.0;
            symbol.set_is_visible(!!options.visibility);
            symbol.EndUpdate();
            earth.document.elementRoot3D.attach_object(symbol);
            earth.document.register_object(symbol);

            return symbol;
        }
    },
    editEmergencyPlot(element, earth, options) {
        if (options.class == "point") {
            earth.document.elementRoot3D.detach_object(element);
        } else {
            earth.document.elementRoot.detach_object(element);
        }

        element = this.createEmergencyPlot(earth, options);
        return element;
    },
    colorObj2Str(color) {
        if (!color) {
            return "";
        } else {
            var red = (color.red * 255).toString(16);
            var green = (color.green * 255).toString(16);
            var blue = (color.blue * 255).toString(16);
            var alpha = (color.alpha * 255).toString(16);
            if (red.length < 2) {
                red = "0" + red;
            }
            if (green.length < 2) {
                green = "0" + green;
            }
            if (blue.length < 2) {
                blue = "0" + blue;
            }
            return "#" + red + green + blue;
        }
    },
    colorStr2Obj(color) {
        if (!color || color === "") {
            return undefined;
        }
        var temp = StampGis.Color.fromCssColorString(color);
        return temp;
    },
    createColorObj(color) {
        if (!color) {
            return undefined;
        }

        var red = (color.red * 255).toString(16);
        var green = (color.green * 255).toString(16);
        var blue = (color.blue * 255).toString(16);
        var alpha = (color.alpha * 255).toString(16);
        if (red.length < 2) {
            red = "0" + red;
        }
        if (green.length < 2) {
            green = "0" + green;
        }
        if (blue.length < 2) {
            blue = "0" + blue;
        }
        return "#" + red + green + blue;
        var temp = StampGis.Color.fromCssColorString(color);
        return temp;
    },
    libraryName: stamp_core_config.baseUrlString + "Assets/EmergencyPlotting.symlib"
}