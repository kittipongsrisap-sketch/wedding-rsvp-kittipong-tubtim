// Paste the deployed Google Apps Script Web App URL here.
const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwsKM3D5QqFzv82lEp6QZdjeO68H6HlioFS8qSUBH9l2XC9ft46uJQfPoiJj-EGdwP4kw/exec";

const form = document.getElementById("rsvpForm");
const statusBox = document.getElementById("status");
const guestCountWrap = document.getElementById("guestCountWrap");
const guestCount = document.getElementById("guestCount");
const submitButton = form.querySelector('button[type="submit"]');

function selectedAttendance() {
  return form.querySelector('input[name="attending"]:checked')?.value || "เข้าร่วม";
}

function updateAttendanceFields() {
  const attending = selectedAttendance() === "เข้าร่วม";
  guestCountWrap.hidden = !attending;
  guestCount.required = attending;
  if (!attending) guestCount.value = "0";
  else if (guestCount.value === "0") guestCount.value = "1";
}

form.querySelectorAll('input[name="attending"]').forEach((radio) => {
  radio.addEventListener("change", updateAttendanceFields);
});
updateAttendanceFields();

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!GOOGLE_APPS_SCRIPT_URL || GOOGLE_APPS_SCRIPT_URL.includes("PASTE_GOOGLE_APPS_SCRIPT")) {
    statusBox.textContent = "ระบบตอบรับยังอยู่ระหว่างตั้งค่า กรุณาติดต่อผู้จัดงาน";
    statusBox.style.color = "#a33b32";
    return;
  }

  const data = new FormData(form);
  const payload = {
    timestamp: new Date().toISOString(),
    guest: String(data.get("guest") || "").trim(),
    phone: String(data.get("phone") || "").trim(),
    attending: selectedAttendance(),
    guestCount: selectedAttendance() === "เข้าร่วม" ? Number(data.get("guestCount") || 1) : 0,
    message: String(data.get("message") || "").trim()
  };

  if (!payload.guest || !payload.phone) {
    statusBox.textContent = "กรุณากรอกชื่อ-นามสกุลและเบอร์โทรศัพท์ให้ครบถ้วน";
    statusBox.style.color = "#a33b32";
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "กำลังส่งแบบตอบรับ...";
  statusBox.textContent = "กำลังบันทึกข้อมูล กรุณารอสักครู่";
  statusBox.style.color = "#61735e";

  try {
    // Apps Script Web Apps may not expose CORS headers to browsers.
    // no-cors sends the payload, but the browser cannot read the response.
    await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: JSON.stringify(payload)
    });

    statusBox.textContent = "ส่งแบบตอบรับแล้ว ขอบพระคุณที่แจ้งให้เราทราบ";
    statusBox.style.color = "#315b3e";
    form.reset();
    updateAttendanceFields();
  } catch (error) {
    console.error("RSVP submission failed:", error);
    statusBox.textContent = "ส่งข้อมูลไม่สำเร็จ กรุณาลองอีกครั้ง หรือติดต่อผู้จัดงาน";
    statusBox.style.color = "#a33b32";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "ส่งแบบตอบรับ";
  }
});
