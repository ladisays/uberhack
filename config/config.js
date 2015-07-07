var development = {
  firebase: {
    rootRefUrl: 'https://uberhack.firebaseio.com/',
    secretKey: 'XdnvC4rydo94hwAQlhl7lcumFUNBUSnw8gYoMcw6'
  },
  calendar: {
    clientId: '453264479059-fc56k30fdhl07leahq5n489ct7ifk7md.apps.googleusercontent.com',
    clientSecret: 'XA-7mkghxVKC-iXkCR9VnAbe',
    callBackURL: 'http://localhost:5555/calendar/callback'
  }
};

var test = {
  firebase: {
    rootRefUrl: 'https://uberhack.firebaseio.com/',
    secretKey: 'XdnvC4rydo94hwAQlhl7lcumFUNBUSnw8gYoMcw6'
  },
  calendar: {
    clientId: '453264479059-fc56k30fdhl07leahq5n489ct7ifk7md.apps.googleusercontent.com',
    clientSecret: 'XA-7mkghxVKC-iXkCR9VnAbe',
    callBackURL: 'http://localhost:5555/calendar/callback'
  }
};

var production = {
  firebase: {
    rootRefUrl: 'https://uberhack.firebaseio.com/',
    secretKey: 'XdnvC4rydo94hwAQlhl7lcumFUNBUSnw8gYoMcw6'
  },
  calendar: {
    clientId: '453264479059-fc56k30fdhl07leahq5n489ct7ifk7md.apps.googleusercontent.com',
    clientSecret: 'XA-7mkghxVKC-iXkCR9VnAbe',
    callBackURL: 'http://localhost:5555/calendar/callback'
  }
};

var staging = {
  firebase: {
    rootRefUrl: 'https://uberhack.firebaseio.com/',
    secretKey: 'XdnvC4rydo94hwAQlhl7lcumFUNBUSnw8gYoMcw6'
  },
  calendar: {
    clientId: '453264479059-fc56k30fdhl07leahq5n489ct7ifk7md.apps.googleusercontent.com',
    clientSecret: 'XA-7mkghxVKC-iXkCR9VnAbe',
    callBackURL: 'http://localhost:5555/calendar/callback'
  }
};

var config = {
  development: development,
  test: test,
  production: production,
  staging: staging
};

module.exports = config;
