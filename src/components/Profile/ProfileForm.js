import classes from "./ProfileForm.module.css";
import { useRef } from "react";
import { useContext } from "react";
import AuthContext from "../../store/auth-context";
import { useHistory } from "react-router-dom";

// https://firebase.google.com/docs/reference/rest/auth --> look at CHANGE PASSWORD sectopm

const ProfileForm = () => {
  const newPasswordInputRef = useRef();

  const authCtx = useContext(AuthContext);

  const history = useHistory();

  // add validation

  const submitHandler = (event) => {
    const enteredNewPassword = newPasswordInputRef.current.value;
    event.preventDefault();
    fetch(
      "https://identitytoolkit.googleapis.com/v1/accounts:update?key=AIzaSyD2gqDLAGcMk6SiDA-mIjH7RQn1t3gn4D8",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken: authCtx.token,
          password: enteredNewPassword,
          returnSecureToken: false,
        }),
      }
    ) // add proper error handling, for now always assume success
      .then((res) => {
        history.replace("/");
      });
  };
  return (
    <form onSubmit={submitHandler} className={classes.form}>
      <div className={classes.control}>
        <label htmlFor="new-password">New Password</label>
        <input
          ref={newPasswordInputRef}
          minLength="7" // will get a little warning popup if less than 7 characters and I try to submit the form
          type="password"
          id="new-password"
        />
      </div>
      <div className={classes.action}>
        <button type="submit">Change Password</button>
      </div>
    </form>
  );
};

export default ProfileForm;

//Change password
// You can change a user's password by issuing an HTTP POST request to the Auth setAccountInfo endpoint.

// Method: POST

// Content-Type: application/json

// Endpoint

// https://identitytoolkit.googleapis.com/v1/accounts:update?key=[API_KEY]
// Request Body Payload
// Property Name	Type	Description
// idToken	string	A Firebase Auth ID token for the user.
// password	string	User's new password.
// returnSecureToken	boolean	Whether or not to return an ID and refresh token.
// Response Payload
// Property Name	Type	Description
// localId	string	The uid of the current user.
// email	string	User's email address.
// passwordHash	string	Hash version of password.
// providerUserInfo	List of JSON objects	List of all linked provider objects which contain "providerId" and "federatedId".
// idToken	string	New Firebase Auth ID token for user.
// refreshToken	string	A Firebase Auth refresh token.
// expiresIn	string	The number of seconds in which the ID token expires.
