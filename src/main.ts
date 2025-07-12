import { createApp } from "vue";
import { createPinia } from "pinia";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import App from "./App.vue";
import router from "./router";
import "./style.css";
import { logConfig } from "./config";
import { useAuthStore } from "./store/auth";

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
  faAddressBook,
  faSearch,
  faTrash,
  faHistory,
  faTimes,
  faExclamationTriangle,
  faUsers,
  faUserCircle,
  faCamera,
  faCheckCircle,
  faTimesCircle,
  faQuoteLeft,
  faClock,
  faSync,
  faCopy,
  faCircle,
  faSpinner,
  faComments,
  faLock,
  faEye,
  faEyeSlash,
  faSignInAlt,
  faMagic,
  faSignOutAlt,
  faChevronRight,
  faCog,
  faUserPlus,
  faRefresh,
  faArrowLeft,
  faEnvelope,
  faUserTag,
  faCalendar,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { faCircle as farCircle } from "@fortawesome/free-regular-svg-icons";

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
  faCodeBranch,
  faAddressBook,
  faSearch,
  faTrash,
  faHistory,
  faTimes,
  faExclamationTriangle,
  faUsers,
  faUserCircle,
  faCamera,
  faCheckCircle,
  faTimesCircle,
  faQuoteLeft,
  faClock,
  faSync,
  faCopy,
  faCircle,
  faSpinner,
  faWhatsapp,
  farCircle,
  faComments,
  faLock,
  faEye,
  faEyeSlash,
  faSignInAlt,
  faMagic,
  faSignOutAlt,
  faChevronRight,
  faCog,
  faUserPlus,
  faRefresh,
  faArrowLeft,
  faEnvelope,
  faUserTag,
  faCalendar,
  faCheck
);

// Initialize app
const initializeApp = async () => {
  const app = createApp(App);
  const pinia = createPinia();

  // Register FontAwesome component globally
  app.component("font-awesome-icon", FontAwesomeIcon);

  app.use(pinia);
  app.use(router);

  // Initialize auth store and wait for it to complete
  const authStore = useAuthStore();
  await authStore.initializeAuth();

  // Mount the app after auth is initialized
  app.mount("#app");

  // Log configuration in development mode
  logConfig();
};

// Initialize the app
initializeApp().catch(console.error);
