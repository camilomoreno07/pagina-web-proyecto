export interface Instruction {
    instructionTitle: string;
    instructionDescription: string;
    time: number;
    steps: string[];
  }
  
  export interface ClassPhase {
    instruction: Instruction;
    contents: any[]; // Puedes definir un tipo más específico si tienes la estructura de los contenidos
    evaluations: any[]; // Igual aquí, ajusta si conoces la estructura
  }
  
  export interface Course {
    courseName: string;
    professorIds: string[];
    studentIds: string[];
    activityIds: string[];
    isPublic: boolean;
    beforeClass: ClassPhase;
    duringClass: ClassPhase;
    afterClass: ClassPhase;
  }
  