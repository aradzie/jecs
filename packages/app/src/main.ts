import "./reset.css";
import "./style.css";
import { h, render } from "preact";
import { App } from "./components/App.tsx";

render(h(App, null), document.querySelector("#app")!);
