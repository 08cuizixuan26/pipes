<template>
  <popover
    :visible.sync="settingQuery"
    :show-header="true"
    :before-close="handleClose"
    :title="titleName"
    custom-class="settingPanel"
  >
    <div class="contain-div">
      <div
        :class="[
          'static-menu-item',
          { 'static-menu-item-active': typeId == 'pipe' },
        ]"
        @click="switchType('pipe')"
      >
        <span class="static-menu-inner"> 管线查询字段配置 </span>
      </div>
      <div
        :class="[
          'static-menu-item',
          { 'static-menu-item-active': typeId == 'else' },
        ]"
        @click="switchType('else')"
      >
        <span class="static-menu-inner"> 查询图层配置 </span>
      </div>
    </div>
    <div class="contain-div" v-if="typeId == 'pipe'" style="margin-top: 10px">
      <div>
        <el-row class="field-title">管线表字段</el-row>
        <el-row class="field-container">
          <el-scrollbar style="height: 100%" wrap-class="scrollbar-wrapper">
            <el-checkbox-group v-model="checkLineList">
              <el-checkbox
                v-for="item in lineFieldList"
                :key="item._FieldName"
                :label="item._CaptionName"
              ></el-checkbox>
            </el-checkbox-group>
          </el-scrollbar>
        </el-row>
      </div>
      <div>
        <el-row class="field-title">管点表字段</el-row>
        <el-row class="field-container">
          <el-scrollbar style="height: 100%" wrap-class="scrollbar-wrapper">
            <el-checkbox-group v-model="checkPointList">
              <el-checkbox
                v-for="item in pointFieldList"
                :key="item._FieldName"
                :label="item._CaptionName"
              ></el-checkbox>
            </el-checkbox-group>
          </el-scrollbar>
        </el-row>
      </div>
      <div>
        <el-row class="field-title">管面表字段</el-row>
        <el-row class="field-container">
          <el-scrollbar style="height: 100%" wrap-class="scrollbar-wrapper">
            <el-checkbox-group v-model="checkPolygonList">
              <el-checkbox
                v-for="item in polygonFieldList"
                :key="item._FieldName"
                :label="item._CaptionName"
              ></el-checkbox>
            </el-checkbox-group>
          </el-scrollbar>
        </el-row>
      </div>
    </div>
    <div v-else style="margin-top: 10px">
      <el-table
        v-loading="tableLoading"
        ref="multipleTable"
        size="mini"
        :data="tableData"
        max-height="280"
        :show-header="false"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="45"> </el-table-column>
        <el-table-column prop="name" label="图层名称" width="140">
        </el-table-column>
        <el-table-column label="关键字段">
          <template slot-scope="scope">
            <el-select
              v-model="scope.row.selectField"
              v-if="scope.row.type == 'GISServer'"
              placeholder="请选择关键字"
              :disabled="scope.row.fieldList.length == 0"
            >
              <el-option
                v-for="(item, index) in scope.row.fieldList"
                :key="index"
                :label="item.Name"
                :value="item.Name"
              ></el-option>
            </el-select>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="footer" style="margin-top: 10px">
      <el-button type="primary" size="mini" @click="handleSaveClick"
        ><span>保存</span>
      </el-button>
    </div>
  </popover>
</template>

<script>
import popover from "@/components/Popover";
import {
  getFiledCfgXml,
  getNameNoIgnoreCase,
  getNameNoIgnoreCase1,
  postGeoServer,
} from "@/api/query";
import localStorage from "@/stamplib/LocalStorage";

export default {
  data() {
    this.$filedCfgJson = null;
    return {
      titleName: "快速查询配置",
      settingQuery: false,
      typeId: "pipe",
      checkLineList: [],
      lineFieldList: [],
      checkPointList: [],
      pointFieldList: [],
      checkPolygonList: [],
      polygonFieldList: [],
      tableData: [],
      tableSelection: [],
      isFirst: false,
      tableLoading: false,
    };
  },
  mounted () {
    //解决鼠标移出el-table表头鼠标样式丢失问题
    this.$nextTick(function(){
        var doms = document.querySelectorAll('th');
        doms.forEach(item =>{
            var cursorstyle = "";
            item.addEventListener("mouseenter",function(){
                cursorstyle = document.body.style.cursor;
            });
            item.addEventListener("mouseout",function(){
                document.body.style.cursor = cursorstyle;
            })
        })
    })
  },
  computed: {
    layerData() {
      return this.$store.state.layerData;
    },
  },
  components: {
    popover,
  },
  methods: {
    handleClose() {
      this.settingQuery = false;
    },
    filterField(item) {
      return item._FieldName;
    },
    show() {
      this.settingQuery = true;
      this.checkLineList = [];
      this.checkPointList = [];
      this.checkPolygonList = [];
      this.lineFieldList = [];
      this.pointFieldList = [];
      this.polygonFieldList = [];
      this.tableData = [];
      this.isFirst = true;

      this.getLayerData(this.layerData);

      let urlSearch = this.g_Project.FieldMap;
      if (urlSearch == "") {
        this.$message({
          message: "当前工程没有管线配置信息",
          type: "warning",
        });
        return;
      }

      this.tableSelection = [];
      STAMP_config.quickQuerySetting.map((item) => {
        if (item.type == "pipe") {
          if (item.searchType == "line") {
            this.checkLineList.push(item.name);
          } else if (item.searchType == "point") {
            this.checkPointList.push(item.name);
          } else if (item.searchType == "polygon") {
            this.checkPolygonList.push(item.name);
          }
        } else if (item.type == "model" || item.type == "GISServer") {
          for (let index = 0; index < this.tableData.length; index++) {
            const row = this.tableData[index];
            if (row.name == item.name) {
              row.selectField = item.value;
              this.tableSelection.push(row);
              break;
            }
          }
        }
      });

      getFiledCfgXml(urlSearch, this).then((res) => {
        this.lineFieldList =
          res.PipelineFieldMap.LineFieldInfo.SystemFieldList.FieldMapItem.filter(
            this.filterField
          );
        if (
          res.PipelineFieldMap.LineFieldInfo.CustomerFieldList &&
          res.PipelineFieldMap.LineFieldInfo.CustomerFieldList.FieldMapItem
        ) {
          let tempArr =
            res.PipelineFieldMap.LineFieldInfo.CustomerFieldList.FieldMapItem;
          this.lineFieldList.concat(tempArr);
        }
        this.pointFieldList =
          res.PipelineFieldMap.PointFieldInfo.SystemFieldList.FieldMapItem.filter(
            this.filterField
          );
        if (
          res.PipelineFieldMap.PointFieldInfo.CustomerFieldList &&
          res.PipelineFieldMap.PointFieldInfo.CustomerFieldList.FieldMapItem
        ) {
          let tempArr =
            res.PipelineFieldMap.PointFieldInfo.CustomerFieldList.FieldMapItem;
          this.pointFieldList.concat(tempArr);
        }
        this.polygonFieldList =
          res.PipelineFieldMap.RoomFieldInfo.SystemFieldList.FieldMapItem.filter(
            this.filterField
          );
        if (
          res.PipelineFieldMap.RoomFieldInfo.CustomerFieldList &&
          res.PipelineFieldMap.RoomFieldInfo.CustomerFieldList.FieldMapItem
        ) {
          let tempArr =
            res.PipelineFieldMap.RoomFieldInfo.CustomerFieldList.FieldMapItem;
          this.polygonFieldList.concat(tempArr);
        }
      });
    },
    switchType(type) {
      this.typeId = type;

      if (
        this.typeId == "else" &&
        this.isFirst &&
        this.tableSelection.length > 0
      ) {
        this.isFirst = false;

        let self = this;
        this.$nextTick(function () {
          self.tableSelection.forEach((row) => {
            self.$refs.multipleTable.toggleRowSelection(row);
          });
        });
      }
    },
    getLayerData(root) {
      for (let i = 0; i < root.length; i++) {
        let item = root[i];
        if (item.children && item.children.length > 0) {
          this.getLayerData(item.children);
        } else {
          let subLayer = this.stampAPI.usearth.LayerManager.GetLayerByGUID(
            item.id
          );

          if (
            subLayer.get_LayerType() == "Model" ||
            subLayer.get_LayerType() == "Block" ||
            subLayer.get_LayerType() == "ObliquePhoto" ||
            subLayer.get_LayerType() == "ModelLod" ||
            subLayer.get_LayerType() == "VectorTile" ||
            subLayer.get_LayerType() == "TileBlock" ||
            subLayer.get_LayerType() == "Billboard" ||
            subLayer.get_LayerType() == "MatchModel"
          ) {
            let type = "model";
            if (
              subLayer.get_LayerType() == "VectorTile" ||
              subLayer.get_LayerType() == "TileBlock"
            ) {
              type = "GISServer";
            } else if (subLayer._gis_server_connection) {
              type = "GISServer";
            }
            if (
              subLayer.get_LayerType() == "ObliquePhoto" &&
              !subLayer._gis_server_connection
            ) {
              continue;
            }
            this.tableData.push({
              name: item.name,
              guid: item.id,
              selectField: "",
              fieldList: [],
              type: type,
            });
          } else {
          }
        }
      }
    },
    handleSelectionChange(selection) {
      this.tableSelection = selection;

      for (let i = 0; i < selection.length; i++) {
        if (
          selection[i].type == "GISServer" &&
          selection[i].fieldList.length == 0
        ) {
          let self = this;
          self.tableLoading = true;
          var queryLayer = this.stampAPI.usearth.LayerManager.GetLayerByGUID(
            selection[i].guid
          );
          var postDataParam = `service=${selection[i].guid}&qt=0`;
          postGeoServer(postDataParam, queryLayer._gis_server_connection)
            .then(function (res) {
              var json = self.$x2js.xml2js(res.data).Xml;
              let fields = json.MetaData.Table.Field;
              Array.isArray(fields) || (fields = [fields]);
              selection[i].fieldList = fields;
            })
            .finally(() => {
              self.tableLoading = false;
            });
        }
      }
    },
    handleSaveClick() {
      let self = this;

      let data = [];
      this.lineFieldList.map((item) => {
        if (self.checkLineList.indexOf(item._CaptionName) > -1) {
          data.push({
            value: item._StandardName,
            name: item._CaptionName,
            type: "pipe",
            searchType: "line",
          });
        }
      });

      this.pointFieldList.map((item) => {
        if (self.checkPointList.indexOf(item._CaptionName) > -1) {
          data.push({
            value: item._StandardName,
            name: item._CaptionName,
            type: "pipe",
            searchType: "point",
          });
        }
      });
      this.polygonFieldList.map((item) => {
        if (self.checkPolygonList.indexOf(item._CaptionName) > -1) {
          data.push({
            value: item._StandardName,
            name: item._CaptionName,
            type: "pipe",
            searchType: "polygon",
          });
        }
      });

      this.tableSelection.map((item) => {
        data.push({
          type: item.type,
          searchType: item.guid,
          name: item.name,
          value: item.selectField,
        });
      });

      STAMP_config.quickQuerySetting = data;

      self.$store.state.searchItemData = STAMP_config.quickQuerySetting;
      if (STAMP_config.quickQuerySetting.length > 0) {
        self.$store.state.searchItem = STAMP_config.quickQuerySetting[0].name;
      }

      localStorage.saveToDB(
        self.stampAPI.usearth,
        "quickQuerySetting",
        data,
        function () {
          self.$message({
            message: "保存成功",
            type: "success",
            center: true,
          });
        }
      );
      self.handleClose();
    },
  },
};
</script>

<style lang="less" scoped>
.settingPanel {
  width: 390px;
  right: calc(20vw + 360px);
}
.contain-div {
  display: flex;
}
.static-menu-item {
  position: relative;
  cursor: pointer;
  width: 120px;
  height: 33px;
  line-height: 33px;
  margin-left: 6px;
  margin-right: 6px;
  background-color: rgba(84, 74, 32, 0.8);
  border-radius: 5px 5px 0 0;
  border-left: 1px solid rgba(255, 174, 3, 0.3);
  border-top: 1px solid rgba(255, 174, 3, 0.3);
  border-right: 1px solid rgba(255, 174, 3, 0.3);
}
.static-menu-item-active {
  background-color: rgba(159, 121, 28, 0.8);
  border-left: 1px solid rgba(253, 168, 6, 0.8);
  border-top: 1px solid rgba(253, 168, 6, 0.8);
  border-right: 1px solid rgba(253, 168, 6, 0.8);
}
.static-menu-inner {
  position: absolute;
  left: 0px;
  width: 100%;
  height: 100%;
  font-size: 14px !important;
  font-family: ShiShangZhongHeiJianTi;
  text-shadow: 0px 1px 1px rgba(2, 28, 34, 0.6);
}
.field-title {
  margin-left: 5px;
  text-align: left;
}
.field-container {
  margin: 5px 0 0 5px;
  padding-left: 5px;
  width: 120px;
  height: 217px;
  border: 1px solid rgba(255, 174, 3, 0.5);
  color: white;
  text-align: left;
}
/deep/ .scrollbar-wrapper {
  overflow-x: hidden !important;
}
/deep/ .el-scrollbar__bar.is-horizontal {
  display: none;
}
/deep/ .el-checkbox__label {
  color: #fff;
}
/deep/ .el-table {
  border: 1px solid rgba(255, 174, 3, 0.5);
}
/deep/ .el-table td {
  text-align: left;
}
</style>