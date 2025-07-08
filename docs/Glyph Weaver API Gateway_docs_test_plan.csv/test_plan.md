test_id,feature_area,test_type,test_level,priority,automation_candidate,test_description,preconditions,test_steps,expected_result,test_data_needs,tools_required,estimated_effort,dependencies
GW-API-T001,Core Configuration,Functional,Smoke,Highest,High,"Verify that project dependencies can be installed successfully","The `package.json` file is present in the project root and lists all dependencies.","1. Clone the repository.
2. Navigate to the project root directory.
3. Run the command `npm install`.","The `npm install` command completes without any errors. The `node_modules` directory is created and populated.",N/A,"npm, Node.js",0.1,TASK-101-1
GW-API-T002,Core Configuration,Functional,Smoke,Highest,High,"Verify that the TypeScript build script executes successfully","The `package.json` and `tsconfig.json` files are correctly configured.","1. Run `npm install`.
2. Run the command `npm run build`.","The TypeScript compiler (`tsc`) runs and creates JavaScript output files in the `dist` directory without any compilation errors.",N/A,"npm, TypeScript",0.1,TASK-101-2
GW-API-T003,Core Configuration,Functional,Smoke,Highest,High,"Verify that the development server script starts the application","The `package.json` and all source files are present. A valid `.env` file exists.","1. Run `npm install`.
2. Run the command `npm run dev`.","The application starts successfully using `nodemon` and `ts-node`, and a log message indicates the server is running and listening for connections.",Valid `.env` file,"npm, nodemon, ts-node",0.1,TASK-101-2
GW-API-T004,Core Configuration,Functional,Unit,Highest,High,"Verify that the config loader throws an error if a required environment variable is missing","The config loader module is available.","1. Configure the test environment to unset a required variable (e.g., `PLAYER_SERVICE_URL`).
2. Import and execute the config loader module.
3. Assert that the module throws an Error.","An error is thrown with a descriptive message indicating which environment variable is missing, and the application does not start.",Mock `process.env`,Jest,0.5,TASK-103-3
GW-API-T005,Core Configuration,Functional,Unit,Highest,High,"Verify that the config loader correctly parses environment variables","The config loader module is available.","1. Configure the test environment with all required variables, using string values (e.g., `PORT='8080'`).
2. Import and execute the config loader module.
3. Access the parsed config object.
4. Assert that numeric values (like port) have been parsed to numbers.","The exported config object contains all values, with `config.port` being of type 'number' and not 'string'.",Mock `process.env`,Jest,0.5,TASK-103-2
GW-API-T006,Logging,Functional,Unit,Highest,High,"Verify that the logger uses JSON format in a production environment","The logger module is available.","1. Set the `NODE_ENV` environment variable to 'production'.
2. Import the logger module to initialize it.
3. Inspect the logger instance's configuration.
4. Assert that the format is set to `winston.format.json()`.","The logger instance is configured to use the JSON log format.",Mock `process.env`,Jest,0.5,TASK-104-1
GW-API-T007,Logging,Functional,Unit,Highest,High,"Verify that the logger uses simple/colorized format in a development environment","The logger module is available.","1. Set the `NODE_ENV` environment variable to 'development' or leave it unset.
2. Import the logger module to initialize it.
3. Inspect the logger instance's configuration.
4. Assert that the format is set to a non-JSON format (e.g., simple, colorize).","The logger instance is configured to use the simple/colorized log format.",Mock `process.env`,Jest,0.5,TASK-104-1
GW-API-T008,Middleware - Rate Limiting,Functional,Integration,Highest,High,"Verify that the rate limiter blocks requests after the configured limit is exceeded","The application is running with the rate limit middleware enabled, with a low limit for testing (e.g., 5 requests).","1. Using an HTTP client (Supertest), send 5 requests to any valid endpoint.
2. Send a 6th request to the same endpoint from the same IP.","The first 5 requests receive a non-429 status code. The 6th request receives a 429 'Too Many Requests' status code.",Test endpoint configured in `app.ts`. `.env` file with `RATE_LIMIT_MAX_REQUESTS=5`,"Supertest, Jest",1,TASK-201-2
GW-API-T009,Middleware - Rate Limiting,Non-Functional,Integration,Highest,High,"Verify that rate limit headers are present in responses","The application is running with the rate limit middleware enabled.","1. Using an HTTP client, send a single request to any valid endpoint.
2. Inspect the headers of the response.","The response contains the `RateLimit-Limit`, `RateLimit-Remaining`, and `RateLimit-Reset` headers.",Test endpoint configured in `app.ts`,"Supertest, Jest",0.5,TASK-201-1
GW-API-T010,Middleware - Core,Security,Integration,Highest,High,"Verify that Helmet security headers are applied","The application is running with Helmet middleware enabled.","1. Using an HTTP client, send a request to any endpoint.
2. Inspect the response headers.
3. Assert that the `X-Powered-By` header is not present.","The `X-Powered-By` header is absent from the response.",N/A,"Supertest, Jest",0.5,TASK-202-4
GW-API-T011,Middleware - Core,Functional,Integration,High,High,"Verify that the CORS policy allows requests from a configured origin","The application is running with CORS middleware configured to allow a specific origin (e.g., `http://test-origin.com`).","1. Using an HTTP client, send a request with the `Origin` header set to `http://test-origin.com`.
2. Inspect the response headers.","The response includes the `Access-Control-Allow-Origin: http://test-origin.com` header.",`.env` with `CORS_ORIGIN=http://test-origin.com`,"Supertest, Jest",0.5,TASK-202-4
GW-API-T012,Middleware - Core,Functional,Integration,High,High,"Verify that the CORS policy blocks requests from an unconfigured origin","The application is running with CORS middleware configured to allow a specific origin (e.g., `http://test-origin.com`).","1. Using an HTTP client, send a request with the `Origin` header set to `http://blocked-origin.com`.
2. Inspect the response headers.","The response does NOT include the `Access-Control-Allow-Origin` header.",`.env` with `CORS_ORIGIN=http://test-origin.com`,"Supertest, Jest",0.5,TASK-202-4
GW-API-T013,Error Handling,Functional,Integration,Highest,High,"Verify that requests to non-existent routes return a 404 Not Found error","The application is running with the 404 handler middleware configured.","1. Using an HTTP client, send a GET request to a path that is not defined, like `/this/path/does/not/exist`.
2. Assert the response status code.","The server responds with a 404 status code.",N/A,"Supertest, Jest",0.5,TASK-202-3
GW-API-T014,Error Handling,Functional,Integration,Highest,High,"Verify that the global error handler catches unhandled errors and returns a 500 status","The application is running with the global error handler middleware configured.","1. Create a temporary test route that intentionally throws an error (e.g., `throw new Error('Test Error')`).
2. Using an HTTP client, send a GET request to that test route.
3. Assert the response status code and body.","The server responds with a 500 status code and a generic JSON error message (e.g., `{\"error\": \"Internal Server Error\"}`). The full error details should not be exposed to the client.",Temporary error-throwing route,"Supertest, Jest",1,TASK-202-3
GW-API-T015,Middleware - Auth,Security,Unit,Highest,High,"Verify auth middleware allows requests with a valid JWT","The auth middleware module is available.","1. Mock the remote JWKS call to return a valid public key.
2. Generate a valid, non-expired JWT signed with the corresponding private key.
3. Create mock `req`, `res`, `next` objects. `req.headers.authorization` contains the 'Bearer <token>'.
4. Call the `verifyToken` middleware.
5. Assert that `next()` was called without an error and that `req.user` is populated with the JWT payload.","The `next()` function is called exactly once. `req.user` contains the decoded JWT payload.",Mock Express objects, a valid JWT, and a mock JWKS response,"Jest, jose (or mock JWT lib)",1.5,TASK-401-4
GW-API-T016,Middleware - Auth,Security,Unit,Highest,High,"Verify auth middleware rejects requests with no Authorization header","The auth middleware module is available.","1. Create mock `req`, `res`, `next` objects. `req.headers` is empty.
2. Call the `verifyToken` middleware.
3. Assert that `res.status` was called with 401.","The `res.status()` method is called with 401, and `next()` is not called.",Mock Express objects,"Jest, Express.js",1,TASK-401-4
GW-API-T017,Middleware - Auth,Security,Unit,Highest,High,"Verify auth middleware rejects requests with an expired JWT","The auth middleware module is available.","1. Mock the remote JWKS call.
2. Generate an expired JWT.
3. Create mock `req`, `res`, `next` objects with the expired token.
4. Call the `verifyToken` middleware.
5. Assert that `res.status` was called with 403.","The `res.status()` method is called with 403, and `next()` is not called.",Mock Express objects, an expired JWT, and a mock JWKS response,"Jest, jose (or mock JWT lib)",1,TASK-401-4
GW-API-T018,Middleware - Auth,Security,Unit,Highest,High,"Verify auth middleware rejects requests with an invalid signature","The auth middleware module is available.","1. Mock the remote JWKS call with a valid public key.
2. Generate a JWT signed with a *different* private key.
3. Create mock `req`, `res`, `next` objects with the tampered token.
4. Call the `verifyToken` middleware.
5. Assert that `res.status` was called with 403.","The `res.status()` method is called with 403, and `next()` is not called.",Mock Express objects, a tampered JWT, and a mock JWKS response,"Jest, jose (or mock JWT lib)",1,TASK-401-4
GW-API-T019,Middleware - Auth,Functional,Unit,Highest,High,"Verify auth middleware handles JWKS fetch errors gracefully","The auth middleware module is available.","1. Mock the `jose.createRemoteJWKSet` function to throw a network error.
2. Create mock `req`, `res`, `next` objects with a valid token.
3. Call the `verifyToken` middleware.
4. Assert that `next()` was called with an error object.","The `next(error)` function is called, passing the error to the global error handler.",Mock Express objects, a valid JWT, mock for `jose`,"Jest, jose",1,TASK-401-4
GW-API-T020,Middleware - Proxy,Functional,Unit,Highest,High,"Verify proxy decorator adds user context header when req.user exists","The `proxyReqOptDecorator` function from the proxy middleware is available.","1. Create a mock `req` object with a `user` property (e.g., `req.user = { sub: '123' }`).
2. Create mock proxy request options.
3. Call the decorator function with the mock objects.
4. Assert that `proxyReqOpts.headers['x-user-context']` exists and contains the serialized user object.","The `x-user-context` header is added to the proxy request options with the value `'{\""sub\"":\""123\""}'`.",Mock request object,Jest,0.5,TASK-301-3
GW-API-T021,Middleware - Proxy,Functional,Unit,Highest,High,"Verify proxy decorator does not add user context header when req.user is absent","The `proxyReqOptDecorator` function from the proxy middleware is available.","1. Create a mock `req` object without a `user` property.
2. Create mock proxy request options.
3. Call the decorator function with the mock objects.
4. Assert that `proxyReqOpts.headers['x-user-context']` is undefined.","The `x-user-context` header is not added to the proxy request options.",Mock request object,Jest,0.5,TASK-301-3
GW-API-T022,Routing,Functional,System,Highest,High,"Verify a request to a protected route is proxied correctly with a valid token","The application is running. A mock downstream service is running. A mock JWKS endpoint is running.","1. Generate a valid JWT.
2. Send a `GET` request to a protected gateway route (e.g., `/player/profile`) with the `Authorization: Bearer <token>` header.
3. The mock downstream service should inspect the incoming request.","The mock downstream service receives the request. The request includes the `x-user-context` header containing the JWT payload. The gateway returns the response from the mock service.",Mock downstream service, mock JWKS endpoint, valid JWT,"Supertest, nock (or mock server)",2,US-009
GW-API-T023,Routing,Security,System,Highest,High,"Verify a request to a protected route is rejected without a token","The application is running. A mock downstream service is running.","1. Send a `GET` request to a protected gateway route (e.g., `/player/profile`) without an `Authorization` header.
2. The mock downstream service should record if it receives any requests.","The gateway responds with a 401 or 403 status code. The mock downstream service does not receive the request.",Mock downstream service,"Supertest, nock (or mock server)",1,US-009
GW-API-T024,Routing,Functional,System,High,High,"Verify a request to a public route is proxied correctly","The application is running. A mock downstream service is running.","1. Send a `POST` request with a JSON body to a public gateway route (e.g., `/auth/login`).
2. The mock downstream service should inspect the incoming request.","The mock downstream service receives the `POST` request with the correct path and JSON body. The gateway returns the response from the mock service.",Mock downstream service,"Supertest, nock (or mock server)",1.5,US-009
GW-API-T025,API Documentation,Functional,Integration,High,High,"Verify that the Swagger UI is served at the /api-docs endpoint","The application is running with Swagger configured.","1. Using an HTTP client, send a GET request to `/api-docs`.
2. Assert the status code is 200 and the response body contains 'Swagger UI'.","The server responds with a 200 status code and HTML content for the Swagger UI page.",N/A,"Supertest, Jest",0.5,TASK-501-2
GW-API-T026,API Documentation,Functional,Manual,Medium,Manual,"Verify that protected routes are marked as secure in Swagger UI","The application is running with Swagger UI available at `/api-docs`.","1. Open `/api-docs` in a web browser.
2. Find a protected endpoint, such as `/player`.
3. Visually inspect the endpoint's documentation.","The endpoint is displayed with a lock icon, indicating that it requires authorization.",N/A,"Web Browser",0.5,TASK-502-2
GW-API-T027,Deployment,Functional,Smoke,High,High,"Verify the application starts correctly inside a Docker container","A Docker image of the application has been built successfully.","1. Run the Docker container using `docker run`, passing all required environment variables via `-e` flags.
2. Check the container logs using `docker logs`.
3. Send a request to the health check endpoint on the mapped port.","The container starts without crashing. The logs show the 'server listening' message. A GET request to `/healthz` on the host returns a 200 OK.",Built Docker image, valid `.env` file,"Docker",1,US-014
GW-API-T028,Deployment,Build,Build,High,High,"Verify the multi-stage Docker build produces a small, clean image","The `Dockerfile` and `.dockerignore` files are present.","1. Run `docker build .`
2. After the build, run `docker history <image_name>` or `docker scout <image_name>` to inspect the image.","The build completes successfully. The final image size is below a defined threshold (e.g., 250MB). The image does not contain the `src` folder, `tsconfig.json`, or development dependencies.",N/A,"Docker, CI/CD Platform",0.5,TASK-601-2
GW-API-T029,Health Check,Functional,Integration,Highest,High,"Verify the /healthz endpoint returns a 200 OK status","The application is running.","1. Using an HTTP client, send a GET request to `/healthz`.
2. Assert the status code and response body.","The server responds with a 200 status code and the JSON body `{\"status\": \"ok\"}`.",N/A,"Supertest, Jest",0.5,TASK-602-2
GW-API-T030,Security,Security,Build,High,High,"Scan for known vulnerabilities in npm dependencies","The `package.json` and `package-lock.json` files are present.","1. Integrate `npm audit --audit-level=high` or a Snyk scan into the CI/CD pipeline.
2. The pipeline should run this command on every build of the main branch.","The build fails if any high or critical severity vulnerabilities are found. The command output lists any found vulnerabilities.",N/A,"npm, Snyk, CI/CD Platform",1,R-006
GW-API-T031,Performance,Non-Functional,Performance,Medium,Medium,"Establish baseline latency under normal load","The application is deployed to a staging environment that mirrors production.","1. Use a load testing tool (e.g., k6, Artillery) to simulate a realistic load (e.g., 100 requests per second for 5 minutes) against a protected endpoint.
2. Measure the p95 and p99 response times.","The p95 latency remains below 150ms. The p99 latency remains below 250ms. The error rate is 0%.",JWT tokens for load test users,"k6, Artillery",8,R-004
GW-API-T032,Performance,Non-Functional,Performance,Medium,Medium,"Determine the maximum request throughput (stress test)","The application is deployed to a staging environment.","1. Use a load testing tool to gradually ramp up the number of virtual users/requests per second until the error rate exceeds 2% or p99 latency exceeds 1000ms.
2. Record the requests per second at which the system failed.","The test identifies the breaking point of the system (e.g., handles up to 500 RPS before degrading). This provides a benchmark for scaling needs.",JWT tokens for load test users,"k6, Artillery",6,R-004
GW-API-T033,Performance,Non-Functional,Performance,Low,Medium,"Check for memory leaks or performance degradation over time (soak test)","The application is deployed to a staging environment.","1. Use a load testing tool to apply a moderate, sustained load (e.g., 75% of baseline RPS) for an extended period (e.g., 4-6 hours).
2. Monitor memory usage and response times of the application throughout the test.","Memory usage remains stable and does not continuously increase over the test duration. Response times do not degrade over time.",JWT tokens for load test users,"k6, Artillery, APM Tool",12,R-004
GW-API-T034,Operational,Functional,E2E,Medium,Low,"Verify graceful shutdown logic under load","The application is running as a child process in a test script. A load generator is active.","1. Start the application server as a child process.
2. Start sending a stream of requests to the server.
3. While requests are in-flight, send a `SIGINT` signal to the child process.
4. The test script should monitor the process and existing requests.","The server process exits cleanly with code 0. Requests that were already in-flight when the signal was received are allowed to complete successfully. No new requests are accepted after the signal.",Custom test script, child_process module,"Node.js, k6",4,TASK-203-2