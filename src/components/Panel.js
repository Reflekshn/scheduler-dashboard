import React, { Component } from 'react';

class Panel extends Component {
  render() {
    // Destructure the props we want to use
    const { label, value, onSelect } = this.props;

    // Display the current panel using the prop values, and set the onClick function
    return (
      <section className="dashboard__panel" onClick={onSelect}>
        <h1 className="dashboard__panel-header">{label}</h1>
        <p className="dashboard__panel-value">{value}</p>
      </section>
    );
  }
}

export default Panel;
