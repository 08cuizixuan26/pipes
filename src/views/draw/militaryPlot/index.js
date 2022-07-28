import { colorToHex } from '@/utils'
/**
 * 作   者：StampGIS Team
 * 创建日期：2019.11.25
 * 描   述：标绘功能模块
 * 注意事项：
 * 遗留Bug：0
 * 修改日期：
 ******************************************/

var _emergency = {};

/**
 * 绘制简单箭头
 * @param {*} circle
 * @param {*} options
 */
function _createSArrow(earth, callback) {
  earth.ShapeCreator.CreatePlotSArrow({
    custom_excute_finish: function (result) {
      if (typeof callback == "function") {
        callback(result && result.data ? result.data : null);
      }
      earth.ShapeCreator.Clear();
    }
  });
}

function _createElementSArrow(earth, options) {
  var symbol = earth.Factory.CreateElementTextureSymbol({
    name: options.name || "",
    doc: earth.document,
    symbolRtti: options.rtti,
    guid: options.guid
  });
  if (!symbol) {
    return;
  }
  symbol = _editTextureSymbol(symbol, options);
  earth.document.elementRoot.attach_object(symbol);
  earth.document.register_object(symbol);
  symbol.show_high_light();
  return symbol;
}

//直箭头
function _createequalSArrow(earth, callback) {
  earth.ShapeCreator.CreatePlotEqualSArrow({
    custom_excute_finish: function (result) {
      if (typeof callback == "function") {
        callback(result && result.data ? result.data : null);
      }
      earth.ShapeCreator.Clear();
    }
  });
}

function _createElementequalSArrow(earth, options) {
  return _createElementSArrow(earth, options);
}

//燕尾箭头
function _createtailSarrow(earth, callback) {
  earth.ShapeCreator.CreatePlotTailSArrow({
    custom_excute_finish: function (result) {
      if (typeof callback == "function") {
        callback(result && result.data ? result.data : null);
      }
      earth.ShapeCreator.Clear();
    }
  });
}

function _createElementtailSArrow(earth, options) {
  return _createElementSArrow(earth, options);
}

//自定义燕尾箭头
function _createCustomTailSArrow(earth, callback) {
  earth.ShapeCreator.CreatePlotCustomTailArrow({
    custom_excute_finish: function (result) {
      if (typeof callback == "function") {
        callback(result && result.data ? result.data : null);
      }
      earth.ShapeCreator.Clear();
    }
  });
}

function _createEleCustomTailSArrow(earth, options) {
  return _createElementSArrow(earth, options);
}

//双箭头
function _createdoubleSArrow(earth, callback) {
  earth.ShapeCreator.CreatePlotDoubleArrow({
    custom_excute_finish: function (result) {
      if (typeof callback == "function") {
        callback(result && result.data ? result.data : null);
      }
      earth.ShapeCreator.Clear();
    }
  });
}

function _createElementdoubleSArrow(earth, options) {
  return _createElementSArrow(earth, options);
}

//多箭头
function _createxSArrow(earth, callback) {
  earth.ShapeCreator.CreatePlotXArrow({
    custom_excute_finish: function (result) {
      if (typeof callback == "function") {
        callback(result && result.data ? result.data : null);
      }
      earth.ShapeCreator.Clear();
    }
  });
}

function _createElementxSArrow(earth, options) {
  return _createElementSArrow(earth, options);
}

//自定义箭头
function _createcustomArrow(earth, callback) {
  earth.ShapeCreator.CreatePlotCustomArrow({
    custom_excute_finish: function (result) {
      if (typeof callback == "function") {
        callback(result && result.data ? result.data : null);
      }
      earth.ShapeCreator.Clear();
    }
  });
}

function _createElementcustomArrow(earth, options) {
  return _createElementSArrow(earth, options);
}

//曲面旗
function _createcurveflag(earth, callback) {
  earth.ShapeCreator.CreatePlotCurveFlag({
    custom_excute_finish: function (result) {
      if (typeof callback == "function") {
        callback(result && result.data ? result.data : null);
      }
      earth.ShapeCreator.Clear();
    }
  });
}

function _createElementcurveflag(earth, options) {
  let symbol = earth.Factory.CreateElementPlotCurveFlag({
    name: options.name || "",
    doc: earth.document,
    guid: options.guid
  })

  if (!symbol) {
    return;
  }
  symbol = _editcurveflag(symbol, options)
  earth.document.elementRoot.attach_object(symbol)
  earth.document.register_object(symbol)
  symbol.show_high_light();
  return symbol;
}

function _editcurveflag(symbol, options) {
  let name = options.name || "";
  let lineColor = colorToHex(options.lineColor, options.lineColorTransparent);
  let fillColor = colorToHex(options.fillColor, options.fillColorTransparent);
  let lineWidth = parseInt(options.lineWidth) || 1.0;
  let drawOrder = parseInt(options.drawOrder) || 0;
  symbol.BeginUpdate();
  symbol.SetControlPointsArrayGeo(options.points);
  symbol.guid = options.guid;
  symbol.name = name;
  symbol.lineColor = lineColor;
  symbol.lineWidth = lineWidth;
  symbol.fillColor = fillColor;
  symbol.drawOrder = drawOrder;
  symbol.set_is_visible(!!options.visibility)
  symbol.EndUpdate();
  return symbol
}

//直角旗标
function _createrightAngleflag(earth, callback) {
  earth.ShapeCreator.CreatePlotRectFlag({
    custom_excute_finish: function (result) {
      if (typeof callback == "function") {
        callback(result && result.data ? result.data : null);
      }
      earth.ShapeCreator.Clear();
    }
  });
}

function _createElementrightAngleflag(earth, options) {
  let symbol = earth.Factory.CreateElementPlotRectFlag({
    name: options.name || "",
    doc: earth.document,
    guid: options.guid
  })

  if (!symbol) {
    return;
  }
  _editrightAngleflag(symbol, options)
  earth.document.elementRoot.attach_object(symbol)
  earth.document.register_object(symbol)
  symbol.show_high_light();
  return symbol;
}

function _editrightAngleflag(symbol, options) {
  let name = options.name || "";
  let lineColor = colorToHex(options.lineColor, options.lineColorTransparent);
  let fillColor = colorToHex(options.fillColor, options.fillColorTransparent);
  let lineWidth = parseInt(options.lineWidth) || 1;
  let drawOrder = parseInt(options.drawOrder) || 0;
  symbol.BeginUpdate();
  symbol.SetControlPointsArrayGeo(options.points);
  symbol.name = name
  symbol.guid = options.guid;
  symbol.drawOrder = drawOrder;
  symbol.lineColor = lineColor;
  symbol.lineWidth = lineWidth;
  symbol.fillColor = fillColor;
  symbol.EndUpdate();
  return symbol;
}

//三角旗
function _createtriangleFlag(earth, callback) {
  earth.ShapeCreator.CreatePlotTriangleFlag({
    custom_excute_finish: function (result) {
      if (typeof callback == "function") {
        callback(result && result.data ? result.data : null);
      }
      earth.ShapeCreator.Clear();
    }
  })
}

function _createElementTriangleFlag(earth, options) {
  let symbol = earth.Factory.CreateElementPlotTriangleFlag({
    name: options.name || "",
    doc: earth.document,
    guid: options.guid
  })

  if (!symbol) {
    return;
  }
  _editTriangleFlag(symbol, options)
  earth.document.elementRoot.attach_object(symbol)
  earth.document.register_object(symbol)
  symbol.show_high_light();
  return symbol;
}

function _editTriangleFlag(symbol, options) {
  _editrightAngleflag(symbol, options)
}

//集结地
function _createAssemblyArea(earth, callback) {
  earth.ShapeCreator.CreatePlotAssemblyArea({
    custom_excute_finish: function (result) {
      if (typeof callback == "function") {
        callback(result && result.data ? result.data : null);
      }
      earth.ShapeCreator.Clear();
    }
  })
}

function _createElementAssemblyArea(earth, options) {
  return _createElementSArrow(earth, options)
}



function _editTextureSymbol(symbol, options) {
  var name = options.name || "";
  var lineColor = colorToHex(options.lineColor, options.lineColorTransparent);
  var fillColor = colorToHex(options.fillColor, options.fillColorTransparent);
  var altitudeType = parseInt(options.altitudeType) || 1;
  var lineWidth = parseInt(options.lineWidth) || 1;
  var drawOrder = parseInt(options.drawOrder) || 0;
  // var symbolStyle = symbol.symbolStyle;
  //       symbolStyle.LibraryName = "http://192.168.100.142/sde?/home/stamp/stampmanager/vector-tile2/COLOR.symlib";
  //       symbolStyle.symbolId = "001";
  //       symbolStyle.colorArgb = 0xff00ff00;
  //       symbolStyle._outlineColor = 0xff00ff00;
  //       symbol.BeginUpdate();
  //       symbol.SetControlPoints(options.points, false);
  //       symbol.set_altitude_type(1);
  //       symbol.drawOrder = 1;
  //       symbol.EndUpdate();
  var symbolStyle = symbol.symbolStyle;
  symbolStyle.LibraryName = stamp_core_config.baseUrlString + "Assets/MilitaryPlotting.symlib";//STAMP_config.filePath.symbolStyle_ip;
  symbolStyle.symbolId = "001";
  symbolStyle.colorArgb = fillColor
  symbolStyle.outlineColorArgb = lineColor
  symbolStyle.outlineWidth = lineWidth
  symbol.guid = options.guid;
  symbol.name = name;
  symbol.BeginUpdate();
  symbol.SetControlPoints(options.points, false);
  symbol.set_altitude_type(altitudeType);
  symbol.drawOrder = drawOrder;
  symbol.set_is_visible(!!options.visibility);
  symbol.EndUpdate();
  return symbol;
}


_emergency.editTextureSymbol = _editTextureSymbol; //绘制箭头

_emergency.createSArrow = _createSArrow; //绘制简单箭头
_emergency.createElementSArrow = _createElementSArrow; //创建箭头

_emergency.createequalSArrow = _createequalSArrow; //绘制直箭头
_emergency.createElementequalSArrow = _createElementequalSArrow; //创建直箭头

_emergency.createtailSarrow = _createtailSarrow; //燕尾箭头
_emergency.createElementtailSArrow = _createElementtailSArrow;

_emergency.createCustomTailSArrow = _createCustomTailSArrow;  //自定义燕尾箭头
_emergency.createEleCustomTailSArrow = _createEleCustomTailSArrow;

_emergency.createdoubleSArrow = _createdoubleSArrow; //双箭头
_emergency.createElementdoubleSArrow = _createElementdoubleSArrow;

_emergency.createxSArrow = _createxSArrow; //多箭头
_emergency.createElementxSArrow = _createElementxSArrow;

_emergency.createcustomArrow = _createcustomArrow; //自定义箭头
_emergency.createElementcustomArrow = _createElementcustomArrow;

_emergency.createcurveflag = _createcurveflag;   //创建曲面旗
_emergency.createElementcurveflag = _createElementcurveflag;
_emergency.editcurveflag = _editcurveflag;  //编辑曲面旗

_emergency.createrightAngleflag = _createrightAngleflag; //直角旗
_emergency.createElementrightAngleflag = _createElementrightAngleflag;
_emergency.editrightAngleflag = _editrightAngleflag;

_emergency.createtriangleFlag = _createtriangleFlag;  //三角旗
_emergency.createElementTriangleFlag = _createElementTriangleFlag;
_emergency.editTriangleFlag = _editTriangleFlag;

_emergency.createAssemblyArea = _createAssemblyArea; //集结地
_emergency.createElementAssemblyArea = _createElementAssemblyArea;
export default _emergency;
