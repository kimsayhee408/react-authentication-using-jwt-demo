Simple demo for authentication flow & setup in a react project. It features:

- react-router-dom for routing;
- firebase authentication service to mimic DB holding user information, provide jwt
- browser local storage to store token value to persist user authentication status through page reload / manual url entering while firebase token is active (i.e. not expired) (note: by default, firebase token expires in 1 hour)
- automatic logout functionality upon token expiry (keeping expiration time stored in local storage)
- use of React Context to provide app wide authentication-related state n handlers

Link to documentation for the firebase authentication API:
https://firebase.google.com/docs/reference/rest/auth
