var development = {
  firebase: {
    rootRefUrl: 'https://uberhack.firebaseio.com/',
    secretKey: 'XdnvC4rydo94hwAQlhl7lcumFUNBUSnw8gYoMcw6'
  }
};

var test = {
  firebase: {
    rootRefUrl: 'https://uberhack.firebaseio.com/',
    secretKey: 'XdnvC4rydo94hwAQlhl7lcumFUNBUSnw8gYoMcw6'
  },
  calendar: {
    clientId: '453264479059-blnv47nes2dlj1p74jt1f7odhb9g751b.apps.googleusercontent.com',
    clientSecret: 'V0mMCh8syjE9MUn9mZkc8GxF'
  }
};

var production = {
  firebase: {
    rootRefUrl: 'https://uberhack.firebaseio.com/',
    secretKey: 'XdnvC4rydo94hwAQlhl7lcumFUNBUSnw8gYoMcw6'
  },
  calendar: {
    clientId: '453264479059-blnv47nes2dlj1p74jt1f7odhb9g751b.apps.googleusercontent.com',
    clientSecret: 'V0mMCh8syjE9MUn9mZkc8GxF'
  }
};

var staging = {
  firebase: {
    rootRefUrl: 'https://uberhack.firebaseio.com/',
    secretKey: 'XdnvC4rydo94hwAQlhl7lcumFUNBUSnw8gYoMcw6'
  },
  calendar: {
    clientId: '453264479059-blnv47nes2dlj1p74jt1f7odhb9g751b.apps.googleusercontent.com',
    clientSecret: 'V0mMCh8syjE9MUn9mZkc8GxF'
  }
};

var config = {
  development: development,
  test: test,
  production: production,
  staging: staging
};

module.exports = config;
