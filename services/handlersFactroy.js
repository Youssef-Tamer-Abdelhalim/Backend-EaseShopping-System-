const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");

exports.deleteOne = Model => asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const document = await Model.findByIdAndDelete(id);
  if (!document) {
    next(new ApiError(`no ${Model.modelName} for this id ${id}`, 404));
  }

  await document.deleteOne(); // to trigger the "deleteOne" event and run the post middleware 

  res.status(204).send();
});

exports.updateOne = Model => asyncHandler(async (req, res, next) => {
  const document = await Model.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  if (!document) {
    next(new ApiError(`no ${Model.modelName} for this id ${req.params.id}`, 404));
  }
  // to trigger the "save" event and run the post middleware
  await document.save();
  
  res.status(200).json({ data: document });
}); 

exports.createOne = Model => asyncHandler(async (req, res) => {
  const newDocument = await Model.create(req.body);
  res.status(201).json({ data: newDocument });
});

exports.getOne = (Model, populateOptions) => asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  let query = Model.findById(id);
  if (populateOptions) {
    query = query.populate(populateOptions);
  }
  const document = await query;
  if (!document) {
    next(new ApiError(`no ${Model.modelName} for this id ${id}`, 404));
  } else {
    res.status(200).json({ data: document });
  }
});

exports.getAll = (Model, modelNameOfSearch = "") => asyncHandler(async (req, res) => {
let filter = {};
if (req.filterOBJ) {
    filter = req.filterOBJ;
}

  // build mongoose query
  const documentCounts = await Model.countDocuments();
  const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .search(modelNameOfSearch)
    .paginate(documentCounts);

  // execute query
  const { mongooseQuery, paginationResult } = apiFeatures;
  const documents = await mongooseQuery;
  res
    .status(200)
    .json({
      results: documents.length,
      pagination: paginationResult,
      data: documents,
    });
});