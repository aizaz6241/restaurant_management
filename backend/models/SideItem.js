const mongoose = require('mongoose');

const sideItemSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const SideItem = mongoose.model('SideItem', sideItemSchema);

module.exports = SideItem;
