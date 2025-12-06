const Account = require('../models/Account');
const mongoose = require('mongoose');

const ALLOWED_UPDATES = new Set([
  'username',
  'profileImage',
  'bannerImage',
  'bio',
  'socialLinks',
  'bandName',
  'genre',
  'website',
  'followers',
  'purchaseHistory',
  'likedTracks',
  'following',
  // incluir solo campos permitidos; omitir 'password' aquí
  'email'
]);

class AccountDao {
  async create(accountData) {
    const account = new Account(accountData);
    return await account.save();
  }

  async findByEmail(email) {
    if (!email || typeof email !== 'string') return null;
    return await Account.findOne({ email: email });
  }

  async findById(id) {
    if (!mongoose.Types.ObjectId.isValid(String(id))) return null;
    return await Account.findById(id);
  }

  async findByIdWithArtist(id) {
    if (!mongoose.Types.ObjectId.isValid(String(id))) return null;
    return await Account.findById(id).populate('artistId');
  }

  async update(id, updateData) {
    if (!mongoose.Types.ObjectId.isValid(String(id))) return null;
    const sanitized = {};
    if (updateData && typeof updateData === 'object') {
      for (const key of Object.keys(updateData)) {
        if (ALLOWED_UPDATES.has(key)) {
          sanitized[key] = updateData[key];
        }
      }
    }
    sanitized.updatedAt = new Date();
    return await Account.findByIdAndUpdate(id, sanitized, { new: true });
  }

  async linkToArtist(accountId, artistId) {
    if (!mongoose.Types.ObjectId.isValid(String(accountId))) return null;
    return await Account.findByIdAndUpdate(
      accountId,
      {
        artistId: artistId,
        updatedAt: new Date()
      },
      { new: true }
    );
  }

  async findByRole(role) {
    return await Account.find({ role });
  }

  async findBandsWithoutArtist() {
    return await Account.find({
      role: 'band',
      artistId: { $exists: false }
    });
  }

  async followArtist(userId, artistId) {
    if (!mongoose.Types.ObjectId.isValid(String(userId))) return null;
    return await Account.findByIdAndUpdate(
      userId,
      { $addToSet: { following: String(artistId) } },
      { new: true }
    );
  }

  async unfollowArtist(userId, artistId) {
    if (!mongoose.Types.ObjectId.isValid(String(userId))) return null;
    return await Account.findByIdAndUpdate(
      userId,
      { $pull: { following: String(artistId) } },
      { new: true }
    );
  }

  async likeTrack(userId, trackId) {
    if (!mongoose.Types.ObjectId.isValid(String(userId))) return null;
    return await Account.findByIdAndUpdate(
      userId,
      { $addToSet: { likedTracks: String(trackId) } },
      { new: true }
    );
  }

  async unlikeTrack(userId, trackId) {
    if (!mongoose.Types.ObjectId.isValid(String(userId))) return null;
    return await Account.findByIdAndUpdate(
      userId,
      { $pull: { likedTracks: String(trackId) } },
      { new: true }
    );
  }

  async delete(id) {
    if (!mongoose.Types.ObjectId.isValid(String(id))) return null;
    return await Account.findByIdAndDelete(id);
  }
}

module.exports = new AccountDao();