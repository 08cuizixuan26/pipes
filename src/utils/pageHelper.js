import { postDataQuery } from '@/api/query'

function pgQuery(options) {
  this.queryLayers = options.queryLayers || []
  this.qt = options.qt || 17
  this.pageSize = options.pageSize || 10
  this.pageIndex = options.pageIndex || 1
  this.resultCountArr = options.resultCountArr || []
  this.searchResult = options.searchResult || []
  this.totalCount = options.totalCount || 0
  this.allTotalCount = 0
  this.searchAllResult = []
}

pgQuery.prototype.init = function(callback) {
  var self = this
  if (this.queryLayers.length > 1) {
    self.getResultIndex(function() {
      self.showPage(self.pageIndex, callback)
    })
  } else {
    self.showPage(self.pageIndex, callback)
  }
}

pgQuery.prototype.getResultIndex = function(callback) {
  var self = this
  var queryArr = []
  for (var i = 0; i < self.queryLayers.length; i++) {
    queryArr.push({
      layerid: self.queryLayers[i].guid,
      layername: self.queryLayers[i].name,
      pc: self.queryLayers[i].pc,
      sc: self.queryLayers[i].sc,
      dt: self.queryLayers[i].dt,
      encoding: "utf-8",
      gisServer: self.queryLayers[i].gisServer
    })
  }
  self.resultCountArr = []
  self.totalCount = 0
  self.queryResultIndex(queryArr, callback)
}

pgQuery.prototype.queryResultIndex = function(paramArr, callback) {
  var self = this
  var queryParam = paramArr.shift()
  var params = {
    service: queryParam.layerid,
    qt: 16,
    dt: queryParam.dt,
    pg: '0,3',
    encoding: "utf-8",
    ResType: 1
  }
  if (queryParam.pc) {
    params['pc'] = queryParam.pc
  }
  if (queryParam.sc) {
    params['sc'] = queryParam.sc
  }
  postDataQuery(params, queryParam.gisServer).then((res) => {
    var json = res.data.Json
    if (!json) {
      self.resultCountArr.push(0)
      self.totalCount += 0
    } else {
      self.resultCountArr.push(Number(json.Result['@num']))
      self.totalCount += Number(json.Result['@num'])
    }
    if (paramArr.length == 0) {
      // 查询结束
      if (callback && typeof callback == 'function') {
        callback()
      }
    } else {
      self.queryResultIndex(paramArr, callback)
    }
  })
}

pgQuery.prototype.showPage = function(curPageIndex, callback) {
  var self = this
  self.searchResult = []
  var queryArr = []
  if (self.queryLayers.length == 1) {
    queryArr.push({
      layerid: self.queryLayers[0].guid,
      layername: self.queryLayers[0].name,
      pc: self.queryLayers[0].pc,
      sc: self.queryLayers[0].sc,
      dt: self.queryLayers[0].dt,
      sortField: self.queryLayers[0].sortField,
      pageIndex: curPageIndex - 1,
      count: self.pageSize,
      align: 'left',
      encoding: "utf-8",
      gisServer: self.queryLayers[0].gisServer
    })
  } else {
    var pageCountMin = self.pageSize * (curPageIndex - 1)
    var pageCountMax = self.pageSize * curPageIndex
    var totalNum = 0
    var searchResultArr = []
    for (var i = 0; i < self.resultCountArr.length; i++) {
      totalNum += Number(self.resultCountArr[i])
      if (totalNum > pageCountMin) {
        // 从当前的i开始取数据
        var startNum = totalNum - Number(self.resultCountArr[i])
        if (totalNum < pageCountMax) {
          searchResultArr.push({
            layerid: self.queryLayers[i].guid,
            layername: self.queryLayers[i].name,
            pc: self.queryLayers[i].pc,
            sc: self.queryLayers[i].sc,
            dt: self.queryLayers[i].dt,
            sortField: self.queryLayers[i].sortField,
            startNum: pageCountMin - startNum,
            endNum: Number(self.resultCountArr[i]) - 1,
            encoding: "utf-8",
            gisServer: self.queryLayers[i].gisServer
          })
          pageCountMin = totalNum // 从pageCountMin开始了
        } else {
          // 一页搞定
          searchResultArr.push({
            layerid: self.queryLayers[i].guid,
            layername: self.queryLayers[i].name,
            pc: self.queryLayers[i].pc,
            sc: self.queryLayers[i].sc,
            dt: self.queryLayers[i].dt,
            sortField: self.queryLayers[i].sortField,
            startNum: pageCountMin - startNum,
            endNum: pageCountMax - startNum - 1,
            encoding: "utf-8",
            gisServer: self.queryLayers[i].gisServer
          })
          break
        }
      }
    }

    for (var i = 0; i < searchResultArr.length; i++) {
      var pageSize = self.pageSize
      var count = searchResultArr[i].endNum - searchResultArr[i].startNum + 1
      var pageIndex = Math.floor(searchResultArr[i].startNum / pageSize)
      queryArr.push({
        layerid: searchResultArr[i].layerid,
        layername: searchResultArr[i].layername,
        pc: searchResultArr[i].pc,
        sc: searchResultArr[i].sc,
        dt: searchResultArr[i].dt,
        sortField: searchResultArr[i].sortField,
        pageIndex: pageIndex,
        count: count,
        align: i == 0 ? 'left' : 'right',
        encoding: "utf-8",
        gisServer: searchResultArr[i].gisServer
      })
    }
    if (queryArr.length <= 0) {
      if (callback && typeof callback == 'function') {
        callback(self.searchResult)
      }
      return
    }
  }

  self.queryData(queryArr, callback)
}

pgQuery.prototype.queryData = function(paramArr, callback) {
  var paramObj = paramArr.shift()
  var layerid = paramObj.layerid
  var layername = paramObj.layername
  var pageIndex = paramObj.pageIndex
  var count = paramObj.count
  var align = paramObj.align
  var gisServer = paramObj.gisServer
  var self = this
  var params = {
    service: layerid,
    qt: self.qt,
    dt: paramObj.dt,
    pg: pageIndex + ',' + self.pageSize,
    ResType: 1,
    encoding: "utf-8",
  }
  if (paramObj.sortField) {
    params['order'] = paramObj.sortField
  }
  if (paramObj.pc) {
    params['pc'] = paramObj.pc
  }
  if (paramObj.sc) {
    params['sc'] = paramObj.sc
  }
  postDataQuery(params, gisServer).then((res) => {
    var json = res.data.Json
    var returnRecord = []
    if (json && json.Result && json.Result.Record) {
      returnRecord = json.Result.Record
      if (!Array.isArray(returnRecord)) {
        returnRecord = [returnRecord]
      }
    }
    if (align == 'left') {
      for (var j = 0; j < returnRecord.length && j < count; j++) {
          returnRecord[j]['layerid'] = layerid
          returnRecord[j]['layername'] = layername
        self.searchResult.push(returnRecord[j])
      }
    } else {
      for (var j = returnRecord.length - count; j < returnRecord.length; j++) {
          returnRecord[j]['layerid'] = layerid
          returnRecord[j]['layername'] = layername
        self.searchResult.push(returnRecord[j])
      }
    }
    if (self.queryLayers.length == 1 && pageIndex == 0) {
      self.resultCountArr = [Number(json.Result['@num'])]
      self.totalCount = Number(json.Result['@num'])
    }

    if (paramArr.length > 0) {
      self.queryData(paramArr, callback)
    } else {
      // 查询结束
      if (callback && typeof callback == 'function') {
        if(self.searchResult.length > self.pageSize){
            callback(self.searchResult.slice(self.pageSize))
        }else{
            callback(self.searchResult)
        }
      }
    }
  })
}

pgQuery.prototype.queryAllData = function(paramArr, callback) {
  var paramObj = paramArr.shift()
  var layerid = paramObj.layerid
  var gisServer = paramObj.gisServer
  var self = this
  var countParams = {
    service: layerid,
    qt: 16,
    dt: paramObj.dt,
    pg: '0,3',
    ResType: 1,
    encoding: "utf-8",
  }
  if (paramObj.sortField) {
    countParams['order'] = paramObj.sortField
  }
  if (paramObj.pc) {
    countParams['pc'] = paramObj.pc
  }
  if (paramObj.sc) {
    countParams['sc'] = paramObj.sc
  }
  let curPage = 1
  let recordNum = 0
  let pageCount = 1
  postDataQuery(countParams, gisServer).then((res) => {
    var json = res.data.Json
    recordNum = Number(json.Result['@num'])
    pageCount = Math.ceil(recordNum / 10000)
    requestByPage()
  })
  function requestByPage() {
    var params = {
      service: layerid,
      qt: self.qt,
      dt: paramObj.dt,
      pg: `${curPage - 1},10000`,
      ResType: 1,
      encoding: "utf-8",
    }
    if (paramObj.sortField) {
      params['order'] = paramObj.sortField
    }
    if (paramObj.pc) {
      params['pc'] = paramObj.pc
    }
    if (paramObj.sc) {
      params['sc'] = paramObj.sc
    }
    postDataQuery(params, gisServer).then((res) => {
      var json = res.data.Json
      var returnRecord = []
      if (json && json.Result && json.Result.Record) {
        returnRecord = json.Result.Record
        if (!Array.isArray(returnRecord)) {
          returnRecord = [returnRecord]
        }
      }
      self.searchAllResult = self.searchAllResult.concat(returnRecord)
      if (curPage < pageCount) {
        curPage++
        requestByPage()
      } else {
        if (paramArr.length > 0) {
          self.queryAllData(paramArr, callback)
        } else {
          // 查询结束
          if (callback && typeof callback == 'function') {
            callback(self.searchAllResult)
          }
        }
      }
    })
  }
}

pgQuery.prototype.getAllData = function(callback) {
  var self = this
  var queryArr = []
  for (var i = 0; i < this.queryLayers.length; i++) {
    queryArr.push({
      layerid: this.queryLayers[i].guid,
      pc: this.queryLayers[i].pc,
      sc: this.queryLayers[i].sc,
      dt: this.queryLayers[i].dt,
      sortField: this.queryLayers[i].sortField,
      encoding: "utf-8",
      gisServer: this.queryLayers[i].gisServer
    })
  }
  self.searchAllResult = []
  if (queryArr.length <= 0) {
    if (callback && typeof callback == 'function') {
      callback(self.searchResult)
    }
    return
  }
  self.queryAllData(queryArr, callback)
}

// ///////////////////////////////////特殊场景用到START//////////////////////////////////////////////////////////////////////////////
pgQuery.prototype.getAllTotalCount = function(callback) {
  var self = this
  self.getAllResultIndex(function() {
    self.allTotalCount = self.totalCount
    if (callback && typeof callback == 'function') {
      callback()
    }
  })
}

pgQuery.prototype.getAllResultIndex = function(callback) {
  var self = this
  var queryArr = []
  for (var i = 0; i < self.queryLayers.length; i++) {
    queryArr.push({
      layerid: self.queryLayers[i].guid,
      pc: self.queryLayers[i].pcAll,
      sc: self.queryLayers[i].sc,
      dt: self.queryLayers[i].dt,
      sortField: self.queryLayers[i].sortField,
      encoding: "utf-8",
      gisServer: self.queryLayers[i].gisServer
    })
  }
  self.resultCountArr = []
  self.totalCount = 0
  self.queryResultIndex(queryArr, callback)
}

// ///////////////////////////////////特殊场景用到END//////////////////////////////////////////////////////////////////////////////

export default pgQuery
