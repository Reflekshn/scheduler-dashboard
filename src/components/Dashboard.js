import React, { Component } from 'react';
import Loading from './Loading';
import Panel from './Panel';

import axios from 'axios';
import classnames from 'classnames';

import {
  getTotalInterviews,
  getLeastPopularTimeSlot,
  getMostPopularDay,
  getInterviewsPerDay,
} from 'helpers/selectors';
import { setInterview } from 'helpers/reducers';

// Panel data array
const data = [
  {
    id: 1,
    label: 'Total Interviews',
    getValue: getTotalInterviews,
  },
  {
    id: 2,
    label: 'Least Popular Time Slot',
    getValue: getLeastPopularTimeSlot,
  },
  {
    id: 3,
    label: 'Most Popular Day',
    getValue: getMostPopularDay,
  },
  {
    id: 4,
    label: 'Interviews Per Day',
    getValue: getInterviewsPerDay,
  },
];

class Dashboard extends Component {
  // Set initial state variable
  state = {
    loading: false,
    focused: null,
    days: [],
    appointments: {},
    interviewers: {},
  };

  // Retrieve data from the database API when the component mounts and set
  // state variables
  componentDidMount() {
    Promise.all([
      axios.get('/api/days'),
      axios.get('/api/appointments'),
      axios.get('/api/interviewers'),
    ]).then(([days, appointments, interviewers]) => {
      this.setState({
        loading: false,
        days: days.data,
        appointments: appointments.data,
        interviewers: interviewers.data,
      });
    });

    // Initiate a WebSocket connection
    this.socket = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL);

    // Listen for messages on the socket connection and use them to update the
    // state when we book or cancel an interview
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (typeof data === 'object' && data.type === 'SET_INTERVIEW') {
        this.setState((previousState) =>
          setInterview(previousState.data.id, data.interview)
        );
      }
    };

    // Store the focused state using Local Storage
    const focused = JSON.parse(localStorage.getItem('focused'));

    // Set the new value of focused if one exits (a panel has been clicked on)
    if (focused) {
      this.setState({ focused });
    }
  }

  // Update the previous state when the component updates
  componentDidUpdate(prevProps, prevState) {
    if (prevState.focused !== this.state.focused) {
      localStorage.setItem('focused', JSON.stringify(this.state.focused));
    }
  }

  // Close the WebSocket connection
  componentWillUnmount() {
    this.socket.close();
  }

  // Select the panel by setting the focused variable to the panel id
  selectPanel(id) {
    this.setState((prev) => ({
      focused: prev.focused !== null ? null : id,
    }));
  }

  render() {
    // Create a variable to store the css classes
    const dashboardClasses = classnames('dashboard', {
      // Set focused class if the focused state is not null
      'dashboard--focused': this.state.focused,
    });

    // Display the Loading component if the loading state is true
    if (this.state.loading) {
      return <Loading />;
    }

    // Filter the current panel if selected and pass it to the Panel Component,
    // otherwise display all the panels using the map function
    const panels = data
      .filter(
        (panel) =>
          this.state.focused === null || this.state.focused === panel.id
      )
      .map((panel) => (
        <Panel
          key={panel.id}
          id={panel.id}
          label={panel.label}
          value={panel.getValue(this.state)}
          onSelect={(event) => this.selectPanel(panel.id)}
        />
      ));

    // Return the panels object to display
    return <main className={dashboardClasses}>{panels}</main>;
  }
}

export default Dashboard;
