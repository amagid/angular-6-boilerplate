import { FieldValidator } from '@datatypes';

export const LoginValidators: {
    username: FieldValidator[],
    password: FieldValidator[]
} = {
    username: [{
        regex: /.+/,
        message: 'Please enter a username'
    }],

    password: [{
        regex: /.+/,
        message: 'Please enter a password'
    }]
};