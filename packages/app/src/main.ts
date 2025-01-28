import "./style.css";
import logo from "./logo.svg";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <img src="${logo}" class="logo" />
    <h1>JECS</h1>
  </div>
`;
