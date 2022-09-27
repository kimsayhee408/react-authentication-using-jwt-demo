import React, { useState, useEffect, useCallback } from "react";

let logoutTimer;

const AuthContext = React.createContext({
  // arg not necessary but better for auto-completion
  token: "",
  isLoggedIn: false,
  login: (token) => {},
  logout: () => {},
});

//helper function to calculate the remaining time - in ms - of authentication token
const calculateRemainingTime = (expirationTime) => {
  // expirationTime will be a string
  const currentTime = new Date().getTime(); // getTime() converts Date to timestamp (in ms); this is current timestamp
  const adjustedExpirationTime = new Date(expirationTime).getTime(); // converts the expiration time (from string) into timestamp
  const remainingDuration = adjustedExpirationTime - currentTime; // since firebase authentication token expires in 1 hour by default, IMMEDIATELY after user logs in, this value would be 1 hour in ms, but will eventually decrease to 0 as the hour passes
  return remainingDuration; // value in ms so we can pass it directly into setTimeout inside loginHandler to automatically log user out when firebase token expires
};

const retrieveStoredToken = () => {
  // note:  Note: local storage API works synchronously so we can call .getItem() and if the item specified does exist in storage, it WILL return that item's value; and undefined if it does not exist.  Ex. meaning we can worrilessly use retrieved item's value for an initial value to some state.
  const storedToken = localStorage.getItem("token");
  const storedExpirationDate = localStorage.getItem("expirationTime");
  const remainingTime = calculateRemainingTime(storedExpirationDate);

  //set up a threshold so if time left on authentication token is less than 1 min (up to u), we will actually not retrieve a stored token; in fact we will remove the token and timer from local storage;  This makes sense because as soon as token expires, any request for protected resources (which will require a token) will no longer work; if the token will expires in less than 1 min, we will take the active approach of going ahead and actually logging the user out
  // Note: prob a better approach would be to add logic to automatically refresh the token (there is an endpoint for it in firebase) when token is about to expire and user is reloading the page or entering URL etc, basically still showing signs of being active -- Would to send the request to this url ... https://securetoken.googleapis.com/v1/token?key=${apikey} with the body {'grant_type': 'refresh_token', 'refresh_token': <the current refresh token>} -- look at firebase documentation

  if (remainingTime < 60000) {
    localStorage.removeItem("token");
    localStorage.removeItem("expirationTime");
    return null;
  }

  return {
    token: storedToken,
    duration: remainingTime,
  };
};

export function AuthContextProvider(props) {
  const tokenData = retrieveStoredToken(); // will be null or object that looks like this: {token: storedToken, duration: remainingTime}

  let initialToken; // initialToken is undefined unless:

  if (tokenData) {
    //  there is a token found in localstorage, in which case it is tokenData.token
    initialToken = tokenData.token;
  }

  const [token, setToken] = useState(initialToken); // Initialize the 'token' state with initialToken as value instead of null.  This way, when our app reloads, it will look get access to the token if it is found in the browser's local storage - this enables user's authentication status to persist page reloads and also manually entering URL (if user did not log out).  (i.e. Even if user did not have to enter their email/password & click the login button to trigger the loginHandler function, this app was coded so the presence of a token basically grants access to all the protected resources so it is like 'automatically' logging the user in by setting the token in place if it can be found in storage)

  const userIsLoggedIn = !!token; // !! converts a truthY/falsY value to a boolean; We want to derive a boolean value from the presence/absence of a token and create a context property with that value - just makes it easier to use in the other components where we use the context

  const logoutHandler = useCallback(() => {
    // i think i would call it 'logoutTokenHandler' to make it less confusing
    // wrap logoutHandler in useCallback (with empty dep array) because logoutHandler is a dependency for our useEffect below
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("expirationTime");

    if (logoutTimer) {
      clearTimeout(logoutTimer);
    }
  }, []);

  const loginHandler = (token, expirationTime) => {
    // i think i would call it "loginTokenHandler" or sth
    setToken(token);
    localStorage.setItem("token", token);
    localStorage.setItem("expirationTime", expirationTime);
    const remainingTime = calculateRemainingTime(expirationTime);
    logoutTimer = setTimeout(logoutHandler, remainingTime); // can set the 2nd arg to ex. 3000 to test that the automatic logging out functionality works
  };

  //
  useEffect(() => {
    if (tokenData) {
      console.log(tokenData.duration);
      logoutTimer = setTimeout(logoutHandler, tokenData.duration);
    }
  }, [tokenData, logoutHandler]);

  const contextValue = {
    token: token,
    isLoggedIn: userIsLoggedIn,
    login: loginHandler,
    logout: logoutHandler,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
