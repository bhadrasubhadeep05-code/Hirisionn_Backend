const { ImapFlow } = require("imapflow");
const EmailSyncState = require("../models/EmailSyncState");
const Email = require("../models/Email");
const { parseEmail } = require("./emailParser");
const { classifyEmail } = require("./emailClassifier");

function createGmailClient() {
  return new ImapFlow({
    host: "imap.gmail.com",
    port: 993,
    secure: true,

    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASS,
    },

    logger: false,
  });
}

async function getLatestEmails(limit = 10) {
  const client = createGmailClient();

  try {
    await client.connect();

    const lock = await client.getMailboxLock("INBOX");

    try {
      const totalEmails = client.mailbox.exists;

      if (!totalEmails) {
        return [];
      }

      const start = Math.max(1, totalEmails - limit + 1);

      const emails = [];

      for await (const message of client.fetch(`${start}:${totalEmails}`, {
        envelope: true,
        source: true,
        uid: true,
      })) {
        emails.push({
          uid: message.uid,
          messageId: message.envelope.messageId,
          subject: message.envelope.subject,

          from: message.envelope.from?.map((sender) => ({
            name: sender.name,
            email: sender.address,
          })),

          to: message.envelope.to?.map((recipient) => ({
            name: recipient.name,
            email: recipient.address,
          })),

          date: message.envelope.date,

          source: message.source?.toString(),
        });
      }

      return emails.reverse();
    } finally {
      lock.release();
    }
  } finally {
    await client.logout();
  }
}

async function initializeEmailSync() {
  const client = createGmailClient();

  try {
    await client.connect();

    const lock = await client.getMailboxLock("INBOX");

    try {
      const uidValidity = String(client.mailbox.uidValidity);
      const lastUid = client.mailbox.uidNext - 1;

      const existingState = await EmailSyncState.findOne({
        email: process.env.GMAIL_USER,
        mailbox: "INBOX",
      });

      if (existingState) {
        return {
          initialized: false,
          message: "Email sync is already initialized",
          lastUid: existingState.lastUid,
        };
      }

      const syncState = await EmailSyncState.create({
        email: process.env.GMAIL_USER,
        mailbox: "INBOX",
        uidValidity,
        lastUid,
      });

      return {
        initialized: true,
        message: "Email sync initialized successfully",
        lastUid: syncState.lastUid,
        uidValidity: syncState.uidValidity,
      };
    } finally {
      lock.release();
    }
  } finally {
    await client.logout();
  }
}

async function getNewEmails() {
  const client = createGmailClient();

  try {
    await client.connect();

    const lock = await client.getMailboxLock("INBOX");

    try {
      const syncState = await EmailSyncState.findOne({
        email: process.env.GMAIL_USER,
        mailbox: "INBOX",
      });

      if (!syncState) {
        throw new Error("Email sync has not been initialized");
      }

      const currentUidValidity = String(client.mailbox.uidValidity);

      if (syncState.uidValidity !== currentUidValidity) {
        throw new Error(
          "Gmail UID validity changed. Email sync needs to be reinitialized.",
        );
      }

      const startUid = syncState.lastUid + 1;

      const emails = [];

      for await (const message of client.fetch(
        `${startUid}:*`,
        {
          envelope: true,
          source: true,
          uid: true,
        },
        {
          uid: true,
        },
      )) {
        if (message.uid <= syncState.lastUid) {
          continue;
        }
        emails.push({
          uid: message.uid,

          messageId: message.envelope.messageId,

          subject: message.envelope.subject,

          from: message.envelope.from?.map((sender) => ({
            name: sender.name,
            email: sender.address,
          })),

          to: message.envelope.to?.map((recipient) => ({
            name: recipient.name,
            email: recipient.address,
          })),

          date: message.envelope.date,

          source: message.source?.toString(),
        });
      }

      return emails;
    } finally {
      lock.release();
    }
  } finally {
    await client.logout();
  }
}

async function syncNewEmails() {
  const emails = await getNewEmails();

  if (!emails.length) {
    return {
      count: 0,
      emails: [],
    };
  }

  const savedEmails = [];

  for (const email of emails) {
    const parsedEmail = await parseEmail(email);
    const classification = classifyEmail(parsedEmail);

    const savedEmail = await Email.findOneAndUpdate(
      {
        messageId: parsedEmail.messageId,
      },
      {
        ...parsedEmail,
        uid: email.uid,

        category: classification.category,
        subCategory: classification.subCategory,
      },
      {
        new: true,
        upsert: true,
      },
    );

    savedEmails.push(savedEmail);
  }

  const highestUid = Math.max(...emails.map((email) => email.uid));

  await EmailSyncState.findOneAndUpdate(
    {
      email: process.env.GMAIL_USER,
      mailbox: "INBOX",
    },
    {
      lastUid: highestUid,
    },
  );

  return {
    count: savedEmails.length,
    emails: savedEmails,
  };
}

module.exports = {
  createGmailClient,
  getLatestEmails,
  initializeEmailSync,
  getNewEmails,
  syncNewEmails,
};
