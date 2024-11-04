import { ProjectEnvironment } from "./environment";

export interface CoolifyProject {
    id: number;
    uuid: string;
    name: string;
    description: string;
    environments: ProjectEnvironment[];
}
