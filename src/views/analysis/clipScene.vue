<template>
  <Popover
    :visible.sync="dialogVisible"
    :show-header="true"
    title="剖切分析"
    custom-class="clipScene"
    :beforeClose="handleClose"
  >
    <div class="clipSceneDiv">
      <el-row>
        <el-col>
          <span>图层类型:</span>
          <el-select
            v-model="typeValue"
            placeholder="请选择"
            size="mini"
            :disabled="analysised"
            multiple
            collapse-tags
            @change="selChange"
          >
            <el-option
              v-for="item in types"
              :key="item.value"
              :label="item.label"
              :value="item.value"
              :disabled="item.disabled"
            ></el-option>
          </el-select>
        </el-col>
      </el-row>
      <el-row>
        <el-col>
          <span>方向:</span>
          <el-radio v-model="direction" label="0" :disabled="analysised"
            >垂直</el-radio
          >
          <el-radio v-model="direction" label="1" :disabled="analysised"
            >水平</el-radio
          >
        </el-col>
      </el-row>
      <el-row>
        <el-col>
          <span>分析类型:</span>
          <el-radio v-model="analysisType" :label="0" :disabled="analysised"
            >全局</el-radio
          >
          <el-radio v-model="analysisType" :label="1" :disabled="analysised"
            >局部</el-radio
          >
        </el-col>
      </el-row>
      <el-row type="flex" justify="center">
        <el-col :span="8">
          <el-button
            type="primary"
            size="mini"
            @click="startAnalysis"
            :disabled="analysisEnable"
            >开始分析</el-button
          >
        </el-col>
      </el-row>
    </div>
  </Popover>
</template>

<script>
import Popover from "@/components/Popover";
export default {
  name: "clipScene",
  data() {
    this.$polygon = null;
    this.transparent = 1;
    return {
      dialogVisible: true,
      types: [
        {
          label: "地形",
          value: 1,
        },
        {
          label: "建筑",
          value: 2,
        },
        {
          label: "管线",
          value: 4,
        },
        {
          label: "水",
          value: 8,
        },
        {
          label: "要素",
          value: 16,
        },
        {
          label: "全景",
          value: 31,
          disabled: false,
        },
      ],
      typeValue: [31],
      direction: "0",
      analysisType: 0, //全局剖切  局部剖切
      analysisEnable: false,

      analysised: false,
      allView: false,
    };
  },
  components: {
    Popover,
  },
  methods: {
    startAnalysis() {
      if (!this.typeValue.length) {
        this.$message({
          type: "error",
          message: "请选择要分析图层类型",
        });
        return;
      }
      const earth = this.stampAPI.usearth;
      earth.Measure.Clear();
      let typeVal = this.typeValue.reduce((pre, cur) => {
        return pre + cur;
      });

      earth.Measure.ClipScene({
        vertical: Object.is(this.direction, "0"),
        clipType: typeVal,
        localClip: !!this.analysisType,
        polygon: this.$polygon,
        callBackFunc: () => {
          this.analysisType = 0;
          earth.ShapeCreator.Clear();
          this.analysisEnable = false;
          this.analysised = false;
        },
      });
      this.analysised = true;
      this.analysisEnable = true;
    },
    selChange() {
      this.typeValue.sort((a, b) => b - a); // 全景排序  31为最大 倒序 为第一个
      //当选中的值大于一个时，需要对【全景】做特殊处理
      if (this.typeValue[0] == 31 && this.typeValue.length > 0) {
        //如果所选 包含 全景，手动去掉全景
        this.typeValue.splice(0, 1); //去掉全景
        this.types[5].disabled = true; //全景不可选择
      } else if (this.typeValue.length == 0) {
        //默认选择全景
        this.types[5].disabled = false;
        this.typeValue.push(31);
      }
    },
    handleClose() {
      this.$router.push("/");
    },
  },
  watch: {
    analysisType(val, oldVal) {
      const earth = this.stampAPI.usearth;
      if (val) {
        var self = this;
        this.analysisEnable = true;
        earth.ShapeCreator.CreatePolygon({
          custom_excute_finish: (result) => {
            if (result.data != undefined && result.data.length >= 2) {
              self.$polygon = result.data;
              self.analysisEnable = false;
            } else {
              earth.ShapeCreator.Clear();
              self.analysisType = 0;
            }
          },
        });
      } else {
        this.analysisEnable = false;
        earth.ShapeCreator.Clear();
        this.analysisType = 0;
      }
    },
  },
  mounted() {
    this.transparent = this.stampAPI.usearth.document.terrain_transparency;
    this.$parent.$refs.bottomTool.closePanel("transparent");
  },
  beforeRouteLeave(to, from, next) {
    next();
    const earth = this.stampAPI.usearth;
    earth.Measure.Clear();
    this.$parent.$refs.functionPanel.curSelMenu.name = "";
    if (this.stampAPI.usearth.document.terrain_transparency == 1) {
      this.stampAPI.usearth.document.terrain_transparency = this.transparent;
    }
  },
};
</script>

<style lang="less" scoped>
.clipScene {
  width: 300px;
}
.clipSceneDiv {
  color: white;
  font-size: 14px;
  text-align: left;

  .el-select {
    width: 150px;
    display: inline-block;
  }

  .el-row {
    padding-top: 10px;
    margin-left: 10px;
    span {
      margin-right: 10px;
      width: 82px;
      text-align-last: right;
      display: inline-block;
    }
  }
  .el-radio {
    color: #ffffff;
  }
  .el-col {
    text-align: left;
  }
}
</style>
