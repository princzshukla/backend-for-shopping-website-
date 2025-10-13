import { User } from "../models/user.models.js";
import { ApiError } from "../utils/apierror.js";
import { asynchandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating access and refresh tokens"
    );
  }
};
//Register User
const registerUser = asynchandler(async (req, res) => {
  const { name, email, gender, password } = req.body;

  if (
    [name, email, gender, password].some(
      (items) => !items || items.trim() === ""
    )
  ) {
    throw new ApiError(400, "all fiels arerequired ");
  }
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(
      400,
      "user is already existed with this email try with another email"
    );
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError(500, "someting went wrong while uploading avatar");
  }

  const user = User.create({
    name,
    email,
    gender,
    password,
    avatar: avatar.url,
  });

  if (!user) {
    throw new ApiError(500, "something went wrong while creating user");
  }

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "something went wrong");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "user created successfully"));
});
// LoginUser
const loginUser = asynchandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    throw new ApiError(400, "email is required");
  }

  const user = User.findOne({ email });

  if (!user) {
    throw new ApiError(400, "User is not found with this email");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "password is incorrect");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

// logOutUser
const LogoutUser = asynchandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});
//Refresh Access Token
const refreshAcessToken = asynchandler(async (req, res) => {
  const incomingIncomingRefreshToken =
    req.body.refreshToken || req.cookies.refreshToken;

  if (!incomingIncomingRefreshToken) {
    throw new ApiError(400, "refresh token is required");
  }
  try {
    const decodeToken = jwt.verify(
      incomingIncomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodeToken._id);
    if (!user) {
      throw new ApiError(400, "user is not found with this token");
    }

    if (user?.refreshToken !== incomingIncomingRefreshToken) {
      throw new ApiError(401, "invlaid refresh Token");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newrefreshToken } =
      await generateAccessAndRefreshToken(user._id);
    return res
      .status(200)
      .cookie("refreshToken", newrefreshToken, options)
      .cookie("accessToken", accessToken, options)
      .json(
        new ApiResponse(200, {
          accessToken,
          refreshToken: newrefreshToken,
        }),
        "access token generated successfully"
      );
  } catch (error) {
    throw new ApiError(401, "invalid refresh token");
  }
});
//Forget Password
const forgetPassword = asynchandler(async(req,res)=>{
  const {email} = req.body;
  if(!email)
  {throw new ApiError(400,"email is required")}
  const user = await User.findOne({email})
  if(!user)
  {throw new ApiError(400,"user not found with this email")}
  const generateToken = user.generateAccessAndRefreshToken(user._id)

})
export { registerUser, loginUser, LogoutUser, refreshAcessToken };
