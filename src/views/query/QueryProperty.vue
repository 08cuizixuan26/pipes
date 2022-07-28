<template>
  <div class="queryproperty">
    <div class="threeMenu">
      <el-scrollbar wrap-class="tab-scrollbar-wrapper">
        <el-tree
          v-if="dataResult && dataResult.length > 1"
          :data="dataResult"
          :props="defaultProps"
          @node-click="handleNodeClick"
          highlight-current
          default-expand-all
        ></el-tree>
        <table>
          <tbody>
            <tr v-for="(item, i) in resultInfo" :key="i">
              <td class="col w80p">{{ item.key }}</td>
              <td class="col w180p">{{ item.value }}</td>
            </tr>
          </tbody>
        </table>
      </el-scrollbar>
    </div>
  </div>
</template>

<script>
import $ from "jquery";
import { serviceWithoutIp } from "@/utils/request";
import { queryBIMProperties } from "@/api/stampManagerService";
import {
  postDataQuery,
  getFiledCfgXml,
  getNameNoIgnoreCase,
  getNameNoIgnoreCase1,
} from "@/api/query";

var pickQuery = null;

export default {
  name: "QueryProperty",
  data() {
    return {
      dataResult: [],
      defaultProps: {
        children: "children",
        label: "name",
      },
      resultInfo: [],
    };
  },
  computed: {
    queryResult() {
      return this.$route.query;
    },
  },
  watch: {
    queryResult(value) {
      this.dataResult = value.type;
      if (this.dataResult && this.dataResult[0].queryType) {
        this.handleNodeClick(this.dataResult[0]);
      } else {
        this.resultInfo = value.info;
      }
      pickQuery = value.pick;
    },
  },
  methods: {
    handleNodeClick(data) {
      let self = this;
      if (data.queryType == "BIM") {
        let path = data.queryInfo.path;
        let key = data.queryInfo.key;
        queryBIMProperties(path, key)
          .then((resultInfo) => {
            var result = [];
            for (var key in resultInfo.data) {
              result.push({
                key: key,
                value: resultInfo.data[key],
              });
            }
            self.resultInfo = result;
            data.result = result;
            data.queryType = null;
            data.queryInfo = null;
          })
          .catch((err) => {
            self.resultInfo = data.result;
          });
      } else if (data.queryType == "GISServer") {
        let url = data.queryInfo.url;
        serviceWithoutIp({
          method: "get",
          url: url,
          responseType: "text",
        })
          .then((response) => {
            var d = self.$x2js.xml2js(response.data);
            if (d && d.Xml && d.Xml.Result && d.Xml.Result.Record) {
              var record = d.Xml.Result.Record;
              if (Array.isArray(d.Xml.Result.Record)) {
                record = d.Xml.Result.Record[0];
              }
              var result = [];
              for (var key in record) {
                if (key == "SHAPE") {
                  continue;
                }
                result.push({
                  key: key,
                  value: record[key],
                });
              }
              self.resultInfo = result;
              data.result = result;
              data.queryType = null;
              data.queryInfo = null;
            } else {
              self.resultInfo = data.result;
            }
          })
          .catch((err) => {
            self.resultInfo = data.result;
          });
      } else if (data.queryType == "pipe") {
        let fieldMap = data.queryInfo.fieldMap;
        let layerType = data.queryInfo.layerType;
        let layerGuid = data.queryInfo.layerGuid;
        let key = data.queryInfo.key;
        let gisServer = data.queryInfo.gisServer;

        var searchType = "line";
        var postDataParam = "";
        let tableType = "1";
        getFiledCfgXml(fieldMap, self)
          .then((resXml) => {
            let lFiled = getNameNoIgnoreCase(resXml, "US_KEY", "1", true);
            let pFiled = getNameNoIgnoreCase(resXml, "US_KEY", "0", true);

            if (layerType == "container" || layerType == "container_og") {
              searchType = "line";
              tableType = "1";
              //   postDataParam = `service=${layerGuid}&qt=16&dt=${searchType}&pc=(and,equal,${lFiled},${key})&pg=0,10`;
              postDataParam = {
                service: layerGuid,
                qt: 16,
                dt: searchType,
                pc: `(and,equal,${lFiled},${key})`,
                pg: "0,10",
                encoding: "utf-8",
              };
            } else if (
              layerType == "plate" ||
              layerType == "well" ||
              layerType == "joint" ||
              layerType == "equipment" ||
              layerType == "joint_og"
            ) {
              searchType = "point";
              tableType = "0";
              //   postDataParam = `service=${layerGuid}&qt=16&dt=${searchType}&pc=(and,equal,${pFiled},${key})&pg=0,10`;
              postDataParam = {
                service: layerGuid,
                qt: 16,
                dt: searchType,
                pc: `(and,equal,${pFiled},${key})`,
                pg: "0,10",
                encoding: "utf-8",
              };
            } else if (layerType == "room") {
              searchType = "polygon";
              tableType = "3";
              //   postDataParam = `service=${layerGuid}&qt=16&dt=${searchType}&pc=(and,equal,${lFiled},${key})&pg=0,10`;
              postDataParam = {
                service: layerGuid,
                qt: 16,
                dt: searchType,
                pc: `(and,equal,${lFiled},${key})`,
                pg: "0,10",
                encoding: "utf-8",
              };
            }
            postDataQuery(postDataParam, gisServer)
              .then(function (res) {
                var json = self.$x2js.xml2js(res.data).Xml;
                if (json && json.Result._num > 0) {
                  var Record = json.Result.Record;
                  Array.isArray(Record) || (Record = [Record]);
                  var result = [];
                  for (var key in Record[0]) {
                    if (Record[0][key] && Record[0][key] != "") {
                      let tempKey = getNameNoIgnoreCase1(
                        resXml,
                        key,
                        tableType,
                        false
                      );

                      result.push({
                        key: tempKey,
                        value: Record[0][key],
                      });
                    }
                  }
                  self.resultInfo = result;
                  data.result = result;
                  data.queryType = null;
                  data.queryInfo = null;
                } else {
                  self.resultInfo = data.result;
                }
              })
              .catch((err) => {
                self.resultInfo = data.result;
              });
          })
          .catch((err) => {
            self.resultInfo = data.result;
          });
      } else {
        self.resultInfo = data.result;
      }
    },
  },
  mounted() {
    this.dataResult = this.queryResult.type;

    if (this.dataResult && this.dataResult[0].queryType) {
      this.handleNodeClick(this.dataResult[0]);
    } else {
      this.resultInfo = this.queryResult.info;
    }
  },
  beforeRouteLeave(to, from, next) {
    next();

    if (this.stampAPI.lastLayer) {
      this.stampAPI.lastLayer._highlight_objs = [];
      this.stampAPI.lastLayer = null;
    }
    if (this.stampAPI.lastObj && this.stampAPI.lastObj.length > 0) {
      for (var i = 0; i < this.stampAPI.lastObj.length; ++i) {
        this.stampAPI.usearth.document.elementRoot.detach_object(
          this.stampAPI.lastObj[i]
        );
      }
      this.stampAPI.lastObj = [];
    }
    this.stampAPI.usearth.application._selectedEntity = undefined;
    if (pickQuery) {
      pickQuery.cancelPickQuery();
    }
  },
};
</script>

<style lang="less" scoped>
.queryproperty {
  height: 100%;
  color: white;
  text-align: left;
  font-size: 14px;
}
.col {
  text-align: center;
  border-bottom: 1px solid #cccccc;
  height: 32px;
  word-break: break-all;
}
.w80p {
  width: 80px;
}
.w180p {
  width: 180px;
}
.selected {
  font-weight: bold;
  background: #ff99cc;
  color: #fff;
}

/deep/ .el-tree-node__content:hover {
  background-color: rgba(24, 144, 255, 0.7);
}
/deep/ .el-tree-node:focus > .el-tree-node__content {
  background-color: rgba(24, 144, 255, 0.7);
}

.threeMenu {
  height: calc(100vh - 102px);
  .tab-scrollbar-wrapper {
    overflow-x: hidden !important;
    width: calc(100% - 5px);
  }

  .el-scrollbar__bar.is-vertical {
    right: 0px;
  }
  .el-scrollbar {
    height: 100%;
  }
  /deep/ .el-scrollbar__wrap {
    height: calc(100% + 8px);
  }
  .is-horizontal {
    display: none;
  }
}
</style>