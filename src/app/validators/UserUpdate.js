import * as yup from 'yup';

export default async (req, res, next) => {
    try {
        const schema = yup.object().shape({
            name: yup.string(),
            email: yup.string().email(),
            oldPassword: yup.string().min(6),
            password: yup
                .string()
                .min(6)
                .when('oldPassword', (oldPassword, field) =>
                    oldPassword ? field.required() : field
                ),
            confirmPassword: yup
                .string()
                .when('password', (password, field) =>
                    password
                        ? field.required().oneOf([yup.ref('password')])
                        : field
                ),
        });

        await schema.validate(req.body, { abortEarly: false });

        return next();
    } catch (err) {
        return res
            .status(400)
            .json({ error: 'Validation fails', messages: err.inner });
    }
};
