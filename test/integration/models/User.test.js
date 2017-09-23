const sails = require('sails');
const expect = require('expect.js');

describe('UserModel', function() {
  beforeEach(function(done) {
    // Drops database between each test.  This works because we use the memory database
    sails.once('hook:orm:reloaded', done);
    sails.emit('hook:orm:reload');
  });

  it('should automatically hash a password on create', async function() {
    const user = await User.create({ username: 'test', password: 'test' });
    expect(user.password).to.not.equal('test');
  });

  it('should automatically hash a password on create', async function() {
    await User.create({ username: 'test', password: 'test' });
    const user = await User.update({ username: 'test' }, { password: 'updated' });
    expect(user.password).to.not.equal('updated');
  });

  describe('#hasLikeFrom', () => {
    let user1;
    let user2;

    beforeEach(async function() {
      user1 = await User.create({ username: 'test1', password: 'test' });
      user2 = await User.create({ username: 'test2', password: 'test' });
    });

    it('should return false if there are no like events', async function() {
      expect(await user1.hasLikeFrom(user2)).to.be.false;
    });

    it('should return false if last event is unlike', async function() {
      await LikeEvent.create({ fromUser: user2, toUser: user1, modifier: -1 });

      expect(await user1.hasLikeFrom(user2)).to.be.false;
    });

    it('should return true if last event is like', async function() {
      await LikeEvent.create({ fromUser: user2, toUser: user1, modifier: 1 });

      expect(await user1.hasLikeFrom(user2)).to.be.false;
    });
  });

  describe('#toJSON()', function() {
    it('should not contain a password field', async function() {
      const user = await User.create({ username: 'test', password: 'test' });
      expect(user.toJSON()).to.not.have.property('password');
    });
  });

  describe('#validatePassword(password)', function() {
    let user;

    beforeEach(async function(){
      user = await User.create({ username: 'test', password: 'test' });
    });

    it('should return true for valid password', async function(){
      expect(await user.validatePassword('test')).to.be.true;
    });

    it('should return false for invalid password', async function(){
      expect(await user.validatePassword('ddsdk')).to.be.false;
    });
  });
});
