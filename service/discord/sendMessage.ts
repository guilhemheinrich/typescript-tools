import { Config } from './Config.ts';

export async function sendMessageToProductionCanal(
  message: string,
  jsonData: object
) {
  const message_header = `[${new Date().toLocaleDateString('fr', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })} - **${Config.SERVER_ROLE}**] `;

  const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
    type: 'application/json',
  });

  const formData = new FormData();

  formData.append(
    'payload_json',
    JSON.stringify({ content: message_header + message })
  );
  formData.append('file', blob, 'context.json');

  const response = await fetch(Config.DISCORD_WEBHOOK_URL, {
    method: 'POST',
    body: formData,
  });
  if (response.ok) {
    console.log('Message envoyé avec succès');
  } else {
    console.error("Erreur lors de l'envoi du message :", response.statusText);
    console.error('Detail :', response);
  }
}
