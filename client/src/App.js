import React, { Fragment } from "react";
import {BrowserRouter as Router, Route, Switch} from  'react-router-dom';
import Navbar from './components/layouts/Navbar';
import Landing from './components/layouts/Landing';
import Register from './components/auth/Register';
import Login from './components/auth/Login';


import "./App.css";
const App=() =>
<Router>
<Fragment>
  <Navbar />
  <Route exact path="/" component={Landing}></Route>
    <section className="container">
      <Switch>
      <Route exact path="/Register" component={Register}></Route>
      <Route exact path="/Login" component={Login}></Route>
      </Switch>
    </section>

</Fragment>
</Router>

export default App;
