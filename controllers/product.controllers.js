import { SearchFeatures } from "../utils/searchFeatures.js";
import { Product } from "../models/product.models.js";
import { ApiError } from "../utils/apierror.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { asynchandler } from "../utils/asynchandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";

const getAllProducts = asynchandler(async (req, res) => {
  const resultPerPage = 12;
  const productCount = await Product.countDocuments();
  // here we use seachFeatures for utils to seach and filter the products categories
  const searchFeatures = new SearchFeatures(Product.find(), req.query)
    .search()
    .filter();
  // and here we counts the seach products categories
  let products = await searchFeatures.query;
  let filterProductsCount = products.length;

  // it basically shows the filtered products in a page at what no.of pages assign to show on one page
  searchFeatures.pagination(resultPerPage);
  //.clone() creates a copy of the query so you can execute it again safely.
  products = await searchFeatures.query.clone();
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        products,
        productCount,
        resultPerPage,
        filterProductsCount,
        "all products are shown and categories also "
      )
    );
});
// get all products -- product sliders
const getProducts = asynchandler(async (req, res) => {
  const products = await Product.find();
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        products,
        "all productsAll products retrieved successfully "
      )
    );
});
//getProductDetails
const getProductDetails = asynchandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, "product not found ");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, product, "product deyails are shown successfully")
    );
});
//get all products --- admin

const adminProducts = asynchandler(async (req, res) => {
  const product = await Product.find();
  if (!product) {
    throw new ApiError(400, "product not found ");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, product, "all the products "));
});
//create products -- admin
const createProduct = asynchandler(async (req, res) => {
  let images = [];
  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  const imagesLink = [];

  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.v2.uploader.upload(images[i], {
      folder: "products",
    });

    imagesLink.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

  const result = await cloudinary.v2.uploader.upload(req.body.logo, {
    folder: "brands",
  });
  const brandLogo = {
    public_id: result.public_id,
    url: result.secure_url,
  };

  req.body.brand = {
    name: req.body.brandname,
    logo: brandLogo,
  };
  req.body.images = imagesLink;
  req.body.user = req.user.id;

  let specs = [];
  req.body.specifications.forEach((s) => {
    specs.push(JSON.parse(s));
  });
  req.body.specifications = specs;

  const product = await Product.create(req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, product, "product created successfully"));
});

//updateProduct -- admin
const updateProduct = asynchandler(async (req, res) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(400, "product not found");
  }

  if (req.body.images !== undefined) {
    let images = [];
    if (typeof req.body.images === "string") {
      images.push(req.body.images);
    } else {
      images = req.body.images;
    }
    for (let i = 0; i < product.images.length; i++) {
      await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    const imagesLink = [];

    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "products",
      });

      imagesLink.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }
    req.body.images = imagesLink;
  }

  if (req.body.logo.length > 0) {
    await cloudinary.v2.uploader.destroy(product.brand.logo.public_id);
    const result = await cloudinary.v2.uploader.upload(req.body.logo, {
      folder: "brands",
    });
    const brandLogo = {
      public_id: result.public_id,
      url: result.secure_url,
    };

    req.body.brand = {
      name: req.body.brandname,
      logo: brandLogo,
    };
  }

  let specs = [];
  req.body.specifications.forEach((s) => {
    specs.push(JSON.parse(s));
  });
  req.body.specifications = specs;
  req.body.user = req.user.id;

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, product, "product updated successfully"));
});
//delete product
const deleteProduct = asynchandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(400, "product not found");
  }

  for (let i = 0; i < product.images.length; i++) {
    await cloudinary.v2.uploader.destroy(product.images[i].public_id);
  }
  await product.remove();
  return res
    .status(200)
    .json(new ApiResponse(200, deleteProduct, "delte product successfully"));
});
// craete and update product reviews
const createProductReview = asynchandler(async (req, res) => {
  const { rating, comment, productId } = req.body;
  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "product not found");
  }

  const isReviewed = product.reviews.find(
    (review) => review.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString())
        (rev.rating = rating), (rev.comment = comment);
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }
  let avg = 0;

  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });

  product.ratings = avg / product.reviews.length;
  await product.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, product, "review added successfully"));
});
//get all reviews of product

const getProductReviews = asynchandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(400, "product not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        product.reviews,
        "product reviews successfully retrieved"
      )
    );
});
//Delete reviews

const deleteReview = asynchandler(async (req, res) => {
  const product = await Product.findById(req.query.productId);
  if (!product) {
    throw new ApiError(400, "product not found");
  }
  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let avg = 0;

  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  let ratings = 0;

  if (reviews.length === 0) {
    ratings = 0;
  } else {
    ratings = avg / reviews.length;
  }

  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings: Number(ratings),
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, null, "review deleted successfully"));
});

export {
  getAllProducts,
  getProducts,
  getProductDetails,
  adminProducts,
  updateProduct,
  deleteProduct,
  getProductReviews,
  deleteReview,
  createProductReview,
  createProduct,
};
