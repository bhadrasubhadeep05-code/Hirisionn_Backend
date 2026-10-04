
const { simpleParser } = require("mailparser");

async function parseEmail(email) {
  const parsed = await simpleParser(email.source);

  return {
    messageId: parsed.messageId,

    from: {
      name: parsed.from?.value?.[0]?.name || "",
      email: parsed.from?.value?.[0]?.address || "",
    },

    to:
      parsed.to?.value?.map((recipient) => ({
        name: recipient.name || "",
        email: recipient.address || "",
      })) || [],

    subject: parsed.subject || "",

    body: parsed.text || "",

    html: parsed.html || "",

    receivedAt: parsed.date || email.date,
  };
}


module.exports = {
  parseEmail,
};