import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/Login.vue';
import CourierList from '../components/CourierList.vue';
import Mijozlar from '../components/Mijozlar.vue';
import TuxumNarxi from '../components/TuxumNarxi.vue';

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
  const isLoggedIn = document.cookie.split(';').some((item) => item.trim().startsWith('isLoggedIn='));

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
