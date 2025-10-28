<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useExerciseStore } from '../data/Exercise.store';
import type { Exercise } from '../models/Exercise';
import { ExerciseName } from '../enums/ExerciseNames';
import { ExerciseType } from '../enums/ExerciseTypes';
import HeaderRow from '@/modules/core/components/HeaderRow.vue';
import FormInput from '@/modules/core/components/FormInput.vue';
import Button from '@/modules/core/components/Button.vue';
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import Textarea from 'primevue/textarea';

const router = useRouter();
const route = useRoute();
const exerciseStore = useExerciseStore();

const form = ref({
    id: '',
    name: ExerciseName.BenchPress,
    activity: ExerciseType.Lift,
    date: new Date(),
    weight: 0,
    sets: 0,
    reps: 0,
    feedback: ''
});

const errors = ref({
    name: '',
    date: '',
    sets: ''
});

const isCreate = computed(() => route.params.id === 'create');
const isValid = computed(() => {
    return !!(
        form.value.name !== undefined && 
        form.value.date && 
        form.value.sets > 0
    );
});
const isLoading = computed(() => exerciseStore.loading);

// Prepare dropdown options
const exerciseNameOptions = computed(() => {
    return Object.keys(ExerciseName)
        .filter(key => !isNaN(Number(ExerciseName[key as keyof typeof ExerciseName])))
        .map(key => ({
            label: key,
            value: ExerciseName[key as keyof typeof ExerciseName]
        }));
});

// Lifecycle
onMounted(async () => {
    if (!isCreate.value) {
        await loadExercise();
    }
});

// Methods
async function loadExercise() {
    const id = route.params.id as string;
    const exercise = await exerciseStore.getExerciseById(id);
    if (!exercise) {
        router.push({ name: 'exercise-list' });
        return;
    }
    populateForm(exercise);
}

function populateForm(exercise: Exercise) {
    form.value = {
        id: exercise.id,
        name: exercise.name,
        activity: exercise.activity,
        date: new Date(exercise.date),
        weight: exercise.weight,
        sets: exercise.sets,
        reps: exercise.reps,
        feedback: exercise.feedback
    };
}

function validateForm(): boolean {
    errors.value = {
        name: '',
        date: '',
        sets: ''
    };

    if (!form.value.name && form.value.name !== 0) {
        errors.value.name = 'Exercise name is required';
    }
    if (!form.value.date) {
        errors.value.date = 'Date is required';
    }
    if (form.value.sets <= 0) {
        errors.value.sets = 'At least 1 set is required';
    }

    return !Object.values(errors.value).some(error => error);
}

async function save() {
    if (!validateForm()) return;

    const exerciseData = exerciseStore.createNewExercise();
    exerciseData.setExercise(form.value.activity, form.value.name);
    exerciseData.setDetails(
        form.value.weight,
        form.value.sets,
        form.value.reps,
        form.value.feedback
    );
    exerciseData.date = form.value.date;

    let result;
    if (isCreate.value) {
        result = await exerciseStore.createExercise(exerciseData);
    } else {
        exerciseData.id = form.value.id;
        result = await exerciseStore.updateExercise(exerciseData);
    }

    if (result) {
        router.push({ name: 'exercise-list' });
    }
}

async function deleteExercise() {
    if (confirm('Are you sure you want to delete this exercise?')) {
        const exercise = exerciseStore.selectedExercise;
        if (exercise) {
            const success = await exerciseStore.deleteExercise(exercise);
            if (success) {
                router.push({ name: 'exercise-list' });
            }
        }
    }
}

function cancel() {
    router.push({ name: 'exercise-list' });
}
</script>

<template>
    <div class="exercise-details">
        <!-- Header Row with Actions -->
        <HeaderRow>
            <template #title>
                {{ isCreate ? 'New Exercise' : 'Edit Exercise' }}
            </template>
            <template #actions>
                <Button 
                    label="Cancel"
                    severity="secondary"
                    outlined
                    @click="cancel"
                    :disabled="isLoading"
                />
                <Button 
                    v-if="!isCreate"
                    label="Delete"
                    icon="pi pi-trash"
                    severity="danger"
                    outlined
                    @click="deleteExercise"
                    :disabled="isLoading"
                />
                <Button 
                    label="Save"
                    icon="pi pi-check"
                    severity="primary"
                    @click="save"
                    :disabled="!isValid || isLoading"
                    :loading="isLoading"
                />
            </template>
        </HeaderRow>

        <!-- Exercise Form - Two Column Layout -->
        <div class="form-columns">
            <!-- LEFT COLUMN: Name and Date -->
            <div class="form-column-left">
                <!-- Exercise Name -->
                <FormInput
                    label="Exercise Name"
                    :required="true"
                    :error="errors.name"
                    html-for="exercise-name"
                >
                    <template #input>
                        <Dropdown
                            id="exercise-name"
                            v-model="form.name"
                            :options="exerciseNameOptions"
                            option-label="label"
                            option-value="value"
                            placeholder="Select exercise..."
                            :disabled="isLoading"
                        />
                    </template>
                </FormInput>

                <!-- Date -->
                <FormInput
                    label="Date"
                    :required="true"
                    :error="errors.date"
                    html-for="exercise-date"
                >
                    <template #input>
                        <Calendar
                            id="exercise-date"
                            v-model="form.date"
                            date-format="mm/dd/yy"
                            :disabled="isLoading"
                        />
                    </template>
                </FormInput>
            </div>

            <!-- RIGHT COLUMN: Weight/Sets/Reps and Notes -->
            <div class="form-column-right">
                <!-- Row 1: Weight, Sets, Reps -->
                <div class="metrics-row">
                    <FormInput
                        label="Weight (lbs)"
                        html-for="exercise-weight"
                    >
                        <template #input>
                            <InputNumber
                                id="exercise-weight"
                                v-model="form.weight"
                                :min="0"
                                :disabled="isLoading"
                                suffix=" lbs"
                            />
                        </template>
                    </FormInput>

                    <FormInput
                        label="Sets"
                        :required="true"
                        :error="errors.sets"
                        html-for="exercise-sets"
                    >
                        <template #input>
                            <InputNumber
                                id="exercise-sets"
                                v-model="form.sets"
                                :min="0"
                                :disabled="isLoading"
                            />
                        </template>
                    </FormInput>

                    <FormInput
                        label="Reps"
                        html-for="exercise-reps"
                    >
                        <template #input>
                            <InputNumber
                                id="exercise-reps"
                                v-model="form.reps"
                                :min="0"
                                :disabled="isLoading"
                            />
                        </template>
                    </FormInput>
                </div>

                <!-- Row 2: Notes -->
                <FormInput
                    label="Notes"
                    html-for="exercise-feedback"
                    help-text="How did it feel? Any observations?"
                >
                    <template #input>
                        <Textarea
                            id="exercise-feedback"
                            v-model="form.feedback"
                            :rows="4"
                            placeholder="Add your notes here..."
                            :disabled="isLoading"
                        />
                    </template>
                </FormInput>
            </div>
        </div>
    </div>
</template>

<style scoped>
.exercise-details {
    padding: 1rem;
}

.form-columns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-top: 1rem;
}

.form-column-left,
.form-column-right {
    display: flex;
    flex-direction: column;
    gap: 0;
}

.metrics-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
}

/* Responsive: Stack on mobile */
@media (max-width: 768px) {
    .form-columns {
        grid-template-columns: 1fr;
        gap: 1rem;
    }

    .metrics-row {
        grid-template-columns: 1fr;
    }
}
</style>
