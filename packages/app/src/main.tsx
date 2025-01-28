import "katex/dist/katex.css";
import "./reset.css";
import "./style.css";
import { h, render } from "preact";
import { App } from "./ui/App.tsx";

render(<App />, document.querySelector("#app")!);
