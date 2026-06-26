const db = require('./db');

const userRepository = {
  async findByEmail(email) {
    if (db.isFallback()) {
      const data = db.readJSONDb();
      if (!data || !data.users) return null;
      const user = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      return user ? { ...user } : null;
    } else {
      const { User } = db.getModels();
      const user = await User.findOne({ where: { email } });
      return user ? user.toJSON() : null;
    }
  },

  async findById(id) {
    const intId = parseInt(id, 10);
    if (db.isFallback()) {
      const data = db.readJSONDb();
      if (!data || !data.users) return null;
      const user = data.users.find(u => u.id === intId);
      return user ? { ...user } : null;
    } else {
      const { User } = db.getModels();
      const user = await User.findByPk(intId);
      return user ? user.toJSON() : null;
    }
  },

  async create(userData) {
    if (db.isFallback()) {
      const data = db.readJSONDb();
      const newId = data.users.length > 0 ? Math.max(...data.users.map(u => u.id)) + 1 : 1;
      const newUser = {
        id: newId,
        ...userData,
        verified: userData.verified ?? false,
        status: userData.status || 'Offline',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      data.users.push(newUser);
      db.writeJSONDb(data);
      return { ...newUser };
    } else {
      const { User } = db.getModels();
      const user = await User.create(userData);
      return user.toJSON();
    }
  },

  async update(id, updateData) {
    const intId = parseInt(id, 10);
    if (db.isFallback()) {
      const data = db.readJSONDb();
      const index = data.users.findIndex(u => u.id === intId);
      if (index === -1) return null;
      
      data.users[index] = {
        ...data.users[index],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      db.writeJSONDb(data);
      return { ...data.users[index] };
    } else {
      const { User } = db.getModels();
      const user = await User.findByPk(intId);
      if (!user) return null;
      await user.update(updateData);
      return user.toJSON();
    }
  },

  async findAll() {
    if (db.isFallback()) {
      const data = db.readJSONDb();
      return data ? [...data.users] : [];
    } else {
      const { User } = db.getModels();
      const users = await User.findAll();
      return users.map(u => u.toJSON());
    }
  }
};

module.exports = userRepository;
