<template>
  <div>
    <popover
      :visible.sync="dialogVisible"
      :title="titleName"
      :before-close="handleClose"
      custom-class="searchResult"
    >
      <el-scrollbar wrap-class="tab-scrollbar-wrapper">
        <el-tree
          v-if="dataResult && dataResult.length > 1"
          :data="dataResult"
          :props="defaultProps"
          highlight-current
          default-expand-all
          @node-click="handleNodeClick"
        />
        <table>
          <tbody>
            <tr v-for="(item, i) in resultInfo" :key="i">
              <td class="col w80p">{{ item.key }}</td>
              <td class="col w180p">{{ item.value }}</td>
            </tr>
          </tbody>
        </table>
      </el-scrollbar>
    </popover>
  </div>
</template>

<script>
import popover from "@/components/Popover";
import { serviceWithoutIp } from "@/utils/request";
import { queryBIMProperties } from "@/api/stampManagerService";
import {
  postDataQuery,
  getFiledCfgXml,
  getFiledCfgXmlUtf8,
  getNameNoIgnoreCase,
  getNameNoIgnoreCase1,
  getNameNoIgnoreCaseByCaptionName,
} from "@/api/query";

export default {
  name: "QueryProperty",
  components: {
    popover,
  },
  data() {
    this.$pickQuery = null;
    return {
      dialogVisible: true,
      titleName: "属性查询",
      dataResult: [],
      defaultProps: {
        children: "children",
        label: "name",
      },
      resultInfo: [],
    };
  },
  computed: {},
  watch: {},
  mounted() {},
  beforeDestroy() {
    this.clear();
  },
  methods: {
    show(data) {
      this.dataResult = data.type;
      if (this.dataResult && this.dataResult[0].queryType) {
        this.handleNodeClick(this.dataResult[0]);
      } else {
        this.resultInfo = data.info;
      }
      this.$pickQuery = data.pick;
    },
    clear() {
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
      if (this.$pickQuery) {
        this.$pickQuery.cancelPickQuery();
        this.$pickQuery = null;
      }
    },
    handleNodeClick(data) {
      debugger;
      const self = this;
      if (data.queryType == "BIM") {
        const path = data.queryInfo.path;
        const key = data.queryInfo.key;
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
          .catch(() => {
            self.resultInfo = data.result;
          });
      } else if (data.queryType == "GISServer") {
        let fieldXml =
          custom_config.server_ip + "/sde?" + data.queryInfo.fieldXml + "_sde";

        getFiledCfgXmlUtf8(fieldXml, self)
          .then((resXml) => {
            let url = data.queryInfo.url;
            if (data.queryInfo.sc) {
              url += data.queryInfo.sc;
            } else if (data.queryInfo.pc) {
              url += data.queryInfo.pc;
            } else if (resXml && resXml.xml) {
              var pc = `&pc=(and,equal,${resXml.xml.KeyField},${data.queryInfo.key})`;
              url += pc;
            } else {
              url = "";
            }

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
                    if (resXml.xml) {
                      var caption = self.getCaptionName(resXml.xml, key);
                      if (caption) {
                        result.push({
                          key: caption,
                          value: record[key],
                        });
                      }
                    } else {
                      result.push({
                        key: key,
                        value: record[key],
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
              .catch(() => {
                self.resultInfo = data.result;
              });
          })
          .catch((err) => {
            self.resultInfo = data.result;
          });
      } else if (data.queryType == "pipe") {
        const fieldMap = data.queryInfo.fieldMap;
        const layerType = data.queryInfo.layerType;
        const layerGuid = data.queryInfo.layerGuid;
        let key = data.queryInfo.key;
        let gisServer = data.queryInfo.gisServer;

        if (
          key.substr(key.length - 2, 2) == "_1" ||
          key.substr(key.length - 2, 2) == "_2" ||
          key.substr(key.length - 2, 2) == "_3"
        ) {
          key = key.substr(0, key.length - 2);
        }
        var searchType = "line";
        var postDataParam = "";
        let tableType = "1";
        getFiledCfgXml(fieldMap, self)
          .then((resXml) => {
            const lFiled = getNameNoIgnoreCase(resXml, "US_KEY", "1", true);
            const pFiled = getNameNoIgnoreCase(resXml, "US_KEY", "0", true);

            if (layerType == "container" || layerType == "container_og") {
              searchType = "line";
              tableType = "1";
              //   postDataParam = `service=${layerGuid}&qt=16&dt=${searchType}&pc=(and,equal,${lFiled},${key})&pg=0,10&encoding=utf-8&`;
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
              //   postDataParam = `service=${layerGuid}&qt=16&dt=${searchType}&pc=(and,equal,${pFiled},${key})&pg=0,10&encoding=utf-8&`;
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
              //   postDataParam = `service=${layerGuid}&qt=16&dt=${searchType}&pc=(and,equal,${lFiled},${key})&pg=0,10&encoding=utf-8&`;
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
                      const tempKey = getNameNoIgnoreCase1(
                        resXml,
                        key,
                        tableType,
                        false
                      );

                      const flag = getNameNoIgnoreCaseByCaptionName(
                        resXml,
                        tempKey.toUpperCase(),
                        tableType,
                        true,
                        true
                      );
                      if (flag) {
                        result.push({
                          key: tempKey,
                          value: Record[0][key],
                        });
                      }
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
              .catch(() => {
                self.resultInfo = data.result;
              });
          })
          .catch(() => {
            self.resultInfo = data.result;
          });
      } else {
        self.resultInfo = data.result;
      }
    },
    getCaptionName(xml, fieldName) {
      var caption = null;
      let items = xml.Fields.FieldItem;
      Array.isArray(items) || (items = [items]);
      for (let i = 0; i < items.length; i++) {
        if (items[i]._fieldName == fieldName) {
          caption = items[i]._captionName;
          break;
        }
      }
      return caption;
    },
    handleClose() {
      this.clear();
      this.$parent.closeSearchResult();
    },
  },
};
</script>

<style lang="less" scoped>
.searchResult {
  width: 100%;
  max-width: 16.792vw;
  height: 68vh;
  position: fixed;
  top: 17vh;
  left: 10px;
  z-index: 100;
}
/deep/.el-dialog__body {
  height: calc(100% - 35px);
}
/deep/.el-scrollbar {
  height: 100%;
}
.tab-scrollbar-wrapper {
  width: 100%;
  height: 100%;
}
.col {
  text-align: center;
  border-bottom: 1px solid rgba(128, 128, 128, 0.5);
  height: 32px;
  word-break: break-all;
}
.w80p {
  width: 100px;
}
.w180p {
  width: 280px;
}

/deep/ .el-tree-node__content:hover {
  background-color: rgba(24, 144, 255, 0.7);
}
/deep/ .el-tree-node:focus > .el-tree-node__content {
  background-color: rgba(24, 144, 255, 0.7);
}
</style>
