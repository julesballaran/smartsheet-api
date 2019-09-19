const { createRemoteFileNode } = require(`gatsby-source-filesystem`)
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

    for(const dev of data.rows) {
      var imageId = dev.cells[0].image.id
      let image = await smartsheet.images.listImageUrls({
        body: [{
          imageId: imageId
        }]
      })
      try {
        await createRemoteFileNode({
          url: image.imageUrls[0].url,
          cache,
          store,
          createNode,
          createNodeId,
          name: imageId,
          ext: '.jpg',
        })
      } catch (error) {
        console.warn('error creating node', error)
      }
    }

    let devs = []
    const rowCells = data.rows.map(res => res.cells)
    rowCells.forEach((cellData, i) => {
      let obj = {}
      obj.id = data.rows[i].id

      cellData.forEach(cell => {
        const column = data.columns.find(col => col.id === cell.columnId)
        if(column.title.match(/name/i)) {
          obj.name = cell.displayValue
        } else if (column.title.match(/summary/i)) {
          obj.summary = cell.displayValue
        } else if (column.title.match(/language/i)) {
          obj.langSkills = cell.displayValue
        } else if (column.title.match(/technologies/i)) {
          obj.techSkills = cell.displayValue
        } else if (column.title.match(/status/i)) {
          obj.status = cell.displayValue
        } else if (column.title.match(/location/i)) {
          obj.location = cell.displayValue
        } else if (column.title.match(/time/i)) {
          obj.availabily = cell.displayValue
        } else if (column.title.match(/position/i)) {
          obj.position = cell.displayValue
        } else if (column.title.match(/headshot/i)) {
          obj.image = cell.image
        } 
      })

      devs.push(obj)
    })
    createNode(prepareSheets({devs}))
}
