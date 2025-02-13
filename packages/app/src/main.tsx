import "katex/dist/katex.css";
import "@fontsource/spectral/400.css";
import "@fontsource/spectral/400-italic.css";
import "@fontsource/spectral/700.css";
import "@fontsource/spectral/700-italic.css";
import "./reset.css";
import "./style.css";
import { h, render } from "preact";
import { App } from "./ui/App.tsx";

render(<App />, document.querySelector("#app")!);
