import Vue from 'vue'
import Router from 'vue-router'
import layout from './views/layout/Layout'

Vue.use(Router)

var routes = [
  {
    path: '/',
    name: 'Layout',
    component: layout
  }
]

for (var i = 0; i < STAMP.menuConfig.menu.length; i++) {
  var menuItem = STAMP.menuConfig.menu[i]
  if (menuItem && menuItem.item && menuItem.item.length > 0) {
    var menuChild = menuItem.item
    var menuName = menuItem.id
    for (var j = 0; j < menuChild.length; j++) {
      if (menuChild[j].toolType == 2 || menuChild[j].toolType == 4) { // 左侧功能面板
        (function (menuName, menuid) {
          routes.push({
            path: '/' + menuid,
            name: menuid,
            redirect: '/' + menuid + '/index',
            component: layout,
            children: [
              {
                path: 'index',
                name: menuid + 'Index',
                component: () => import('@/views/' + menuName + '/' + menuid)
              }
            ]
          })
        })(menuName, menuChild[j].id)
      }
    }
  }
}

export const constantRoutes = routes

const createRouter = () => new Router({
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

export default router

