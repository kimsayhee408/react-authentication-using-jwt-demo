import { Switch, Route, Redirect } from "react-router-dom";

import Layout from "./components/Layout/Layout";
import UserProfile from "./components/Profile/UserProfile";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import AuthContext from "./store/auth-context";
import { useContext } from "react";

function App() {
  const authCtx = useContext(AuthContext); // we will use authCtx.isLoggedIn value to set up "navigation guards"
  return (
    <Layout>
      <Switch>
        <Route path="/" exact>
          <HomePage />
        </Route>
        {/* domain.com/auth is only accessible if user is NOT logged in: */}
        {!authCtx.isLoggedIn && (
          <Route path="/auth">
            <AuthPage />
          </Route>
        )}
        {/* domain.com/profile is only accessible if user IS logged in - otherwise, redirect to "auth" page*/}
        {authCtx.isLoggedIn && (
          <Route path="/profile">
            <UserProfile />
          </Route>
        )}
        {/* entering any invalid OR inaccessible path will redirect to home*/}
        <Route path="*">
          <Redirect to="/" />
        </Route>
      </Switch>
    </Layout>
  );
}

export default App;

// (another alternative to handle navigation guard for the profile Route depending on whether is authenticated or not - would be to redirect an unauthenticated user when they enter the /profile path to the '/auth' page instead of home -- by setting up conditional rendering within the profile route like so: )

/*
<Route path='profile' />
    {authCtx.isLoggedIn && <UserProfile />}
    {!authCtx.isLoggedIn && <Redirect to='.auth'/>}
</Route>  

*/
