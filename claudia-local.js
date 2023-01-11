// eslint-disable-next-line import/no-extraneous-dependencies
const program = require('commander');
const path = require('path');
// eslint-disable-next-line import/no-extraneous-dependencies
const pathParser = require('path-parser');

function getDefaultConfig() {
  return {
    port: 1881,
  };
}

function initServer() {
  // eslint-disable-next-line global-require,import/no-extraneous-dependencies
  const express = require('express');
  // eslint-disable-next-line global-require,import/no-extraneous-dependencies
  const bodyParser = require('body-parser');

  const server = express();
  server.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );
  server.use(bodyParser.json());

  return server;
}

function initLogger() {
  // eslint-disable-next-line global-require,import/no-extraneous-dependencies
  const bunyan = require('bunyan');
  return bunyan.createLogger({
    name: 'claudia-local-api',
  });
}

function logJson(logger, body) {
  logger.info(JSON.stringify(body, null, 4));
}

function logError(logger, error) {
  logger.error(error.stack);
}

function getPathParams(req, routes) {
  // eslint-disable-next-line no-underscore-dangle
  const parsedPath = req._parsedUrl.pathname;
  // eslint-disable-next-line no-restricted-syntax
  for (const route of routes) {
    const isSupported = route.supportedMethods.indexOf(req.method) !== -1;
    const pathParameters = route.path.test(parsedPath);
    if (isSupported && pathParameters) {
      return {
        resourcePath: route.resourcePath,
        pathParameters,
      };
    }
  }

  return {
    resourcePath: parsedPath,
    pathParameters: {},
  };
}

function getParams(req, routes) {
  const pathParams = getPathParams(req, routes);

  return {
    requestContext: {
      resourcePath: pathParams.resourcePath,
      httpMethod: req.method,
    },
    headers: req.headers,
    queryStringParameters: req.query,
    body: req.body,
    pathParameters: pathParams.pathParameters,
  };
}

function makeHandleResponse(logger, res) {
  return function (err, response) {
    if (err) {
      logError(logger, err);
      const body = {
        message: err.message,
      };
      return res.status(500).send(body);
    }
    logJson(logger, response);
    return res
      .set(response.headers || {})
      .status(response.statusCode || 200)
      .send(response.body || {});
  };
}

function makeHandleRequest(logger, app, routes) {
  return function (req, res) {
    const params = getParams(req, routes);
    logJson(logger, params);
    app.proxyRouter(params, {
      done: makeHandleResponse(logger, res),
    });
  };
}

function getRoutes(routesObj) {
  const routePaths = Object.keys(routesObj);

  return routePaths.map((routePath) => {
    const supportedMethods = Object.keys(routesObj[routePath] || {});
    const route = `/${routePath}`;
    return {
      resourcePath: route,
      supportedMethods,
      path: pathParser.Path.createPath(route.replace(/{(.+?)}/g, ':$1')),
    };
  });
}

function bootstrap(server, logger, claudiaApp, routes, options) {
  const handleRequest = makeHandleRequest(logger, claudiaApp, routes);

  server.all('*', handleRequest);
  const instance = server.listen(3000);
  logger.info(`Server listening on ${3000}`);
  return instance;
}

function runCmd(bootstrapFn) {
  const config = getDefaultConfig();

  program.apiModule = '/app';

  program
    .version('"2.0.0')
    .option(
      `-a --api-module ${program.apiModule}`,
      'Specify claudia api path from project root'
    )
    .option(
      '-p --port [port]',
      `Specify port to use [${config.port}]`,
      config.port
    )
    .parse(process.argv);

  const apiPath = path.join(process.cwd(), program.apiModule);
  // eslint-disable-next-line global-require,import/no-dynamic-require
  const claudiaApp = require(apiPath);

  const apiConfig = claudiaApp.apiConfig();
  const routes = getRoutes(apiConfig.routes);

  const server = initServer();
  const logger = initLogger();

  bootstrapFn(server, logger, claudiaApp, routes, program);
}

runCmd.bind(null, bootstrap)();
