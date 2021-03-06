import Vue from 'vue';
import Router from 'vue-router';

// in development env not use Lazy Loading,because Lazy Loading too many pages will cause webpack hot update too slow.so only in production use Lazy Loading
const _import = require('./_import_' + process.env.NODE_ENV);

/* layout */
export const commonRouterMap = [
  { path: '/', component: _import('main/index') },
  { path: '/month', component: _import('main/month') },
  { path: '/month/:month', component: _import('main/month') },
  { path: '/slide', component: _import('main/slide') },
  { path: '/slide/:idx', component: _import('main/slide') },
  { path: '/detail', component: _import('main/sleep-detail') },
  { path: '/detail/:id', component: _import('main/sleep-detail') },
  { path: '/token', component: _import('main/token') },
  { path: '*', redirect: '/' }
];

Vue.use(Router);

const router = new Router({
  scrollBehavior: () => ({ y: 0 }),
  routes: commonRouterMap
});

router.beforeEach((to, from, next) => {
  next();
});

export default router;
