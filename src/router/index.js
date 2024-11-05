import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/Login.vue';
import CourierList from '../components/CourierList.vue';
import Mijozlar from '../components/Mijozlar.vue';
import Maxsulotlar from '../components/Maxsulotlar.vue';
import Solishtirish from '../components/Solishtirish.vue';
import ExcelUpload from '../components/ExcelUpload.vue';
import ExcelDownload from '../components/ExcelDownload.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/couriers',
    name: 'CourierList',
    component: CourierList,
    meta: { requiresAuth: true }
  },
  {
    path: '/clients',
    name: 'Mijozlar',
    component: Mijozlar,
    meta: { requiresAuth: true }
  },
  {
    path: '/inventory',
    name: 'Maxsulotlar',
    component: Maxsulotlar,
    meta: { requiresAuth: true }
  },
  {
    path: '/courier-check',
    name: 'Solishtirish',
    component: Solishtirish,
    meta: { requiresAuth: true }
  },
  {
    path: '/excel-upload',
    name: 'ExcelUpload',
    component: ExcelUpload,
    meta: { requiresAuth: true }
  },
  {
    path: '/excel-download',
    name: 'ExcelDownload',
    component: ExcelDownload,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guard to check authentication
router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  if (to.matched.some(record => record.meta.requiresAuth)) {
    // If the route requires authentication
    if (!isLoggedIn) {
      // If not logged in, redirect to login
      next({ name: 'Login' });
    } else {
      // Otherwise, proceed to the route
      next();
    }
  } else {
    // If the route does not require authentication, proceed
    next();
  }
});

export default router;
