// This is the main.js file. Import global CSS and scripts here.
// The Client API can be used here. Learn more: gridsome.org/docs/client-api

import DefaultLayout from '~/layouts/Default.vue'
import '~/assets/scss/globals.scss'
import Vuetify from 'vuetify'
import "vuetify/dist/vuetify.min.css"
import Vuex from 'vuex'
import VueMarkdown from 'vue-markdown'

import ThanksForm from '~/components/contract-ui/thanks/ThanksForm.vue'
import LotteryForm from '~/components/contract-ui/lottery/LotteryForm.vue'
import Highlightable from '~/components/Highlightable.vue'

import {GithubIcon, HelpCircleIcon} from 'vue-feather-icons'

require("prismjs/plugins/line-numbers/prism-line-numbers.css")
require("prismjs/plugins/command-line/prism-command-line.css")


export default function (Vue, { router, head, isClient, appOptions }) {
  
  // out-of-the-box slick layouts plus material design classes
  Vue.use(Vuetify);
  
  // not actually sure if needed
  Vue.use(Vuex)
  
  // Set default layout as a global component
  Vue.component('Layout', DefaultLayout)
  
  Vue.component('github-icon', GithubIcon)
  Vue.component('info-icon', HelpCircleIcon)
  
  // additional markdown helper
  Vue.component('vue-markdown', VueMarkdown)
  
  // Add contract demo
  Vue.component('thanks-form', ThanksForm)
  Vue.component('lottery-form', LotteryForm)
  
  // Add Medium Style Select Text to Comment Functionality
  Vue.component('highlightable', Highlightable)
  
  // Add attributes to HTML tag
  head.htmlAttrs = { lang: 'en' }

  head.link.push({
    rel: 'manifest',
    href: '/manifest.json'
  })

  head.link.push({
    rel: 'stylesheet',
    href: 'https://cdn.jsdelivr.net/npm/@mdi/font@latest/css/materialdesignicons.min.css',
  })

  head.link.push({
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900',
  });

  head.meta.push({
    name: 'theme-color',
    content: '#10c186'
  })

  // head.meta.push({
  //   name: 'google-site-verification',
  //   content: process.env.GSV_META
  // })

  head.meta.push({
    name: 'apple-mobile-web-app-status-bar-style',
    content: 'default'
  })

  // NEAR API 
  head.script.push({
    src: "https://cdn.jsdelivr.net/gh/nearprotocol/near-api-js/dist/near-api-js.js"
  })
  
  
  //UI
  appOptions.vuetify = new Vuetify({});
  
  // State
  appOptions.store = new Vuex.Store({
    state: {
      sidebarOpen: false,
      userName: ''
    },
    mutations: {
      toggleSidebar(state) {
        state.sidebarOpen = !state.sidebarOpen
      },
      closeSidebar(state) {
        state.sidebarOpen = false
      },
      openSidebar(state) {
        state.sidebarOpen = true
      },
      setUserName(state, val) {
        state.userName = val
      }
    }
  })
}
