import { FieldValidator } from '@datatypes';

export const GeneralValidators: {
    notEmpty: FieldValidator[]
} = {
    notEmpty: [{
        regex: /.+/,
        message: 'Field cannot be blank'
    }]
};