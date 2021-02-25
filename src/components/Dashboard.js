import React, {Component} from "react";

import Loading from "./Loading";
import Panel from "./Panel";

import axios from "axios";

import classnames from "classnames";
import {
  getTotalInterviews,
  getLeastPopularTimeSlot,
  getMostPopularDay,
  getInterviewsPerDay,
} from "helpers/selectors";

const data = [
  {
    id: 1,
    label: "Total Interviews",
    value: getTotalInterviews,
  },
  {
    id: 2,
    label: "Least Popular Time Slot",
    value: getLeastPopularTimeSlot,
  },
  {
    id: 3,
    label: "Most Popular Day",
    value: getMostPopularDay,
  },
  {
    id: 4,
    label: "Interviews Per Day",
    value: getInterviewsPerDay,
  },
];

class Dashboard extends Component {
  state = {
    loading: true,
    focused: null,
    days: [],
    appointments: {},
    interviewers: {},
  };

  componentDidMount() {
    const focused = JSON.parse(localStorage.getItem("focused"));
    Promise.all([
      axios.get("/api/days"),
      axios.get("/api/appointments"),
      axios.get("/api/interviewers"),
    ]).then(([days, appointments, interviewers]) => {
      this.setState({
        loading: false,
        days: days.data,
        appointments: appointments.data,
        interviewers: interviewers.data,
      });
    });

    if (focused) {
      this.setState({focused});
    }
  }

  componentDidUpdate(previousProps, previousState) {
    if (previousState.focused !== this.state.focused) {
      localStorage.setItem("focused", JSON.stringify(this.state.focused));
    }
  }

  handleClick(id) {
    this.setState((previousState) => ({
      focused: previousState.focused !== null ? null : id,
    }));
  }
  render() {
    const dashboardClasses = classnames("dashboard", {
      "dashboard--focused": this.state.focused,
    });

    if (this.state.loading) {
      return <Loading />;
    }

    const newPanel = data
      .filter(
        (panel) =>
          this.state.focused === null || this.state.focused === panel.id
      )
      .map((panel) => (
        <Panel
          key={panel.id}
          id={panel.id}
          label={panel.label}
          value={panel.value(this.state)}
          onClick={(event) => this.handleClick(panel.id)}
        />
      ));

    return <main className={dashboardClasses}>{newPanel}</main>;
  }
}

export default Dashboard;
