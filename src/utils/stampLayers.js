/*
 * @Author: your name
 * @Date: 2022-01-17 16:50:12
 * @LastEditTime: 2022-01-21 15:10:39
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \PipelineWebGL\src\utils\stampLayers.js
 */
const LayerManagement = {
  /**
   * 递归判断该图层下是否有管线图层，存在管线图层的工程才显示在系统设置的切换工程中
   * @param {[object]} [layer] [工程图层]
   */
  hasPipelinelayer: function(layer) {
    let flag = false;
    let layerCount = layer.getChildCount()
    for (let s = 0; s < layerCount; s++) {
      let childLayer = layer.getChildAt(s)
      if (childLayer.getChildCount === undefined) {
        if (
          childLayer.container &&
          Object.is(childLayer.container._rtti, 104)
        ) {
          flag = flag || true
        }
      } else {
        flag = flag || this.hasPipelinelayer(childLayer)
      }
    }
    return flag
  },

}

export default LayerManagement
