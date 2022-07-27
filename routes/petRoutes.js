import express from 'express';

const router = express.Router();

module.exports = (dataHelpers) => {
  // route to adopt a pet
  router.post('/:id/adopt', async (req, res) => {
    const result = await dataHelpers.adoptPet(req.body.userId, req.params.id);
    console.log("RESULT", result);
    res.json(result);
  });
  return router;
};
