import React, { Component } from "react";

import classnames from "classnames";

import Loading from "./Loading";

import Panel from "./Panel";

const data = [
  {
    id: 1,
    label: "Total Interviews",
    value: 6
  },
  {
    id: 2,
    label: "Least Popular Time Slot",
    value: "1pm"
  },
  {
    id: 3,
    label: "Most Popular Day",
    value: "Wednesday"
  },
  {
    id: 4,
    label: "Interviews Per Day",
    value: "2.3"
  }
];

class Dashboard extends Component {

  state = {
    loading: false,
    focused: null
  };

  //Switches which panel is displayed on click. (displays all if focused: null or only one if focuse: id)
  selectPanel(id) {
    this.state.focused ? this.setState({ focused: null }) : this.setState({ focused: id })
  };

  render() {

    //Append "dashboard--focused" to "dashboard" when this.state.focused is not null
    const dashboardClasses = classnames("dashboard", {
      "dashboard--focused": this.state.focused
     });

    if (this.state.loading) {
      return <Loading />;
    }

    const panels = data

      .filter(
        //true for all when focused === null, or true for one when focused === panel.id
        panel => this.state.focused === null || this.state.focused === panel.id 
      )
      .map(panel => (
        <Panel
        key={panel.id}
        label={panel.label}
        value={panel.value}
        onSelect={event => this.selectPanel(panel.id)}
        />
      ));

    return <main className={dashboardClasses}>
              {panels}
          </main>;
  }
}

export default Dashboard;
