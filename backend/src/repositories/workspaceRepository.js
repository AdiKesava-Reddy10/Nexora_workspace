const db = require('./db');

const workspaceRepository = {
  async findById(id) {
    const intId = parseInt(id, 10);
    if (db.isFallback()) {
      const data = db.readJSONDb();
      if (!data || !data.workspaces) return null;
      const ws = data.workspaces.find(w => w.id === intId);
      return ws ? { ...ws } : null;
    } else {
      const { Workspace } = db.getModels();
      const ws = await Workspace.findByPk(intId);
      return ws ? ws.toJSON() : null;
    }
  },

  async create(workspaceData) {
    if (db.isFallback()) {
      const data = db.readJSONDb();
      const newId = data.workspaces.length > 0 ? Math.max(...data.workspaces.map(w => w.id)) + 1 : 1;
      const slug = workspaceData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const newWs = {
        id: newId,
        slug,
        ...workspaceData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      data.workspaces.push(newWs);
      
      // Auto-assign owner as Admin member
      const memberId = data.workspaceMembers.length > 0 ? Math.max(...data.workspaceMembers.map(m => m.id)) + 1 : 1;
      data.workspaceMembers.push({
        id: memberId,
        workspaceId: newId,
        userId: workspaceData.ownerId,
        role: 'Admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      db.writeJSONDb(data);
      return { ...newWs };
    } else {
      const { Workspace, WorkspaceMember } = db.getModels();
      const slug = workspaceData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const ws = await Workspace.create({ ...workspaceData, slug });
      
      // Auto-assign owner as Admin member
      await WorkspaceMember.create({
        workspaceId: ws.id,
        userId: workspaceData.ownerId,
        role: 'Admin'
      });
      return ws.toJSON();
    }
  },

  async update(id, updateData) {
    const intId = parseInt(id, 10);
    if (db.isFallback()) {
      const data = db.readJSONDb();
      const index = data.workspaces.findIndex(w => w.id === intId);
      if (index === -1) return null;
      
      let slug = data.workspaces[index].slug;
      if (updateData.name) {
        slug = updateData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }

      data.workspaces[index] = {
        ...data.workspaces[index],
        ...updateData,
        slug,
        updatedAt: new Date().toISOString()
      };
      db.writeJSONDb(data);
      return { ...data.workspaces[index] };
    } else {
      const { Workspace } = db.getModels();
      const ws = await Workspace.findByPk(intId);
      if (!ws) return null;
      let slug = ws.slug;
      if (updateData.name) {
        slug = updateData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      await ws.update({ ...updateData, slug });
      return ws.toJSON();
    }
  },

  async findAllByUserId(userId) {
    const intUserId = parseInt(userId, 10);
    if (db.isFallback()) {
      const data = db.readJSONDb();
      if (!data) return [];
      
      // Get all workspace IDs the user belongs to
      const memberWorkspaceIds = data.workspaceMembers
        .filter(m => m.userId === intUserId)
        .map(m => m.workspaceId);
      
      // Return workspace details
      return data.workspaces.filter(w => memberWorkspaceIds.includes(w.id));
    } else {
      const { Workspace, WorkspaceMember } = db.getModels();
      // Raw query or using associations. Using a straightforward approach:
      const memberships = await WorkspaceMember.findAll({ where: { userId: intUserId } });
      const workspaceIds = memberships.map(m => m.workspaceId);
      const workspaces = await Workspace.findAll({ where: { id: workspaceIds } });
      return workspaces.map(w => w.toJSON());
    }
  },

  async findMembers(workspaceId) {
    const intWorkspaceId = parseInt(workspaceId, 10);
    if (db.isFallback()) {
      const data = db.readJSONDb();
      if (!data) return [];
      
      const members = data.workspaceMembers.filter(m => m.workspaceId === intWorkspaceId);
      return members.map(m => {
        const u = data.users.find(user => user.id === m.userId);
        return {
          id: m.id,
          workspaceId: m.workspaceId,
          userId: m.userId,
          role: m.role,
          user: u ? { id: u.id, name: u.name, email: u.email, avatar: u.avatar, role: u.role, status: u.status } : null
        };
      });
    } else {
      const { WorkspaceMember, User } = db.getModels();
      // Standard join
      const members = await WorkspaceMember.findAll({
        where: { workspaceId: intWorkspaceId }
      });
      
      const results = [];
      for (const m of members) {
        const user = await User.findByPk(m.userId);
        results.push({
          id: m.id,
          workspaceId: m.workspaceId,
          userId: m.userId,
          role: m.role,
          user: user ? { id: user.id, name: user.name, email: user.email, avatar: user.avatar, role: user.role, status: user.status } : null
        });
      }
      return results;
    }
  },

  async addMember(workspaceId, userId, role = 'Developer') {
    const intWorkspaceId = parseInt(workspaceId, 10);
    const intUserId = parseInt(userId, 10);
    if (db.isFallback()) {
      const data = db.readJSONDb();
      
      // Check if already member
      const exists = data.workspaceMembers.find(m => m.workspaceId === intWorkspaceId && m.userId === intUserId);
      if (exists) return exists;

      const newId = data.workspaceMembers.length > 0 ? Math.max(...data.workspaceMembers.map(m => m.id)) + 1 : 1;
      const newMember = {
        id: newId,
        workspaceId: intWorkspaceId,
        userId: intUserId,
        role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      data.workspaceMembers.push(newMember);
      db.writeJSONDb(data);
      return newMember;
    } else {
      const { WorkspaceMember } = db.getModels();
      const [member] = await WorkspaceMember.findOrCreate({
        where: { workspaceId: intWorkspaceId, userId: intUserId },
        defaults: { role }
      });
      return member.toJSON();
    }
  },

  async updateMemberRole(workspaceId, userId, role) {
    const intWorkspaceId = parseInt(workspaceId, 10);
    const intUserId = parseInt(userId, 10);
    if (db.isFallback()) {
      const data = db.readJSONDb();
      const member = data.workspaceMembers.find(m => m.workspaceId === intWorkspaceId && m.userId === intUserId);
      if (!member) return null;
      member.role = role;
      member.updatedAt = new Date().toISOString();
      db.writeJSONDb(data);
      return { ...member };
    } else {
      const { WorkspaceMember } = db.getModels();
      const member = await WorkspaceMember.findOne({ where: { workspaceId: intWorkspaceId, userId: intUserId } });
      if (!member) return null;
      await member.update({ role });
      return member.toJSON();
    }
  },

  async removeMember(workspaceId, userId) {
    const intWorkspaceId = parseInt(workspaceId, 10);
    const intUserId = parseInt(userId, 10);
    if (db.isFallback()) {
      const data = db.readJSONDb();
      const lengthBefore = data.workspaceMembers.length;
      data.workspaceMembers = data.workspaceMembers.filter(m => !(m.workspaceId === intWorkspaceId && m.userId === intUserId));
      const removed = data.workspaceMembers.length < lengthBefore;
      if (removed) {
        db.writeJSONDb(data);
      }
      return removed;
    } else {
      const { WorkspaceMember } = db.getModels();
      const deletedRows = await WorkspaceMember.destroy({ where: { workspaceId: intWorkspaceId, userId: intUserId } });
      return deletedRows > 0;
    }
  }
};

module.exports = workspaceRepository;
