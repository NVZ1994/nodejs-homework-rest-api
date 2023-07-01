const express = require("express");
const router = express.Router();

const schemas = require("../../schemas/contacts");
const controllers = require("../../controllers/contactsController");
const {
  isValidId,
  validateBody,
  favoriteFieldValidationWrapper,
  authenticate,
} = require("../../middlewares");

router.use(authenticate);

router.get("/", controllers.getAllContacts);

router.get("/:contactId", isValidId, controllers.getContactById);

router.post("/", validateBody(schemas.contactsSchema), controllers.addContact);

router.put(
  "/:contactId",
  isValidId,
  validateBody(schemas.contactsSchema),
  controllers.updateContactById
);

router.delete("/:contactId", isValidId, controllers.deleteContact);

router.patch(
  "/:contactId/favorite",
  isValidId,
  favoriteFieldValidationWrapper(schemas.contactStatus),
  controllers.updateStatusContact
);

module.exports = router;
