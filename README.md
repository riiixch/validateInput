# 🇹🇭 [อ่านเอกสารภาษาไทย (Thai Version)](./README.th.md)

---

# 🛡️ @riiixch/validate-input

![npm version](https://img.shields.io/badge/npm-v1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)

> **Lightweight, Type-Safe Validation Library for TypeScript.** > Effortless data validation with automatic type inference. No redundant interfaces required!

---

## 🌟 Features

* 🚀 **Type Inference Magic:** Automatically generates TypeScript types from your schema.
* 🧹 **Auto Sanitization:** Built-in `trim`, `toLowerCase`, `defaultValue`, and more.
* 🌍 **Multi-language (i18n):** English (Default) and **Thai (TH)** support included.
* 🧩 **Custom Logic:** Easily extend validation logic with custom functions.
* 📦 **Lightweight:** Zero dependencies, small bundle size.

---

## 📦 Installation

```bash
npm install @riiixch/validate-input
````

-----

## 🚀 Quick Start

```typescript
import { defineSchema, validateInput } from '@riiixch/validate-input';

// 1. Define Schema (Use defineSchema for type inference)
const userSchema = defineSchema({
  username: { 
    type: 'string', 
    required: true, 
    minLength: 3, 
    trim: true // Auto-trim whitespace
  },
  age: { 
    type: 'integer', 
    min: 18,
    defaultValue: 18 // Default value if undefined
  },
  email: {
    type: 'email',
    required: true
  }
});

// 2. Input Data
const input = { 
  username: "  riiixch  ", 
  email: "test@example.com" 
};

// 3. Validate
const result = validateInput(input, userSchema);

if (!result.success) {
  // ❌ Validation Failed
  console.error(result.errorMsg); 
  // Output: "username is required"
} else {
  // ✅ Validation Success (Type is inferred automatically!)
  const { username, age, email } = result.data!;
  
  console.log(username); // "riiixch" (Trimmed)
  console.log(age);      // 18 (Default value)
}
```

-----

## 🇹🇭 Localization (i18n)

You can switch error messages to **Thai** easily.

### Method 1: Global Setting (Recommended)

Set this in your main entry file (e.g., `app.ts`).

```typescript
import { setLocale } from '@riiixch/validate-input';

setLocale('th'); // All error messages will be in Thai
```

### Method 2: Per-request Setting

```typescript
validateInput(data, schema, { lang: 'th' });
```

-----

## 🛠️ Schema Reference

### 🔹 Supported Types

| Type | Description | Special Options |
| :--- | :--- | :--- |
| `string` | Text | `minLength`, `maxLength`, `pattern`, `trim`, `toLowerCase`, `toUpperCase` |
| `number` | Number (Float) | `min`, `max` |
| `integer` | Integer | `min`, `max` |
| `boolean` | true/false | - |
| `email` | Email format | - |
| `password` | Strong password check | `minLength` |
| `url` | URL format | - |
| `datetime` | Date object/string | `minDate`, `maxDate` |
| `enum` | Pre-defined values | `enumValues: ['A', 'B']` |
| `array` | Simple array | `arrayItemType`, `minLength` |
| `object` | Nested object | `schema` |
| `arrayOf` | Array of objects | `arraySchema` |

### 🔹 Custom Validation

```typescript
const schema = defineSchema({
  coupon: {
    type: 'string',
    required: true,
    // Return true if valid, or return an error string
    custom: (val) => {
      if (!val.startsWith('PROMO_')) {
        return 'Coupon must start with PROMO_';
      }
      return true;
    }
  }
});
```

-----

## 📄 License

MIT © [RIIIXCH]