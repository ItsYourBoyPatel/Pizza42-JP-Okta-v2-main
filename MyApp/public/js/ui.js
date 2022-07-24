//Updating UI after User Authenticated and Logged in and Logged out Successfully
//Evaluating the authentication state
const updateUI = async () => {
  const isAuthenticated = await auth0JP.isAuthenticated();
  document.getElementById("btn-logout").disabled = !isAuthenticated;
  document.getElementById("btn-login").disabled = isAuthenticated;
  document.getElementById("btn-call-api").disabled = !isAuthenticated;

  if (isAuthenticated) {
    document.getElementById("gated-content").classList.remove("hidden");
    document.getElementById("history-content").classList.remove("hidden");

    userProfile = await auth0JP.getUser();
    //console.log(userProfile)
    str = "Welcome " + "<b>" + userProfile['name'] + "</b>" + "<br>" + "<b>" + "Email: " + "</b>" + userProfile['email']
    document.getElementById("ipt-user-profile").innerHTML = str
    CART = JSON.parse(lGet('cart'))
    render_cart(CART)
  } else {
    document.getElementById("gated-content").classList.add("hidden");
  }
};

//Get Current list of items in the Cart
const render_cart = async (items) => {
  if (!items) return;
  finalList = {}
  str = ""
  subTotal = ""
  amount = 0;

  // console.log(items)
  items.forEach((item, i) => {
    if (!finalList[item['id']]) {

      item['count'] = 1

      finalList[item['id']] = new Object(item)
    } else {
      finalList[item['id']]['count'] = finalList[item['id']]['count'] + 1
    }
  });

  for (let item of Object.keys(finalList)) {
    str += "<b>" + " Name: " + "</b>" + finalList[item]['name'] + "<b>" + " Price: " + "</b>" + finalList[item]['price'] + "<b>" + " Quantity: " + "</b>" + finalList[item]['count'] + "<br>" + "<br>";

    subTotal += "<b>" + " SubTotal - " + "</b>" + finalList[item]['name'] + ":" + " " + "<b>" + finalList[item]['price'] * finalList[item]['count'] + "</b>" + "<br>"

    amount += finalList[item]['price'] * finalList[item]['count']
  }
  finalList['total'] = amount
  document.getElementById("pizzaList").innerHTML = str;
  document.getElementById("subTotal").innerHTML = subTotal;
  if (Object.keys(finalList).length > 1) {
    document.getElementById("amount").innerHTML = "<b>" + "Total: " + "</b>" + amount;
  } else {
    document.getElementById("amount").innerHTML = "";
  }
  return finalList;
};

var ORDERS = []
//Retrieve order histroy from User Auth0 session
const render_orders = async () => {
  if (!mgmt) return null;
  await mgmt.getUser(user.sub, (err, res) => {
    if (err) k = null;
    items = res.app_metadata ? res.app_metadata.orders.reverse() : '';
    ORDERS = items;
    console.log(ORDERS)
    updateHistory(items)
  });
};

//Get Order Histroy for previously placed orders
const updateHistory = async (items) => {
  str = ""
  if (!items) {
    document.getElementById("order-history").innerHTML = "No previous orders"
  } else {
    str += "You have " + items.length + " previous orders"
    items.forEach((history, i) => {
      str += "<div style='border-style:double;'><p><b>Order Placed on :</b> " + history.time + "</p> "
      for ([key, value] of Object.entries(history)) {
        if (key != "time" && key != "total") {
          str += "<p><b>Name: </b>" + value.name + "  <b>Price: </b>" + value.price + "  <b>Quantity: </b>" + value.count + "</p>"
        }
      }
      str += "<p><b>Total: </b>" + history["total"] + "</p>"
      str += " </div><br>"

    });
    document.getElementById("order-history").innerHTML = str
  }
};
