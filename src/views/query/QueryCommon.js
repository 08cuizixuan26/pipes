import { postDataQuery, postSearch, getFiledCfgXml, getValueCfgXml } from "@/api/query";
import { deepCopy } from "@/utils";
import ExcelJS from "exceljs";
import * as FileSaver from "file-saver";

export function getPipeList(self, item) {
    for (let i = 0; i < item.length; i++) {
        let layer = self.stampAPI.usearth.LayerManager.GetLayerByGUID(
            item[i].id
        );
        if (!layer && item[i].children) {
            getPipeList(self, item[i].children);
        } else if (layer) {
            self.layerList.push({
                id: item[i].id,
                name: item[i].name,
            });
        }
    }
}

export function getTableHeader(self) {
    // let urlSearch =
    //     "http://192.168.100.73/sde?/data/stamp_data/xuzhou/xz_pipeline/resource/config/FieldMap.config_sde";

    let urlSearch = self.g_Project.FieldMap;
    getFiledCfgXml(urlSearch, self).then((res) => {
        if (
            res.PipelineFieldMap &&
            res.PipelineFieldMap.LineFieldInfo &&
            res.PipelineFieldMap.LineFieldInfo.SystemFieldList &&
            res.PipelineFieldMap.LineFieldInfo.SystemFieldList.FieldMapItem
        ) {
            var data =
                res.PipelineFieldMap.LineFieldInfo.SystemFieldList
                    .FieldMapItem;
            Array.isArray(data) || (data = [data]);
            for (let i = 0; i < data.length; i++) {
                if (data[i]._FieldName) {
                    self.tableHeader.line.push({
                        name: data[i]._FieldName.toLowerCase(),
                        label: data[i]._CaptionName,
                        standard: data[i]._StandardName
                    });

                    if (self.field && self.typeId == 'line' && data[i]._StandardName == self.field) {
                        self.field = data[i]._FieldName.toLowerCase()
                    }
                }
            }
        }
        if (
            res.PipelineFieldMap &&
            res.PipelineFieldMap.LineFieldInfo &&
            res.PipelineFieldMap.LineFieldInfo.CustomerFieldList &&
            res.PipelineFieldMap.LineFieldInfo.CustomerFieldList
                .FieldMapItem
        ) {
            var data =
                res.PipelineFieldMap.LineFieldInfo.CustomerFieldList
                    .FieldMapItem;
            Array.isArray(data) || (data = [data]);
            for (let i = 0; i < data.length; i++) {
                if (data[i]._FieldName) {
                    self.tableHeader.line.push({
                        name: data[i]._FieldName.toLowerCase(),
                        label: data[i]._CaptionName,
                        standard: data[i]._StandardName
                    });
                }
            }
        }
        if (
            res.PipelineFieldMap &&
            res.PipelineFieldMap.PointFieldInfo &&
            res.PipelineFieldMap.PointFieldInfo.SystemFieldList &&
            res.PipelineFieldMap.PointFieldInfo.SystemFieldList.FieldMapItem
        ) {
            var data =
                res.PipelineFieldMap.PointFieldInfo.SystemFieldList
                    .FieldMapItem;
            Array.isArray(data) || (data = [data]);
            for (let i = 0; i < data.length; i++) {
                if (data[i]._FieldName) {
                    self.tableHeader.point.push({
                        name: data[i]._FieldName.toLowerCase(),
                        label: data[i]._CaptionName,
                        standard: data[i]._StandardName
                    });

                    if (self.field && self.typeId == 'point' && data[i]._StandardName == self.field) {
                        self.field = data[i]._FieldName.toLowerCase()
                    }
                }
            }
        }
        if (
            res.PipelineFieldMap &&
            res.PipelineFieldMap.PointFieldInfo &&
            res.PipelineFieldMap.PointFieldInfo.CustomerFieldList &&
            res.PipelineFieldMap.PointFieldInfo.CustomerFieldList
                .FieldMapItem
        ) {
            var data =
                res.PipelineFieldMap.PointFieldInfo.CustomerFieldList
                    .FieldMapItem;
            Array.isArray(data) || (data = [data]);
            for (let i = 0; i < data.length; i++) {
                if (data[i]._FieldName) {
                    self.tableHeader.point.push({
                        name: data[i]._FieldName.toLowerCase(),
                        label: data[i]._CaptionName,
                        standard: data[i]._StandardName
                    });
                }
            }
        }
    });
}

export function getValueMap(self, type) {
    // let urlSearch =
    //     "http://192.168.100.73/sde?/data/stamp_data/xuzhou/xz_pipeline/resource/config/ValueMap.config_sde";

    let urlSearch = self.g_Project.ValueMap;
    getValueCfgXml(urlSearch, self).then(res => {
        if (res && res.Xml && res.Xml[type]) {
            let arr = res.Xml[type];
            Array.isArray(arr) || (arr = [arr]);
            self.tempArr = arr;
        }
    })
}

export function getNameNoIgnoreCase(arr, fieldName, returnStandardName) {
    if (fieldName === "" || fieldName === undefined) {
        return;
    }
    if (!arr) {
        return;
    }

    if (arr && arr.length) {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].name == fieldName) {
                if (returnStandardName) {
                    return arr[i].standard;
                } else {
                    return arr[i].label;
                }
            }
        }
    }
    return '';
};

export function getNameNoIgnoreCaseByStandard(arr, standard, returnFieldName) {
    if (standard === "" || standard === undefined) {
        return;
    }
    if (!arr) {
        return;
    }

    if (arr && arr.length) {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].standard == standard) {
                if (returnFieldName) {
                    return arr[i].name;
                } else {
                    return arr[i].label;
                }
            }
        }
    }
    return standard;
};

export function queryFunc(params) {
    return postDataQuery(params)
}

export function querySpatialCondition(self, index, callback) {
    switch (index) {
        case 0:
            callback();
            break;
        case 1:
            self.stampAPI.usearth.ShapeCreator.CreateCircle({
                custom_excute_finish: function (result) {
                    if (!result || !result.data || !result.radius) {
                        self.$message({
                            message: "请至少绘制两个点创建圆",
                            type: "warning",
                            center: true,
                        });
                        self.stampAPI.usearth.ShapeCreator.Clear();
                        return;
                    }

                    let jwd = StampGis.Cartographic.fromCartesian(
                        result.data[0]
                    );
                    self.sc = `(3,0,${result.radius
                        },${StampGis.StampMath.toDegrees(
                            jwd.longitude
                        )},${StampGis.StampMath.toDegrees(jwd.latitude)})`;

                    callback();
                },
            });
            break;
        case 2:
            self.stampAPI.usearth.ShapeCreator.CreatePolygon({
                custom_excute_finish: function (result) {
                    if (result.data.length < 3) {
                        self.$message({
                            message: "请至少绘制三个点",
                            type: "warning",
                            center: true,
                        });
                        self.stampAPI.usearth.ShapeCreator.Clear();
                        return;
                    }
                    var pointString = "";
                    for (var i = 0; i < result.data.length; i++) {
                        var jwd = StampGis.Cartographic.fromCartesian(
                            result.data[i]
                        );
                        var lon = StampGis.StampMath.toDegrees(jwd.longitude);
                        var lat = StampGis.StampMath.toDegrees(jwd.latitude);

                        if (pointString !== "") {
                            pointString += ",";
                        }
                        pointString += lon + "," + lat + ",0";
                    }

                    self.sc =
                        "(2" +
                        "," +
                        result.data.length +
                        "," +
                        pointString +
                        ")";

                    callback();
                },
            });
            break;
    }
}

export function getRecordInfo(row, layername, layerid, layertype) {
    let temprow = deepCopy(row);

    // if (layertype == "polyline") {
    //     temprow["us_key"] = row["pipeid"];
    //     temprow["us_type"] = "管线";
    // } else if (layertype == "point") {
    //     temprow["us_key"] = row["exp_no"];
    //     if (row["feature"]) {
    //         temprow["us_type"] =
    //             row["feature"];
    //     } else if (row["subsid"]) {
    //         temprow["us_type"] =
    //             row["subsid"];
    //     } else {
    //         temprow["us_type"] = "管点";
    //     }

    // }
    temprow["us_layer"] = layername;
    temprow["us_layer_id"] = layerid;
    temprow["us_type"] = layertype;
    return temprow;
}

export function searchResultByMutilLayer(self, postArr) {
    self.loading = true;
    Promise.all(postArr.map(queryFunc)).then((res) => {
        self.tableData = { line: [], point: [] };
        self.recordNum = { line: 0, point: 0 };
        self.currentPage = 1;
        self.isExportDisabled = true;
        self.detailInfoShow = false;

        self.numArr = { line: [], point: [] };
        for (let i = 0; i < res.length; i++) {
            let json = self.$x2js.xml2js(res[i].data).Xml;
            if (json && json.Result) {
                let layerIdIndex =
                    res[i].config.data.indexOf("service=");

                let layerid = "";
                let layername = "";
                if (layerIdIndex > -1) {
                    let tempStr = res[i].config.data.substr(
                        layerIdIndex + 8
                    );
                    let tempIndex = tempStr.indexOf("&");
                    layerid = tempStr.substr(0, tempIndex);

                    let layerObj =
                        self.stampAPI.usearth.LayerManager.GetLayerByGUID(
                            layerid
                        );
                    layername = layerObj ? layerObj._name : "";
                }
                let layertype = json.Result._geometry;
                let type = layertype == "polyline"
                    ? "line"
                    : "point";
                self.numArr[type].push({
                    service: layerid,
                    num: Number(json.Result._num),
                    name: layername
                });

                self.recordNum[type] += Number(json.Result._num);

                if (self.tableData[type].length < self.pageSize) {
                    let records = json.Result.Record;
                    if (records) {
                        Array.isArray(records) ||
                            (records = [records]);

                        let count =
                            self.pageSize -
                            self.tableData.length;
                        count =
                            count < records.length
                                ? count
                                : records.length;
                        for (let k = 0; k < count; k++) {
                            let temprow = getRecordInfo(
                                records[k],
                                layername,
                                layerid,
                                type
                            );

                            self.tableData[type].push(temprow);
                        }
                    }
                }
            }
        }

        if (self.recordNum.line > 0 || self.recordNum.point > 0) {
            self.isExportDisabled = false;
            if (self.recordNum.line == 0) {
                self.typeId = 'point'
            }
        } else {
            self.$message({
                type: 'warning',
                message: '查询结果为空'
            })
        }

        var legendData = [];
        var seriesData = [];
        for (let i = 0; i < self.numArr.line.length; i++) {
            if (self.numArr.line[i].num == 0) {
                continue;
            }
            let temp = self.numArr.line[i].name + '-' + '线'

            legendData.push(temp);
            seriesData.push({ value: self.numArr.line[i].num, name: temp })
        }
        for (let i = 0; i < self.numArr.point.length; i++) {
            if (self.numArr.point[i].num == 0) {
                continue;
            }
            let temp = self.numArr.point[i].name + '-' + '点'
            legendData.push(temp);
            seriesData.push({ value: self.numArr.point[i].num, name: temp })
        }
        showChart(self, legendData, seriesData);
    }).finally(() => {
        self.loading = false;
    });
}

export function showChart(self, legendData, seriesData) {
    var chartElement = document.getElementById("chart");
    var myChart = self.$echarts.init(chartElement);
    window.onresize = function () {
        myChart.resize();
    };

    legendData.sort();
    seriesData.sort(function (a, b) {
        return a.name.localeCompare(b.name)
    })

    var option = {
        tooltip: {
            trigger: "item",
        },
        grid: {
            left: '5',
            top: '20',
            right: '10',
            bottom: '5',
            containLabel: true
        },
        // dataZoom: [{
        //     type: 'slider',
        //     show: legendData.length > 9,
        //     xAxisIndex: [0],
        //     left: '5',
        //     right: '5',
        //     bottom: '5',
        //     width: 10,
        //     handleSize: 0,
        //     fillerColor: "rgba(255, 174, 3, 1)",
        //     showDetail: false,
        //     start: 0,
        //     end: Math.floor(9 / legendData.length * 100) //初始化滚动条
        // }],
        xAxis: {
            type: 'category',
            data: legendData,
            axisLine: {
                lineStyle: {
                    color: "rgba(255, 174, 3, 0.5)"
                }
            },
            axisLabel: {
                color: 'rgb(255, 174, 3)',
                fontSize: 12,
                formatter: function (params) {
                    let newParamsName = "";
                    let paramsNameNumber = params.length;
                    let provideNumber = 10;
                    let rowNumber = Math.ceil(paramsNameNumber / provideNumber);

                    if (paramsNameNumber > provideNumber) {
                        for (let p = 0; p < rowNumber; p++) {
                            let tempStr = "";
                            let start = p * provideNumber;
                            let end = start + provideNumber;

                            if (p == rowNumber - 1) {
                                tempStr = params.substring(start, paramsNameNumber);
                            } else {
                                tempStr = params.substring(start, end) + "\n";
                            }
                            newParamsName += tempStr;
                        }
                    } else {
                        newParamsName = params;
                    }
                    return newParamsName;
                }
            },
            axisTick: {
                show: true,
            }
        },
        yAxis: {
            type: 'value',
            axisLine: {
                lineStyle: {
                    color: 'rgba(255, 174, 3, 0.5)'
                }
            },
            axisLabel: {
                color: 'rgb(255, 174, 3)',
                fontSize: 12,
            },
            splitLine: {
                lineStyle: {
                    color: "rgba(255, 174, 3, 0.5)"
                }
            }
        },
        series: [
            {
                data: seriesData,
                type: 'bar',
                barMaxWidth: 20,
                label: {
                    show: true,
                    fontSize: 12,
                    color: '#fff',
                    position: 'top'
                },
                itemStyle: {
                    color: new self.$echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: "#f3cc20" }, { offset: 1, color: '#f29216' }]),
                }
            }
        ]
    };

    myChart.setOption(option, true);
}

export function pageClick(self) {
    let minNum = (self.currentPage - 1) * self.pageSize;
    let maxNum = self.currentPage * self.pageSize;

    let postArr = [];
    let count = 0;
    let lastCount = 0;

    let recordIndexArr = [];
    for (let i = 0; i < self.numArr[self.typeId].length; i++) {
        count += self.numArr[self.typeId][i].num;
        if (lastCount <= minNum && count > minNum) {
            let startIndex = minNum - lastCount;
            let endIndex =
                count < maxNum
                    ? self.numArr[self.typeId][i].num
                    : startIndex + self.pageSize;

            let startPage = Math.floor(startIndex / self.pageSize);
            let endPage = Math.floor((endIndex - 1) / self.pageSize);

            for (let k = startPage; k <= endPage; k++) {
                postArr.push({
                    service: self.numArr[self.typeId][i].service,
                    qt: 17,
                    dt: self.typeId,
                    sc: self.sc ? self.sc : "",
                    pc: self.pc ? self.pc : "",
                    encoding: "utf-8",
                    pg: k + "," + self.pageSize,
                });

                let size = k * self.pageSize;
                recordIndexArr.push([
                    (startIndex > size ? startIndex : size) - size,
                    (endIndex < size + self.pageSize
                        ? endIndex
                        : size + self.pageSize) - size,
                ]);
            }
        } else if (lastCount > minNum && lastCount < maxNum) {
            postArr.push({
                service: self.numArr[self.typeId][i].service,
                qt: 17,
                dt: self.typeId,
                sc: self.sc ? self.sc : "",
                pc: self.pc ? self.pc : "",
                encoding: "utf-8",
                pg: "0," + self.pageSize,
            });

            let endIndex = self.pageSize - lastCount + minNum;

            recordIndexArr.push([
                0,
                endIndex < self.numArr[self.typeId][i].num
                    ? endIndex
                    : self.numArr[self.typeId][i].num,
            ]);
        } else if (lastCount >= maxNum) {
            break;
        }
        lastCount = count;
    }
    self.tableData[self.typeId] = [];
    Promise.all(postArr.map(queryFunc)).then((res) => {
        for (let i = 0; i < res.length; i++) {
            let json = self.$x2js.xml2js(res[i].data).Xml;
            if (json && json.Result) {
                if (self.tableData[self.typeId].length < self.pageSize) {
                    let layerIdIndex =
                        res[i].config.data.indexOf("service=");

                    let layerid = "";
                    let layername = "";
                    if (layerIdIndex > -1) {
                        let tempStr = res[i].config.data.substr(
                            layerIdIndex + 8
                        );
                        let tempIndex = tempStr.indexOf("&");
                        layerid = tempStr.substr(0, tempIndex);

                        let layerObj =
                            self.stampAPI.usearth.LayerManager.GetLayerByGUID(
                                layerid
                            );
                        layername = layerObj ? layerObj._name : "";
                    }

                    let layertype = json.Result._geometry;
                    let records = json.Result.Record;
                    Array.isArray(records) || (records = [records]);

                    for (
                        let k = recordIndexArr[i][0];
                        k < recordIndexArr[i][1];
                        k++
                    ) {
                        let temprow = getRecordInfo(
                            records[k],
                            layername,
                            layerid,
                            layertype == "polyline"
                                ? "line"
                                : "point"
                        );

                        self.tableData[self.typeId].push(temprow);
                    }
                }
            }
        }
    });
}

export function exportFile(self, postArr, type) {
    Promise.all(postArr.map(queryFunc)).then((res) => {
        let tableData = { line: [], point: [] }
        for (let i = 0; i < res.length; i++) {
            let json = self.$x2js.xml2js(res[i].data).Xml;
            if (json && json.Result) {
                let layerIdIndex =
                    res[i].config.data.indexOf("service=");

                let layerid = "";
                let layername = "";
                if (layerIdIndex > -1) {
                    let tempStr = res[i].config.data.substr(
                        layerIdIndex + 8
                    );
                    let tempIndex = tempStr.indexOf("&");
                    layerid = tempStr.substr(0, tempIndex);

                    let layerObj =
                        self.stampAPI.usearth.LayerManager.GetLayerByGUID(
                            layerid
                        );
                    layername = layerObj ? layerObj._name : "";
                }
                let layertype = json.Result._geometry;
                let type = layertype == "polyline"
                    ? "line"
                    : "point";

                let records = json.Result.Record;
                if (records) {
                    Array.isArray(records) ||
                        (records = [records]);

                    for (let k = 0; k < records.length; k++) {
                        let temprow = getRecordInfo(
                            records[k],
                            layername,
                            layerid,
                            type
                        );
                        tableData[type].push(temprow);
                    }
                }

            }
        }

        const workbook = new ExcelJS.Workbook();

        if (!type || type == "line") {
            var sheet = workbook.addWorksheet('管线信息'); //创建一个工作组
            //创建列

            let tempArr = []
            for (let i = 0; i < self.tableHeader.line.length; i++) {
                tempArr.push({ header: self.tableHeader.line[i].label, key: self.tableHeader.line[i].name, width: 20 })
            }
            sheet.columns = tempArr;

            sheet.addRows(tableData.line); //创建行
        }

        if (!type || type == 'point') {
            var sheet = workbook.addWorksheet('管点信息'); //创建一个工作组
            let tempArr1 = []
            for (let i = 0; i < self.tableHeader.point.length; i++) {
                tempArr1.push({ header: self.tableHeader.point[i].label, key: self.tableHeader.point[i].name, width: 20 })
            }
            //创建列
            sheet.columns = tempArr1;

            sheet.addRows(tableData.point); //创建行
        }

        var filename = "查询结果.xlsx";
        workbook.xlsx.writeBuffer().then((data) => {
            const blob = new Blob([data], {
                type: "application/octet-stream",
            });
            FileSaver.saveAs(blob, filename); //这里导出的文件名没有自定义
        });
        self.isExportLoading = false;
    });
}

export function getQueryValueMap(self) {
    let params = {
        service: self.selectLayer,
        qt: 256,
        dt: self.typeId,
        fd: self.field,
        pg: "0,10000",
        encoding: "utf-8",
    };
    self.typeList = [];
    self.checklist = [];
    self.loading = true

    queryFunc(params).then(function (res) {
        var json = self.$x2js.xml2js(res.data).Xml;
        if (
            json &&
            json.ValueRangeResult &&
            json.ValueRangeResult.ValueRange &&
            json.ValueRangeResult.ValueRange.Value
        ) {
            let typeArr = json.ValueRangeResult.ValueRange.Value;
            Array.isArray(typeArr) || (typeArr = [typeArr])

            for (let i = 0; i < typeArr.length; i++) {
                if (typeArr[i]) {
                    self.typeList.push(typeArr[i]);
                }
            }
        }
    }).finally(() => {
        self.loading = false
    });
}

export function staticResultBySingle(self, total) {
    let param = {
        service: self.selectLayer.split('_')[0],
        qt: 2,
        dt: self.typeId,
        sc: self.sc ? self.sc : "",
        pc: self.pc ? self.pc : "",
        encoding: "utf-8",
    };
    if (self.field) {
        param.cf = self.field
    }

    self.loading = true;
    self.recordNum = 0;
    queryFunc(param).then(res => {
        var json = self.$x2js.xml2js(res.data).Xml;
        if (json && json.Item) {
            let record = json.Item;
            Array.isArray(record) || (record = [record]);

            var legendData = [];
            var seriesData = [];
            for (let i = 0; i < record.length; i++) {
                let times = Number(record[i]["TIMES"]);
                if (times == 0) {
                    continue;
                }
                legendData.push(record[i][self.field]);
                seriesData.push({ value: times, name: record[i][self.field] })

                self.recordNum += times
            }
        }
        if (self.recordNum > 0) {
            self.isExportDisabled = false;
            if (total) {
                self.staticTotalSize = '';
                self.staticTotalCount = self.recordNum;
                self.staticTotalHover = self.recordNum.toString();
            } else {
                showChart(self, legendData, seriesData)
            }
        } else {
            self.$message({
                type: 'warning',
                message: '查询结果为空'
            })
        }
    }).finally(() => {
        self.loading = false;
    })
}

export function searchResultBySingle(self) {
    let param = {
        service: self.selectLayer.split('_')[0],
        qt: 17,
        dt: self.typeId,
        sc: self.sc ? self.sc : "",
        pc: self.pc ? self.pc : "",
        encoding: "utf-8",
        pg: self.currentPage - 1 + "," + self.pageSize,
    };
    queryFunc(param).then(res => {
        self.tableData = [];
        let json = self.$x2js.xml2js(res.data).Xml;
        if (json) {
            let layerObj =
                self.stampAPI.usearth.LayerManager.GetLayerByGUID(
                    self.selectLayer
                );
            let layername = layerObj ? layerObj._name : "";
            let layertype = json.Result._geometry;

            let records = json.Result.Record;
            if (records) {
                Array.isArray(records) ||
                    (records = [records]);

                for (let k = 0; k < records.length; k++) {
                    let temprow = getRecordInfo(
                        records[k],
                        layername,
                        self.selectLayer.split('_')[0],
                        layertype == "polyline"
                            ? "line"
                            : "point"
                    );

                    self.tableData.push(temprow);
                }
            }
        }
    })
}

export function getDetailData(self, row) {
    if (self.timer) {
        clearInterval(self.timer);
        self.timer = null;
        for (let m = 0; m < self.lastHighlight_layer.length; m++) {
            self.lastHighlight_layer[m]._highlight_objs = [];
        }
        self.lastHighlight_layer = [];
    }

    let layerid = row["us_layer_id"]
    var searchLayer = self.stampAPI.usearth.LayerManager.GetLayerByGUID(layerid);

    let type = row["us_type"];

    let searchParamArr = [];
    if (type == "line") {
        let fieldname = null;
        for (let i = 0; i < self.tableHeader.line.length; i++) {
            if (self.tableHeader.line[i].standard == "US_KEY") {
                fieldname = self.tableHeader.line[i].name.toLowerCase();
                break;
            }
        }
        if (searchLayer.container && fieldname) {
            searchParamArr.push(`rd=&t=container&c=${layerid}&pk=${row[fieldname]}&rt=1&mesh=0&detail=0&p=0&pl=100`);
        }
        if (searchLayer.container_og && fieldname) {
            searchParamArr.push(`rd=&t=container_og&c=${layerid}&pk=${row[fieldname]}&rt=1&mesh=0&detail=0&p=0&pl=100`);
        }
    } else {
        let fieldname = null;
        for (let i = 0; i < self.tableHeader.point.length; i++) {
            if (self.tableHeader.point[i].standard == "US_KEY") {
                fieldname = self.tableHeader.point[i].name.toLowerCase();
                break;
            }
        }

        var feature = getNameNoIgnoreCaseByStandard(self.tableHeader.point, "US_PT_TYPE", true);
        var attachment = getNameNoIgnoreCaseByStandard(self.tableHeader.point, "US_ATTACHMENT", true);

        if (searchLayer.equipment && fieldname) {
            searchParamArr.push(`rd=&t=equipment&c=${layerid}&pk=${row[fieldname]}&rt=1&mesh=0&detail=0&p=0&pl=100`);
        }
        if (searchLayer.joint && fieldname && row[feature]) {
            searchParamArr.push(`rd=&t=joint&c=${layerid}&pk=${row[fieldname]}&rt=1&mesh=0&detail=0&p=0&pl=100`);
        }
        if (searchLayer.joint_og && fieldname && row[feature]) {
            searchParamArr.push(`rd=&t=joint_og&c=${layerid}&pk=${row[fieldname]}&rt=1&mesh=0&detail=0&p=0&pl=100`);
        }
        if (searchLayer.plate && fieldname && row[attachment]) {
            searchParamArr.push(`rd=&t=plate&c=${layerid}&pk=${row[fieldname]}&rt=1&mesh=0&detail=0&p=0&pl=100`);
        }
        if (searchLayer.well && fieldname && row[attachment]) {
            searchParamArr.push(`rd=&t=well&c=${layerid}&pk=${row[fieldname]}&rt=1&mesh=0&detail=0&p=0&pl=100`);
        }
    }

    Promise.all(searchParamArr.map(postSearch)).then(res => {
        var posArr = null
        for (let i = 0; i < res.length; i++) {
            var json = self.$x2js.xml2js(res[i].data);
            if (json && json.Xml && json.Xml.SearchResult && json.Xml.SearchResult.ModelResult && json.Xml.SearchResult.ModelResult.ModelData) {
                var data = json.Xml.SearchResult.ModelResult.ModelData;
                Array.isArray(data) || (data = [data])

                let tempStr = res[i].config.data.substr(
                    6
                );
                let tempIndex = tempStr.indexOf("&");
                let subLayerName = tempStr.substr(0, tempIndex);

                let tempHighlight = searchLayer[subLayerName];
                tempHighlight._highlight_objs = [];
                self.lastHighlight_layer.push(tempHighlight);
                for (let k = 0; k < data.length; k++) {
                    tempHighlight._highlight_objs.push(data[k]['SE_ID']);
                }

                posArr = data[0]['LonLatBox'].split(',');
            }
        }

        debugger

        if (posArr) {
            var lon = (Number(posArr[2]) + Number(posArr[3])) / 2;
            var lat = (Number(posArr[0]) + Number(posArr[1])) / 2;
            var alt = Math.max(Number(posArr[4]), Number(posArr[5]));
            var width = Math.abs(Number(posArr[2]) - Number(posArr[3])) / 2;
            var heigth = Math.abs(Number(posArr[0]) - Number(posArr[1])) / 2;
            var range = width / 180 * Math.PI * 6378137 / Math.tan(22.5 / 180 * Math.PI);
            var range1 = heigth / 180 * Math.PI * 6378137 / Math.tan(22.5 / 180 * Math.PI);
            var pos = StampGis.Cartesian3.fromDegrees(lon, lat, alt + Math.max(range, range1));
            self.stampAPI.usearth.application.observer.flyTo({
                destination: pos,
                orientation: {
                    heading: StampGis.StampMath.toRadians(0),
                    pitch: StampGis.StampMath.toRadians(-90),
                    roll: 0.0
                }
            });
        } else {
            if (row.SHAPE) {
                if (row.SHAPE.hasOwnProperty('Polyline')) {
                    var coordinateArr = row.SHAPE.Polyline.Coordinates.split(',');
                    var lon = (Number(coordinateArr[0]) + Number(coordinateArr[3])) / 2;
                    var lat = (Number(coordinateArr[1]) + Number(coordinateArr[4])) / 2;
                    var alt = (Number(coordinateArr[2]) + Number(coordinateArr[5])) / 2;

                    var width = Math.abs(Number(coordinateArr[0]) - Number(coordinateArr[3])) / 2;
                    var heigth = Math.abs(Number(coordinateArr[1]) - Number(coordinateArr[4])) / 2;
                    var range = width / 180 * Math.PI * 6378137 / Math.tan(22.5 / 180 * Math.PI);
                    var range1 = heigth / 180 * Math.PI * 6378137 / Math.tan(22.5 / 180 * Math.PI);

                    var pos = StampGis.Cartesian3.fromDegrees(lon, lat, alt + Math.max(range, range1));
                    self.stampAPI.usearth.application.observer.flyTo({
                        destination: pos,
                        orientation: {
                            heading: StampGis.StampMath.toRadians(0),
                            pitch: StampGis.StampMath.toRadians(-90),
                            roll: 0.0
                        }
                    });
                } else if (row.SHAPE.hasOwnProperty('Point')) {
                    var coordinateArr = row.SHAPE.Point.Coordinates.split(',');

                    var pos = StampGis.Cartesian3.fromDegrees(Number(coordinateArr[0]), Number(coordinateArr[1]), Number(coordinateArr[2]) + 10);
                    self.stampAPI.usearth.application.observer.flyTo({
                        destination: pos,
                        orientation: {
                            heading: StampGis.StampMath.toRadians(0),
                            pitch: StampGis.StampMath.toRadians(-90),
                            roll: 0.0
                        }
                    });
                }
            }
        }

        self.timer = setInterval(function () {
            for (let m = 0; m < self.lastHighlight_layer.length; m++) {
                self.lastHighlight_layer[m]._highlight_objs = [];
            }
            self.lastHighlight_layer = [];
        }, STAMP_config.highLightTime)

    })


}