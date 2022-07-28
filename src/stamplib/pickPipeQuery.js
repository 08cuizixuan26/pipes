import { postDataQuery, getFiledCfgXml, getNameNoIgnoreCase } from '@/api/query'

function pipckPipeQuery(_self, _callback) {
    let self = _self;
    let callback = _callback;
    let earth = self.stampAPI.usearth;
    let application = earth.application;
    let pickLayer = null;
    if (
        application._selectedEntityChanged._listeners &&
        application._selectedEntityChanged._listeners.length > 0
    ) {
        application._selectedEntityChanged._listeners.length = 0;
    }
    application.pickingEnable = true
    this.usearth = earth
    let index = 0

    let pipeObj1 = null
    let pipeObj2 = null

    if (this.searchCallback) {
        application._selectedEntityChanged.removeEventListener(this.searchCallbackch);
        searchCallback = null;
    }
    this.searchCallback = function (result) {
        application._selectedEntity = undefined
        // console.log(result, 'result')
        if (!result) {
            return
        }
        let res = result[0];
        pickLayer = res.layer;
        if (res.layer) {
            self.stampAPI.lastLayer = res.layer
            const guid = res.layer._id;
            if (guid.indexOf("container") < 0) {
                self.$message({
                    message: '选择对象为非管段，请重新选择!',
                    type: 'warning'
                })
                if (res.layer._layer) {
                    res.layer._layer._highlight_objs = []
                } else {
                    res.layer._highlight_objs = []
                }
                return
            }
            if (res.layer._rtti == '104') {
                if (index == 0) {
                    if (res.properties && res.properties.properties) {
                        let key = res.properties.properties.Key;
                        let layerId = res.layer._id;
                        let layerGuid = layerId.split('_')[0];
                        let layerType = layerId.split('_')[1];
                        let gisServer = res.layer._gis_server_connection;
                        let searchType = 'line';
                        let postDataParam = '';
                        const urlSearch = self.g_Project.FieldMap
                        if (urlSearch == "") {
                            self.$message({
                                message: '当前工程没有管线配置信息',
                                type: 'warning',
                            })
                            return
                        }
                        getFiledCfgXml(urlSearch, self).then(resXml => {
                            const lFiled = getNameNoIgnoreCase(resXml, 'US_KEY', '1', true)
                            if (layerType == 'container') {
                                searchType = 'line'
                                // postDataParam = `service=${layerGuid}&qt=17&dt=${searchType}&pc=(and,equal,${lFiled},${key})&pg=0,10&encoding=utf-8&`

                                postDataParam = {
                                    service: layerGuid,
                                    qt: 17,
                                    dt: searchType,
                                    pc: `(and,equal,${lFiled},${key})`,
                                    pg: '0,10',
                                    encoding: 'utf-8'
                                }
                                postDataQuery(postDataParam, gisServer).then(function (res) {
                                    var json = self.$x2js.xml2js(res.data).Xml
                                    // console.log(json, "JSON")
                                    if (json && json.Result._num == 1) {
                                        var Record = json.Result.Record

                                        const detectMethod = resXml.PipelineFieldMap.DetectMethod
                                        let deepFormat = '1'
                                        const deepList = resXml.PipelineFieldMap.PipelineDeep.DeepFieldMapList.PipelineTypeField

                                        if (deepList) {
                                            Array.isArray(deepList) || (deepList = [deepList])
                                            for (let i = 0; i < deepList.length; i++) {
                                                if (deepList[i]._PipeCode == Record.symbolnum) {
                                                    deepFormat = deepList[i]._PipeDeepFormat
                                                    break
                                                }
                                            }
                                        }

                                        const dsField = getNameNoIgnoreCase(resXml, 'US_SIZE', '1', true)
                                        const ds = Record[dsField.toLowerCase()].toLowerCase()

                                        pipeObj1 = { detectMethod: detectMethod, deepFormat: deepFormat, ds: ds }

                                        if (detectMethod == '0') {
                                            const sdeepField = getNameNoIgnoreCase(resXml, 'US_SDEEP', '1', true)
                                            const edeepField = getNameNoIgnoreCase(resXml, 'US_EDEEP', '1', true)
                                            const sdeep = Record[sdeepField.toLowerCase()]
                                            const edeep = Record[edeepField.toLowerCase()]
                                            pipeObj1.start = sdeep
                                            pipeObj1.end = edeep
                                        } else {
                                            const sheightField = getNameNoIgnoreCase(resXml, 'US_SALT', '1', true)
                                            const eheightField = getNameNoIgnoreCase(resXml, 'US_EALT', '1', true)
                                            const sheight = Record[sheightField.toLowerCase()]
                                            const eheight = Record[eheightField.toLowerCase()]

                                            pipeObj1.start = sheight
                                            pipeObj1.end = eheight
                                        }

                                        if (Record.SHAPE) {
                                            if (Record.SHAPE.Polyline) {
                                                const coorArr1 = Record.SHAPE.Polyline.Coordinates.split(',')
                                                pipeObj1.coorArr = coorArr1
                                                pipeObj1.layerGuid = guid
                                                index++
                                            }
                                        }
                                    }
                                })
                            }
                        })
                    }
                } else if (index == 1) {
                    if (res.properties && res.properties.properties) {
                        let key = res.properties.properties.Key
                        let layerId = res.layer._id;
                        let layerGuid = layerId.split("_")[0];
                        let layerType = layerId.split('_')[1];
                        let gisServer = res.layer._gis_server_connection;
                        let searchType = 'line';
                        let postDataParam = "";

                        const urlSearch = self.g_Project.FieldMap
                        if (urlSearch == "") {
                            self.$message({
                                message: '当前工程没有管线配置信息',
                                type: "warning"
                            })
                            return
                        }
                        getFiledCfgXml(urlSearch, self).then(resXml => {
                            const lFiled = getNameNoIgnoreCase(resXml, "US_KEY", "1", true)
                            if (layerType == "container") {
                                searchType = 'line'
                                // postDataParam = `service=${layerGuid}&qt=17&dt=${searchType}&pc=(and,equal,${lFiled},${key})&pg=0,10&encoding=utf-8&`
                                postDataParam = {
                                    service: layerGuid,
                                    qt: 17,
                                    dt: searchType,
                                    pc: `(and,equal,${lFiled},${key})`,
                                    pg: '0,10',
                                    encoding: 'utf-8'
                                }
                                postDataQuery(postDataParam, gisServer).then(function (res) {
                                    let json = self.$x2js.xml2js(res.data).Xml
                                    if (json && json.Result._num == 1) {
                                        let Record = json.Result.Record
                                        const detectMethod = resXml.PipelineFieldMap.DetectMethod
                                        let deepFormat = '1'
                                        const deepList = resXml.PipelineFieldMap.PipelineDeep.DeepFieldMapList.PipelineTypeField

                                        if (deepList) {
                                            Array.isArray(deepList) || (deepList = [deepList])
                                            for (let i = 0; i < deepList.length; i++) {
                                                if (deepList[i]._PipeCode == Record.symbolnum) {
                                                    deepFormat = deepList[i]._PipeDeepFormat
                                                    break
                                                }
                                            }
                                        }

                                        const dsField = getNameNoIgnoreCase(resXml, 'US_SIZE', '1', true)
                                        const ds = Record[dsField.toLowerCase()].toLowerCase()

                                        pipeObj2 = { detectMethod: detectMethod, deepFormat: deepFormat, ds: ds }

                                        if (detectMethod == '0') {
                                            const sdeepField = getNameNoIgnoreCase(resXml, 'US_SDEEP', '1', true)
                                            const edeepField = getNameNoIgnoreCase(resXml, 'US_EDEEP', '1', true)
                                            const sdeep = Record[sdeepField.toLowerCase()]
                                            const edeep = Record[edeepField.toLowerCase()]
                                            pipeObj2.start = -Number(sdeep)
                                            pipeObj2.end = -Number(edeep)
                                        } else {
                                            const sheightField = getNameNoIgnoreCase(resXml, 'US_SALT', '1', true)
                                            const eheightField = getNameNoIgnoreCase(resXml, 'US_EALT', '1', true)
                                            const sheight = Record[sheightField.toLowerCase()]
                                            const eheight = Record[eheightField.toLowerCase()]

                                            pipeObj2.start = Number(sheight)
                                            pipeObj2.end = Number(eheight)
                                        }

                                        if (Record.SHAPE) {
                                            if (Record.SHAPE.Polyline) {
                                                const coorArr2 = Record.SHAPE.Polyline.Coordinates.split(',')
                                                pipeObj2.coorArr = coorArr2
                                                pipeObj2.layerGuid = guid
                                                index = 0
                                            }
                                        }
                                        // console.log(pipeObj1, 'pipeObj1')
                                        // console.log(pipeObj2, 'pipeObj2')
                                        callback(pipeObj1, pipeObj2)
                                    }
                                })
                            }
                        })
                    }
                    setTimeout(() => {
                        res.layer._highlight_objs = []
                    }, 6000);
                }
            } else {
                if (res.layer._layer) {
                    res.layer._layer._highlight_objs = []
                } else {
                    res.layer._highlight_objs = []
                }
            }
        }
        // alert('管线距离')
    }

    application._selectedEntityChanged.addEventListener(this.searchCallback)

    this.cancelPickQuery = function () {
        if (pickLayer) {
            if (pickLayer._layer) {
                pickLayer._layer._highlight_objs = []
            } else {
                pickLayer._highlight_objs = []
            }
        }

        this.usearth.application.pickingEnable = false
        if (this.usearth.application._selectedEntityChanged._listeners && this.usearth.application._selectedEntityChanged._listeners.length > 0) {
            this.usearth.application._selectedEntityChanged.removeEventListener(this.searchCallback)
        }
    }
}

export default pipckPipeQuery