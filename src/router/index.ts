import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";

// Import components
import DashboardView from "../views/DashboardView.vue";

// Define routes with proper typing
const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Dashboard",
    component: DashboardView,
    meta: {
      title: "Dashboard",
      requiresAuth: false,
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
      requiresAuth: false,
    },
  },
  {
    path: "/webhooks",
    name: "Webhooks",
    component: () => import("../views/WebhooksView.vue"),
    meta: { title: "Webhooks" },
  },
  {
    path: "/contacts",
    name: "Contacts",
    component: () => import("../views/ContactsView.vue"),
    meta: { title: "Contact Management" },
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

  // Check authentication requirements
  if (to.meta?.requiresAuth) {
    // Here you would check if user is authenticated
    // For now, we'll just continue
    // In a real app, you might redirect to login
    console.log("Route requires authentication");
  }

  next();
});

export default router;
