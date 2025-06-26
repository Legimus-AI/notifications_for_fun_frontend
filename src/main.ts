import { createApp } from "vue";
import { createPinia } from "pinia";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import App from "./App.vue";
import router from "./router";
import "./style.css";

// FontAwesome imports
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faBell,
  faTableColumns,
  faPuzzlePiece,
  faGlobe,
  faKey,
  faPhone,
  faUser,
  faEllipsis,
  faChevronDown,
  faLink,
  faNetworkWired,
  faServer,
  faRoute,
  faArrowsToCircle,
  faShareNodes,
  faCodeBranch,
} from "@fortawesome/free-solid-svg-icons";

// Add icons to library
library.add(
  faBell,
  faTableColumns,
  faPuzzlePiece,
  faGlobe,
  faKey,
  faPhone,
  faUser,
  faEllipsis,
  faChevronDown,
  faLink,
  faNetworkWired,
  faServer,
  faRoute,
  faArrowsToCircle,
  faShareNodes,
  faCodeBranch
);

const app = createApp(App);
const pinia = createPinia();

// Register FontAwesome component globally
app.component("font-awesome-icon", FontAwesomeIcon);

app.use(pinia);
app.use(router);

app.mount("#app");
