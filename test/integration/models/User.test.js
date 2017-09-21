const sails = require('sails');
const expect = require('expect.js');

describe('UserModel', function() {
  beforeEach(function(done) {
    // Drops database between each test.  This works because we use the memory database
    sails.once('hook:orm:reloaded', done);
    sails.emit('hook:orm:reload');
  });

  it('should automatically hash a password on save', async function() {
    const user = await User.create({ username: 'test', password: 'test' });
    expect(user.password).to.not.equal('test');
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
