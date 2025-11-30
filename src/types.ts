export type MessageKey =
    | 'required' | 'invalid_type' | 'invalid_format'
    | 'string_min' | 'string_max' | 'number_min' | 'number_max' | 'integer_only'
    | 'invalid_email' | 'invalid_url' | 'password_weak'
    | 'date_invalid' | 'date_min' | 'date_max'
    | 'array_invalid' | 'array_min' | 'array_max' | 'array_item_invalid'
    | 'object_invalid' | 'enum_invalid' | 'custom_invalid';

export type LocaleMessages = Record<MessageKey, string>;

export type ValidationType =
    | 'string' | 'number' | 'email' | 'password' | 'url'
    | 'boolean' | 'datetime' | 'enum' | 'integer'
    | 'array' | 'object' | 'arrayOf';

export interface ValidationRule {
    type: ValidationType;
    required?: boolean;
    displayName?: string;
    customError?: string;
    defaultValue?: any;

    min?: number; max?: number;
    minLength?: number; maxLength?: number;
    pattern?: RegExp;

    minDate?: string | Date; maxDate?: string | Date;
    isValidDate?: boolean;

    enumValues?: readonly string[];
    schema?: ValidationSchema;
    arraySchema?: ValidationSchema;
    arrayItemType?: 'string' | 'number' | 'integer' | 'boolean';

    trim?: boolean;
    toLowerCase?: boolean;
    toUpperCase?: boolean;

    custom?: (value: any) => boolean | string;
}

export interface ValidationSchema {
    [key: string]: ValidationRule;
}

export interface ValidationResult<T> {
    success: boolean;
    data?: T;
    errors?: { [key: string]: string };
    errorMsg?: string;
}

export interface ValidateOptions {
    lang?: string;
}

export interface SingleValidationResult {
    valid: boolean;
    error?: string;
    validatedValue?: any;
}

// Type Inference Logic
type MapType<R extends ValidationRule> =
    R['type'] extends 'string' | 'email' | 'password' | 'url' | 'enum' ? string :
    R['type'] extends 'number' | 'integer' ? number :
    R['type'] extends 'boolean' ? boolean :
    R['type'] extends 'datetime' ? Date :
    R['type'] extends 'object' ? (R['schema'] extends ValidationSchema ? InferSchema<R['schema']> : object) :
    R['type'] extends 'array' ? (
        R['arrayItemType'] extends 'string' ? string[] :
        R['arrayItemType'] extends 'number' | 'integer' ? number[] :
        R['arrayItemType'] extends 'boolean' ? boolean[] :
        any[]
    ) :
    R['type'] extends 'arrayOf' ? (R['arraySchema'] extends ValidationSchema ? InferSchema<R['arraySchema']>[] : any[]) :
    any;

export type InferSchema<S extends ValidationSchema> = {
    [K in keyof S as S[K]['required'] extends true ? K : never]: MapType<S[K]>
} & {
    [K in keyof S as S[K]['required'] extends true ? never : K]?: MapType<S[K]>
} extends infer O ? { [K in keyof O]: O[K] } : never;