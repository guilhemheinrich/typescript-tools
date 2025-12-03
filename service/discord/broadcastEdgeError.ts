import { Config } from './Config.ts';
import { sendMessageToProductionCanal } from './sendMessage.ts';

// Extraire l'ID du projet à partir de l'URL
const getProjectId = (url: string): string => {
  const match = url.match(/https:\/\/(.*?)\.supabase\.co/);
  if (!match || match.length < 2) {
    throw new Error("Impossible d'extraire l'ID du projet à partir de l'URL.");
  }
  return match[1]; // L'ID du projet se trouve dans la première capture
};

export async function broadcastEdgeError(req: Request, error: Error) {
  const functionName = req.url.split('/').pop();
  const context = await req.json();
  if (Config.SERVER_ROLE === 'local') {
    // await sendMessageToProductionCanal(
    //   `Debugging function ${functionName}`,
    //   context
    // );
    return;
  }
  let logLink = '';
  const supabaseProject = getProjectId(Config.SUPABASE_URL);
  logLink = `See https://supabase.com/dashboard/project/${supabaseProject}/functions/${functionName}/logs`;
  const message = `**Critical Error** in *${functionName}*: 
    ${error.message}
  ${logLink}`;
  await sendMessageToProductionCanal(message, {
    stack: error.stack,
    body: context,
  });
}
