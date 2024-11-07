import consola from "consola";
import {
  Coolify,
  CoolifyAuthenticationFailureReason,
} from "../../../coolify-api";
import { ExecutionResult } from "../../../utils/execution-result";
import { authenticateCoolifyIfNeeded } from "../authenticate";
import { configureKeycloak, getOrCreateKeycloak } from "./keycloak";
import { CoolifyProject } from "../../../coolify-api/projects/types/project";
import { getOrCreateSynapse } from "./synapse";

export enum FailureReasons {
  ProjectCreationFailed = "Failed to create Project",
  KeycloakCreationFailed = "Failed to create Keycloak",
  SynapseCreationFailed = "Failed to create Synapse",
}

const ATTRAKTOR_PROJECT_NAME = "Attraktor-Community" as const;

export async function createCoolifyResources(): Promise<
  ExecutionResult<FailureReasons | CoolifyAuthenticationFailureReason>
> {
  const { success: projectSetupSuccess, result: project } =
    await getOrCreateProject();
  if (!projectSetupSuccess) {
    return {
      success: false,
      reason: FailureReasons.ProjectCreationFailed,
    };
  }

  const { success: keycloakSuccess, result: keycloak } =
    await getOrCreateKeycloak(project.uuid);
  if (!keycloakSuccess) {
    return {
      success: false,
      reason: FailureReasons.KeycloakCreationFailed,
    };
  }

  await configureKeycloak();

  const {success: synapseSuccess, result: synapse} = await getOrCreateSynapse(project.uuid, keycloak.uuid);
  if (!synapseSuccess) {
    return {
      success: false,
      reason: FailureReasons.SynapseCreationFailed,
    };
  }

  return {
    success: true,
  };
}

enum ProjectCreationFailureReasons {}

async function getOrCreateProject(): Promise<
  ExecutionResult<CoolifyAuthenticationFailureReason, CoolifyProject>
> {
  const {
    success: authenticationSuccess,
    reason: authenticationFailureReason,
  } = await authenticateCoolifyIfNeeded();
  if (!authenticationSuccess) {
    return {
      success: false,
      reason: authenticationFailureReason,
    };
  }

  const api = Coolify.get();
  const projects = await api.projects.list();
  const existingProject = projects.find(
    (project) => project.name === ATTRAKTOR_PROJECT_NAME
  );

  if (existingProject) {
    consola.success("Project already exists, skipping creation");
    return {
      success: true,
      result: existingProject,
    };
  }

  const createdProject = await api.projects.create({
    name: ATTRAKTOR_PROJECT_NAME,
    description:
      "All Applications and Tools used for the Attraktor Community e.g. Chat Software, Writing Tools, etc.",
  });

  return {
    success: true,
    result: createdProject,
  };
}
