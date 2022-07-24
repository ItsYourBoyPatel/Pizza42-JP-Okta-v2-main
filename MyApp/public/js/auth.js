var auth0JP = null;
var mgmt = null;
var config = null
//Initialize SDK
var fetchAuthConfig = () => fetch("/auth_config.json");

//Download the configuration file and initialize the auth0 variable:

//This call will also populate the in-memory cache with a valid access token and user profile
//information if someone has already authenticated before and that session is still valid.

const configureClient = async () => {
  const response = await fetchAuthConfig();
  config = await response.json();
  //Adding audience here is key as this is how it will connect your SPA
  auth0JP = await createAuth0Client({
    domain: config.domain,
    client_id: config.clientId,
    audience: config.audience,
    scope: 'openid profile email read:current_user update:current_user_identities update:current_user_metadata create:current_user_metadata delete:current_user_metadata create:current_user_device_credentials delete:current_user_device_credentials'
  });
  try {
    user = await auth0JP.getUser()
    console.log(user);
    if (user) {
      configureMgmt()
    }
  } catch (e) {
    console.log(e)
  }
};

//Configuring conenction to Auth0 Management API
const configureMgmt = async () => {
  webAuth = new auth0.WebAuth({
    domain: config.domain,
    clientID: config.clientId
  });
  mgmt = new auth0.Management({
    domain: config.domain,
    // Get the access token from the Auth0 client
    token: await auth0JP.getTokenSilently()
  });
}
