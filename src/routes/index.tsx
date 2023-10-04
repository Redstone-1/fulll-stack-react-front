import Login from '@pages/login';
import Hero from '@pages/hero';

export default [
  { path: '/', element: <Login /> },
  { path: '/login', element: <Login /> },
  { path: '/hero', element: <Hero /> },
];
