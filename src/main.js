import { createApp } from 'vue'
import App from './App.vue'
import './assets/tailwind.css';
import store from './store';

const app = createApp(App);

// Use the store
app.use(store);

app.mount('#app');
