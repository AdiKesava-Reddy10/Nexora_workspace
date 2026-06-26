const db = require('./db');

const projectRepository = {
  async findById(id) {
    const intId = parseInt(id, 10);
    if (db.isFallback()) {
      const data = db.readJSONDb();
      if (!data || !data.projects) return null;
      const proj = data.projects.find(p => p.id === intId);
      return proj ? { ...proj } : null;
    } else {
      const { Project } = db.getModels();
      const proj = await Project.findByPk(intId);
      return proj ? proj.toJSON() : null;
    }
  },

  async findAll(filters = {}) {
    const workspaceId = filters.workspaceId ? parseInt(filters.workspaceId, 10) : null;
    if (db.isFallback()) {
      const data = db.readJSONDb();
      if (!data || !data.projects) return [];
      let list = [...data.projects];
      if (workspaceId) {
        list = list.filter(p => p.workspaceId === workspaceId);
      }
      return list;
    } else {
      const { Project } = db.getModels();
      const queryOptions = {};
      if (workspaceId) {
        queryOptions.where = { workspaceId };
      }
      const list = await Project.findAll(queryOptions);
      return list.map(p => p.toJSON());
    }
  },

  async create(projectData) {
    if (db.isFallback()) {
      const data = db.readJSONDb();
      const newId = data.projects.length > 0 ? Math.max(...data.projects.map(p => p.id)) + 1 : 1;
      const newProj = {
        id: newId,
        progress: 0,
        healthScore: 100,
        status: projectData.status || 'Active',
        priority: projectData.priority || 'Medium',
        estimatedHours: projectData.estimatedHours || 0.00,
        ...projectData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      data.projects.push(newProj);
      db.writeJSONDb(data);
      return { ...newProj };
    } else {
      const { Project } = db.getModels();
      const proj = await Project.create(projectData);
      return proj.toJSON();
    }
  },

  async update(id, updateData) {
    const intId = parseInt(id, 10);
    if (db.isFallback()) {
      const data = db.readJSONDb();
      const index = data.projects.findIndex(p => p.id === intId);
      if (index === -1) return null;
      data.projects[index] = {
        ...data.projects[index],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      db.writeJSONDb(data);
      return { ...data.projects[index] };
    } else {
      const { Project } = db.getModels();
      const proj = await Project.findByPk(intId);
      if (!proj) return null;
      await proj.update(updateData);
      return proj.toJSON();
    }
  },

  async delete(id) {
    const intId = parseInt(id, 10);
    if (db.isFallback()) {
      const data = db.readJSONDb();
      const index = data.projects.findIndex(p => p.id === intId);
      if (index === -1) return false;
      
      // Also delete tasks associated with this project
      data.tasks = data.tasks.filter(t => t.projectId !== intId);
      data.projects.splice(index, 1);
      
      db.writeJSONDb(data);
      return true;
    } else {
      const { Project, Task } = db.getModels();
      const proj = await Project.findByPk(intId);
      if (!proj) return false;
      
      // Delete project tasks
      await Task.destroy({ where: { projectId: intId } });
      await proj.destroy();
      return true;
    }
  }
};

module.exports = projectRepository;
