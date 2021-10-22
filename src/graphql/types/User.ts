import md5 from 'md5';
import { objectType, inputObjectType } from 'nexus';

export const User = objectType({
  name: 'User',
  definition(t) {
    t.model.id();
    t.model.name();
    t.model.email();
    t.model.createdAt();
    t.string('token');
    t.nonNull.string('gravatar', {
      resolve(user) {
        const hash = md5(user.email.toLowerCase().trim());
        return `https://www.gravatar.com/avatar/${hash}`;
      },
    });
  },
});

export const CreateUser = inputObjectType({
  name: 'CreateUser',
  definition(t) {
    t.nonNull.string('email');
    t.nonNull.string('inputPassword');
  },
});

export const Login = inputObjectType({
  name: 'Login',
  definition(t) {
    t.nonNull.string('email');
    t.nonNull.string('inputPassword');
  },
});

export const UpdateUser = inputObjectType({
  name: 'UpdateUser',
  definition(t) {
    t.nonNull.string('email');
    t.nonNull.string('name');
  },
});

export const UpdateUserPassword = inputObjectType({
  name: 'UpdateUserPassword',
  definition(t) {
    t.nonNull.string('currentPassword');
    t.nonNull.string('newPassword');
    t.nonNull.string('newPasswordRepeated');
  },
});
