import { ValidationRule, ValidationSchema, ValidationResult, ValidateOptions, InferSchema, SingleValidationResult } from './types';
import { getMessage } from './locales';

const validators = {
    string: (value: any, rules: ValidationRule, name: string, lang: string): SingleValidationResult => {
        const ctx = { displayName: name };
        let finalValue = value;

        if (typeof finalValue === 'string') {
            if (rules.trim) finalValue = finalValue.trim();
            if (rules.toLowerCase) finalValue = finalValue.toLowerCase();
            if (rules.toUpperCase) finalValue = finalValue.toUpperCase();
        }

        if (typeof finalValue !== 'string') return { valid: false, error: getMessage('invalid_type', rules, ctx, lang) };
        if (rules.minLength && finalValue.length < rules.minLength) return { valid: false, error: getMessage('string_min', rules, ctx, lang) };
        if (rules.maxLength && finalValue.length > rules.maxLength) return { valid: false, error: getMessage('string_max', rules, ctx, lang) };
        if (rules.pattern && !rules.pattern.test(finalValue)) return { valid: false, error: getMessage('invalid_format', rules, ctx, lang) };

        if (rules.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(finalValue)) return { valid: false, error: getMessage('invalid_email', rules, ctx, lang) };
        if (rules.type === 'url' && !/^(https?:\/\/)[^\s/$.?#].[^\s]*$/.test(finalValue)) return { valid: false, error: getMessage('invalid_url', rules, ctx, lang) };
        if (rules.type === 'password' && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(finalValue)) return { valid: false, error: getMessage('password_weak', rules, ctx, lang) };

        return { valid: true, validatedValue: finalValue };
    },

    number: (value: any, rules: ValidationRule, name: string, lang: string): SingleValidationResult => {
        const ctx = { displayName: name };
        if (typeof value !== 'number' || isNaN(value)) return { valid: false, error: getMessage('invalid_type', rules, ctx, lang) };
        if (rules.type === 'integer' && !Number.isInteger(value)) return { valid: false, error: getMessage('integer_only', rules, ctx, lang) };
        if (rules.min !== undefined && value < rules.min) return { valid: false, error: getMessage('number_min', rules, ctx, lang) };
        if (rules.max !== undefined && value > rules.max) return { valid: false, error: getMessage('number_max', rules, ctx, lang) };
        return { valid: true, validatedValue: value };
    },

    boolean: (value: any, rules: ValidationRule, name: string, lang: string): SingleValidationResult => {
        if (typeof value !== 'boolean') return { valid: false, error: getMessage('invalid_type', rules, { displayName: name }, lang) };
        return { valid: true, validatedValue: value };
    },

    datetime: (value: any, rules: ValidationRule, name: string, lang: string): SingleValidationResult => {
        try {
            const dateValue = value instanceof Date ? value : new Date(value as string);
            if (isNaN(dateValue.getTime())) return { valid: false, error: getMessage('date_invalid', rules, { displayName: name }, lang) };
            if (rules.minDate && dateValue < new Date(rules.minDate)) return { valid: false, error: getMessage('date_min', rules, { displayName: name }, lang) };
            if (rules.maxDate && dateValue > new Date(rules.maxDate)) return { valid: false, error: getMessage('date_max', rules, { displayName: name }, lang) };
            return { valid: true, validatedValue: dateValue };
        } catch { return { valid: false, error: getMessage('date_invalid', rules, { displayName: name }, lang) }; }
    },

    enum: (value: any, rules: ValidationRule, name: string, lang: string): SingleValidationResult => {
        if (!rules.enumValues?.includes(value)) return { valid: false, error: getMessage('enum_invalid', rules, { displayName: name }, lang) };
        return { valid: true, validatedValue: value };
    },

    array: (value: any, rules: ValidationRule, name: string, lang: string): SingleValidationResult => {
        if (!Array.isArray(value)) return { valid: false, error: getMessage('array_invalid', rules, { displayName: name }, lang) };
        if (rules.minLength && value.length < rules.minLength) return { valid: false, error: getMessage('array_min', rules, { displayName: name }, lang) };
        if (rules.maxLength && value.length > rules.maxLength) return { valid: false, error: getMessage('array_max', rules, { displayName: name }, lang) };

        if (rules.arrayItemType) {
            const valid = value.every(item => (rules.arrayItemType === 'integer' ? Number.isInteger(item) : typeof item === rules.arrayItemType));
            if (!valid) return { valid: false, error: getMessage('array_item_invalid', rules, { displayName: name }, lang) };
        }
        return { valid: true, validatedValue: value };
    },

    object: (value: any, rules: ValidationRule, name: string, lang: string): SingleValidationResult => {
        if (typeof value !== 'object' || value === null || Array.isArray(value)) return { valid: false, error: getMessage('object_invalid', rules, { displayName: name }, lang) };
        if (!rules.schema) return { valid: false, error: 'Schema missing' };

        const result = validateInput(value, rules.schema, { lang });

        if (!result.success) return { valid: false, error: Object.values(result.errors || {}).join('\n'), validatedValue: result.data };
        return { valid: true, validatedValue: result.data };
    },

    arrayOf: (value: any, rules: ValidationRule, name: string, lang: string): SingleValidationResult => {
        if (!Array.isArray(value)) return { valid: false, error: getMessage('array_invalid', rules, { displayName: name }, lang) };
        if (!rules.arraySchema) return { valid: false, error: 'Array Schema missing' };

        const validatedArray: any[] = [];
        const errors: string[] = [];

        value.forEach((item, idx) => {
            const res = validateInput(item, rules.arraySchema!, { lang });
            if (!res.success) errors.push(`${name}[${idx}]: ${res.errorMsg}`);
            else validatedArray.push(res.data);
        });

        if (errors.length) return { valid: false, error: errors.join('\n') };
        return { valid: true, validatedValue: validatedArray };
    }
};

// --- Main Core Functions ---

function validateValue(value: any, rules: ValidationRule, key: string, displayName: string, lang: string): SingleValidationResult {
    let finalValue = value;

    if ((finalValue === undefined || finalValue === null || finalValue === '') && rules.defaultValue !== undefined) {
        finalValue = rules.defaultValue;
    }

    if (rules.required && (finalValue === undefined || finalValue === null || finalValue === '')) {
        return { valid: false, error: getMessage('required', rules, { displayName }, lang) };
    }

    if (!rules.required && (finalValue === undefined || finalValue === null || finalValue === '')) {
        return { valid: true, validatedValue: undefined };
    }

    const { type } = rules;
    let result: SingleValidationResult;

    if (['string', 'email', 'password', 'url'].includes(type)) {
        result = validators.string(finalValue, rules, displayName, lang);
    } else if (['number', 'integer'].includes(type)) {
        result = validators.number(finalValue, rules, displayName, lang);
    } else {
        const validatorMap: Record<string, Function> = {
            boolean: validators.boolean, datetime: validators.datetime, enum: validators.enum,
            array: validators.array, object: validators.object, arrayOf: validators.arrayOf
        };
        result = validatorMap[type] ? validatorMap[type](finalValue, rules, displayName, lang) : { valid: false, error: `Type ${type} not supported` };
    }

    if (result.valid && rules.custom) {
        const customResult = rules.custom(result.validatedValue);
        if (customResult === false) return { valid: false, error: getMessage('custom_invalid', rules, { displayName }, lang) };
        if (typeof customResult === 'string') return { valid: false, error: customResult };
    }

    return result;
}

export function defineSchema<const T extends ValidationSchema>(schema: T) {
    return schema;
}

export function validateInput<S extends ValidationSchema>(
    input: any,
    schema: S,
    options: ValidateOptions = {}
): ValidationResult<InferSchema<S>> {

    const currentLang = options.lang || 'en'; // Default to 'en' locally if needed, but getMessage handles it too

    try {
        const errors: { [key: string]: string } = {};
        const validatedData: any = {};

        for (const [key, rules] of Object.entries(schema)) {
            const value = input[key];
            const displayName = rules.displayName || key;
            const result = validateValue(value, rules, key, displayName, currentLang);

            if (!result.valid) {
                errors[key] = result.error!;
            } else if (result.validatedValue !== undefined) {
                validatedData[key] = result.validatedValue;
            }
        }

        if (Object.keys(errors).length > 0) {
            return { success: false, errors, errorMsg: Object.values(errors).join('\n') };
        }

        return { success: true, data: validatedData };
    } catch (error: any) {
        return { success: false, errorMsg: `System Error: ${error.message}`, errors: { general: error.message } };
    }
}