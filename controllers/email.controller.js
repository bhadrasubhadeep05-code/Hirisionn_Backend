const Email = require("../models/Email");
const { syncNewEmails } = require("../utils/mailReader");
const mongoose = require("mongoose");

const getEmails = async (req, res) => {
  const {
    category,
    subCategory,
    page = 1,
    limit = 20,
  } = req.query;

  const filter = {};

  if (category) {
    filter.category = category;
  }

  if (subCategory) {
    filter.subCategory = subCategory;
  }

  const pageNumber = Math.max(Number(page), 1);
  const limitNumber = Math.min(Math.max(Number(limit), 1), 100);

  const skip = (pageNumber - 1) * limitNumber;

  const [emails, total] = await Promise.all([
    Email.find(filter)
      .sort({ receivedAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .select("-html"),

    Email.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: emails.length,
    total,
    page: pageNumber,
    limit: limitNumber,
    totalPages: Math.ceil(total / limitNumber),
    emails,
  });
};

const { classifyEmail } = require("../utils/emailClassifier");

const reclassifyEmails = async (req, res) => {
  const emails = await Email.find({});

  let updated = 0;

  for (const email of emails) {
    const classification = classifyEmail({
      subject: email.subject,
      body: email.body,
    });

    const categoryChanged =
      email.category !== classification.category ||
      email.subCategory !== classification.subCategory;

    if (categoryChanged) {
      email.category = classification.category;
      email.subCategory = classification.subCategory;

      await email.save();

      updated++;
    }
  }

  res.status(200).json({
    success: true,
    total: emails.length,
    updated,
  });
};


const getEmailById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email ID",
    });
  }

  const email = await Email.findById(id);

  if (!email) {
    return res.status(404).json({
      success: false,
      message: "Email not found",
    });
  }

  res.status(200).json({
    success: true,
    email,
  });
};

const getEmailStats = async (req, res) => {
  const stats = await Email.aggregate([
    {
      $group: {
        _id: {
          category: "$category",
          subCategory: "$subCategory",
        },
        count: { $sum: 1 },
      },
    },
  ]);

  const result = {
    total: 0,

    categories: {
      "Tier 1": {
        count: 0,
        subCategories: {},
      },

      "Tier 2": {
        count: 0,
        subCategories: {},
      },

      Other: {
        count: 0,
        subCategories: {},
      },
    },
  };

  for (const item of stats) {
    const category = item._id.category;
    const subCategory = item._id.subCategory;
    const count = item.count;

    result.total += count;

    if (!result.categories[category]) {
      continue;
    }

    result.categories[category].count += count;

    if (subCategory) {
      result.categories[category].subCategories[subCategory] = count;
    }
  }

  res.status(200).json({
    success: true,
    stats: result,
  });
};

const syncEmails = async (req, res) => {
  const result = await syncNewEmails();

  res.status(200).json({
    success: true,
    ...result,
  });
};

module.exports = {
  getEmails,
  reclassifyEmails,
  getEmailById,
  getEmailStats,
  syncEmails,
};
