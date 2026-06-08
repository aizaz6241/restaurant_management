const SideItem = require('../models/SideItem');
const MenuItem = require('../models/MenuItem');

// @desc    Get all side items
// @route   GET /api/sides
// @access  Public
const getSides = async (req, res) => {
  try {
    const sides = await SideItem.find({});
    res.json(sides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a side item
// @route   POST /api/sides
// @access  Private/Admin
const createSide = async (req, res) => {
  try {
    const { name, image, price } = req.body;
    const sideItem = new SideItem({
      name,
      image,
      price: price || 0,
    });
    const createdSide = await sideItem.save();
    res.status(201).json(createdSide);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a side item
// @route   PUT /api/sides/:id
// @access  Private/Admin
const updateSide = async (req, res) => {
  try {
    const { name, image, price } = req.body;
    const sideItem = await SideItem.findById(req.params.id);

    if (sideItem) {
      sideItem.name = name === undefined ? sideItem.name : name;
      sideItem.image = image === undefined ? sideItem.image : image;
      sideItem.price = price === undefined ? sideItem.price : price;

      const updatedSide = await sideItem.save();
      res.json(updatedSide);
    } else {
      res.status(404).json({ message: 'Side item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a side item
// @route   DELETE /api/sides/:id
// @access  Private/Admin
const deleteSide = async (req, res) => {
  try {
    const sideItem = await SideItem.findById(req.params.id);

    if (sideItem) {
      // Pull side from all menu items that reference it
      await MenuItem.updateMany(
        { sides: req.params.id },
        { $pull: { sides: req.params.id } }
      );
      
      await sideItem.deleteOne();
      res.json({ message: 'Side item removed' });
    } else {
      res.status(404).json({ message: 'Side item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSides, createSide, updateSide, deleteSide };
