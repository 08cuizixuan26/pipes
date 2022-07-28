const path = require('path')
// 引入path模块
function resolve(dir) {
  return path.join(__dirname, dir)
}
// const webpack = require('webpack');
// 扩充知识点
// __dirname 表示当前文件所在的目录的绝对路径
// __filename 表示当前文件的绝对路径
// module.filename ==== __filename 等价
// process.cwd() 返回运行当前脚本的工作目录的路径
// process.chdir() 改变工作目录
module.exports = {
  // 基本路径
  publicPath: './', //   ./表示静态相对路径  /项目/ 服务器上的相对路径
  // 输出文件目录
  outputDir: 'PipelineWebGL',
  // use the full build with in-browser compiler? https://vuejs.org/v2/guide/installation.html#Runtime-Compiler-vs-Runtime-only
  //	compiler: false,
  // eslint-loader 是否在保存的时候检查
  lintOnSave: false,
  // webpack配置 see https://github.com/vuejs/vue-cli/blob/dev/docs/webpack.md
  chainWebpack: (config) => {
    // set svg-sprite-loader
    config.module
      .rule('svg')
      .exclude.add(resolve('src/icons'))
      .end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()

    // 设置路径别名
    config.resolve.alias
      .set('@', resolve('src'))
      .set('assets', resolve('src/assets'))
      .set('components', resolve('src/components'))
      .set('views', resolve('src/views'))
      .set('public', resolve('public/'))
  },
  configureWebpack: config => {
    if (process.env.NODE_ENV === 'development') {
      config.devtool = 'cheap-source-map'
      // mutate config for production...
    }
  },
  // vue-loader 配置项 https://vue-loader.vuejs.org/en/options.html
  //	vueLoader: {},  、、打开会报错
  // 生产环境是否生成 sourceMap 文件
  productionSourceMap: false,
  // css相关配置
  css: {
    // 是否使用css分离插件 ExtractTextPlugin
    extract: true,
    // 开启 CSS source maps?
    sourceMap: false,
    // css预设器配置项
    loaderOptions: {
      postcss: {
        plugins: [
          require("postcss-px-to-viewport")({
            unitToConvert: "px", //需要转换的单位，默认为"px"
            viewportWidth: 1920, // 视窗的宽度，对应的是我们设计稿的宽度，一般是750
            viewportHeight: 1080, // 视窗的高度，根据750设备的宽度来指定，一般指定1334，也可以不配置
            unitPrecision: 3, //单位转换后保留的精度
            propList: [
              //能转化为vw的属性列表
              "*",
            ],
            viewportUnit: "vw", // 希望使用的视口单位
            fontViewportUnit: "vw", //字体使用的视口单位
            selectorBlackList: [], //需要忽略的CSS选择器，不会转为视口单位，使用原有的px等单位。
            minPixelValue: 1, //设置最小的转换数值，如果为1的话，只有大于1的值会被转换
            mediaQuery: false, //媒体查询里的单位是否需要转换单位
            replace: true, //是否直接更换属性值，而不添加备用属性
            exclude: undefined, ///(\/|\\)(node_modules)(\/|\\)/,		//忽略某些文件夹下的文件或特定文件，例如 'node_modules' 下的文件
          }),
        ],
      },
    },
    // 启用 CSS modules for all css / pre-processor files.
    modules: false
  },
  // use thread-loader for babel & TS in production build  enabled by default if the machine has more than 1 cores
  //	parallel: require('os').cpus().length > 1,
  // 是否启用dll See https://github.com/vuejs/vue-cli/blob/dev/docs/cli-service.md#dll-mode
  //	dll: false,
  // PWA 插件相关配置  see https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-pwa
  pwa: {},

  // webpack-dev-server 相关配置
  devServer: {
    open: process.platform === 'darwin', // 是否自动启动服务器
    host: '0.0.0.0', // 设置本机为区域内可以访问
    port: 80,
    https: false,
    hot: true,
    hotOnly: true
    // proxy: { // 代理路径 -->可以是任意多个
    //   '/sde': {
    //     target: 'http://192.168.100.142/', // 替换自己的代理路径
    //     changeOrigin: true,
    //     ws: true
    //   }
    // } // 设置代理
  },
  // 第三方插件配置
  pluginOptions: {
    // ...
  }
  //  ,
  // plugins: [
  // 	new webpack.optimize.CommonsChunkPlugin('/webgl_pub/webgl.js'),
  // 	new webpack.ProvidePlugin({
  // 	 jQuery: "jquery",
  // 	 $: "jquery",
  // 	 'window.jQuery':'jquery'
  // 	})
  // ]
}
