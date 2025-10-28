import { ExerciseName } from "../enums/ExerciseNames";
import { ExerciseType } from "../enums/ExerciseTypes";

export class Exercise {
  id: string;
  date: Date;

  activity: ExerciseType = ExerciseType.Lift;
  name: ExerciseName = ExerciseName.BenchPress;

  sets: number = 0;
  reps: number = 0;
  weight: number = 0;
  feedback: string = '';

  constructor(id: string, date: Date | string) {
    this.id = id;
    if (typeof date == 'string') {
      this.date = new Date(date);
    } else {
      this.date = date;
    }
  }

  static fromPayload(payload: any): Exercise {
    const exercise = new Exercise(payload.id, payload.date);
    return exercise.setFromPayload(payload);
  }

  setFromPayload(payload: any): Exercise {
    this.setExercise(payload.activity, payload.name);
    this.setDetails(
      payload.weight,
      payload.sets,
      payload.reps,
      payload.feedback,
    );
    return this;
  }

  setExercise(type: ExerciseType, name: ExerciseName): Exercise {
    this.activity = type;
    this.name = name;
    return this;
  }

  setDetails(
    weight: number,
    sets: number,
    reps: number,
    feedback: string,
  ): Exercise {
    this.sets = sets;
    this.reps = reps;
    this.weight = weight;
    this.feedback = feedback;
    return this;
  }

  getTotalWeightMoved(): number {
    return this.weight * this.reps * this.sets;
  }

  // Serialization for API
  toPayload(): any {
    return {
      id: this.id,
      date: this.date.toISOString(),
      activity: this.activity,
      name: this.name,
      sets: this.sets,
      reps: this.reps,
      weight: this.weight,
      feedback: this.feedback
    };
  }

  // Enums to string for Select FormInputFields
  listTypes(): string[] {
    return Object.keys(ExerciseType).filter(key => isNaN(Number(key)));
  }

  listNames(): string[] {
    return Object.keys(ExerciseName).filter(key => isNaN(Number(key)));
  }
}





