const MenuItem = require('../models/MenuItem');

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
const getMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find({}).populate('dealItems.menuItem');
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a menu item
// @route   POST /api/menu
// @access  Private/Admin
const createMenuItem = async (req, res) => {
  try {
    const { name, description, price, image, category, isAvailable, discountPrice, isDeal, dealItems } = req.body;
    const menuItem = new MenuItem({
      name,
      description,
      price,
      image,
      category,
      isAvailable,
      discountPrice,
      isDeal,
      dealItems,
    });
    const createdItem = await menuItem.save();
    res.status(201).json(createdItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a menu item
// @route   PUT /api/menu/:id
// @access  Private/Admin
const updateMenuItem = async (req, res) => {
  try {
    const { name, description, price, image, category, isAvailable, discountPrice, isDeal, dealItems } = req.body;
    const menuItem = await MenuItem.findById(req.params.id);

    if (menuItem) {
      menuItem.name = name === undefined ? menuItem.name : name;
      menuItem.description = description === undefined ? menuItem.description : description;
      menuItem.price = price === undefined ? menuItem.price : price;
      menuItem.image = image === undefined ? menuItem.image : image;
      menuItem.category = category === undefined ? menuItem.category : category;
      menuItem.isAvailable = isAvailable === undefined ? menuItem.isAvailable : isAvailable;
      menuItem.discountPrice = discountPrice === undefined ? menuItem.discountPrice : discountPrice;
      menuItem.isDeal = isDeal === undefined ? menuItem.isDeal : isDeal;
      menuItem.dealItems = dealItems === undefined ? menuItem.dealItems : dealItems;

      const updatedItem = await menuItem.save();
      res.json(updatedItem);
    } else {
      res.status(404).json({ message: 'Menu item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a menu item
// @route   DELETE /api/menu/:id
// @access  Private/Admin
const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (menuItem) {
      await menuItem.deleteOne();
      res.json({ message: 'Menu item removed' });
    } else {
      res.status(404).json({ message: 'Menu item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem };
