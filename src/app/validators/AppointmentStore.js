import * as yup from 'yup';

export default async (req, res, next) => {
    try {
        const schema = yup.object().shape({
            provider_id: yup.number().required(),
            date: yup.date().required(),
        });

        await schema.validate(req.body, { abortEarly: false });

        return next();
    } catch (err) {
        return res
            .status(400)
            .json({ error: 'Validation fails', messages: err.inner });
    }
};
