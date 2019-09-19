require('dotenv').config()
module.exports = {
  plugins: [
    {
      resolve: 'gatsby-source-smartsheetapi',
      options: {
        sheetId: '6090334745716612',
        token: process.env.TOKEN
      }
    },
  ]
}
