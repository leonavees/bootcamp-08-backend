import { startOfHour, parseISO, isBefore, format } from 'date-fns';
import pt from 'date-fns/locale/pt';

import User from '../models/User';
import Appointment from '../models/Appointments';
import Notification from '../schemas/Notification';

import Cache from '../../lib/Cache';

class CreateAppointmentService {
    async run({ provider_id, user_id, date }) {
        if (provider_id === user_id) {
            throw new Error(
                'A provider cannot make an appointment for himself'
            );
        }

        /**
         * Check if provider_id is a provider
         */
        const checkIsProvider = await User.findOne({
            where: { id: provider_id, provider: true },
        });

        if (!checkIsProvider) {
            throw new Error('You can only create appointments with providers');
        }

        /**
         * Check for past dates
         */
        const hourStart = await startOfHour(parseISO(date));

        if (isBefore(hourStart, new Date())) {
            throw new Error('Past dates are not permitted');
        }

        /**
         * Check date availability
         */
        const checkAvailability = await Appointment.findOne({
            where: {
                provider_id,
                canceled_at: null,
                date: hourStart,
            },
        });

        if (checkAvailability) {
            throw new Error('Appointment date is not available');
        }

        const appointment = await Appointment.create({
            user_id,
            provider_id,
            date,
        });

        /**
         * Notify provider
         */
        const { name } = await User.findByPk(user_id);
        const formatedDate = format(
            hourStart,
            "'dia' dd 'de' MMMM', às' H:mm'h'",
            { locale: pt }
        );
        await Notification.create({
            content: `Novo agendamento de ${name} para o ${formatedDate}`,
            user: provider_id,
        });

        /**
         * Invalidate cache
         */
        await Cache.invalidatePrefix(`user:${user_id}:appointments`);

        return appointment;
    }
}

export default new CreateAppointmentService();
