import { Component } from "react";
import { StatsBar } from "./features/summary-counters";

export class App extends Component {
  render() {
    return (
      <div>
        App
        <StatsBar />
      </div>
    );
  }
}
