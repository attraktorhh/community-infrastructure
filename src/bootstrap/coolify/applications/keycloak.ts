import { Coolify } from "../../../coolify-api";

export async function createApplicationKeycloak() {
    const api = Coolify.get();

    api.applications.create();
}