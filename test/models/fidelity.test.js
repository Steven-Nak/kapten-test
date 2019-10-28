'use strict';

const { expect } = require('chai');
const sinon = require('sinon');
const { ObjectId } = require('mongodb');

const dateLib = require('../../src/lib/date');
const fidelityModel = require('../../src/models/fidelity');

const date = require('../fixtures/date');

describe('models/fidelity', () => {
  const sandbox = sinon.sandbox.create();

  beforeEach(async () => {
    await fidelityModel.collection().remove({});
    sandbox.stub(dateLib, 'getDate').returns(date);
  });

  afterEach(() => sandbox.restore());

  describe('#insertOne', () => {
    it('inserts a new fidelity status record into the database', async () => {
      const fidelity = await fidelityModel.insertOne({
        _id: '000000000000000000000001',
        loyalty_status: {
          bronze: { points_spent: 0, rides_count: 0 },
          silver: { points_spent: 20, rides_count: 1 },
          gold: { points_spent: 120, rides_count: 2 },
          platinum: { points_spent: 220, rides_count: 3 }
        }
      });

      expect(fidelity).to.deep.equal({
        _id: ObjectId.createFromHexString('000000000000000000000001'),
        loyalty_status: {
          bronze: { points_spent: 0, rides_count: 0 },
          silver: { points_spent: 20, rides_count: 1 },
          gold: { points_spent: 120, rides_count: 2 },
          platinum: { points_spent: 220, rides_count: 3 }
        }
      });
    });

    it('does not insert a document failing validation', async () => {
      let error;

      try {
        await fidelityModel.insertOne({
          _id: '000000000000000000000001',
          loyalty_status: 'short'
        });
      } catch (err) {
        error = err;
      }

      expect(error).to.be.an('Error')
        .with.property('message')
        .that.matches(/"loyalty_status" must be an object/);
    });
  });

  describe('#updateOne', () => {
    it('updates the model accordingly', async () => {
      await fidelityModel.insertOne({
        _id: '000000000000000000000001',
        loyalty_status: {
          bronze: { points_spent: 0, rides_count: 0 },
          silver: { points_spent: 20, rides_count: 1 },
          gold: { points_spent: 120, rides_count: 4 },
          platinum: { points_spent: 220, rides_count: 10 }
        }
      });

      const fidelityUpdated = await fidelityModel.updateOne(
        ObjectId.createFromHexString('000000000000000000000001'),
        {
          loyalty_status: {
            bronze: { points_spent: 10, rides_count: 1 },
            silver: { points_spent: 50, rides_count: 3 },
            gold: { points_spent: 150, rides_count: 5 },
            platinum: { points_spent: 250, rides_count: 15 }
          }
        }
      );

      expect(fidelityUpdated.result.nModified).to.equal(1);
      const dbFidelity = await fidelityModel.collection().find().toArray();
      expect(dbFidelity).to.deep.equal([{
        _id: ObjectId.createFromHexString('000000000000000000000001'),
        loyalty_status: {
          bronze: { points_spent: 10, rides_count: 1 },
          silver: { points_spent: 50, rides_count: 3 },
          gold: { points_spent: 150, rides_count: 5 },
          platinum: { points_spent: 250, rides_count: 15 }
        }
      }]);
    });
  });

  describe('#find', () => {
    beforeEach(async () => {
      await fidelityModel.collection().insertMany([
        {
          _id: ObjectId.createFromHexString('000000000000000000000001'),
          loyalty_status: {
            bronze: { points_spent: 10, rides_count: 1 }
          }
        },
        {
          _id: ObjectId.createFromHexString('000000000000000000000002'),
          loyalty_status: {
            silver: { points_spent: 50, rides_count: 3 }
          }
        },
        {
          _id: ObjectId.createFromHexString('000000000000000000000003'),
          loyalty_status: {
            gold: { points_spent: 150, rides_count: 5 }
          }
        },
        {
          _id: ObjectId.createFromHexString('000000000000000000000004'),
          loyalty_status: {
            platinum: { points_spent: 250, rides_count: 15 }
          }
        }
      ]);
    });

    it('finds all fidelity status', async () => {
      const results = await fidelityModel.find().toArray();
      expect(results).to.deep.equal([
        {
          _id: ObjectId.createFromHexString('000000000000000000000001'),
          loyalty_status: {
            bronze: { points_spent: 10, rides_count: 1 }
          }
        },
        {
          _id: ObjectId.createFromHexString('000000000000000000000002'),
          loyalty_status: {
            silver: { points_spent: 50, rides_count: 3 }
          }
        },
        {
          _id: ObjectId.createFromHexString('000000000000000000000003'),
          loyalty_status: {
            gold: { points_spent: 150, rides_count: 5 }
          }
        },
        {
          _id: ObjectId.createFromHexString('000000000000000000000004'),
          loyalty_status: {
            platinum: { points_spent: 250, rides_count: 15 }
          }
        }
      ]);
    });

    it('finds all fidelity status matching a query', async () => {
      const results = await fidelityModel.find({
        loyalty_status: { bronze: { points_spent: 10, rides_count: 1 } }
      }).toArray();

      expect(results).to.deep.equal([
        {
          _id: ObjectId.createFromHexString('000000000000000000000001'),
          loyalty_status: { bronze: { points_spent: 10, rides_count: 1 } }
        }
      ]);
    });

    it('applies the projection', async () => {
      const results = await fidelityModel.find({}, { loyalty_status: 1 }).toArray();
      expect(results).to.deep.equal([
        {
          _id: ObjectId.createFromHexString('000000000000000000000001'),
          loyalty_status: { bronze: { points_spent: 10, rides_count: 1 } }
        },
        {
          _id: ObjectId.createFromHexString('000000000000000000000002'),
          loyalty_status: { silver: { points_spent: 50, rides_count: 3 } }
        },
        {
          _id: ObjectId.createFromHexString('000000000000000000000003'),
          loyalty_status: { gold: { points_spent: 150, rides_count: 5 } }
        },
        {
          _id: ObjectId.createFromHexString('000000000000000000000004'),
          loyalty_status: { platinum: { points_spent: 250, rides_count: 15 } }
        }
      ]);
    });
  });

  describe('#findOneById', () => {
    beforeEach(async () => {
      await fidelityModel.insertOne({
        _id: '000000000000000000000001',
        loyalty_status: {
          bronze: { points_spent: 0, rides_count: 0 },
          silver: { points_spent: 0, rides_count: 0 },
          gold: { points_spent: 20, rides_count: 1 },
          platinum: { points_spent: 150, rides_count: 5 }
        }
      });
    });

    it('finds a fifelity status by id', async () => {
      const results = await fidelityModel.findOneById(
        ObjectId.createFromHexString('000000000000000000000001'));

      expect(results).to.deep.equal({
        _id: ObjectId.createFromHexString('000000000000000000000001'),
        loyalty_status: {
          bronze: { points_spent: 0, rides_count: 0 },
          silver: { points_spent: 0, rides_count: 0 },
          gold: { points_spent: 20, rides_count: 1 },
          platinum: { points_spent: 150, rides_count: 5 }
        }
      });
    });

    it('applies the projections', async () => {
      const results = await fidelityModel.findOneById(
        ObjectId.createFromHexString('000000000000000000000001'),
        { loyalty_status: 1 });

      expect(results).to.deep.equal({
        _id: ObjectId.createFromHexString('000000000000000000000001'),
        loyalty_status: {
          bronze: { points_spent: 0, rides_count: 0 },
          silver: { points_spent: 0, rides_count: 0 },
          gold: { points_spent: 20, rides_count: 1 },
          platinum: { points_spent: 150, rides_count: 5 }
        }
      });
    });
  });
});
