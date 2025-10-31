import { createRouter, createWebHistory } from 'vue-router'
import FoodList from '@/modules/food/chunks/FoodList.vue'
import WeightList from '@/modules/weight/chunks/WeightList.vue'
import FoodDetails from '@/modules/food/chunks/FoodDetails.vue'
import RecipeDetails from '@/modules/food/chunks/RecipeDetails.vue'
import IntakeList from '@/modules/intake/chunks/IntakeList.vue'
import MealDetails from '@/modules/intake/chunks/MealDetails.vue'
import ExerciseList from '@/modules/exercise/chunks/ExerciseList.vue'
import ExerciseDetails from '@/modules/exercise/chunks/ExerciseDetails.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "food/list",
    },
    {
      path: "/food/list",
      name: "food-list",
      component: FoodList,
    },
    {
      path: "/food/:id",
      name: "food-details",
      component: FoodDetails,
    },
    {
      path: "/recipe/:id",
      name: "recipe-details",
      component: RecipeDetails,
    },

    {
      path: "/intake/list",
      name: "intake-list",
      component: IntakeList,
    },
    {
      path: "/meal/:id",
      name: "meal-detail",
      component: MealDetails,
    },
    {
      path: "/intake/:id",
      name: "intake-details",
      component: IntakeList,
    },

    {
      path: "/weights",
      name: "weight-list",
      component: WeightList,
    },

        {
      path: "/exercise/list",
      name: "exercise-list",
      component: ExerciseList,
    },
    {
      path: "/exercise/:id",
      name: "exercise-details",
      component: ExerciseDetails,
    },
  ]
})

export default router
