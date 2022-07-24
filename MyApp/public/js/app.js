window.onload = async () => {
  await configureClient();
  updateUI();
  const isAuthenticated = await auth0JP.isAuthenticated();
  if (isAuthenticated) {
    // show the gated content
    return;
  }
  // NEW - check for the code and state parameters
  const query = window.location.search;
  if (query.includes("code=") && query.includes("state=")) {
    // Process the login state
    await auth0JP.handleRedirectCallback();
    updateUI();
    // Use replaceState to redirect the user away and remove the querystring parameters
    window.history.replaceState({}, document.title, "/");
  }
  try {
    user = await auth0JP.getUser()
    console.log("Inside on load function " + user);
    if (user) {
      await configureMgmt()
      render_orders()
    }
  } catch (e) {
    console.log(e)
  }
};

//Add pizza to Cart
const addPizza = async (id, name, price) => {
  item = new Object({
    id: id,
    name: name,
    price: price
  })
  console.log(item)
  try {
    CART = JSON.parse(lGet('cart'))
    if (!CART) CART = []
    console.log('add to cart', item)
    CART.push(item)
    lSet('cart', JSON.stringify(CART))
    render_cart(CART);
  } catch (e) {
    console.error(e);
  }
};

// Remove pizza from Cart
const removePizza = async (itemid) => {
  CART = await JSON.parse(lGet('cart'))
  idx = CART.findIndex((i) => i.id == itemid)
  console.log('remove from cart', idx)
  if (idx > -1) {
    CART.splice(idx, 1);
  }
  await lSet('cart', JSON.stringify(CART))
  render_cart(CART);

};

//Placing an order
const orderNow = async () => {
  CART = await JSON.parse(lGet('cart'))
  let itemList = await render_cart(CART)
  //console.log(itemList)

  if (itemList === undefined || Object.keys(itemList).length == 1) {
    alert("Please add items to cart");
    return;
  }
  const token = await auth0JP.getTokenSilently();
  const response = await fetch(`/api/orders/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(itemList)
  });
  console.log(response)
  const responseData = await response.json();
  console.log(responseData);
  if (responseData.success) {
    render_orders()
    alert("Order Successful!")
    lSet('cart', JSON.stringify([]))
    render_cart([])
  }
}

//Login Function
const login = async () => {
  try {
    await auth0JP.loginWithRedirect({
      redirect_uri: window.location.origin
    });
  } catch (err) {
    alert("Log in failed");
    console.log(err);
  }
};

//Logout Function
const logout = () => {
  try {
    console.log("Logging out");
    auth0JP.logout({
      returnTo: window.location.origin
    });
  } catch (err) {
    alert("Log out failed");
    console.log(err);
  }
};