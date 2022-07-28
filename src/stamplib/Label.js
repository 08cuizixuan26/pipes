import { createGuid } from "@/utils"
import localStorage from "@/stamplib/LocalStorage";
import { getPipeline, getFiledCfgXml, getNameNoIgnoreCase } from "@/api/query";
import { DownloadFileWithoutIp } from "@/api/common";
import Mark from "@/stamplib/Mark";  //创建点的方法
let zhiqi = 1;
let shuandian = 1;
function Label(earth, vueObj) {

    var vueObg = vueObj
    var textStr = "";
    this.MarkedElevation = function () { //高程标注

    }
    this.MarkedDiameter = function () {//管径标注
    }
    this.roMarkedCoveringDepthtate = function () { //埋深标注

    }
    this.MarkedCoordinates = function () {  //坐标标注

    }
    this.MarkedSlope = function () {  //坡度标注

    }
    this.MarkedCurvedAngle = function () {  //弯头标绘

    }
    this.MarkedAngleAndLength = function (divObj, pointTag) { //栓点标注
        points.length = 0
        AngleAndLengthMark(divObj, pointTag,);
    }
    this.MarkedComplex = function (divObj, pointTag, self) { //扯旗标注  
        var OnCreateGeometry = function (p, t) {
            var p1 = StampGis.Cartographic.fromCartesian(p.data[0]) //全球转经纬度
            var p2 = StampGis.Cartographic.fromCartesian(p.data[1]) //全球转经纬度
            p1 = {
                Longitude: StampGis.StampMath.toDegrees(p1.longitude),
                Latitude: StampGis.StampMath.toDegrees(p1.latitude),
                Altitude: p1.height
            }
            p2 = {
                Longitude: StampGis.StampMath.toDegrees(p2.longitude),
                Latitude: StampGis.StampMath.toDegrees(p2.latitude),
                Altitude: p2.height
            }
            var markedName = "扯旗";
            var complexParam = {
                id: null,
                name: markedName,
                visibility: true,
                p1: p1,
                p2: p2,
                text: null
            };
            createMarkedComplex(complexParam, true, p1, p2, divObj, markedName, self);

        }
        earth.ShapeCreator.CreateLine({
            custom_excute_finish: function (result) {
                OnCreateGeometry(result)
                earth.ShapeCreator.Clear();
            },
        });


    }
    this.MarkedCustomPart = function () { }//自定义标注
    this.MarkedManagement = function () { }//标绘管理面板
    var points = [];
    function AngleAndLengthMark(divObj, pointTag) {
        var spaialUrl = vueObg.g_Project.SpatialReference  //获取空间参考
        DownloadFileWithoutIp(spaialUrl, "arraybuffer").then(res => {
            var OnCreateGeometry = function (p, t) {
                if (!p.data) {
                    return
                }
                points.push(p.data);
                OnCreateGeometry = function () { };
                var OnRBDown = function () { };
                if (points.length === 2) {

                    var circleInfo = StampGis.Cartographic.fromCartesian(points[0]) //全球转经纬度
                    var circleInfo1 = StampGis.Cartographic.fromCartesian(points[1]) //全球转经纬度
                    let xyz1 = {
                        x: StampGis.StampMath.toDegrees(circleInfo.longitude),
                        y: StampGis.StampMath.toDegrees(circleInfo.latitude),
                        z: circleInfo.height
                    }
                    let xyz2 = {
                        x: StampGis.StampMath.toDegrees(circleInfo1.longitude),
                        y: StampGis.StampMath.toDegrees(circleInfo1.latitude),
                        z: circleInfo1.height
                    }
                    var array_data = res.data
                    var option = {
                        array: array_data,
                    }
                    vueObg.$_Datum = vueObg.stampAPI.usearth.Factory.CreateDatum(option)
                    var mVec = vueObg.$_Datum.des_BLH_to_src_xy(
                        xyz1.x,
                        xyz1.y,
                        xyz1.z,
                    )
                    var mVec1 = vueObg.$_Datum.des_BLH_to_src_xy(
                        xyz2.x,
                        xyz2.y,
                        xyz2.z,
                    )
                    var lengthC = Math.sqrt(
                        (mVec.x - mVec1.x) * (mVec.x - mVec1.x) +
                        (mVec.y - mVec1.y) * (mVec.y - mVec1.y)
                    )
                    var lengthB = Math.sqrt(
                        (mVec1.x - mVec.x) * (mVec1.x - mVec.x) +
                        (mVec1.y - mVec.y) * (mVec1.y - mVec.y)
                    )
                    // 长度
                    lengthC = parseFloat(lengthC.toFixed(2));//保留2位小数位
                    var firstLon = points[0].x
                    var firstLat = points[0].y
                    var firstHeight = points[0].z
                    var lastLon = points[1].x
                    var lastLat = points[1].y
                    var lastHeight = points[1].z
                    var x = Math.pow(Math.abs(firstLon - lastLon), 2)
                    var y = Math.pow(Math.abs(firstLat - lastLat), 2)
                    var z = Math.pow(Math.abs(firstHeight - lastHeight), 2)
                    var spaceDis = Math.sqrt(x + y + z);
                    var verDis = Math.abs(lastHeight - firstHeight);
                    var slope = (180 * Math.asin(verDis / spaceDis) / Math.PI).toFixed(2);
                    var firstPoint = StampGis.Cartesian3.fromDegrees(xyz2.x, xyz2.y, xyz2.z);  //第一个点的坐标
                    var strText = `长度:${lengthC}m@坡度:${slope}`;
                    let options = {
                        type: "createpoint",
                        guid: createGuid(), //重新创建id
                        visibility: true,
                        points: firstPoint,
                        name: strText,
                        description: '',
                        handleHeight: 0,
                        handleLineColor: "#FFFFFF",
                        highlightIconPath: "",
                        iconPath: "",
                        showHandle: true,
                        textColor: "#FFFFFF",
                        textScale: "1",
                        visibleRange: "0,100",
                        create: true,
                    };
                    //创建线
                    var lineObj = {
                        guid: createGuid(),  //唯一的id
                        visibility: true, //是否显示线
                        lineWidth: 2,  //线宽
                        lineColor: '#ff2323', //线的颜色
                        lineColorTransparent: 255, //
                        AltitudeType: 5,
                        name: strText, //名字
                        points: clonePoints(points), //两个点的坐标
                    };
                    var line = Mark.createElementLine(earth, lineObj, line);
                    vueObg.g_ElementData['elementLabel'].elementArr.push(
                        line
                    )

                    let obj = {
                        guid: createGuid(),
                        name: '栓点标注',
                        children: [],
                    }
                    let obj1 = {
                        guid: options.guid,
                        type: 'label',
                        name: '栓点',
                        visibility: true,
                        options,
                        lineObj,
                    }
                    if (vueObg.$store.state.labelData[0].children.length > 0) {
                        for (let i = 0; i < vueObg.$store.state.labelData[0].children.length; i++) {
                            if (vueObg.$store.state.labelData[0].children[i].name == "栓点标注" && shuandian !== 1) {
                                vueObg.$store.state.labelData[0].children[i].children.push(obj1)
                                vueObg.$store.state.labelCheckData.push(options.guid);
                            } else if (shuandian === 1) {
                                shuandian++
                                vueObg.$store.state.labelData[0].children.push(obj)
                            }
                        }
                    } else {
                        shuandian++
                        obj.children.push(obj1);
                        vueObg.$store.state.labelData[0].children.push(obj)
                        vueObg.$store.state.labelCheckData.push(options.guid);
                    }

                    let icon = Mark.createElementPoint1(earth, options);
                    vueObg.g_ElementData['elementLabel'].elementArr.push(
                        icon
                    )
                    localStorage.saveElementToDB(earth, 'elementLabel', vueObg.$store.state.labelData);
                    localStorage.saveElementToDB(earth, 'labelCheckData', vueObg.$store.state.labelCheckData)
                    if (points.length == 2) {
                        points.splice(1, 1)
                    }
                }
                AngleAndLengthMark(pointTag);

            };
            earth.ShapeCreator.CreatePoint({
                custom_excute_finish: function (result) {
                    OnCreateGeometry(result);
                }
            })
        })

    }
    function clonePoints(points) {
        if (Array.isArray(points)) {
            return points.map(item => {
                return StampGis.Cartesian3.fromArray([item.x, item.y, item.z])
            })
        }
    }
    function createMarkedComplex(dataParam, w, p1, p2, divObj, markedName, self) {
        var markText = dataParam.text;
        var spatial = "," + p1.Longitude + "," + p1.Latitude + "," + p1.Altitude + ",";
        spatial = spatial + p2.Longitude + "," + p2.Latitude + "," + p2.Altitude;
        //text = this.getMarkedComplexText(spatial);
        if (markText == null) {
            textStr = "管线名称, 管径, 材质类型, 起点埋深, 终点埋深";
        } else {
            textStr = markText;
        }
        var urlList = [];

        var PIPELINELAYERS = self.$store.state.pipelineLayerData[0].children[0].children;

        for (var i = 0; i < PIPELINELAYERS.length; i++) {
            var layer = earth.LayerManager.GetLayerByGUID(PIPELINELAYERS[i].id);
            var pipeName = PIPELINELAYERS[i].name;
            //管线搜寻
            var searchUrl = `${layer._gis_server_connection}/pipeline?rt=transect&service=${PIPELINELAYERS[i].id};`
            searchUrl = searchUrl + "&aparam=0" + spatial;
            urlList.push({
                "url": searchUrl,
                "pipeName": pipeName,
            });
        }
        sendMarkService(urlList, markText, dataParam, w, p1, p2, divObj, markedName, self)
    }
    function sendMarkService(urlList, markText, dataParam, w, p1, p2, divObj, markedName, _self) {
        if (markText == null) { //如果text为null说明是创建扯旗标注，则要查询所有的管线获取text信息；如果text不为null说明是还原扯旗标注，则不用再进行查询
            if (urlList) {
                var tempArr = urlList.shift();
                let urlSearch = _self.g_Project.FieldMap;
                var postDataParam = "";
                getFiledCfgXml(urlSearch, _self).then(function (resXml) {
                    let lFiled = getNameNoIgnoreCase(resXml, "US_KEY", "1", true);
                    var us_size = getNameNoIgnoreCase(resXml, "US_SIZE", 1, true);
                    var us_pmater = getNameNoIgnoreCase(resXml, "US_PMATER", 1, true);
                    var us_sdeep = getNameNoIgnoreCase(resXml, "US_SDEEP", 1, true);
                    var us_edeep = getNameNoIgnoreCase(resXml, "US_EDEEP", 1, true);
                    var aparam = tempArr.url.split(';&aparam=')
                    var service = aparam[0].split('&service=')
                    postDataParam = {
                        rt: 'transect',
                        service: service[1],
                        aparam: aparam[1]
                    }

                    var layer = earth.LayerManager.GetLayerByGUID(service[1]);
                    getPipeline(postDataParam, layer._gis_server_connection).then(function (res) {
                        var json = _self.$x2js.xml2js(res.data).Xml;
                        if (json && json.TransectResult._num > 0) {
                            var Record = json.TransectResult.Record;
                            Array.isArray(Record) || (Record = [Record]);
                            var result = [];
                            for (var k = 0; k < Record.length; k++) {
                                var diameter = parseFloat(Record[k][us_size]) || Record[k][us_size.toLowerCase()]
                                var materialId = Record[k][us_pmater] || Record[k][us_pmater.toLowerCase]
                                var material = materialId
                                var startDeep = parseFloat(Record[k][us_sdeep] || Record[k][us_sdeep.toLowerCase()]);
                                var endDeep = parseFloat(Record[k][us_edeep] || Record[k][us_edeep.toLowerCase()]);
                                textStr = `${textStr}@${tempArr.pipeName},${diameter}mm,${material},${startDeep.toFixed(2)}m,${endDeep.toFixed(2)}m`;
                            }
                        }
                        if (urlList.length == 0) {
                            addMarkedComplex(p1, p2, textStr, _self);
                            // markText = '1'
                        }
                        if (urlList.length != 0) {
                            sendMarkService(urlList, markText, dataParam, w, p1, p2, divObj, markedName, _self);
                        }
                    })
                });
            }
        }
        if (markText != null) {
            addMarkedComplex(p1, p2, textStr, _self);
        }

    }
    function addMarkedComplex(p1, p2, textStr, self) {
        let height = Math.max(p2.Altitude,p1.Altitude);
        let firstPoint = StampGis.Cartesian3.fromDegrees(p2.Longitude, p2.Latitude, height);
        let secondPoint = StampGis.Cartesian3.fromDegrees(p1.Longitude, p1.Latitude, height);
        let options = {
            type: "createpoint",
            guid: createGuid(),// 重新创建id
            visibility: true,
            points: firstPoint,
            name: textStr,
            description: '',
            handleHeight: 6,
            handleLineColor: "#FFFFFF",
            highlightIconPath: "",
            iconPath: "",
            showHandle: true,
            textColor: "#FFFFFF",
            textScale: "1",
            visibleRange: "0,100",
            create: true,
            p1: p1,
            p2: p2
        }
        let obj = {
            guid: createGuid(),
            name: '扯旗标注',
            children: []
        }
        var retData = [firstPoint, secondPoint];
        var lineObj = Mark.createElementLineByPoints(earth, retData);
        lineObj.set_altitude_type(1)
        earth.document.elementRoot.attach_object(lineObj)
        earth.document.register_object(lineObj)
        let obj1 = {
            guid: options.guid,
            type: 'label',
            name: '扯旗',  //options.name
            visibility: true,
            options,
            guidArr: [options.guid, lineObj.get_guid()]
        }
        if (self.$store.state.labelData[0].children.length > 0) {
            for (let i = 0; i < self.$store.state.labelData[0].children.length; i++) {
                if (self.$store.state.labelData[0].children[i].name == "扯旗标注" && zhiqi !== 1) {
                    self.$store.state.labelData[0].children[i].children.push(obj1)
                    self.$store.state.labelCheckData.push(options.guid);
                } else if (zhiqi === 1) {
                    zhiqi++
                    self.$store.state.labelData[0].children.push(obj)
                }
            }
        } else {
            zhiqi++
            obj.children.push(obj1);
            self.$store.state.labelData[0].children.push(obj)
            self.$store.state.labelCheckData.push(options.guid);
        }
        
        let icon = Mark.createElementPoint1(earth, options);
        self.g_ElementData['elementLabel'].elementArr.push(icon)
        self.g_ElementData['elementLabel'].elementArr.push(lineObj)
        localStorage.saveElementToDB(earth, 'elementLabel', self.$store.state.labelData);
        localStorage.saveElementToDB(earth, 'labelCheckData', self.$store.state.labelCheckData)
    }
}



export default Label