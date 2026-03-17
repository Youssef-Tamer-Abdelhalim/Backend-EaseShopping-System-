class ApiFeatures {
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
  }

  filter() {
    // 1) Filtering
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields", "keyword"];
    excludedFields.forEach((field) => delete queryObj[field]);

    // 1.1) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    // 2) Sorting
    if (this.queryString.sort) {
      this.mongooseQuery = this.mongooseQuery.sort(
        this.queryString.sort.split(",").join(" ")
      );
    } else {
      this.mongooseQuery = this.mongooseQuery.sort("createdAt");
    }

    return this;
  }

  limitFields() {
    // 3) Field Limiting
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.select(fields);
    } else {
      this.mongooseQuery = this.mongooseQuery.select("-__v");
    }
    return this;
  }

  search(modelNameOfSearch) {
    if (this.queryString.keyword) {
      if (modelNameOfSearch === "Products") {
        // Use MongoDB text index for relevance-based search.
        // Falls back to regex when the text index is not yet built.
        this.mongooseQuery = this.mongooseQuery.find({
          $text: { $search: this.queryString.keyword },
        });

        // Sort by relevance score when no explicit sort was requested.
        // This runs after sort(), so it overrides the default createdAt sort.
        if (!this.queryString.sort) {
          this.mongooseQuery = this.mongooseQuery.sort({
            score: { $meta: "textScore" },
          });
        }
      } else {
        this.mongooseQuery = this.mongooseQuery.find({
          name: { $regex: this.queryString.keyword, $options: "i" },
        });
      }
    }
    return this;
  }

  paginate(countDocuments) {
    // 5) Pagination
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 25;
    const skipPage = (page - 1) * limit;
    const endIndex = page * limit;

    // Pagination result
    const pagination = {};
    pagination.currentPage = page;
    pagination.limit = limit;
    pagination.numberOfPages = Math.ceil(countDocuments / limit);

    if (endIndex < countDocuments) {
      pagination.nextPage = page + 1;
    }

    if (skipPage > 0) {
      pagination.prevPage = page - 1;
    }

    this.mongooseQuery = this.mongooseQuery.skip(skipPage).limit(limit);
    this.paginationResult = pagination;
    return this;
  }
}

module.exports = ApiFeatures;
