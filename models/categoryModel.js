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
    image: String,
  },
  { timestamps: true }
);

const setImageUrl = (doc) => {
  if (doc.image && !doc.image.startsWith('http')) {
    doc.image = `${process.env.BASE_URL}/categories/${doc.image}`;
  }
};

categorySchema.post("init", (doc) => {
  setImageUrl(doc);
});

categorySchema.post("save", (doc) => {
  setImageUrl(doc);
});

// وهنا بنحول الschema ل model انا مش فاهم ايه الفرق وليه بس برضو كانت فى docs mongoose
module.exports = mongoose.model("Category", categorySchema);
