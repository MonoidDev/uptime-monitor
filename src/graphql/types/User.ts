import { objectType, inputObjectType } from 'nexus';

export const User = objectType({
  name: 'User',
  definition(t) {
    t.model.id();
    t.model.name();
    t.model.email();
    t.model.createdAt();
    t.string('token');
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
