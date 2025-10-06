const EmpleadosService = require('./empleados.service');

class EmpleadosController {
  static async list(req, res) {
    try {
      const { q, estado, sortBy, sortDir } = req.query;
      const page = parseInt(req.query.page, 10) || 1;
      const pageSize = parseInt(req.query.pageSize, 10) || 10;
      const result = await EmpleadosService.listar({ q, estado, sortBy, sortDir, page, pageSize });
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static async create(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: 'No autenticado' });

      const body = req.body || {};
      const required = ['cedula_empleado','primer_nombre_empl','primer_apellido_empl','email_empleado'];
      for (const f of required) {
        if (!body[f] || String(body[f]).trim()==='') {
          return res.status(400).json({ message: `Falta campo: ${f}` });
        }
      }

      const empleado = await EmpleadosService.crear(body, userId);
      return res.status(201).json({ message:'Empleado creado', data: empleado });
    } catch (err) {
      if ((err.message||'').toLowerCase().includes('duplicate')) {
        return res.status(409).json({ message:'Cédula o email ya registrados' });
      }
      return res.status(400).json({ message: err.message });
    }
  }

  static async detail(req, res) {
    try {
      const idEmpleado = parseInt(req.params.id,10);
      if (!Number.isInteger(idEmpleado) || idEmpleado<=0) {
        return res.status(400).json({ message:'id inválido' });
      }
      const data = await EmpleadosService.obtener(idEmpleado);
      if (!data) return res.status(404).json({ message:'Empleado no encontrado' });
      return res.json(data);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async update(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message:'No autenticado' });

      const idEmpleado = parseInt(req.params.id,10);
      if (!Number.isInteger(idEmpleado) || idEmpleado<=0) {
        return res.status(400).json({ message:'id inválido' });
      }

      const updated = await EmpleadosService.actualizar(idEmpleado, req.body||{}, userId);
      if (!updated) return res.status(400).json({ message:'Nada para actualizar' });
      return res.json({ message:'Empleado actualizado', data: updated });
    } catch (err) {
      if ((err.message||'').toLowerCase().includes('duplicate')) {
        return res.status(409).json({ message:'Cédula o email ya registrados' });
      }
      return res.status(400).json({ message: err.message });
    }
  }

  static async putPerfil(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message:'No autenticado' });

      const idEmpleado = parseInt(req.params.id,10);
      const { id_perfil } = req.body || {};
      if (!Number.isInteger(idEmpleado) || idEmpleado<=0) {
        return res.status(400).json({ message:'id inválido' });
      }
      if (!Number.isInteger(id_perfil) || id_perfil<=0) {
        return res.status(400).json({ message:'id_perfil inválido' });
      }

      const row = await EmpleadosService.asignarPerfil(idEmpleado, id_perfil, userId);
      return res.json({ message:'Perfil asignado', data: row });
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  }

  static async putComponente(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message:'No autenticado' });

      const idEmpleado = parseInt(req.params.id,10);
      const { id_componente } = req.body || {};
      if (!Number.isInteger(idEmpleado) || idEmpleado<=0) {
        return res.status(400).json({ message:'id inválido' });
      }
      if (!Number.isInteger(id_componente) || id_componente<=0) {
        return res.status(400).json({ message:'id_componente inválido' });
      }

      const row = await EmpleadosService.asignarComponente(idEmpleado, id_componente, userId);
      return res.json({ message:'Componente asignado', data: row });
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  }

  // ====== NUEVO: Catálogos internos del módulo ======
  static async catalogPerfiles(req, res) {
    try {
      const items = await EmpleadosService.listarPerfilesAll();
      res.json({ data: items });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static async catalogComponentes(req, res) {
    try {
      const items = await EmpleadosService.listarComponentesAll();
      res.json({ data: items });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

module.exports = EmpleadosController;
