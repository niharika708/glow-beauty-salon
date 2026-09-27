const SUPABASE_URL = "https://gyytffecbqwtgbkbnijd.supabase.co";
const SUPABASE_KEY = "sb_publishable_oxaP8tUrVZt14o3jeijvfQ_ZxSu8Fyq";

const form = document.querySelector("form");

form.addEventListener("submit", async function(event) {
    event.preventDefault();

    const name = form.querySelector('input[type="text"]').value;
    const email = form.querySelector('input[type="email"]').value;
    const phone = form.querySelector('input[type="tel"]').value;
    const service = document.querySelector("#service").value;
const preferred_date = document.querySelector("#preferred_date").value;

    const response = await fetch(`${SUPABASE_URL}/rest/v1/enquiries`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`,
            "Prefer": "return=minimal"
        },
        body: JSON.stringify({
    name: name,
    email: email,
    phone: phone,
    service: service,
    preferred_date: preferred_date
})
    });

    if (response.ok) {
        alert("Thank you! Your appointment request has been received.");
        form.reset();
    } else {
        alert("Something went wrong. Please try again.");
    }
});