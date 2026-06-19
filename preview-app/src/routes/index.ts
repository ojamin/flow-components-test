import type { RouteRecordRaw } from "vue-router";

import ComponentBrowserView from "./ComponentBrowserView.vue";

// Module intent: declare preview-app routes. Defaults to the component browser.
//
// `/matrix` renders a state × theme matrix for the component identified by
// the `?component=` query parameter. Variant and viewport overrides come
// through `?variant=` and `?viewport=desktop|tablet|mobile`. The route stays
// lazy-loaded so the default browser bundle isn't bloated by the matrix
// dependency graph.
export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: ComponentBrowserView,
  },
  {
    path: "/matrix",
    component: () => import("./ComponentMatrixView.vue"),
  },
  {
    path: "/content-height-metrics",
    component: () => import("./ContentHeightMetricHarnessView.vue"),
  },
];
