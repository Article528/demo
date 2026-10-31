# สาธิต: สร้างแอปบน Cloudflare ผ่าน GitHub (push แล้ว deploy อัตโนมัติ)

โปรเจกต์เล็กที่สุดที่ยังได้ของจริง: หน้าเว็บ + Worker ตัวเดียว (ไม่มีฐานข้อมูล)
ปุ่มบนหน้าเว็บเรียก `/api/hello` เพื่อบอกว่าตอบจาก datacenter ไหน

```
cf-github-demo/
├── wrangler.jsonc     # config: ชื่อ, entry, โฟลเดอร์หน้าเว็บ
├── src/index.js       # Worker: GET /api/hello
├── public/index.html  # หน้าเว็บ (มีบรรทัด "เวอร์ชัน 1" ไว้แก้ตอนสาธิต)
├── package.json
└── .gitignore
```

ถ้าอยากโชว์เป็น **หน้าเว็บล้วนๆ** ไม่มี Worker: ลบโฟลเดอร์ `src` ลบบรรทัด `"main"` และบล็อก `run_worker_first` ใน `wrangler.jsonc` และเอาปุ่มกับสคริปต์ใน `index.html` ออก

## ก่อนวันพรีเซนต์ (เตรียมครั้งเดียว)

### A. สร้าง repo บน GitHub
1. github.com/new ตั้งชื่อ `cf-github-demo` เลือก Public หรือ Private ก็ได้
   **ไม่ต้อง**ติ๊กเพิ่ม README / .gitignore / license (ให้ repo ว่าง)
2. ดันโค้ดขึ้นไป (ใน Terminal ที่โฟลเดอร์โปรเจกต์):
```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/<ชื่อ GitHub ของคุณ>/cf-github-demo.git
git push -u origin main
```
ถ้า push แล้วถูกถามรหัสผ่าน: GitHub ไม่รับรหัสผ่านบัญชีแล้ว ต้องใช้ Personal Access Token หรือล็อกอินด้วย GitHub CLI (`gh auth login`) ซ้อมให้ผ่านก่อนวันจริง

**ตรวจ:** เปิดหน้า repo บน GitHub ต้องเห็นไฟล์ครบ และไม่มีโฟลเดอร์ `node_modules`

### B. ซ้อมในเครื่อง (ไม่บังคับ)
```bash
npm install
npm run dev     # เปิด http://localhost:8787 กดปุ่มดู
```

## ระหว่างพรีเซนต์

### ขั้น 1: เชื่อม GitHub กับ Cloudflare (3 นาที)
1. แดชบอร์ด > **Compute** > **Workers & Pages** > **Create application**
2. กด **Continue with GitHub**
3. ครั้งแรกจะขึ้นหน้า authorize ของ Cloudflare บน GitHub: เลือก repo `cf-github-demo` (หรือ All repositories) แล้วกดยืนยัน
4. เลือก repository `cf-github-demo`

**พูด:** "ต่อจากนี้ไม่ต้องรันคำสั่ง deploy เองอีก แค่ push โค้ด Cloudflare จะ build และ deploy ให้"

### ขั้น 2: ตั้งค่า build (1 นาที)
- **Project name:** `cf-github-demo` (ต้องตรงกับ `name` ใน `wrangler.jsonc`)
- **Build command:** เว้นว่าง (โปรเจกต์นี้ไม่มีขั้น build)
- **Deploy command:** ค่าเริ่มต้น `npx wrangler deploy`
- กด **Save and Deploy** แล้วดู log ของการ build ให้ผู้ฟังเห็น

### ขั้น 3: ทดสอบ (1 นาที)
เปิด URL (`https://cf-github-demo.<subdomain>.workers.dev`) กดปุ่ม "ตอนนี้ตอบจากที่ไหน" จะเห็น datacenter (เช่น SIN) ประเทศ และเมือง

**พูด:** "โค้ดฝั่ง Worker รันที่ edge ใกล้ผู้ใช้ ตัวหน้าเว็บเองก็ถูกเสิร์ฟจาก edge เช่นกัน"

### ขั้น 4: โชว์ auto-deploy (2 นาที) *จุดเด่นของหัวข้อนี้*
1. เปิด `public/index.html` แก้บรรทัดท้ายสุดจาก `เวอร์ชัน 1` เป็น `เวอร์ชัน 2`
2. ใน Terminal:
```bash
git add .
git commit -m "update to version 2"
git push
```
3. กลับไปที่ Worker ในแดชบอร์ด ดูแท็บ **Builds** (หรือ Deployments) ให้เห็นการ build ใหม่รันเอง
4. รีเฟรชหน้าเว็บ จะเห็น "เวอร์ชัน 2" โดยไม่ได้สั่ง deploy เอง

**พูด:** "นี่คือ CI/CD แบบง่ายที่สุด เก็บโค้ดใน Git ทุกการแก้มีประวัติ และ push เมื่อไหร่ก็ขึ้นจริงเมื่อนั้น"

## ถ้ามีปัญหา

| อาการ | สาเหตุที่พบบ่อย | วิธีแก้ |
|---|---|---|
| build แจ้งชื่อไม่ตรง / สร้าง Worker อีกตัว | `name` ใน `wrangler.jsonc` ไม่ตรงกับ Project name | ทำให้ตรงกัน (ทั้งสองที่เป็น `cf-github-demo`) |
| ไม่เห็น repo ในรายการของ Cloudflare | GitHub app ยังไม่ได้รับสิทธิ์เข้า repo นั้น | GitHub > Settings > Applications > Cloudflare Workers & Pages > Configure > เพิ่ม repo |
| `git push` ถูกปฏิเสธ (authentication failed) | ใช้รหัสผ่านบัญชีแทน token | ใช้ Personal Access Token หรือ `gh auth login` |
| push แล้วหน้าเว็บไม่เปลี่ยน | build ยังไม่เสร็จ หรือเบราว์เซอร์ถือหน้าเก่า | ดูสถานะที่แท็บ Builds รอให้สำเร็จ แล้วรีเฟรชแบบล้างแคช (Safari: กด Shift ค้างแล้วคลิกรีโหลด) |
| เมนูในแดชบอร์ดไม่ตรงกับเช็กลิสต์ | Cloudflare ปรับ UI บ่อย | ดูตามความหมาย และซ้อมก่อนวันจริง |

## ซ้อมก่อนวันจริง
- ซ้อมทั้งชุดบน repo ทดลองอย่างน้อย 1 รอบ แล้วลบ Worker และ repo ที่ใช้ซ้อมทิ้งก่อนพรีเซนต์
- เตรียมแท็บสำรอง: URL ที่ deploy สำเร็จแล้วเปิดค้างไว้ เผื่อ build ช้าหรือเน็ตมีปัญหา
- การ build ครั้งแรกอาจใช้เวลาสักครู่ ควรเผื่อเวลาและมีเรื่องเล่าระหว่างรอ

## เกร็ดที่ควรเล่า
- ความแตกต่างจากการอัปโหลดไฟล์ในแดชบอร์ด: อัปโหลดเองต้องทำซ้ำทุกครั้งที่แก้ แต่ผูก GitHub แล้ว push ครั้งเดียวจบ
- ห้ามเก็บรหัสลับในโค้ดที่ push ขึ้น GitHub (ไฟล์ `.gitignore` กัน `.dev.vars` และ `.env` ไว้แล้ว)
