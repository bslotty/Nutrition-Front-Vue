import './assets/main.css'
import 'primeicons/primeicons.css'  // 👈 Add this line

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import 'primeflex/primeflex.css'  

import App from './App.vue';
import router from './router';
import { ConfirmationService, ToastService } from 'primevue';

// Define custom color preset using your existing color variables
const nutritionPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#e3eeff',
      100: '#c7ddff',
      200: '#9bc4ff',
      300: '#5fa0ff',
      400: '#4285ff',
      500: '#2960c7', // Your --color-primary
      600: '#1f4ba3',
      700: '#183d85',
      800: '#12306b',
      900: '#0d2456',
      950: '#081a42'
    },
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617'
    },
    success: {
      50: '#e8f5e3',
      100: '#d1ebc7',
      200: '#a3d78f',
      300: '#75c357',
      400: '#47af1f',
      500: '#248513', // Your --color-accent (success)
      600: '#1f7010',
      700: '#1a5c0d',
      800: '#15480a',
      900: '#103407',
      950: '#0b2005'
    },
    info: {
      50: '#e0f2fe',
      100: '#bae6fd',
      200: '#7dd3fc',
      300: '#38bdf8',
      400: '#0ea5e9',
      500: '#0284c7',
      600: '#0369a1',
      700: '#075985',
      800: '#0c4a6e',
      900: '#082f49',
      950: '#0c1e32'
    },
    warn: {
      50: '#fee7e7',
      100: '#fdcfcf',
      200: '#fb9f9f',
      300: '#f96f6f',
      400: '#f73f3f',
      500: '#ac1111', // Your --color-warn
      600: '#8a0e0e',
      700: '#680a0a',
      800: '#460707',
      900: '#240404',
      950: '#120202'
    },
    danger: {
      50: '#fee7e7',
      100: '#fdcfcf',
      200: '#fb9f9f',
      300: '#f96f6f',
      400: '#f73f3f',
      500: '#ac1111', // Your --color-warn (using as danger)
      600: '#8a0e0e',
      700: '#680a0a',
      800: '#460707',
      900: '#240404',
      950: '#120202'
    }
  },
  // Add nutrient-specific colors as custom variables
  components: {
    button: {
      colorScheme: {
        light: {
          protein: {
            background: '#4CAF50',
            borderColor: '#4CAF50',
            color: '#ffffff'
          },
          fat: {
            background: '#2196F3',
            borderColor: '#2196F3',
            color: '#ffffff'
          },
          carbs: {
            background: '#FFA000',
            borderColor: '#FFA000',
            color: '#ffffff'
          },
          sodium: {
            background: '#795548',
            borderColor: '#795548',
            color: '#ffffff'
          },
          sugar: {
            background: '#F44336',
            borderColor: '#F44336',
            color: '#ffffff'
          },
          fiber: {
            background: '#9C27B0',
            borderColor: '#9C27B0',
            color: '#ffffff'
          }
        }
      }
    }
  }
});

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(PrimeVue, {
  theme: {
    preset: nutritionPreset,
    options: {
      darkModeSelector: '.dark',
      cssLayer: {
        name: 'primevue',
        order: 'tailwind-base, primevue, tailwind-utilities'
      }
    }
  }
});
app.use(ToastService);
app.use(ConfirmationService);

app.mount('#app');