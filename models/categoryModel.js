const mongoose = require("mongoose"); // هنا استدعينا mongoose

// هنا بنعمل schema للكاتيجورى من docs mongoose
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      unique: [true, "Name must be unique"],
      minlength: [3, "Name must be at least 3 characters long"],
      maxlength: [32, "Name must be at most 32 characters long"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: [true, "Slug must be unique"],
      lowercase: true,
    },
    image:{
      type: String,
      required: [true, "Image for category is required"],
    },
  },
  { timestamps: true }
);

// وهنا بنحول الschema ل model انا مش فاهم ايه الفرق وليه بس برضو كانت فى docs mongoose
module.exports = mongoose.model("Category", categorySchema);
