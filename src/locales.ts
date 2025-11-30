import { LocaleMessages, MessageKey, ValidationRule } from './types';

const en: LocaleMessages = {
    required: '%displayName% is required',
    invalid_type: '%displayName% must be of type %type%',
    invalid_format: '%displayName% format is invalid',
    string_min: '%displayName% must be at least %minLength% characters',
    string_max: '%displayName% must be at most %maxLength% characters',
    number_min: '%displayName% must be at least %min%',
    number_max: '%displayName% must be at most %max%',
    integer_only: '%displayName% must be an integer',
    invalid_email: '%displayName% must be a valid email address',
    invalid_url: '%displayName% must be a valid URL',
    password_weak: '%displayName% must contain at least one uppercase, lowercase letter, and number',
    date_invalid: '%displayName% is not a valid date',
    date_min: '%displayName% must not be before %minDate%',
    date_max: '%displayName% must not be after %maxDate%',
    array_invalid: '%displayName% must be an array',
    array_min: '%displayName% must contain at least %minLength% items',
    array_max: '%displayName% must contain at most %maxLength% items',
    array_item_invalid: '%displayName% items must be of type %arrayItemType%',
    object_invalid: '%displayName% must be an object',
    enum_invalid: '%displayName% must be one of: %enumValues%',
    custom_invalid: '%displayName% validation failed'
};

const th: LocaleMessages = {
    required: '%displayName% จำเป็นต้องกรอก',
    invalid_type: '%displayName% ต้องเป็นประเภท %type%',
    invalid_format: '%displayName% รูปแบบไม่ถูกต้อง',
    string_min: '%displayName% ต้องมีความยาวอย่างน้อย %minLength% ตัวอักษร',
    string_max: '%displayName% ต้องมีความยาวไม่เกิน %maxLength% ตัวอักษร',
    number_min: '%displayName% ต้องมีค่าอย่างน้อย %min%',
    number_max: '%displayName% ต้องมีค่าไม่เกิน %max%',
    integer_only: '%displayName% ต้องเป็นจำนวนเต็ม',
    invalid_email: '%displayName% รูปแบบอีเมลไม่ถูกต้อง',
    invalid_url: '%displayName% ต้องเป็น URL ที่ถูกต้อง',
    password_weak: '%displayName% ต้องมีตัวพิมพ์เล็ก, พิมพ์ใหญ่ และตัวเลข',
    date_invalid: '%displayName% วันที่ผิดพลาด',
    date_min: '%displayName% ต้องไม่ก่อนวันที่ %minDate%',
    date_max: '%displayName% ต้องไม่หลังวันที่ %maxDate%',
    array_invalid: '%displayName% ต้องเป็นอาร์เรย์',
    array_min: '%displayName% ต้องมีอย่างน้อย %minLength% รายการ',
    array_max: '%displayName% ต้องมีไม่เกิน %maxLength% รายการ',
    array_item_invalid: '%displayName% สมาชิกต้องเป็นประเภท %arrayItemType%',
    object_invalid: '%displayName% ต้องเป็นออบเจกต์',
    enum_invalid: '%displayName% ต้องเป็นหนึ่งใน: %enumValues%',
    custom_invalid: '%displayName% ไม่ผ่านเงื่อนไข'
};

const locales: Record<string, LocaleMessages> = { en, th };
let defaultLocale = 'en';

export const setLocale = (lang: string) => {
    if (locales[lang]) defaultLocale = lang;
};

export const registerLocale = (lang: string, messages: Partial<LocaleMessages>) => {
    locales[lang] = { ...en, ...messages };
};

export function getMessage(key: MessageKey, rule: ValidationRule, context: Record<string, any>, lang: string): string {
    let message = rule.customError;

    if (!message) {
        const selectedLocale = locales[lang] || locales['en'];
        message = selectedLocale[key] || locales['en'][key];
    }

    const allContext = { ...rule, ...context };

    if (Array.isArray(allContext.enumValues)) {
        allContext.enumValues = allContext.enumValues.join(', ') as any;
    }

    Object.keys(allContext).forEach(k => {
        const val = allContext[k as keyof typeof allContext];
        if (message && (['string', 'number', 'boolean'].includes(typeof val))) {
            message = message.replace(new RegExp(`%${k}%`, 'g'), String(val));
        }
    });

    return message || 'Validation Error';
}