<template>
  <div>
    <el-row class="searchToolDiv">
      <el-col id="inputDIV" :span="19" class="searchInputDiv">
        <el-select
          v-model="searchItem"
          style="width: 5.73vw; height: 100%; float: left"
          popper-class="el-select-style"
          @change="handleSelectChange"
          @focus="handleFocus"
        >
          <el-option
            v-for="(item, index) in searchItemData"
            :key="index"
            :label="item.name"
            :value="item.name"
            class="el-select-option-item"
          />
        </el-select>
        <div class="searchInputMiddle" />

        <el-input
          v-model="searchText"
          style="float: left; width: 8vw; height: 100%"
          autocomplete="off"
          placeholder="请输入关键字"
          @focus="handleFocus"
        />
      </el-col>
      <el-col :span="5">
        <div
          v-for="(menuItem, index) in menuItems"
          :key="index"
          :class="['menu', { menuLast: index == menuItems.length - 1 }]"
          @click="clickToolMenu(menuItem)"
        >
          <el-tooltip
            :content="menuItem.name"
            popper-class="tooltipColor"
            class="item"
            effect="dark"
            placement="top"
          >
            <img
              :src="
                hoverIndex == index || menuItem.selected
                  ? menuItem.iconActive
                  : menuItem.iconNormal
              "
              style="position: relative; width: 100%; height: 100%"
              @click="iconActives(index)"
            />
          </el-tooltip>
        </div>
      </el-col>
    </el-row>
    <searchResult v-if="bShowSearchResult == 1" ref="searchResult" />
    <QueryProperty v-else-if="bShowSearchResult == 2" ref="QueryProperty" />
  </div>
</template>

<script>
import { mapState } from "vuex";
import searchResult from "./searchResult";
import QueryProperty from "./QueryProperty";
import PickQuery from "@/stamplib/PickQuery";
import label from "../../draw/label";
export default {
  name: "SearchTool",
  components: {
    searchResult,
    QueryProperty,
  },
  data() {
    this.$_pickQuery = null;
    return {
      hoverIndex: -1,
      searchText: "",
      // searchItemData: [],
      menuItems: [
        {
          id: "keyQuery",
          name: "关键字查询",
          iconNormal: "images/search/key-normal.png",
          iconActive: "images/search/key-active.png",
          selected: false,
        },
        {
          id: "propertyQuery",
          name: "属性查询",
          iconNormal: "images/search/property-normal.png",
          iconActive: "images/search/property-active.png",
          selected: false,
        },
      ],
      bShowSearchResult: 0,
    };
  },
  computed: {
    checkData() {
      return this.$store.state.checkData;
    },
    areaTable() {
      return this.$store.state.areaTable;
    },
    pipelineData() {
      return this.$store.state.pipelineLayerData;
    },
    searchItem: {
      get() {
        return this.$store.state.searchItem;
      },
      set(value) {
        this.$store.state.searchItem = value;
      },
    },
    searchItemData() {
      return this.$store.state.searchItemData;
    },
    ...mapState(["VectorTileLayers", "isEditVector"]),
  },
  watch: {
    // "$store.state.searchItemData": {
    //     handler(newValue, oldValue) {
    //         if (newValue) {
    //             this.searchItemData = newValue;
    //         }
    //     },
    //     immediate: true,
    // },
  },
  mounted() {},
  beforeDestroy() {},
  methods: {
    iconActives(index) {
      if (index == 0) {
        this.hoverIndex = index;
        this.bShowSearchResult = 2; // 关闭查询面板
      } else {
        this.hoverIndex = index;
        this.bShowSearchResult = 0;
      }

      //   debugger;
      //   if (index == 1) {
      //     this.hoverIndex = index;
      //     //   this.closeSearchResult()
      //   } else {
      //     this.hoverIndex = index;
      //   }
    },
    handleSelectChange() {},
    handleFocus() {},
    clickToolMenu(item) {
      var self = this;
      switch (item.name) {
        case "关键字查询":
          var searchType = "";
          var key = "";
          var type = "";
          for (var i = 0; i < self.searchItemData.length; i++) {
            if (self.searchItemData[i].name == self.searchItem) {
              searchType = self.searchItemData[i].type;
              type = self.searchItemData[i].searchType;
              key = self.searchItemData[i].value;
              break;
            }
          }
          if (searchType == "model" && self.searchText == "") {
            self.$message({
              type: "warning",
              message: "模型类图层，请输入关键字！",
            });
            return;
          }
          self.bShowSearchResult = 1; // 关键字查询
          self.$nextTick(function () {
            self.$refs.searchResult.show({
              searchType: searchType,
              searchItem: type,
              searchText: self.searchText,
              key: key,
            });
          });
          break;
        case "属性查询":
          var callback = function (data, type, pick) {
            var result = { info: data };
            if (type) {
              result.type = type;
            }
            if (pick) {
              result.pick = pick;
            }
            self.bShowSearchResult = 2; // 属性查询
            self.$nextTick(function () {
              self.$refs.QueryProperty.show(result);
            });
          };
          this.$_pickQuery = new PickQuery(self, callback);
          break;
        default:
          break;
      }
      this.$parent.$refs.bottomTool.closePanel();
    },
    closeSearchResult() {
      this.bShowSearchResult = 0; // 关闭查询面板
      this.hoverIndex = -1;
      if (this.$_pickQuery != null) {
        this.$_pickQuery.cancelPickQuery();
      }
    },
    beforeClick() {},
  },
};
</script>

<style lang="less" scoped>
.searchToolDiv {
  z-index: 2;
  position: fixed;
  width: 21vw;
  height: 2vw;
  top: 11vh;
  left: 10px;
}
.searchInputDiv {
  background: url("../../../../public/images/search/input-bg.png");
  background-size: 100% 100%;
  height: 36px;

  /deep/ .el-input__inner {
    border: 0;
    padding-left: 10px !important;
    padding-right: 4px !important;
    background-color: transparent;
    height: 36px;
    line-height: 36px;
  }

  /deep/ .el-input__icon {
    line-height: 36px;
  }
}

.searchInputMiddle {
  float: left;
  width: 1px;
  position: relative;
  top: 50%;
  margin-top: -10px;
  height: 20px;
  background: rgb(255, 174, 3);
  opacity: 0.6;
  border-radius: 50%;
}

.el-menu-item-style {
  width: 36px !important;
  height: 36px !important;
  line-height: 36px !important;
  padding: 0px !important;
  margin-left: 1px !important;
}

.el-menu.el-menu--horizontal {
  border-bottom: none;
}

.menu {
  width: 36px;
  height: 36px;
  color: white;
  float: left;
  margin-left: 1px;
  text-align: center;
  cursor: pointer;
}
.menuLast {
  // margin: 0px 0px 0px 0.09vw !important;
}
</style>
