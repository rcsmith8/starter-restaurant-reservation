import React from "react";

import { Redirect, Route, Switch } from "react-router-dom";
import Dashboard from "../routes/dashboard/Dashboard.Route";
import NotFound from "./NotFound";
import { today } from "../utils/date-time";
import NewReservation from "../routes/NewReservation/NewReservation.Route";
import useQuery from '../utils/useQuery'
import SeatReservation from "../routes/SeatReservation/SeatReservation.Route";
import Search from "../routes/Search/Search.Route";
import EditReservation from "../routes/EditReservation/EditReservation.Route";
import NewTable from "../routes/CreateTable/CreateTable.Route";

/**
 * Defines all the routes for the application.
 *
 * You will need to make changes to this file.
 *
 * @returns {JSX.Element}
 */
function Routes() {
  const query = useQuery();
  const [date, setDate] = React.useState(query.get('date') || today())
  
  return (
    <Switch>
      <Route exact={true} path="/">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route exact path="/reservations/:reservation_id/edit">
        <EditReservation />
      </Route>
      <Route exact path="/reservations/:reservation_id/seat">
        <SeatReservation />
      </Route>
      <Route exact path="/reservations/new">
        <NewReservation />
      </Route>
      <Route exact={true} path="/reservations">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route path="/dashboard">
        <Dashboard date={date} />
      </Route>
      <Route exact path="/search">
        <Search />
      </Route>
      <Route exact path ="/tables/new">
        <NewTable />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default Routes;
