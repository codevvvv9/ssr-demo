import { hydrateRoot } from "react-dom/client";
import Home from "@/pages/Home";

hydrateRoot(document.getElementById("root") as Document | Element, <Home />);
