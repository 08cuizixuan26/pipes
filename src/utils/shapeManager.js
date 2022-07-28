export default{
    geometryType: {
        Point: "Point",
        MultiPoint: "MultiPoint",
        Line: "LineString",
        MultiLine: "MultiLineString",
        Polygon: "Polygon",
        MultiPolygon: "MultiPolygon"
    },
    readFile: function(file, callback){
        if(!file){
            if(typeof callback == "function"){
                callback(null);
            }
            return;
        }
        var reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = function(e){
            if(typeof callback == "function"){
                callback(e.target.result);
            }
        }
    },
    readShapeFile: function(shpFile, dbfFile, options, callback){
        var self = this;
        if(!options){
          options = {};
        }
        if(!options.encoding){
          options.encoding = "gbk";//默认读取采用UTF-8
        }
        var retData = [];
        self.readFile(shpFile, function(shpResult){
            self.readFile(dbfFile, function(dbfResult){
                var shapefile = require("shapefile");//引入shapefile库
                //有shp就解析，无shp就只解析dbf（因shpfile库open接口有个bug，不允许shp文件为空，但是允许dbf文件为空
                (shpResult==null?shapefile.openDbf(dbfResult, options):shapefile.open(shpResult, dbfResult, options))
                .then(source => source.read()
                        .then(function log(result) {
                            if(!result){
                                return;
                            }
                            if (result.done) {
                                if(typeof callback == "function"){
                                    callback(retData);
                                }
                                return;
                            };
                            retData.push(result.value);
                            // console.log(result.value);
                            return source.read().then(log);
                        })).catch(error => console.error(error.stack));
               
            });
        });
    },    
    readShapeType: function(shpFile, callback){
        var reader = new FileReader();
        reader.readAsArrayBuffer(shpFile);
        reader.onload = function(e){
            var shpResult = e.target.result;
            var shapefile = require("shapefile");//引入shapefile库
            shapefile.open(shpResult)
            .then(source => source.read()
                .then(function log(result) {
                    if(!result){
                      return;
                    }
                    if (result.done) {
                      return;
                    };
                    if(typeof callback == "function"){
                      callback(result.value.geometry.type);//LineString
                    }
                    // console.log(result.value.geometry.type);
            })).catch(error => console.error(error.stack));
        }
    },
    readShapeInfo: function(shpFile, dbfFile, options, callback){
        if(!options){
            options = {};
        }
        if(!options.encoding){
            options.encoding = "gbk";//默认读取采用UTF-8
        }
        var retData = [];
        var reader = new FileReader();
        reader.readAsArrayBuffer(shpFile);
        reader.onload = function(e1){
        var shpResult = e1.target.result;
            var reader = new FileReader();
            reader.readAsArrayBuffer(dbfFile);
            reader.onload = function(e2){
                var dbfResult = e2.target.result;
                var shapefile = require("shapefile");//引入shapefile库
                shapefile.open(shpResult, dbfResult, options)
                    .then(source => source.read()
                        .then(function log(result) {
                            if(!result){
                                return;
                            }
                            if (result.done) {
                                return;
                            };
                            if(typeof callback == "function"){
                                callback(result.value);
                            }
                            // console.log(result.value);
                        })).catch(error => console.error(error.stack));
            }
        }
    },
    checkShpDbf: function(files){
        if(files.length != 2){
            return null;
        }
        var shpDbf = {
            shpFile: null,
            dbfFile: null
        }
        var splitArr1 = files[0].name.split(".");
        var fileExt1 = splitArr1[splitArr1.length-1].toLowerCase();
        var fileName1 = files[0].name.substr(0, files[0].name.length - fileExt1.length - 1);
        if(fileExt1 == "shp"){
            shpDbf.shpFile = files[0];
        }else if(fileExt1 == "dbf"){
            shpDbf.dbfFile = files[0];
        }
      
        var splitArr2 = files[1].name.split(".");
        var fileExt2 = splitArr2[splitArr2.length-1].toLowerCase();
        var fileName2 = files[1].name.substr(0, files[1].name.length - fileExt2.length - 1);
        if(fileExt2 == "shp"){
            shpDbf.shpFile = files[1];
        }else if(fileExt2 == "dbf"){
            shpDbf.dbfFile = files[1];
        }
        if(shpDbf.shpFile == null || shpDbf.dbfFile == null){
            return null;
        }
        
        if(fileName1 != fileName2){
          return null;
        }
        return shpDbf;
    }
}