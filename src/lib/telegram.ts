export function escapeTelegramHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const TELEGRAM_TIMEOUT_MS = 8000;

export async function sendTelegramNotification(params: {
  botToken: string;
  chatId: string;
  message: string;
}) {
  const response = await fetch(`https://api.telegram.org/bot${params.botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: params.chatId,
      text: params.message,
      parse_mode: "HTML",
    }),
    signal: AbortSignal.timeout(TELEGRAM_TIMEOUT_MS),
  });

  const payload = await response.json();

  if (!response.ok || !payload.ok) {
    throw new Error(payload.description ?? "Telegram delivery failed.");
  }

  return payload.result?.message_id ? String(payload.result.message_id) : undefined;
}
