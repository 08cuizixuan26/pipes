<template>
  <div class="particular">
    <popover
      :visible.sync="particularVisisble"
      :title="titleName"
      custom-class="moveDialog"
    >
      <el-row>
        <el-col :span="6">
          <label>Rate</label>
        </el-col>
        <el-col :span="13">
          <el-slider key="emissionRate" v-model="dataOptions.emissionRate" @input="rateChange" />
        </el-col>
        <el-col :span="5">
          <el-input v-model="dataOptions.emissionRate" v-input-focus/>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="6">
          <label>Size</label>
        </el-col>
        <el-col :span="13">
          <el-slider :value="+dataOptions.imageSize" @input="imageSizeChange"/>
        </el-col>
        <el-col :span="5">
          <el-input v-model="dataOptions.imageSize" v-input-focus/>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="6">
          <label>Min Life</label>
        </el-col>
        <el-col :span="13">
          <el-slider :value="+dataOptions.minLife" @input="minLifeChange"/>
        </el-col>
        <el-col :span="5">
          <el-input v-model="dataOptions.minLife" v-input-focus/>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="6">
          <label>Max Life</label>
        </el-col>
        <el-col :span="13">
          <el-slider :value="+dataOptions.maxLife" @input="maxLifeChange"/>
        </el-col>
        <el-col :span="5">
          <el-input v-model="dataOptions.maxLife" v-input-focus/>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="6">
          <label>Min Speed</label>
        </el-col>
        <el-col :span="13">
          <el-slider :value="+dataOptions.minSpeed" @input="minSpeedChange"/>
        </el-col>
        <el-col :span="5">
          <el-input v-model="dataOptions.minSpeed" v-input-focus/>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="6">
          <label>Max Speed</label>
        </el-col>
        <el-col :span="13">
          <el-slider :value="+dataOptions.maxSpeed" @input="maxSpeedChange"/>
        </el-col>
        <el-col :span="5">
          <el-input v-model="dataOptions.maxSpeed" v-input-focus/>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="6">
          <label>Start Scale</label>
        </el-col>
        <el-col :span="13">
          <el-slider :value="+dataOptions.startScale" @input="startScaleChange"/>
        </el-col>
        <el-col :span="5">
          <el-input v-model="dataOptions.startScale" v-input-focus/>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="6">
          <label>End Scale</label>
        </el-col>
        <el-col :span="13">
          <el-slider :value="+dataOptions.endScale" @input="endScaleChange"/>
        </el-col>
        <el-col :span="5">
          <el-input v-model="dataOptions.endScale" v-input-focus/>
        </el-col>
      </el-row>
      <div class="btngroup">
        <el-button id="confirm" type="primary" size="mini" @click="confirmClick">确定</el-button>
        <el-button id="cancel" type="primary" size="mini" @click="cancelClick">取消</el-button>
      </div>
    </popover>
  </div>
</template>
<script>
import popover from '@/components/Popover'

let earth = null

export default {
  name: 'Particular',
  components: {
    popover
  },
  data() {
    this.callbackOk = null;
    this.callbackCancel = null;
    return {
      titleName: '粒子特效',
      particularVisisble: false,
      value: 20,
      edit: false,
      dataOptions: {
          emissionRate:  0,
          imageSize: 0.5,
          minLife: 5.0,
          maxLife: 5.0,
          minSpeed: 1.0,
          maxSpeed: 1.0,
          startScale: 1.0,
          endScale: 0.5,         
      },
    }
  },
  methods: {
    confirmClick() {
      this.particularVisisble = false
      this.callbackOk()
      this.$parent.$particleObj = null
    },
    cancelClick(){
      this.callbackCancel()
      this.particularVisisble = false
      // this.$parent.$particleObj = null
    },
    rateChange(input) {
      if(this.$parent.$particleObj){
        this.$parent.$particleObj.emissionRate = input
      }
      this.dataOptions.emissionRate = +input
    },
    imageSizeChange(input) {
      const obj = { x: input, y: input }
      this.dataOptions.imageSize = input
      if(this.$parent.$particleObj){
        this.$parent.$particleObj.minimumImageSize = obj
        this.$parent.$particleObj.maximumImageSize = obj
        this.$parent.$particleObj.maximumImageSize.x = obj
        this.$parent.$particleObj.maximumImageSize.y = obj
      }
    },
    minLifeChange(input) {
      this.dataOptions.minLife = input
      if(this.$parent.$particleObj){
        this.$parent.$particleObj.minimumParticleLife = input
      }
    },
    maxLifeChange(input) {
      this.dataOptions.maxLife = input
      if(this.$parent.$particleObj){
        this.$parent.$particleObj.maximumParticleLife = input
      }
    },
    minSpeedChange(input) {
      this.dataOptions.minSpeed = input
      if(this.$parent.$particleObj){
        this.$parent.$particleObj.minimumSpeed = input
      }
    },
    maxSpeedChange(input) {
      this.dataOptions.maxSpeed = input
      if(this.$parent.$particleObj){
        this.$parent.$particleObj.maximumSpeed = input
      }
    },
    startScaleChange(input) {
      this.dataOptions.startScale = input
      if(this.$parent.$particleObj){
        this.$parent.$particleObj.startScale = input
      }
    },
    endScaleChange(input) {
      this.dataOptions.endScale = input
      if(this.$parent.$particleObj){
        this.$parent.$particleObj.endScale = input
      }
    }
  },
  mounted(){
    earth = this.stampAPI.usearth
  },
  watch:{

  }
}
</script>

<style lang="less" scoped>
.particular {
  .moveDialog {
    width: 300px;
    height: 410px;
    left: 270px;
    top: 50px;
  }
  /deep/ .el-dialog__body {
    padding: 4px;
    text-align: left;
  }
  .el-col-6 {
    line-height: 38px;
    font-size: 12px;
  }
  .btngroup{
    text-align: center;
  }
}
</style>
