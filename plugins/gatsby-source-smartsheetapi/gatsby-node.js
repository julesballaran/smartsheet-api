const { createRemoteFileNode } = require(`gatsby-source-filesystem`)
const camelCase = require('camelcase')
const axios = require("axios")
const createNodeHelpers = require("gatsby-node-helpers").default
const client = require('smartsheet')
const smartsheet = client.createClient({
  accessToken: process.env.TOKEN,
  logLevel: 'info'
})

exports.sourceNodes = async ({ actions, store, cache, createNodeId }, configOptions) => {
    const { sheetId, token } = configOptions
    const { createNode } = actions
    const { createNodeFactory } = createNodeHelpers({
        typePrefix: 'smart'
    })

    const prepareSheets = createNodeFactory("Sheet")

    const { data } = await axios.get(`https://api.smartsheet.com/2.0/sheets/${sheetId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    let devs = []
    const rowCells = data.rows.map(res => res.cells)
    rowCells.forEach((cellData, i) => {
      let obj = {}
      obj.id = data.rows[i].id

      cellData.forEach(cell => {
        const column = data.columns.find(col => col.id === cell.columnId)
        column.title.match(/headshot/i) ? 
          obj[camelCase(column.title)] = cell.image : 
          obj[camelCase(column.title)] = cell.displayValue
      })

      devs.push(obj)
    })

    // for(const dev of devs) {
    //   let image = await smartsheet.images.listImageUrls({
    //     body: [{
    //       imageId: dev.image.id
    //     }]
    //   })
    //   try {
    //     await createRemoteFileNode({
    //       url: image.imageUrls[0].url,
    //       cache,
    //       store,
    //       createNode,
    //       createNodeId,
    //       name: dev.image.id,
    //       ext: '.jpg',
    //     })
    //   } catch (error) {
    //     console.warn('error creating node', error)
    //   }
    // }

    createNode(prepareSheets({devs}))
}