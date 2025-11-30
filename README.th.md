# 🇺🇸 [Read in English (English Version)](./README.md)

---

# 🛡️ @riiixch/validate-input

![npm version](https://img.shields.io/badge/npm-v1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)

> **ไลบรารี Validation สำหรับ TypeScript ที่เบาและปลอดภัย** > ตรวจสอบข้อมูลง่ายๆ พร้อมระบบสร้าง Type อัตโนมัติ ไม่ต้องเขียน Interface ซ้ำซ้อน!

---

## 🌟 จุดเด่น (Features)

* 🚀 **Type Inference Magic:** สร้าง TypeScript Type จาก Schema ให้ทันที (ลดงานเขียนโค้ดซ้ำซ้อน)
* 🧹 **Auto Sanitization:** ตัดช่องว่าง (`trim`), แปลงตัวพิมพ์ (`toLowerCase`), หรือตั้งค่า Default ให้เอง
* 🌍 **Multi-language (i18n):** รองรับภาษาอังกฤษ (Default) และ **ภาษาไทย** 🇹🇭 ในตัว
* 🧩 **Custom Logic:** เขียนฟังก์ชันตรวจสอบเงื่อนไขซับซ้อนได้เอง
* 📦 **Lightweight:** ขนาดเล็ก เบา ไม่หนักโปรเจกต์

---

## 📦 การติดตั้ง (Installation)

```bash
npm install @riiixch/validate-input
````

-----

## 🚀 เริ่มต้นใช้งาน (Quick Start)

```typescript
import { defineSchema, validateInput } from '@riiixch/validate-input';

// 1. สร้าง Schema (ใช้ defineSchema เพื่อให้ได้ Type Inference)
const userSchema = defineSchema({
  username: { 
    type: 'string', 
    required: true, 
    minLength: 3, 
    trim: true // ตัดช่องว่างให้อัตโนมัติ
  },
  age: { 
    type: 'integer', 
    min: 18,
    defaultValue: 18 // ถ้าไม่ส่งมา จะใช้ค่า 18
  },
  email: {
    type: 'email',
    required: true
  }
});

// 2. ข้อมูล Input (เช่น จาก req.body)
const input = { 
  username: "  riiixch  ", 
  email: "test@example.com" 
};

// 3. ตรวจสอบข้อมูล
const result = validateInput(input, userSchema);

if (!result.success) {
  // ❌ กรณีไม่ผ่าน
  console.error(result.errorMsg); 
  // Output: "username is required" (หรือภาษาไทยตามที่ตั้งค่า)
} else {
  // ✅ กรณีผ่าน (TypeScript จะรู้ Type ของ data ทันที!)
  const { username, age, email } = result.data!;
  
  console.log(username); // "riiixch" (ถูก trim แล้ว)
  console.log(age);      // 18 (ค่า default)
}
```

-----

## 🇹🇭 การใช้งานภาษาไทย (Localization)

คุณสามารถเปลี่ยนภาษาของ Error Message ได้ง่ายๆ 2 วิธี:

### วิธีที่ 1: ตั้งค่า Global (แนะนำสำหรับทั้งโปรเจกต์)

ใส่โค้ดนี้ที่ไฟล์หลักของโปรเจกต์ (เช่น `app.ts` หรือ `index.ts`)

```typescript
import { setLocale } from '@riiixch/validate-input';

// เปลี่ยนเป็นภาษาไทย
setLocale('th'); 
```

### วิธีที่ 2: ตั้งค่าเฉพาะจุด (Per-request)

```typescript
validateInput(data, schema, { lang: 'th' });
```

-----

## 🛠️ คู่มือการกำหนด Schema (Schema Reference)

### 🔹 ประเภทข้อมูลที่รองรับ (Supported Types)

| Type | คำอธิบาย | Options พิเศษ |
| :--- | :--- | :--- |
| `string` | ข้อความ | `minLength`, `maxLength`, `pattern`, `trim`, `toLowerCase`, `toUpperCase` |
| `number` | ตัวเลข (ทศนิยมได้) | `min`, `max` |
| `integer` | จำนวนเต็มเท่านั้น | `min`, `max` |
| `boolean` | ค่า true/false | - |
| `email` | อีเมล | - |
| `password` | เช็คความปลอดภัยรหัสผ่าน | `minLength` |
| `url` | ลิงก์ URL | - |
| `datetime` | วันที่ (Date/String) | `minDate`, `maxDate` |
| `enum` | ค่าที่กำหนดไว้ | `enumValues: ['A', 'B']` |
| `array` | อาเรย์พื้นฐาน | `arrayItemType`, `minLength` |
| `object` | ออบเจกต์ซ้อน | `schema` |
| `arrayOf` | อาเรย์ของออบเจกต์ | `arraySchema` |

### 🔹 การเขียน Custom Validation (เขียนกฎเอง)

หากกฎพื้นฐานไม่เพียงพอ คุณสามารถเขียนฟังก์ชันเช็คเองได้

```typescript
const schema = defineSchema({
  coupon: {
    type: 'string',
    required: true,
    // รับค่า value เข้ามา -> return true ถ้าผ่าน, หรือ return ข้อความ Error
    custom: (val) => {
      if (!val.startsWith('PROMO_')) {
        return 'รหัสคูปองต้องขึ้นต้นด้วย PROMO_';
      }
      return true;
    }
  }
});
```

-----

## 📄 License

MIT © [RIIIXCH]