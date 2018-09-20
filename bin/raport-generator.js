require('dotenv').config()
const moment = require('moment')
const Raport = require('../src/raport')
const pug = require('pug')
const fs = require('fs')

async function run({ projects, from, to }) {
  const projectIds = projects.split(',')
  const fromDate = moment(from)
  const toDate = moment(to)
  const raport = new Raport({ projectIds, fromDate, toDate })
  const data = await raport.build()
  const template = pug.compileFile('templates/report/index.pug')
  return template(data)
}

if (!process.env.LAMBDA_TASK_ROOT) {
  run({
    projects: process.env.PROJECTS,
    from: process.env.FROM,
    to: process.env.TO,
  }).then((report) => {
    console.log(report)
  })
}

module.exports = run