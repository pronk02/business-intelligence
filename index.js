process.env.PATH = `${process.env.PATH}:${process.env.LAMBDA_TASK_ROOT}`

const bankRunner = require('./bin/bank-runner')
const incomeSynchroniser = require('./bin/income-synchroniser')
const reportGenerator = require('./bin/report-generator')
const ReportForm = require('./src/report-form')
const ReportUploader = require('./src/report-uploader')

exports.bankRunner = async () => {
  const files = await bankRunner()

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      parsedFiles: files,
    }),
  }

  return response
}

exports.incomeSynchroniser = async (event) => {
  const income = await incomeSynchroniser({
    month: event.params.querystring.month,
  })

  const response = {
    statusCode: 200,
    body: {
      income,
      month: event.params.querystring.month,
    },
  }

  return response
}

exports.reportGenerator = async (event) => {
  // event from AWS SQS has Records
  if (event.Records) {
    const message = event.Records[0]
    const params = JSON.parse(message.body)
    const report = await reportGenerator(params)

    const uploader = new ReportUploader({
      client: params.client,
      project: params.projects,
      to: params.to,
      from: params.from,
      html: report,
    })
    return uploader.upload()
  }

  if (event.params && event.params.querystring && event.params.querystring.projects) {
    const report = await reportGenerator({
      projects: event.params.querystring.projects,
      to: event.params.querystring.to,
      from: event.params.querystring.from,
    })

    const uploader = new ReportUploader({
      client: event.params.querystring.client,
      project: event.params.querystring.projects,
      to: event.params.querystring.to,
      from: event.params.querystring.from,
      html: report,
    })
    return uploader.upload()
  }
  const form = new ReportForm()
  return form.render()
}
