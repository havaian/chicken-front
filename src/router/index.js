import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/Login.vue';
import CourierList from '../components/CourierList.vue';
import Mijozlar from '../components/Mijozlar.vue';
import TuxumNarxi from '../components/TuxumNarxi.vue';
import Solishtirish from '../components/Solishtirish.vue';
import ExcelOlish from '../components/ExcelUpload.vue';
import ExcelYuklash from '../components/ExcelDownload.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/kuryerlar',
    name: 'CourierList',
    component: CourierList,
    meta: { requiresAuth: true }
  },
  {
    path: '/mijozlar',
    name: 'Mijozlar',
    component: Mijozlar,
    meta: { requiresAuth: true }
  },
  {
    path: '/tuxum',
    name: 'TuxumNarxi',
    component: TuxumNarxi,
    meta: { requiresAuth: true }
  },
  {
    path: '/solishtirish',
    name: 'Solishtirish',
    component: Solishtirish,
    meta: { requiresAuth: true }
  },
  {
    path: '/excel-yuklash',
    name: 'ExcelOlish',
    component: ExcelOlish,
    meta: { requiresAuth: true }
  },
  {
    path: '/excel-olish',
    name: 'ExcelYuklash',
    component: ExcelYuklash,
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
