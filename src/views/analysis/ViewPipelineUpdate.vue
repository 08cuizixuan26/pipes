<template>
  <Popover
    :visible.sync="dialogVisible"
    :show-header="true"
    title="管线更新"
    custom-class="pipelineupdate"
    :beforeClose="handleClose"
  >
    <div class="pipelineupdate-container">
      <el-row>
        <el-col :span="8" class="pipelineupdate-container-text">
          <div>更新范围:</div>
        </el-col>
        <el-col :span="8">
          <el-input
            v-model="inputFilePath"
            placeholder="shp文件"
            v-input-focus
          ></el-input>
        </el-col>
        <el-col :span="8">
          <el-button size="mini" type="primary" @click="selectFile"
            >选择文件</el-button
          >
          <input
            type="file"
            style="display: none"
            @change="handleChange"
            multiple="multiple"
            accept=".shp, .dbf"
            ref="input"
          />
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8" class="pipelineupdate-container-text">
          <div>更新图层:</div>
        </el-col>
        <el-row>
          <el-col :span="16">
            <el-scrollbar wrap-class="scrollbar-wrapper-upData">
              <el-checkbox-group v-model="checkPipe" size="mini">
                <el-checkbox
                  v-for="(item, key) in pipeList"
                  :key="key"
                  :label="item.guid"
                  class="pipeCheck"
                  style="display: block"
                  >{{ item.name }}</el-checkbox
                >
              </el-checkbox-group>
            </el-scrollbar>
          </el-col>
        </el-row>
      </el-row>
    </div>
  </Popover>
</template>

<script>
import Popover from "@/components/Popover";
import shapeManager from "@/utils/shapeManager";
import { postXml } from "@/api/common";
export default {
  name: "viewPipelineUpdate",
  data() {
    this._shpDbf = "";
    this.$features = null;
    return {
      dialogVisible: true,
      inputFilePath: "",
      pipeList: [],
      data: {},
      checkPipe: [],
      loading: false,
    };
  },
  components: {
    Popover,
  },
  computed: {
    analysisDisable() {
      return this.checkPipe.length == 0 || !this.inputFilePath;
    },
  },
  methods: {
    selectFile() {
      this.$refs.input.value = null;
      this.$refs.input.click();
    },
    handleChange(ev) {
      const files = ev.target.files;
      if (!files) return;
      this.inputFilePath = files[0].name;
      this._shpDbf = shapeManager.checkShpDbf(files);
      if (this._shpDbf == null) {
        //选择文件不符合规范
        this.inputFilePath = "";
        this.$message({
          message: "请选择且仅选择一组对应的shp文件和dbf文件",
          type: "warning",
          center: true,
        });
        // this.clearVectorFile();
        return;
      }
      const self = this;
      shapeManager.readShapeFile(
        this._shpDbf.shpFile,
        this._shpDbf.dbfFile,
        null,
        function (feature) {
          const geometry = feature[0].geometry;
          if (Object.is(geometry.type, shapeManager.geometryType.Polygon)) {
            self.inputFilePath =
              self._shpDbf.shpFile.name + "," + self._shpDbf.dbfFile.name;
            // let property = feature.properties;
            self.$features = feature;
          } else {
            this.inputFilePath = "";
            this.$message({
              message: "请选择面数据",
              type: "warning",
              center: true,
            });
          }
        }
      );
    },
    pushReq() {
      let url = "se_pipeline_publish_tool?type=areapublish&is_webgl=true&guid=";
      let flag = false;
      for (let guid of this.checkPipe) {
        for (let feature of this.$features) {
          let data = "";
          for (let coordinate of feature.geometry.coordinates[0]) {
            data = `${data}<location>${coordinate[0]},${coordinate[1]}</location>`;
          }
          data = `<?xml version="1.0" encoding="gbk"?><xml><locations>${data}</locations></xml>`;
          this.loading = true;
          postXml(url + guid, data).then((res) => {
            let result = this.$x2js.xml2js(res.data);
            this.loading = false;
            if (result.xml.result == "true") {
              this.$message({
                message: "更新管线数据成功",
                type: "success",
                center: true,
              });
            } else {
              this.$message({
                message: "更新管线数据失败",
                type: "warn",
                center: true,
              });
            }
          });
        }
      }
    },
    handleClose() {
      this.$router.push("/");
    },
  },
  mounted() {
    this.pipeList = this.g_Project.pipeListData;
  },
  beforeRouteLeave(to, from, next) {
    next();
    this.$parent.$refs.functionPanel.curSelMenu.name = "";
  },
};
</script>

<style lang="less" scoped>
.pipelineupdate {
  width: 300px;
}

.el-row {
  margin-bottom: 5px;

  &:last-child {
    margin-bottom: 0px;
  }
}

.pipelineupdate-container {
  // height: 550px;
  font-size: 16px;

  .pipelineupdate-container-text {
    height: 30px;
    line-height: 30px;
  }

  .pipelineupdate-container-result {
    height: 30px;
    line-height: 30px;
    font-weight: 700;
    text-align: left;
    padding-left: 10px;
    // background: rgba(1, 76, 91, 1);
  }

  /deep/ .scrollbar-wrapper-upData {
    overflow-x: hidden !important;
  }

  .el-scrollbar__bar.is-vertical {
    right: 0px;
  }

  .pipeCheck {
    text-align: left;
    display: block;
    color: #ffffff;
    margin-left: 4px;
  }

  .el-scrollbar {
    height: 120px;
    margin-top: 4px;
    border: 1px solid rgba(255, 174, 3, 0.5);
    margin-bottom: 6px;
    margin-right: 5px;
  }
}
</style>
