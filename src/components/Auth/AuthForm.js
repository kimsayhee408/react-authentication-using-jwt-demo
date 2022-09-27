import { useState, useRef } from "react";
import { useContext } from "react";
import AuthContext from "../../store/auth-context";
import { useHistory } from "react-router-dom";

import classes from "./AuthForm.module.css";

const AuthForm = () => {
  const authCtx = useContext(AuthContext);
  const history = useHistory();

  const [isLogin, setIsLogin] = useState(true); // vs sign up mode
  const [isLoading, setIsLoading] = useState(false);

  const emailInputRef = useRef();
  const passwordInputRef = useRef();

  const switchAuthModeHandler = () => {
    // ex. loggin in / signing up
    setIsLogin((prevState) => !prevState);
  };

  const submitHandler = (event) => {
    event.preventDefault();

    const enteredEmail = emailInputRef.current.value;
    const enteredPassword = passwordInputRef.current.value;

    setIsLoading(true);
    let url;
    if (isLogin) {
      url =
        "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyD2gqDLAGcMk6SiDA-mIjH7RQn1t3gn4D8";
    } else {
      url =
        "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyD2gqDLAGcMk6SiDA-mIjH7RQn1t3gn4D8";
    }
    fetch(url, {
      method: "POST",

      body: JSON.stringify({
        email: enteredEmail,
        password: enteredPassword,
        returnSecureToken: true,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        setIsLoading(false);
        if (res.ok) {
          return res.json();
        } else {
          // unsuccessful response also returns JSON data, so
          return res.json().then((data) => {
            let errorMessage = "Authentication failed!"; // default error message
            if (data && data.error && data.error.message) {
              // if the specific error message is available in the fail response, will use it
              errorMessage = data.error.message;
            }

            throw new Error(errorMessage);
          });
        }
      })
      .then((resp) => {
        // we only get here if res.ok meaning successful login
        const expirationTime = new Date(
          new Date().getTime() + +resp.expiresIn * 1000
        );
        // remember you can create a new date object by passing in a timestamp. ANd here we are
        // basically constructing a new date object using current timestamp + 1 hour in ms.   So expirationTime is the date object representing the time in which this token will expire; And when user successfully logs in with Firebase, we calculate this time.
        // note: the expiresIn property of the success response from firebase authentication service will hold the default token duration in seconds (1 hour in seconds -- it is a string though so we converted to number and in ms using + sign and * 1000)
        authCtx.login(resp.idToken, expirationTime.toISOString()); // we want to convert the expirationTime (a Date object) to a string before passing int to authCtx.login becuase inside authCtx.login we will be storing it in local storage (which can only accept strings and numbers)
        history.replace("/"); // redirect user to home page
      })
      .catch((err) => alert(err.message));
  };

  return (
    <section className={classes.auth}>
      <h1>{isLogin ? "Login" : "Sign Up"}</h1>
      <form onSubmit={submitHandler}>
        <div className={classes.control}>
          <label htmlFor="email">Your Email</label>
          <input ref={emailInputRef} type="email" id="email" required />
        </div>
        <div className={classes.control}>
          <label htmlFor="password">Your Password</label>
          <input
            ref={passwordInputRef}
            type="password"
            id="password"
            required
          />
        </div>
        <div className={classes.actions}>
          {isLoading && <p>Sending request...</p>}
          {!isLoading && (
            <button type="button" onClick={submitHandler}>
              {isLogin ? "Login" : "Create Account"}
            </button>
          )}
          <button
            type="button"
            className={classes.toggle}
            onClick={switchAuthModeHandler}
          >
            {isLogin ? "Create new account" : "Login with existing account"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default AuthForm;
