const wardService = require('../services/wardService');

const createWard = async (req, res) => {
  const ward = await wardService.createWard(req.body);

  return res.status(201).json({
    success: true,
    message: 'Ward created successfully',
    data: ward
  });
};

const listWards = async (req, res) => {
  const wards = await wardService.listWards();

  return res.status(200).json({
    success: true,
    message: 'Wards retrieved successfully',
    data: wards
  });
};

module.exports = {
  createWard,
  listWards
};
