// Worker ตัวเล็กๆ: ตอบว่ากำลังรันที่ datacenter ไหนของ Cloudflare
// หน้าเว็บ (public/index.html) ถูกเสิร์ฟจาก edge ตรงๆ ไม่ผ่านไฟล์นี้

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/api/hello") {
      // request.cf คือข้อมูลที่ Cloudflare ใส่ให้ว่า request นี้มาจากไหน
      const cf = request.cf ?? {};
      return json({
        message: "สวัสดีจาก Cloudflare edge",
        datacenter: cf.colo ?? "local-dev",
        country: cf.country ?? null,
        city: cf.city ?? null,
        time: new Date().toISOString(),
      });
    }

    return json({ error: "not found" }, 404);
  },
};
