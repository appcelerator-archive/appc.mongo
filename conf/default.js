module.exports = {

  logs: './logs',
  quiet: false,
  logLevel: 'error',
  apikey: 'bYVrelF3EQ8qGaJj/SoSlTyP6IhtA+1Y',
  requireSessionLogin: false,
  admin: {
    enabled: true,
    prefix: '/arrow'
  },
  logging: {
    logdir: './logs',
    transactionLogEnabled: true
  },
  connectors: {
    'appc.mongo': {
      url: 'mongodb://localhost/arrow',
      generateModelsFromSchema: true,
      modelAutogen: true
    }
  }
}
