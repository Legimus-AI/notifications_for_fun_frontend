import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";

// Import components
import DashboardView from "../views/DashboardView.vue";
import { useAuthStore } from "@/store/auth";

// Define routes with proper typing
const routes: Array<RouteRecordRaw> = [
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/LoginView.vue"),
    meta: {
      title: "Login",
      requiresAuth: false,
      hideForAuth: true, // Hide this route when user is authenticated
    },
  },
  {
    path: "/",
    name: "Dashboard",
    component: DashboardView,
    meta: {
      title: "Dashboard",
      requiresAuth: true,
    },
  },
  {
    path: "/about",
    name: "About",
    // Route level code-splitting
    // This generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited
    component: () => import("../views/AboutView.vue"),
    meta: {
      title: "About",
      requiresAuth: true,
    },
  },
  {
    path: "/webhooks",
    name: "Webhooks",
    component: () => import("../views/WebhooksView.vue"),
    meta: { title: "Webhooks", requiresAuth: true },
  },
  {
    path: "/contacts",
    name: "Contacts",
    component: () => import("../views/ContactsView.vue"),
    meta: { title: "Contact Management", requiresAuth: true },
  },
  {
    path: "/whatsapp/messages",
    name: "WhatsApp Messages",
    component: () => import("../views/WhatsAppMessagesView.vue"),
    meta: { title: "WhatsApp Messages", requiresAuth: true },
  },
  {
    path: "/management",
    name: "Management",
    component: () => import("../views/management/ManagementView.vue"),
    children: [
      {
        path: "api-keys",
        name: "API Keys",
        component: () => import("../views/management/ApiKeysView.vue"),
        meta: { title: "API Keys" },
      },
      {
        path: "phone-numbers",
        name: "Phone Numbers",
        component: () => import("../views/management/PhoneNumbersView.vue"),
        meta: { title: "Phone Numbers" },
      },
    ],
    meta: { requiresAuth: true, title: "Management" },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("../views/NotFoundView.vue"),
    meta: {
      title: "Page Not Found",
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Navigation guards
router.beforeEach((to, from, next) => {
  // Set document title
  if (to.meta?.title) {
    document.title = `${to.meta.title} - Notifications App`;
  }

  // Get auth store
  const authStore = useAuthStore();

  // Check if route requires authentication
  if (to.meta?.requiresAuth) {
    if (!authStore.isAuthenticated) {
      // Redirect to login if not authenticated
      console.log("🔒 Route requires authentication, redirecting to login");
      next({ name: "Login" });
      return;
    }
  }

  // Check if route should be hidden for authenticated users
  if (to.meta?.hideForAuth && authStore.isAuthenticated) {
    // Redirect to dashboard if already authenticated
    console.log("✅ User already authenticated, redirecting to dashboard");
    next({ name: "Dashboard" });
    return;
  }

  next();
});

export default router;
