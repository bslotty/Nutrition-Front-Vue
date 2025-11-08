// ============================================================================
// Modules/Exercise/Services/ExerciseService.ts
// ============================================================================

import { BaseService } from "@/modules/core/models/base_service";
import type { RequestConfig } from "@/modules/core/interfaces/request_config";
import { Exercise } from "../models/Exercise";
import { ExerciseName } from "../enums/ExerciseNames";
import { ExerciseType } from "../enums/ExerciseTypes";

export class ExerciseService extends BaseService {
  list: Exercise[] = [];
  detail: Exercise | null = null;

  constructor(config?: Partial<RequestConfig>) {
    super("Exercises", config);
  }

  async getListFromServer(start = 0, count = 25): Promise<Exercise[]> {
    try {
      const response = await this.getList<any>(start, count);
      const exercises = response.map((payload) =>
        Exercise.fromPayload(payload)
      );
      this.list = exercises;
      return exercises;
    } catch (error) {
      throw error;
    }
  }

  async getByID(id: string): Promise<Exercise> {
    // Check local cache first
    if (this.list.length > 0) {
      const cachedExercise = this.list.find((e) => e.id === id);
      if (cachedExercise) {
        return cachedExercise;
      }
    }

    return this.getFromServerByID(id);
  }

  async getFromServerByID(id: string): Promise<Exercise> {
    try {
      const response = await this.getById<any>(id);
      return Exercise.fromPayload(response);
    } catch (error) {
      throw error;
    }
  }

  async createExercise(exercise: Exercise): Promise<Exercise> {
    try {
      const serialized = exercise.toPayload();
      const response = await this.create<any>(serialized);
      const createdExercise = Exercise.fromPayload(response);

      // Update local cache
      if (!this.list.find((e) => e.id === createdExercise.id)) {
        this.list.push(createdExercise);
      }

      return createdExercise;
    } catch (error) {
      throw error;
    }
  }

  async updateExercise(exercise: Exercise): Promise<Exercise> {
    try {
      const serialized = exercise.toPayload();
      const response = await this.update<any>(serialized);
      const updatedExercise = Exercise.fromPayload(response);

      // Update local cache
      const index = this.list.findIndex((e) => e.id === updatedExercise.id);
      if (index !== -1) {
        this.list[index] = updatedExercise;
      }

      return updatedExercise;
    } catch (error) {
      throw error;
    }
  }

  async deleteExercise(exercise: Exercise): Promise<void> {
    try {
      await this.delete(exercise.id);

      // Update local cache
      this.list = this.list.filter((e) => e.id !== exercise.id);
    } catch (error) {
      throw error;
    }
  }

  // Query methods
  searchExercises(query: string): Exercise[] {
    const lowerQuery = query.toLowerCase();
    return this.list.filter(
      (exercise) =>
        ExerciseName[exercise.name].toLowerCase().includes(lowerQuery) ||
        ExerciseType[exercise.activity].toLowerCase().includes(lowerQuery) ||
        exercise.feedback.toLowerCase().includes(lowerQuery)
    );
  }

  filterByType(type: ExerciseType): Exercise[] {
    return this.list.filter((exercise) => exercise.activity === type);
  }

  filterByName(name: ExerciseName): Exercise[] {
    return this.list.filter((exercise) => exercise.name === name);
  }

  // Statistics
  getTotalVolume(startDate?: Date, endDate?: Date): number {
    let exercises = this.list;

    if (startDate && endDate) {
      exercises = exercises.filter((e) => {
        const exerciseDate = new Date(e.date);
        return exerciseDate >= startDate && exerciseDate <= endDate;
      });
    }

    return exercises.reduce(
      (sum, exercise) => sum + exercise.getTotalWeightMoved(),
      0
    );
  }

  getAverageWeight(exerciseName: ExerciseName): number {
    const exercises = this.list.filter((e) => e.name === exerciseName);
    if (exercises.length === 0) return 0;

    const totalWeight = exercises.reduce((sum, e) => sum + e.weight, 0);
    return Math.round(totalWeight / exercises.length);
  }

  getPersonalRecord(exerciseName: ExerciseName): number {
    const exercises = this.list.filter((e) => e.name === exerciseName);
    if (exercises.length === 0) return 0;

    return Math.max(...exercises.map((e) => e.weight));
  }
}
