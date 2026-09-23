import React from "react";
import { createRoot } from "react-dom/client";

import Docs from "./Docs";
import "./theme.css";
import "./top-bar.css";
import "./chrome-scroll.css";
import "./docs.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Docs />
  </React.StrictMode>,
);
