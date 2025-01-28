import "./reset.css";
import "./style.css";
import "preact/debug";
import { h, render } from "preact";
import { App } from "./ui/App.tsx";

render(h(App, null), document.querySelector("#app")!);
