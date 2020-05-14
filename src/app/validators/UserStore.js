import * as yup from 'yup';

export default async (req, res, next) => {
    try {
        const schema = yup.object().shape({
            name: yup.string().required(),
            email: yup.string().email().required(),
            password: yup.string().required().min(6),
        });

        await schema.validate(req.body, { abortEarly: false });

        return next();
    } catch (err) {
        return res
            .status(400)
            .json({ error: 'Validation fails', messages: err.inner });
    }
};
