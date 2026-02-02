import { createApp, h, provide } from 'vue';
import './style.css';
import App from './App.vue';
import router, { registerDynamicRoutes } from './router';
import { createPinia } from 'pinia';

import ArcoVue from '@arco-design/web-vue';
import ArcoVueIcon from '@arco-design/web-vue/es/icon';
import '@arco-design/web-vue/dist/arco.css';

import { ApolloClients } from '@vue/apollo-composable';
import { apolloClient } from './graphql/apollo';

async function bootstrap() {
    const app = createApp({
        setup() {
            provide(ApolloClients, {
                default: apolloClient,
            });
            return () => h(App);
        },
    });

    app.use(ArcoVue);
    app.use(ArcoVueIcon);
    app.use(createPinia());
    app.use(router);

    await registerDynamicRoutes();

    router.isReady().then(() => {
        app.mount('#app');
    });
}

bootstrap();
