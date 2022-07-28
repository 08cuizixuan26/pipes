import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    isShow: false,
    changArr: [],
    options: null,
    PipelineInformation: null,
    labelData: [{ //标注管理
      guid: -1,
      name: '标注管理',
      children: []
    }],
    labelCheckData: [],
    theme: '#1890ff',
    layerPanelShow: false, // 是否显示图层面板
    layerPanelShowReal: true,
    operDialogShow: false,
    sliderDialogVisible: false,
    menuIndex: 0,
    toolItem: null,
    sliderValue: 100,
    sliderType: 'transparent',
    modelLayerTrans: 100,
    layerData: [],
    pipelineLayerData: [],
    checkData: [],
    pipelineCheckData: [],
    expandData: [],
    pipelineExpandData: [],
    selectLayer: null, // 当前图层树被选中的节点图层，用于关键字查询
    dynamicList: [],
    heading: 0,
    areaTable: [],
    searchItem: '',
    searchItemData: [],
    pipelineLayers: [],
    projectInfo: {},
    pipeListDataAll: {}
  },
  mutations: {
    CHANGE_LAYER_PANEL_SHOW(state, flag) {
      if (flag) {
        state.operPanelShow = false
        if (state.toolItem && (state.toolItem.toolType == 2 || state.toolItem.toolType == 3)) {
          state.toolItem.selected = false
          state.toolItem = null
        }
      }
      state.layerPanelShow = flag
      state.layerPanelShowReal = flag
    },
    CHANGE_OPER_DIALOG_SHOW(state, flag) {
      state.operDialogShow = flag

      if (state.operPanelShow) {
        state.operPanelShow = false
      }

      state.layerPanelShow = state.layerPanelShowReal
    },
    CHANGE_SLIDER_DIALOG_SHOW(state, flag) {
      state.sliderDialogVisible = flag
    },
    CHANGE_LAYER_DATA(state, data) {
      state.layerData = data
    },
    CHANGE_PIPELINE_LAYER_DATA(state, data) {
      state.pipelineLayerData = data
    },
    CHANGE_CHECK_DATA(state, data) {
      state.checkData = data
    },
    CHANGE_PIPE_CHECK_DATA(state, data) {
      state.pipelineCheckData = data
    },
    CHANGE_EXPAND_DATA(state, data) {
      state.expandData = data
    },
    CHANGE_SELECT_LAYER(state, data) {
      state.selectLayer = data
    },
    CHANGE_SLIDER_VALUE(state, data) {
      state.sliderValue = data
    },
    CHANGE_SLIDER_TYPE(state, data) {
      state.sliderType = data
    },
    CHANGE_DYNAMIC_LIST(state, data) {
      state.dynamicList = data
    },

  },
  actions: {
    changeLayerPanelShowTemp({ commit }, flag) {
      commit('CHANGE_LAYER_PANEL_SHOW_TEMP', flag)
    },
    changeLayerPanelShow({ commit }, flag) {
      commit('CHANGE_LAYER_PANEL_SHOW', flag)
    },
    changeOperDialogShow({ commit }, flag) {
      commit('CHANGE_OPER_DIALOG_SHOW', flag)
    },
    changeSliderDialogShow({ commit }, flag) {
      commit('CHANGE_SLIDER_DIALOG_SHOW', flag)
    },
    changeLayerData({ commit }, data) {
      commit('CHANGE_LAYER_DATA', data)
    },
    changePipelineData({ commit }, data) {
      commit('CHANGE_PIPELINE_LAYER_DATA', data)
    },
    changeCheckData({ commit }, data) {
      commit('CHANGE_CHECK_DATA', data)
    },
    changePipeCheckData({ commit }, data) {
      commit('CHANGE_PIPE_CHECK_DATA', data)
    },
    changeExpandData({ commit }, data) {
      commit('CHANGE_EXPAND_DATA', data)
    },
    changeSelectLayer({ commit }, data) {
      commit('CHANGE_SELECT_LAYER', data)
    },
    changeSliderValue({ commit }, data) {
      commit('CHANGE_SLIDER_VALUE', data)
    },
    changeSliderType({ commit }, data) {
      commit('CHANGE_SLIDER_TYPE', data)
    },
    changeDynamicList({ commit }, data) {
      commit('CHANGE_DYNAMIC_LIST', data)
    },
  },
  getters: {
  }
})
