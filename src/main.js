// This is the main.js file. Import global CSS and scripts here.
// The Client API can be used here. Learn more: gridsome.org/docs/client-api

import DefaultLayout from '~/layouts/Default.vue'
import '~/assets/scss/globals.scss'
import Vuetify from 'vuetify'
import "vuetify/dist/vuetify.min.css"
import Vuex from 'vuex'
import ContractForm from '~/components/contract-ui/ContractForm.vue'
import Highlightable from '~/components/Highlightable.vue'
// import Vssue from 'vssue'
// import GithubV3 from '@vssue/api-github-v3'
import 'vssue/dist/vssue.css'
import {GithubIcon, HelpCircleIcon} from 'vue-feather-icons'
import VueDisqus from 'vue-disqus'
// import axios from 'axios'
// import VueAxios from 'vue-axios'


export default function (Vue, { router, head, isClient, appOptions }) {
  // for GH comments
  // Vue.use(VueAxios, axios)
  
  // out-of-the-box slick layouts plus material design classes
  Vue.use(Vuetify);
  
  // not actually sure if needed
  Vue.use(Vuex)
  
  // Set default layout as a global component
  Vue.component('Layout', DefaultLayout)
  
  Vue.component('github-icon', GithubIcon)
  Vue.component('info-icon', HelpCircleIcon)
  
  
  // Add contract demo
  Vue.component('contract-form', ContractForm)
  
  // Add Medium Style Select Text to Comment Functionality
  Vue.component('highlightable', Highlightable)
  
  // allows users to comment via GH issues on any text they select
  Vue.use(VueDisqus)
  // Vue.use(Vssue, {
  //   api: GithubV3,
  //   owner: process.env.GRIDSOME_REPO_OWNER,
  //   repo: process.env.GRIDSOME_REPO_NAME,
  //   clientId: process.env.GRIDSOME_VSSUE_CLIENT_ID,
  //   clientSecret: process.env.GRIDSOME_VSSUE_CLIENT_SECRET
  // })

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

  head.meta.push({
    name: 'google-site-verification',
    content: process.env.GSV_META
  })

  head.meta.push({
    name: 'apple-mobile-web-app-status-bar-style',
    content: 'default'
  })

  // NEAR API 
  head.script.push({
    src: "https://cdn.jsdelivr.net/gh/nearprotocol/near-api-js/dist/near-api-js.js"
  })
  
 
  // Disqus API 
  head.script.push({
    src: "https://near-mezze.disqus.com/embed.js"
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
