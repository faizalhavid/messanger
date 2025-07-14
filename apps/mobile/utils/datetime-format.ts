import moment from 'moment';

export class DateTimeFormatUtils {
    // 1. Converter ke format Date JavaScript
    // input: '2025-07-14 04:32:19.703'
    // output: Date object
    static convertDateTimeStringToFormatedDate(dateString: string): Date {
        const datetime = moment(dateString, 'YYYY-MM-DD HH:mm:ss.SSS');
        return datetime.toDate();
    }

    // 2. Converter ke format human-readable
    // input: '2025-07-14 04:32:19.703'
    // output: '14 July 2025, 04:32'
    static convertDateTimeToHuman(date: string | Date): string {
        return moment(date, 'YYYY-MM-DD HH:mm:ss.SSS').format('DD MMMM YYYY, HH:mm');
    };

    // 3. Converter ke format sistem 
    // input: '2025-07-14 04:32:19.703'
    // output: '2025-07-14 04:32'
    static convertDateTimeToSystem(date: Date): string {
        return moment(date).format('YYYY-MM-DD HH:mm');
    };
}