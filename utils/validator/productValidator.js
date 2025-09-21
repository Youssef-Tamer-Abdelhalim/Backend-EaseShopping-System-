const slugify = require("slugify");
const { check, body } = require("express-validator");
const validatorMiddleWare = require("../../middleware/validatorMiddleWare");
const Category = require("../../models/categoryModel");
const SubCategory = require("../../models/supCategoryModel");
const Brand = require("../../models/brandModel");

exports.createProductValidator = [
  check("title")
    .isLength({ min: 2, max: 100 })
    .withMessage("Title must be between 2 and 100 characters long")
    .notEmpty()
    .withMessage("Title is required")
    .custom((val, { req }) => {
    req.body.slug = slugify(val);
    return true;
  }),
  check("description")
    .isLength({ min: 30, max: 2000 })
    .withMessage("Description must be between 30 and 2000 characters long")
    .notEmpty()
    .withMessage("Description is required"),

  check("quantity")
    .isNumeric()
    .withMessage("Quantity must be a number")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ min: 0 })
    .withMessage("Quantity must be a positive integer"),

  check("sold")
    .isNumeric()
    .withMessage("Sold must be a number")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Sold Products must be a positive integer"),

  check("price")
    .isNumeric()
    .withMessage("Price must be a number")
    .toFloat({ min: 0, max: 100000000000000 })
    .withMessage("Price must be a positive integer")
    .notEmpty()
    .withMessage("Price is required"),

  check("priceAfterDiscount")
    .isNumeric()
    .withMessage("Price After Discount must be a number")
    .toFloat({ min: 0, max: 100000000000000 })
    .withMessage("Price must be a positive integer")
    .optional()
    .custom((value, { req }) => {
      if (req.body.price <= value) {
        throw new Error(
          "Price After Discount must be less than the original price"
        );
      }
      return true;
    }),

  check("colors").isArray().withMessage("Colors must be an array").optional(),

  check("imageCover").notEmpty().withMessage("Image Cover is required"),

  check("images").isArray().withMessage("Images must be an array").optional(),

  check("category")
    .notEmpty()
    .withMessage("Category is required")
    .isMongoId()
    .withMessage("Invalid Category ID")
    .custom((categoryId) =>
      Category.findById(categoryId).then((category) => {
        if (!category) {
          return Promise.reject(
            new Error(`Category not found with ID: ${categoryId}`)
          );
        }
      })
    ),

  check("subCategory")
    .optional()
    .isArray()
    .withMessage("Subcategory must be an array")
    .custom((subCategoryId) =>
      SubCategory.find({ _id: { $exists: true, $in: subCategoryId } }).then(
        (result) => {
          if (result.length < 1 || result.length !== subCategoryId.length) {
            return Promise.reject(
              new Error(`Subcategory not found with this ID: ${subCategoryId}`)
            );
          }
        }
      )
    )
    .custom((val, { req }) =>
      SubCategory.find({ category: req.body.category }).then(
        (subcategories) => {
          const subcategoryIdsInDB = [];
          subcategories.forEach((subCategory) => {
            subcategoryIdsInDB.push(subCategory._id.toString());
          });
          if (!val.every((v) => subcategoryIdsInDB.includes(v))) {
            return Promise.reject(
              new Error(
                `Subcategory not found with this ID: ${val} in this category ${req.body.category}`
              )
            );
          }
        }
      )
    ),

  check("brand")
    .isMongoId()
    .withMessage("Invalid Brand ID")
    .optional()
    .custom((brandId) =>
      Brand.findById(brandId).then((brand) => {
        if (!brand) {
          return Promise.reject(
            new Error(`Brand not found with ID: ${brandId}`)
          );
        }
      })
    ),

  check("ratingsAverage")
    .optional()
    .isNumeric()
    .withMessage("Ratings Average must be a number")
    .isLength({ min: 0, max: 5 })
    .withMessage("Ratings Average must be between 0 and 5"),

  check("ratingsQuantity")
    .optional()
    .isInt()
    .withMessage("Ratings Quantity must be a Integer number"),
  
  validatorMiddleWare,
];

exports.updateProductValidator = [
  check("id").isMongoId().withMessage("Invalid Product ID"),
  body("title")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleWare,
];

exports.deleteProductValidator = [
  check("id").isMongoId().withMessage("Invalid Product ID"),
  validatorMiddleWare,
];

exports.getProductValidator = [
  check("id").isMongoId().withMessage("Invalid Product ID"),
  validatorMiddleWare,
];

//demo data
/*
{
    "title":"Lamborgine Urus",
    "description":"Lamborghini Urus is the first Super Sport Utility Vehicle in the world, merging the soul of a super sports car with the practical functionality of an SUV.",
    "quantity":3,
    "sold":5,
    "price":20000000,
    "priceAfterDiscount":17500000,
    "colors":["#cf7104","#04e604","#ff2234"],
    "imageCover":"https://www.lamborghini.com/sites/it-en/files/DAM/lamborghini/0_facelift_2025/gateway_family/urus/UrusSE.png",
    "images":["https://www.netcarshow.com/Lamborghini-Urus-2019-Front_Three-Quarter.326e8b9c.jpg", "https://www.lamborghini.com/sites/it-en/files/DAM/lamborghini/0_facelift_2025/gateway_family/urus/UrusSE.png"],
    "category":"68a76e1f6bca8f97c051b7d2",
    "subCategory":["68a76ec36bca8f97c051b7d5"],
    "brand":"68a76f146bca8f97c051b7d7",
    "ratingsAverage":4.4,
    "ratingsQuantity":4
}
*/
