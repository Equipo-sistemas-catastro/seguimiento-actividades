const ComponentesService = require("./componentes.service");

class ComponentesController {
  static async list(req, res) {
    try {
      const { q, sortBy, sortDir } = req.query;
      const page = parseInt(req.query.page, 10) || 1;
      const pageSize = parseInt(req.query.pageSize, 10) || 50; // combos grandes

      const result = await ComponentesService.listar({
        q,
        sortBy,
        sortDir,
        page,
        pageSize,
      });

      return res.json(result);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
}

module.exports = ComponentesController;
