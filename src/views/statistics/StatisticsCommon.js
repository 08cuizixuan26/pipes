import { postDataQuery, postSearch, getFiledCfgXml, getValueCfgXml, getNameNoIgnoreCase } from "@/api/query";
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

export function getField(self, callback) {
    // let urlSearch =
    //     "http://192.168.100.73/sde?/data/stamp_data/xuzhou/xz_pipeline/resource/config/FieldMap.config_sde";

    let urlSearch = self.g_Project.FieldMap;
    getFiledCfgXml(urlSearch, self).then((res) => {
        callback(res);
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

export function statisticsSpatialCondition(self, index, callback) {
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

export function queryFunc(params) {
    return postDataQuery(params)
}

export function staticResultByMutilLayer(self, postArr) {
    self.loading = true;
    Promise.all(postArr.map(queryFunc)).then(result => {
        var tableData = [];
        self.checkLayerList = [];

        for (let m = 0; m < result.length; m++) {
            var json = self.$x2js.xml2js(result[m].data).Xml;
            if (json && json.Item) {
                let layerIdIndex =
                    result[m].config.data.indexOf("service=");

                let layerid = "";
                let layername = "";
                if (layerIdIndex > -1) {
                    let tempStr = result[m].config.data.substr(
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

                let layerTypeIndex =
                    result[m].config.data.indexOf("dt=");

                let layertype = "";
                if (layerTypeIndex > -1) {
                    let tempStr = result[m].config.data.substr(
                        layerTypeIndex + 3
                    );
                    let tempIndex = tempStr.indexOf("&");
                    layertype = tempStr.substr(0, tempIndex);
                }

                self.checkLayerList.push({
                    id: layerid,
                    name: layername,
                });

                let record = json.Item;
                Array.isArray(record) || (record = [record]);

                let num = 0;
                let length = 0;
                let numEles = 0;
                let lengthEles = 0;
                for (let n = 0; n < record.length; n++) {
                    let lenValue = 0;
                    let typeValue = "";
                    if (layertype == "line") {
                        typeValue = record[n][self.lineField];
                        lenValue = (Number(record[n]["LENGTH"]) / 1000).toFixed(3);
                    } else {
                        typeValue = record[n][self.field];
                        lenValue = '-';
                    }
                    if (typeValue) {
                        num += Number(record[n]["TIMES"]);
                        length += Number(record[n]["LENGTH"]);

                        record[n]["layerName"] = layername;
                        record[n]["type"] = typeValue;
                        record[n]["LENGTH"] = lenValue;
                        record[n]["TIMES"] = Number(record[n]["TIMES"]);

                        tableData.push(record[n]);
                    } else {
                        numEles += Number(record[n]["TIMES"]);
                        lengthEles += Number(record[n]["LENGTH"]);

                        num += Number(record[n]["TIMES"]);
                        length += Number(record[n]["LENGTH"]);
                    }
                }

                if (numEles > 0 || lengthEles > 0) {
                    let objEles = {
                        layerName: layername,
                        type: '其他',
                        TIMES: numEles,
                        LENGTH: layertype == "line" ? (lengthEles / 1000).toFixed(3) : "-"
                    };
                    tableData.push(objEles);
                }

                if (self.typeId !== 'all') {
                    let obj = {
                        layerName: layername,
                        type: '小计',
                        TIMES: num,
                        LENGTH: layertype == "line" ? (length / 1000).toFixed(3) : "-"
                    };
                    tableData.push(obj);
                }
            }
        }

        if (tableData.length > 0) {
            self.getSpanArr(tableData);
            self.tableData = tableData;
            self.isExportDisabled = false;

            self.handlePieChange();
        }
    }).finally(() => {
        self.loading = false;
    })
}

export function exportFile(self) {
    const workbook = new ExcelJS.Workbook();

    var sheet = workbook.addWorksheet('统计结果'); //创建一个工作组

    if (self.typeId == "point") {
        //创建列
        let tempArr = []
        tempArr.push({ header: "图层", key: "layerName", width: 20 })
        tempArr.push({ header: self.fieldLabel, key: "type", width: 20 })
        tempArr.push({ header: "点数", key: "TIMES", width: 20 })
        sheet.columns = tempArr;
    } else {
        //创建列
        let tempArr = []
        tempArr.push({ header: "图层", key: "layerName", width: 20 })
        tempArr.push({ header: self.fieldLabel, key: "type", width: 20 })
        tempArr.push({ header: "数量", key: "TIMES", width: 20 })
        tempArr.push({ header: "长度(km)", key: "LENGTH", width: 20 })
        sheet.columns = tempArr;
    }
    sheet.addRows(self.tableData); //创建行

    var filename = "统计结果.xlsx";
    workbook.xlsx.writeBuffer().then((data) => {
        const blob = new Blob([data], {
            type: "application/octet-stream",
        });
        FileSaver.saveAs(blob, filename); //这里导出的文件名没有自定义
    });
    self.isExportLoading = false;
}

export function showPieChart(self, legendData, seriesData) {
    var chartElement = document.getElementById("pieChart");
    var myChart = self.$echarts.init(chartElement);
    window.onresize = function () {
        myChart.resize();
    };

    // 排序调用函数  把统计出来的结果分成6个;
    function count(x, y) {
        if (x.value > y.value) {
            return -1;
        }
        if (x.value < y.value) {
            return 1;
        }
        return 0;
    }

    let temp = seriesData;
    let elses = []; //'其他'
    let values = 0;
    if (temp.length >= 7) {
        for (let j = 0; j < temp.length; j++) {
            if (temp[j].name == "其他") {
                elses = temp.splice(j, j + 1); //循环遍历出'其他'
            }
        }
        var tempArrs = temp.sort(count); // tempArrs 保留了需要的五项
        let Arrs = tempArrs.splice(5, temp.length); //截取字符串后面的
        for (let k = 1; k < Arrs.length; k++) {
            values += Arrs[k].value;
        }
        if (elses.length == 0) {
            elses = [Arrs[0]];
        }
        elses[0].value += values;
        elses[0].name = '其他';
        tempArrs.push(elses[0]);
    } else {
        var tempArrs = temp;
    }



    var totalValue = 0;
    for (var i = 0; i < seriesData.length; i++) {
        totalValue += seriesData[i].value;
    }
    var ratio = window.innerWidth / 1920;
    var option = {
        tooltip: {
            trigger: "item",
            formatter: function (a) {
                var value = a.value;
                var percent = ((100 * value) / totalValue).toFixed(2);
                return a.name + ":" + a.value + "(" + percent + "%)";
            },
        },
        legend: {
            show: false,
            type: "scroll",
            textStyle: {
                color: "#FFFFFF", // 字体颜色
                fontSize: 14 * ratio + "",
            },
            bottom: 0,
            data: legendData,
        },
        graphic: {
            // 图形中间图片
            elements: [
                {
                    type: "image",
                    style: {
                        image: "images/static/staticImg.png", // 你的图片地址
                        width: 80,
                        height: 80,
                    },
                    left: "center",
                    top: "center",
                },
                {
                    type: "image",
                    style: {
                        image: "images/static/staticChartImg.png", // 你的图片地址
                        width: 40,
                        height: 40,
                    },
                    left: "center",
                    top: "center",
                },
            ],
        },
        series: [
            {
                type: "pie",
                center: ["50%", "50%"],
                // data: seriesData,
                data: tempArrs,
                emphasis: {
                    show: false,
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: "rgba(0, 0, 0, 0.5)",
                        fontSize: 16 * ratio + "",
                    },
                },
                color: [
                    "#F69C3C",
                    "#EE6433",
                    "#E8E980",
                    "#E56571",
                    "#33DFB5",
                    "#77F7FF",
                    "#BBB6FF",
                    "#2CE228",
                    "#E153FF",
                    "#8CC0FC",
                    "#80C011",
                    "#487892",
                    "#CFFF71",
                    "#5390FF",
                    "#FFB871",
                ],
                radius: ["60", "70"],
                startAngle: "0",
                minAngle: "5",
                label: {
                    // 线上文字的样式
                    normal: {
                        show: true,
                        textStyle: {
                            fontSize: 14, // 文字的字体大小
                        },
                        formatter: "{b|{b}}\n\n", // 线上文字{c|{c}}
                        borderWidth: 0,
                        rich: {
                            a: {
                                color: "#FFFFFF",
                                fontSize: 14,
                                lineHeight: 20,
                            },
                            b: {
                                color: "rgb(255, 174, 3)",
                                fontSize: 14,
                                lineHeight: 20,
                            },
                            c: {
                                color: "rgb(255, 174, 3)",
                                fontSize: 14,
                                lineHeight: 20,
                            },
                            d: {
                                color: "#FFFFFF",
                                fontSize: 14,
                                lineHeight: 20,
                            },
                        },
                    },
                },
                labelLine: {
                    normal: {
                        lineStyle: {
                            color: "rgb(255, 174, 3)"
                        }
                    },
                },
            },
            {
                type: "pie",
                center: ["50%", "50%"],
                radius: ["50", "60"],
                label: {
                    normal: {
                        show: false,
                    },
                    emphasis: {
                        show: false,
                    },
                },
                labelLine: {
                    normal: {
                        show: false,
                    },
                    emphasis: {
                        show: false,
                    },
                },
                animation: false,
                tooltip: {
                    show: false,
                },
                data: [
                    {
                        value: 1,
                        itemStyle: {
                            color: "rgba(208,208,208,0.37)",
                        },
                    },
                ],
            },
        ],
    };
    myChart.setOption(option, true);
}

export function showBarChart(self, legendData, seriesData) {
    var chartElement = document.getElementById("barChart");
    var myChart = self.$echarts.init(chartElement);
    window.onresize = function () {
        myChart.resize();
    };

    var option = {
        tooltip: {
            trigger: "item",
        },
        grid: {
            left: '5',
            top: '5',
            right: '20',
            bottom: '5',
            containLabel: true
        },
        dataZoom: [{
            type: 'slider',
            show: legendData.length > 9,
            yAxisIndex: [0],
            right: '5',
            top: '10',
            bottom: '30',
            width: 10,
            handleSize: 0,
            fillerColor: "rgba(255, 174, 3, 1)",
            showDetail: false,
            start: 100 - Math.floor(9 / legendData.length * 100),
            end: 100 //初始化滚动条
        }],
        yAxis: {
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
                    let provideNumber = 7;
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
        xAxis: {
            type: 'value',
            axisLine: {
                show: false,
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
                barWidth: 20,
                label: {
                    show: true,
                    fontSize: 12,
                    color: '#fff',
                    position: 'insideLeft'
                },
                itemStyle: {
                    color: new self.$echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: "#f3cc20" }, { offset: 1, color: '#f29216' }]),
                }
            }
        ]
    };

    myChart.setOption(option, true);
}
