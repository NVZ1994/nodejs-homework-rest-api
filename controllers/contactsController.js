const ContactModel = require("../models/contactModel");
const { HttpError, controllerWrapper } = require("../helpers");

async function getAllContacts(req, res, next) {
  const { _id: owner } = req.user;
  const { page = 1, limit = 20, ...query } = req.query;
  const skip = (page - 1) * limit;

  try {
    const allContacts = await ContactModel.find({ owner, ...query })
      .skip(skip)
      .limit(limit)
      .populate("owner", "email name");

    res.json(allContacts);
  } catch (error) {
    next(error);
  }
}

async function getContactById(req, res) {
  const { contactId } = req.params;
  const contactById = await ContactModel.findById(contactId);

  if (!contactById) {
    throw HttpError(404, "Not found");
  }

  res.json(contactById);
}

async function addContact(req, res) {
  const { _id: owner } = req.user;
  const contactToAdd = await ContactModel.create({ ...req.body, owner });

  res.status(201).json(contactToAdd);
}

async function deleteContact(req, res) {
  const { contactId } = req.params;
  const contactToRemove = await ContactModel.findByIdAndDelete(contactId);

  if (!contactToRemove) {
    throw HttpError(404, "Not found");
  }

  res.json({ message: "contact deleted" });
}

async function updateContactById(req, res) {
  const { contactId } = req.params;
  const contactToUpdate = await ContactModel.findByIdAndUpdate(
    contactId,
    req.body,
    { new: true }
  );

  if (!contactToUpdate) {
    throw HttpError(404, "Not found");
  }

  res.json(contactToUpdate);
}

async function updateStatusContact(req, res) {
  const { contactId } = req.params;
  const contactStatusToUpdate = await ContactModel.findByIdAndUpdate(
    contactId,
    req.body,
    { new: true }
  );

  if (!contactStatusToUpdate) {
    throw HttpError(404, "Not found");
  }

  res.json(contactStatusToUpdate);
}

module.exports = {
  getAllContacts: controllerWrapper(getAllContacts),
  getContactById: controllerWrapper(getContactById),
  addContact: controllerWrapper(addContact),
  deleteContact: controllerWrapper(deleteContact),
  updateContactById: controllerWrapper(updateContactById),
  updateStatusContact: controllerWrapper(updateStatusContact),
};
