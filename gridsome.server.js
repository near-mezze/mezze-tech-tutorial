// Server API makes it possible to hook into various parts of Gridsome
// on server-side and add custom data to the GraphQL data layer.
// Learn more: https://gridsome.org/docs/server-api

// Changes here require a server restart.
// To restart press CTRL + C in terminal and run `gridsome develop`
const nodeExternals = require('webpack-node-externals')
const { Octokit } = require("@octokit/rest")

const octokit = new Octokit({
  auth: process.env.GRIDSOME_GITHUB_TOKEN,
});

const fs = require('fs')

module.exports = function (api) {

  api.chainWebpack((config, { isServer }) => {
    if (isServer) {
      config.externals([
        nodeExternals({
          allowlist: [/^vuetify/, /^vssue/, /^@vssue/, /\.css$/]
        })
      ])
    }
  })

  // Change to pull from various repos (branch mezzetech) based on data in settings.json


  // Change to pull from various repos (branch mezzetech) based on data in settings.json
  api.loadSource(async store => {
    // Use the Data Store API here: https://gridsome.org/docs/data-store-api

    const data = require('./data/settings.json');
    const Near = store.addCollection({ typeName: 'Near' })
    
    // should populate each link card on near.mezzetech.com
    for (const item of data.platforms.near.tutorials) {

      await octokit.request(`GET /repos/near-mezze/${item.repo.name}/readme/mezzetech`, {
        owner: 'near-mezze',
        repo: item.repo.name,
        ref: 'mezzetech'
      }).then( res => {
        const content = Buffer.from(res.data.content, 'base64').toString()
        fs.writeFile(`tutorials/${item.repo.name}.md`, content, err => {
          if (err) {
            console.error(err)
            return
          }
          //file written successfully
          console.log('files written')
        })

        Near.addNode({
          "section": item.section,
          "path": "/" + item.slug + "/",
          "title": item.title,
          "description": item.description,
          "slug" : item.slug,
          "repo": {
            name: item.repo.name,
            owner: item.repo.owner,
          },
        })
       
        // Menu.addNode({
        //   section: item.section,
        //   topics: [{"title": item.title,"slug": item.slug}]
        // })
        
      })
    }
  })


  api.createPages(({ createPage }) => {
    // requires .vue file
    // Use the Pages API here: https://gridsome.org/docs/pages-api
  })
}
