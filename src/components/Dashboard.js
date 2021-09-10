import React, { Component } from "react";

import classnames from "classnames";

import Loading from "./Loading";

import Panel from "./Panel";

import axios from "axios";

import {
  getTotalInterviews,
  getLeastPopularTimeSlot,
  getMostPopularDay,
  getInterviewsPerDay
 } from "helpers/selectors";

import { setInterview } from "helpers/reducers";


const data = [
  {
    id: 1,
    label: "Total Interviews",
    getValue: getTotalInterviews
  },
  {
    id: 2,
    label: "Least Popular Time Slot",
    getValue: getLeastPopularTimeSlot
  },
  {
    id: 3,
    label: "Most Popular Day",
    getValue: getMostPopularDay
  },
  {
    id: 4,
    label: "Interviews Per Day",
    getValue: getInterviewsPerDay
  }
];

class Dashboard extends Component {

  //Initial state
  state = {
    loading: true,
    focused: null,
    days: [],
    appointments: {},
    interviewers: {}
  };

  //Switches which panel is displayed on click. (displays all if focused: null or only one if focuse: id)
  selectPanel(id) {
    this.state.focused ? this.setState({ focused: null }) : this.setState({ focused: id })
  };


  //lifecycle method to check to see if there is saved focus state after we render the application the first time
  componentDidMount() {
    const focused = JSON.parse(localStorage.getItem("focused"));

    if (focused) {
      this.setState({ focused });
    }

    Promise.all([
      axios.get("/api/days"),
      axios.get("/api/appointments"),
      axios.get("/api/interviewers")
    ]).then(([days, appointments, interviewers]) => {
      this.setState({
        loading: false,
        days: days.data,
        appointments: appointments.data,
        interviewers: interviewers.data
      });
    });
    
    //Websocket allows the datat to be updated in realtime any time the db changes
    this.socket = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL);

    this.socket.onmessage = event => {
      const data = JSON.parse(event.data);
    
      if (typeof data === "object" && data.type === "SET_INTERVIEW") {
        this.setState(previousState =>
          setInterview(previousState, data.id, data.interview)
        );
      }
    };


  }

  //lifecycle method to listen for changes to the state
  componentDidUpdate(previousProps, previousState) {
    if (previousState.focused !== this.state.focused) {
      localStorage.setItem("focused", JSON.stringify(this.state.focused));
    }
  }

  componentWillUnmount() {
    this.socket.close();
  }

 
  render() {    

    //Append "dashboard--focused" to "dashboard" when this.state.focused is not null
    const dashboardClasses = classnames("dashboard", {
      "dashboard--focused": this.state.focused
     });

    //Display loading component if loading
    if (this.state.loading) {
      return <Loading />;
    }

    console.log(this.state);

    //Create panels array of components
    const panels = data
      .filter(
        //true for all when focused === null, or true for one when focused === panel.id
        panel => this.state.focused === null || this.state.focused === panel.id 
      )
      .map(panel => (
        <Panel
        key={panel.id}
        label={panel.label}
        value={panel.getValue(this.state)}
        onSelect={event => this.selectPanel(panel.id)}
        />
      ));
    
    //Render panels
    return <main className={dashboardClasses}>
              {panels}
          </main>;
  }
}

export default Dashboard;
