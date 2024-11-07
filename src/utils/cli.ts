import consola from "consola";

export async function waitForUserToContinue() {
  let userIsDone = false;
  while (!userIsDone) {
    userIsDone = await consola.prompt("Done?", {
      type: "confirm",
      initial: false,
    });
  }
}
