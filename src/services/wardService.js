const Ward = require('../models/Ward');
const AppError = require('../utils/AppError');

const createWard = async (payload) => {
  if (payload.availableBeds !== undefined && payload.availableBeds > payload.totalBeds) {
    throw new AppError('availableBeds cannot exceed totalBeds', 400);
  }

  const ward = await Ward.create(payload);
  return ward;
};

const listWards = async () => {
  const wards = await Ward.find().sort({ department: 1, wardName: 1 });
  return wards;
};

module.exports = {
  createWard,
  listWards
};
