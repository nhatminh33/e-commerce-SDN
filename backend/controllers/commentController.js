const Comment = require("../models/comment");
const Product = require("../models/productModel");

// [GET] api/v1/comment
module.exports.getComments = async (req, res) => {
  const { productId } = req.params;
  try {
    const comments = await Comment.find({ productId })
      .populate("user")
      .populate("replies");
    res.json({
      code: 200,
      comments,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Error fetching comments",
    });
  }
};

// [POST] api/v1/comment
module.exports.postComment = async (req, res) => {
  const { content, productId, reply } = req.body;
  const user = req.id; // Get user ID from req.id

  // Validate required fields
  if (!productId || !content) {
    return res.status(400).json({
      code: 400,
      message: "productId and content are required",
    });
  }

  try {
    // Create a new comment
    const comment = new Comment({ content, productId, reply, user });
    await comment.save();

    // If it's a reply to another comment, update the parent comment's replies array
    if (reply) {
      const parentComment = await Comment.findById(reply);
      if (parentComment) {
        parentComment.replies.push(comment._id);
        await parentComment.save();
      }
    }

  
    await Product.findByIdAndUpdate(
      productId,
      { $push: { comments: comment._id } },
      { new: true }
    );

    res.json({
      code: 200,
      message: "Comment Successfully Created",
      comment,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Error creating comment",
    });
  }
};

// [DELETE] api/v1/comment/:id
module.exports.deleteComment = async (req, res) => {
  const { id } = req.params;
  const { productId } = req.body;
  const user = req.id; // Get user ID from req.id

  if (!productId) {
    return res.status(400).json({
      code: 400,
      message: "productId is required",
    });
  }

  try {
    const comment = await Comment.findOne({ _id: id, user, productId });
    if (comment) {
      await comment.deleteOne();
      res.json({ code: 200, message: "Deleted Successfully" });
    } else {
      res.status(403).json({
        code: 403,
        message: "Unauthorized or comment not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Error deleting comment",
    });
  }
};

// [PUT] api/v1/comment/:commentId
module.exports.editComment = async (req, res) => {
  const { commentId } = req.params;
  const { content, productId } = req.body;
  const user = req.id; // Get user ID from req.id

  if (!productId) {
    return res.status(400).json({
      code: 400,
      message: "productId is required",
    });
  }

  try {
    const comment = await Comment.findOne({ _id: commentId, user, productId });
    if (comment) {
      comment.content = content;
      await comment.save();
      res.json({ code: 200, message: "Edited Successfully" });
    } else {
      res.status(403).json({
        code: 403,
        message: "Unauthorized or comment not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Error editing comment",
    });
  }
};
