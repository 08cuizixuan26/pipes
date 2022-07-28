import { postDataQuery, getFiledCfgXml, getNameNoIgnoreCase, getNameNoIgnoreCase1 } from "@/api/query";
import localStorage from "@/stamplib/LocalStorage";
import Mark from "@/stamplib/Mark";  //创建点的方法
import { createGuid } from "@/utils"

var searchCallback = null;

let biaogao = 1;
let guanjin = 1;
let maishen = 1;
let zuobiao = 1;
let podu = 1;
let wantou = 1;
let zidingyi = 1;

function PickLabel(_self, _callback, _id) {
    var self = _self;
    var callback = _callback;
    var id = _id;
    var earth = self.stampAPI.usearth;
    var application = earth.application;
    var isShow = false;
    this.timeoutVal = null;
    var pickSelf = this;
    if (
        application._selectedEntityChanged._listeners &&
        application._selectedEntityChanged._listeners.length > 0
    ) {
        application._selectedEntityChanged._listeners.length = 0;
    }
    application.pickingEnable = true;
    if (searchCallback) {
        application._selectedEntityChanged.removeEventListener(searchCallback);
        searchCallback = null;
    }
    searchCallback = function (res) {
        application._selectedEntity = undefined;
        var res = res[0];
        if (!res) {
            return
        }
        clearLastObj();  //暂放

        if (res.layer) {
            self.stampAPI.lastLayer = res.layer;
            var type = res.layer.get_LayerType().toLowerCase()
            if (type == "container" || type == "container_og" || type == "plate" || type == "well" || type == "joint" || type == "equipment" || type == "room" || type == "joint_og") {
                if (res.properties && res.properties.properties) {
                    var data = res.properties.properties;
                    var key = res.properties.properties.Key;
                    var layerId = res.layer._id;
                    var layerGuid = layerId.split("_")[0];
                    var layerType = layerId.split("_")[1];
                    var searchType = 'line';
                    var postDataParam = '';
                    let tableType = '1';
                    let gisServer = res.layer._gis_server_connection;

                    let urlSearch = self.g_Project.FieldMap;
                    // console.log(urlSearch, '管线标注')
                    if (urlSearch == "") {
                        var data = res.properties.properties;
                        var result = [];
                        for (var key in data) {
                            result.push({
                                key: key,
                                value: data[key]
                            })
                        }
                        callback(result, null, this);
                        self.$message({
                            massage: '当前工程没有管线配置信息',
                            type: 'warning'
                        });
                        return;
                    }
                    if (id == 'MarkedElevation') {
                        getFiledCfgXml(urlSearch, self).then(resXml => {
                            let lFiled = getNameNoIgnoreCase(resXml, "US_KEY", "1", true);
                            if (layerType == "container" || layerType == "container_og") {
                                searchType = "line";
                                tableType = '1';
                                // postDataParam = `service=${layerGuid}&qt=17&dt=${searchType}&pc=(and,equal,${lFiled},${key})&pg=0,10&encoding=utf-8&`;

                                postDataParam = {
                                    service: layerGuid,
                                    qt: 17,
                                    dt: searchType,
                                    pc: `(and,equal,${lFiled},${key})`,
                                    pg: '0,10',
                                    encoding: 'utf-8'
                                }
                            }
                            postDataQuery(postDataParam, gisServer).then(function (res) {
                                var json = self.$x2js.xml2js(res.data).Xml;
                                if (json && json.Result._num > 0) {
                                    var Record = json.Result.Record;
                                    Array.isArray(Record) || (Record = [Record]);
                                    var result = [];
                                    for (var key in Record[0]) {
                                        if (Record[0][key] && Record[0][key] != '') {
                                            let tempKey = getNameNoIgnoreCase1(resXml, key, tableType, false);

                                            result.push({
                                                key: tempKey,
                                                value: Record[0][key]
                                            })
                                        }
                                    }
                                    console.log(result)
                                    lineLevel(result)
                                    id = '';
                                } else {
                                    var result = [];
                                    for (var key in data) {
                                        result.push({
                                            key: key,
                                            value: data[key]
                                        })
                                    }
                                }
                            })
                        });
                    } else if (id == 'MarkedDiameter') {
                        getFiledCfgXml(urlSearch, self).then(resXml => {
                            let lFiled = getNameNoIgnoreCase(resXml, "US_KEY", "1", true);
                            if (layerType == "container" || layerType == "container_og") {
                                searchType = "line";
                                tableType = '1';
                                // postDataParam = `service=${layerGuid}&qt=17&dt=${searchType}&pc=(and,equal,${lFiled},${key})&pg=0,10&encoding=utf-8&`;

                                postDataParam = {
                                    service: layerGuid,
                                    qt: 17,
                                    dt: searchType,
                                    pc: `(and,equal,${lFiled},${key})`,
                                    pg: '0,10',
                                    encoding: 'utf-8'
                                }
                            }
                            postDataQuery(postDataParam, gisServer).then(function (res) {
                                var json = self.$x2js.xml2js(res.data).Xml;
                                if (json && json.Result._num > 0) {
                                    var Record = json.Result.Record;
                                    Array.isArray(Record) || (Record = [Record]);
                                    var result = [];
                                    for (var key in Record[0]) {
                                        if (Record[0][key] && Record[0][key] != '') {
                                            let tempKey = getNameNoIgnoreCase1(resXml, key, tableType, false);

                                            result.push({
                                                key: tempKey,
                                                value: Record[0][key]
                                            })
                                        }
                                    }
                                    pipeDiameter(result)
                                    id = '';
                                } else {
                                    var result = [];
                                    for (var key in data) {
                                        result.push({
                                            key: key,
                                            value: data[key]
                                        })
                                    }
                                }
                            }).catch(err => {
                                var result = [];
                                for (var key in data) {
                                    result.push({
                                        key: key,
                                        value: data[key]
                                    })
                                }
                                callback(result, null, this);
                            })
                        });
                    } else if (id == 'roMarkedCoveringDepthtate') {
                        getFiledCfgXml(urlSearch, self).then(resXml => {
                            let lFiled = getNameNoIgnoreCase(resXml, "US_KEY", "1", true);
                            if (layerType == "container" || layerType == "container_og") {
                                searchType = "line";
                                tableType = '1';
                                // postDataParam = `service=${layerGuid}&qt=17&dt=${searchType}&pc=(and,equal,${lFiled},${key})&pg=0,10&encoding=utf-8&`;

                                postDataParam = {
                                    service: layerGuid,
                                    qt: 17,
                                    dt: searchType,
                                    pc: `(and,equal,${lFiled},${key})`,
                                    pg: '0,10',
                                    encoding: 'utf-8'
                                }
                            }
                            postDataQuery(postDataParam, gisServer).then(function (res) {
                                var json = self.$x2js.xml2js(res.data).Xml;
                                if (json && json.Result._num > 0) {
                                    var Record = json.Result.Record;
                                    Array.isArray(Record) || (Record = [Record]);
                                    var result = [];
                                    for (var key in Record[0]) {
                                        if (Record[0][key] && Record[0][key] != '') {
                                            let tempKey = getNameNoIgnoreCase1(resXml, key, tableType, false);

                                            result.push({
                                                key: tempKey,
                                                value: Record[0][key]
                                            })
                                        }
                                    }
                                    roMarkedCoveringDepthtate(result)
                                    id = '';
                                } else {
                                    var result = [];
                                    for (var key in data) {
                                        result.push({
                                            key: key,
                                            value: data[key]
                                        })
                                    }

                                    callback(result, null, this);
                                }
                            }).catch(err => {
                                var result = [];
                                for (var key in data) {
                                    result.push({
                                        key: key,
                                        value: data[key]
                                    })
                                }
                                callback(result, null, this);
                            })
                        });
                    } else if (id == "MarkedCoordinates") {
                        getFiledCfgXml(urlSearch, self).then(resXml => {
                            let lFiled = getNameNoIgnoreCase(resXml, "US_KEY", "1", true);
                            if (layerType == "container" || layerType == "container_og") {
                                searchType = "line";
                                tableType = '1';
                                // postDataParam = `service=${layerGuid}&qt=17&dt=${searchType}&pc=(and,equal,${lFiled},${key})&pg=0,10&encoding=utf-8&`;

                                postDataParam = {
                                    service: layerGuid,
                                    qt: 17,
                                    dt: searchType,
                                    pc: `(and,equal,${lFiled},${key})`,
                                    pg: '0,10',
                                    encoding: 'utf-8'
                                }
                            }
                            postDataQuery(postDataParam, gisServer).then(function (res) {
                                var json = self.$x2js.xml2js(res.data).Xml;
                                if (json && json.Result._num > 0) {
                                    var Record = json.Result.Record;
                                    Array.isArray(Record) || (Record = [Record]);
                                    var result = [];
                                    for (var key in Record[0]) {
                                        if (Record[0][key] && Record[0][key] != '') {
                                            let tempKey = getNameNoIgnoreCase1(resXml, key, tableType, false);

                                            result.push({
                                                key: tempKey,
                                                value: Record[0][key]
                                            })
                                        }
                                    }
                                    MarkedCoordinates(result)
                                    id = '';
                                } else {
                                    var result = [];
                                    for (var key in data) {
                                        result.push({
                                            key: key,
                                            value: data[key]
                                        })
                                    }

                                    callback(result, null, this);
                                }
                            }).catch(err => {
                                var result = [];
                                for (var key in data) {
                                    result.push({
                                        key: key,
                                        value: data[key]
                                    })
                                }
                            })
                        });
                    } else if (id == "MarkedSlope") {
                        getFiledCfgXml(urlSearch, self).then(resXml => {
                            let lFiled = getNameNoIgnoreCase(resXml, "US_KEY", "1", true);
                            if (layerType == "container" || layerType == "container_og") {
                                searchType = "line";
                                tableType = '1';
                                // postDataParam = `service=${layerGuid}&qt=17&dt=${searchType}&pc=(and,equal,${lFiled},${key})&pg=0,10&encoding=utf-8&`;

                                postDataParam = {
                                    service: layerGuid,
                                    qt: 17,
                                    dt: searchType,
                                    pc: `(and,equal,${lFiled},${key})`,
                                    pg: '0,10',
                                    encoding: 'utf-8'
                                }
                            }
                            postDataQuery(postDataParam, gisServer).then(function (res) {
                                var json = self.$x2js.xml2js(res.data).Xml;
                                if (json && json.Result._num > 0) {
                                    var Record = json.Result.Record;
                                    Array.isArray(Record) || (Record = [Record]);
                                    var result = [];
                                    for (var key in Record[0]) {
                                        if (Record[0][key] && Record[0][key] != '') {
                                            let tempKey = getNameNoIgnoreCase1(resXml, key, tableType, false);

                                            result.push({
                                                key: tempKey,
                                                value: Record[0][key]
                                            })
                                        }
                                    }
                                    MarkedSlope(result)
                                    id = '';
                                } else {
                                    var result = [];
                                    for (var key in data) {
                                        result.push({
                                            key: key,
                                            value: data[key]
                                        })
                                    }

                                    callback(result, null, this);
                                }
                            }).catch(err => {
                                var result = [];
                                for (var key in data) {
                                    result.push({
                                        key: key,
                                        value: data[key]
                                    })
                                }
                            })
                        });
                    } else if (id == "MarkedCurvedAngle") {
                        if (id == "MarkedCurvedAngle" && layerType == "joint" || layerType == "joint_og") {
                            getFiledCfgXml(urlSearch, self).then(resXml => {
                                let lFiled = getNameNoIgnoreCase(resXml, "US_KEY", "0", true);
                                // let lFiled2 = getNameNoIgnoreCase(resXml, "US_KEY", "1", true);
                                if (layerType == "joint" || layerType == "joint_og") {
                                    searchType = "point";
                                    tableType = '1';
                                    /**
                                     * 请求拼接参数
                                     * service 	e5f12116-9a3a-4f70-8302-1dc2f4fec692
                                     * qt	    16
                                     * dt	    point
                                     * pc	    (and,equal,EXP_NO,EJS3334)
                                     * pg	    0,10
                                     *  
                                    */
                                    // postDataParam = `service=${layerGuid}&qt=17&dt=${searchType}&pc=(and,equal,${lFiled},${key})&pg=0,10&encoding=utf-8&`;

                                    postDataParam = {
                                        service: layerGuid,
                                        qt: 17,
                                        dt: searchType,
                                        pc: `(and,equal,${lFiled},${key})`,
                                        pg: '0,10',
                                        encoding: 'utf-8'
                                    }
                                }
                                postDataQuery(postDataParam, gisServer).then(function (res) {
                                    var json = self.$x2js.xml2js(res.data).Xml;
                                    if (json && json.Result._num > 0) {
                                        var Record = json.Result.Record;
                                        Array.isArray(Record) || (Record = [Record]);
                                        var result = [];
                                        for (var key in Record[0]) {
                                            if (Record[0][key] && Record[0][key] != '') {
                                                let tempKey = getNameNoIgnoreCase1(resXml, key, tableType, false);

                                                result.push({
                                                    key: tempKey,
                                                    value: Record[0][key]
                                                })
                                            }
                                        }
                                        MarkedCurvedAngle(result)
                                        id = '';
                                    } else {
                                        var result = [];
                                        for (var key in data) {
                                            result.push({
                                                key: key,
                                                value: data[key]
                                            })
                                        }
                                    }
                                }).catch(err => {
                                    var result = [];
                                    for (var key in data) {
                                        result.push({
                                            key: key,
                                            value: data[key]
                                        })
                                    }
                                })
                            });
                        } else {
                            self.$message({
                                message: "请选择弯头处"
                            })
                        }

                    } else if (id == "MarkedComplex") {  //扯旗标注
                        getFiledCfgXml(urlSearch, self).then(resXml => {
                            let lFiled = getNameNoIgnoreCase(resXml, "US_KEY", "1", true);
                            if (layerType == "container" || layerType == "container_og") {
                                searchType = "line";
                                tableType = '1';
                                // postDataParam = `service=${layerGuid}&qt=17&dt=${searchType}&pc=(and,equal,${lFiled},${key})&pg=0,10&encoding=utf-8&`;

                                postDataParam = {
                                    service: layerGuid,
                                    qt: 17,
                                    dt: searchType,
                                    pc: `(and,equal,${lFiled},${key})`,
                                    pg: '0,10',
                                    encoding: 'utf-8'
                                }
                            }
                            postDataQuery(postDataParam, gisServer).then(function (res) {
                                var json = self.$x2js.xml2js(res.data).Xml;
                                if (json && json.Result._num > 0) {
                                    var Record = json.Result.Record;
                                    Array.isArray(Record) || (Record = [Record]);
                                    var result = [];
                                    for (var key in Record[0]) {
                                        if (Record[0][key] && Record[0][key] != '') {
                                            let tempKey = getNameNoIgnoreCase1(resXml, key, tableType, false);

                                            result.push({
                                                key: tempKey,
                                                value: Record[0][key]
                                            })
                                        }
                                    }
                                    var gather = MarkedComplex(result);
                                    id = '';
                                } else {
                                    var result = [];
                                    for (var key in data) {
                                        result.push({
                                            key: key,
                                            value: data[key]
                                        })
                                    }
                                }
                            }).catch(err => {
                                var result = [];
                                for (var key in data) {
                                    result.push({
                                        key: key,
                                        value: data[key]
                                    })
                                }
                            })
                        });
                    }
                    else if (id == "MarkedCustomPart") { //自定义查询
                        getFiledCfgXml(urlSearch, self).then(resXml => {
                            let lFiled = getNameNoIgnoreCase(resXml, "US_KEY", "1", true);
                            if (layerType == "container" || layerType == "container_og") {
                                searchType = "line";
                                tableType = '1';
                                // postDataParam = `service=${layerGuid}&qt=17&dt=${searchType}&pc=(and,equal,${lFiled},${key})&pg=0,10&encoding=utf-8&`;

                                postDataParam = {
                                    service: layerGuid,
                                    qt: 17,
                                    dt: searchType,
                                    pc: `(and,equal,${lFiled},${key})`,
                                    pg: '0,10',
                                    encoding: 'utf-8'
                                }
                            }
                            postDataQuery(postDataParam, gisServer).then(function (res) {
                                var json = self.$x2js.xml2js(res.data).Xml;
                                if (json && json.Result._num > 0) {
                                    var Record = json.Result.Record;
                                    Array.isArray(Record) || (Record = [Record]);
                                    var result = [];
                                    for (var key in Record[0]) {
                                        if (Record[0][key] && Record[0][key] != '') {
                                            let tempKey = getNameNoIgnoreCase1(resXml, key, tableType, false);

                                            result.push({
                                                key: tempKey,
                                                value: Record[0][key]
                                            })
                                        }
                                    }
                                    MarkedCustomPart(result)
                                    id = '';
                                } else {
                                    var result = [];
                                    for (var key in data) {
                                        result.push({
                                            key: key,
                                            value: data[key]
                                        })
                                    }
                                }
                            })
                        });
                    }
                }
            }

            if (pickSelf.timeoutVal) {
                clearInterval(pickSelf.timeoutVal)
                pickSelf.timeoutVal = null
              }
              pickSelf.timeoutVal = setInterval(function () {
                res.layer._highlight_objs = []
              }, STAMP_config.highLightTime)
        } else {
            if (id == "MarkedAngleAndLength") {
                var gather = MarkedAngleAndLength(result)
                callback(gather, id, this)
            }
        }
    }
    var clearLastObj = function () {
        if (self.stampAPI.lastObj.length > 0) {
            for (var i = 0; i < self.stampAPI.lastObj.length; ++i) {
                //self.stampAPI.lastObj[i]
                earth.document.elementRoot.detach_object(self.stampAPI.lastObj[i]);
            }
            self.stampAPI.lastObj = [];
        }
    }
    application._selectedEntityChanged.addEventListener(searchCallback);
    earth.OnRBClick = function () {

        application.pickingEnable = false;
        if (application._selectedEntityChanged._listeners && application._selectedEntityChanged._listeners.length > 0) {
            application._selectedEntityChanged.removeEventListener(searchCallback);
        }
        STAMP.menuConfig.menu[2].item[0].selected = false;
    }
    // 高程标注
    function lineLevel(data) {
        for (let i = 0; i < data.length; i++) {
            if (data[i].key === "SHAPE") {
                var coords = data[i].value.Polyline.Coordinates.split(",");
                var firstLon = coords[0];
                var firstLat = coords[1];
                var lastLon = coords[3];
                var lastLat = coords[4];
            }
            if (data[i].key == "起点高程") {
                var firstHeight = data[i].value
                var height1 = firstHeight.split(".", 3);
                var height1 = "起点标高:" + height1[0] + "." + height1[1].substring(0, 2) + "m";
            }
            if (data[i].key == "终点高程") {
                var lastHeight = data[i].value;
                var height2 = lastHeight.split(".", 3);
                var height2 = "终点高程:" + height2[0] + "." + height2[1].substring(0, 2) + "m";
            }
        }
        var firstPoint = StampGis.Cartesian3.fromDegrees(firstLon, firstLat, firstHeight);  //第一个点的坐标
        var lastPoint = StampGis.Cartesian3.fromDegrees(lastLon, lastLat, lastHeight);  //第二个点的坐标
        let options1 = {
            type: "createpoint",
            guid: createGuid(), //重新创建id
            visibility: true,
            points: firstPoint,
            name: height1,
            description: '',
            handleHeight: 2,
            handleLineColor: "#FFFFFF",
            highlightIconPath: "",
            iconPath: "",
            showHandle: true,
            textColor: "#FFFFFF",
            textScale: "1",
            visibleRange: "0,100",
        };
        let options2 = {
            type: "createpoint",
            guid: createGuid(),// 重新创建id
            visibility: true,
            points: lastPoint,
            name: height2,
            description: '',
            handleHeight: 2,
            handleLineColor: "#FFFFFF",
            highlightIconPath: "",
            iconPath: "",
            showHandle: true,
            textColor: "#FFFFFF",
            textScale: "1",
            visibleRange: "0,100",
        }
        let gather = [options1, options2]
        application.pickingEnable = false;
        let obj = {
            guid: createGuid(),
            name: '标高标注',
            children: [],
        }
        let obj1 = {
            guid: options1.guid,
            type: 'label',
            name: options1.name,
            visibility: true,
            options: options1
        }
        let obj2 = {
            guid: options2.guid,
            type: 'label',
            name: options2.name,
            visibility: true,
            options: options2
        }
        if (self.$store.state.labelData[0].children.length > 0) {

        }
        self.drawType = 'elementLabel';
        if (self.$store.state.labelData[0].children.length > 0) {
            for (let i = 0; i < self.$store.state.labelData[0].children.length; i++) {
                if (self.$store.state.labelData[0].children[i].name === '标高标注' && biaogao !== 1) {
                    self.$store.state.labelData[0].children[i].children.push(obj1)
                    self.$store.state.labelData[0].children[i].children.push(obj2)
                    self.$store.state.labelCheckData.push(options1.guid);
                    self.$store.state.labelCheckData.push(options2.guid);
                } else if (biaogao === 1) {
                    self.$store.state.labelData[0].children.push(obj)
                    self.$store.state.labelCheckData.push(options1.guid);
                    self.$store.state.labelCheckData.push(options2.guid);
                    biaogao++
                }
            }
        } else {
            biaogao++
            obj.children.push(obj1)
            obj.children.push(obj2)
            self.$store.state.labelData[0].children.push(obj)
            // self.$store.state.labelCheckData.push(obj.guid);
            self.$store.state.labelCheckData.push(options1.guid);
            self.$store.state.labelCheckData.push(options2.guid);
        }


        let icon1 = Mark.createElementPoint(self.stampAPI.usearth, options1);
        let icon2 = Mark.createElementPoint(self.stampAPI.usearth, options2);

        self.g_ElementData['elementLabel'].elementArr.push(
            icon1
        )
        self.g_ElementData['elementLabel'].elementArr.push(
            icon2
        )
        // self.g_ElementData['elementLabel'].elementArr.push(obj)
        localStorage.saveElementToDB(earth, self.drawType, self.$store.state.labelData);
        localStorage.saveElementToDB(earth, 'labelCheckData', self.$store.state.labelCheckData)
    }
    // 管径标注
    function pipeDiameter(data) {
        for (let i = 0; i < data.length; i++) {
            if (data[i].key === "SHAPE") {
                var coords = data[i].value.Polyline.Coordinates.split(",");
                var firstLon = coords[0];
                var firstLat = coords[1];
                var lastLon = coords[3];
                var lastLat = coords[4];
            }
            if (data[i].key == "管径") {
                var diam = data[i].value
                if (diam.indexOf('X') == -1) {
                    var diameter = "圆管管径:" + diam + "mm"
                } else {
                    var diameter = "方管管径:" + diam + "mm"
                }
            }
            if (data[i].key == "起点高程") {
                var firstHeight = data[i].value
            }
            if (data[i].key == "终点高程") {
                var lastHeight = data[i].value;
            }
        }
        var firstPoint = StampGis.Cartesian3.fromDegrees(firstLon, firstLat, firstHeight);  //第一个点的坐标
        let x1 = firstPoint.x
        let y1 = firstPoint.y
        let z1 = firstPoint.z
        var lastPoint = StampGis.Cartesian3.fromDegrees(lastLon, lastLat, lastHeight);  //第二个点的坐标
        let x2 = lastPoint.x;
        let y2 = lastPoint.y;
        let z2 = lastPoint.z;
        var coordPoint = {
            x: (x1 + x2) / 2,
            y: (y1 + y2) / 2,
            z: (z1 + z2) / 2,
        }
        let options = {
            type: "createpoint",
            guid: createGuid(), //重新创建id
            visibility: true,
            points: coordPoint,
            name: diameter,
            description: '',
            handleHeight: 2,
            handleLineColor: "#FFFFFF",
            highlightIconPath: "",
            iconPath: "",
            showHandle: true,
            textColor: "#FFFFFF",
            textScale: "1",
            visibleRange: "0,100",
        };
        application.pickingEnable = false;
        let obj = {
            guid: createGuid(),
            name: '管径标注',
            children: [],
        }
        let obj1 = {
            guid: options.guid,
            type: 'label',
            name: options.name,
            visibility: true,
            options
        }
        self.drawType = 'elementLabel';
        if (options) {
            if (self.$store.state.labelData[0].children.length > 0) {
                for (let i = 0; i < self.$store.state.labelData[0].children.length; i++) {
                    if (self.$store.state.labelData[0].children[i].name == "管径标注" && guanjin !== 1) {
                        self.$store.state.labelData[0].children[i].children.push(obj1)
                        self.$store.state.labelCheckData.push(options.guid);
                    } else if (guanjin === 1) {
                        guanjin++
                        self.$store.state.labelData[0].children.push(obj)
                    }
                }
            } else {
                guanjin++
                obj.children.push(obj1);
                self.$store.state.labelData[0].children.push(obj)
                self.$store.state.labelCheckData.push(options.guid);
            }
            let icon1 = Mark.createElementPoint(self.stampAPI.usearth, options);
            self.g_ElementData['elementLabel'].elementArr.push(
                icon1
            )
            localStorage.saveElementToDB(earth, self.drawType, self.$store.state.labelData);
            localStorage.saveElementToDB(earth, 'labelCheckData', self.$store.state.labelCheckData)
        }
    }
    // 埋深标注
    function roMarkedCoveringDepthtate(data) {
        for (let i = 0; i < data.length; i++) {
            if (data[i].key === "SHAPE") {
                var coords = data[i].value.Polyline.Coordinates.split(",");
                var firstLon = coords[0];
                var firstLat = coords[1];
                var lastLon = coords[3];
                var lastLat = coords[4];
            }
            if (data[i].key == "起点高程") {
                var firstHeight = data[i].value
            }
            if (data[i].key == "终点高程") {
                var lastHeight = data[i].value;
            }

            if (data[i].key == "起点埋深") {
                var originDepth = data[i].value
                var height1 = originDepth.split(".", 3);
                height1 = "起点埋深:" + height1[0] + "." + height1[1].substring(0, 2) + "m";
            }
            if (data[i].key == "终点埋深") {
                var destinationDepth = data[i].value;
                var height2 = destinationDepth.split(".", 3);
                height2 = "终点埋深:" + height2[0] + "." + height2[1].substring(0, 2) + "m";
            }
        }
        var firstPoint = StampGis.Cartesian3.fromDegrees(firstLon, firstLat, firstHeight);  //第一个点的坐标
        var lastPoint = StampGis.Cartesian3.fromDegrees(lastLon, lastLat, lastHeight);  //第二个点的坐标
        let options1 = {
            type: "createpoint",
            guid: createGuid(), //重新创建id
            visibility: true,
            points: firstPoint,
            name: height1,
            description: '',
            handleHeight: 3,
            handleLineColor: "#FFFFFF",
            highlightIconPath: "",
            iconPath: "",
            showHandle: true,
            textColor: "#FFFFFF",
            textScale: "1",
            visibleRange: "0,100",
        }
        let options2 = {
            type: "createpoint",
            guid: createGuid(), //重新创建id
            visibility: true,
            points: lastPoint,
            name: height2,
            description: '',
            handleHeight: 3,
            handleLineColor: "#FFFFFF",
            highlightIconPath: "",
            iconPath: "",
            showHandle: true,
            textColor: "#FFFFFF",
            textScale: "1",
            visibleRange: "0,100",
        }

        let gather = [options1, options2]
        application.pickingEnable = false;
        let obj = {
            guid: createGuid(),
            name: "埋深标注",
            children: [],
        }
        let obj1 = {
            guid: options1.guid,
            type: 'label',
            name: options1.name,
            visibility: true,
            options: options1
        }
        let obj2 = {
            guid: options2.guid,
            type: 'label',
            name: options2.name,
            visibility: true,
            options: options2
        }
        if (self.$store.state.labelData[0].children.length > 0) {
            for (let i = 0; i < self.$store.state.labelData[0].children.length; i++) {
                if (self.$store.state.labelData[0].children[i].name == '埋深标注' && maishen !== 1) {
                    self.$store.state.labelData[0].children[i].children.push(obj1)
                    self.$store.state.labelData[0].children[i].children.push(obj2)
                    self.$store.state.labelCheckData.push(options1.guid);
                    self.$store.state.labelCheckData.push(options2.guid);
                } else if (maishen === 1) {
                    maishen++
                    obj.children.push(obj1)
                    obj.children.push(obj2)
                    self.$store.state.labelData[0].children.push(obj)
                    self.$store.state.labelCheckData.push(options1.guid);
                    self.$store.state.labelCheckData.push(options2.guid);
                }
            }
        } else {
            maishen++
            obj.children.push(obj1)
            obj.children.push(obj2)
            self.$store.state.labelData[0].children.push(obj)
            // self.$store.state.labelCheckData.push(obj.guid);
            self.$store.state.labelCheckData.push(options1.guid);
            self.$store.state.labelCheckData.push(options2.guid);
        }
        let icon1 = Mark.createElementPoint(self.stampAPI.usearth, options1);
        let icon2 = Mark.createElementPoint(self.stampAPI.usearth, options2);

        self.g_ElementData['elementLabel'].elementArr.push(
            icon1
        )
        self.g_ElementData['elementLabel'].elementArr.push(
            icon2
        )
        localStorage.saveElementToDB(earth, 'elementLabel', self.$store.state.labelData);
        localStorage.saveElementToDB(earth, 'labelCheckData', self.$store.state.labelCheckData)
    }
    // 坐标标注
    function MarkedCoordinates(data) {
        for (let i = 0; i < data.length; i++) {
            if (data[i].key === "SHAPE") {
                var coords = data[i].value.Polyline.Coordinates.split(",");
                var firstLon = coords[0];
                var firstLat = coords[1];
                var lastLon = coords[3];
                var lastLat = coords[4];
                var coords2 = data[i].value.Polyline.OriCoordinates.split(",");
                var firstLon2 = coords2[0].split(".", 2);
                firstLon2 = "起点坐标:" + " " + firstLon2[0] + "." + firstLon2[1].substring(0, 2);
                var firstLat2 = coords2[1].split(".", 2);
                firstLat2 = firstLat2[0] + "." + firstLat2[1].substring(0, 2);
                var lastLon2 = coords2[3].split('.', 2);
                lastLon2 = "终点坐标:" + " " + lastLon2[0] + "." + lastLon2[1].substring(0, 2);
                var lastLat2 = coords2[4].split('.', 2);
                lastLat2 = lastLat2[0] + "." + lastLat2[1].substring(0, 2);
            }
            if (data[i].key == "起点高程") {
                var firstHeight = data[i].value
                var height1 = firstHeight.split(".", 3);
                height1 = height1[0] + "." + height1[1].substring(0, 2);
            }
            if (data[i].key == "终点高程") {
                var lastHeight = data[i].value;
                var height2 = lastHeight.split(".", 3);
                height2 = height2[0] + "." + height2[1].substring(0, 2);
            }
        }
        let originCoordinate = firstLon2 + "，" + " " + firstLat2 + "，" + " " + height1;
        let destinationCoordinate = lastLon2 + "，" + " " + lastLat2 + "，" + " " + height2;
        var firstPoint = StampGis.Cartesian3.fromDegrees(firstLon, firstLat, firstHeight);  //第一个点的坐标
        var lastPoint = StampGis.Cartesian3.fromDegrees(lastLon, lastLat, lastHeight);  //第二个点的坐标
        let options1 = {
            type: "createpoint",
            guid: createGuid(), //重新创建id
            visibility: true,
            points: firstPoint,
            name: originCoordinate,
            description: '',
            handleHeight: 2,
            handleLineColor: "#FFFFFF",
            highlightIconPath: "",
            iconPath: "",
            showHandle: true,
            textColor: "#FFFFFF",
            textScale: "1",
            visibleRange: "0,100",
        }
        let options2 = {
            type: "createpoint",
            guid: createGuid(), //重新创建id
            visibility: true,
            points: lastPoint,
            name: destinationCoordinate,
            description: '',
            handleHeight: 2,
            handleLineColor: "#FFFFFF",
            highlightIconPath: "",
            iconPath: "",
            showHandle: true,
            textColor: "#FFFFFF",
            textScale: "1",
            visibleRange: "0,100",
        }
        let gather = [options1, options2]
        application.pickingEnable = false;
        let obj = {
            guid: createGuid(),
            name: '坐标标注',
            children: [],
        }
        let obj1 = {
            guid: options1.guid,
            type: 'label',
            name: options1.name,
            visibility: true,
            options: options1
        }
        let obj2 = {
            guid: options2.guid,
            type: 'label',
            name: options2.name,
            visibility: true,
            options: options2
        }
        if (self.$store.state.labelData[0].children.length > 0) {
            for (let i = 0; i < self.$store.state.labelData[0].children.length; i++) {
                if (self.$store.state.labelData[0].children[i].name == '坐标标注' && zuobiao !== 1) {
                    self.$store.state.labelData[0].children[i].children.push(obj1)
                    self.$store.state.labelData[0].children[i].children.push(obj2)
                    self.$store.state.labelCheckData.push(options1.guid);
                    self.$store.state.labelCheckData.push(options2.guid);
                } else if (zuobiao === 1) {
                    zuobiao++
                    // obj.children.push(obj1)
                    // obj.children.push(obj2)
                    self.$store.state.labelData[0].children.push(obj)
                    self.$store.state.labelCheckData.push(options1.guid);
                    self.$store.state.labelCheckData.push(options2.guid);
                }
            }
        } else {
            zuobiao++
            obj.children.push(obj1)
            obj.children.push(obj2)
            self.$store.state.labelData[0].children.push(obj)
            // self.$store.state.labelCheckData.push(obj.guid);
            self.$store.state.labelCheckData.push(options1.guid);
            self.$store.state.labelCheckData.push(options2.guid);
        }
        let icon1 = Mark.createElementPoint(self.stampAPI.usearth, options1);
        let icon2 = Mark.createElementPoint(self.stampAPI.usearth, options2);

        self.g_ElementData['elementLabel'].elementArr.push(
            icon1
        )
        self.g_ElementData['elementLabel'].elementArr.push(
            icon2
        )
        localStorage.saveElementToDB(earth, 'elementLabel', self.$store.state.labelData);
        localStorage.saveElementToDB(earth, 'labelCheckData', self.$store.state.labelCheckData)
    }
    //坡度标注
    function MarkedSlope(data) {
        for (let i = 0; i < data.length; i++) {
            if (data[i].key === "SHAPE") {
                var coords = data[i].value.Polyline.Coordinates.split(",");
                var firstLon = coords[0]; //经纬度
                var firstLat = coords[1];
                var lastLon = coords[3];  //经纬度
                var lastLat = coords[4];

                // 全球坐标系
                var coords2 = data[i].value.Polyline.OriCoordinates.split(",");
                var firstLon2 = coords2[0];
                var firstLat2 = coords2[1];
                var lastLon2 = coords2[3];
                var lastLat2 = coords2[4];
            }
            if (data[i].key == "起点高程") {
                var firstHeight = data[i].value
                var height1 = firstHeight.split(".", 3);
                height1 = height1[0] + "." + height1[1].substring(0, 2);
            }
            if (data[i].key == "终点高程") {
                var lastHeight = data[i].value;
                var height2 = lastHeight.split(".", 3);
                height2 = height2[0] + "." + height2[1].substring(0, 2);
            }
        }
        // 创建标注的点位置
        var firstPoint = StampGis.Cartesian3.fromDegrees(firstLon, firstLat, firstHeight);  //第一个点的坐标
        let x1 = firstPoint.x
        let y1 = firstPoint.y
        let z1 = firstPoint.z
        var lastPoint = StampGis.Cartesian3.fromDegrees(lastLon, lastLat, lastHeight);  //第二个点的坐标
        let x2 = lastPoint.x;
        let y2 = lastPoint.y;
        let z2 = lastPoint.z;
        var coordPoint = {
            x: (x1 + x2) / 2,
            y: (y1 + y2) / 2,
            z: (z1 + z2) / 2,
        }
        // 计算坡度
        var x = Math.pow(Math.abs(firstLon2 - lastLon2), 2)
        var y = Math.pow(Math.abs(firstLat2 - lastLat2), 2)
        var z = Math.pow(Math.abs(firstHeight - lastHeight), 2)
        var spaceDis = Math.sqrt(x + y + z);
        var verDis = Math.abs(lastHeight - firstHeight);
        var slope = (180 * Math.asin(verDis / spaceDis) / Math.PI).toFixed(2);
        let options = {
            type: "createpoint",
            guid: createGuid(), //重新创建id
            visibility: true,
            points: coordPoint,
            name: "坡度：" + slope + "°\n" + "\n",
            description: '',
            handleHeight: 2,
            handleLineColor: "#FFFFFF",
            highlightIconPath: "",
            iconPath: "",
            showHandle: true,
            textColor: "#FFFFFF",
            textScale: "1",
            visibleRange: "0,100",
        };
        application.pickingEnable = false;
        let obj = {
            guid: createGuid(),
            name: '坡度标注',
            children: [],
        }
        let obj1 = {
            guid: options.guid,
            type: 'label',
            name: options.name,
            visibility: true,
            options: options
        }
        if (options) {
            if (self.$store.state.labelData[0].children.length > 0) {
                for (let i = 0; i < self.$store.state.labelData[0].children.length; i++) {
                    if (self.$store.state.labelData[0].children[i].name == "坡度标注" && podu !== 1) {
                        self.$store.state.labelData[0].children[i].children.push(obj1)
                        self.$store.state.labelCheckData.push(options.guid);
                    } else if (podu === 1) {
                        podu++
                        self.$store.state.labelData[0].children.push(obj)
                    }
                }
            } else {
                podu++
                obj.children.push(obj1);
                self.$store.state.labelData[0].children.push(obj)
                self.$store.state.labelCheckData.push(options.guid);
            }
            let icon1 = Mark.createElementPoint(self.stampAPI.usearth, options);
            self.g_ElementData['elementLabel'].elementArr.push(
                icon1
            )
            localStorage.saveElementToDB(earth, "elementLabel", self.$store.state.labelData);
            localStorage.saveElementToDB(earth, 'labelCheckData', self.$store.state.labelCheckData)
        }
    }
    // 弯头标注
    function MarkedCurvedAngle(data) {
        let point = [];
        let angle = '';
        let height = '';
        for (let i = 1; i < data.length; i++) {
            if (data[i].key === 'surf_h') {
                let temp = data[i].value.split(".");
                height = temp[0] + "." + temp[1].substring(0, 2);

            }
            if (data[i].key === "SHAPE" || data[i].key === "shape") {
                let coordinatePoint1 = data[i].value.Point.Coordinates.split(",")
                point.push(StampGis.Cartesian3.fromDegrees(coordinatePoint1[0], coordinatePoint1[1], height));
            }
            if (data[i].key === "angle") {
                let temp = data[i].value.split(".");
                angle = temp[0];
            }
        }
        let options = {
            type: "createpoint",
            guid: createGuid(), //重新创建id
            visibility: true,
            points: point[0],
            name: "角度值:" + angle + "°",
            description: '',
            handleHeight: 3,
            handleLineColor: "#FFFFFF",
            highlightIconPath: "",
            iconPath: "",
            showHandle: true,
            textColor: "#FFFFFF",
            textScale: "1",
            visibleRange: "0,200",
        };
        application.pickingEnable = false;
        let obj = {
            guid: createGuid(),
            name: '弯头标注',
            children: [],
        }
        let obj1 = {
            guid: options.guid,
            type: 'label',
            name: options.name,
            visibility: true,
            options: options
        }
        if (self.$store.state.labelData[0].children.length > 0) {
            for (let i = 0; i < self.$store.state.labelData[0].children.length; i++) {
                if (self.$store.state.labelData[0].children[i].name == "弯头标注" && wantou !== 1) {
                    self.$store.state.labelData[0].children[i].children.push(obj1)
                    self.$store.state.labelCheckData.push(options.guid);
                } else if (wantou === 1) {
                    wantou++
                    self.$store.state.labelData[0].children.push(obj)
                }
            }
        } else {
            wantou++
            obj.children.push(obj1);
            self.$store.state.labelData[0].children.push(obj)
            self.$store.state.labelCheckData.push(options.guid);
        }
        let icon1 = Mark.createElementPoint(self.stampAPI.usearth, options);
        self.g_ElementData['elementLabel'].elementArr.push(
            icon1
        )
        localStorage.saveElementToDB(earth, "elementLabel", self.$store.state.labelData);
        localStorage.saveElementToDB(earth, 'labelCheckData', self.$store.state.labelCheckData)
    }
    // 扯旗标注
    var MarkedComplex = function (data) {
    }
    var MarkedCustomPart = function (data) {  //自定义标注
        var Pipeline = [];
        var array = [];

        for (let i = 0; i < data.length; i++) {
            if (data[i].key === "SHAPE") {
                var coords = data[i].value.Polyline.Coordinates.split(",");
                var firstLon = coords[0]; //经纬度
                var firstLat = coords[1];
                var lastLon = coords[3];  //经纬度
                var lastLat = coords[4];

                // 全球坐标系
                var coords2 = data[i].value.Polyline.OriCoordinates.split(",");
                var firstLon2 = coords2[0];
                var firstLat2 = coords2[1];
                var lastLon2 = coords2[3];
                var lastLat2 = coords2[4];
            }
            if (data[i].key == "prjidsnode") {
                var prjidsnode = data[i].value;
            }
            if (data[i].key == "prjidenode") {
                let prjidenode = data[i].value;
                Pipeline.push({
                    key: '唯一编号',
                    value: prjidsnode + ',' + prjidenode,
                    isCheck: false,
                })
            }
            if (data[i].key == "起点高程") {
                var firstHeight = data[i].value
                let height1 = firstHeight.split(".", 3);
                height1 = height1[0] + "." + height1[1].substring(0, 2);
                Pipeline.push({
                    key: data[i].key,
                    value: height1,
                    isCheck: false,
                })  //起点高程

            }
            if (data[i].key == "终点高程") {
                var lastHeight = data[i].value;
                var height2 = lastHeight.split(".", 3);
                height2 = height2[0] + "." + height2[1].substring(0, 2);
                Pipeline.push({
                    key: data[i].key,
                    value: height2,
                    isCheck: false,
                })

            }
            if (data[i].key === '起点编号') {
                Pipeline.push({
                    key: data[i].key,
                    value: data[i].value,
                    isCheck: false,
                })  //起点编号
            }
            if (data[i].key === '终点编号') {
                Pipeline.push({
                    key: data[i].key,
                    value: data[i].value,
                    isCheck: false,
                })  //终点编号
            }
            if (data[i].key === '起点埋深') {
                var lastHeight = data[i].value;
                var height3 = lastHeight.split(".", 3);
                height3 = height3[0] + "." + height3[1].substring(0, 2);
                Pipeline.push({
                    key: data[i].key,
                    value: height3,
                    isCheck: false,
                })  //起点埋深
            }
            if (data[i].key === '终点埋深') {
                var lastHeight = data[i].value;
                var height4 = lastHeight.split(".", 3);
                height4 = height4[0] + "." + height4[1].substring(0, 2);
                Pipeline.push({
                    key: data[i].key,
                    value: height4,
                    isCheck: false,
                })  //终点埋深
            }
            if (data[i].key === '材质') {
                Pipeline.push({
                    key: data[i].key,
                    value: data[i].value,
                    isCheck: false,
                })  //终点埋深
            }
            if (data[i].key === '管径') {
                var diam = data[i].value
                if (diam.indexOf('X') == -1) {
                    var diameter = "圆管管径:" + diam + "mm"
                } else {
                    var diameter = "方管管径:" + diam + "mm"
                }
                Pipeline.push({
                    key: data[i].key,
                    value: diameter,
                    isCheck: false,
                })  //终点埋深
            }

        }

        self.$store.state.PipelineInformation = Pipeline;
        self.$store.state.isShow = !isShow;
        // 创建标注的点位置
        let firstPoint = StampGis.Cartesian3.fromDegrees(firstLon, firstLat, firstHeight);  //第一个点的坐标
        let x1 = firstPoint.x
        let y1 = firstPoint.y
        let z1 = firstPoint.z
        let lastPoint = StampGis.Cartesian3.fromDegrees(lastLon, lastLat, lastHeight);  //第二个点的坐标
        let x2 = lastPoint.x;
        let y2 = lastPoint.y;
        let z2 = lastPoint.z;
        let coordPoint = {  //显示位置
            x: (x1 + x2) / 2,
            y: (y1 + y2) / 2,
            z: (z1 + z2) / 2,
        }
        let options = {
            type: "createpoint",
            guid: createGuid(), //重新创建id
            visibility: true,
            points: coordPoint,
            name: '自定义',  //需要填
            description: '',
            handleHeight: 2,
            handleLineColor: "#FFFFFF",
            highlightIconPath: "",
            iconPath: "",
            showHandle: true,
            textColor: "#FFFFFF",
            textScale: "1",
            visibleRange: "0,100",
            create: true,
        };
        self.$store.state.options = options;
        application.pickingEnable = false;
    }

}
export default PickLabel