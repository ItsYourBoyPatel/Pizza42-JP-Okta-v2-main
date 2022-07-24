const express = require("express");
var {
  expressjwt: jwt
} = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const axios = require('axios');
const qs = require('qs');
const {
  join
} = require("path");
const authConfig = require("./auth_config.json");
const app = express();
app.use(express.json({
  limit: '10mb'
}))
const ManagementClient = require('auth0').ManagementClient;

if (!authConfig.domain || !authConfig.audience) {
  throw "Please make sure that auth_config.json is in place and populated";
}

//Credentials for M2M Application connected to the API for SPA.
const management = new ManagementClient({
  domain: "dev-ghqefe8r.us.auth0.com",
  clientId: "7CYcIwQdtA7vaO6DOZqZitxXgRTp3uPf",
  clientSecret: "qdaucBWDEbBE-qL7pmptQjIatVnHrF55BqOU2tWxoY0-n6bvHO87qRO_cQXnRPat",
  audience: "https://dev-ghqefe8r.us.auth0.com/api/v2/"
  // scope: 'read:users update:users'
})

// Serve static assets from the /public folder
app.use(express.static(join(__dirname, "public")));


// const checkJwt = auth({
//     audience: authConfig.audience,
//     issuerBaseURL: `https://${authConfig.domain}`
//   });


const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 50,
    jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`
  }),

  audience: authConfig.audience,
  issuer: `https://${authConfig.domain}/`,
  algorithms: ["RS256"]
});

// Endpoint to serve the configuration file
app.get("/auth_config.json", (req, res) => {
  res.sendFile(join(__dirname, "auth_config.json"));
});

//Placing an order and sending back the order histroy back to user Auth0 Profile
app.post('/api/orders', checkJwt, async (req, res) => {
  console.log(req)
  const id = req.auth.sub
  const time = (new Date()).toLocaleString()
  // console.log(req.body)
  const order = Object.assign(req.body, {
    time
  })
  try {
    let metadata = await management.getUser({
      id
    }).then(user => user.app_metadata || {})
    console.warn(metadata)
    // metadata = {}
    if (!metadata) metadata = {}
    if (!metadata.orders) metadata.orders = []
    metadata.orders.push(order)
    const update = await management.updateAppMetadata({
      id
    }, metadata)
    res.status(201).json({
      message: `Order Placed Successfully`,
      success: true
    })
  } catch (error) {
    console.log(error)
    res.status(error.status ?? 500).json({
      message: `Error: ${error.message}`,
      success: false
    })
  }
});

// Serve the index page for all other requests
app.get("/*", (_, res) => {
  res.sendFile(join(__dirname, "index.html"));
});


app.use(function(err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    return res.status(401).send({
      msg: "Invalid token"
    });
  }
  next(err, req, res);
});

// Listen on port 3000
//app.listen(3000, () => console.log("Application running on port 3000"));


module.exports = app;
