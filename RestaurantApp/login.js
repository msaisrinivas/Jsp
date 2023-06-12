const domain = "dev-2-nc-gxa.us.auth0.com";
const clientId = "o8ute1DZqqMpr2nXZKA6WGRdCs7mBOzz";
const client_secret =
  "EjvjErQwWEcVSLG2fnqVmMBXxf1teMfUB-Xe1AEecboXZ4ik_N_IS7LJALHR7Oh8";
const tenantId = "dev-2-nc-gxa";
const grantType = "http://auth0.com/oauth/grant-type/password-realm";
const dbconnections = "Username-Password-Authentication";

const loginUrl = window.location.origin + "/restaurant.html";

//get error query param from url
const urlParams = new URLSearchParams(window.location.search);
const error = urlParams.get("error");
error && alert(error);
error && window.history.replaceState({}, document.title, "/login.html");

localStorage.setItem("res-isAuthenticated", false);

let b64DecodeUnicode = (str) =>
  decodeURIComponent(
    Array.prototype.map
      .call(
        atob(str),
        (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
      )
      .join("")
  );

let parseJwt = (token) =>
  JSON.parse(
    b64DecodeUnicode(token.split(".")[1].replace("-", "+").replace("_", "/"))
  );

const SOCIAL_LOGIN = `https://${domain}/authorize?response_type=token&client_id=${clientId}&connection=google-oauth2&redirect_uri=${loginUrl}&scope=openid%20email`;
const AUTH0_SIGNUP = `https://${domain}/dbconnections/signup`;
const AUTH0_SIGNIN = `https://${domain}/oauth/token`;
const AUTH0_USER_BY_EMAIL = `https://${domain}/api/v2/users-by-email`;
const AUTH0_UPDATE_PASSWORD = `https://${domain}/api/v2/users/`;
const AUTH0_USER_INFO = `https://${domain}/userinfo/`;

const loginBody = {
  grant_type: grantType,
  username: "",
  password: "",
  audience: `https://${domain}/api/v2/`,
  scope: "openid profile email",
  client_id: clientId,
  client_secret: client_secret,
  realm: dbconnections,
};

function onLogin(event) {
  event.preventDefault();
  console.log("login", event.target.email.value, event.target.password.value);
  fetch(AUTH0_SIGNIN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...loginBody,
      username: event.target.email.value,
      password: event.target.password.value,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.access_token) {
        localStorage.setItem("res-isAuthenticated", true);
        //decode token to get user info with RS256
        const decoded = parseJwt(data.id_token);
        localStorage.setItem(
          "res-user",
          JSON.stringify({
            email: decoded.email,
            name: decoded.name,
            nickname: decoded.nickname,
            email_verified: decoded.email_verified,
          })
        );
        window.location.replace(loginUrl);
      } else {
        alert("Login failed");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Login failed, Please check with credential");
    });
}

function onSignup(event) {
  event.preventDefault();
  const email = event.target.email.value;
  const password = event.target.password.value;
  const name = event.target.name.value;
  fetch(AUTH0_SIGNUP, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      email: email,
      password: password,
      connection: dbconnections,
      name: event.target.name.value,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      localStorage.setItem("res-isAuthenticated", true);
      localStorage.setItem(
        "res-user",
        JSON.stringify({
          email: email,
          name: name,
          nickname: name,
          email_verified: false,
        })
      );
      window.location.replace(loginUrl);
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Signup failed");
    });
}
