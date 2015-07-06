var development = {
  firebase: {
    rootRefUrl: 'https://andela-olympics-dev.firebaseio.com/',
    secretKey: 'CpfhmeJ7beezjMuGHYJQalUPfd9Yt8UTKxm73QTI'
  }
};

var test = {
  firebase: {
    rootRefUrl: 'https://andela-olympics-dev.firebaseio.com/',
    secretKey: 'CpfhmeJ7beezjMuGHYJQalUPfd9Yt8UTKxm73QTI'
  }
};

var production = {
  firebase: {
    rootRefUrl: 'https://andela-olympics.firebaseio.com/',
    secretKey: 'q2tKtHOXA3LOci2DtzoHVwbwovgN9S0LHYe8pBiZ'
  }
};

var staging = {
  firebase: {
    rootRefUrl: 'https://andela-olympics-dev.firebaseio.com/',
    secretKey: 'CpfhmeJ7beezjMuGHYJQalUPfd9Yt8UTKxm73QTI'
  }
};

var config = {
  development: development,
  test: test,
  production: production,
  staging: staging
};

module.exports = config;
