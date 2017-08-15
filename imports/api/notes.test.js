import { Meteor } from 'meteor/meteor';
import expect from 'expect';

import { Notes } from './notes';

if (Meteor.isServer) {
  describe('notes', function () {
    const noteOne = {
      _id: 'testNoteId1',
      title: 'My Title',
      body: 'My body for note',
      updatedAt: 0,
      userId: 'testUserId1'
    };

    beforeEach(function() {
      Notes.remove({});
      Notes.insert(noteOne);
    });

    it('should insert new note', function () {
      const userId = 'testId'
      const _id = Meteor.server.method_handlers['notes.insert'].apply({ userId: 'testId' });

      expect(Notes.findOne({ _id, userId })).toExist();
    });

    it('should not insert note if not authenticated', function() {
      expect(() => {
        Meteor.server.method_handlers['notes.insert']();
      }).toThrow();
    });

    it('should remove note', function() {
      Meteor.server.method_handlers['notes.remove'].apply({ userId: noteOne.userId }, [noteOne._id]);

      expect(Notes.findOne({ _id: noteOne._id })).toNotExist();
    });

    it('should not remove note if unauthenticated', function() {
      expect(() => {
        Meteor.server.method_handlers['notes.remove'].apply({}, [noteOne._id]);
      }).toThrow();
    });

    it('should not remove note if invalid _id', function() {
      expect(() => {
        Meteor.server.method_handlers['notes.remove'].apply({userId: noteOne.userId});
      }).toThrow();
    });

    it('should update note', function() {
      const title = 'This is an updated title';
      Meteor.server.method_handlers['notes.update'].apply({
        userId: noteOne.userId
      }, [
        noteOne._id,
        { title }
      ]);

      const note = Notes.findOne({ _id: noteOne._id });

      expect(note.updatedAt).toBeGreaterThan(0);
      expect(note).toInclude({
        title,
        body: noteOne.body
      });
    });


    it('should throw error if extra updates provided', function () {
      expect(() => {
        Meteor.server.method_handlers['notes.update'].apply({
          userId: noteOne.userId
        }, [
          noteOne._id,
          { title: 'new title', name: 'ALB' }
        ]);
      }).toThrow();
    });

    it('should not update note if user was not creator', function() {
      const title = 'This is an updated title';
      Meteor.server.method_handlers['notes.update'].apply({
        userId: 'testId'
      }, [
        noteOne._id,
        { title }
      ]);

      const note = Notes.findOne({ _id: noteOne._id });

      expect(note).toInclude(noteOne);
    });

    it('should not update note if unauthenticated', function() {
      expect(() => {
        Meteor.server.method_handlers['notes.update'].apply({}, [noteOne._id]);
      }).toThrow();
    });

    it('should not update note if invalid _id', function() {
      expect(() => {
        Meteor.server.method_handlers['notes.update'].apply({userId: noteOne.userId});
      }).toThrow();
    });
  });
}
