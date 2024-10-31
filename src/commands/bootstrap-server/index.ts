import { bootstrapCoolify } from "../../bootstrap/coolify";
import { authenticateCoolify } from "../../bootstrap/coolify/authenticate";

export async function bootstrapServer() {
  const { success: coolifyBootrapSuccess } = await bootstrapCoolify();
  if (!coolifyBootrapSuccess) {
    return;
  }

  const { success: coolifyAuthenticationSuccess } = await authenticateCoolify();
  if (!coolifyAuthenticationSuccess) {
    return;
  }

  const {success: keycloakCreationSuccess} = await createApplicationKeycloak();
  if (!keycloakCreationSuccess) {
    return;
  }
}
